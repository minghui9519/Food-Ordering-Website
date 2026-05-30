import { createRouter, createWebHashHistory } from 'vue-router'
import AdminLayout from './layouts/AdminLayout.vue'
import AdminView from './views/AdminView.vue'
import AdminLoginView from './views/admin/AdminLoginView.vue'
import { useAuthStore } from './stores/auth'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/login',
      name: 'admin-login',
      component: AdminLoginView,
      meta: { adminGuest: true }
    },
    {
      path: '/',
      component: AdminLayout,
      meta: { requiresAdmin: true },
      children: [{ path: '', name: 'admin', component: AdminView }]
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.initialized) {
    await auth.init()
  }

  if (to.meta.requiresAdmin && !auth.isAdminLoggedIn) {
    return { name: 'admin-login', query: { redirect: to.fullPath } }
  }

  if (to.meta.adminGuest && auth.isAdminLoggedIn) {
    return { name: 'admin' }
  }

  return true
})

export default router
