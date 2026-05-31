<template>
  <div class="cart-page grid">
    <PageIntro title="Shopping Cart" description="Review and update selected items before checkout." />
    <section v-if="activePromotions.length" class="card promo-cart-panel">
      <h2>Apply promotions</h2>
      <div class="promo-cart-list">
        <article
          v-for="promo in activePromotions"
          :key="promo.id"
          class="promo-cart-item"
          :class="{ applied: cart.isPromotionApplied(promo.id) }"
        >
          <div>
            <p class="pill pill-warm">{{ formatPromoBadge(promo) }}</p>
            <strong>{{ promo.title }}</strong>
            <p class="muted">{{ formatPromoDeal(promo, triggerProductName(promo)) }}</p>
          </div>
          <button
            type="button"
            class="btn"
            :class="cart.isPromotionApplied(promo.id) ? 'btn-secondary' : 'btn-primary'"
            @click="cart.togglePromotion(promo.id)"
          >
            {{ cart.isPromotionApplied(promo.id) ? 'Applied' : 'Apply' }}
          </button>
        </article>
      </div>
    </section>
    <section class="content-grid">
      <section class="card list" v-if="cart.items.length">
        <article class="item" v-for="line in pricedLines" :key="itemKey(line)">
          <img
            class="thumb"
            :src="line.image"
            :alt="line.name"
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
            @error="onProductImgError"
          />
          <div class="item-info">
            <h3>{{ line.name }}</h3>
            <p class="muted">${{ line.price.toFixed(2) }} each</p>
            <p v-if="line.savings > 0" class="line-savings">
              Promo price: ${{ line.lineTotal.toFixed(2) }} (save ${{ line.savings.toFixed(2) }})
            </p>
            <p class="muted" v-if="line.customIngredients?.length">
              Add: {{ line.customIngredients.join(', ') }}
            </p>
            <p class="muted" v-if="line.removedIngredients?.length">
              Remove: {{ line.removedIngredients.join(', ') }}
            </p>
            <p class="muted" v-if="line.notes">Notes: {{ line.notes }}</p>
          </div>
          <div class="qty-wrap">
            <label class="muted">Qty</label>
            <input
              type="number"
              min="1"
              :value="line.quantity"
              @input="cart.updateQuantity(line.id, Number($event.target.value), line.customKey)"
            />
          </div>
          <div class="item-actions">
            <button class="btn btn-secondary" @click="startEdit(line)">Edit</button>
            <button class="btn btn-danger" @click="cart.removeFromCart(line.id, line.customKey)">Remove</button>
          </div>

          <div class="edit-panel" v-if="editingKey === itemKey(line)">
            <label>
              Quantity
              <input v-model.number="editForm.quantity" type="number" min="1" />
            </label>
            <label>
              Notes for restaurant
              <textarea
                v-model="editForm.notes"
                rows="3"
                placeholder="Less spicy, pack gravy separately..."
              ></textarea>
            </label>
            <div class="chip-grid">
              <button
                v-for="ingredient in editForm.availableIngredients"
                :key="ingredient"
                type="button"
                class="chip"
                :class="{ selected: editForm.selectedIngredients.includes(ingredient) }"
                @click="toggleEditIngredient(ingredient)"
              >
                {{ ingredient }}
              </button>
            </div>
            <div class="edit-actions">
              <button class="btn btn-primary" @click="saveEdit(line)">Save changes</button>
              <button class="btn btn-secondary" @click="cancelEdit">Cancel</button>
            </div>
          </div>
        </article>
        <article v-for="freebie in cart.freebieRewards" :key="`freebie-${freebie.promoId}`" class="item freebie-item">
          <div class="freebie-icon">🎁</div>
          <div class="item-info">
            <h3>Free {{ freebie.label }}</h3>
            <p class="muted">Included with {{ freebie.title }}</p>
          </div>
          <p class="freebie-qty">x{{ freebie.quantity }}</p>
          <p class="freebie-price">$0.00</p>
        </article>
      </section>
      <p v-else class="card">Your cart is empty. Add dishes from the menu to continue.</p>
      <CartSummary />
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import PageIntro from '../components/PageIntro.vue'
import CartSummary from '../components/CartSummary.vue'
import { useCartStore } from '../stores/cart'
import { useCatalogStore } from '../stores/catalog'
import { foodImageFallbackUrl } from '../data/foodImageMap'
import { getProductCustomizationOptions } from '../utils/productCustomization'
import {
  formatPromoBadge,
  formatPromoDeal,
  isPromotionActive
} from '../utils/promotionUtils'

