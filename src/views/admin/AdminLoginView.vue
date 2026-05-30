<template>
  <div class="admin-auth">
    <div class="admin-auth-card">
      <div class="admin-auth-brand">
        <span class="mark">FH</span>
        <h1>Admin Portal</h1>
        <p>Sign in to manage products, promotions, blog posts, and users.</p>
      </div>
      <form class="admin-auth-form" @submit.prevent="onLogin">
        <label>
          <span>Email</span>
          <input v-model="email" type="email" required autocomplete="username" />
        </label>
        <label>
          <span>Password</span>
          <input v-model="password" type="password" required autocomplete="current-password" />
        </label>
        <p v-if="auth.isCustomerLoggedIn" class="admin-auth-notice">
          Customer session active ({{ auth.customerUser.email }}). You can stay signed in on the storefront while using a separate admin account.
        </p>
        <p v-if="auth.isAdminLoggedIn" class="admin-auth-notice">
          Already signed in as admin ({{ auth.adminUser.email }}).
          <RouterLink :to="{ name: 'admin' }">Go to admin console</RouterLink>
        </p>
        <p v-if="error" class="admin-auth-error">{{ error }}</p>
        <button class="admin-submit" type="submit" :disabled="submitting">
          {{ submitting ? 'Signing in…' : 'Sign in to admin' }}
        </button>
      </form>
      <p class="admin-auth-footer">
        Customer?
        <a href="/login">Go to customer login</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function onLogin() {
  submitting.value = true
  error.value = ''
  try {
    await auth.login({
      email: email.value,
      password: password.value,
      role: 'admin'
    })
    const redirect = route.query.redirect
    if (typeof redirect === 'string' && redirect.startsWith('/admin')) {
      router.push({ name: 'admin' })
    } else if (typeof redirect === 'string' && redirect.startsWith('/')) {
      router.push(redirect)
    } else {
      router.push({ name: 'admin' })
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  document.documentElement.classList.add('admin-mode')
})

onUnmounted(() => {
  document.documentElement.classList.remove('admin-mode')
})
</script>

<style scoped>
.admin-auth {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: radial-gradient(circle at top, #1e3a5f 0%, #0b1220 55%);
  color: #e2e8f0;
}

.admin-auth-card {
  width: min(420px, 100%);
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
}

.admin-auth-brand {
  text-align: center;
  margin-bottom: 1.5rem;
}

.mark {
  display: inline-grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  font-weight: 800;
  margin-bottom: 0.75rem;
}

.admin-auth-brand h1 {
  margin: 0 0 0.35rem;
  font-size: 1.45rem;
}

.admin-auth-brand p {
  margin: 0;
  font-size: 0.9rem;
  color: #94a3b8;
}

.admin-auth-form {
  display: grid;
  gap: 1rem;
}

.admin-auth-form label {
  display: grid;
  gap: 0.35rem;
}

.admin-auth-form span {
  font-size: 0.8rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.admin-auth-form input {
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 0.65rem 0.75rem;
  background: #0b1220;
  color: #f8fafc;
  font-size: 0.95rem;
}

.admin-auth-form input:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 1px;
}

.admin-auth-notice {
  margin: 0;
  padding: 0.55rem 0.7rem;
  border-radius: 8px;
  background: #1e3a5f;
  color: #bfdbfe;
  font-size: 0.85rem;
}

.admin-auth-error {
  margin: 0;
  padding: 0.55rem 0.7rem;
  border-radius: 8px;
  background: #450a0a;
  color: #fecaca;
  font-size: 0.85rem;
}

.admin-submit {
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1rem;
  background: #2563eb;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.admin-submit:hover:not(:disabled) {
  background: #1d4ed8;
}

.admin-submit:disabled {
  opacity: 0.7;
  cursor: wait;
}

.admin-auth-footer {
  margin: 1.25rem 0 0;
  text-align: center;
  font-size: 0.85rem;
  color: #94a3b8;
}

.admin-auth-footer a {
  color: #93c5fd;
  margin-left: 0.25rem;
}
</style>
