// Resend wrapper for budget-alert emails.
//
// SAFE NO-OP: when RESEND_API_KEY is unset (local dev, seed, CI), this logs
// what it *would* have sent and returns instead of throwing — nothing in the
// app should break just because email isn't configured. The moment a real key
// is added to .env, the same code path sends for real.
//
// Resend free tier note: without a verified custom domain you can only send
// FROM onboarding@resend.dev and only TO your own Resend account email.

const CURRENCY_LOCALE = { INR: 'en-IN', USD: 'en-US', EUR: 'de-DE' }

function money(amount, currency = 'INR') {
  const locale = CURRENCY_LOCALE[currency] || 'en-IN'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

function buildAlert({ name, category, spent, limit, currency, month, year }) {
  const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0
  const over = spent > limit
  const period = new Date(Date.UTC(year, month - 1, 1)).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
  const subject = over
    ? `⚠️ You've exceeded your ${category} budget`
    : `Heads up: ${pct}% of your ${category} budget used`

  const text = [
    `Hi ${name || 'there'},`,
    '',
    `You've spent ${money(spent, currency)} of your ${money(limit, currency)} ${category} budget for ${period} (${pct}%).`,
    over
      ? `That's ${money(spent - limit, currency)} over budget.`
      : `You have ${money(limit - spent, currency)} left.`,
    '',
    '— Centsible',
  ].join('\n')

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#10B981;margin:0 0 16px">Centsible budget alert</h2>
      <p>Hi ${name || 'there'},</p>
      <p>You've spent <strong>${money(spent, currency)}</strong> of your
      <strong>${money(limit, currency)}</strong> <strong>${category}</strong>
      budget for ${period} (<strong>${pct}%</strong>).</p>
      <p style="color:${over ? '#EF4444' : '#F59E0B'}">
        ${
          over
            ? `That's ${money(spent - limit, currency)} over budget.`
            : `You have ${money(limit - spent, currency)} left.`
        }
      </p>
      <p style="color:#94A3B8;font-size:12px;margin-top:24px">
        You're getting this because spending crossed 80% of a budget you set in Centsible.
      </p>
    </div>`

  return { subject, text, html }
}

async function sendBudgetAlertEmail(opts) {
  const { to } = opts
  const { subject, text, html } = buildAlert(opts)

  if (!process.env.RESEND_API_KEY) {
    console.log(
      `[centsible] (email disabled — no RESEND_API_KEY) would send to ${to}: "${subject}"`
    )
    return { skipped: true }
  }

  try {
    // Lazy require so a missing package never crashes boot when email is off.
    const { Resend } = require('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const from = process.env.EMAIL_FROM || 'Centsible <onboarding@resend.dev>'
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      text,
      html,
    })
    if (error) {
      console.error('[centsible] Resend error:', error)
      return { error }
    }
    return { id: data?.id }
  } catch (err) {
    // Never let an email failure bubble into the request flow.
    console.error('[centsible] sendBudgetAlertEmail failed:', err.message)
    return { error: err }
  }
}

module.exports = { sendBudgetAlertEmail }
