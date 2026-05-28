<template>

  <div class="account-page grid">

    <PageIntro

      title="My Account"

      description="View your personal details and manage your FoodyHub profile."

    />



    <section class="card account-card" v-if="auth.isLoggedIn">

      <p class="pill pill-success">Logged In</p>

      <h2 class="section-title">Personal Details</h2>

      <div class="details-grid" v-if="!editing">

        <div class="detail-item">

          <span class="muted label">Full Name</span>

          <strong>{{ auth.user.name }}</strong>

        </div>

        <div class="detail-item">

          <span class="muted label">Email</span>

          <strong>{{ auth.user.email }}</strong>

        </div>

        <div class="detail-item">

          <span class="muted label">Phone</span>

          <strong>{{ auth.user.phone || '—' }}</strong>

        </div>

        <div class="detail-item">

          <span class="muted label">Address</span>

          <strong>{{ auth.user.address || '—' }}</strong>

        </div>

        <div class="detail-item">

          <span class="muted label">User ID</span>

          <strong>#{{ auth.user.id }}</strong>

        </div>

        <div class="detail-item">

          <span class="muted label">Account type</span>

          <strong>{{ auth.user.role }}</strong>

        </div>

      </div>

      <form v-else class="grid edit-form" @submit.prevent="saveProfile">

        <label>

          Full Name

          <input v-model="profileForm.name" required />

        </label>

        <label>

          Phone

          <input v-model="profileForm.phone" type="tel" />

        </label>

        <label>

          Address

          <input v-model="profileForm.address" />

        </label>

        <label>

          New password (optional)

          <input v-model="profileForm.password" type="password" />

        </label>

        <p v-if="profileError" class="pill pill-warm">{{ profileError }}</p>

        <p v-if="profileNotice" class="pill pill-success">{{ profileNotice }}</p>

        <div class="cta-row">

          <button class="btn btn-primary" type="submit" :disabled="saving">Save changes</button>

          <button class="btn btn-secondary" type="button" @click="cancelEdit">Cancel</button>

        </div>

      </form>

      <div class="cta-row" v-if="!editing">

        <button class="btn btn-primary" type="button" @click="startEdit">Edit profile</button>

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

import { reactive, ref, watch } from 'vue'

import { RouterLink } from 'vue-router'

import PageIntro from '../components/PageIntro.vue'

import { useAuthStore } from '../stores/auth'



const auth = useAuthStore()

const editing = ref(false)

const saving = ref(false)

const profileError = ref('')

const profileNotice = ref('')

const profileForm = reactive({

  name: '',

  phone: '',

  address: '',

  password: ''

})



watch(

  () => auth.user,

  (user) => {

    if (user) {

      profileForm.name = user.name

      profileForm.phone = user.phone ?? ''

      profileForm.address = user.address ?? ''

      profileForm.password = ''

    }

  },

  { immediate: true }

)



function startEdit() {

  editing.value = true

  profileError.value = ''

  profileNotice.value = ''

}



function cancelEdit() {

  editing.value = false

  if (auth.user) {

    profileForm.name = auth.user.name

    profileForm.phone = auth.user.phone ?? ''

    profileForm.address = auth.user.address ?? ''

    profileForm.password = ''

  }

}



async function saveProfile() {

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

  } catch (err) {

    profileError.value = err.response?.data?.message || 'Update failed'

  } finally {

    saving.value = false

  }

}

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



.edit-form {

  gap: 0.8rem;

  margin-top: 0.9rem;

}



.edit-form label {

  display: grid;

  gap: 0.35rem;

}



.cta-row {

  margin-top: 0.9rem;

  display: flex;

  gap: 0.65rem;

  flex-wrap: wrap;

}



@media (max-width: 640px) {

  .details-grid {

    grid-template-columns: 1fr;

  }

}

</style>

