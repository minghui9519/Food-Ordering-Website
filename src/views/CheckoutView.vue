<template>
  <div class="checkout-page">
    <PageIntro
      class="checkout-intro"
      title="Checkout"
      description="Review your order, enter delivery details, and confirm."
    />

    <p v-if="!cart.items.length" class="card checkout-empty">
      Your cart is empty.
      <RouterLink to="/menu" class="checkout-link">Browse menu</RouterLink>
    </p>

    <div v-else class="checkout-stack">
      <section class="card checkout-panel order-panel">
        <header class="panel-head">
          <span class="panel-icon" aria-hidden="true">🧾</span>
          <div>
            <h2 class="panel-title">Order summary</h2>
            <p class="muted panel-sub">{{ cart.totalItems }} item{{ cart.totalItems === 1 ? '' : 's' }}</p>
          </div>
        </header>

        <ul class="order-lines">
          <li v-for="line in pricedLines" :key="itemKey(line)" class="order-line">
            <img
              class="line-thumb"
              :src="lineImage(line)"
              :alt="line.name"
              loading="lazy"
              decoding="async"
              referrerpolicy="no-referrer"
              @error="onImgError"
            />
            <div class="line-body">
              <div class="line-top">
                <strong>{{ line.name }}</strong>
                <span class="line-price">${{ line.lineTotal.toFixed(2) }}</span>
              </div>
              <p class="muted line-meta">
                {{ line.quantity }} × ${{ line.price.toFixed(2) }}
                <span v-if="line.savings > 0" class="line-save"> (save ${{ line.savings.toFixed(2) }})</span>
              </p>
              <p v-if="line.customIngredients?.length" class="line-detail">
                <span class="detail-label">Add</span> {{ line.customIngredients.join(', ') }}
              </p>
              <p v-if="line.removedIngredients?.length" class="line-detail">
                <span class="detail-label">Remove</span> {{ line.removedIngredients.join(', ') }}
              </p>
              <p v-if="line.notes" class="line-detail">
                <span class="detail-label">Item notes</span> {{ line.notes }}
              </p>
            </div>
          </li>
          <li v-for="freebie in cart.freebieRewards" :key="`freebie-${freebie.promoId}`" class="order-line freebie">
            <span class="freebie-badge" aria-hidden="true">🎁</span>
            <div class="line-body">
              <div class="line-top">
                <strong>Free {{ freebie.label }}</strong>
                <span class="line-price">$0.00</span>
              </div>
              <p class="muted line-meta">With {{ freebie.title }} · ×{{ freebie.quantity }}</p>
            </div>
          </li>
        </ul>

        <div class="totals-block">
          <div class="total-row">
            <span class="muted">Subtotal</span>
            <span>${{ cart.pricing.subtotal.toFixed(2) }}</span>
          </div>
          <div v-if="cart.promotionSavings > 0" class="total-row savings">
            <span>Promotion savings</span>
            <span>-${{ cart.promotionSavings.toFixed(2) }}</span>
          </div>
          <p v-if="cart.appliedPromotions.length" class="applied-promos">
            Applied: {{ cart.appliedPromotions.map((p) => p.title).join(', ') }}
          </p>
          <div class="total-row grand">
            <span>Total</span>
            <strong>${{ cart.totalPrice.toFixed(2) }}</strong>
          </div>
        </div>
      </section>

      <section class="card checkout-panel form-panel">
        <header class="panel-head">
          <span class="panel-icon" aria-hidden="true">🚚</span>
          <div>
            <h2 class="panel-title">Delivery details</h2>
            <p class="muted panel-sub">We'll use this to deliver your order</p>
          </div>
        </header>

        <form class="checkout-form" @submit.prevent="submitOrder">
          <label class="field">
            <span class="field-label">Full name</span>
            <input v-model="form.name" type="text" required placeholder="Your name" autocomplete="name" />
          </label>

          <label class="field">
            <span class="field-label">Phone number</span>
            <input
              v-model="form.phone"
              type="tel"
              required
              placeholder="+60 12-345 6789"
              autocomplete="tel"
            />
          </label>

          <label class="field">
            <span class="field-label">Delivery address</span>
            <input
              v-model="form.address"
              type="text"
              required
              placeholder="Street, unit, city"
              autocomplete="street-address"
            />
          </label>

          <DeliveryMapPicker
            :address="form.address"
            :lat="form.lat"
            :lng="form.lng"
            @update:coordinates="onMapCoordinates"
            @reverse-geocode="onReverseGeocode"
          />

          <label class="field">
            <span class="field-label">Delivery notes</span>
            <textarea
              v-model="form.deliveryNotes"
              rows="3"
              placeholder="Gate code, landmark, leave at lobby, call on arrival…"
            ></textarea>
            <span class="field-hint muted">Optional instructions for the driver</span>
          </label>

          <p v-if="error" class="pill pill-warm form-alert">{{ error }}</p>
          <p v-if="message" class="pill pill-success form-alert">{{ message }}</p>

          <button class="btn btn-primary submit-btn" type="submit" :disabled="submitting">
            {{ submitting ? 'Placing order…' : `Place order · $${cart.totalPrice.toFixed(2)}` }}
          </button>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import PageIntro from '../components/PageIntro.vue'
import DeliveryMapPicker from '../components/DeliveryMapPicker.vue'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import { createOrder } from '../api/orders'
import { resolveProductImageUrl } from '../utils/productImageUrl'
import { foodImageFallbackUrl } from '../data/foodImageMap'

