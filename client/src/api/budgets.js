import api from './axios'

export async function listBudgets(params = {}) {
  // Drop empty values so we don't send `?month=` etc.
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  )
  const { data } = await api.get('/budgets', { params: cleaned })
  return data // { month, year, items: [{ ...budget, spent }] }
}

export async function createBudget(payload) {
  const { data } = await api.post('/budgets', payload)
  return data.budget
}

export async function updateBudget(id, payload) {
  const { data } = await api.put(`/budgets/${id}`, payload)
  return data.budget
}

export async function deleteBudget(id) {
  const { data } = await api.delete(`/budgets/${id}`)
  return data
}
