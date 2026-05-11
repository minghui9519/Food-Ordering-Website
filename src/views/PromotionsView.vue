<template>
  <div class="grid">
    <PageIntro title="Promotions" description="Discover current campaign deals and discounts." />
    <section class="grid promo-grid">
      <article class="card" v-for="promo in promotionList" :key="promo.id">
        <p class="pill pill-warm">Limited time</p>
        <h3>{{ promo.title }}</h3>
        <p class="muted">{{ promo.detail }}</p>
        <RouterLink class="btn btn-secondary" to="/menu">Apply on Menu</RouterLink>
      </article>
    </section>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import PageIntro from '../components/PageIntro.vue'
import { promotions as promotionList } from '../data/mockData'
</script>

<style scoped>
.promo-grid {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.promo-grid article {
  display: grid;
  gap: 0.5rem;
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
