import { createRouter, createWebHistory } from 'vue-router'
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

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/menu', name: 'menu', component: MenuView },
    { path: '/menu/:id', name: 'product-detail', component: ProductDetailView, props: true },
    { path: '/cart', name: 'cart', component: CartView },
    { path: '/checkout', name: 'checkout', component: CheckoutView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/dashboard', name: 'dashboard', component: DashboardView },
    { path: '/history', name: 'history', component: HistoryView },
    { path: '/promotions', name: 'promotions', component: PromotionsView },
    { path: '/footer-cuisines', name: 'footer-cuisines', component: FooterCuisineView },
    { path: '/about', name: 'about', component: AboutView },
    { path: '/blog', name: 'blog', component: BlogView },
    { path: '/account', name: 'account', component: AccountView }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
