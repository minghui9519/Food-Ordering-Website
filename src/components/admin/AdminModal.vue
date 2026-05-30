<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="admin-modal-backdrop"
      @click.self="emit('close')"
    >
      <div
        class="admin-modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <header class="admin-modal-head">
          <h2 :id="titleId">{{ title }}</h2>
          <button
            type="button"
            class="admin-modal-close"
            aria-label="Close"
            @click="emit('close')"
          >
            ×
          </button>
        </header>
        <div class="admin-modal-body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useId } from 'vue'

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true }
})

const emit = defineEmits(['close'])
const titleId = useId()
</script>

<style scoped>
.admin-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(2, 6, 23, 0.72);
  backdrop-filter: blur(4px);
}

.admin-modal {
  width: min(640px, 100%);
  max-height: min(90vh, 900px);
  overflow: auto;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 14px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.45);
}

.admin-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.15rem;
  border-bottom: 1px solid #1e293b;
  position: sticky;
  top: 0;
  background: #0f172a;
  z-index: 1;
}

.admin-modal-head h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #f8fafc;
}

.admin-modal-close {
  border: none;
  background: #1e293b;
  color: #e2e8f0;
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
}

.admin-modal-close:hover {
  background: #334155;
}

.admin-modal-body {
  padding: 1.15rem;
}
</style>
