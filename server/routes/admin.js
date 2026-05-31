import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { query, execute } from '../db.js'
import {
  filterCatalogProducts,
  isValidCatalogProduct,
  allProductCategories
} from '../utils/catalogProducts.js'
import {
  normalizeLinkUrl,
  normalizeReadMoreLinkForSave,
  readMoreLinkErrorMessage
} from '../../src/utils/linkUrl.js'
import {
  normalizeProductImageUrl,
  productImageUrlErrorMessage
} from '../../src/utils/productImageUrl.js'
import { mapBlog, mapOrder, mapProduct, mapPromotion, mapUser } from '../utils/mappers.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()
router.use(requireAuth, requireAdmin)

// —— Products ——
router.get('/products', async (_req, res) => {
  const rows = await query('SELECT * FROM products ORDER BY id ASC')
  res.json(filterCatalogProducts(rows.map(mapProduct)))
})

function validateImageField(image) {
  const message = productImageUrlErrorMessage(image)
  if (message) return message
  return null
}

function normalizeCustomizationOptions(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean)
      }
    } catch {
      return []
    }
  }
  return []
}

router.post('/products', async (req, res) => {
  const { name, description, price, category, cuisineCategory, footerCuisine, image, customizationOptions } =
    req.body
  const imageUrl = normalizeProductImageUrl(image)
  const options = normalizeCustomizationOptions(customizationOptions)
  if (!name || !description || price == null || !category || !cuisineCategory || !footerCuisine || !imageUrl) {
    return res.status(400).json({ message: 'All product fields are required' })
  }
  const imageError = validateImageField(imageUrl)
  if (imageError) return res.status(400).json({ message: imageError })
  if (!isValidCatalogProduct({ category, cuisineCategory, footerCuisine })) {
    return res.status(400).json({
      message: 'Food category and cuisine must match the catalog and a popular cuisine group'
    })
  }
  const result = await execute(
    `INSERT INTO products (name, description, price, category, cuisine_category, footer_cuisine, image, customization_options)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      description,
      Number(price),
      category,
      cuisineCategory,
      footerCuisine,
      imageUrl,
      JSON.stringify(options)
    ]
  )
  const rows = await query('SELECT * FROM products WHERE id = ?', [result.insertId])
  res.status(201).json(mapProduct(rows[0]))
})

router.put('/products/:id', async (req, res) => {
  const { name, description, price, category, cuisineCategory, footerCuisine, image, customizationOptions } =
    req.body
  const imageUrl = normalizeProductImageUrl(image)
  const options = normalizeCustomizationOptions(customizationOptions)
  const existing = await query('SELECT id FROM products WHERE id = ?', [req.params.id])
  if (!existing.length) return res.status(404).json({ message: 'Product not found' })
  const imageError = validateImageField(imageUrl)
  if (imageError) return res.status(400).json({ message: imageError })
  if (!isValidCatalogProduct({ category, cuisineCategory, footerCuisine })) {
    return res.status(400).json({
      message: 'Food category and cuisine must match the catalog and a popular cuisine group'
    })
  }
  await query(
    `UPDATE products SET name = ?, description = ?, price = ?, category = ?,
     cuisine_category = ?, footer_cuisine = ?, image = ?, customization_options = ? WHERE id = ?`,
    [
      name,
      description,
      Number(price),
      category,
      cuisineCategory,
      footerCuisine,
      imageUrl,
      JSON.stringify(options),
      req.params.id
    ]
  )
  const rows = await query('SELECT * FROM products WHERE id = ?', [req.params.id])
  res.json(mapProduct(rows[0]))
})

router.delete('/products/:id', async (req, res) => {
  const result = await query('DELETE FROM products WHERE id = ?', [req.params.id])
  if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' })
  res.status(204).send()
})

// —— Promotions ——
const PROMO_TYPES = new Set(['percent', 'bogo', 'freebie'])

function normalizeTargetCategories(value) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.map((item) => String(item).trim()).filter(Boolean))]
}

function normalizeTriggerProductId(value) {
  if (value == null || value === '') return null
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

function validatePromotionPayload(body) {
  const promoType = PROMO_TYPES.has(body.promoType) ? body.promoType : 'percent'
  const discountValue = Number(body.discountValue) || 0
  const targetCategories = normalizeTargetCategories(body.targetCategories)
  const triggerProductId = normalizeTriggerProductId(body.triggerProductId)
  const freeItemLabel = String(body.freeItemLabel ?? '').trim()

  if (promoType === 'percent' || promoType === 'bogo') {
    if (discountValue <= 0 || discountValue > 100) {
      return { error: 'Discount must be between 1 and 100 percent' }
    }
    if (targetCategories.length && !targetCategories.includes('All')) {
      const invalid = targetCategories.filter((cat) => !allProductCategories.includes(cat))
      if (invalid.length) {
        return { error: `Invalid food categories: ${invalid.join(', ')}` }
      }
    }
  }

  if (promoType === 'freebie') {
    if (!triggerProductId) {
      return { error: 'Select the product that triggers this freebie' }
    }
    if (!freeItemLabel) {
      return { error: 'Describe the free item (e.g. drink, fries)' }
    }
  }

  return {
    promoType,
    discountValue: promoType === 'freebie' ? 0 : discountValue,
    targetCategories: promoType === 'freebie' ? [] : targetCategories,
    triggerProductId: promoType === 'freebie' ? triggerProductId : null,
    freeItemLabel: promoType === 'freebie' ? freeItemLabel : null
  }
}

router.get('/promotions', asyncHandler(async (_req, res) => {
  const rows = await query('SELECT * FROM promotions ORDER BY id ASC')
  res.json(rows.map(mapPromotion))
}))

router.post('/promotions', asyncHandler(async (req, res) => {
  const { title, detail, tagline, image, isActive = true } = req.body
  const imageUrl = normalizeProductImageUrl(image)
  if (!title || !detail || !imageUrl) {
    return res.status(400).json({ message: 'Title, detail, and image are required' })
  }
  const imageError = validateImageField(imageUrl)
  if (imageError) return res.status(400).json({ message: imageError })

  const promoFields = validatePromotionPayload(req.body)
  if (promoFields.error) return res.status(400).json({ message: promoFields.error })

  if (promoFields.triggerProductId) {
    const productRows = await query('SELECT id FROM products WHERE id = ?', [promoFields.triggerProductId])
    if (!productRows.length) {
      return res.status(400).json({ message: 'Trigger product not found' })
    }
  }

  const result = await query(
    `INSERT INTO promotions
     (title, detail, tagline, image, promo_type, discount_value, target_categories, trigger_product_id, free_item_label, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      detail,
      tagline || 'Limited time',
      imageUrl,
      promoFields.promoType,
      promoFields.discountValue,
      JSON.stringify(promoFields.targetCategories),
      promoFields.triggerProductId,
      promoFields.freeItemLabel,
      isActive ? 1 : 0
    ]
  )
  const rows = await query('SELECT * FROM promotions WHERE id = ?', [result.insertId])
  res.status(201).json(mapPromotion(rows[0]))
}))

