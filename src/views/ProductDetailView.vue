<template>
  <div class="grid" v-if="product">
    <PageIntro :title="product.name" :description="product.description" />
    <section class="card detail">
      <img
        :src="product.image"
        :alt="product.name"
        loading="lazy"
        decoding="async"
        referrerpolicy="no-referrer"
        @error="onProductImgError"
      />
      <div>
        <p class="muted">Category: {{ product.category }}</p>
        <p><strong>${{ product.price.toFixed(2) }}</strong></p>
        <button class="btn btn-primary" @click="cart.addToCart(product)">Add to Cart</button>
      </div>
    </section>
  </div>
  <p v-else class="card">Product not found.</p>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { products } from '../data/mockData'
import { foodImageFallbackUrl } from '../data/foodImageMap'
import { useCartStore } from '../stores/cart'
import PageIntro from '../components/PageIntro.vue'

const route = useRoute()
const cart = useCartStore()

const product = computed(() => products.find((item) => item.id === Number(route.params.id)))

function onProductImgError(event) {
  if (event.target.src !== foodImageFallbackUrl) {
    event.target.src = foodImageFallbackUrl
  }
}
</script>

<style scoped>
.detail {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr 1fr;
}

img {
  width: 100%;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .detail {
    grid-template-columns: 1fr;
  }
}
</style>
