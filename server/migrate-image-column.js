/**
 * Widens image columns so long https URLs are not truncated (which causes invalid data:... URLs).
 * Run: node server/migrate-image-column.js
 */
import mysql from 'mysql2/promise'
import { config } from './config.js'

async function run() {
  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database
  })

  await conn.query(
    'ALTER TABLE products MODIFY image VARCHAR(2048) NOT NULL'
  )
  await conn.query(
    'ALTER TABLE promotions MODIFY image VARCHAR(2048) NOT NULL'
  )

  console.log('Updated products.image and promotions.image to VARCHAR(2048).')
  await conn.end()
}

run().catch((err) => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
