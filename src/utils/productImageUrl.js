import { foodImageFallbackUrl } from '../data/foodImageMap.js'

const MAX_IMAGE_URL_LENGTH = 2048

/** Accept only http(s) links — not data: URIs or truncated base64 paste. */
export function isValidHttpImageUrl(value) {
  const url = String(value ?? '').trim()
  if (!url || url.length > MAX_IMAGE_URL_LENGTH) return false
  if (/^data:/i.test(url)) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function normalizeProductImageUrl(value) {
  return String(value ?? '').trim()
}

export function resolveProductImageUrl(value) {
  const normalized = normalizeProductImageUrl(value)
  return isValidHttpImageUrl(normalized) ? normalized : foodImageFallbackUrl
}

export function productImageUrlErrorMessage(value) {
  const url = normalizeProductImageUrl(value)
  if (!url) return 'Image URL is required.'
  if (/^data:/i.test(url)) {
    return 'Paste a direct https:// image link, not embedded image data (base64).'
  }
  if (url.length > MAX_IMAGE_URL_LENGTH) {
    return `Image URL is too long (max ${MAX_IMAGE_URL_LENGTH} characters).`
  }
  if (!isValidHttpImageUrl(url)) {
    return 'Enter a valid image URL starting with https:// or http://.'
  }
  return ''
}
