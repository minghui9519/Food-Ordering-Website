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
          Password
          <input v-model="form.password" type="password" required />
        </label>
        <button class="btn btn-primary">Create Account</button>
      </form>
      <p class="pill pill-success" v-if="notice">{{ notice }}</p>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import PageIntro from '../components/PageIntro.vue'

const notice = ref('')
const form = reactive({
  name: '',
  email: '',
  password: ''
})

function register() {
  notice.value = `Account created for ${form.name}. You can login now.`
  form.name = ''
  form.email = ''
  form.password = ''
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
</style>
