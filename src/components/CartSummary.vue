<template>
  <aside class="card summary">
    <h3>Cart Summary</h3>
    <p class="muted">Items in cart: {{ cart.totalItems }}</p>
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

.total {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.summary .btn {
  justify-self: start;
}
</style>
