import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),
  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },
  actions: {
    addToCart(product) {
      const existing = this.items.find((item) => item.id === product.id)
      if (existing) {
        existing.quantity += 1
        return
      }
      this.items.push({ ...product, quantity: 1 })
    },
    updateQuantity(id, quantity) {
      const target = this.items.find((item) => item.id === id)
      if (!target) return
      target.quantity = Math.max(1, quantity)
    },
    removeFromCart(id) {
      this.items = this.items.filter((item) => item.id !== id)
    },
    clearCart() {
      this.items = []
    }
  }
})
