/**
 * Adds products.customization_options and backfills existing rows
 * with the same category defaults used on the menu page.
 * Run: node server/migrate-customization-column.js
 */
import mysql from 'mysql2/promise'
import { config } from './config.js'
import { getCategoryCustomizationDefaults } from '../src/utils/productCustomization.js'

async function run() {
  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database
  })

  const [columns] = await conn.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'customization_options'`,
    [config.db.database]
  )

  if (!columns.length) {
    await conn.query('ALTER TABLE products ADD COLUMN customization_options JSON AFTER image')
    console.log('Added products.customization_options column.')
  } else {
    console.log('products.customization_options already exists.')
  }

  const [products] = await conn.query(
    'SELECT id, cuisine_category, category, customization_options FROM products'
  )

  let backfilled = 0
  let repaired = 0
  for (const row of products) {
    let options = []
    try {
      let current = row.customization_options
      for (let depth = 0; depth < 3; depth += 1) {
        if (Array.isArray(current)) {
          options = current.map((item) => String(item).trim()).filter(Boolean)
          break
        }
        if (typeof current !== 'string' || !current) break
        current = JSON.parse(current)
      }
    } catch {
      options = []
    }

    if (!options.length) {
      options = getCategoryCustomizationDefaults(row.cuisine_category, row.category)
      backfilled += 1
    } else if (typeof row.customization_options === 'string' && row.customization_options.startsWith('"')) {
      repaired += 1
    }

    await conn.execute('UPDATE products SET customization_options = ? WHERE id = ?', [
      JSON.stringify(options),
      row.id
    ])
  }

  console.log(`Synced customization options for ${products.length} product(s).`)
  if (backfilled) console.log(`Filled defaults for ${backfilled} product(s).`)
  if (repaired) console.log(`Repaired ${repaired} double-encoded product(s).`)
  await conn.end()
}

run().catch((err) => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
