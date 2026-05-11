import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.user)
  },
  actions: {
    login(email) {
      this.user = { id: 1, name: 'Demo User', email }
    },
    logout() {
      this.user = null
    }
  }
})
