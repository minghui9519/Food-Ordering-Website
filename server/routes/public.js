import { Router } from 'express'
import { query } from '../db.js'
import { mapBlog, mapProduct, mapPromotion } from '../utils/mappers.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get(
  '/products',
  asyncHandler(async (_req, res) => {
    const rows = await query('SELECT * FROM products ORDER BY id ASC')
    res.json(rows.map(mapProduct))
  })
)

router.get(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const rows = await query('SELECT * FROM products WHERE id = ?', [req.params.id])
    if (!rows.length) return res.status(404).json({ message: 'Product not found' })
    res.json(mapProduct(rows[0]))
  })
)

router.get(
  '/promotions',
  asyncHandler(async (_req, res) => {
    const rows = await query('SELECT * FROM promotions WHERE is_active = 1 ORDER BY id ASC')
    res.json(rows.map(mapPromotion))
  })
)

router.get(
  '/blogs',
  asyncHandler(async (_req, res) => {
    const rows = await query('SELECT * FROM blogs WHERE is_published = 1 ORDER BY id DESC')
    res.json(rows.map(mapBlog))
  })
)

export default router
