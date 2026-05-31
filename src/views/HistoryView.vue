<template>
  <div class="history-page">
    <PageIntro
      class="history-intro"
      title="Order History"
      description="Track your previous food orders, delivery details, and line items."
    />

    <div v-if="loading" class="card state-card loading-card" aria-live="polite">
      <span class="loading-dot" aria-hidden="true"></span>
      Loading your orders…
    </div>

    <p v-else-if="error" class="pill pill-warm card state-card">{{ error }}</p>

    <section v-else-if="!orders.length" class="card empty-card">
      <span class="empty-icon" aria-hidden="true">🍽️</span>
      <h2>No orders yet</h2>
      <p class="muted">When you place an order, it will show up here with full details.</p>
      <RouterLink to="/menu" class="btn btn-primary">Browse menu</RouterLink>
    </section>

    <template v-else>
      <div class="history-summary card">
        <div class="summary-stat">
          <span class="summary-value">{{ orders.length }}</span>
          <span class="summary-label">Order{{ orders.length === 1 ? '' : 's' }}</span>
        </div>
        <div class="summary-stat">
          <span class="summary-value">${{ formatPrice(totalSpent) }}</span>
          <span class="summary-label">Total spent</span>
        </div>
      </div>

      <section class="orders">
        <article
          v-for="order in orders"
          :key="order.id"
          class="card order-card"
          :class="{ expanded: expandedId === order.id }"
        >
          <header class="order-head" @click="toggleOrder(order.id)">
            <div class="order-head-main">
              <div class="order-id-row">
                <h3>Order #{{ order.id }}</h3>
                <span class="status" :class="statusClass(order.status)">
                  <span class="status-dot" aria-hidden="true"></span>
                  {{ order.status }}
                </span>
              </div>
              <p class="order-meta">
                <span>{{ formatDate(order.createdAt) }}</span>
                <span class="meta-sep" aria-hidden="true">·</span>
                <span>{{ orderItemCount(order) }} item{{ orderItemCount(order) === 1 ? '' : 's' }}</span>
              </p>
              <p class="muted order-address">{{ primaryAddress(order.deliveryAddress) }}</p>
            </div>
            <div class="order-head-right">
              <p class="total">${{ formatPrice(order.total) }}</p>
              <span class="chevron" :class="{ open: expandedId === order.id }" aria-hidden="true">▼</span>
            </div>
          </header>

          <div v-show="expandedId === order.id" class="order-body">
            <section class="detail-section">
              <header class="section-head">
                <span class="section-icon" aria-hidden="true">🚚</span>
                <h4>Delivery details</h4>
              </header>
              <dl class="detail-grid">
                <div>
                  <dt>Name</dt>
                  <dd>{{ order.customerName || '—' }}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{{ order.phone || '—' }}</dd>
                </div>
                <div class="detail-wide">
                  <dt>Address</dt>
                  <dd>{{ primaryAddress(order.deliveryAddress) }}</dd>
                </div>
                <div v-if="deliveryNotes(order.deliveryAddress)" class="detail-wide">
                  <dt>Delivery notes</dt>
                  <dd>{{ deliveryNotes(order.deliveryAddress) }}</dd>
                </div>
              </dl>
            </section>

            <section class="detail-section">
              <header class="section-head">
                <span class="section-icon" aria-hidden="true">🧾</span>
                <h4>Items ordered</h4>
              </header>

              <ul v-if="order.items?.length" class="item-list">
                <li v-for="item in order.items" :key="item.id" class="item-row">
                  <img
                    class="item-thumb"
                    :src="itemImage(item)"
                    :alt="item.productName"
                    loading="lazy"
                    decoding="async"
                    referrerpolicy="no-referrer"
                    @error="onImgError"
                  />
                  <div class="item-body">
                    <div class="item-top">
                      <strong>{{ item.productName }}</strong>
                      <span class="item-line-total">${{ formatPrice(item.lineTotal) }}</span>
                    </div>
                    <p class="muted item-qty">
                      {{ item.quantity }} × ${{ formatPrice(item.unitPrice) }}
                    </p>
                    <div v-if="hasCustomisation(item)" class="item-custom">
                      <p v-if="item.customIngredients?.length" class="custom-line">
                        <span class="custom-tag add">Add</span>
                        {{ item.customIngredients.join(', ') }}
                      </p>
                      <p v-if="item.removedIngredients?.length" class="custom-line">
                        <span class="custom-tag remove">Remove</span>
                        {{ item.removedIngredients.join(', ') }}
                      </p>
                      <p v-if="item.notes" class="custom-line">
                        <span class="custom-tag note">Notes</span>
                        {{ item.notes }}
                      </p>
                    </div>
                  </div>
                </li>
              </ul>
              <p v-else class="muted no-items">No line items recorded for this order.</p>
            </section>

            <div class="totals-block">
              <div class="total-row">
                <span class="muted">Subtotal (items)</span>
                <span>${{ formatPrice(orderSubtotal(order)) }}</span>
              </div>
              <div v-if="orderDiscount(order) > 0" class="total-row savings">
                <span>Promotion savings</span>
                <span>-${{ formatPrice(orderDiscount(order)) }}</span>
              </div>
              <div class="total-row grand">
                <span>Order total</span>
                <strong>${{ formatPrice(order.total) }}</strong>
              </div>
            </div>
          </div>
        </article>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import PageIntro from '../components/PageIntro.vue'
