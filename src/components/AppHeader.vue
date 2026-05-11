<template>
  <header class="topbar">
    <div class="container">
      <RouterLink to="/" class="brand">FoodyHub</RouterLink>
      <!-- Navigation bar-->
      <nav class="nav-links">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/menu">Product</RouterLink>
        <RouterLink to="/promotions">Promotion</RouterLink>
        <RouterLink to="/history">History</RouterLink>
        <RouterLink to="/about">About Us</RouterLink>
        <RouterLink to="/blog">Blog</RouterLink>
      </nav>
      <div class="actions">
        <RouterLink class="cart-chip" to="/cart">
          Cart <strong>{{ cart.totalItems }}</strong>
        </RouterLink>
        <RouterLink v-if="!auth.isLoggedIn" class="btn btn-secondary" to="/login">Login</RouterLink>
        <RouterLink v-if="!auth.isLoggedIn" class="btn btn-primary" to="/register">Register</RouterLink>
        <RouterLink class="avatar-link" to="/account" aria-label="User account">
          <span class="avatar-icon" aria-hidden="true">👤</span>
        </RouterLink>
        <button v-if="auth.isLoggedIn" class="btn btn-secondary" @click="auth.logout">Logout</button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'

const cart = useCartStore()
const auth = useAuthStore()
</script>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  padding: 1rem 0 0.8rem;
  border-bottom: 1px solid #eceff3;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(6px);
}

.container {
  width: min(1140px, 94vw);
  margin: 0 auto;
  min-height: 58px;
  display: grid;
  gap: 2rem;
  align-items: center;
  grid-template-columns: auto 1fr auto;
}

.brand {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: 0.01em;
}

.nav-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.9rem;
  font-weight: 500;
}

.nav-links a {
  color: #4b5563;
}

.nav-links a.router-link-active {
  color: #ea6900;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 0.7rem;
  justify-content: end;
  align-items: center;
}

.cart-chip {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  padding: 0.45rem 0.7rem;
  font-size: 0.84rem;
  background: #fff;
}

.avatar-link {
  width: 2.2rem;
  height: 2.2rem;
  border: 1px solid #d7dde8;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.avatar-link:hover {
  background: #f5f8ff;
}

.avatar-icon {
  font-size: 1rem;
  line-height: 1;
}

@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .nav-links,
  .actions {
    justify-content: center;
  }
}
</style>
