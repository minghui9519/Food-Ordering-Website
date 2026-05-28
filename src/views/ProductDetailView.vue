<template>
  <div class="grid" v-if="loading">
    <p class="card muted">Loading product...</p>
  </div>
  <div class="grid" v-else-if="product">
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
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { foodImageFallbackUrl } from '../data/foodImageMap'
import { useCartStore } from '../stores/cart'
import { useCatalogStore } from '../stores/catalog'
import PageIntro from '../components/PageIntro.vue'

const route = useRoute()
const cart = useCartStore()
const catalog = useCatalogStore()
const product = ref(null)
const loading = ref(true)

async function loadProduct() {
  loading.value = true
  try {
    product.value = await catalog.fetchProductById(route.params.id)
  } catch {
    product.value = null
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, loadProduct, { immediate: false })

onMounted(() => {
  loadProduct()
})

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