const cart = useCartStore()
const catalog = useCatalogStore()
const activePromotions = computed(() => catalog.promotions.filter(isPromotionActive))
const pricedLines = computed(() => cart.pricing.lines)

function triggerProductName(promo) {
  return catalog.products.find((item) => item.id === promo.triggerProductId)?.name ?? ''
}

onMounted(() => {
  catalog.fetchAll()
})
const editingKey = ref('')
const editForm = reactive({
  quantity: 1,
  notes: '',
  selectedIngredients: [],
  availableIngredients: []
})

function onProductImgError(event) {
  if (event.target.src !== foodImageFallbackUrl) {
    event.target.src = foodImageFallbackUrl
  }
}

function itemKey(item) {
  return `${item.id}::${item.customKey ?? 'default'}`
}

function startEdit(item) {
  editingKey.value = itemKey(item)
  editForm.quantity = item.quantity
  editForm.notes = item.notes ?? ''
  editForm.availableIngredients = getProductCustomizationOptions(item)
  editForm.selectedIngredients = item.customIngredients?.length
    ? [...item.customIngredients]
    : [...editForm.availableIngredients]
}

function cancelEdit() {
  editingKey.value = ''
}

function toggleEditIngredient(ingredient) {
  if (editForm.selectedIngredients.includes(ingredient)) {
    editForm.selectedIngredients = editForm.selectedIngredients.filter((item) => item !== ingredient)
    return
  }
  editForm.selectedIngredients = [...editForm.selectedIngredients, ingredient]
}

function saveEdit(item) {
  const selected = [...editForm.selectedIngredients]
  const removed = editForm.availableIngredients.filter((ingredient) => !selected.includes(ingredient))
  cart.updateCartItem({
    id: item.id,
    customKey: item.customKey,
    quantity: editForm.quantity,
    notes: editForm.notes.trim(),
    customIngredients: selected,
    removedIngredients: removed
  })
  editingKey.value = ''
}
</script>

<style scoped>
.cart-page {
  gap: 1rem;
}

.promo-cart-panel {
  display: grid;
  gap: 0.75rem;
}

.promo-cart-panel h2 {
  margin: 0;
  font-size: 1.05rem;
}

.promo-cart-list {
  display: grid;
  gap: 0.65rem;
}

.promo-cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border: 1px solid #e8edf5;
  border-radius: 12px;
}

.promo-cart-item.applied {
  border-color: #86efac;
  background: #f0fdf4;
}

.promo-cart-item p {
  margin: 0.15rem 0 0;
}

.line-savings {
  margin: 0;
  color: #ea580c;
  font-size: 0.85rem;
  font-weight: 600;
}

.freebie-item {
  background: #f0fdf4;
  border-radius: 12px;
  padding: 0.5rem;
  border-bottom: none;
}

.freebie-icon {
  width: 80px;
  display: grid;
  place-items: center;
  font-size: 1.6rem;
}

.freebie-qty,
.freebie-price {
  margin: 0;
  font-weight: 700;
  color: #166534;
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
  padding: 0.35rem 0;
  border-bottom: 1px dashed #e9edf4;
}

.item-info {
  display: grid;
  gap: 0.2rem;
}

.item-info .muted {
  font-size: 0.83rem;
}

.qty-wrap {
  display: grid;
  gap: 0.25rem;
}

.qty-wrap input {
  max-width: 72px;
}

.item-actions {
  display: flex;
  gap: 0.45rem;
}

.edit-panel {
  grid-column: 2 / -1;
  margin-top: 0.25rem;
  border: 1px solid #e5eaf2;
  border-radius: 12px;
  padding: 0.7rem;
  display: grid;
  gap: 0.55rem;
  background: #fafcff;
}

.edit-panel textarea {
  width: 100%;
  border: 1px solid #d7dde8;
  border-radius: 10px;
  padding: 0.5rem 0.65rem;
  font: inherit;
  resize: vertical;
}

.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.chip {
  border: 1px solid #d6ddeb;
  background: #fff;
  color: #344054;
  border-radius: 999px;
  padding: 0.3rem 0.72rem;
  font-size: 0.82rem;
  cursor: pointer;
}

.chip.selected {
  background: #dcfce7;
  color: #166534;
  border-color: #86efac;
}

.edit-actions {
  display: flex;
  gap: 0.45rem;
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

  .item-actions,
  .qty-wrap {
    grid-column: 2;
  }

  .edit-panel {
    grid-column: 1 / -1;
  }
}
</style>
