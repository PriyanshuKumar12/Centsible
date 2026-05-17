const Budget = require('../models/Budget')
const User = require('../models/User')
const { getSpentMap } = require('./budget')
const { sendBudgetAlertEmail } = require('./sendEmail')

const THRESHOLD = 0.8 // alert once spending crosses 80% of the limit

// Called fire-and-forget after an expense is created/updated. Never throws —
// any failure here must not affect the transaction request. The atomic
// `alertSent: false` guard guarantees at most one email per budget per month
// even under concurrent writes.
async function checkBudgetAlert({ userId, category, date }) {
  try {
    const d = new Date(date)
    const year = d.getUTCFullYear()
    const month = d.getUTCMonth() + 1

    const budget = await Budget.findOne({ userId, category, month, year })
    if (!budget || budget.alertSent || budget.monthlyLimit <= 0) return

    const spentMap = await getSpentMap(userId, year, month)
    const spent = spentMap[category] || 0
    if (spent < THRESHOLD * budget.monthlyLimit) return

    // Claim the alert atomically — whoever flips the flag first sends it.
    const claimed = await Budget.findOneAndUpdate(
      { _id: budget._id, alertSent: false },
      { alertSent: true },
      { new: true }
    )
    if (!claimed) return

    const user = await User.findById(userId).select('name email currency')
    if (!user) return

    await sendBudgetAlertEmail({
      to: user.email,
      name: user.name,
      category,
      spent,
      limit: budget.monthlyLimit,
      currency: user.currency || 'INR',
      month,
      year,
    })
  } catch (err) {
    console.error('[centsible] checkBudgetAlert failed:', err.message)
  }
}

module.exports = { checkBudgetAlert }
