<template>
  <AuthPageShell
    eyebrow="Welcome back"
    title="Sign in to FoodyHub"
    description="Access your dashboard, saved details, and order history."
    panel-title="Customer login"
    panel-sub="Use the email and password from your account"
    icon="👋"
  >
    <form class="auth-form" @submit.prevent="onLogin">
      <label class="field">
        <span class="field-label">Email address</span>
        <input
          v-model="email"
          type="email"
          required
          autocomplete="email"
          placeholder="you@example.com"
        />
      </label>

      <label class="field">
        <span class="field-label">Password</span>
        <input
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          placeholder="Enter your password"
        />
      </label>

      <p v-if="error" class="pill pill-warm form-alert">{{ error }}</p>

      <button class="btn btn-primary submit-btn" type="submit" :disabled="submitting">
        {{ submitting ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>

    <p v-if="auth.isCustomerLoggedIn" class="status-banner pill pill-success">
      Signed in as {{ auth.customerUser.email }}
    </p>

    <p v-if="auth.isAdminLoggedIn" class="status-note muted">
      Admin session active ({{ auth.adminUser.email }}).
      <a href="/admin.html">Open admin console</a>
    </p>

    <template #footer>
      <p>
        New to FoodyHub?
        <RouterLink to="/register">Create an account</RouterLink>
      </p>
      <p class="admin-link">
        Administrator?
        <a href="/admin.html">Open admin portal</a>
      </p>
    </template>
  </AuthPageShell>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AuthPageShell from '../components/AuthPageShell.vue'

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
.auth-form {
  display: grid;
  gap: 1rem;
}

.field {
  display: grid;
  gap: 0.35rem;
}

.field-label {
  font-weight: 600;
  font-size: 0.95rem;
}

.form-alert {
  margin: 0;
  justify-content: center;
  width: 100%;
}

.submit-btn {
  width: 100%;
  padding: 0.85rem 1.25rem;
  font-size: 1rem;
  margin-top: 0.15rem;
}

.status-banner {
  margin: 1rem 0 0;
  justify-content: center;
  width: 100%;
}

.status-note {
  margin: 0.85rem 0 0;
  font-size: 0.88rem;
  text-align: center;
}

.status-note a {
  color: #2563eb;
  font-weight: 600;
}

.admin-link {
  margin: 0.65rem 0 0;
  font-size: 0.88rem;
}

.admin-link a {
  color: #2563eb;
}
</style>