const cart = useCartStore()
const auth = useAuthStore()
const router = useRouter()
const message = ref('')
const error = ref('')
const submitting = ref(false)
const pricedLines = computed(() => cart.pricing.lines)

const form = reactive({
  name: '',
  address: '',
  phone: '',
  deliveryNotes: '',
  lat: null,
  lng: null
})

function itemKey(item) {
  return `${item.id}-${item.customKey ?? 'default'}`
}

function lineImage(line) {
  return resolveProductImageUrl(line.image)
}

function onImgError(event) {
  if (event.target.src !== foodImageFallbackUrl) {
    event.target.src = foodImageFallbackUrl
  }
}

function onMapCoordinates({ lat, lng }) {
  form.lat = lat
  form.lng = lng
}

function onReverseGeocode(displayName) {
  if (displayName?.trim()) form.address = displayName.trim()
}

function buildDeliveryAddress() {
  const base = form.address.trim()
  const notes = form.deliveryNotes.trim()
  if (!notes) return base
  return `${base}\n\nDelivery notes: ${notes}`
}

onMounted(() => {
  if (auth.customerUser) {
    form.name = auth.customerUser.name ?? ''
    form.phone = auth.customerUser.phone ?? ''
    form.address = auth.customerUser.address ?? ''
  }
})

async function submitOrder() {
  if (!cart.items.length) return
  submitting.value = true
  error.value = ''
  message.value = ''
  try {
    const { data } = await createOrder({
      customerName: form.name,
      deliveryAddress: buildDeliveryAddress(),
      phone: form.phone,
      items: cart.items.map((item) => {
        const line = pricedLines.value.find(
          (l) => l.id === item.id && l.customKey === item.customKey
        )
        return {
          productId: item.id,
          productName: item.name,
          unitPrice: line?.lineTotal != null ? line.lineTotal / item.quantity : item.price,
          quantity: item.quantity,
          notes: item.notes ?? '',
          customIngredients: item.customIngredients ?? [],
          removedIngredients: item.removedIngredients ?? []
        }
      })
    })
    message.value = `Order #${data.id} submitted. Total: $${data.total.toFixed(2)}`
    cart.clearCart()
    form.name = auth.customerUser?.name ?? ''
    form.phone = auth.customerUser?.phone ?? ''
    form.address = auth.customerUser?.address ?? ''
    form.deliveryNotes = ''
    form.lat = null
    form.lng = null
    setTimeout(() => router.push('/history'), 1500)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to place order'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.checkout-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: 0 1rem 2rem;
}

.checkout-intro {
  width: 100%;
  text-align: center;
}

.checkout-intro :deep(.section-title),
.checkout-intro :deep(.muted) {
  text-align: center;
}

.checkout-stack {
  width: 100%;
  display: grid;
  gap: 1.25rem;
}

.checkout-panel {
  width: 100%;
  padding: 1.35rem 1.5rem;
  box-shadow: var(--shadow-card);
}

.panel-head {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.1rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--line);
}

.panel-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: grid;
  place-items: center;
  font-size: 1.25rem;
  background: var(--primary-soft);
  border-radius: 12px;
}

.panel-title {
  margin: 0;
  font-size: 1.2rem;
  letter-spacing: -0.02em;
}

.panel-sub {
  margin: 0.15rem 0 0;
  font-size: 0.88rem;
}

.order-lines {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.85rem;
}

.order-line {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 0.75rem;
  align-items: start;
}

.order-line.freebie {
  grid-template-columns: 64px 1fr;
}

.line-thumb,
.freebie-badge {
  width: 64px;
  height: 56px;
  border-radius: 12px;
  object-fit: cover;
}

.freebie-badge {
  display: grid;
  place-items: center;
  font-size: 1.5rem;
  background: var(--success-soft);
}

.line-body {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
}

.line-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.line-price {
  font-weight: 700;
  white-space: nowrap;
}

.line-meta {
  margin: 0;
  font-size: 0.86rem;
}

.line-save {
  color: #ea580c;
  font-weight: 600;
}

.line-detail {
  margin: 0;
  font-size: 0.84rem;
  color: var(--text-muted);
}

.detail-label {
  font-weight: 600;
  color: var(--text);
}

.totals-block {
  margin-top: 1.1rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--line);
  display: grid;
  gap: 0.45rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.92rem;
}

.total-row.savings {
  color: #ea580c;
  font-weight: 600;
}

.total-row.grand {
  margin-top: 0.35rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--line);
  font-size: 1.1rem;
}

.applied-promos {
  margin: 0;
  font-size: 0.85rem;
  color: var(--success-text);
  font-weight: 600;
}

.checkout-form {
  display: grid;
  gap: 1rem;
}

.field {
  display: grid;
  gap: 0.35rem;
}

.field-label {
  font-weight: 600;
  font-size: 0.95rem;
}

.field-hint {
  font-size: 0.8rem;
  font-weight: 400;
}

.form-alert {
  margin: 0;
  justify-content: center;
  width: 100%;
}

.submit-btn {
  width: 100%;
  justify-content: center;
  padding: 0.85rem 1.25rem;
  font-size: 1rem;
}

.checkout-empty {
  width: 100%;
  text-align: center;
  padding: 1.5rem;
}

.checkout-link {
  color: var(--primary);
  font-weight: 600;
  margin-left: 0.35rem;
}

.checkout-link:hover {
  text-decoration: underline;
}

@media (min-width: 900px) {
  .checkout-page {
    max-width: 720px;
  }
}
</style>
