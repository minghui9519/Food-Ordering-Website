<template>
  <div class="menu-layout">
    <section class="menu-content grid">
      <section class="card menu-hero">
        <p class="pill pill-warm">Menu Collection</p>
        <h1 class="section-title">Choose your meal and customize before checkout.</h1>
        <p class="muted">Browse cards, preview dish details, and add items in seconds.</p>
      </section>

      <section v-if="activePromotions.length" class="card promo-panel">
        <div class="promo-panel-head">
          <h2>Available promotions</h2>
          <p class="muted">Apply a deal here — savings show on eligible items and in your cart.</p>
        </div>
        <div class="promo-list">
          <article
            v-for="promo in activePromotions"
            :key="promo.id"
            class="promo-item"
            :class="{ applied: cart.isPromotionApplied(promo.id) }"
          >
            <div>
              <p class="pill pill-warm">{{ formatPromoBadge(promo) }}</p>
              <h3>{{ promo.title }}</h3>
              <p class="muted">{{ formatPromoDeal(promo, triggerProductName(promo)) }}</p>
            </div>
            <button
              type="button"
              class="btn"
              :class="cart.isPromotionApplied(promo.id) ? 'btn-secondary' : 'btn-primary'"
              @click="toggleMenuPromotion(promo)"
            >
              {{ cart.isPromotionApplied(promo.id) ? 'Applied' : 'Apply promotion' }}
            </button>
          </article>
        </div>
      </section>

      <section class="card filter-card">
        <div class="filter-grid">
          <label for="menu-cuisine">
            Filter by cuisine
            <select id="menu-cuisine" v-model="selectedCuisine">
              <option value="All">All cuisines</option>
              <option v-for="cuisine in cuisineFilters" :key="cuisine" :value="cuisine">
                {{ cuisine }}
              </option>
            </select>
          </label>
          <label for="product-category">
            Filter by food category
            <select id="product-category" v-model="selectedProductCategory">
              <option value="All">All categories</option>
              <option v-for="category in productCategories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </label>
        </div>
        <button
          v-if="hasActiveFilters"
          type="button"
          class="filter-clear"
          @click="clearFilters"
        >
          Clear filters
        </button>
      </section>

      <section class="grid products">
        <ProductCard
          v-for="item in filteredProducts"
          :key="item.id"
          :product="item"
          :promotions="activePromotions"
          :applied-promotions="cart.appliedPromotions"
          @add="quickAddToCart"
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
        <p class="pill pill-warm">{{ activeProduct.category }}</p>
        <h2>{{ activeProduct.name }}</h2>
        <p class="muted">{{ activeProduct.description }}</p>
        <p class="price">
          <template v-if="detailMenuPrice.hasDiscount">
            <span class="price-old">${{ detailMenuPrice.original.toFixed(2) }}</span>
            <strong>${{ detailMenuPrice.final.toFixed(2) }}</strong>
          </template>
          <strong v-else>${{ activeProduct.price.toFixed(2) }}</strong>
        </p>
        <p v-if="detailPromoBadge" class="promo-note">{{ detailPromoBadge }} applied on cart</p>
        <label>
          Quantity
          <input v-model.number="quantity" type="number" min="1" />
        </label>
        <label>
          Notes for restaurant
          <textarea
            v-model="orderNotes"
            rows="3"
            placeholder="Less spicy, no peanuts, pack sauce separately..."
          ></textarea>
        </label>
        <fieldset class="ingredient-wrap">
          <legend>Customize ingredients</legend>
          <div class="ingredient-head">
            <p class="muted ingredient-status">
              {{ selectedIngredients.length }} / {{ ingredientOptions.length }} selected
            </p>
            <div class="ingredient-tools">
              <button type="button" class="chip-tool" @click="selectAllIngredients">All</button>
              <button type="button" class="chip-tool" @click="resetIngredients">Reset</button>
            </div>
          </div>
          <div class="ingredient-grid">
            <button
              v-for="ingredient in ingredientOptions"
              :key="ingredient"
              type="button"
              class="ingredient-chip"
              :class="{ selected: selectedIngredients.includes(ingredient) }"
              :aria-pressed="selectedIngredients.includes(ingredient)"
              @click="toggleIngredient(ingredient)"
            >
              {{ ingredient }}
            </button>
          </div>
        </fieldset>
        <p class="muted">Estimated subtotal: ${{ (activeProduct.price * quantity).toFixed(2) }}</p>
      </div>
      <div class="detail-actions">
        <button class="btn btn-primary" @click="addSelected($event)">Add to Cart</button>
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
import { useRoute, useRouter } from 'vue-router'
import { allProductCategories, cuisineOptions } from '../data/foodCatalog'
import { foodImageFallbackUrl } from '../data/foodImageMap'
import { useCartStore } from '../stores/cart'
import { useCatalogStore } from '../stores/catalog'
import ProductCard from '../components/ProductCard.vue'
import { getProductCustomizationOptions } from '../utils/productCustomization'
import {
  formatPromoBadge,
  formatPromoDeal,
  getMenuUnitPrice,
  isPromotionActive,
  promoAppliesToProduct
} from '../utils/promotionUtils'

