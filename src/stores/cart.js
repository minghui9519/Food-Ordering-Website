import { defineStore } from 'pinia'
import { useCatalogStore } from './catalog'
import { calculateCartSummary } from '../utils/promotionUtils'

const CART_STORAGE_KEY = 'foodyhub_cart'

function loadCartState() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return { items: [], appliedPromotionIds: [] }
    const parsed = JSON.parse(raw)
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      appliedPromotionIds: Array.isArray(parsed.appliedPromotionIds)
        ? parsed.appliedPromotionIds.map(Number).filter(Boolean)
        : []
    }
  } catch {
    return { items: [], appliedPromotionIds: [] }
  }
}

function saveCartState(state) {
  localStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify({
      items: state.items,
      appliedPromotionIds: state.appliedPromotionIds
    })
  )
}

export const useCartStore = defineStore('cart', {
  state: () => loadCartState(),
  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotalPrice: (state) =>
      state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    appliedPromotions(state) {
      const catalog = useCatalogStore()
      return catalog.promotions.filter((promo) => state.appliedPromotionIds.includes(promo.id))
    },
    pricing(state) {
      const catalog = useCatalogStore()
      const applied = catalog.promotions.filter((promo) =>
        state.appliedPromotionIds.includes(promo.id)
      )
      return calculateCartSummary(state.items, applied)
    },
    totalPrice() {
      return this.pricing.total
    },
    promotionSavings() {
      return this.pricing.savings
    },
    freebieRewards() {
      return this.pricing.freebies
    }
  },
  actions: {
    persist() {
      saveCartState(this.$state)
    },
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
    applyPromotion(id) {
      const promoId = Number(id)
      if (!promoId || this.appliedPromotionIds.includes(promoId)) return
      this.appliedPromotionIds.push(promoId)
      this.persist()
    },
    removePromotion(id) {
      const promoId = Number(id)
      this.appliedPromotionIds = this.appliedPromotionIds.filter((item) => item !== promoId)
      this.persist()
    },
    togglePromotion(id) {
      const promoId = Number(id)
      if (this.appliedPromotionIds.includes(promoId)) {
        this.removePromotion(promoId)
      } else {
        this.applyPromotion(promoId)
      }
    },
    isPromotionApplied(id) {
      return this.appliedPromotionIds.includes(Number(id))
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
        this.persist()
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
      this.persist()
    },
    updateQuantity(id, quantity, customKey) {
      const target = this.items.find(
        (item) => item.id === id && (customKey !== undefined ? item.customKey === customKey : true)
      )
      if (!target) return
      target.quantity = Math.max(1, quantity)
      this.persist()
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
        this.persist()
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
      this.persist()
    },
    removeFromCart(id, customKey) {
      this.items = this.items.filter(
        (item) => !(item.id === id && (customKey !== undefined ? item.customKey === customKey : true))
      )
      this.persist()
    },
    clearCart() {
      this.items = []
      this.appliedPromotionIds = []
      this.persist()
    }
  }
})
