<template>
  <div class="about-page">
    <section class="about-hero">
      <img
        class="about-hero-bg"
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&h=900&fit=crop&q=85"
        alt=""
        loading="eager"
        decoding="async"
        referrerpolicy="no-referrer"
      />
      <div class="about-hero-overlay" aria-hidden="true"></div>
      <div class="about-hero-content">
        <p class="pill pill-warm">About FoodyHub</p>
        <h1>Food you love, delivered with care.</h1>
        <p class="about-hero-lead">
          We connect local kitchens with hungry customers through a simple experience built for
          everyday meals, office lunches, and family dinners.
        </p>
        <div class="about-hero-actions">
          <RouterLink class="btn btn-primary" to="/menu">Browse the menu</RouterLink>
          <RouterLink class="btn btn-ghost" to="/blog">Read our blog</RouterLink>
        </div>
      </div>
    </section>

    <section class="stats-strip" aria-label="Key metrics">
      <article v-for="stat in stats" :key="stat.label">
        <strong>{{ stat.value }}</strong>
        <span>{{ stat.label }}</span>
      </article>
    </section>

    <div class="about-body">
      <section class="values-section">
        <header class="section-head">
          <p class="eyebrow">What we stand for</p>
          <h2>Built around trust, taste, and speed</h2>
          <p class="muted section-lead">
            Every feature we ship is meant to make ordering feel effortless—from discovery to
            doorstep.
          </p>
        </header>
        <div class="values-grid">
          <article v-for="item in values" :key="item.title" class="value-card">
            <span class="value-icon" aria-hidden="true">{{ item.icon }}</span>
            <h3>{{ item.title }}</h3>
            <p class="muted">{{ item.text }}</p>
          </article>
        </div>
      </section>

      <section class="story-split">
        <div class="story-copy card">
          <p class="eyebrow">Our story</p>
          <h2>From a student project to a neighborhood favorite</h2>
          <p class="muted">
            FoodyHub began as a small assignment to simplify campus lunch orders. Today we partner
            with independent chefs and established brands alike—always with the same goal: clear
            menus, honest pricing, and food that arrives as good as it left the kitchen.
          </p>
          <p class="muted">
            We invest in delivery standards, live order updates, and restaurant tools so partners can
            focus on what they do best—cooking.
          </p>
        </div>
        <figure class="story-visual">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&h=700&fit=crop&q=85"
            alt="Chefs preparing food in a busy kitchen"
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
          />
          <figcaption class="story-caption card">
            <strong>Local first</strong>
            <span class="muted">Supporting kitchens in your community</span>
          </figcaption>
        </figure>
      </section>

      <section class="pillars card">
        <header class="section-head compact">
          <h2>Why customers keep coming back</h2>
        </header>
        <ul class="pillar-list">
          <li v-for="pillar in pillars" :key="pillar.title">
            <span class="pillar-dot" aria-hidden="true"></span>
            <div>
              <h3>{{ pillar.title }}</h3>
              <p class="muted">{{ pillar.text }}</p>
            </div>
          </li>
        </ul>
      </section>

      <section class="cta-banner">
        <div>
          <h2>Ready for your next meal?</h2>
          <p class="muted">Explore thousands of dishes from trusted restaurants near you.</p>
        </div>
        <RouterLink class="btn btn-primary" to="/menu">Order now</RouterLink>
      </section>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'

const stats = [
  { value: '60+', label: 'Partner restaurants' },
  { value: '18', label: 'Delivery zones' },
  { value: '4.8', label: 'Average rating' },
  { value: '40 min', label: 'Typical delivery' }
]

const values = [
  {
    icon: '🍽️',
    title: 'Our mission',
    text: 'Make online food ordering convenient while preserving quality from kitchen to doorstep.'
  },
  {
    icon: '🤝',
    title: 'Restaurant partners',
    text: 'Fair commissions, clear dashboards, and support that helps kitchens grow with us.'
  },
  {
    icon: '⚡',
    title: 'Customer experience',
    text: 'Live tracking, transparent fees, and menus that make it easy to find what you crave.'
  }
]

const pillars = [
  {
    title: 'Live order updates',
    text: 'Know exactly when your food is being prepared and when it is on the way.'
  },
  {
    title: 'Transparent pricing',
    text: 'No surprise fees at checkout—what you see is what you pay.'
  },
  {
    title: 'Menus for every appetite',
    text: 'From quick bites to family platters, filter by cuisine, diet, or mood.'
  }
]
</script>

<style scoped>
.about-page {
  width: 100%;
}

.about-hero {
  position: relative;
  min-height: clamp(320px, 52vh, 480px);
  display: grid;
  align-items: end;
  overflow: hidden;
}

.about-hero-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.about-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    rgba(15, 23, 42, 0.82) 0%,
    rgba(15, 23, 42, 0.55) 45%,
    rgba(255, 122, 0, 0.35) 100%
  );
}

.about-hero-content {
  position: relative;
  z-index: 1;
  width: min(1180px, 94vw);
  margin: 0 auto;
  padding: clamp(2.5rem, 6vw, 4rem) 0 3.5rem;
  color: #fff;
}

