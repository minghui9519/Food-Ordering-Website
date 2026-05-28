import api from './client'

export function login(payload) {
  return api.post('/auth/login', payload)
}

export function register(payload) {
  return api.post('/auth/register', payload)
}

export function fetchMe() {
  return api.get('/auth/me')
}

export function updateProfile(payload) {
  return api.put('/auth/me', payload)
}
