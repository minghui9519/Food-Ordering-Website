import { computed, ref, watch } from 'vue'

export function useAdminPagination(source, pageSize = 10) {
  const currentPage = ref(1)
  const windowSize = 5

  const totalItems = computed(() => source.value.length)

  const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize)))

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return source.value.slice(start, start + pageSize)
  })

  const rangeStart = computed(() => {
    if (!totalItems.value) return 0
    return (currentPage.value - 1) * pageSize + 1
  })

  const rangeEnd = computed(() => Math.min(currentPage.value * pageSize, totalItems.value))

  const pageNumbers = computed(() => {
    const total = totalPages.value
    const current = currentPage.value
    let start = Math.max(1, current - Math.floor(windowSize / 2))
    let end = Math.min(total, start + windowSize - 1)
    start = Math.max(1, end - windowSize + 1)
    const pages = []
    for (let page = start; page <= end; page += 1) {
      pages.push(page)
    }
    return pages
  })

  function goToPage(page) {
    currentPage.value = Math.min(Math.max(1, page), totalPages.value)
  }

  function resetPage() {
    currentPage.value = 1
  }

  watch(totalItems, () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  })

  /** Destructure in setup so template refs unwrap: const { paginatedItems, goToPage } = useAdminPagination(list) */
  return {
    currentPage,
    totalItems,
    totalPages,
    paginatedItems,
    rangeStart,
    rangeEnd,
    pageNumbers,
    goToPage,
    resetPage
  }
}

export function formatAdminPrice(value) {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount.toFixed(2) : '0.00'
}
