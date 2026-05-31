<template>
  <div class="promotions-page">
    <PageIntro title="Promotions" description="Discover current campaign deals and discounts." />

    <p v-if="catalog.loading" class="state-message muted">Loading promotions...</p>
    <p v-else-if="catalog.error" class="state-message pill pill-warm">{{ catalog.error }}</p>
    <p v-else-if="!promotionList.length" class="state-message card empty-state">
      No active promotions right now. Check back soon for new deals.
    </p>

    <section v-else class="promo-grid">
      <PromotionCard
        v-for="promo in promotionList"
        :key="promo.id"
        :promo="promo"
        :trigger-product-name="triggerProductName(promo)"
        :applied="cart.isPromotionApplied(promo.id)"
        @toggle-apply="cart.togglePromotion"
      />
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import PageIntro from '../components/PageIntro.vue'
import PromotionCard from '../components/PromotionCard.vue'
import { useCartStore } from '../stores/cart'
import { useCatalogStore } from '../stores/catalog'
import { isPromotionActive } from '../utils/promotionUtils'

const catalog = useCatalogStore()
const cart = useCartStore()
const promotionList = computed(() => catalog.promotions.filter(isPromotionActive))

function triggerProductName(promo) {
  return catalog.products.find((item) => item.id === promo.triggerProductId)?.name ?? ''
}

onMounted(() => {
  catalog.fetchAll()
})
</script>

<style scoped>
.promotions-page {
  display: grid;
  gap: 1.25rem;
}

.state-message {
  margin: 0;
}

.empty-state {
  padding: 1.25rem;
  text-align: center;
  color: #64748b;
}

.promotions-page :deep(.promotion-card) {
  max-width: none;
  width: 100%;
}

.promo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 260px));
  justify-content: start;
  gap: 1rem;
}

@media (min-width: 900px) {
  .promo-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1200px) {
  .promo-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
