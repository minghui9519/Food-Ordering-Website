<template>
  <div class="blog grid">
    <section class="blog-hero card">
      <p class="pill pill-warm">Food & Lifestyle Blog</p>
      <h1 class="section-title">Tips, recipes, and delivery updates from our team.</h1>
      <p class="muted">
        Discover kitchen stories, trending menu ideas, and practical guides to improve your food
        ordering experience.
      </p>
    </section>

    <section class="posts">
      <article v-for="post in posts" :key="post.id" class="card post">
        <p class="meta muted">{{ post.tag }} · {{ post.date }}</p>
        <h2>{{ post.title }}</h2>
        <p class="muted">{{ post.excerpt }}</p>
        <RouterLink class="btn btn-secondary" to="/menu">Explore Related Dishes</RouterLink>
      </article>
    </section>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'

const posts = [
  {
    id: 1,
    tag: 'Kitchen Insight',
    date: 'May 2026',
    title: 'How We Keep Burgers Fresh During Delivery',
    excerpt:
      'A quick look at packaging layers, heat retention, and timing standards used by partner kitchens.'
  },
  {
    id: 2,
    tag: 'Healthy Choice',
    date: 'Apr 2026',
    title: 'Balanced Lunch Picks Under 600 Calories',
    excerpt: 'Simple combinations of wraps, salads, and soups that keep you full without feeling heavy.'
  },
  {
    id: 3,
    tag: 'Community',
    date: 'Apr 2026',
    title: 'Local Restaurants We Love This Month',
    excerpt: 'Meet independent chefs and neighborhood favorites now available through FoodyHub.'
  }
]
</script>

<style scoped>
.blog {
  gap: 1.1rem;
}

.blog-hero {
  padding: 1.4rem;
}

.posts {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.post h2 {
  margin: 0.4rem 0;
  font-size: 1.1rem;
}

.meta {
  margin: 0;
  font-size: 0.85rem;
}

.post .btn {
  justify-self: start;
}

@media (max-width: 900px) {
  .posts {
    grid-template-columns: 1fr;
  }
}
</style>
