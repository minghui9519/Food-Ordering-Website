<template>
  <AuthPageShell
    eyebrow="Join FoodyHub"
    title="Create your account"
    description="Save your details for faster checkout and track every order."
    panel-title="Registration"
    panel-sub="All fields marked with * are required"
    icon="✨"
  >
    <form class="auth-form" @submit.prevent="register">
      <label class="field">
        <span class="field-label">Full name *</span>
        <input
          v-model="form.name"
          type="text"
          required
          autocomplete="name"
          placeholder="Your name"
        />
      </label>

      <label class="field">
        <span class="field-label">Email address *</span>
        <input
          v-model="form.email"
          type="email"
          required
          autocomplete="email"
          placeholder="you@example.com"
        />
      </label>

      <div class="field-row">
        <label class="field">
          <span class="field-label">Phone</span>
          <input
            v-model="form.phone"
            type="tel"
            autocomplete="tel"
            placeholder="+60 12-345 6789"
          />
        </label>

        <label class="field">
          <span class="field-label">Delivery address</span>
          <input
            v-model="form.address"
            type="text"
            autocomplete="street-address"
            placeholder="Street, unit, city"
          />
        </label>
      </div>

      <div class="field-row">
        <label class="field">
          <span class="field-label">Password *</span>
          <input
            v-model="form.password"
            type="password"
            required
            autocomplete="new-password"
            placeholder="At least 6 characters"
            minlength="6"
          />
        </label>

        <label class="field">
          <span class="field-label">Confirm password *</span>
          <input
            v-model="confirmPassword"
            type="password"
            required
            autocomplete="new-password"
            placeholder="Re-enter your password"
            minlength="6"
            :class="{ 'input-invalid': confirmTouched && !passwordsMatch }"
            @blur="confirmTouched = true"
          />
          <span v-if="confirmTouched && !passwordsMatch" class="field-error">
            Passwords do not match
          </span>
        </label>
      </div>

      <p v-if="error" class="pill pill-warm form-alert">{{ error }}</p>
      <p v-if="notice" class="pill pill-success form-alert">{{ notice }}</p>

      <button
        class="btn btn-primary submit-btn"
        type="submit"
        :disabled="submitting || !passwordsMatch"
      >
        {{ submitting ? 'Creating account…' : 'Create account' }}
      </button>
    </form>

    <template #footer>
      <p>
        Already have an account?
        <RouterLink to="/login">Sign in instead</RouterLink>
      </p>
      <p class="admin-link">
        Administrator?
        <a href="/admin.html">Open admin portal</a>
      </p>
    </template>
  </AuthPageShell>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import AuthPageShell from '../components/AuthPageShell.vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const notice = ref('')
const error = ref('')
const submitting = ref(false)
const confirmPassword = ref('')
const confirmTouched = ref(false)
const form = reactive({
  name: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  role: 'customer'
})

const passwordsMatch = computed(() => form.password === confirmPassword.value)

async function register() {
  confirmTouched.value = true
  if (!passwordsMatch.value) {
    error.value = 'Passwords do not match'
    return
  }

  submitting.value = true
  error.value = ''
  notice.value = ''
  try {
    const user = await auth.register({ ...form })
    notice.value = `Welcome, ${user.name}! Redirecting…`
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed'
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

.field-row {
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

.field-error {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--danger-text);
}

.input-invalid {
  border-color: #fca5a5;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
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

.admin-link {
  margin: 0.65rem 0 0;
  font-size: 0.88rem;
}

.admin-link a {
  color: #2563eb;
  font-weight: 600;
}

@media (min-width: 640px) {
  .field-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
