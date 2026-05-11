<template>
  <div class="dashboard grid">
    <section class="card intro">
      <p class="pill pill-warm">Dashboard</p>
      <h1 class="section-title">Welcome to your ordering control center.</h1>
      <p class="muted">
        Track recent activity, access offers, and jump to your next order quickly.
      </p>
      <div class="quick-actions">
        <RouterLink class="btn btn-primary" to="/menu">Order Again</RouterLink>
        <RouterLink class="btn btn-secondary" to="/history">View History</RouterLink>
      </div>
    </section>

    <section class="card profile" v-if="auth.isLoggedIn">
      <h3>Hello, {{ auth.user.name }}</h3>
      <p class="muted">Signed in as {{ auth.user.email }}</p>
      <div class="actions">
        <RouterLink class="btn btn-secondary" to="/promotions">Current Promotions</RouterLink>
        <RouterLink class="btn btn-secondary" to="/about">About FoodyHub</RouterLink>
      </div>
    </section>

    <section class="card profile" v-else>
      <h3>Guest mode active</h3>
      <p class="muted">Log in to save addresses, payment preferences, and order history.</p>
      <RouterLink class="btn btn-primary" to="/login">Go to Login</RouterLink>
    </section>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
</script>

<style scoped>
.dashboard {
  gap: 1rem;
}

.intro {
  padding: 1.2rem;
}

.quick-actions,
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 0.8rem;
}
</style>
