<template>
  <div class="auth-page grid">
    <PageIntro title="Login" description="Sign in to access your dashboard and order history." />
    <section class="card auth-card">
      <form class="grid form" @submit.prevent="onLogin">
        <label>
          Email
          <input v-model="email" type="email" required />
        </label>
        <label>
          Password
          <input v-model="password" type="password" required />
        </label>
        <p v-if="error" class="pill pill-warm">{{ error }}</p>
        <button class="btn btn-primary" type="submit" :disabled="submitting">Login</button>
      </form>
      <p class="pill pill-success" v-if="auth.isCustomerLoggedIn">
        Logged in as {{ auth.customerUser.email }}
      </p>
      <p class="auth-admin-link muted" v-if="auth.isAdminLoggedIn">
        Admin session: {{ auth.adminUser.email }} —
        <RouterLink to="/admin">Open admin console</RouterLink>
      </p>
      <p class="auth-admin-link muted">
        Administrator?
        <RouterLink to="/admin/login">Sign in to admin portal</RouterLink>
      </p>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import PageIntro from '../components/PageIntro.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function onLogin() {
  if (!email.value || !password.value) return
  submitting.value = true
  error.value = ''
  try {
    await auth.login({
      email: email.value,
      password: password.value,
      role: 'customer'
    })
    password.value = ''
    const redirect = route.query.redirect
    if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('/admin')) {
      router.push(redirect)
    } else {
      router.push('/dashboard')
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.auth-page {
  gap: 1rem;
}

.auth-card {
  width: min(520px, 100%);
  padding: 1.2rem;
}

.form {
  gap: 0.8rem;
}

.auth-admin-link {
  margin: 0.85rem 0 0;
  font-size: 0.88rem;
}

.auth-admin-link a {
  color: #2563eb;
  font-weight: 600;
  margin-left: 0.25rem;
}
</style>