.about-hero-content h1 {
  margin: 0.75rem 0 0;
  max-width: 16ch;
  font-size: clamp(2rem, 4.5vw, 3.25rem);
  line-height: 1.08;
  letter-spacing: -0.02em;
}

.about-hero-lead {
  margin: 1rem 0 0;
  max-width: 52ch;
  font-size: 1.05rem;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.88);
}

.about-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-ghost {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(6px);
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.2);
}

.stats-strip {
  width: min(1180px, 94vw);
  margin: -2.5rem auto 0;
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
  padding: 1.1rem 1.25rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}

.stats-strip article {
  display: grid;
  gap: 0.2rem;
  text-align: center;
  padding: 0.35rem 0.5rem;
}

.stats-strip article:not(:last-child) {
  border-right: 1px solid var(--line);
}

.stats-strip strong {
  font-size: clamp(1.35rem, 2.5vw, 1.75rem);
  color: var(--primary);
  line-height: 1.1;
}

.stats-strip span {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.about-body {
  width: min(1180px, 94vw);
  margin: 0 auto;
  padding: 2.5rem 0 3rem;
  display: grid;
  gap: 2.5rem;
}

.eyebrow {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--primary);
}

.section-head h2 {
  margin: 0.35rem 0 0;
  font-size: clamp(1.5rem, 3vw, 2rem);
  letter-spacing: -0.02em;
}

.section-lead {
  margin: 0.6rem 0 0;
  max-width: 58ch;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.value-card {
  padding: 1.35rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--line);
  background: linear-gradient(160deg, #fff 0%, var(--surface-soft) 100%);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.value-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-card);
}

.value-icon {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 14px;
  background: var(--primary-soft);
  font-size: 1.35rem;
  margin-bottom: 0.85rem;
}

.value-card h3 {
  margin: 0 0 0.4rem;
  font-size: 1.1rem;
}

.value-card p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.55;
}

.story-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  align-items: stretch;
}

.story-copy {
  padding: 1.75rem;
  display: grid;
  align-content: center;
  gap: 0.85rem;
  background: linear-gradient(135deg, #fff 0%, #fff9f2 100%);
}

.story-copy h2 {
  margin: 0;
  font-size: clamp(1.35rem, 2.5vw, 1.75rem);
  line-height: 1.2;
}

.story-copy p {
  margin: 0;
  line-height: 1.6;
}

.story-visual {
  margin: 0;
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  min-height: 280px;
}

.story-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.story-caption {
  position: absolute;
  left: 1rem;
  right: 1rem;
  bottom: 1rem;
  padding: 0.85rem 1rem;
  display: grid;
  gap: 0.15rem;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-sm);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
}

.story-caption strong {
  font-size: 0.95rem;
}

.pillars {
  padding: 1.5rem 1.75rem;
  background: var(--surface);
}

.section-head.compact h2 {
  margin: 0;
  font-size: 1.35rem;
}

.pillar-list {
  list-style: none;
  margin: 1.25rem 0 0;
  padding: 0;
  display: grid;
  gap: 1.1rem;
}

.pillar-list li {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.85rem;
  align-items: start;
}

.pillar-dot {
  width: 10px;
  height: 10px;
  margin-top: 0.45rem;
  border-radius: 50%;
  background: var(--primary);
  box-shadow: 0 0 0 4px var(--primary-soft);
}

.pillar-list h3 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
}

.pillar-list p {
  margin: 0;
  font-size: 0.95rem;
}

.cta-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 1.75rem 2rem;
  border-radius: var(--radius-lg);
  background: linear-gradient(120deg, #ff7a00 0%, #ea6900 55%, #c2410c 100%);
  color: #fff;
  box-shadow: 0 16px 40px rgba(234, 105, 0, 0.28);
}

.cta-banner h2 {
  margin: 0;
  font-size: clamp(1.25rem, 2.5vw, 1.65rem);
}

.cta-banner .muted {
  margin: 0.4rem 0 0;
  color: rgba(255, 255, 255, 0.88);
}

.cta-banner .btn-primary {
  background: #fff;
  color: var(--primary-dark);
  flex-shrink: 0;
}

.cta-banner .btn-primary:hover {
  background: #fff7ed;
}

@media (max-width: 900px) {
  .stats-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: -1.5rem;
  }

  .stats-strip article:nth-child(2) {
    border-right: none;
  }

  .stats-strip article {
    border-right: none;
    border-bottom: 1px solid var(--line);
    padding-bottom: 0.75rem;
  }

  .stats-strip article:nth-last-child(-n + 2) {
    border-bottom: none;
    padding-bottom: 0.35rem;
  }

  .values-grid,
  .story-split {
    grid-template-columns: 1fr;
  }

  .story-visual {
    min-height: 220px;
    order: -1;
  }
}

@media (max-width: 520px) {
  .stats-strip {
    grid-template-columns: 1fr;
  }

  .stats-strip article {
    border-right: none !important;
    border-bottom: 1px solid var(--line);
  }

  .stats-strip article:last-child {
    border-bottom: none;
  }
}
</style>
