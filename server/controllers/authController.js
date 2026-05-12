const { z } = require('zod')
const User = require('../models/User')
const generateToken = require('../utils/generateToken')

const signupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

function zodErr(parsed) {
  const err = new Error(parsed.error.issues[0].message)
  err.statusCode = 400
  return err
}

exports.signup = async (req, res, next) => {
  try {
    const parsed = signupSchema.safeParse(req.body)
    if (!parsed.success) return next(zodErr(parsed))
    const { name, email, password } = parsed.data

    const exists = await User.findOne({ email })
    if (exists) {
      const err = new Error('An account with that email already exists')
      err.statusCode = 409
      return next(err)
    }

    const user = await User.create({ name, email, password })
    const token = generateToken(user._id)
    res.status(201).json({ user, token })
  } catch (err) {
    next(err)
  }
}

exports.login = async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) return next(zodErr(parsed))
    const { email, password } = parsed.data

    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      const err = new Error('Invalid email or password')
      err.statusCode = 401
      return next(err)
    }

    const token = generateToken(user._id)
    res.json({ user, token })
  } catch (err) {
    next(err)
  }
}

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      const err = new Error('User not found')
      err.statusCode = 404
      return next(err)
    }
    res.json({ user })
  } catch (err) {
    next(err)
  }
}

exports.logout = (req, res) => {
  // JWTs are stateless — the client drops the token. This endpoint exists
  // for symmetry and in case we add a refresh-token/blocklist later.
  res.json({ message: 'Logged out' })
}
