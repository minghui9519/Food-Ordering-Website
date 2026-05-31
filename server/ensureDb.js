import { pool } from './db.js'
import { getCategoryCustomizationDefaults } from '../src/utils/productCustomization.js'

function parseStoredOptions(value) {
  let current = value
  for (let depth = 0; depth < 3; depth += 1) {
    if (Array.isArray(current)) {
      return current.map((item) => String(item).trim()).filter(Boolean)
    }
    if (typeof current !== 'string' || !current) return []
    try {
      current = JSON.parse(current)
    } catch {
      return []
    }
  }
  return Array.isArray(current) ? current : []
}

const PROMOTION_COLUMN_SPECS = [
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
    sql: 'ADD COLUMN target_categories JSON NULL AFTER discount_value'
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

export async function ensureCustomizationColumn() {
  const [columns] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'customization_options'`
  )

  if (!columns.length) {
    await pool.query('ALTER TABLE products ADD COLUMN customization_options JSON NULL AFTER image')
    console.log('Added products.customization_options column.')
  }

  const [products] = await pool.query(
    'SELECT id, cuisine_category, category, customization_options FROM products'
  )

  let synced = 0
  for (const row of products) {
    const options = parseStoredOptions(row.customization_options)
    const needsSync =
      !options.length ||
      (typeof row.customization_options === 'string' && row.customization_options.startsWith('"['))

    if (!needsSync) continue

    const nextOptions = options.length
      ? options
      : getCategoryCustomizationDefaults(row.cuisine_category, row.category)

    await pool.execute('UPDATE products SET customization_options = ? WHERE id = ?', [
      JSON.stringify(nextOptions),
      row.id
    ])
    synced += 1
  }

  if (synced > 0) {
    console.log(`Synced customization options for ${synced} product(s).`)
  }
}

function parseTargetCategories(value) {
  if (value == null || value === '') return []
  if (Array.isArray(value)) return value
  if (typeof value === 'object') return []
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

const LEGACY_PROMOTION_DEFAULTS = {
  'Lunch Combo': { promoType: 'bogo', discountValue: 50, targetCategories: ['Burger', 'Wrap'] },
  'Pizza Friday': { promoType: 'percent', discountValue: 20, targetCategories: ['Pizza'] },
  'Student Special': { promoType: 'freebie', discountValue: 0, targetCategories: [], freeItemLabel: 'drink' }
}

export async function ensurePromotionColumns() {
  for (const spec of PROMOTION_COLUMN_SPECS) {
    const [columns] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'promotions' AND COLUMN_NAME = ?`,
      [spec.name]
    )
    if (!columns.length) {
      await pool.query(`ALTER TABLE promotions ${spec.sql}`)
      console.log(`Added promotions.${spec.name} column.`)
    }
  }

  const [rows] = await pool.query(
    'SELECT id, title, promo_type, discount_value, target_categories, trigger_product_id, free_item_label FROM promotions'
  )

  const [burgerRows] = await pool.query("SELECT id FROM products WHERE category = 'Burger' LIMIT 1")
  const defaultBurgerId = burgerRows[0]?.id ?? null

  let repaired = 0
  for (const row of rows) {
    const categories = parseTargetCategories(row.target_categories)
    const legacy = LEGACY_PROMOTION_DEFAULTS[row.title]
    const shouldUseLegacy = Number(row.discount_value) <= 0 && Boolean(legacy)
    const promoType = shouldUseLegacy ? legacy.promoType : row.promo_type || 'percent'
    const discountValue = shouldUseLegacy
      ? legacy.discountValue
      : Number(row.discount_value) > 0
        ? Number(row.discount_value)
        : 0
    const targetCategories = shouldUseLegacy
      ? legacy.targetCategories
      : categories.length > 0
        ? categories
        : []
    const freeItemLabel = shouldUseLegacy
      ? legacy.freeItemLabel ?? null
      : row.free_item_label || null
    const triggerProductId = shouldUseLegacy
      ? promoType === 'freebie'
        ? defaultBurgerId
        : null
      : row.trigger_product_id ?? (promoType === 'freebie' ? defaultBurgerId : null)

    const needsRepair =
      row.target_categories == null ||
      row.target_categories === '' ||
      shouldUseLegacy ||
      (promoType === 'freebie' && !row.trigger_product_id && defaultBurgerId)

    if (!needsRepair) continue

    await pool.execute(
      `UPDATE promotions SET promo_type = ?, discount_value = ?, target_categories = ?,
       trigger_product_id = ?, free_item_label = ? WHERE id = ?`,
      [
        promoType,
        discountValue,
        JSON.stringify(targetCategories),
        promoType === 'freebie' ? triggerProductId : null,
        promoType === 'freebie' ? freeItemLabel : null,
        row.id
      ]
    )
    repaired += 1
  }

  if (repaired > 0) {
    console.log(`Repaired ${repaired} legacy promotion(s).`)
  }
}

const BLOG_COLUMN_SPECS = [
  { name: 'image', sql: 'ADD COLUMN image VARCHAR(2048) NULL AFTER excerpt' },
  { name: 'read_more_url', sql: 'ADD COLUMN read_more_url VARCHAR(2048) NULL AFTER image' }
]

export async function ensureBlogColumns() {
  for (const spec of BLOG_COLUMN_SPECS) {
    const [columns] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'blogs' AND COLUMN_NAME = ?`,
      [spec.name]
    )

    if (!columns.length) {
      await pool.query(`ALTER TABLE blogs ${spec.sql}`)
      console.log(`Added blogs.${spec.name} column.`)
    }
  }
}

/** @deprecated Use ensureBlogColumns */
export async function ensureBlogImageColumn() {
  await ensureBlogColumns()
}
