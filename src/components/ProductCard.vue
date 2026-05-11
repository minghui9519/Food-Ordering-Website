<template>
  <article class="card product-card" @click="$emit('select', product)">
    <img
      :src="displaySrc"
      :alt="product.name"
      class="thumb"
      loading="lazy"
      decoding="async"
      referrerpolicy="no-referrer"
      @error="onImgError"
    />
    <h3>{{ product.name }}</h3>
    <p class="muted desc">{{ product.description }}</p>
    <div class="actions">
      <p class="price"><strong>${{ product.price.toFixed(2) }}</strong></p>
      <div class="buttons">
        <RouterLink class="btn btn-secondary" :to="`/menu/${product.id}`">View</RouterLink>
        <button class="btn btn-primary" @click.stop="$emit('add', product)">Add</button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { foodImageFallbackUrl } from '../data/foodImageMap'

const props = defineProps({
  product: { type: Object, required: true }
})

defineEmits(['add', 'select'])

const displaySrc = ref(props.product.image)

watch(
  () => props.product.image,
  (url) => {
    displaySrc.value = url
  }
)

function onImgError() {
  if (displaySrc.value !== foodImageFallbackUrl) {
    displaySrc.value = foodImageFallbackUrl
  }
}
</script>

<style scoped>
.product-card {
  display: grid;
  gap: 0.5rem;
  border-radius: 16px;
  border: 1px solid #eceff3;
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.12);
}

.thumb {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 14px;
}

.desc {
  font-size: 0.9rem;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.buttons {
  display: flex;
  gap: 0.4rem;
}

.price {
  color: #0f172a;
}

h3 {
  margin: 0.35rem 0 0;
}

p {
  margin: 0;
}
</style>
