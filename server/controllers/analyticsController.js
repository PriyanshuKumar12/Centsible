const mongoose = require('mongoose')
const Transaction = require('../models/Transaction')

// Aggregation pipelines need ObjectId, not the string from JWT.
function uid(req) {
  return new mongoose.Types.ObjectId(req.userId)
}

// Start of the current UTC month (UTC because Mongo stores dates in UTC).
// Caveat: a user in IST creating a transaction at 00:30 IST on the 1st will
// have a UTC date in the previous month. Acceptable for v1; revisit if needed.
function currentMonthRange() {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
  return { start, next }
}

function monthsAgoStart(monthsBack) {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsBack, 1))
}

// Helper to extract `{ income, expense }` from a `[{_id:'income',total:X}, …]` shape.
function asTypeMap(rows) {
  const out = { income: 0, expense: 0 }
  for (const r of rows) out[r._id] = r.total
  return out
}

exports.summary = async (req, res, next) => {
  try {
    const { start, next: end } = currentMonthRange()
    const [facet] = await Transaction.aggregate([
      { $match: { userId: uid(req) } },
      {
        $facet: {
          allTime: [{ $group: { _id: '$type', total: { $sum: '$amount' } } }],
          thisMonth: [
            { $match: { date: { $gte: start, $lt: end } } },
            { $group: { _id: '$type', total: { $sum: '$amount' } } },
          ],
        },
      },
    ])

    const all = asTypeMap(facet.allTime)
    const month = asTypeMap(facet.thisMonth)

    res.json({
      balance: all.income - all.expense,
      monthIncome: month.income,
      monthExpenses: month.expense,
      monthSavings: month.income - month.expense,
    })
  } catch (err) {
    next(err)
  }
}

exports.monthly = async (req, res, next) => {
  try {
    // Last 6 months, including the current one.
    const start = monthsAgoStart(5)
    const rows = await Transaction.aggregate([
      { $match: { userId: uid(req), date: { $gte: start } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
    ])

    // Build the 6 buckets up-front so months with zero activity still show as a bar.
    const buckets = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
      buckets[key] = { month: key, income: 0, expense: 0 }
    }
    for (const r of rows) {
      const key = `${r._id.year}-${String(r._id.month).padStart(2, '0')}`
      if (buckets[key]) buckets[key][r._id.type] = r.total
    }

    res.json({ items: Object.values(buckets) })
  } catch (err) {
    next(err)
  }
}

exports.byCategory = async (req, res, next) => {
  try {
    const { start, next: end } = currentMonthRange()
    const items = await Transaction.aggregate([
      {
        $match: {
          userId: uid(req),
          type: 'expense',
          date: { $gte: start, $lt: end },
        },
      },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $project: { _id: 0, category: '$_id', total: 1 } },
    ])

    res.json({ items })
  } catch (err) {
    next(err)
  }
}
