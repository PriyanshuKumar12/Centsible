// Mirror of server/constants/categories.js — keep both files in sync when changing.
// Server enforces these via Mongoose enum + Zod, so a typo here just means the
// dropdown shows a value the API will reject with 400.
export const CATEGORIES = [
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

export const TRANSACTION_TYPES = ['income', 'expense']
