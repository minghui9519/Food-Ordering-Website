<template>
  <AuthPageShell
    :eyebrow="auth.isLoggedIn ? 'Your profile' : 'Account access'"
    :title="auth.isLoggedIn ? `Hello, ${auth.user.name}` : 'My Account'"
    :description="
      auth.isLoggedIn
        ? 'View and update your personal details for a smoother ordering experience.'
        : 'Sign in or create an account to manage your FoodyHub profile.'
    "
    panel-title="Personal details"
    :panel-sub="auth.isLoggedIn ? `Signed in as ${auth.user.email}` : 'Login required'"
    :icon="auth.isLoggedIn ? '👤' : '🔒'"
    wide
  >
    <template v-if="auth.isLoggedIn">
      <div class="profile-banner">
        <div class="avatar" aria-hidden="true">{{ initials }}</div>
        <div class="profile-meta">
          <p class="pill pill-success">Active account</p>
          <p class="muted profile-role">Customer · ID #{{ auth.user.id }}</p>
        </div>
      </div>

      <div v-if="!editing" class="details-grid">
        <div class="detail-card">
          <span class="detail-icon" aria-hidden="true">🪪</span>
          <div>
            <span class="muted detail-label">Full name</span>
            <strong>{{ auth.user.name }}</strong>
          </div>
        </div>
        <div class="detail-card">
          <span class="detail-icon" aria-hidden="true">✉️</span>
          <div>
            <span class="muted detail-label">Email</span>
            <strong>{{ auth.user.email }}</strong>
          </div>
        </div>
        <div class="detail-card">
          <span class="detail-icon" aria-hidden="true">📱</span>
          <div>
            <span class="muted detail-label">Phone</span>
            <strong>{{ auth.user.phone || 'Not set' }}</strong>
          </div>
        </div>
        <div class="detail-card detail-card--wide">
          <span class="detail-icon" aria-hidden="true">📍</span>
          <div>
            <span class="muted detail-label">Delivery address</span>
            <strong>{{ auth.user.address || 'Not set' }}</strong>
          </div>
        </div>
      </div>

      <form v-else class="edit-form" @submit.prevent="saveProfile">
        <div class="field-row">
          <label class="field">
            <span class="field-label">Full name</span>
            <input v-model="profileForm.name" type="text" required autocomplete="name" />
          </label>
          <label class="field">
            <span class="field-label">Phone</span>
            <input v-model="profileForm.phone" type="tel" autocomplete="tel" />
          </label>
        </div>

        <label class="field">
          <span class="field-label">Delivery address</span>
          <input v-model="profileForm.address" type="text" autocomplete="street-address" />
        </label>

        <div class="password-section">
          <p class="section-hint muted">Leave blank to keep your current password.</p>
          <div class="field-row">
            <label class="field">
              <span class="field-label">New password</span>
              <input
                v-model="profileForm.password"
                type="password"
                autocomplete="new-password"
                placeholder="Optional"
              />
            </label>
            <label class="field">
              <span class="field-label">Confirm new password</span>
              <input
                v-model="confirmPassword"
                type="password"
                autocomplete="new-password"
                placeholder="Re-enter new password"
                :class="{ 'input-invalid': passwordConfirmTouched && !passwordsValid }"
                @blur="passwordConfirmTouched = true"
              />
              <span v-if="passwordConfirmTouched && !passwordsValid" class="field-error">
                Passwords do not match
              </span>
            </label>
          </div>
        </div>

        <p v-if="profileError" class="pill pill-warm form-alert">{{ profileError }}</p>
        <p v-if="profileNotice" class="pill pill-success form-alert">{{ profileNotice }}</p>

        <div class="cta-row">
          <button class="btn btn-primary" type="submit" :disabled="saving || !passwordsValid">
            {{ saving ? 'Saving…' : 'Save changes' }}
          </button>
          <button class="btn btn-secondary" type="button" @click="cancelEdit">Cancel</button>
        </div>
      </form>

      <div v-if="!editing" class="quick-links">
        <RouterLink class="quick-link" to="/history">Order history</RouterLink>
        <RouterLink class="quick-link" to="/checkout">Checkout</RouterLink>
        <RouterLink class="quick-link" to="/dashboard">Dashboard</RouterLink>
      </div>

      <div v-if="!editing" class="cta-row">
        <button class="btn btn-primary" type="button" @click="startEdit">Edit profile</button>
        <button class="btn btn-secondary" type="button" @click="auth.logout()">Sign out</button>
      </div>
    </template>

    <template v-else>
      <div class="guest-block">
        <p class="pill pill-warm guest-badge">Sign in required</p>
        <p class="muted guest-copy">
          Log in or register to view your saved details, update your profile, and speed up checkout.
        </p>
        <div class="cta-row cta-row--center">
          <RouterLink class="btn btn-primary" to="/login">Sign in</RouterLink>
          <RouterLink class="btn btn-secondary" to="/register">Create account</RouterLink>
        </div>
      </div>
    </template>
  </AuthPageShell>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AuthPageShell from '../components/AuthPageShell.vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const editing = ref(false)
