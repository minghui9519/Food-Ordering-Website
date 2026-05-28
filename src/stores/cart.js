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
    getItemIndex(id, customKey) {
      return this.items.findIndex(
        (item) => item.id === id && (customKey !== undefined ? item.customKey === customKey : true)
      )
    },
    buildCustomKey({ notes = '', customIngredients = [], removedIngredients = [] }) {
      return JSON.stringify({
        notes: notes.trim(),
        customIngredients: [...customIngredients].sort(),
        removedIngredients: [...removedIngredients].sort()
      })
    },
    addToCart(payload) {
      const hasConfig = payload && typeof payload === 'object' && 'product' in payload
      const product = hasConfig ? payload.product : payload
      const quantity = Math.max(1, Number(hasConfig ? payload.quantity : 1) || 1)
      const notes = hasConfig ? (payload.notes ?? '') : ''
      const customIngredients = hasConfig ? (payload.customIngredients ?? []) : []
      const removedIngredients = hasConfig ? (payload.removedIngredients ?? []) : []

      if (!product?.id) return

      const customKey = this.buildCustomKey({ notes, customIngredients, removedIngredients })

      const existing = this.items.find((item) => item.id === product.id && item.customKey === customKey)
      if (existing) {
        existing.quantity += quantity
        return
      }
      this.items.push({
        ...product,
        quantity,
        notes,
        customIngredients,
        removedIngredients,
        customKey
      })
    },
    updateQuantity(id, quantity, customKey) {
      const target = this.items.find(
        (item) => item.id === id && (customKey !== undefined ? item.customKey === customKey : true)
      )
      if (!target) return
      target.quantity = Math.max(1, quantity)
    },
    updateCartItem(payload) {
      const { id, customKey, quantity = 1, notes = '', customIngredients = [], removedIngredients = [] } = payload
      const targetIndex = this.getItemIndex(id, customKey)
      if (targetIndex < 0) return

      const normalizedQty = Math.max(1, Number(quantity) || 1)
      const nextCustomKey = this.buildCustomKey({ notes, customIngredients, removedIngredients })
      const conflictIndex = this.items.findIndex(
        (item, index) => index !== targetIndex && item.id === id && item.customKey === nextCustomKey
      )

      if (conflictIndex >= 0) {
        this.items[conflictIndex].quantity += normalizedQty
        this.items.splice(targetIndex, 1)
        return
      }

      this.items[targetIndex] = {
        ...this.items[targetIndex],
        quantity: normalizedQty,
        notes,
        customIngredients,
        removedIngredients,
        customKey: nextCustomKey
      }
    },
    removeFromCart(id, customKey) {
      this.items = this.items.filter(
        (item) => !(item.id === id && (customKey !== undefined ? item.customKey === customKey : true))
      )
    },
    clearCart() {
      this.items = []
    }
  }
})
