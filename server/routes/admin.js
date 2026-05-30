import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../db.js'
import {
  filterCatalogProducts,
  isValidCatalogProduct
} from '../utils/catalogProducts.js'
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

router.post('/products', async (req, res) => {
  const { name, description, price, category, cuisineCategory, footerCuisine, image } = req.body
  const imageUrl = normalizeProductImageUrl(image)
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
  const result = await query(
    `INSERT INTO products (name, description, price, category, cuisine_category, footer_cuisine, image)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, description, Number(price), category, cuisineCategory, footerCuisine, imageUrl]
  )
  const rows = await query('SELECT * FROM products WHERE id = ?', [result.insertId])
  res.status(201).json(mapProduct(rows[0]))
})

router.put('/products/:id', async (req, res) => {
  const { name, description, price, category, cuisineCategory, footerCuisine, image } = req.body
  const imageUrl = normalizeProductImageUrl(image)
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
     cuisine_category = ?, footer_cuisine = ?, image = ? WHERE id = ?`,
    [name, description, Number(price), category, cuisineCategory, footerCuisine, imageUrl, req.params.id]
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
router.get('/promotions', async (_req, res) => {
  const rows = await query('SELECT * FROM promotions ORDER BY id ASC')
  res.json(rows.map(mapPromotion))
})

router.post('/promotions', async (req, res) => {
  const { title, detail, tagline, image, isActive = true } = req.body
  const imageUrl = normalizeProductImageUrl(image)
  if (!title || !detail || !imageUrl) {
    return res.status(400).json({ message: 'Title, detail, and image are required' })
  }
  const imageError = validateImageField(imageUrl)
  if (imageError) return res.status(400).json({ message: imageError })
  const result = await query(
    `INSERT INTO promotions (title, detail, tagline, image, is_active)
     VALUES (?, ?, ?, ?, ?)`,
    [title, detail, tagline || 'Limited time', imageUrl, isActive ? 1 : 0]
  )
  const rows = await query('SELECT * FROM promotions WHERE id = ?', [result.insertId])
  res.status(201).json(mapPromotion(rows[0]))
})

router.put('/promotions/:id', async (req, res) => {
  const { title, detail, tagline, image, isActive } = req.body
  const imageUrl = normalizeProductImageUrl(image)
  const existing = await query('SELECT id FROM promotions WHERE id = ?', [req.params.id])
  if (!existing.length) return res.status(404).json({ message: 'Promotion not found' })
  const imageError = validateImageField(imageUrl)
  if (imageError) return res.status(400).json({ message: imageError })
  await query(
    `UPDATE promotions SET title = ?, detail = ?, tagline = ?, image = ?, is_active = ? WHERE id = ?`,
    [title, detail, tagline || 'Limited time', imageUrl, isActive ? 1 : 0, req.params.id]
  )
  const rows = await query('SELECT * FROM promotions WHERE id = ?', [req.params.id])
  res.json(mapPromotion(rows[0]))
})

router.delete('/promotions/:id', async (req, res) => {
  const result = await query('DELETE FROM promotions WHERE id = ?', [req.params.id])
  if (result.affectedRows === 0) return res.status(404).json({ message: 'Promotion not found' })
  res.status(204).send()
})

// —— Blogs ——
router.get('/blogs', async (_req, res) => {
  const rows = await query('SELECT * FROM blogs ORDER BY id DESC')
  res.json(rows.map(mapBlog))
})

router.post('/blogs', async (req, res) => {
  const { tag, date, title, excerpt, isPublished = true } = req.body
  if (!tag || !date || !title || !excerpt) {
    return res.status(400).json({ message: 'Tag, date, title, and excerpt are required' })
  }
  const result = await query(
    `INSERT INTO blogs (tag, post_date, title, excerpt, is_published)
     VALUES (?, ?, ?, ?, ?)`,
    [tag, date, title, excerpt, isPublished ? 1 : 0]
  )
  const rows = await query('SELECT * FROM blogs WHERE id = ?', [result.insertId])
  res.status(201).json(mapBlog(rows[0]))
})

router.put('/blogs/:id', async (req, res) => {
  const { tag, date, title, excerpt, isPublished } = req.body
  const existing = await query('SELECT id FROM blogs WHERE id = ?', [req.params.id])
  if (!existing.length) return res.status(404).json({ message: 'Blog not found' })
  await query(
    `UPDATE blogs SET tag = ?, post_date = ?, title = ?, excerpt = ?, is_published = ? WHERE id = ?`,
    [tag, date, title, excerpt, isPublished ? 1 : 0, req.params.id]
  )
  const rows = await query('SELECT * FROM blogs WHERE id = ?', [req.params.id])
  res.json(mapBlog(rows[0]))
})

router.delete('/blogs/:id', async (req, res) => {
  const result = await query('DELETE FROM blogs WHERE id = ?', [req.params.id])
  if (result.affectedRows === 0) return res.status(404).json({ message: 'Blog not found' })
  res.status(204).send()
})

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
