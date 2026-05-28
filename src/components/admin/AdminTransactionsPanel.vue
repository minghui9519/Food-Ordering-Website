<template>
  <section class="admin-panel">
    <div class="admin-card admin-table-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>#{{ order.id }}</td>
            <td>
              <strong>{{ order.customerName }}</strong>
              <span class="sub">{{ order.userEmail }}</span>
            </td>
            <td>{{ formatDate(order.createdAt) }}</td>
            <td>${{ order.total.toFixed(2) }}</td>
            <td>
              <select
                class="status-select"
                :value="order.status"
                @change="updateStatus(order.id, $event.target.value)"
              >
                <option value="Preparing">Preparing</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </td>
            <td>
              <button type="button" class="admin-btn admin-btn-ghost" @click="selectOrder(order)">
                View details
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!loading && !orders.length" class="empty">No transactions yet.</p>
    </div>

    <section v-if="selectedOrder" class="admin-card order-detail">
      <div class="detail-head">
        <h2>Order #{{ selectedOrder.id }}</h2>
        <button type="button" class="admin-btn admin-btn-ghost" @click="selectedOrder = null">Close</button>
      </div>
      <dl class="detail-meta">
        <div><dt>Customer</dt><dd>{{ selectedOrder.customerName }} ({{ selectedOrder.userEmail }})</dd></div>
        <div><dt>Phone</dt><dd>{{ selectedOrder.phone }}</dd></div>
        <div><dt>Address</dt><dd>{{ selectedOrder.deliveryAddress }}</dd></div>
        <div><dt>Placed</dt><dd>{{ formatDate(selectedOrder.createdAt) }}</dd></div>
        <div><dt>Status</dt><dd>{{ selectedOrder.status }}</dd></div>
        <div><dt>Total</dt><dd>${{ selectedOrder.total.toFixed(2) }}</dd></div>
      </dl>
      <h3>Line items</h3>
      <table class="admin-table items-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Line total</th>
            <th>Customisation</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in selectedOrder.items" :key="item.id">
            <td>{{ item.productName }}</td>
            <td>{{ item.quantity }}</td>
            <td>${{ item.unitPrice.toFixed(2) }}</td>
            <td>${{ item.lineTotal.toFixed(2) }}</td>
            <td class="custom-cell">
              <p v-if="item.customIngredients?.length"><strong>Add:</strong> {{ item.customIngredients.join(', ') }}</p>
              <p v-if="item.removedIngredients?.length"><strong>Remove:</strong> {{ item.removedIngredients.join(', ') }}</p>
              <p v-if="item.notes"><strong>Notes:</strong> {{ item.notes }}</p>
              <span v-if="!item.customIngredients?.length && !item.removedIngredients?.length && !item.notes" class="muted-inline">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { adminOrders } from '../../api/admin'

const orders = ref([])
const selectedOrder = ref(null)
const loading = ref(false)

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

async function loadOrders() {
  loading.value = true
  try {
    const { data } = await adminOrders.list()
    orders.value = data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

function selectOrder(order) {
  selectedOrder.value = order
}

async function updateStatus(id, status) {
  try {
    const { data } = await adminOrders.updateStatus(id, status)
    const index = orders.value.findIndex((o) => o.id === id)
    if (index >= 0) orders.value[index] = data
    if (selectedOrder.value?.id === id) selectedOrder.value = data
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to update status')
    await loadOrders()
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.sub {
  display: block;
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 400;
}

.status-select {
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 0.35rem 0.5rem;
  background: #0b1220;
  color: #e2e8f0;
  font-size: 0.85rem;
}

.empty {
  padding: 1rem;
  margin: 0;
  color: #94a3b8;
  font-size: 0.9rem;
}

.order-detail {
  margin-top: 0.25rem;
}

.detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.detail-head h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #f1f5f9;
}

.detail-meta {
  display: grid;
  gap: 0.65rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0 0 1.25rem;
}

.detail-meta dt {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.detail-meta dd {
  margin: 0.15rem 0 0;
  color: #f1f5f9;
}

.order-detail h3 {
  margin: 0 0 0.65rem;
  font-size: 0.95rem;
  color: #cbd5e1;
}

.custom-cell p {
  margin: 0 0 0.25rem;
  font-size: 0.82rem;
  color: #cbd5e1;
}

.muted-inline {
  color: #64748b;
}

@media (max-width: 768px) {
  .detail-meta {
    grid-template-columns: 1fr;
  }
}
</style>
