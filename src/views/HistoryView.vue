<template>
  <div class="history-page grid">
    <PageIntro title="Order History" description="Track your previous food orders and statuses." />
    <section class="card orders">
      <article class="order" v-for="order in orders" :key="order.id">
        <div>
          <h3>Order #{{ order.id }}</h3>
          <p class="muted">{{ order.date }}</p>
        </div>
        <p class="total">${{ order.total.toFixed(2) }}</p>
        <span class="status" :class="order.status === 'Delivered' ? 'done' : 'pending'">
          {{ order.status }}
        </span>
      </article>
    </section>
  </div>
</template>

<script setup>
import PageIntro from '../components/PageIntro.vue'

const orders = [
  { id: 1012, date: '2026-04-17', total: 26.4, status: 'Delivered' },
  { id: 1028, date: '2026-04-20', total: 19.9, status: 'Delivered' },
  { id: 1035, date: '2026-04-22', total: 31.2, status: 'Preparing' }
]
</script>

<style scoped>
.history-page {
  gap: 1rem;
}

.orders {
  display: grid;
  gap: 0.7rem;
}

.order {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eceff3;
  align-items: center;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.total {
  margin: 0;
  font-weight: 700;
}

.done {
  background: #ecfdf3;
  color: #166534;
}

.pending {
  background: #fff7ed;
  color: #9a3412;
}

@media (max-width: 700px) {
  .order {
    grid-template-columns: 1fr;
    gap: 0.4rem;
  }
}
</style>
