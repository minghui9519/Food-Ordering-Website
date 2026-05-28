<template>
  <div class="checkout grid">
    <PageIntro title="Checkout" description="Submit your delivery details and confirm your order." />
    <section class="card checkout-card" v-if="cart.items.length">
      <h2 class="section-title">Order summary</h2>
      <ul class="summary-list">
        <li v-for="item in cart.items" :key="itemKey(item)">
          <span>{{ item.name }} × {{ item.quantity }}</span>
          <span>${{ (item.price * item.quantity).toFixed(2) }}</span>
        </li>
      </ul>
      <p class="summary-total"><strong>Total: ${{ cart.totalPrice.toFixed(2) }}</strong></p>
    </section>
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
        <p v-if="error" class="pill pill-warm">{{ error }}</p>
        <button class="btn btn-primary" :disabled="!cart.items.length || submitting">
          {{ submitting ? 'Placing order…' : 'Place Order' }}
        </button>
      </form>
    </section>
    <p class="card pill pill-success" v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageIntro from '../components/PageIntro.vue'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import { createOrder } from '../api/orders'

const cart = useCartStore()
const auth = useAuthStore()
const router = useRouter()
const message = ref('')
const error = ref('')
const submitting = ref(false)
const form = reactive({
  name: '',
  address: '',
  phone: ''
})

function itemKey(item) {
  return `${item.id}-${item.customKey ?? 'default'}`
}

onMounted(() => {
  if (auth.customerUser) {
    form.name = auth.customerUser.name ?? ''
    form.phone = auth.customerUser.phone ?? ''
    form.address = auth.customerUser.address ?? ''
  }
})

async function submitOrder() {
  if (!cart.items.length) return
  submitting.value = true
  error.value = ''
  message.value = ''
  try {
    const { data } = await createOrder({
      customerName: form.name,
      deliveryAddress: form.address,
      phone: form.phone,
      items: cart.items.map((item) => ({
        productId: item.id,
        productName: item.name,
        unitPrice: item.price,
        quantity: item.quantity,
        notes: item.notes ?? '',
        customIngredients: item.customIngredients ?? [],
        removedIngredients: item.removedIngredients ?? []
      }))
    })
    message.value = `Order #${data.id} submitted. Total: $${data.total.toFixed(2)}`
    cart.clearCart()
    form.name = auth.customerUser?.name ?? ''
    form.phone = auth.customerUser?.phone ?? ''
    form.address = auth.customerUser?.address ?? ''
    setTimeout(() => router.push('/history'), 1500)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to place order'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.checkout {
  gap: 1rem;
}

.checkout-card {
  width: min(640px, 100%);
}

.summary-list {
  list-style: none;
  margin: 0 0 0.75rem;
  padding: 0;
  display: grid;
  gap: 0.45rem;
}

.summary-list li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.92rem;
}

.summary-total {
  margin: 0;
  padding-top: 0.5rem;
  border-top: 1px solid #eceff3;
}

.form {
  gap: 0.8rem;
}
</style>
