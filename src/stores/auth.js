import { defineStore } from 'pinia'
import * as authApi from '../api/auth'

const CUSTOMER_TOKEN_KEY = 'foodyhub_customer_token'
const ADMIN_TOKEN_KEY = 'foodyhub_admin_token'
const LEGACY_TOKEN_KEY = 'foodyhub_token'

let healthCheckTimer = null

async function pingApiHealth() {
  const response = await fetch('/api/health', { signal: AbortSignal.timeout(4000) })
  if (!response.ok) throw new Error('API unavailable')
}

async function fetchMeWithToken(token) {
  const response = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(8000)
  })
  if (!response.ok) throw new Error('Invalid session')
  const data = await response.json()
  return data.user
}

function stopHealthCheck() {
  if (healthCheckTimer) {
    clearInterval(healthCheckTimer)
    healthCheckTimer = null
  }
}

function hasAnySession(store) {
  return Boolean(store.customerToken || store.adminToken)
}

function startHealthCheck(store) {
  stopHealthCheck()
  healthCheckTimer = setInterval(async () => {
    if (!hasAnySession(store)) return
    try {
      await pingApiHealth()
    } catch {
      store.clearAllSessions()
    }
  }, 20000)
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    customerUser: null,
    customerToken: localStorage.getItem(CUSTOMER_TOKEN_KEY) || null,
    adminUser: null,
    adminToken: localStorage.getItem(ADMIN_TOKEN_KEY) || null,
    initialized: false
  }),
  getters: {
    isCustomerLoggedIn: (state) => Boolean(state.customerUser && state.customerToken),
    isAdminLoggedIn: (state) => Boolean(state.adminUser && state.adminToken),
    /** Customer storefront session */
    isLoggedIn: (state) => Boolean(state.customerUser && state.customerToken),
    user: (state) => state.customerUser,
    isAdmin: (state) => Boolean(state.adminUser && state.adminToken),
    isCustomer: (state) => Boolean(state.customerUser && state.customerToken)
  },
  actions: {
    setCustomerSession(token, user) {
      this.customerToken = token
      this.customerUser = user
      localStorage.setItem(CUSTOMER_TOKEN_KEY, token)
      startHealthCheck(this)
    },
    setAdminSession(token, user) {
      this.adminToken = token
      this.adminUser = user
      localStorage.setItem(ADMIN_TOKEN_KEY, token)
      startHealthCheck(this)
    },
    clearCustomerSession() {
      this.customerToken = null
      this.customerUser = null
      localStorage.removeItem(CUSTOMER_TOKEN_KEY)
      if (!this.adminToken) stopHealthCheck()
    },
    clearAdminSession() {
      this.adminToken = null
      this.adminUser = null
      localStorage.removeItem(ADMIN_TOKEN_KEY)
      if (!this.customerToken) stopHealthCheck()
    },
    clearAllSessions() {
      this.clearCustomerSession()
      this.clearAdminSession()
      stopHealthCheck()
    },
    migrateLegacyToken() {
      const legacy = localStorage.getItem(LEGACY_TOKEN_KEY)
      if (!legacy) return
      localStorage.removeItem(LEGACY_TOKEN_KEY)
      if (!this.customerToken && !this.adminToken) {
        if (legacy) {
          localStorage.setItem(CUSTOMER_TOKEN_KEY, legacy)
          this.customerToken = legacy
        }
      }
    },
    async init() {
      try {
        await pingApiHealth()
      } catch {
        this.clearAllSessions()
        this.initialized = true
        return
      }

      this.migrateLegacyToken()

      if (this.customerToken) {
        try {
          this.customerUser = await fetchMeWithToken(this.customerToken)
        } catch {
          this.clearCustomerSession()
        }
      }

      if (this.adminToken) {
        try {
          this.adminUser = await fetchMeWithToken(this.adminToken)
          if (this.adminUser?.role !== 'admin') {
            this.clearAdminSession()
          }
        } catch {
          this.clearAdminSession()
        }
      }

      if (hasAnySession(this)) {
        startHealthCheck(this)
      }

      this.initialized = true
    },
    async login({ email, password, role }) {
      const { data } = await authApi.login({ email, password, role })
      if (role === 'admin') {
        this.setAdminSession(data.token, data.user)
      } else {
        this.setCustomerSession(data.token, data.user)
      }
      return data.user
    },
    async register(payload) {
      const { data } = await authApi.register({ ...payload, role: 'customer' })
      this.setCustomerSession(data.token, data.user)
      return data.user
    },
    logout() {
      this.clearCustomerSession()
    },
    logoutAdmin() {
      this.clearAdminSession()
    },
    async updateProfile(payload) {
      const { data } = await authApi.updateProfile(payload)
      this.customerUser = data.user
      return data.user
    }
  }
})
