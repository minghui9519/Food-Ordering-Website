<template>
  <footer class="footer">
    <div class="container footer-grid">
      <div class="brand-block">
        <h2>FoodyHub</h2>
        <p class="muted">Fresh meals, fast delivery, better food experience.</p>
        <small>© 2026 FoodyHub</small>
      </div>

      <div class="link-column">
        <h3>Popular Products</h3>
        <RouterLink v-for="item in productLinks" :key="item.label" :to="item.to">
          {{ item.label }}
        </RouterLink>
      </div>

      <div class="link-column">
        <h3>Popular Cuisines</h3>
        <RouterLink v-for="item in cuisineLinks" :key="item.label" :to="item.to">
          {{ item.label }}
        </RouterLink>
      </div>

      <div class="link-column">
        <h3>About Us</h3>
        <RouterLink to="/about">About Us</RouterLink>
        <RouterLink to="/blog">Blog</RouterLink>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'

import { popularCuisines } from '../data/foodCatalog'

const productLinks = [
  { label: 'Burgers', to: '/menu?category=Burger' },
  { label: 'Wraps', to: '/menu?category=Wrap' },
  { label: 'Pizza', to: '/menu?category=Pizza' },
  { label: 'Pasta', to: '/menu?category=Pasta' },
  { label: 'Salads', to: '/menu?category=Salad' },
  { label: 'Tacos', to: '/menu?category=Taco' }
]

const cuisineLinks = popularCuisines.map((label) => ({
  label,
  to: `/footer-cuisines?type=${encodeURIComponent(label)}`
}))
</script>

<style scoped>
.footer {
  margin-top: 1rem;
  border-top: 1px solid #eceff3;
  background: #f8fafc;
}

.container {
  width: min(1140px, 94vw);
  margin: 0 auto;
  padding: 1.2rem 0 1.4rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: minmax(200px, 1.3fr) repeat(3, minmax(140px, 1fr));
  gap: 1.2rem;
}

.brand-block h2 {
  margin: 0 0 0.35rem;
  font-size: 1.45rem;
}

.brand-block p {
  margin: 0 0 0.45rem;
  max-width: 28ch;
  font-size: 0.88rem;
}

.brand-block small {
  color: #667085;
  font-size: 0.8rem;
}

.link-column {
  display: grid;
  align-content: start;
  gap: 0.34rem;
}

.link-column h3 {
  margin: 0 0 0.15rem;
  font-size: 0.98rem;
  color: #111827;
}

.link-column a {
  color: #475467;
  text-decoration: none;
  font-size: 0.86rem;
}

.link-column a:hover {
  color: #f97316;
}

@media (max-width: 900px) {
  .footer-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 580px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .brand-block p {
    max-width: none;
  }

  .link-column {
    gap: 0.3rem;
  }

  .link-column h3 {
    margin-bottom: 0.1rem;
  }

  .link-column a {
    font-size: 0.85rem;
  }

  .brand-block h2,
  .brand-block p,
  .brand-block small {
    text-align: left;
  }
}

.brand-block p,
.link-column h3,
.link-column a,
.brand-block small {
  margin: 0;
}
</style>
