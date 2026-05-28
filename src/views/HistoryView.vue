<template>
  <div class="history-page grid">
    <PageIntro title="Order History" description="Track your previous food orders and statuses." />

    <p v-if="loading" class="muted card">Loading your orders…</p>
    <p v-else-if="error" class="pill pill-warm card">{{ error }}</p>
    <p v-else-if="!orders.length" class="card muted">You have not placed any orders yet.</p>

    <section v-else class="orders">
      <article class="card order-card" v-for="order in orders" :key="order.id">
        <header class="order-head" @click="toggleOrder(order.id)">
          <div>
            <h3>Order #{{ order.id }}</h3>
            <p class="muted">{{ formatDate(order.createdAt) }}</p>
            <p class="muted delivery">{{ order.deliveryAddress }}</p>
          </div>
          <div class="order-head-right">
            <p class="total">${{ order.total.toFixed(2) }}</p>
            <span class="status" :class="statusClass(order.status)">{{ order.status }}</span>
            <span class="chevron" :class="{ open: expandedId === order.id }">▼</span>
          </div>
        </header>

        <div v-show="expandedId === order.id" class="order-body">
          <p class="muted meta-line"><strong>Phone:</strong> {{ order.phone }}</p>
          <h4>Items in this order</h4>
          <ul class="item-list">
            <li v-for="item in order.items" :key="item.id" class="item-row">
              <div class="item-main">
                <strong>{{ item.productName }}</strong>
                <span class="muted"> × {{ item.quantity }} @ ${{ item.unitPrice.toFixed(2) }}</span>
              </div>
              <span class="line-total">${{ item.lineTotal.toFixed(2) }}</span>
              <div v-if="hasCustomisation(item)" class="item-extra muted">
                <p v-if="item.customIngredients?.length">
                  <strong>Add:</strong> {{ item.customIngredients.join(', ') }}
                </p>
                <p v-if="item.removedIngredients?.length">
                  <strong>Remove:</strong> {{ item.removedIngredients.join(', ') }}
                </p>
                <p v-if="item.notes"><strong>Notes:</strong> {{ item.notes }}</p>
              </div>
            </li>
          </ul>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import PageIntro from '../components/PageIntro.vue'
import { fetchMyOrders } from '../api/orders'

const orders = ref([])
const loading = ref(false)
const error = ref('')
const expandedId = ref(null)

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function statusClass(status) {
  if (status === 'Delivered') return 'done'
  if (status === 'Cancelled') return 'cancelled'
  return 'pending'
}

function hasCustomisation(item) {
  return (
    item.notes ||
    item.customIngredients?.length ||
    item.removedIngredients?.length
  )
}

function toggleOrder(id) {
  expandedId.value = expandedId.value === id ? null : id
}

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await fetchMyOrders()
    orders.value = data
    if (data.length) expandedId.value = data[0].id
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load order history'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.history-page {
  gap: 1rem;
}

.orders {
  display: grid;
  gap: 0.85rem;
}

.order-card {
  padding: 0;
  overflow: hidden;
}

.order-head {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  padding: 1rem 1.1rem;
  cursor: pointer;
  align-items: start;
}

.order-head:hover {
  background: #fafbfc;
}

.order-head h3 {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
}

.order-head .delivery {
  margin: 0.35rem 0 0;
  font-size: 0.85rem;
}

.order-head-right {
  text-align: right;
  display: grid;
  gap: 0.35rem;
  justify-items: end;
}

.total {
  margin: 0;
  font-weight: 700;
  font-size: 1.05rem;
}

.status {
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.done {
  background: #ecfdf3;
  color: #166534;
}

.pending {
  background: #fff7ed;
  color: #9a3412;
}

.cancelled {
  background: #fef2f2;
  color: #991b1b;
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
  padding: 0 1.1rem 1.1rem;
  border-top: 1px solid #eceff3;
}

.order-body h4 {
  margin: 0.85rem 0 0.5rem;
  font-size: 0.95rem;
}

.meta-line {
  margin: 0.75rem 0 0;
  font-size: 0.88rem;
}

.item-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.65rem;
}

.item-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.25rem 1rem;
  padding: 0.65rem 0.75rem;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #eceff3;
}

.item-main {
  grid-column: 1;
}

.line-total {
  font-weight: 700;
  align-self: start;
}

.item-extra {
  grid-column: 1 / -1;
  font-size: 0.85rem;
}

.item-extra p {
  margin: 0.2rem 0 0;
}

@media (max-width: 700px) {
  .order-head {
    grid-template-columns: 1fr;
  }

  .order-head-right {
    text-align: left;
    justify-items: start;
    grid-template-columns: auto auto 1fr;
    align-items: center;
  }
}
</style>
