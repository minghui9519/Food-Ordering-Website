<template>
  <article class="card product-card" @click="$emit('select', product)">
    <div class="card-top">
      <img
        :src="displaySrc"
        :alt="product.name"
        class="thumb"
        loading="lazy"
        decoding="async"
        referrerpolicy="no-referrer"
        @error="onImgError"
      />
      <span v-if="promoBadge" class="promo-badge">{{ promoBadge }}</span>
    </div>
    <h3>{{ product.name }}</h3>
    <p class="muted desc">{{ product.description }}</p>
    <div class="actions">
      <p class="price">
        <template v-if="hasDiscount">
          <span class="price-old">${{ originalPrice.toFixed(2) }}</span>
          <strong>${{ displayPrice.toFixed(2) }}</strong>
        </template>
        <strong v-else>${{ displayPrice.toFixed(2) }}</strong>
      </p>
      <div class="buttons">
        <button class="btn btn-secondary" @click.stop="$emit('select', product)">View</button>
        <button class="btn btn-primary" @click.stop="$emit('add', product, $event)">Add</button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { foodImageFallbackUrl } from '../data/foodImageMap'
import { resolveProductImageUrl } from '../utils/productImageUrl'
import { formatPromoBadge, getMenuUnitPrice, getPromotionsForProduct } from '../utils/promotionUtils'

const props = defineProps({
  product: { type: Object, required: true },
  promotions: { type: Array, default: () => [] },
  appliedPromotions: { type: Array, default: () => [] }
})

defineEmits(['add', 'select'])

const displaySrc = ref(resolveProductImageUrl(props.product.image))

watch(
  () => props.product.image,
  (url) => {
    displaySrc.value = resolveProductImageUrl(url)
  }
)

const productPromos = computed(() => getPromotionsForProduct(props.product, props.promotions))

const promoBadge = computed(() => {
  const promos = productPromos.value
  if (!promos.length) return ''
  const applied = promos.find((promo) =>
    props.appliedPromotions.some((item) => item.id === promo.id)
  )
  return formatPromoBadge(applied ?? promos[0])
})

const menuPrice = computed(() => getMenuUnitPrice(props.product, props.appliedPromotions))

const displayPrice = computed(() => menuPrice.value.final)
const originalPrice = computed(() => menuPrice.value.original)
const hasDiscount = computed(() => menuPrice.value.hasDiscount)

function onImgError() {
  if (displaySrc.value !== foodImageFallbackUrl) {
    displaySrc.value = foodImageFallbackUrl
  }
}
</script>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  max-width: 280px;
  padding: 0.85rem;
  border-radius: 16px;
  border: 1px solid #eceff3;
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background: #fff;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.12);
}

.card-top {
  position: relative;
  flex-shrink: 0;
}

.promo-badge {
  position: absolute;
  top: 0.55rem;
  left: 0.55rem;
  background: #ea580c;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
}

.thumb {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 14px;
}

.desc {
  font-size: 0.9rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.8em;
  flex: 1;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.65rem;
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: flex-end;
}

.buttons .btn {
  padding: 0.45rem 0.75rem;
  font-size: 0.82rem;
}

.price {
  color: #0f172a;
  display: grid;
  gap: 0.1rem;
}

.price-old {
  font-size: 0.82rem;
  color: #94a3b8;
  text-decoration: line-through;
  font-weight: 400;
}

h3 {
  margin: 0.35rem 0 0.25rem;
  font-size: 1rem;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.7em;
}

p {
  margin: 0;
}
</style>
