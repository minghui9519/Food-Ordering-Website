<template>
  <div class="grid">
    <PageIntro title="Promotions" description="Discover current campaign deals and discounts." />
    <p v-if="catalog.loading" class="muted">Loading promotions...</p>
    <p v-else-if="catalog.error" class="pill pill-warm">{{ catalog.error }}</p>
    <section v-else class="grid promo-grid">
      <article class="card" v-for="promo in promotionList" :key="promo.id">
        <img
          v-if="promo.image"
          class="promo-image"
          :src="promo.image"
          :alt="promo.title"
          loading="lazy"
        />
        <p class="pill pill-warm">{{ promo.tagline || 'Limited time' }}</p>
        <h3>{{ promo.title }}</h3>
        <p class="muted">{{ promo.detail }}</p>
        <RouterLink class="btn btn-secondary" to="/menu">Apply on Menu</RouterLink>
      </article>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import PageIntro from '../components/PageIntro.vue'
import { useCatalogStore } from '../stores/catalog'

const catalog = useCatalogStore()
const promotionList = computed(() => catalog.promotions)

onMounted(() => {
  catalog.fetchAll()
})
</script>

<style scoped>
.promo-grid {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.promo-grid article {
  display: grid;
  gap: 0.5rem;
}

.promo-image {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 10px;
}

.promo-grid h3,
.promo-grid p {
  margin: 0;
}

.promo-grid .btn {
  justify-self: start;
  margin-top: 0.25rem;
}
</style>
