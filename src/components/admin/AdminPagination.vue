<template>
  <div class="admin-pagination-wrap">
    <p v-if="showMeta" class="admin-table-meta">
      {{ totalItems }} {{ label }}{{ totalItems === 1 ? '' : 's' }}
      <span v-if="totalItems"> · showing {{ rangeStart }}–{{ rangeEnd }}</span>
    </p>
    <nav
      v-if="totalPages > 1"
      class="admin-pagination"
      :aria-label="`${label} pages`"
    >
      <button
        type="button"
        class="admin-btn admin-btn-ghost"
        :disabled="currentPage <= 1"
        @click="emit('page-change', currentPage - 1)"
      >
        Previous
      </button>
      <button
        v-for="page in pageNumbers"
        :key="page"
        type="button"
        class="admin-btn admin-btn-ghost"
        :class="{ active: page === currentPage }"
        @click="emit('page-change', page)"
      >
        {{ page }}
      </button>
      <button
        type="button"
        class="admin-btn admin-btn-ghost"
        :disabled="currentPage >= totalPages"
        @click="emit('page-change', currentPage + 1)"
      >
        Next
      </button>
    </nav>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, default: 'item' },
  totalItems: { type: Number, default: 0 },
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  pageNumbers: { type: Array, required: true },
  rangeStart: { type: Number, default: 0 },
  rangeEnd: { type: Number, default: 0 },
  showMeta: { type: Boolean, default: true }
})

const emit = defineEmits(['page-change'])
</script>

<style scoped>
.admin-pagination-wrap {
  border-top: 1px solid #1e293b;
}

.admin-table-meta {
  margin: 0;
  padding: 0.5rem 1.15rem 0;
  font-size: 0.82rem;
  color: #94a3b8;
}

.admin-pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  padding: 0.85rem 1.15rem 1rem;
}

.admin-pagination :deep(.admin-btn.active) {
  background: #334155;
  color: #f8fafc;
  border-color: #475569;
}

.admin-pagination :deep(.admin-btn:disabled) {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
