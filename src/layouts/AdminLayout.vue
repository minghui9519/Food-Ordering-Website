<template>
  <div class="admin-shell">
    <header class="admin-topbar">
      <div class="admin-topbar-inner">
        <div class="admin-brand">
          <span class="admin-brand-mark">FH</span>
          <div>
            <strong>FoodyHub</strong>
            <span class="admin-brand-sub">Administration</span>
          </div>
        </div>
        <div class="admin-topbar-actions">
          <span class="admin-user-chip">{{ auth.adminUser?.name }}</span>
          <button type="button" class="admin-btn admin-btn-ghost" @click="logout">Sign out admin</button>
        </div>
      </div>
    </header>
    <div class="admin-body">
      <aside class="admin-sidebar">
        <p class="admin-sidebar-label">Manage</p>
        <nav class="admin-nav">
          <button
            v-for="item in navItems"
            :key="item.id"
            type="button"
            class="admin-nav-item"
            :class="{ active: activeTab === item.id }"
            @click="setTab(item.id)"
          >
            <span class="admin-nav-icon" aria-hidden="true">{{ item.icon }}</span>
            {{ item.label }}
          </button>
        </nav>
      </aside>
      <main class="admin-main">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, provide, ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const navItems = [
  { id: 'products', label: 'Products', icon: '🍽' },
  { id: 'promotions', label: 'Promotions', icon: '🏷' },
  { id: 'blogs', label: 'Blog posts', icon: '📝' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'transactions', label: 'Transactions', icon: '💳' }
]

const activeTab = ref(route.query.tab || 'products')

watch(
  () => route.query.tab,
  (tab) => {
    if (typeof tab === 'string' && navItems.some((n) => n.id === tab)) {
      activeTab.value = tab
    }
  }
)

function setTab(tabId) {
  activeTab.value = tabId
  router.replace({ name: 'admin', query: { tab: tabId } })
}

provide('adminTab', activeTab)

function logout() {
  auth.logoutAdmin()
  router.push({ name: 'admin-login' })
}

onMounted(() => {
  document.documentElement.classList.add('admin-mode')
})

onUnmounted(() => {
  document.documentElement.classList.remove('admin-mode')
})
</script>

<style scoped>
.admin-shell {
  min-height: 100vh;
  background: #0b1220;
  color: #e2e8f0;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.admin-topbar {
  border-bottom: 1px solid #1e293b;
  background: #0f172a;
  position: sticky;
  top: 0;
  z-index: 40;
}

.admin-topbar-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.85rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.admin-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.admin-brand-mark {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 0.85rem;
  color: #fff;
}

.admin-brand strong {
  display: block;
  font-size: 1rem;
  line-height: 1.2;
}

.admin-brand-sub {
  display: block;
  font-size: 0.72rem;
  color: #94a3b8;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.admin-topbar-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.admin-user-chip {
  font-size: 0.85rem;
  color: #94a3b8;
  padding: 0.35rem 0.65rem;
  border: 1px solid #334155;
  border-radius: 999px;
}

.admin-link-btn {
  font-size: 0.85rem;
  color: #93c5fd;
  padding: 0.4rem 0.7rem;
}

.admin-link-btn:hover {
  color: #bfdbfe;
}

.admin-body {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 0;
  min-height: calc(100vh - 65px);
}

.admin-sidebar {
  border-right: 1px solid #1e293b;
  padding: 1.25rem 0.75rem;
  background: #0f172a;
}

.admin-sidebar-label {
  margin: 0 0 0.65rem 0.65rem;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
}

.admin-nav {
  display: grid;
  gap: 0.25rem;
}

.admin-nav-item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  color: #cbd5e1;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
}

.admin-nav-item:hover {
  background: #1e293b;
  color: #f8fafc;
}

.admin-nav-item.active {
  background: #1d4ed8;
  color: #fff;
}

.admin-nav-icon {
  font-size: 1rem;
  line-height: 1;
}

.admin-main {
  padding: 1.25rem;
  background: #0b1220;
}

@media (max-width: 900px) {
  .admin-body {
    grid-template-columns: 1fr;
  }

  .admin-sidebar {
    border-right: none;
    border-bottom: 1px solid #1e293b;
  }

  .admin-nav {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

<style>
/* Admin-only global overrides (no orange consumer theme) */
html.admin-mode {
  background: #0b1220;
}

html.admin-mode body {
  background: #0b1220;
  margin: 0;
}

html.admin-mode #app {
  background: transparent;
  border: none;
  border-radius: 0;
  min-height: 100vh;
}

html.admin-mode .admin-btn {
  border: none;
  border-radius: 8px;
  padding: 0.5rem 0.9rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

html.admin-mode .admin-btn-primary {
  background: #2563eb;
  color: #fff;
}

html.admin-mode .admin-btn-primary:hover {
  background: #1d4ed8;
}

html.admin-mode .admin-btn-ghost {
  background: #1e293b;
  color: #e2e8f0;
}

html.admin-mode .admin-btn-ghost:hover {
  background: #334155;
}

html.admin-mode .admin-btn-danger {
  background: #7f1d1d;
  color: #fecaca;
}

html.admin-mode .admin-btn-danger:hover {
  background: #991b1b;
}

html.admin-mode .admin-card {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 12px;
}

html.admin-mode .admin-table-card {
  padding: 0;
  overflow: hidden;
}

html.admin-mode .admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

html.admin-mode .admin-table th {
  text-align: left;
  padding: 0.65rem 0.85rem;
  background: #1e293b;
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

html.admin-mode .admin-table td {
  padding: 0.65rem 0.85rem;
  border-top: 1px solid #1e293b;
  color: #e2e8f0;
}
</style>