const cart = useCartStore()
const catalog = useCatalogStore()
const route = useRoute()
const router = useRouter()
const selectedCuisine = ref('All')
const selectedProductCategory = ref('All')
const activeProduct = ref(null)
const quantity = ref(1)
const orderNotes = ref('')
const selectedIngredients = ref([])

const products = computed(() => catalog.products)
const activePromotions = computed(() => catalog.promotions.filter(isPromotionActive))
const productCategories = computed(() => allProductCategories)

const detailMenuPrice = computed(() =>
  activeProduct.value
    ? getMenuUnitPrice(activeProduct.value, cart.appliedPromotions)
    : { original: 0, final: 0, hasDiscount: false }
)

const detailPromoBadge = computed(() => {
  if (!activeProduct.value || !cart.appliedPromotions.length) return ''
  const promo = cart.appliedPromotions.find((item) =>
    promoAppliesToProduct(item, activeProduct.value)
  )
  return promo ? formatPromoBadge(promo) : ''
})

function triggerProductName(promo) {
  return products.value.find((item) => item.id === promo.triggerProductId)?.name ?? ''
}

function toggleMenuPromotion(promo) {
  cart.togglePromotion(promo.id)
}

function applyPromoFromRoute() {
  const promoId = Number(route.query.promo)
  if (!promoId) return
  const promo = activePromotions.value.find((item) => item.id === promoId)
  if (promo) cart.applyPromotion(promo.id)
}

const cuisineFilters = computed(() => {
  const labelsInStock = new Set(products.value.map((item) => item.cuisineCategory))
  return cuisineOptions.map((option) => option.label).filter((label) => labelsInStock.has(label))
})

const hasActiveFilters = computed(
  () => selectedCuisine.value !== 'All' || selectedProductCategory.value !== 'All'
)

const filteredProducts = computed(() =>
  products.value.filter((item) => {
    if (selectedCuisine.value !== 'All' && item.cuisineCategory !== selectedCuisine.value) {
      return false
    }
    if (selectedProductCategory.value !== 'All' && item.category !== selectedProductCategory.value) {
      return false
    }
    return true
  })
)

const validCuisineLabels = cuisineOptions.map((option) => option.label)

function syncFiltersFromRoute() {
  const cuisine = typeof route.query.cuisine === 'string' ? route.query.cuisine : ''
  const category = typeof route.query.category === 'string' ? route.query.category : ''

  selectedCuisine.value =
    cuisine && validCuisineLabels.includes(cuisine) ? cuisine : 'All'

  selectedProductCategory.value =
    category && productCategories.value.includes(category) ? category : 'All'
}

function syncPromoRouteState() {
  if (!catalog.loaded) return
  applyPromoFromRoute()
  const productId = Number(route.query.product)
  if (productId && !activeProduct.value) {
    const product = products.value.find((item) => item.id === productId)
    if (product) openDetail(product)
  }
}

function buildMenuQuery() {
  const query = {}
  if (selectedCuisine.value !== 'All') query.cuisine = selectedCuisine.value
  if (selectedProductCategory.value !== 'All') query.category = selectedProductCategory.value
  if (route.query.promo) query.promo = route.query.promo
  if (route.query.product) query.product = route.query.product
  return query
}

function clearFilters() {
  selectedCuisine.value = 'All'
  selectedProductCategory.value = 'All'
  router.replace({ name: 'menu', query: {} })
}

watch(
  () => route.query,
  () => syncFiltersFromRoute(),
  { immediate: true, deep: true }
)

watch(
  () => [catalog.loaded, route.query.promo, route.query.product],
  () => syncPromoRouteState(),
  { immediate: true }
)

watch([selectedCuisine, selectedProductCategory], () => {
  const query = buildMenuQuery()
  const currentCuisine = route.query.cuisine ?? undefined
  const currentCategory = route.query.category ?? undefined
  if (query.cuisine !== currentCuisine || query.category !== currentCategory) {
    router.replace({ name: 'menu', query })
  }
})

onMounted(() => {
  catalog.fetchAll(true)
})

async function openDetail(product) {
  const fresh = await catalog.fetchProductById(product.id, true)
  activeProduct.value = fresh ?? catalog.products.find((item) => item.id === product.id) ?? product
  quantity.value = 1
  orderNotes.value = ''
  selectedIngredients.value = [...getProductCustomizationOptions(activeProduct.value)]
}

function closeDetail() {
  activeProduct.value = null
  quantity.value = 1
  orderNotes.value = ''
  selectedIngredients.value = []
}

