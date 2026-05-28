import axios from 'axios'
import { getActivePinia } from 'pinia'
import { useAuthStore } from '../stores/auth'

const CUSTOMER_TOKEN_KEY = 'foodyhub_customer_token'
const ADMIN_TOKEN_KEY = 'foodyhub_admin_token'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000
})

function getAuthStore() {
  if (!getActivePinia()) return null
  return useAuthStore()
}

function resolveToken(config) {
  const url = config.url || ''
  if (url.startsWith('/admin')) {
    return localStorage.getItem(ADMIN_TOKEN_KEY)
  }
  return localStorage.getItem(CUSTOMER_TOKEN_KEY)
}

api.interceptors.request.use((config) => {
  const token = resolveToken(config)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response || error.response.status === 503) {
      getAuthStore()?.clearAllSessions()
    }
    return Promise.reject(error)
  }
)

export default api
