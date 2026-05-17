const mongoose = require('mongoose')
const Transaction = require('../models/Transaction')

// UTC month boundaries [start, end). UTC to match analyticsController and the
// fact that Mongo stores dates in UTC. `month` is 1-12.
function monthRangeUTC(year, month) {
  const start = new Date(Date.UTC(year, month - 1, 1))
  const end = new Date(Date.UTC(year, month, 1))
  return { start, end }
}

function currentMonthYear() {
  const now = new Date()
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 }
}

// { category: totalExpense } for one user within a given month. Categories
// with no spend are simply absent (callers default to 0).
async function getSpentMap(userId, year, month) {
  const { start, end } = monthRangeUTC(year, month)
  const rows = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'expense',
        date: { $gte: start, $lt: end },
      },
    },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
  ])
  const map = {}
  for (const r of rows) map[r._id] = r.total
  return map
}

module.exports = { monthRangeUTC, currentMonthYear, getSpentMap }
