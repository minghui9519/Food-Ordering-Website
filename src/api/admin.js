import api from './client'

const admin = (path, config) => api.request({ url: `/admin${path}`, ...config })

export const adminProducts = {
  list: () => admin('/products'),
  create: (data) => admin('/products', { method: 'POST', data }),
  update: (id, data) => admin(`/products/${id}`, { method: 'PUT', data }),
  remove: (id) => admin(`/products/${id}`, { method: 'DELETE' })
}

export const adminPromotions = {
  list: () => admin('/promotions'),
  create: (data) => admin('/promotions', { method: 'POST', data }),
  update: (id, data) => admin(`/promotions/${id}`, { method: 'PUT', data }),
  remove: (id) => admin(`/promotions/${id}`, { method: 'DELETE' })
}

export const adminBlogs = {
  list: () => admin('/blogs'),
  create: (data) => admin('/blogs', { method: 'POST', data }),
  update: (id, data) => admin(`/blogs/${id}`, { method: 'PUT', data }),
  remove: (id) => admin(`/blogs/${id}`, { method: 'DELETE' })
}

export const adminUsers = {
  list: () => admin('/users'),
  get: (id) => admin(`/users/${id}`),
  create: (data) => admin('/users', { method: 'POST', data }),
  update: (id, data) => admin(`/users/${id}`, { method: 'PUT', data }),
  remove: (id) => admin(`/users/${id}`, { method: 'DELETE' })
}

export const adminOrders = {
  list: () => admin('/orders'),
  get: (id) => admin(`/orders/${id}`),
  updateStatus: (id, status) => admin(`/orders/${id}`, { method: 'PUT', data: { status } })
}
