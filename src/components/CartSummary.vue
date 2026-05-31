<template>
  <aside class="card summary">
    <h3>Cart Summary</h3>
    <p class="muted">Items in cart: {{ cart.totalItems }}</p>
    <p v-if="cart.appliedPromotions.length" class="applied-promos">
      Applied: {{ cart.appliedPromotions.map((item) => item.title).join(', ') }}
    </p>
    <p class="muted">Subtotal: ${{ cart.pricing.subtotal.toFixed(2) }}</p>
    <p v-if="cart.promotionSavings > 0" class="savings">
      Promotion savings: -${{ cart.promotionSavings.toFixed(2) }}
    </p>
    <ul v-if="cart.freebieRewards.length" class="freebies">
      <li v-for="freebie in cart.freebieRewards" :key="freebie.promoId">
        Free {{ freebie.label }} x{{ freebie.quantity }}
      </li>
    </ul>
    <p class="total"><strong>Total: ${{ cart.totalPrice.toFixed(2) }}</strong></p>
    <RouterLink to="/checkout" class="btn btn-primary">Go to Checkout</RouterLink>
  </aside>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useCartStore } from '../stores/cart'

const cart = useCartStore()
</script>

<style scoped>
.summary {
  display: grid;
  gap: 0.5rem;
  align-content: start;
}

.summary h3,
.summary p {
  margin: 0;
}

.applied-promos {
  font-size: 0.88rem;
  color: #166534;
  font-weight: 600;
}

.savings {
  color: #ea580c;
  font-weight: 600;
}

.freebies {
  margin: 0;
  padding-left: 1.1rem;
  color: #166534;
  font-size: 0.9rem;
}

.total {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.summary .btn {
  justify-self: start;
}
</style>
