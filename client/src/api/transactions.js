import api from './axios'

export async function listTransactions(params = {}) {
  // Drop empty values so we don't send `?type=` etc.
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  )
  const { data } = await api.get('/transactions', { params: cleaned })
  return data // { items, total, page, limit }
}

export async function getTransaction(id) {
  const { data } = await api.get(`/transactions/${id}`)
  return data.transaction
}

export async function createTransaction(payload) {
  const { data } = await api.post('/transactions', payload)
  return data.transaction
}

export async function updateTransaction(id, payload) {
  const { data } = await api.put(`/transactions/${id}`, payload)
  return data.transaction
}

export async function deleteTransaction(id) {
  const { data } = await api.delete(`/transactions/${id}`)
  return data
}