router.put('/promotions/:id', asyncHandler(async (req, res) => {
  const { title, detail, tagline, image, isActive } = req.body
  const imageUrl = normalizeProductImageUrl(image)
  const existing = await query('SELECT id FROM promotions WHERE id = ?', [req.params.id])
  if (!existing.length) return res.status(404).json({ message: 'Promotion not found' })
  const imageError = validateImageField(imageUrl)
  if (imageError) return res.status(400).json({ message: imageError })

  const promoFields = validatePromotionPayload(req.body)
  if (promoFields.error) return res.status(400).json({ message: promoFields.error })

  if (promoFields.triggerProductId) {
    const productRows = await query('SELECT id FROM products WHERE id = ?', [promoFields.triggerProductId])
    if (!productRows.length) {
      return res.status(400).json({ message: 'Trigger product not found' })
    }
  }

  await query(
    `UPDATE promotions SET title = ?, detail = ?, tagline = ?, image = ?,
     promo_type = ?, discount_value = ?, target_categories = ?, trigger_product_id = ?, free_item_label = ?, is_active = ?
     WHERE id = ?`,
    [
      title,
      detail,
      tagline || 'Limited time',
      imageUrl,
      promoFields.promoType,
      promoFields.discountValue,
      JSON.stringify(promoFields.targetCategories),
      promoFields.triggerProductId,
      promoFields.freeItemLabel,
      isActive ? 1 : 0,
      req.params.id
    ]
  )
  const rows = await query('SELECT * FROM promotions WHERE id = ?', [req.params.id])
  res.json(mapPromotion(rows[0]))
}))

