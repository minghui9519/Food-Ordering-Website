<template>
  <div class="auth-page grid">
    <PageIntro title="Register" description="Create a customer account for faster ordering." />
    <section class="card auth-card">
      <form class="grid form" @submit.prevent="register">
        <label>
          Name
          <input v-model="form.name" required />
        </label>
        <label>
          Email
          <input v-model="form.email" type="email" required />
        </label>
        <label>
          Phone
          <input v-model="form.phone" type="tel" />
        </label>
        <label>
          Address
          <input v-model="form.address" />
        </label>
        <label>
          Password
          <input v-model="form.password" type="password" required />
        </label>
        <p v-if="error" class="pill pill-warm">{{ error }}</p>
        <button class="btn btn-primary" type="submit" :disabled="submitting">Create Account</button>
      </form>
      <p class="pill pill-success" v-if="notice">{{ notice }}</p>
      <p class="auth-admin-link muted">
        Need an admin account?
        <RouterLink to="/admin/login">Admin portal</RouterLink>
      </p>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import PageIntro from '../components/PageIntro.vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const notice = ref('')
const error = ref('')
const submitting = ref(false)
const form = reactive({
  name: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  role: 'customer'
})

async function register() {
  submitting.value = true
  error.value = ''
  notice.value = ''
  try {
    const user = await auth.register({ ...form })
    notice.value = `Account created for ${user.name}.`
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed'
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
  width: min(560px, 100%);
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
