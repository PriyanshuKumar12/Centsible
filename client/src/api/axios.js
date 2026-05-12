import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: false,
})

// Attach JWT (when present) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('centsible_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Boot the user out on 401.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('centsible_token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
