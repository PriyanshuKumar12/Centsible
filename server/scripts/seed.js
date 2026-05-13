// Seed a demo account with ~30 realistic transactions across the last 6 months.
// Idempotent: re-running wipes the demo user's old transactions and inserts fresh ones.
// Guarded against accidental production runs.
//
// Usage:
//   npm run seed              # from /server

require('dotenv').config()
const mongoose = require('mongoose')

const connectDB = require('../config/db')
const User = require('../models/User')
const Transaction = require('../models/Transaction')

const DEMO_EMAIL = 'demo@centsible.app'
const DEMO_PASSWORD = 'Demo@123'
const DEMO_NAME = 'Demo User'

// Each entry: { monthsAgo, day, type, amount, category, description }
// Dates are computed in UTC at midday (12:00) so timezone shifts don't bump them.
// 6 monthly salaries + 6 monthly bills + 18 varied expenses = 30 txns.
const TXN_TEMPLATE = [
  // --- Recurring monthly salary (6) ---
  { monthsAgo: 5, day: 1, type: 'income', amount: 50000, category: 'Salary', description: 'Monthly payroll' },
  { monthsAgo: 4, day: 1, type: 'income', amount: 50000, category: 'Salary', description: 'Monthly payroll' },
  { monthsAgo: 3, day: 1, type: 'income', amount: 50000, category: 'Salary', description: 'Monthly payroll' },
  { monthsAgo: 2, day: 1, type: 'income', amount: 52000, category: 'Salary', description: 'Monthly payroll (with raise)' },
  { monthsAgo: 1, day: 1, type: 'income', amount: 52000, category: 'Salary', description: 'Monthly payroll' },
  { monthsAgo: 0, day: 1, type: 'income', amount: 52000, category: 'Salary', description: 'Monthly payroll' },

  // --- Recurring bills (6) ---
  { monthsAgo: 5, day: 3, type: 'expense', amount: 15000, category: 'Bills', description: 'Rent' },
  { monthsAgo: 4, day: 3, type: 'expense', amount: 15000, category: 'Bills', description: 'Rent' },
  { monthsAgo: 3, day: 3, type: 'expense', amount: 15000, category: 'Bills', description: 'Rent' },
  { monthsAgo: 2, day: 3, type: 'expense', amount: 15000, category: 'Bills', description: 'Rent' },
  { monthsAgo: 1, day: 3, type: 'expense', amount: 15000, category: 'Bills', description: 'Rent' },
  { monthsAgo: 0, day: 3, type: 'expense', amount: 15000, category: 'Bills', description: 'Rent' },

  // --- Varied expenses across categories + months (18) ---
  { monthsAgo: 5, day: 8, type: 'expense', amount: 1200, category: 'Food', description: 'Groceries — weekly' },
  { monthsAgo: 5, day: 14, type: 'expense', amount: 600, category: 'Travel', description: 'Cab to airport' },
  { monthsAgo: 5, day: 22, type: 'expense', amount: 2500, category: 'Shopping', description: 'New running shoes' },

  { monthsAgo: 4, day: 6, type: 'expense', amount: 1100, category: 'Food', description: 'Groceries' },
  { monthsAgo: 4, day: 12, type: 'expense', amount: 800, category: 'Entertainment', description: 'Movie + dinner' },
  { monthsAgo: 4, day: 20, type: 'expense', amount: 3500, category: 'Health', description: 'Annual check-up' },

  { monthsAgo: 3, day: 5, type: 'expense', amount: 1300, category: 'Food', description: 'Groceries' },
  { monthsAgo: 3, day: 15, type: 'expense', amount: 4500, category: 'Travel', description: 'Weekend trip — train fare' },
  { monthsAgo: 3, day: 25, type: 'expense', amount: 1800, category: 'Education', description: 'Online course' },

  { monthsAgo: 2, day: 7, type: 'expense', amount: 1250, category: 'Food', description: 'Groceries' },
  { monthsAgo: 2, day: 11, type: 'expense', amount: 950, category: 'Entertainment', description: 'Concert tickets' },
  { monthsAgo: 2, day: 18, type: 'expense', amount: 1600, category: 'Shopping', description: 'Headphones' },

  { monthsAgo: 1, day: 4, type: 'expense', amount: 1400, category: 'Food', description: 'Groceries' },
  { monthsAgo: 1, day: 9, type: 'expense', amount: 700, category: 'Travel', description: 'Cab fares' },
  { monthsAgo: 1, day: 19, type: 'expense', amount: 2100, category: 'Health', description: 'Pharmacy + doctor visit' },

  { monthsAgo: 0, day: 5, type: 'expense', amount: 1350, category: 'Food', description: 'Groceries' },
  { monthsAgo: 0, day: 8, type: 'expense', amount: 1900, category: 'Entertainment', description: 'Weekend brunch' },
  { monthsAgo: 0, day: 11, type: 'expense', amount: 600, category: 'Other', description: 'Misc' },
]

function buildDate(monthsAgo, day) {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, day, 12, 0, 0))
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('[seed] refusing to run in production (NODE_ENV=production).')
    process.exit(1)
  }
  if (!process.env.MONGO_URI) {
    console.error('[seed] MONGO_URI is not set — check server/.env.')
    process.exit(1)
  }

  await connectDB()

  // Find-or-create the demo user. If they exist, leave the user record alone
  // (preserves the _id + any updated profile) but wipe their transactions.
  let user = await User.findOne({ email: DEMO_EMAIL })
  if (user) {
    console.log(`[seed] demo user exists (${user._id}); resetting their transactions`)
    const removed = await Transaction.deleteMany({ userId: user._id })
    console.log(`[seed] removed ${removed.deletedCount} prior transactions`)
  } else {
    user = await User.create({
      name: DEMO_NAME,
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD, // hashed by the User pre-save hook
    })
    console.log(`[seed] created demo user ${user._id}`)
  }

  const docs = TXN_TEMPLATE.map((t) => ({
    userId: user._id,
    type: t.type,
    amount: t.amount,
    category: t.category,
    description: t.description,
    date: buildDate(t.monthsAgo, t.day),
  }))
  const inserted = await Transaction.insertMany(docs)

  // Quick spot-summary so the operator can sanity-check numbers.
  const totalIncome = docs.filter((d) => d.type === 'income').reduce((s, d) => s + d.amount, 0)
  const totalExpense = docs.filter((d) => d.type === 'expense').reduce((s, d) => s + d.amount, 0)

  console.log('')
  console.log('================================================================')
  console.log('  Demo account ready')
  console.log('================================================================')
  console.log(`  Email:    ${DEMO_EMAIL}`)
  console.log(`  Password: ${DEMO_PASSWORD}`)
  console.log(`  Inserted: ${inserted.length} transactions`)
  console.log(`  Income:   ${totalIncome.toLocaleString('en-IN')} INR (across 6 months)`)
  console.log(`  Expense:  ${totalExpense.toLocaleString('en-IN')} INR (across 6 months)`)
  console.log(`  Net:      ${(totalIncome - totalExpense).toLocaleString('en-IN')} INR`)
  console.log('================================================================')

  await mongoose.disconnect()
}

main().catch(async (err) => {
  console.error('[seed] failed:', err)
  try { await mongoose.disconnect() } catch {}
  process.exit(1)
})
