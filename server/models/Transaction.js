const mongoose = require('mongoose')
const { CATEGORIES, TRANSACTION_TYPES } = require('../constants/categories')

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: TRANSACTION_TYPES,
      required: [true, 'Type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be non-negative'],
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
)

// Most queries are "this user's transactions, newest first" — back it with an index.
transactionSchema.index({ userId: 1, date: -1 })

transactionSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.__v
  return obj
}

module.exports = mongoose.model('Transaction', transactionSchema)
