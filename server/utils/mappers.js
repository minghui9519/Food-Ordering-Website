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

export function mapProduct(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    category: row.category,
    cuisineCategory: row.cuisine_category,
    footerCuisine: row.footer_cuisine,
    image: row.image
  }
}

export function mapPromotion(row) {
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    detail: row.detail,
    tagline: row.tagline ?? 'Limited time',
    image: row.image,
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
    isPublished: Boolean(row.is_published)
  }
}

function parseJsonArray(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  try {
    return JSON.parse(value)
  } catch {
    return []
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
