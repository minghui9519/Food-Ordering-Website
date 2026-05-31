/**
 * Adds blogs.image and blogs.read_more_url columns.
 * Run: npm run db:migrate-blog-image
 */
import mysql from 'mysql2/promise'
import { config } from './config.js'

const COLUMN_SPECS = [
  { name: 'image', sql: 'ADD COLUMN image VARCHAR(2048) NULL AFTER excerpt' },
  { name: 'read_more_url', sql: 'ADD COLUMN read_more_url VARCHAR(2048) NULL AFTER image' }
]

async function run() {
  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database
  })

  for (const spec of COLUMN_SPECS) {
    const [columns] = await conn.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'blogs' AND COLUMN_NAME = ?`,
      [config.db.database, spec.name]
    )

    if (!columns.length) {
      await conn.query(`ALTER TABLE blogs ${spec.sql}`)
      console.log(`Added blogs.${spec.name} column.`)
    } else {
      console.log(`blogs.${spec.name} column already exists.`)
    }
  }

  await conn.end()
  console.log('Blog columns migration complete.')
}

run().catch((err) => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
