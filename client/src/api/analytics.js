import api from './axios'

export async function getSummary() {
  const { data } = await api.get('/analytics/summary')
  return data // { balance, monthIncome, monthExpenses, monthSavings }
}

export async function getMonthly() {
  const { data } = await api.get('/analytics/monthly')
  return data.items // [{ month: 'YYYY-MM', income, expense }, …]
}

export async function getByCategory() {
  const { data } = await api.get('/analytics/by-category')
  return data.items // [{ category, total }, …]
}
