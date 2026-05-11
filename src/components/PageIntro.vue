<template>
  <section class="card page-intro">
    <h1 class="section-title">{{ title }}</h1>
    <p class="muted">{{ description }}</p>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' }
})
</script>

<style scoped>
.page-intro {
  background: linear-gradient(120deg, #fff9f2 0%, #ffffff 70%);
}

.page-intro p {
  margin: 0;
}
</style>
