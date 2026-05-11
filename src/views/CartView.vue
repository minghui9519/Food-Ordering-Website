<template>
  <div class="cart-page grid">
    <PageIntro title="Shopping Cart" description="Review and update selected items before checkout." />
    <section class="content-grid">
      <section class="card list" v-if="cart.items.length">
        <article class="item" v-for="item in cart.items" :key="item.id">
          <img
            class="thumb"
            :src="item.image"
            :alt="item.name"
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
            @error="onProductImgError"
          />
          <div>
            <h3>{{ item.name }}</h3>
            <p class="muted">${{ item.price.toFixed(2) }} each</p>
          </div>
          <input
            type="number"
            min="1"
            :value="item.quantity"
            @input="cart.updateQuantity(item.id, Number($event.target.value))"
          />
          <button class="btn btn-danger" @click="cart.removeFromCart(item.id)">Remove</button>
        </article>
      </section>
      <p v-else class="card">Your cart is empty. Add dishes from the menu to continue.</p>
      <CartSummary />
    </section>
  </div>
</template>

<script setup>
import PageIntro from '../components/PageIntro.vue'
import CartSummary from '../components/CartSummary.vue'
import { useCartStore } from '../stores/cart'
import { foodImageFallbackUrl } from '../data/foodImageMap'

const cart = useCartStore()

function onProductImgError(event) {
  if (event.target.src !== foodImageFallbackUrl) {
    event.target.src = foodImageFallbackUrl
  }
}
</script>

<style scoped>
.cart-page {
  gap: 1rem;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 1rem;
  align-items: start;
}

.list {
  display: grid;
  gap: 0.8rem;
}

.item {
  display: grid;
  grid-template-columns: 80px 1fr 100px auto;
  gap: 0.8rem;
  align-items: center;
  padding: 0.2rem 0;
}

.thumb {
  width: 80px;
  height: 70px;
  object-fit: cover;
  border-radius: 12px;
}

.item h3,
.item p {
  margin: 0;
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .item {
    grid-template-columns: 64px 1fr;
  }
}
</style>
