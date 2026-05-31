<template>
  <component :is="linkTag" v-bind="linkProps" class="read-link">
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import {
  isExternalReadMoreLink,
  isValidReadMoreLink,
  normalizeReadMoreLinkForSave
} from '../utils/linkUrl'

const props = defineProps({
  url: { type: String, default: '' }
})

const normalized = computed(() => normalizeReadMoreLinkForSave(props.url))
const hasCustomLink = computed(() => isValidReadMoreLink(normalized.value))
const href = computed(() => (hasCustomLink.value ? normalized.value : '/menu'))

const linkTag = computed(() => {
  if (hasCustomLink.value && isExternalReadMoreLink(normalized.value)) return 'a'
  return RouterLink
})

const linkProps = computed(() => {
  if (hasCustomLink.value && isExternalReadMoreLink(normalized.value)) {
    return {
      href: href.value,
      target: '_blank',
      rel: 'noopener noreferrer'
    }
  }
  return { to: href.value }
})
</script>

<style scoped>
.read-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.35rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--primary-dark);
  transition: gap 0.2s ease, color 0.2s ease;
}

.read-link:hover {
  gap: 0.55rem;
  color: var(--primary);
}
</style>
