<template>
  <div class="blog-page">
    <header class="blog-hero">
      <div class="blog-hero-inner">
        <p class="pill pill-warm">Food &amp; lifestyle</p>
        <h1>Tips, recipes, and stories from our kitchen network</h1>
        <p class="blog-hero-lead muted">
          Discover kitchen insights, balanced meal ideas, and neighborhood favorites—curated by the
          FoodyHub team.
        </p>
      </div>
      <div class="blog-hero-accent" aria-hidden="true"></div>
    </header>

    <div class="blog-body">
      <p v-if="catalog.loading" class="state card muted">Loading posts…</p>
      <p v-else-if="catalog.error" class="state pill pill-warm">{{ catalog.error }}</p>

      <section v-else-if="!posts.length" class="empty card">
        <span class="empty-icon" aria-hidden="true">📝</span>
        <h2>No posts yet</h2>
        <p class="muted">Check back soon for fresh articles from our team and partner kitchens.</p>
        <RouterLink class="btn btn-primary" to="/menu">Explore the menu</RouterLink>
      </section>

      <template v-else>
        <article v-if="featuredPost" class="featured card">
          <div class="featured-media">
            <img
              :src="coverForPost(featuredPost)"
              :alt="featuredPost.title"
              loading="eager"
              decoding="async"
              referrerpolicy="no-referrer"
            />
            <span class="featured-tag pill pill-warm">{{ featuredPost.tag }}</span>
          </div>
          <div class="featured-body">
            <p class="meta muted">{{ featuredPost.date }} · Featured</p>
            <h2>{{ featuredPost.title }}</h2>
            <p class="excerpt muted">{{ featuredPost.excerpt }}</p>
            <BlogReadMoreLink :url="featuredPost.readMoreUrl">
              Explore related dishes
              <span aria-hidden="true">→</span>
            </BlogReadMoreLink>
          </div>
        </article>

        <section v-if="restPosts.length" class="posts-section">
          <header class="posts-head">
            <h2 class="section-title">Latest articles</h2>
            <p class="muted">{{ posts.length }} {{ posts.length === 1 ? 'story' : 'stories' }} to read</p>
          </header>
          <div class="posts-grid">
            <article v-for="post in restPosts" :key="post.id" class="post-card card">
              <div class="post-thumb">
                <img
                  :src="coverForPost(post)"
                  :alt="post.title"
                  loading="lazy"
                  decoding="async"
                  referrerpolicy="no-referrer"
                />
              </div>
              <div class="post-body">
                <p class="meta">
                  <span class="tag-pill">{{ post.tag }}</span>
                  <span class="muted">{{ post.date }}</span>
                </p>
                <h3>{{ post.title }}</h3>
                <p class="excerpt muted">{{ post.excerpt }}</p>
                <BlogReadMoreLink :url="post.readMoreUrl">
                  Read more
                  <span aria-hidden="true">→</span>
                </BlogReadMoreLink>
              </div>
            </article>
          </div>
        </section>
      </template>

      <aside class="subscribe card">
        <div>
          <h2>Hungry for more?</h2>
          <p class="muted">Browse the full menu and discover dishes that match what you read here.</p>
        </div>
        <RouterLink class="btn btn-primary" to="/menu">View menu</RouterLink>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import BlogReadMoreLink from '../components/BlogReadMoreLink.vue'
import { useCatalogStore } from '../stores/catalog'
import { isValidHttpImageUrl, normalizeProductImageUrl } from '../utils/productImageUrl'

const catalog = useCatalogStore()
const route = useRoute()
const posts = computed(() => catalog.blogs)
const featuredPost = computed(() => posts.value[0] ?? null)
const restPosts = computed(() => posts.value.slice(1))

const coverByTag = {
  'Kitchen Insight':
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=520&fit=crop&q=85',
  'Healthy Choice':
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=520&fit=crop&q=85',
  Community:
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=520&fit=crop&q=85'
}

const defaultCover =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=520&fit=crop&q=85'

