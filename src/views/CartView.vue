<template>
  <div class="cart-page grid">
    <PageIntro title="Shopping Cart" description="Review and update selected items before checkout." />
    <section class="content-grid">
      <section class="card list" v-if="cart.items.length">
        <article class="item" v-for="item in cart.items" :key="itemKey(item)">
          <img
            class="thumb"
            :src="item.image"
            :alt="item.name"
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
            @error="onProductImgError"
          />
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p class="muted">${{ item.price.toFixed(2) }} each</p>
            <p class="muted" v-if="item.customIngredients?.length">
              Add: {{ item.customIngredients.join(', ') }}
            </p>
            <p class="muted" v-if="item.removedIngredients?.length">
              Remove: {{ item.removedIngredients.join(', ') }}
            </p>
            <p class="muted" v-if="item.notes">Notes: {{ item.notes }}</p>
          </div>
          <div class="qty-wrap">
            <label class="muted">Qty</label>
            <input
              type="number"
              min="1"
              :value="item.quantity"
              @input="cart.updateQuantity(item.id, Number($event.target.value), item.customKey)"
            />
          </div>
          <div class="item-actions">
            <button class="btn btn-secondary" @click="startEdit(item)">Edit</button>
            <button class="btn btn-danger" @click="cart.removeFromCart(item.id, item.customKey)">Remove</button>
          </div>

          <div class="edit-panel" v-if="editingKey === itemKey(item)">
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
              <button class="btn btn-primary" @click="saveEdit(item)">Save changes</button>
              <button class="btn btn-secondary" @click="cancelEdit">Cancel</button>
            </div>
          </div>
        </article>
      </section>
      <p v-else class="card">Your cart is empty. Add dishes from the menu to continue.</p>
      <CartSummary />
    </section>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import PageIntro from '../components/PageIntro.vue'
import CartSummary from '../components/CartSummary.vue'
import { useCartStore } from '../stores/cart'
import { foodImageFallbackUrl } from '../data/foodImageMap'

const cart = useCartStore()
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

function startEdit(item) {
  editingKey.value = itemKey(item)
  editForm.quantity = item.quantity
  editForm.notes = item.notes ?? ''
  editForm.availableIngredients = getDefaultIngredients(item)
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
