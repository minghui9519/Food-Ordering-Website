<template>
  <div class="menu-layout">
    <section class="menu-content grid">
      <section class="card menu-hero">
        <p class="pill pill-warm">Menu Collection</p>
        <h1 class="section-title">Choose your meal and customize before checkout.</h1>
        <p class="muted">Browse cards, preview dish details, and add items in seconds.</p>
      </section>

      <section class="card filter-card">
        <label for="cuisine">Filter by cuisine</label>
        <select id="cuisine" v-model="selectedCategory">
          <option value="All">All</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </section>

      <section class="grid products">
        <ProductCard
          v-for="item in filteredProducts"
          :key="item.id"
          :product="item"
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
        <p class="price">${{ activeProduct.price.toFixed(2) }}</p>
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
import { computed, onMounted, ref } from 'vue'
import { foodImageFallbackUrl } from '../data/foodImageMap'
import { useCartStore } from '../stores/cart'
import { useCatalogStore } from '../stores/catalog'
import ProductCard from '../components/ProductCard.vue'

const cart = useCartStore()
const catalog = useCatalogStore()
const selectedCategory = ref('All')
const activeProduct = ref(null)
const quantity = ref(1)
const orderNotes = ref('')
const selectedIngredients = ref([])

const products = computed(() => catalog.products)
const categories = computed(() => [...new Set(products.value.map((item) => item.cuisineCategory))])
const filteredProducts = computed(() =>
  selectedCategory.value === 'All'
    ? products.value
    : products.value.filter((item) => item.cuisineCategory === selectedCategory.value)
)

onMounted(() => {
  catalog.fetchAll()
})

function openDetail(product) {
  activeProduct.value = product
  quantity.value = 1
  orderNotes.value = ''
  selectedIngredients.value = getDefaultIngredients(product)
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
  return getDefaultIngredients(activeProduct.value)
})

function getDefaultIngredients(product) {
  const key = `${product.cuisineCategory} ${product.category}`.toLowerCase()
  const options = [
    'Protein',
    'Rice',
    'Vegetables',
    'Sauce',
    'Herbs',
    'Cheese',
    'Onion',
    'Garlic'
  ]
  if (key.includes('pizza') || key.includes('pasta')) return ['Cheese', 'Sauce', 'Garlic', 'Mushroom', 'Olives']
  if (key.includes('burger') || key.includes('wrap')) return ['Cheese', 'Onion', 'Lettuce', 'Tomato', 'Sauce']
  if (key.includes('ramen') || key.includes('noodle')) return ['Noodles', 'Egg', 'Spring onion', 'Chili', 'Broth']
  if (key.includes('curry') || key.includes('rice')) return ['Protein', 'Rice', 'Chili', 'Herbs', 'Sauce']
  return options
}

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
  selectedIngredients.value = getDefaultIngredients(activeProduct.value)
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