import { fetchMyOrders } from '../api/orders'
import { useCatalogStore } from '../stores/catalog'
import { foodImageFallbackUrl } from '../data/foodImageMap'

const catalog = useCatalogStore()
const orders = ref([])
const loading = ref(false)
const error = ref('')
const expandedId = ref(null)

const totalSpent = computed(() =>
  orders.value.reduce((sum, order) => sum + Number(order.total || 0), 0)
)

function formatPrice(value) {
  const num = Number(value)
  return Number.isFinite(num) ? num.toFixed(2) : '0.00'
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

function statusClass(status) {
  if (status === 'Delivered') return 'done'
  if (status === 'Cancelled') return 'cancelled'
  return 'pending'
}

function hasCustomisation(item) {
  return item.notes || item.customIngredients?.length || item.removedIngredients?.length
}

function orderItemCount(order) {
  return (order.items ?? []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
}

function orderSubtotal(order) {
  return (order.items ?? []).reduce((sum, item) => sum + (Number(item.lineTotal) || 0), 0)
}

function orderDiscount(order) {
  const subtotal = orderSubtotal(order)
  const total = Number(order.total) || 0
  const diff = subtotal - total
  return diff > 0.009 ? diff : 0
}

function primaryAddress(address) {
  const text = String(address ?? '').trim()
  if (!text) return '—'
  const split = text.split(/\n\nDelivery notes:/i)
  return split[0].trim() || '—'
}

function deliveryNotes(address) {
  const text = String(address ?? '')
  const match = text.match(/\n\nDelivery notes:\s*(.+)$/is)
  return match?.[1]?.trim() ?? ''
}

function itemImage(item) {
  const product = catalog.products.find((p) => p.id === item.productId)
  return product?.image || foodImageFallbackUrl
}

function onImgError(event) {
  event.target.src = foodImageFallbackUrl
}

function toggleOrder(id) {
  expandedId.value = expandedId.value === id ? null : id
}

onMounted(async () => {
  loading.value = true
  try {
    await catalog.fetchAll()
    const { data } = await fetchMyOrders()
    orders.value = Array.isArray(data) ? data : []
    if (orders.value.length) expandedId.value = orders.value[0].id
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load order history'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.history-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding: 0 1rem 2.5rem;
}

.history-intro {
  width: 100%;
}

.history-intro :deep(.section-title),
.history-intro :deep(.muted) {
  text-align: center;
}

.state-card {
  width: 100%;
  text-align: center;
  padding: 1.5rem;
}

.loading-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  color: var(--text-muted);
}

.loading-dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: var(--primary);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.empty-card {
  width: 100%;
  text-align: center;
  padding: 2.5rem 1.5rem;
  box-shadow: var(--shadow-card);
}

.empty-icon {
  display: block;
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.empty-card h2 {
  margin: 0 0 0.35rem;
  font-size: 1.35rem;
}

.empty-card p {
  margin: 0 0 1.25rem;
}

.history-summary {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1.1rem 1.35rem;
  background: linear-gradient(120deg, #fff9f2 0%, #ffffff 70%);
  box-shadow: var(--shadow-card);
}

.summary-stat {
  display: grid;
  gap: 0.15rem;
}

.summary-value {
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.summary-label {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.orders {
  width: 100%;
  display: grid;
  gap: 1rem;
}

.order-card {
  padding: 0;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.order-card.expanded {
  border-color: var(--line-strong);
}

.order-head {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  padding: 1.15rem 1.35rem;
  cursor: pointer;
  align-items: start;
  transition: background 0.15s ease;
}

.order-head:hover {
  background: #fafbfc;
}

.order-head-main {
  min-width: 0;
}

.order-id-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem 0.75rem;
  margin-bottom: 0.3rem;
}

.order-id-row h3 {
  margin: 0;
  font-size: 1.12rem;
  letter-spacing: -0.01em;
}

.order-meta {
  margin: 0;
  font-size: 0.88rem;
  color: var(--text-muted);
}

.meta-sep {
  margin: 0 0.35rem;
}

.order-address {
  margin: 0.4rem 0 0;
  font-size: 0.86rem;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.order-head-right {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.total {
  margin: 0;
  font-weight: 700;
  font-size: 1.15rem;
  color: var(--text);
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.28rem 0.65rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.status-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: currentColor;
}

.done {
  background: var(--success-soft);
  color: var(--success-text);
}

.pending {
  background: var(--primary-soft);
  color: #9a3412;
}

.cancelled {
  background: var(--danger-soft);
  color: var(--danger-text);
}

.chevron {
  font-size: 0.7rem;
  color: #9ca3af;
  transition: transform 0.2s ease;
}

.chevron.open {
  transform: rotate(180deg);
}

.order-body {
  padding: 0 1.35rem 1.35rem;
  border-top: 1px solid var(--line);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-section + .detail-section {
  margin-top: 1.15rem;
}

.section-head {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin: 1rem 0 0.75rem;
}

.section-icon {
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  font-size: 1rem;
  background: var(--primary-soft);
  border-radius: 10px;
}

.section-head h4 {
  margin: 0;
  font-size: 0.98rem;
  font-weight: 600;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem 1.25rem;
  margin: 0;
}

.detail-grid div {
  display: grid;
  gap: 0.15rem;
}

.detail-wide {
  grid-column: 1 / -1;
}

.detail-grid dt {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}

.detail-grid dd {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.45;
}

.item-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}

.item-row {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 0.85rem;
  align-items: start;
  padding: 0.85rem;
  background: var(--surface-alt);
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
}

.item-thumb {
  width: 64px;
  height: 56px;
  border-radius: 12px;
  object-fit: cover;
  background: var(--surface);
}

.item-body {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
}

.item-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.item-top strong {
  font-size: 0.95rem;
  line-height: 1.35;
}

.item-line-total {
  font-weight: 700;
  white-space: nowrap;
}

.item-qty {
  margin: 0;
  font-size: 0.86rem;
}

.item-custom {
  display: grid;
  gap: 0.3rem;
  margin-top: 0.15rem;
}

.custom-line {
  margin: 0;
  font-size: 0.84rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.custom-tag {
  display: inline-block;
  margin-right: 0.35rem;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  vertical-align: middle;
}

.custom-tag.add {
  background: var(--success-soft);
  color: var(--success-text);
}

.custom-tag.remove {
  background: var(--danger-soft);
  color: var(--danger-text);
}

.custom-tag.note {
  background: #eff6ff;
  color: #1d4ed8;
}

.no-items {
  margin: 0;
  font-size: 0.9rem;
}

.totals-block {
  margin-top: 1.15rem;
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
  padding-top: 0.55rem;
  border-top: 1px solid var(--line);
  font-size: 1.08rem;
}

@media (max-width: 640px) {
  .order-head {
    grid-template-columns: 1fr;
  }

  .order-head-right {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .history-summary {
    grid-template-columns: 1fr;
  }
}
</style>
