<template>
  <div class="about grid">
    <section class="hero card">
      <p class="pill pill-warm">About FoodyHub</p>
      <h1 class="section-title">We make food ordering fast, warm, and reliable.</h1>
      <p class="muted">
        FoodyHub connects local kitchens with hungry customers through a simple experience built for
        everyday meals, office lunches, and family dinners.
      </p>
    </section>

    <section class="story-grid">
      <article class="card">
        <h2>Our Story</h2>
        <p class="muted">
          Started as a small student project, FoodyHub grew into a platform focused on clear menus,
          trusted delivery, and strong restaurant partnerships.
        </p>
      </article>
      <article class="card">
        <h2>Our Mission</h2>
        <p class="muted">
          Make online food ordering convenient while preserving food quality from kitchen to doorstep.
        </p>
      </article>
      <article class="card">
        <h2>Why Customers Stay</h2>
        <p class="muted">Live order updates, transparent pricing, and a menu that suits every appetite.</p>
      </article>
    </section>

    <section class="card">
      <h2>Service Coverage</h2>
      <div class="coverage">
        <p><strong>60+</strong><span class="muted">Partner restaurants</span></p>
        <p><strong>18</strong><span class="muted">Delivery zones</span></p>
        <p><strong>4.8/5</strong><span class="muted">Customer satisfaction</span></p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about {
  gap: 1.2rem;
}

.hero {
  padding: 1.4rem;
}

.hero h1 {
  max-width: 18ch;
}

.story-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.story-grid h2 {
  margin: 0 0 0.45rem;
  font-size: 1.12rem;
}

.coverage {
  display: grid;
  gap: 0.8rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.coverage p {
  margin: 0;
  display: grid;
  gap: 0.15rem;
}

.coverage strong {
  font-size: 1.5rem;
}

@media (max-width: 820px) {
  .story-grid,
  .coverage {
    grid-template-columns: 1fr;
  }
}
</style>
