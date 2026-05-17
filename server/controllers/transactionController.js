const mongoose = require('mongoose')
const { z } = require('zod')
const Transaction = require('../models/Transaction')
const { CATEGORIES, TRANSACTION_TYPES } = require('../constants/categories')
const { checkBudgetAlert } = require('../utils/budgetAlert')

// ---- Zod schemas --------------------------------------------------------

const createSchema = z.object({
  type: z.enum(TRANSACTION_TYPES),
  amount: z.number().nonnegative('Amount must be non-negative'),
  category: z.enum(CATEGORIES),
  description: z.string().trim().max(200).optional().default(''),
  date: z.coerce.date().optional(),
})

// All fields optional for PATCH-style update; require at least one key.
const updateSchema = z
  .object({
    type: z.enum(TRANSACTION_TYPES).optional(),
    amount: z.number().nonnegative().optional(),
    category: z.enum(CATEGORIES).optional(),
    description: z.string().trim().max(200).optional(),
    date: z.coerce.date().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: 'No fields to update' })

const listQuerySchema = z.object({
  type: z.enum(TRANSACTION_TYPES).optional(),
  category: z.enum(CATEGORIES).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  search: z.string().trim().min(1).max(100).optional(),
  sort: z.enum(['date', '-date', 'amount', '-amount']).optional().default('-date'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
})

// Same filters as `list`, minus pagination/sort — CSV export is the full
// filtered set, oldest first (statement order).
const exportQuerySchema = z.object({
  type: z.enum(TRANSACTION_TYPES).optional(),
  category: z.enum(CATEGORIES).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  search: z.string().trim().min(1).max(100).optional(),
})

function zodErr(parsed) {
  const err = new Error(parsed.error.issues[0].message)
  err.statusCode = 400
  return err
}

// RFC-4180 cell: quote if it contains comma/quote/newline; double inner quotes.
function csvCell(value) {
  const s = value == null ? '' : String(value)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

// Escape user-supplied search input before feeding it into a RegExp.
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ---- Handlers -----------------------------------------------------------

exports.list = async (req, res, next) => {
  try {
    const parsed = listQuerySchema.safeParse(req.query)
    if (!parsed.success) return next(zodErr(parsed))
    const { type, category, from, to, search, sort, page, limit } = parsed.data

    const query = { userId: req.userId }
    if (type) query.type = type
    if (category) query.category = category
    if (from || to) {
      query.date = {}
      if (from) query.date.$gte = from
      if (to) query.date.$lte = to
    }
    if (search) query.description = { $regex: escapeRegex(search), $options: 'i' }

    const skip = (page - 1) * limit
    const [items, total] = await Promise.all([
      Transaction.find(query).sort(sort).skip(skip).limit(limit),
      Transaction.countDocuments(query),
    ])

    res.json({ items, total, page, limit })
  } catch (err) {
    next(err)
  }
}

exports.exportCsv = async (req, res, next) => {
  try {
    const parsed = exportQuerySchema.safeParse(req.query)
    if (!parsed.success) return next(zodErr(parsed))
    const { type, category, from, to, search } = parsed.data

    const query = { userId: req.userId }
    if (type) query.type = type
    if (category) query.category = category
    if (from || to) {
      query.date = {}
      if (from) query.date.$gte = from
      if (to) query.date.$lte = to
    }
    if (search) query.description = { $regex: escapeRegex(search), $options: 'i' }

    // Personal-scale data; a hard cap keeps a pathological account bounded.
    const items = await Transaction.find(query)
      .sort({ date: 1 })
      .limit(10000)
      .lean()

    const header = ['Date', 'Type', 'Category', 'Description', 'Amount']
    const rows = items.map((t) =>
      [
        new Date(t.date).toISOString().slice(0, 10),
        t.type,
        t.category,
        t.description || '',
        t.amount,
      ]
        .map(csvCell)
        .join(',')
    )
    const csv = [header.join(','), ...rows].join('\r\n')

    const stamp = new Date().toISOString().slice(0, 10)
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="centsible-transactions-${stamp}.csv"`
    )
    res.send(csv)
  } catch (err) {
    next(err)
  }
}

exports.getOne = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      const err = new Error('Transaction not found')
      err.statusCode = 404
      return next(err)
    }
    const txn = await Transaction.findOne({ _id: req.params.id, userId: req.userId })
    if (!txn) {
      const err = new Error('Transaction not found')
      err.statusCode = 404
      return next(err)
    }
    res.json({ transaction: txn })
  } catch (err) {
    next(err)
  }
}

exports.create = async (req, res, next) => {
  try {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) return next(zodErr(parsed))

    const txn = await Transaction.create({ ...parsed.data, userId: req.userId })
    res.status(201).json({ transaction: txn })

    // Fire-and-forget: a budget alert must never delay or fail the write.
    if (txn.type === 'expense') {
      checkBudgetAlert({
        userId: req.userId,
        category: txn.category,
        date: txn.date,
      }).catch(() => {})
    }
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      const err = new Error('Transaction not found')
      err.statusCode = 404
      return next(err)
    }
    const parsed = updateSchema.safeParse(req.body)
    if (!parsed.success) return next(zodErr(parsed))

    const txn = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      parsed.data,
      { new: true, runValidators: true }
    )
    if (!txn) {
      const err = new Error('Transaction not found')
      err.statusCode = 404
      return next(err)
    }
    res.json({ transaction: txn })

    // An edit can push a category over its budget (type→expense, bigger amount,
    // recategorized) — re-check, fire-and-forget.
    if (txn.type === 'expense') {
      checkBudgetAlert({
        userId: req.userId,
        category: txn.category,
        date: txn.date,
      }).catch(() => {})
    }
  } catch (err) {
    next(err)
  }
}

exports.remove = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      const err = new Error('Transaction not found')
      err.statusCode = 404
      return next(err)
    }
    const result = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    })
    if (!result) {
      const err = new Error('Transaction not found')
      err.statusCode = 404
      return next(err)
    }
    res.json({ message: 'Transaction deleted' })
  } catch (err) {
    next(err)
  }
}
