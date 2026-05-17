const mongoose = require('mongoose')
const { z } = require('zod')
const Budget = require('../models/Budget')
const { CATEGORIES } = require('../constants/categories')
const { currentMonthYear, getSpentMap } = require('../utils/budget')

// ---- Zod schemas --------------------------------------------------------

const monthField = z.coerce.number().int().min(1).max(12)
const yearField = z.coerce.number().int().min(2000).max(2100)

const createSchema = z.object({
  category: z.enum(CATEGORIES),
  monthlyLimit: z.number().positive('Monthly limit must be greater than 0'),
  month: monthField.optional(),
  year: yearField.optional(),
})

// PATCH-style: all optional, require at least one key.
const updateSchema = z
  .object({
    category: z.enum(CATEGORIES).optional(),
    monthlyLimit: z.number().positive().optional(),
    month: monthField.optional(),
    year: yearField.optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: 'No fields to update' })

const listQuerySchema = z.object({
  month: monthField.optional(),
  year: yearField.optional(),
})

function zodErr(parsed) {
  const err = new Error(parsed.error.issues[0].message)
  err.statusCode = 400
  return err
}

// A duplicate (userId, year, month, category) trips the unique index.
function isDuplicate(err) {
  return err && err.code === 11000
}

function conflict() {
  const err = new Error('A budget for this category already exists this month')
  err.statusCode = 409
  return err
}

function notFound() {
  const err = new Error('Budget not found')
  err.statusCode = 404
  return err
}

// ---- Handlers -----------------------------------------------------------

exports.list = async (req, res, next) => {
  try {
    const parsed = listQuerySchema.safeParse(req.query)
    if (!parsed.success) return next(zodErr(parsed))

    const fallback = currentMonthYear()
    const month = parsed.data.month ?? fallback.month
    const year = parsed.data.year ?? fallback.year

    const [budgets, spentMap] = await Promise.all([
      Budget.find({ userId: req.userId, month, year }).sort({ category: 1 }),
      getSpentMap(req.userId, year, month),
    ])

    const items = budgets.map((b) => ({
      ...b.toJSON(),
      spent: spentMap[b.category] || 0,
    }))

    res.json({ month, year, items })
  } catch (err) {
    next(err)
  }
}

exports.create = async (req, res, next) => {
  try {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) return next(zodErr(parsed))

    const fallback = currentMonthYear()
    const budget = await Budget.create({
      userId: req.userId,
      category: parsed.data.category,
      monthlyLimit: parsed.data.monthlyLimit,
      month: parsed.data.month ?? fallback.month,
      year: parsed.data.year ?? fallback.year,
    })

    const spentMap = await getSpentMap(req.userId, budget.year, budget.month)
    res
      .status(201)
      .json({ budget: { ...budget.toJSON(), spent: spentMap[budget.category] || 0 } })
  } catch (err) {
    if (isDuplicate(err)) return next(conflict())
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return next(notFound())

    const parsed = updateSchema.safeParse(req.body)
    if (!parsed.success) return next(zodErr(parsed))

    // Raising/lowering the limit invalidates a previously-sent alert — let a
    // fresh alert fire if the new limit is still breached.
    const patch = { ...parsed.data }
    if (patch.monthlyLimit !== undefined) patch.alertSent = false

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      patch,
      { new: true, runValidators: true }
    )
    if (!budget) return next(notFound())

    const spentMap = await getSpentMap(req.userId, budget.year, budget.month)
    res.json({ budget: { ...budget.toJSON(), spent: spentMap[budget.category] || 0 } })
  } catch (err) {
    if (isDuplicate(err)) return next(conflict())
    next(err)
  }
}

exports.remove = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return next(notFound())

    const result = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    })
    if (!result) return next(notFound())

    res.json({ message: 'Budget deleted' })
  } catch (err) {
    next(err)
  }
}