const saving = ref(false)
const profileError = ref('')
const profileNotice = ref('')
const confirmPassword = ref('')
const passwordConfirmTouched = ref(false)
const profileForm = reactive({
  name: '',
  phone: '',
  address: '',
  password: ''
})

const initials = computed(() => {
  const name = auth.user?.name?.trim() || '?'
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
})

const passwordsValid = computed(() => {
  if (!profileForm.password) return true
  return profileForm.password === confirmPassword.value
})

watch(
  () => auth.user,
  (user) => {
    if (user) {
      profileForm.name = user.name
      profileForm.phone = user.phone ?? ''
      profileForm.address = user.address ?? ''
      profileForm.password = ''
      confirmPassword.value = ''
      passwordConfirmTouched.value = false
    }
  },
  { immediate: true }
)

function startEdit() {
  editing.value = true
  profileError.value = ''
  profileNotice.value = ''
  confirmPassword.value = ''
  passwordConfirmTouched.value = false
}

function cancelEdit() {
  editing.value = false
  if (auth.user) {
    profileForm.name = auth.user.name
    profileForm.phone = auth.user.phone ?? ''
    profileForm.address = auth.user.address ?? ''
    profileForm.password = ''
    confirmPassword.value = ''
    passwordConfirmTouched.value = false
  }
}

async function saveProfile() {
  passwordConfirmTouched.value = true
  if (!passwordsValid.value) {
    profileError.value = 'Passwords do not match'
    return
  }

  saving.value = true
  profileError.value = ''
  profileNotice.value = ''
  try {
    const payload = {
      name: profileForm.name,
      phone: profileForm.phone,
      address: profileForm.address
    }
    if (profileForm.password) payload.password = profileForm.password

    await auth.updateProfile(payload)
    profileNotice.value = 'Profile updated successfully.'
    editing.value = false
    profileForm.password = ''
    confirmPassword.value = ''
  } catch (err) {
    profileError.value = err.response?.data?.message || 'Update failed'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.profile-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.15rem;
  padding: 1rem 1.1rem;
  border-radius: var(--radius-md);
  background: linear-gradient(120deg, var(--primary-soft) 0%, #fff 70%);
  border: 1px solid #fed7aa;
}

.avatar {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary-dark);
  background: #fff;
  border: 2px solid #fdba74;
  flex-shrink: 0;
}

.profile-meta {
  display: grid;
  gap: 0.35rem;
}

.profile-role {
  margin: 0;
  font-size: 0.88rem;
}

.details-grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.detail-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface-alt);
}

.detail-card--wide {
  grid-column: 1 / -1;
}

.detail-icon {
  font-size: 1.15rem;
  line-height: 1;
  margin-top: 0.1rem;
}

.detail-card strong {
  display: block;
  margin-top: 0.15rem;
  word-break: break-word;
}

.detail-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.edit-form {
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

.password-section {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: var(--radius-sm);
  border: 1px dashed var(--line-strong);
  background: #fafbfc;
}

.section-hint {
  margin: 0;
  font-size: 0.86rem;
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

.cta-row {
  margin-top: 1rem;
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.cta-row--center {
  justify-content: center;
}

.quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--line);
}

.quick-link {
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  font-size: 0.86rem;
  font-weight: 600;
  background: var(--surface-alt);
  border: 1px solid var(--line);
  transition: 0.2s ease;
}

.quick-link:hover {
  border-color: #fdba74;
  background: var(--primary-soft);
  color: var(--primary-dark);
}

.guest-block {
  text-align: center;
  padding: 0.5rem 0 0.25rem;
}

.guest-badge {
  justify-content: center;
}

.guest-copy {
  margin: 0.85rem auto 0;
  max-width: 38ch;
  line-height: 1.55;
}

@media (min-width: 640px) {
  .field-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .details-grid {
    grid-template-columns: 1fr;
  }

  .detail-card--wide {
    grid-column: auto;
  }
}
</style>
