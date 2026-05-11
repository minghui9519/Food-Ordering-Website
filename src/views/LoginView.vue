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
        <button class="btn btn-primary">Login</button>
      </form>
      <p class="pill pill-success" v-if="auth.isLoggedIn">Logged in as {{ auth.user.email }}</p>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import PageIntro from '../components/PageIntro.vue'

const auth = useAuthStore()
const email = ref('')
const password = ref('')

function onLogin() {
  if (!email.value || !password.value) return
  auth.login(email.value)
  password.value = ''
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
</style>