function addSelected(event) {
  if (!activeProduct.value) return
  const customIngredients = selectedIngredients.value
  const removedIngredients = ingredientOptions.value.filter(
    (item) => !selectedIngredients.value.includes(item)
  )
  cart.addToCart({
    product: activeProduct.value,
    quantity: quantity.value,
    notes: orderNotes.value.trim(),
    customIngredients,
    removedIngredients
  })
  triggerCartFlyAnimation(event)
  closeDetail()
}

function quickAddToCart(product, event) {
  cart.addToCart(product)
  triggerCartFlyAnimation(event)
}

function onProductImgError(event) {
  if (event.target.src !== foodImageFallbackUrl) {
    event.target.src = foodImageFallbackUrl
  }
}

const ingredientOptions = computed(() => {
  if (!activeProduct.value) return []
  return getProductCustomizationOptions(activeProduct.value)
})

function toggleIngredient(ingredient) {
  if (!selectedIngredients.value.includes(ingredient)) {
    selectedIngredients.value = [...selectedIngredients.value, ingredient]
    return
  }
  selectedIngredients.value = selectedIngredients.value.filter((item) => item !== ingredient)
}

function selectAllIngredients() {
  selectedIngredients.value = [...ingredientOptions.value]
}

function resetIngredients() {
  if (!activeProduct.value) return
  selectedIngredients.value = [...getProductCustomizationOptions(activeProduct.value)]
}

function triggerCartFlyAnimation(event) {
  if (!event?.currentTarget) return
  const rect = event.currentTarget.getBoundingClientRect()
  window.dispatchEvent(
    new CustomEvent('cart-fly', {
      detail: {
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2
      }
    })
  )
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
  gap: 0.75rem;
}

.filter-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.filter-grid label {
  display: grid;
  gap: 0.35rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: #344054;
}

.filter-grid select {
  font-weight: 400;
}

.filter-clear {
  justify-self: start;
  border: none;
  background: none;
  color: #f97316;
  font-size: 0.88rem;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

@media (max-width: 640px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
}

.products {
  grid-template-columns: repeat(auto-fill, minmax(220px, 280px));
  justify-content: start;
  align-items: stretch;
}

.products :deep(.product-card) {
  max-width: none;
}

.detail-panel {
  position: sticky;
  top: calc(var(--site-header-height) + 1rem);
  max-height: calc(100vh - var(--site-header-height) - 2rem);
  border-radius: 20px;
  border: 1px solid #eceff3;
  background: #fff;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.1);
  overflow-x: hidden;
  overflow-y: auto;
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

.detail-body textarea {
  width: 100%;
  border: 1px solid #d7dde8;
  border-radius: 10px;
  padding: 0.5rem 0.65rem;
  font: inherit;
  resize: vertical;
}

.ingredient-wrap {
  border: 1px solid #e5eaf2;
  border-radius: 12px;
  padding: 0.6rem 0.7rem 0.75rem;
  display: grid;
  gap: 0.55rem;
  background: linear-gradient(180deg, #fafcff 0%, #ffffff 100%);
}

.ingredient-wrap legend {
  padding: 0 0.2rem;
  color: #475467;
  font-size: 0.88rem;
}

.ingredient-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.7rem;
}

.ingredient-status {
  margin: 0;
  font-size: 0.82rem;
}

.ingredient-tools {
  display: flex;
  gap: 0.35rem;
}

.chip-tool {
  border: 1px solid #d4dbe7;
  background: #fff;
  color: #344054;
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
  font-size: 0.78rem;
  cursor: pointer;
}

.chip-tool:hover {
  background: #f3f7ff;
}

.ingredient-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.ingredient-chip {
  border: 1px solid #d6ddeb;
  background: #fff;
  color: #344054;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-size: 0.84rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ingredient-chip:hover {
  border-color: #84cc16;
}

.ingredient-chip.selected {
  background: #dcfce7;
  color: #166534;
  border-color: #86efac;
}

.detail-body h2 {
  margin: 0;
}

.price {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0.1rem 0;
}

.price-old {
  font-size: 0.95rem;
  color: #94a3b8;
  text-decoration: line-through;
  font-weight: 400;
  margin-right: 0.35rem;
}

.promo-note {
  margin: 0;
  color: #ea580c;
  font-size: 0.88rem;
  font-weight: 600;
}

.promo-panel {
  display: grid;
  gap: 0.85rem;
}

.promo-panel-head h2 {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
}

.promo-list {
  display: grid;
  gap: 0.75rem;
}

.promo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border: 1px solid #e8edf5;
  border-radius: 12px;
  background: #fafcff;
}

.promo-item.applied {
  border-color: #86efac;
  background: #f0fdf4;
}

.promo-item h3 {
  margin: 0.25rem 0;
  font-size: 1rem;
}

.promo-item p {
  margin: 0;
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
    top: var(--site-header-height);
    bottom: 0;
    max-height: none;
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
    justify-content: stretch;
  }

  .detail-panel {
    width: 100%;
    border-radius: 0;
  }
}
</style>
