/**
 * Adds promotion deal columns (type, discount, categories, freebie trigger).
 * Run: npm run db:migrate-promotion
 */
import mysql from 'mysql2/promise'
import { config } from './config.js'

const COLUMN_SPECS = [
  {
    name: 'promo_type',
    sql: "ADD COLUMN promo_type ENUM('percent', 'bogo', 'freebie') NOT NULL DEFAULT 'percent' AFTER image"
  },
  {
    name: 'discount_value',
    sql: 'ADD COLUMN discount_value DECIMAL(10, 2) NOT NULL DEFAULT 0 AFTER promo_type'
  },
  {
    name: 'target_categories',
    sql: "ADD COLUMN target_categories JSON NULL AFTER discount_value"
  },
  {
    name: 'trigger_product_id',
    sql: 'ADD COLUMN trigger_product_id INT NULL AFTER target_categories'
  },
  {
    name: 'free_item_label',
    sql: 'ADD COLUMN free_item_label VARCHAR(200) NULL AFTER trigger_product_id'
  }
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
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'promotions' AND COLUMN_NAME = ?`,
      [config.db.database, spec.name]
    )
    if (!columns.length) {
      await conn.query(`ALTER TABLE promotions ${spec.sql}`)
      console.log(`Added promotions.${spec.name} column.`)
    }
  }

  const [rows] = await conn.query('SELECT id, title, target_categories, discount_value FROM promotions')
  for (const row of rows) {
    const categories =
      row.target_categories == null || row.target_categories === ''
        ? JSON.stringify([])
        : row.target_categories
    await conn.execute('UPDATE promotions SET target_categories = ? WHERE id = ?', [categories, row.id])
  }

  const [nullCats] = await conn.query(
    `SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'promotions'
       AND COLUMN_NAME = 'target_categories' AND IS_NULLABLE = 'YES'`,
    [config.db.database]
  )
  if (nullCats[0].count > 0) {
    await conn.query('UPDATE promotions SET target_categories = JSON_ARRAY() WHERE target_categories IS NULL')
    await conn.query('ALTER TABLE promotions MODIFY target_categories JSON NOT NULL')
  }

  await conn.end()
  console.log('Promotion migration complete.')
}

run().catch((err) => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
