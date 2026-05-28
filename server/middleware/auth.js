import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { query } from '../db.js'
import { mapUser } from '../utils/mappers.js'

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, { expiresIn: '7d' })
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' })
  }
  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret)
    const rows = await query('SELECT * FROM users WHERE id = ?', [payload.sub])
    if (!rows.length) {
      return res.status(401).json({ message: 'User not found' })
    }
    req.user = mapUser(rows[0])
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}
