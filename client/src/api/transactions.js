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

// Downloads the filtered set as a CSV file. Pagination/sort params are
// ignored by the server — export is always the full filtered result.
export async function exportTransactionsCsv(params = {}) {
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  )
  const res = await api.get('/transactions/export', {
    params: cleaned,
    responseType: 'blob',
  })

  const cd = res.headers['content-disposition'] || ''
  const match = /filename="?([^"]+)"?/.exec(cd)
  const filename = match ? match[1] : 'centsible-transactions.csv'

  const url = window.URL.createObjectURL(
    new Blob([res.data], { type: 'text/csv' })
  )
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}
