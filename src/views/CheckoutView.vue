<template>
  <div class="checkout grid">
    <PageIntro title="Checkout" description="Submit your delivery details and confirm your order." />
    <section class="card checkout-card">
      <form class="grid form" @submit.prevent="submitOrder">
        <label>
          Full Name
          <input v-model="form.name" required />
        </label>
        <label>
          Address
          <input v-model="form.address" required />
        </label>
        <label>
          Phone Number
          <input v-model="form.phone" required />
        </label>
        <button class="btn btn-primary" :disabled="!cart.items.length">Place Order</button>
      </form>
    </section>
    <p class="card pill pill-success" v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import PageIntro from '../components/PageIntro.vue'
import { useCartStore } from '../stores/cart'

const cart = useCartStore()
const message = ref('')
const form = reactive({
  name: '',
  address: '',
  phone: ''
})

function submitOrder() {
  if (!cart.items.length) return
  message.value = `Order submitted for ${form.name}. Total: $${cart.totalPrice.toFixed(2)}`
  cart.clearCart()
  form.name = ''
  form.address = ''
  form.phone = ''
}
</script>

<style scoped>
.checkout {
  gap: 1rem;
}

.checkout-card {
  width: min(640px, 100%);
}

.form {
  gap: 0.8rem;
}
</style>
