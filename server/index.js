import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import { pool } from './db.js'
import authRoutes from './routes/auth.js'
import publicRoutes from './routes/public.js'
import adminRoutes from './routes/admin.js'
import orderRoutes from './routes/orders.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true, database: 'connected' })
  } catch (err) {
    res.status(503).json({
      ok: false,
      message:
        err.code === 'ER_BAD_DB_ERROR'
          ? 'Database not found. Run: npm run db:seed'
          : 'Database unavailable. Check MySQL and your .env file.'
    })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api', publicRoutes)
app.use('/api/admin', adminRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  const message =
    err.code === 'ER_BAD_DB_ERROR'
      ? 'Database not found. Run: npm run db:seed'
      : err.code === 'ECONNREFUSED'
        ? 'Cannot connect to MySQL. Is the MySQL service running?'
        : 'Internal server error'
  res.status(500).json({ message })
})

app.listen(config.port, async () => {
  console.log(`API running at http://localhost:${config.port}`)
  console.log('Routes: /api/orders (customer), /api/admin/orders (admin)')
  try {
    await pool.query('SELECT 1')
    console.log(`MySQL connected (${config.db.database})`)
  } catch (err) {
    console.error(
      err.code === 'ER_BAD_DB_ERROR'
        ? `Database "${config.db.database}" not found. Run: npm run db:seed`
        : `MySQL error: ${err.message}`
    )
  }
})
