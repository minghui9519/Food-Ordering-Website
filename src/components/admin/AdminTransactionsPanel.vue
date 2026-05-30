<template>
  <section class="admin-panel">
    <div class="admin-card admin-table-card">
      <div class="admin-table-toolbar">
        <h2>Transaction list</h2>
      </div>
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
          <tr v-if="loading">
            <td colspan="6" class="admin-empty">Loading transactions…</td>
          </tr>
          <tr v-else-if="!paginatedOrders.length">
            <td colspan="6" class="admin-empty">No transactions yet.</td>
          </tr>
          <tr v-for="order in paginatedOrders" :key="order.id">
            <td>#{{ order.id }}</td>
            <td>
              <strong>{{ order.customerName }}</strong>
              <span class="sub">{{ order.userEmail }}</span>
            </td>
            <td>{{ formatDate(order.createdAt) }}</td>
            <td>${{ formatAdminPrice(order.total) }}</td>
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
              <button type="button" class="admin-btn admin-btn-ghost" @click="openOrderDetail(order)">
                View details
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <AdminPagination
        label="order"
        :total-items="orderTotalItems"
        :current-page="orderCurrentPage"
        :total-pages="orderTotalPages"
        :page-numbers="orderPageNumbers"
        :range-start="orderRangeStart"
        :range-end="orderRangeEnd"
        @page-change="goToOrderPage"
      />
    </div>

    <AdminModal
      :open="orderDetailOpen"
      :title="selectedOrder ? `Order #${selectedOrder.id}` : 'Order details'"
      @close="closeOrderDetail"
    >
      <template v-if="selectedOrder">
        <dl class="detail-meta">
          <div><dt>Customer</dt><dd>{{ selectedOrder.customerName }} ({{ selectedOrder.userEmail }})</dd></div>
          <div><dt>Phone</dt><dd>{{ selectedOrder.phone }}</dd></div>
          <div><dt>Address</dt><dd>{{ selectedOrder.deliveryAddress }}</dd></div>
          <div><dt>Placed</dt><dd>{{ formatDate(selectedOrder.createdAt) }}</dd></div>
          <div><dt>Status</dt><dd>{{ selectedOrder.status }}</dd></div>
          <div><dt>Total</dt><dd>${{ formatAdminPrice(selectedOrder.total) }}</dd></div>
        </dl>
        <h3 class="items-title">Line items</h3>
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
              <td>${{ formatAdminPrice(item.unitPrice) }}</td>
              <td>${{ formatAdminPrice(item.lineTotal) }}</td>
              <td class="custom-cell">
                <p v-if="item.customIngredients?.length"><strong>Add:</strong> {{ item.customIngredients.join(', ') }}</p>
                <p v-if="item.removedIngredients?.length"><strong>Remove:</strong> {{ item.removedIngredients.join(', ') }}</p>
                <p v-if="item.notes"><strong>Notes:</strong> {{ item.notes }}</p>
                <span v-if="!item.customIngredients?.length && !item.removedIngredients?.length && !item.notes" class="muted-inline">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
      <div class="modal-actions">
        <button type="button" class="admin-btn admin-btn-ghost" @click="closeOrderDetail">Close</button>
      </div>
    </AdminModal>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { adminOrders } from '../../api/admin'
import AdminModal from './AdminModal.vue'
import AdminPagination from './AdminPagination.vue'
import { formatAdminPrice, useAdminPagination } from '../../composables/useAdminPagination'

const orders = ref([])
const selectedOrder = ref(null)
const orderDetailOpen = ref(false)
const loading = ref(false)

const {
  paginatedItems: paginatedOrders,
  totalItems: orderTotalItems,
  currentPage: orderCurrentPage,
  totalPages: orderTotalPages,
  pageNumbers: orderPageNumbers,
  rangeStart: orderRangeStart,
  rangeEnd: orderRangeEnd,
  goToPage: goToOrderPage,
  resetPage: resetOrderPage
} = useAdminPagination(orders)

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function openOrderDetail(order) {
  selectedOrder.value = order
  orderDetailOpen.value = true
}

function closeOrderDetail() {
  orderDetailOpen.value = false
  selectedOrder.value = null
}

async function loadOrders() {
  loading.value = true
  try {
    const { data } = await adminOrders.list()
    orders.value = data ?? []
    resetOrderPage()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
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

onUnmounted(() => {
  closeOrderDetail()
})
</script>

<style scoped>
.admin-table-toolbar {
  padding: 1rem 1.15rem 0;
}

.admin-table-toolbar h2 {
  margin: 0;
  font-size: 1.05rem;
  color: #f1f5f9;
}

.admin-empty {
  text-align: center;
  color: #94a3b8;
  padding: 1.25rem !important;
}

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

.items-title {
  margin: 0 0 0.65rem;
  font-size: 0.95rem;
  color: #cbd5e1;
}

.items-table {
  margin-bottom: 1rem;
}

.custom-cell p {
  margin: 0 0 0.25rem;
  font-size: 0.82rem;
  color: #cbd5e1;
}

.muted-inline {
  color: #64748b;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .detail-meta {
    grid-template-columns: 1fr;
  }
}
</style>
