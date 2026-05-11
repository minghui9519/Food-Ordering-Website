<template>
  <div class="home">
    <section class="hero-banner">
      <button class="hero-nav prev" @click="showPreviousMedia" aria-label="Previous hero media">‹</button>
      <button class="hero-nav next" @click="showNextMedia" aria-label="Next hero media">›</button>
      <div class="hero-media">
        <img
          v-if="currentHeroMedia.type === 'image'"
          :src="currentHeroMedia.src"
          :alt="currentHeroMedia.alt"
        />
        <video
          v-else
          :src="currentHeroMedia.src"
          :poster="currentHeroMedia.poster"
          autoplay
          muted
          loop
          playsinline
        >
          Your browser does not support this video.
        </video>
      </div>
      <div class="overlay">
        <p class="tagline">Fresh meals from trusted local kitchens</p>
        <h1>ORDER FOOD DELIVERY</h1>
        <p class="subtext">From your favorite restaurants to your doorstep in minutes.</p>
        <RouterLink class="btn btn-primary" to="/menu">View Menu</RouterLink>
      </div>
    </section>

    <section class="service-strip">
      <article>
        <h3>24/7 Delivery</h3>
        <p class="muted">Order anytime, day or night.</p>
      </article>
      <article>
        <h3>2500 Restaurants</h3>
        <p class="muted">From quick bites to premium dining.</p>
      </article>
      <article>
        <h3>Order with App</h3>
        <p class="muted">Smooth checkout and live tracking.</p>
      </article>
      <article>
        <h3>Fast Delivery</h3>
        <p class="muted">Average delivery in under 40 minutes.</p>
      </article>
    </section>

    <section class="intro-block">
      <h2>MORE THAN 20,000 DISHES TO ORDER</h2>
      <p class="muted">Welcome to the biggest network for food ordering and delivery.</p>
    </section>

    <section class="featured-wrap">
      <div class="featured-head">
        <h2 class="section-title">Top Promotions in Your Area</h2>
      </div>
      <div class="promo-card-grid">
        <article class="promo-card" v-for="promo in promotionCards" :key="promo.id">
          <span class="pill pill-warm">Promo</span>
          <img :src="promo.image" :alt="promo.title" />
          <h3>{{ promo.title }}</h3>
          <p class="muted">{{ promo.detail }}</p>
          <div class="promo-meta">
            <span>{{ promo.tagline }}</span>
            <RouterLink class="btn btn-secondary" to="/menu">Order now</RouterLink>
          </div>
        </article>
      </div>
      <RouterLink class="see-all-btn" to="/promotions">See all promotions</RouterLink>
    </section>

    <section class="category-wrap">
      <div class="section-head">
        <h2>Explore by cuisine</h2>
        <p class="muted">Browse broad cuisine categories for faster and easier ordering.</p>
      </div>
      <div class="category-grid">
        <article class="category-card" v-for="category in categoryCards" :key="category.name">
          <img :src="category.image" :alt="category.name" />
          <h3>{{ category.name }}</h3>
        </article>
      </div>
    </section>

    <section class="why-wrap">
      <div class="section-head">
        <h2>Why choosing FoodyHub?</h2>
        <p class="muted">Built for speed, trust, and everyday convenience.</p>
      </div>
      <div class="benefit-grid">
        <article class="benefit-card" v-for="benefit in whyFoodyHub" :key="benefit.title">
          <h3>{{ benefit.title }}</h3>
          <p class="muted">{{ benefit.description }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { products, promotions } from '../data/mockData'
import { useCartStore } from '../stores/cart'
import { ref } from 'vue'

const cart = useCartStore()
const featuredItems = computed(() => products.slice(0, 4))

const heroMediaItems = [
  {
    type: 'image',
    src: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1800',
    alt: 'Fresh pizza and salad served on a table'
  },
  {
    type: 'video',
    src: 'https://cdn.coverr.co/videos/coverr-preparing-a-breakfast-toast-1579/1080p.mp4',
    poster: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1800'
  },
  {
    type: 'image',
    src: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1800',
    alt: 'Healthy bowls and vegetable dishes'
  }
]

const currentMediaIndex = ref(0)
const currentHeroMedia = computed(() => heroMediaItems[currentMediaIndex.value])

const showNextMedia = () => {
  currentMediaIndex.value = (currentMediaIndex.value + 1) % heroMediaItems.length
}

const showPreviousMedia = () => {
  currentMediaIndex.value = (currentMediaIndex.value - 1 + heroMediaItems.length) % heroMediaItems.length
}

const promotionCards = computed(() =>
  promotions.map((promo, index) => ({
    ...promo,
    image: featuredItems.value[index % featuredItems.value.length].image,
    tagline: ['Limited time', 'Best value', 'Popular deal'][index % 3]
  }))
)

const categoryCards = computed(() => {
  const categoryMap = new Map()
  products.forEach((item) => {
    if (!categoryMap.has(item.cuisineCategory)) {
      categoryMap.set(item.cuisineCategory, { name: item.cuisineCategory, image: item.image })
    }
  })
  return Array.from(categoryMap.values())
})

const whyFoodyHub = [
  {
    title: 'Fast and reliable delivery',
    description: 'Our partnered riders deliver quickly with live status updates from kitchen to doorstep.'
  },
  {
    title: 'Curated restaurant quality',
    description: 'We partner with trusted local kitchens to ensure every order meets high food standards.'
  },
  {
    title: 'Easy ordering experience',
    description: 'Simple browsing, secure checkout, and smooth reordering make every meal effortless.'
  },
  {
    title: 'Value-packed promotions',
    description: 'Daily offers and member-friendly deals help you save more on your favorite dishes.'
  }
]
</script>

<style scoped>
.home {
  width: 100%;
}

.hero-banner {
  height: clamp(360px, 64vh, 620px);
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.hero-media {
  position: absolute;
  inset: 0;
}

.hero-media img,
.hero-media video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-media::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.45));
}

