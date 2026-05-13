// Single source of truth for transaction categories.
// Spec §4 (Features → Categories). Mongoose enum + Zod schema both consume this.
const CATEGORIES = [
  'Food',
  'Travel',
  'Bills',
  'Entertainment',
  'Shopping',
  'Health',
  'Education',
  'Salary',
  'Freelance',
  'Investment',
  'Other',
]

const TRANSACTION_TYPES = ['income', 'expense']

module.exports = { CATEGORIES, TRANSACTION_TYPES }
