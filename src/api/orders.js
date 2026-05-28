import api from './client'

export function createOrder(payload) {
  return api.post('/orders', payload)
}

export function fetchMyOrders() {
  return api.get('/orders')
}

export function fetchMyOrder(id) {
  return api.get(`/orders/${id}`)
}
