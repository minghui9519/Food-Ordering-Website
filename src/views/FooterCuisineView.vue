<template>
  <div class="menu-layout">
    <section class="menu-content grid">
      <section class="card menu-hero">
        <p class="pill pill-warm">Cuisine Directory</p>
        <h1 class="section-title">Explore dishes by popular cuisine.</h1>
        <p class="muted">Browse all dishes that belong to each popular cuisine group.</p>
      </section>

      <section class="card filter-card">
        <label for="popular-cuisine">Popular cuisine</label>
        <select id="popular-cuisine" v-model="selectedFooterCuisine">
          <option value="All">All</option>
          <option v-for="cuisine in popularCuisineOptions" :key="cuisine" :value="cuisine">
            {{ cuisine }}
          </option>
        </select>
      </section>

      <section class="grid products">
        <ProductCard
          v-for="item in filteredProducts"
          :key="item.id"
          :product="item"
          @add="cart.addToCart"
          @select="openDetail"
        />
      </section>
    </section>

    <aside class="detail-panel" :class="{ open: Boolean(activeProduct) }" v-if="activeProduct">
      <img
        class="detail-image"
        :src="activeProduct.image"
        :alt="activeProduct.name"
        loading="lazy"
        decoding="async"
        referrerpolicy="no-referrer"
        @error="onProductImgError"
      />
      <div class="detail-body">
        <p class="pill pill-warm">{{ activeProduct.footerCuisine }}</p>
        <h2>{{ activeProduct.name }}</h2>
        <p class="muted">{{ activeProduct.description }}</p>
        <p class="muted">Cuisine type: {{ activeProduct.cuisineCategory }}</p>
        <p class="price">${{ activeProduct.price.toFixed(2) }}</p>
        <label>
          Quantity
          <input v-model.number="quantity" type="number" min="1" />
        </label>
        <p class="muted">Estimated subtotal: ${{ (activeProduct.price * quantity).toFixed(2) }}</p>
      </div>
      <div class="detail-actions">
        <button class="btn btn-primary" @click="addSelected">Add to Cart</button>
        <button class="btn btn-secondary" @click="closeDetail">Cancel</button>
      </div>
    </aside>

    <button
      class="drawer-overlay"
      v-if="activeProduct"
      @click="closeDetail"
      aria-label="Close detail panel"
    ></button>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { popularCuisines } from '../data/foodCatalog'
import { foodImageFallbackUrl } from '../data/foodImageMap'
import { useCartStore } from '../stores/cart'
import { useCatalogStore } from '../stores/catalog'
import ProductCard from '../components/ProductCard.vue'

const cart = useCartStore()
const catalog = useCatalogStore()
const route = useRoute()
const activeProduct = ref(null)
const quantity = ref(1)
const products = computed(() => catalog.products)
const popularCuisineOptions = computed(() => popularCuisines)
const selectedFooterCuisine = ref('All')

watch(
  () => route.query.type,
  (value) => {
    selectedFooterCuisine.value =
      typeof value === 'string' && popularCuisineOptions.value.includes(value) ? value : 'All'
  },
  { immediate: true }
)

const filteredProducts = computed(() =>
  selectedFooterCuisine.value === 'All'
    ? products.value
    : products.value.filter((item) => item.footerCuisine === selectedFooterCuisine.value)
)

onMounted(() => {
  catalog.fetchAll()
})

function openDetail(product) {
  activeProduct.value = product
  quantity.value = 1
}

function closeDetail() {
  activeProduct.value = null
  quantity.value = 1
}

function addSelected() {
  if (!activeProduct.value) return
  for (let i = 0; i < quantity.value; i += 1) {
    cart.addToCart(activeProduct.value)
  }
  closeDetail()
}

function onProductImgError(event) {
  if (event.target.src !== foodImageFallbackUrl) {
    event.target.src = foodImageFallbackUrl
  }
}
</script>

<style scoped>
.menu-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 1rem;
  align-items: start;
  position: relative;
}

.menu-content {
  gap: 1rem;
}

.menu-hero {
  padding: 1.2rem;
}

.filter-card {
  display: grid;
  gap: 0.5rem;
}

.products {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.detail-panel {
  position: sticky;
  top: 1rem;
  border-radius: 20px;
  border: 1px solid #eceff3;
  background: #fff;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.1);
  overflow: hidden;
  z-index: 3;
}

.detail-image {
  width: 100%;
  height: 240px;
  object-fit: cover;
}

.detail-body {
  padding: 1rem;
  display: grid;
  gap: 0.5rem;
}

.detail-body h2 {
  margin: 0;
}

.price {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0.1rem 0;
}

.detail-actions {
  display: flex;
  gap: 0.6rem;
  padding: 0 1rem 1rem;
}

.drawer-overlay {
  display: none;
}

@media (max-width: 1024px) {
  .menu-layout {
    grid-template-columns: 1fr;
  }

  .detail-panel {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    width: min(92vw, 380px);
    border-radius: 20px 0 0 20px;
    transform: translateX(0);
  }

  .drawer-overlay {
    display: block;
    position: fixed;
    inset: 0;
    border: none;
    background: rgba(15, 23, 42, 0.4);
    z-index: 2;
  }
}

@media (max-width: 640px) {
  .products {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-panel {
    width: 100%;
    border-radius: 0;
  }
}
</style>
