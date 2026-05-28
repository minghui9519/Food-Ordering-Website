import api from './client'

export function fetchProducts() {
  return api.get('/products')
}

export function fetchProduct(id) {
  return api.get(`/products/${id}`)
}

export function fetchPromotions() {
  return api.get('/promotions')
}

export function fetchBlogs() {
  return api.get('/blogs')
}