function coverForPost(post) {
  const custom = normalizeProductImageUrl(post.image)
  if (isValidHttpImageUrl(custom)) return custom
  return coverByTag[post.tag] ?? defaultCover
}

function loadBlogPosts() {
  return catalog.fetchAll(true)
}

onMounted(() => {
  loadBlogPosts()
})

watch(
  () => route.name,
  (name) => {
    if (name === 'blog') loadBlogPosts()
  }
)
</script>

<style scoped>
.blog-page {
  width: 100%;
}

.blog-hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #fff5ed 0%, #ffffff 42%, #f7f7f9 100%);
  border-bottom: 1px solid var(--line);
}

.blog-hero-inner {
  width: min(1180px, 94vw);
  margin: 0 auto;
  padding: clamp(2.25rem, 5vw, 3.5rem) 0;
  position: relative;
  z-index: 1;
}

.blog-hero h1 {
  margin: 0.75rem 0 0;
  max-width: 20ch;
  font-size: clamp(1.85rem, 4vw, 2.75rem);
  line-height: 1.12;
  letter-spacing: -0.02em;
}

.blog-hero-lead {
  margin: 0.85rem 0 0;
  max-width: 52ch;
  font-size: 1.05rem;
  line-height: 1.6;
}

.blog-hero-accent {
  position: absolute;
  top: -40%;
  right: -8%;
  width: min(480px, 55vw);
  height: min(480px, 55vw);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 122, 0, 0.18) 0%, transparent 70%);
  pointer-events: none;
}

.blog-body {
  width: min(1180px, 94vw);
  margin: 0 auto;
  padding: 2rem 0 3rem;
  display: grid;
  gap: 2rem;
}

.state {
  margin: 0;
  padding: 1.25rem;
  text-align: center;
}

.empty {
  text-align: center;
  padding: 2.5rem 1.5rem;
  display: grid;
  gap: 0.65rem;
  justify-items: center;
}

.empty-icon {
  font-size: 2.5rem;
}

.empty h2 {
  margin: 0;
}

.featured {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 0;
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--line);
  box-shadow: var(--shadow-card);
}

.featured-media {
  position: relative;
  min-height: 260px;
}

.featured-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.featured-tag {
  position: absolute;
  top: 1rem;
  left: 1rem;
}

.featured-body {
  padding: clamp(1.25rem, 3vw, 2rem);
  display: grid;
  align-content: center;
  gap: 0.65rem;
  background: linear-gradient(160deg, #fff 0%, #fff9f2 100%);
}

.featured-body h2 {
  margin: 0;
  font-size: clamp(1.35rem, 2.5vw, 1.85rem);
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.meta {
  margin: 0;
  font-size: 0.85rem;
}

.excerpt {
  margin: 0;
  line-height: 1.6;
  font-size: 0.98rem;
}

.posts-section {
  display: grid;
  gap: 1.25rem;
}

.posts-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.35rem 1rem;
}

.posts-head .section-title {
  margin: 0;
}

.posts-head p {
  margin: 0;
  font-size: 0.9rem;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.post-card {
  padding: 0;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card);
}

.post-thumb {
  aspect-ratio: 16 / 10;
  overflow: hidden;
}

.post-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.post-card:hover .post-thumb img {
  transform: scale(1.04);
}

.post-body {
  padding: 1.15rem 1.2rem 1.35rem;
  display: grid;
  gap: 0.45rem;
}

.post-body .meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.tag-pill {
  display: inline-flex;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--primary-soft);
  color: #9a3412;
}

.post-body h3 {
  margin: 0;
  font-size: 1.12rem;
  line-height: 1.3;
}

.subscribe {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem 1.75rem;
  background: linear-gradient(120deg, #fff9f2 0%, #ffffff 70%);
  border-color: #fde4c8;
}

.subscribe h2 {
  margin: 0;
  font-size: 1.25rem;
}

.subscribe p {
  margin: 0.35rem 0 0;
  max-width: 42ch;
}

@media (max-width: 820px) {
  .featured {
    grid-template-columns: 1fr;
  }

  .featured-media {
    min-height: 200px;
  }
}

@media (max-width: 520px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
