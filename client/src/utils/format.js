import { format, parseISO } from 'date-fns'

const CURRENCY_LOCALE = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
}

export function formatCurrency(amount, currency = 'INR') {
  const locale = CURRENCY_LOCALE[currency] || 'en-IN'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount ?? 0)
}

export function formatDate(value, pattern = 'MMM d, yyyy') {
  if (!value) return ''
  const date = typeof value === 'string' ? parseISO(value) : value
  return format(date, pattern)
}

// `<input type="date">` wants `YYYY-MM-DD` in local time.
export function toDateInputValue(value) {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
