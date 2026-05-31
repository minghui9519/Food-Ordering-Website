import { normalizeLinkUrl } from '../../src/utils/linkUrl.js'
import { normalizeProductImageUrl, resolveProductImageUrl } from '../../src/utils/productImageUrl.js'

export function mapUser(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    phone: row.phone ?? '',
    address: row.address ?? ''
  }
}

function parseJsonArray(value) {
  if (!value) return []
  let current = value
  for (let depth = 0; depth < 3; depth += 1) {
    if (Array.isArray(current)) return current
    if (typeof current !== 'string') return []
    try {
      current = JSON.parse(current)
    } catch {
      return []
    }
  }
  return Array.isArray(current) ? current : []
}

export function mapProduct(row) {
  if (!row) return null
  const customizationOptions = parseJsonArray(row.customization_options)
    .map((item) => String(item).trim())
    .filter(Boolean)
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price) || 0,
    category: row.category,
    cuisineCategory: row.cuisine_category,
    footerCuisine: row.footer_cuisine,
    image: resolveProductImageUrl(row.image),
    customizationOptions
  }
}

export function mapPromotion(row) {
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    detail: row.detail,
    tagline: row.tagline ?? 'Limited time',
    image: resolveProductImageUrl(row.image),
    promoType: row.promo_type ?? 'percent',
    discountValue: Number(row.discount_value) || 0,
    targetCategories: parseJsonArray(row.target_categories),
    triggerProductId: row.trigger_product_id ?? null,
    freeItemLabel: row.free_item_label ?? '',
    isActive: Boolean(row.is_active)
  }
}

export function mapBlog(row) {
  if (!row) return null
  return {
    id: row.id,
    tag: row.tag,
    date: row.post_date,
    title: row.title,
    excerpt: row.excerpt,
    image: normalizeProductImageUrl(row.image),
    readMoreUrl: normalizeLinkUrl(row.read_more_url),
    isPublished: Boolean(row.is_published)
  }
}

export function mapOrderItem(row) {
  if (!row) return null
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    productName: row.product_name,
    unitPrice: Number(row.unit_price),
    quantity: row.quantity,
    lineTotal: Number(row.line_total),
    notes: row.notes ?? '',
    customIngredients: parseJsonArray(row.custom_ingredients),
    removedIngredients: parseJsonArray(row.removed_ingredients)
  }
}

export function mapOrder(row, items = []) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    customerName: row.customer_name,
    deliveryAddress: row.delivery_address,
    phone: row.phone,
    total: Number(row.total),
    status: row.status,
    createdAt: row.created_at,
    userName: row.user_name ?? undefined,
    userEmail: row.user_email ?? undefined,
    items: items.map(mapOrderItem)
  }
}
