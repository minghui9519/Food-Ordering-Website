import bcrypt from 'bcryptjs'
import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from './config.js'
import { products } from '../src/data/mockData.js'
import { foodImageFallbackUrl } from '../src/data/foodImageMap.js'
import { isValidCatalogProduct } from '../src/data/foodCatalog.js'
import { getCategoryCustomizationDefaults } from '../src/utils/productCustomization.js'
import { mapProduct } from './utils/mappers.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const blogPosts = [
  {
    tag: 'Kitchen Insight',
    post_date: 'May 2026',
    title: 'How We Keep Burgers Fresh During Delivery',
    excerpt:
      'A quick look at packaging layers, heat retention, and timing standards used by partner kitchens.',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=520&fit=crop&q=85',
    read_more_url: '/menu'
  },
  {
    tag: 'Healthy Choice',
    post_date: 'Apr 2026',
    title: 'Balanced Lunch Picks Under 600 Calories',
    excerpt:
      'Simple combinations of wraps, salads, and soups that keep you full without feeling heavy.',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=520&fit=crop&q=85',
    read_more_url: '/promotions'
  },
  {
    tag: 'Community',
    post_date: 'Apr 2026',
    title: 'Local Restaurants We Love This Month',
    excerpt:
      'Meet independent chefs and neighborhood favorites now available through FoodyHub.',
    image:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=520&fit=crop&q=85',
    read_more_url: '/about'
  }
]

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
      const customizationOptions = getCategoryCustomizationDefaults(p.cuisineCategory, p.category)
      await conn.execute(
        `INSERT INTO products (name, description, price, category, cuisine_category, footer_cuisine, image, customization_options)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.name,
          p.description,
          p.price,
          p.category,
          p.cuisineCategory,
          p.footerCuisine,
          p.image,
          JSON.stringify(customizationOptions)
        ]
      )
    }
    console.log(`Seeded ${products.length} products`)
  }

  const [allProducts] = await conn.query('SELECT * FROM products')
  let removedInvalid = 0
  for (const row of allProducts) {
    if (!isValidCatalogProduct(mapProduct(row))) {
      await conn.execute('DELETE FROM products WHERE id = ?', [row.id])
      removedInvalid += 1
    }
  }
  if (removedInvalid > 0) {
    console.log(`Removed ${removedInvalid} product(s) that did not match the catalog`)
  }

  const [promoCount] = await conn.query('SELECT COUNT(*) AS count FROM promotions')
  if (promoCount[0].count === 0) {
    const [burgerRows] = await conn.query("SELECT id FROM products WHERE category = 'Burger' LIMIT 1")
    const burgerId = burgerRows[0]?.id ?? null
    const seedPromotions = [
      {
        title: 'Pizza Friday',
        detail: '20% off all pizzas every Friday.',
        tagline: 'Limited time',
        promoType: 'percent',
        discountValue: 20,
        targetCategories: ['Pizza']
      },
      {
        title: 'Burger BOGO',
        detail: 'Buy one burger and get the second at 50% off.',
        tagline: 'Best value',
        promoType: 'bogo',
        discountValue: 50,
        targetCategories: ['Burger']
      },
      {
        title: 'Student Special',
        detail: 'Free drink when you order any burger.',
        tagline: 'Popular deal',
        promoType: 'freebie',
        discountValue: 0,
        targetCategories: [],
        triggerProductId: burgerId,
        freeItemLabel: 'drink'
      }
    ]

    await Promise.all(
      seedPromotions.map((promo, index) => {
        const image = products[index % products.length]?.image ?? foodImageFallbackUrl
        return conn.execute(
          `INSERT INTO promotions
           (title, detail, tagline, image, promo_type, discount_value, target_categories, trigger_product_id, free_item_label, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [
            promo.title,
            promo.detail,
            promo.tagline,
            image,
            promo.promoType,
            promo.discountValue,
            JSON.stringify(promo.targetCategories),
            promo.triggerProductId,
            promo.freeItemLabel ?? null
          ]
        )
      })
    )
    console.log(`Seeded ${seedPromotions.length} promotions`)
  }

  const [blogCount] = await conn.query('SELECT COUNT(*) AS count FROM blogs')
  if (blogCount[0].count === 0) {
    for (const post of blogPosts) {
      await conn.execute(
        `INSERT INTO blogs (tag, post_date, title, excerpt, image, read_more_url, is_published)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [
          post.tag,
          post.post_date,
          post.title,
          post.excerpt,
          post.image ?? null,
          post.read_more_url ?? null
        ]
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
