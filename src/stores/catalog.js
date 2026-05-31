import { defineStore } from 'pinia'
import * as catalogApi from '../api/catalog'
import { filterCatalogProducts, isValidCatalogProduct } from '../data/foodCatalog'

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    products: [],
    promotions: [],
    blogs: [],
    loading: false,
    error: null,
    loaded: false
  }),
  actions: {
    async fetchAll(force = false) {
      if (this.loaded && !force) return
      this.loading = true
      this.error = null
      try {
        const [productsRes, promotionsRes, blogsRes] = await Promise.all([
          catalogApi.fetchProducts(),
          catalogApi.fetchPromotions(),
          catalogApi.fetchBlogs()
        ])
        this.products = filterCatalogProducts(productsRes.data)
        this.promotions = promotionsRes.data
        this.blogs = blogsRes.data
        this.loaded = true
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to load content'
      } finally {
        this.loading = false
      }
    },
    async fetchProductById(id, force = false) {
      if (!force) {
        const cached = this.products.find((item) => item.id === Number(id))
        if (cached) return cached
      }
      const { data } = await catalogApi.fetchProduct(id)
      if (!isValidCatalogProduct(data)) return null
      const index = this.products.findIndex((item) => item.id === data.id)
      if (index >= 0) {
        this.products[index] = data
      } else {
        this.products.push(data)
      }
      return data
    }
  }
})