.hero-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: rgba(15, 23, 42, 0.42);
  color: #fff;
  font-size: 1.4rem;
  line-height: 1;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.hero-nav:hover {
  background: rgba(15, 23, 42, 0.56);
}

.hero-nav.prev {
  left: 1rem;
}

.hero-nav.next {
  right: 1rem;
}

.overlay {
  position: relative;
  z-index: 2;
  text-align: center;
  color: #fff;
  max-width: 820px;
  padding: 1rem;
}

.tagline {
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.overlay h1 {
  font-size: clamp(2.1rem, 5.2vw, 4.1rem);
  line-height: 1.03;
  margin: 0;
  letter-spacing: 0.03em;
}

.subtext {
  font-size: 1.1rem;
  margin: 0.9rem 0 1.25rem;
  color: rgba(255, 255, 255, 0.9);
}

.service-strip {
  width: min(1180px, 94vw);
  margin: -2.2rem auto 1.2rem;
  position: relative;
  z-index: 5;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #ebeef4;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
  padding: 0.9rem;
  display: grid;
  gap: 0.8rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.service-strip article {
  text-align: center;
  padding: 0.4rem 0.2rem;
}

.service-strip h3 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
}

.service-strip p {
  margin: 0;
  font-size: 0.86rem;
}

.intro-block {
  text-align: center;
  width: min(980px, 94vw);
  margin: 0 auto 1rem;
  padding: 1rem 0 0.4rem;
}

.intro-block h2 {
  margin: 0;
  letter-spacing: 0.02em;
  font-size: clamp(1.6rem, 3vw, 2.4rem);
}

.intro-block p {
  margin-top: 0.45rem;
}

.featured-wrap {
  width: min(1180px, 94vw);
  margin: 0 auto 1.2rem;
  border: 1px solid #eceff3;
  border-radius: 18px;
  background: #fff;
  padding: 1rem;
}

.featured-head {
  margin-bottom: 0.8rem;
}

.promo-card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}

.promo-card {
  border: 1px solid #eceff3;
  border-radius: 16px;
  padding: 0.7rem;
  display: grid;
  gap: 0.45rem;
  background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
}

.promo-card img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 14px;
}

.promo-card h3 {
  margin: 0.2rem 0 0.1rem;
  font-size: 1rem;
}

.promo-card p {
  margin: 0;
  font-size: 0.85rem;
}

.promo-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.25rem;
}

.promo-meta span {
  font-size: 0.8rem;
  color: #667085;
}

.see-all-btn {
  margin-top: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d7dde8;
  border-radius: 10px;
  min-height: 2.2rem;
  color: #101828;
  text-decoration: none;
  background: #fff;
}

.see-all-btn:hover {
  background: #f5f8ff;
}

.section-head {
  margin-bottom: 0.75rem;
}

.section-head h2 {
  margin: 0;
  font-size: clamp(1.4rem, 2.8vw, 2rem);
}

.section-head p {
  margin: 0.35rem 0 0;
}

.category-wrap,
.why-wrap {
  width: min(1180px, 94vw);
  margin: 0 auto 1.2rem;
  padding: 1rem;
  border-radius: 18px;
  border: 1px solid #eceff3;
  background: #fff;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}

.category-card {
  border: 1px solid #eceff3;
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
}

.category-card img {
  width: 100%;
  aspect-ratio: 2 / 1;
  object-fit: cover;
}

.category-card h3 {
  margin: 0;
  padding: 0.55rem 0.7rem;
  font-size: 0.95rem;
}

.benefit-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.benefit-card {
  border: 1px solid #edf0f6;
  border-radius: 14px;
  padding: 0.9rem;
  background: linear-gradient(140deg, #fffaf3 0%, #ffffff 100%);
}

.benefit-card h3 {
  margin: 0 0 0.35rem;
  font-size: 1rem;
}

.benefit-card p {
  margin: 0;
  font-size: 0.88rem;
}

@media (max-width: 980px) {
  .promo-card-grid,
  .category-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .benefit-grid {
    grid-template-columns: 1fr;
  }

  .service-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .hero-nav {
    width: 1.9rem;
    height: 1.9rem;
    font-size: 1.2rem;
  }

  .service-strip {
    grid-template-columns: 1fr;
    margin-top: -1.2rem;
  }

  .promo-card-grid,
  .category-grid {
    grid-template-columns: 1fr;
  }
}
</style>
