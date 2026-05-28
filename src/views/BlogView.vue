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

    <p v-if="catalog.loading" class="muted">Loading posts...</p>
    <p v-else-if="catalog.error" class="pill pill-warm">{{ catalog.error }}</p>

    <section v-else class="posts">
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
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useCatalogStore } from '../stores/catalog'

const catalog = useCatalogStore()
const posts = computed(() => catalog.blogs)

onMounted(() => {
  catalog.fetchAll()
})
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
