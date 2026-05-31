<template>
  <div class="auth-shell" :class="{ 'auth-shell--wide': wide }">
    <header class="auth-hero card">
      <p v-if="eyebrow" class="auth-eyebrow">{{ eyebrow }}</p>
      <h1 class="auth-title">{{ title }}</h1>
      <p v-if="description" class="auth-desc muted">{{ description }}</p>
    </header>

    <section class="auth-panel card" :class="{ 'auth-panel--wide': wide }">
      <header v-if="panelTitle" class="panel-head">
        <span class="panel-icon" aria-hidden="true">{{ icon }}</span>
        <div>
          <h2 class="panel-title">{{ panelTitle }}</h2>
          <p v-if="panelSub" class="muted panel-sub">{{ panelSub }}</p>
        </div>
      </header>
      <slot />
    </section>

    <footer v-if="$slots.footer" class="auth-footer muted">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  panelTitle: { type: String, default: '' },
  panelSub: { type: String, default: '' },
  icon: { type: String, default: '🔐' },
  wide: { type: Boolean, default: false }
})
</script>

<style scoped>
.auth-shell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: 0 1rem 2.5rem;
}

.auth-shell--wide {
  max-width: 920px;
}

.auth-hero {
  width: 100%;
  text-align: center;
  padding: 1.5rem 1.35rem;
  background: linear-gradient(135deg, #fff9f2 0%, #ffffff 55%, #fff5ed 100%);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-card);
}

.auth-eyebrow {
  margin: 0 0 0.45rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--primary);
}

.auth-title {
  margin: 0;
  font-size: clamp(1.65rem, 4vw, 2rem);
  letter-spacing: -0.03em;
  line-height: 1.15;
}

.auth-desc {
  margin: 0.55rem auto 0;
  max-width: 34ch;
  font-size: 0.95rem;
  line-height: 1.55;
}

.auth-panel {
  width: 100%;
  padding: 1.5rem 1.75rem;
  box-shadow: var(--shadow-card);
}

.auth-panel--wide {
  padding: 1.65rem 2rem;
}

.panel-head {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.1rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--line);
}

.panel-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: grid;
  place-items: center;
  font-size: 1.25rem;
  background: var(--primary-soft);
  border-radius: 12px;
  flex-shrink: 0;
}

.panel-title {
  margin: 0;
  font-size: 1.15rem;
  letter-spacing: -0.02em;
}

.panel-sub {
  margin: 0.15rem 0 0;
  font-size: 0.88rem;
}

.auth-footer {
  width: 100%;
  text-align: center;
  font-size: 0.9rem;
  line-height: 1.5;
}

.auth-footer :deep(a) {
  color: var(--primary);
  font-weight: 600;
}

.auth-footer :deep(a:hover) {
  text-decoration: underline;
}
</style>
