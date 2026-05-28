import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mysql from 'mysql2/promise'
import { config } from './config.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function run() {
  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    multipleStatements: true
  })
  const sql = fs.readFileSync(path.join(__dirname, 'orders-schema.sql'), 'utf8')
  await conn.query(sql)
  await conn.end()
  console.log('Orders / order_items tables are ready.')
}

run().catch((err) => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