router.delete('/promotions/:id', asyncHandler(async (req, res) => {
  const result = await query('DELETE FROM promotions WHERE id = ?', [req.params.id])
  if (result.affectedRows === 0) return res.status(404).json({ message: 'Promotion not found' })
  res.status(204).send()
}))

function pickReadMoreUrl(body) {
  const raw = body?.readMoreUrl ?? body?.read_more_url ?? ''
  return normalizeReadMoreLinkForSave(raw)
}

function pickBlogPublished(body) {
  if (body?.isPublished === undefined || body?.isPublished === null) return true
  return Boolean(body.isPublished)
}

// —— Blogs ——
router.get(
  '/blogs',
  asyncHandler(async (_req, res) => {
    const rows = await query('SELECT * FROM blogs ORDER BY id DESC')
    res.json(rows.map(mapBlog))
  })
)

router.post(
  '/blogs',
  asyncHandler(async (req, res) => {
    const { tag, date, title, excerpt, image = '', isPublished } = req.body
    if (!tag || !date || !title || !excerpt) {
      return res.status(400).json({ message: 'Tag, date, title, and excerpt are required' })
    }
    const imageUrl = normalizeProductImageUrl(image)
    const imageError = imageUrl ? productImageUrlErrorMessage(imageUrl) : ''
    if (imageError) return res.status(400).json({ message: imageError })
    const linkUrl = pickReadMoreUrl(req.body)
    const linkError = linkUrl ? readMoreLinkErrorMessage(linkUrl) : ''
    if (linkError) return res.status(400).json({ message: linkError })
    const published = pickBlogPublished(req.body)
    const result = await query(
      `INSERT INTO blogs (tag, post_date, title, excerpt, image, read_more_url, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [tag, date, title, excerpt, imageUrl || null, linkUrl || null, published ? 1 : 0]
    )
    const rows = await query('SELECT * FROM blogs WHERE id = ?', [result.insertId])
    res.status(201).json(mapBlog(rows[0]))
  })
)

router.put(
  '/blogs/:id',
  asyncHandler(async (req, res) => {
    const { tag, date, title, excerpt, image = '' } = req.body
    const existing = await query('SELECT id FROM blogs WHERE id = ?', [req.params.id])
    if (!existing.length) return res.status(404).json({ message: 'Blog not found' })
    const imageUrl = normalizeProductImageUrl(image)
    const imageError = imageUrl ? productImageUrlErrorMessage(imageUrl) : ''
    if (imageError) return res.status(400).json({ message: imageError })
    const linkUrl = pickReadMoreUrl(req.body)
    const linkError = linkUrl ? readMoreLinkErrorMessage(linkUrl) : ''
    if (linkError) return res.status(400).json({ message: linkError })
    const published = pickBlogPublished(req.body)
    await query(
      `UPDATE blogs SET tag = ?, post_date = ?, title = ?, excerpt = ?, image = ?, read_more_url = ?, is_published = ? WHERE id = ?`,
      [tag, date, title, excerpt, imageUrl || null, linkUrl || null, published ? 1 : 0, req.params.id]
    )
    const rows = await query('SELECT * FROM blogs WHERE id = ?', [req.params.id])
    res.json(mapBlog(rows[0]))
  })
)

router.delete(
  '/blogs/:id',
  asyncHandler(async (req, res) => {
    const result = await query('DELETE FROM blogs WHERE id = ?', [req.params.id])
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Blog not found' })
    res.status(204).send()
  })
)

// —— Users ——
router.get('/users', async (_req, res) => {
  const rows = await query('SELECT id, name, email, role, phone, address, created_at FROM users ORDER BY id ASC')
  res.json(rows.map(mapUser))
})

router.get('/users/:id', async (req, res) => {
  const rows = await query(
    'SELECT id, name, email, role, phone, address, created_at FROM users WHERE id = ?',
    [req.params.id]
  )
  if (!rows.length) return res.status(404).json({ message: 'User not found' })
  res.json(mapUser(rows[0]))
})

router.post('/users', async (req, res) => {
  const { name, email, password, role = 'customer', phone = '', address = '' } = req.body
  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' })
  }
  const accountRole = role === 'admin' ? 'admin' : 'customer'
  try {
    const hash = await bcrypt.hash(password, 10)
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, phone, address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), email.trim().toLowerCase(), hash, accountRole, phone.trim(), address.trim()]
    )
    const rows = await query(
      'SELECT id, name, email, role, phone, address FROM users WHERE id = ?',
      [result.insertId]
    )
    res.status(201).json(mapUser(rows[0]))
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already exists' })
    }
    throw err
  }
})

router.put('/users/:id', async (req, res) => {
  const { name, email, role, phone, address, password } = req.body
  const existing = await query('SELECT id FROM users WHERE id = ?', [req.params.id])
  if (!existing.length) return res.status(404).json({ message: 'User not found' })
  const accountRole = role === 'admin' ? 'admin' : 'customer'
  if (password) {
    const hash = await bcrypt.hash(password, 10)
    await query(
      `UPDATE users SET name = ?, email = ?, role = ?, phone = ?, address = ?, password_hash = ? WHERE id = ?`,
      [name.trim(), email.trim().toLowerCase(), accountRole, phone?.trim() ?? '', address?.trim() ?? '', hash, req.params.id]
    )
  } else {
    await query(
      `UPDATE users SET name = ?, email = ?, role = ?, phone = ?, address = ? WHERE id = ?`,
      [name.trim(), email.trim().toLowerCase(), accountRole, phone?.trim() ?? '', address?.trim() ?? '', req.params.id]
    )
  }
  const rows = await query(
    'SELECT id, name, email, role, phone, address FROM users WHERE id = ?',
    [req.params.id]
  )
  res.json(mapUser(rows[0]))
})

router.delete('/users/:id', async (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ message: 'You cannot delete your own account while logged in' })
  }
  const admins = await query("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'")
  const target = await query('SELECT role FROM users WHERE id = ?', [req.params.id])
  if (!target.length) return res.status(404).json({ message: 'User not found' })
  if (target[0].role === 'admin' && admins[0].count <= 1) {
    return res.status(400).json({ message: 'Cannot delete the last admin account' })
  }
  await query('DELETE FROM users WHERE id = ?', [req.params.id])
  res.status(204).send()
})

// —— Orders / transactions ——
async function fetchAdminOrder(orderId) {
  const rows = await query(
    `SELECT o.*, u.name AS user_name, u.email AS user_email
     FROM orders o
     JOIN users u ON u.id = o.user_id
     WHERE o.id = ?`,
    [orderId]
  )
  if (!rows.length) return null
  const itemRows = await query('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC', [orderId])
  return mapOrder(rows[0], itemRows)
}

router.get(
  '/orders',
  asyncHandler(async (_req, res) => {
    const rows = await query(
      `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM orders o
       JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC`
    )
    const orders = []
    for (const row of rows) {
      const itemRows = await query('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC', [row.id])
      orders.push(mapOrder(row, itemRows))
    }
    res.json(orders)
  })
)

router.get(
  '/orders/:id',
  asyncHandler(async (req, res) => {
    const order = await fetchAdminOrder(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json(order)
  })
)

router.put(
  '/orders/:id',
  asyncHandler(async (req, res) => {
    const { status } = req.body
    const allowed = ['Preparing', 'Delivered', 'Cancelled']
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }
    const existing = await query('SELECT id FROM orders WHERE id = ?', [req.params.id])
    if (!existing.length) return res.status(404).json({ message: 'Order not found' })
    await query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id])
    const order = await fetchAdminOrder(req.params.id)
    res.json(order)
  })
)

export default router
