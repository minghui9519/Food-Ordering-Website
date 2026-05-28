import { createRouter, createWebHistory } from 'vue-router'
import PublicLayout from '../layouts/PublicLayout.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import HomeView from '../views/HomeView.vue'
import MenuView from '../views/MenuView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import CartView from '../views/CartView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'
import HistoryView from '../views/HistoryView.vue'
import PromotionsView from '../views/PromotionsView.vue'
import AboutView from '../views/AboutView.vue'
import BlogView from '../views/BlogView.vue'
import FooterCuisineView from '../views/FooterCuisineView.vue'
import AccountView from '../views/AccountView.vue'
import AdminView from '../views/AdminView.vue'
import AdminLoginView from '../views/admin/AdminLoginView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: PublicLayout,
      meta: { customerSite: true },
      children: [
        { path: '', name: 'home', component: HomeView },
        { path: 'menu', name: 'menu', component: MenuView },
        { path: 'menu/:id', name: 'product-detail', component: ProductDetailView, props: true },
        { path: 'cart', name: 'cart', component: CartView },
        { path: 'checkout', name: 'checkout', component: CheckoutView, meta: { requiresCustomer: true } },
        { path: 'login', name: 'login', component: LoginView, meta: { guestOnly: true } },
        { path: 'register', name: 'register', component: RegisterView, meta: { guestOnly: true } },
        { path: 'dashboard', name: 'dashboard', component: DashboardView, meta: { requiresCustomer: true } },
        { path: 'history', name: 'history', component: HistoryView, meta: { requiresCustomer: true } },
        { path: 'promotions', name: 'promotions', component: PromotionsView },
        { path: 'footer-cuisines', name: 'footer-cuisines', component: FooterCuisineView },
        { path: 'about', name: 'about', component: AboutView },
        { path: 'blog', name: 'blog', component: BlogView },
        { path: 'account', name: 'account', component: AccountView, meta: { requiresCustomer: true } }
      ]
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: AdminLoginView,
      meta: { adminGuest: true }
    },
    {
      path: '/admin',
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

  if (to.meta.requiresAdmin) {
    if (!auth.isAdminLoggedIn) {
      return { name: 'admin-login', query: { redirect: to.fullPath } }
    }
  }

  if (to.meta.adminGuest) {
    if (auth.isAdminLoggedIn) {
      return { name: 'admin' }
    }
  }

  if (to.meta.guestOnly && auth.isCustomerLoggedIn) {
    return { name: 'dashboard' }
  }

  if (to.meta.requiresCustomer && !auth.isCustomerLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  return true
})

export default router
