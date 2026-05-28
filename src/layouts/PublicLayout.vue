<template>
  <div class="public-shell app-shell">
    <AppHeader />
    <main class="main-content">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'

function handleCartFly(event) {
  const target = document.getElementById('cart-chip-target')
  if (!target) return
  const targetRect = target.getBoundingClientRect()
  const startX = event.detail?.startX ?? targetRect.left
  const startY = event.detail?.startY ?? targetRect.top
  const endX = targetRect.left + targetRect.width / 2
  const endY = targetRect.top + targetRect.height / 2

  const dot = document.createElement('div')
  dot.textContent = '🛒'
  dot.style.position = 'fixed'
  dot.style.left = `${startX}px`
  dot.style.top = `${startY}px`
  dot.style.width = '34px'
  dot.style.height = '34px'
  dot.style.borderRadius = '999px'
  dot.style.display = 'grid'
  dot.style.placeItems = 'center'
  dot.style.fontSize = '1rem'
  dot.style.background = 'linear-gradient(135deg, #fde68a, #fb923c)'
  dot.style.boxShadow = '0 10px 24px rgba(249, 115, 22, 0.45)'
  dot.style.border = '1px solid rgba(255,255,255,0.7)'
  dot.style.pointerEvents = 'none'
  dot.style.zIndex = '70'
  document.body.appendChild(dot)

  const dx = endX - startX
  const dy = endY - startY
  const curveY = Math.min(-80, dy * -0.4)

  dot
    .animate(
      [
        { transform: 'translate(0px, 0px) scale(1)', opacity: 1, offset: 0 },
        { transform: `translate(${dx * 0.55}px, ${curveY}px) scale(1.08)`, opacity: 0.96, offset: 0.55 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.45)`, opacity: 0.08, offset: 1 }
      ],
      { duration: 900, easing: 'cubic-bezier(0.18, 0.7, 0.26, 1)' }
    )
    .finished.finally(() => {
      dot.remove()
      target.classList.add('cart-bump')
      window.setTimeout(() => target.classList.remove('cart-bump'), 260)
    })
}

onMounted(() => {
  document.documentElement.classList.remove('admin-mode')
  window.addEventListener('cart-fly', handleCartFly)
})

onUnmounted(() => {
  window.removeEventListener('cart-fly', handleCartFly)
})
</script>
