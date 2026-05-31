<template>
  <article class="promotion-card" :class="{ applied: applied, compact: variant === 'compact' }">
    <div class="promo-media">
      <img
        class="promo-image"
        :src="displaySrc"
        :alt="promo.title"
        loading="lazy"
        decoding="async"
        referrerpolicy="no-referrer"
        @error="onImgError"
      />
      <span class="promo-badge">{{ badge }}</span>
      <span v-if="applied" class="promo-applied-tag">Applied</span>
    </div>

    <div class="promo-body">
      <p v-if="promo.tagline" class="promo-tagline">{{ promo.tagline }}</p>
      <h3>{{ promo.title }}</h3>
      <p class="promo-detail">{{ promo.detail }}</p>
      <p v-if="dealLine" class="promo-deal">{{ dealLine }}</p>

      <div class="promo-actions">
        <RouterLink
          v-if="showMenuLink"
          class="btn btn-secondary"
          :to="{ name: 'menu', query: menuQuery }"
        >
          {{ variant === 'compact' ? 'Order now' : 'View on menu' }}
        </RouterLink>
        <button
          v-if="showApply"
          type="button"
          class="btn"
          :class="applied ? 'btn-secondary' : 'btn-primary'"
          @click="$emit('toggle-apply', promo.id)"
        >
          {{ applied ? 'Applied' : 'Apply promotion' }}
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { foodImageFallbackUrl } from '../data/foodImageMap'
import { resolveProductImageUrl } from '../utils/productImageUrl'
import { buildMenuLinkForPromotion, formatPromoBadge, formatPromoDeal } from '../utils/promotionUtils'

const props = defineProps({
  promo: { type: Object, required: true },
  triggerProductName: { type: String, default: '' },
  applied: { type: Boolean, default: false },
  variant: {
    type: String,
    default: 'full',
    validator: (value) => ['full', 'compact'].includes(value)
  },
  showApply: { type: Boolean, default: true },
  showMenuLink: { type: Boolean, default: true }
})

defineEmits(['toggle-apply'])

const displaySrc = ref(resolveProductImageUrl(props.promo.image))

watch(
  () => props.promo.image,
  (url) => {
    displaySrc.value = resolveProductImageUrl(url)
  }
)

const badge = computed(() => formatPromoBadge(props.promo))
const dealLine = computed(() => formatPromoDeal(props.promo, props.triggerProductName))
const menuQuery = computed(() => buildMenuLinkForPromotion(props.promo))

function onImgError() {
  if (displaySrc.value !== foodImageFallbackUrl) {
    displaySrc.value = foodImageFallbackUrl
  }
}
</script>

<style scoped>
.promotion-card {
  display: grid;
  overflow: hidden;
  border: 1px solid #e8edf5;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  max-width: 320px;
}

.promotion-card.compact {
  max-width: none;
}

.promotion-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.1);
}

.promotion-card.applied {
  border-color: #86efac;
  box-shadow: 0 12px 30px rgba(22, 101, 52, 0.12);
}

.promo-media {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
}

.promo-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
  transition: transform 0.35s ease;
}

.promotion-card:not(.compact) .promo-image {
  aspect-ratio: 2 / 1;
  max-height: 140px;
}

.promotion-card:hover .promo-image {
  transform: scale(1.03);
}

.promotion-card.compact .promo-image {
  aspect-ratio: 16 / 9;
}

.promo-badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background: rgba(234, 88, 12, 0.95);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  box-shadow: 0 3px 8px rgba(234, 88, 12, 0.3);
}

.promo-applied-tag {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(22, 101, 52, 0.92);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
}

.promo-body {
  display: grid;
  gap: 0.35rem;
  padding: 0.75rem 0.8rem 0.85rem;
}

.promo-tagline {
  margin: 0;
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #ea580c;
}

.promo-body h3 {
  margin: 0;
  font-size: 0.98rem;
  line-height: 1.25;
  color: #0f172a;
}

.promotion-card.compact .promo-body h3 {
  font-size: 1rem;
}

.promo-detail {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.4;
  color: #64748b;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.promotion-card.compact .promo-detail {
  font-size: 0.85rem;
}

.promo-deal {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 600;
  color: #c2410c;
  padding: 0.35rem 0.5rem;
  border-radius: 8px;
  background: #fff7ed;
  border: 1px solid #ffedd5;
}

.promo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.25rem;
}

.promo-actions .btn {
  flex: 1 1 auto;
  min-width: 0;
  padding: 0.45rem 0.65rem;
  font-size: 0.78rem;
  justify-content: center;
  text-align: center;
}
</style>
