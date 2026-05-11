<template>
  <div class="account-page grid">
    <PageIntro
      title="My Account"
      description="View your personal details and manage your FoodyHub profile."
    />

    <section class="card account-card" v-if="auth.isLoggedIn">
      <p class="pill pill-success">Logged In</p>
      <h2 class="section-title">Personal Details</h2>
      <div class="details-grid">
        <div class="detail-item">
          <span class="muted label">Full Name</span>
          <strong>{{ auth.user.name }}</strong>
        </div>
        <div class="detail-item">
          <span class="muted label">Email</span>
          <strong>{{ auth.user.email }}</strong>
        </div>
        <div class="detail-item">
          <span class="muted label">User ID</span>
          <strong>#{{ auth.user.id }}</strong>
        </div>
      </div>
    </section>

    <section class="card account-card" v-else>
      <p class="pill pill-warm">Account Access Required</p>
      <h2 class="section-title">Please login or register first</h2>
      <p class="muted">
        You need to login/register before viewing your personal details.
      </p>
      <div class="cta-row">
        <RouterLink class="btn btn-primary" to="/login">Login</RouterLink>
        <RouterLink class="btn btn-secondary" to="/register">Register</RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import PageIntro from '../components/PageIntro.vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
</script>

<style scoped>
.account-page {
  gap: 1rem;
}

.account-card {
  width: min(720px, 100%);
  padding: 1.2rem;
}

.details-grid {
  display: grid;
  gap: 0.8rem;
  margin-top: 0.9rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.detail-item {
  display: grid;
  gap: 0.2rem;
  border: 1px solid #eceff3;
  border-radius: 12px;
  padding: 0.75rem 0.85rem;
  background: #fff;
}

.detail-item .label {
  font-size: 0.82rem;
}

.cta-row {
  margin-top: 0.9rem;
  display: flex;
  gap: 0.65rem;
}

@media (max-width: 640px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
