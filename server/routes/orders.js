import { Router } from 'express'
import { pool } from '../db.js'
import { mapOrder, mapOrderItem } from '../utils/mappers.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()
router.use(requireAuth)

async function fetchOrderWithItems(orderId, userId = null) {
  const params = [orderId]
  let userClause = ''
  if (userId != null) {
    userClause = ' AND o.user_id = ?'
    params.push(userId)
  }
  const orders = await pool.execute(
    `SELECT o.*, u.name AS user_name, u.email AS user_email
     FROM orders o
     JOIN users u ON u.id = o.user_id
     WHERE o.id = ?${userClause}`,
    params
  )
  const rows = orders[0]
  if (!rows.length) return null
  const itemRows = await pool.execute('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC', [
    orderId
  ])
  return mapOrder(rows[0], itemRows[0])
}

router.post(
  '/',
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can place orders' })
    }
    const { customerName, deliveryAddress, phone, items } = req.body
    if (!customerName?.trim() || !deliveryAddress?.trim() || !phone?.trim()) {
      return res.status(400).json({ message: 'Name, address, and phone are required' })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must include at least one item' })
    }

    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()
      let total = 0
      const normalizedItems = items.map((item) => {
        const quantity = Math.max(1, Number(item.quantity) || 1)
        const unitPrice = Number(item.unitPrice ?? item.price)
        const lineTotal = Number((unitPrice * quantity).toFixed(2))
        total += lineTotal
        return {
          productId: item.productId ?? item.id ?? null,
          productName: item.productName ?? item.name,
          unitPrice,
          quantity,
          lineTotal,
          notes: item.notes ?? '',
          customIngredients: item.customIngredients ?? [],
          removedIngredients: item.removedIngredients ?? []
        }
      })
      total = Number(total.toFixed(2))

      const [orderResult] = await conn.execute(
        `INSERT INTO orders (user_id, customer_name, delivery_address, phone, total, status)
         VALUES (?, ?, ?, ?, ?, 'Preparing')`,
        [
          req.user.id,
          customerName.trim(),
          deliveryAddress.trim(),
          phone.trim(),
          total
        ]
      )
      const orderId = orderResult.insertId

      for (const item of normalizedItems) {
        await conn.execute(
          `INSERT INTO order_items
           (order_id, product_id, product_name, unit_price, quantity, line_total, notes, custom_ingredients, removed_ingredients)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.productId,
            item.productName,
            item.unitPrice,
            item.quantity,
            item.lineTotal,
            item.notes,
            JSON.stringify(item.customIngredients),
            JSON.stringify(item.removedIngredients)
          ]
        )
      }

      await conn.commit()
      const order = await fetchOrderWithItems(orderId, req.user.id)
      res.status(201).json(order)
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }
  })
)

router.get(
  '/',
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can view order history' })
    }
    const [rows] = await pool.execute(
      `SELECT o.* FROM orders o WHERE o.user_id = ? ORDER BY o.created_at DESC`,
      [req.user.id]
    )
    const orders = []
    for (const row of rows) {
      const [itemRows] = await pool.execute('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC', [
        row.id
      ])
      orders.push(mapOrder(row, itemRows))
    }
    res.json(orders)
  })
)

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can view order details' })
    }
    const order = await fetchOrderWithItems(req.params.id, req.user.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json(order)
  })
)

export default router
