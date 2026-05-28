import bcrypt from 'bcryptjs'
import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from './config.js'
import { products, promotions } from '../src/data/mockData.js'
import { foodImageFallbackUrl } from '../src/data/foodImageMap.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const blogPosts = [
  {
    tag: 'Kitchen Insight',
    post_date: 'May 2026',
    title: 'How We Keep Burgers Fresh During Delivery',
    excerpt:
      'A quick look at packaging layers, heat retention, and timing standards used by partner kitchens.'
  },
  {
    tag: 'Healthy Choice',
    post_date: 'Apr 2026',
    title: 'Balanced Lunch Picks Under 600 Calories',
    excerpt:
      'Simple combinations of wraps, salads, and soups that keep you full without feeling heavy.'
  },
  {
    tag: 'Community',
    post_date: 'Apr 2026',
    title: 'Local Restaurants We Love This Month',
    excerpt:
      'Meet independent chefs and neighborhood favorites now available through FoodyHub.'
  }
]

const taglines = ['Limited time', 'Best value', 'Popular deal']

async function run() {
  const rootConn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true
  })

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  await rootConn.query(schema)
  await rootConn.end()

  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database
  })

  const [userCount] = await conn.query('SELECT COUNT(*) AS count FROM users')
  if (userCount[0].count === 0) {
    const adminHash = await bcrypt.hash('admin123', 10)
    await conn.execute(
      `INSERT INTO users (name, email, password_hash, role, phone, address)
       VALUES (?, ?, ?, 'admin', ?, ?)`,
      ['FoodyHub Admin', 'admin@foodyhub.com', adminHash, '+60 12-000 0000', 'HQ, Kuala Lumpur']
    )
    console.log('Seeded admin: admin@foodyhub.com / admin123')
  }

  const [productCount] = await conn.query('SELECT COUNT(*) AS count FROM products')
  if (productCount[0].count === 0) {
    for (const p of products) {
      await conn.execute(
        `INSERT INTO products (name, description, price, category, cuisine_category, footer_cuisine, image)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [p.name, p.description, p.price, p.category, p.cuisineCategory, p.footerCuisine, p.image]
      )
    }
    console.log(`Seeded ${products.length} products`)
  }

  const [promoCount] = await conn.query('SELECT COUNT(*) AS count FROM promotions')
  if (promoCount[0].count === 0) {
    await Promise.all(
      promotions.map((promo, index) => {
        const image = products[index % products.length]?.image ?? foodImageFallbackUrl
        return conn.execute(
          `INSERT INTO promotions (title, detail, tagline, image, is_active)
           VALUES (?, ?, ?, ?, 1)`,
          [promo.title, promo.detail, taglines[index % taglines.length], image]
        )
      })
    )
    console.log(`Seeded ${promotions.length} promotions`)
  }

  const [blogCount] = await conn.query('SELECT COUNT(*) AS count FROM blogs')
  if (blogCount[0].count === 0) {
    for (const post of blogPosts) {
      await conn.execute(
        `INSERT INTO blogs (tag, post_date, title, excerpt, is_published)
         VALUES (?, ?, ?, ?, 1)`,
        [post.tag, post.post_date, post.title, post.excerpt]
      )
    }
    console.log(`Seeded ${blogPosts.length} blog posts`)
  }

  const ordersSchema = fs.readFileSync(path.join(__dirname, 'orders-schema.sql'), 'utf8')
  await conn.query(ordersSchema)
  console.log('Orders tables ready.')

  await conn.end()
  console.log('Database seed complete.')
}

run().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
