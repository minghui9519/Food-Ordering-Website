import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../db.js'
import { mapUser } from '../utils/mappers.js'
import { requireAuth, signToken } from '../middleware/auth.js'

const router = Router()

router.post('/register', async (req, res) => {
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
    const user = mapUser({
      id: result.insertId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: accountRole,
      phone: phone.trim(),
      address: address.trim()
    })
    const token = signToken(user)
    res.status(201).json({ token, user })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already registered' })
    }
    console.error(err)
    res.status(500).json({ message: 'Registration failed' })
  }
})

router.post('/login', async (req, res) => {
  const { email, password, role = 'customer' } = req.body
  if (!email?.trim() || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }
  const expectedRole = role === 'admin' ? 'admin' : 'customer'
  const rows = await query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()])
  if (!rows.length) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }
  const row = rows[0]
  const valid = await bcrypt.compare(password, row.password_hash)
  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }
  if (row.role !== expectedRole) {
    return res.status(403).json({
      message: `This account is registered as ${row.role}. Please select the correct account type.`
    })
  }
  const user = mapUser(row)
  res.json({ token: signToken(user), user })
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

router.put('/me', requireAuth, async (req, res) => {
  const { name, phone, address, password } = req.body
  if (!name?.trim()) {
    return res.status(400).json({ message: 'Name is required' })
  }
  if (password) {
    const hash = await bcrypt.hash(password, 10)
    await query(
      'UPDATE users SET name = ?, phone = ?, address = ?, password_hash = ? WHERE id = ?',
      [name.trim(), phone?.trim() ?? '', address?.trim() ?? '', hash, req.user.id]
    )
  } else {
    await query('UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?', [
      name.trim(),
      phone?.trim() ?? '',
      address?.trim() ?? '',
      req.user.id
    ])
  }
  const rows = await query('SELECT * FROM users WHERE id = ?', [req.user.id])
  res.json({ user: mapUser(rows[0]) })
})

export default router
