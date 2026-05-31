const MAX_LINK_URL_LENGTH = 2048

export function normalizeLinkUrl(value) {
  return String(value ?? '').trim()
}

/** Prepare link for storage: trim, optional https:// for bare domains. */
export function normalizeReadMoreLinkForSave(value) {
  let url = normalizeLinkUrl(value)
  if (!url) return ''
  if (url.startsWith('/')) return url
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }
  return url
}

/** Site path (e.g. /menu) or http(s) URL. */
export function isValidReadMoreLink(value) {
  const url = normalizeLinkUrl(value)
  if (!url || url.length > MAX_LINK_URL_LENGTH) return false
  if (url.startsWith('//')) return false
  if (url.startsWith('/')) {
    return /^\/[\w\-./?#=&%]*$/.test(url)
  }
  if (/^data:/i.test(url)) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function readMoreLinkErrorMessage(value) {
  const url = normalizeReadMoreLinkForSave(value)
  if (!url) return ''
  if (/^data:/i.test(url)) {
    return 'Paste a full https:// link or a site path like /menu.'
  }
  if (url.length > MAX_LINK_URL_LENGTH) {
    return `Link is too long (max ${MAX_LINK_URL_LENGTH} characters).`
  }
  if (!isValidReadMoreLink(url)) {
    return 'Enter https://… for external pages or /menu-style paths for this site.'
  }
  return ''
}

export function isExternalReadMoreLink(value) {
  const url = normalizeLinkUrl(value)
  return url.startsWith('http://') || url.startsWith('https://')
}
