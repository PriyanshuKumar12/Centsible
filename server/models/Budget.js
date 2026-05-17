const mongoose = require('mongoose')
const { CATEGORIES } = require('../constants/categories')

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, 'Category is required'],
    },
    monthlyLimit: {
      type: Number,
      required: [true, 'Monthly limit is required'],
      min: [0, 'Monthly limit must be non-negative'],
    },
    month: {
      type: Number,
      required: true,
      min: [1, 'Month must be 1-12'],
      max: [12, 'Month must be 1-12'],
    },
    year: {
      type: Number,
      required: true,
    },
    // True once the 80%-threshold alert email has been sent for this
    // budget's month — prevents re-sending on every later expense.
    alertSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

// One budget per category per month per user. The unique index also doubles
// as the lookup index for "this user's budgets for month X".
budgetSchema.index({ userId: 1, year: 1, month: 1, category: 1 }, { unique: true })

budgetSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.__v
  return obj
}

module.exports = mongoose.model('Budget', budgetSchema)
