const { z } = require('zod')
const User = require('../models/User')
const Transaction = require('../models/Transaction')
const Budget = require('../models/Budget')

// ---- Zod schemas --------------------------------------------------------

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  email: z.string().trim().toLowerCase().email('Invalid email'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

const preferencesSchema = z
  .object({
    currency: z.enum(['INR', 'USD', 'EUR']).optional(),
    theme: z.enum(['light', 'dark']).optional(),
  })
  .refine((d) => d.currency || d.theme, {
    message: 'Nothing to update',
  })

const deleteSchema = z.object({
  password: z.string().min(1, 'Password is required to delete your account'),
})

function zodErr(parsed) {
  const err = new Error(parsed.error.issues[0].message)
  err.statusCode = 400
  return err
}

function notFound() {
  const err = new Error('User not found')
  err.statusCode = 404
  return err
}

// ---- Handlers -----------------------------------------------------------

exports.updateProfile = async (req, res, next) => {
  try {
    const parsed = profileSchema.safeParse(req.body)
    if (!parsed.success) return next(zodErr(parsed))
    const { name, email } = parsed.data

    // Email is unique — block if another account already owns it.
    const clash = await User.findOne({ email, _id: { $ne: req.userId } })
    if (clash) {
      const err = new Error('An account with that email already exists')
      err.statusCode = 409
      return next(err)
    }

    const user = await User.findById(req.userId)
    if (!user) return next(notFound())

    user.name = name
    user.email = email
    await user.save()

    res.json({ user })
  } catch (err) {
    next(err)
  }
}

exports.changePassword = async (req, res, next) => {
  try {
    const parsed = passwordSchema.safeParse(req.body)
    if (!parsed.success) return next(zodErr(parsed))
    const { currentPassword, newPassword } = parsed.data

    // `password` is `select: false`, so pull it explicitly.
    const user = await User.findById(req.userId).select('+password')
    if (!user) return next(notFound())

    if (!(await user.comparePassword(currentPassword))) {
      const err = new Error('Current password is incorrect')
      err.statusCode = 401
      return next(err)
    }

    // The pre-save hook hashes it because `password` is modified.
    user.password = newPassword
    await user.save()

    res.json({ message: 'Password updated' })
  } catch (err) {
    next(err)
  }
}

exports.updatePreferences = async (req, res, next) => {
  try {
    const parsed = preferencesSchema.safeParse(req.body)
    if (!parsed.success) return next(zodErr(parsed))

    const user = await User.findById(req.userId)
    if (!user) return next(notFound())

    if (parsed.data.currency) user.currency = parsed.data.currency
    if (parsed.data.theme) user.theme = parsed.data.theme
    await user.save()

    res.json({ user })
  } catch (err) {
    next(err)
  }
}

exports.deleteAccount = async (req, res, next) => {
  try {
    const parsed = deleteSchema.safeParse(req.body)
    if (!parsed.success) return next(zodErr(parsed))

    const user = await User.findById(req.userId).select('+password')
    if (!user) return next(notFound())

    if (!(await user.comparePassword(parsed.data.password))) {
      const err = new Error('Password is incorrect')
      err.statusCode = 401
      return next(err)
    }

    // Cascade: a user's transactions and budgets must not outlive them.
    await Promise.all([
      Transaction.deleteMany({ userId: req.userId }),
      Budget.deleteMany({ userId: req.userId }),
    ])
    await user.deleteOne()

    res.json({ message: 'Account deleted' })
  } catch (err) {
    next(err)
  }
}
