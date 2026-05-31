export const PROMO_TYPES = {
  PERCENT: 'percent',
  BOGO: 'bogo',
  FREEBIE: 'freebie'
}

export function roundPrice(value) {
  return Math.round(Math.max(0, value) * 100) / 100
}

export function isPromotionActive(promo) {
  return Boolean(promo?.isActive)
}

export function promoTargetsAllCategories(promo) {
  const cats = promo?.targetCategories ?? []
  return !cats.length || cats.includes('All')
}

export function promoAppliesToProduct(promo, product) {
  if (!promo || !product) return false
  if (promo.promoType === PROMO_TYPES.FREEBIE) {
    return product.id === promo.triggerProductId
  }
  if (promoTargetsAllCategories(promo)) return true
  return (promo.targetCategories ?? []).includes(product.category)
}

export function getPromotionsForProduct(product, promotions) {
  return (promotions ?? []).filter(
    (promo) => isPromotionActive(promo) && promoAppliesToProduct(promo, product)
  )
}

export function formatPromoBadge(promo) {
  if (!promo) return 'Deal'
  switch (promo.promoType) {
    case PROMO_TYPES.PERCENT:
      return `${promo.discountValue}% OFF`
    case PROMO_TYPES.BOGO:
      return `2nd item ${promo.discountValue}% off`
    case PROMO_TYPES.FREEBIE:
      return `Free ${promo.freeItemLabel || 'item'}`
    default:
      return 'Deal'
  }
}

export function formatPromoDeal(promo, triggerProductName = '') {
  if (!promo) return ''
  switch (promo.promoType) {
    case PROMO_TYPES.PERCENT: {
      const scope = promoTargetsAllCategories(promo)
        ? 'all items'
        : (promo.targetCategories ?? []).join(', ')
      return `${promo.discountValue}% off ${scope}`
    }
    case PROMO_TYPES.BOGO: {
      const scope = promoTargetsAllCategories(promo)
        ? 'eligible items'
        : (promo.targetCategories ?? []).join(', ')
      return `Buy 1 get 2nd at ${promo.discountValue}% off (${scope})`
    }
    case PROMO_TYPES.FREEBIE:
      return triggerProductName
        ? `Free ${promo.freeItemLabel} with ${triggerProductName}`
        : `Free ${promo.freeItemLabel} with qualifying item`
    default:
      return promo.detail ?? ''
  }
}

function pricePromosForProduct(product, appliedPromotions) {
  return (appliedPromotions ?? []).filter(
    (promo) =>
      isPromotionActive(promo) &&
      (promo.promoType === PROMO_TYPES.PERCENT || promo.promoType === PROMO_TYPES.BOGO) &&
      promoAppliesToProduct(promo, product)
  )
}

export function calculateLineTotal(item, appliedPromotions) {
  const price = Number(item.price) || 0
  const qty = Math.max(1, Number(item.quantity) || 1)
  const promos = pricePromosForProduct(item, appliedPromotions)
  if (!promos.length) return roundPrice(price * qty)

  let bestTotal = price * qty
  for (const promo of promos) {
    let candidate = price * qty
    if (promo.promoType === PROMO_TYPES.PERCENT) {
      candidate = price * qty * (1 - promo.discountValue / 100)
    } else if (promo.promoType === PROMO_TYPES.BOGO) {
      const pairs = Math.floor(qty / 2)
      const remainder = qty % 2
      const discountedUnit = price * (1 - promo.discountValue / 100)
      candidate = pairs * (price + discountedUnit) + remainder * price
    }
    if (candidate < bestTotal) bestTotal = candidate
  }
  return roundPrice(bestTotal)
}

export function getMenuUnitPrice(product, appliedPromotions) {
  const price = Number(product?.price) || 0
  const percentPromos = pricePromosForProduct(product, appliedPromotions).filter(
    (promo) => promo.promoType === PROMO_TYPES.PERCENT
  )
  if (!percentPromos.length) {
    return { original: price, final: price, hasDiscount: false, promo: null }
  }
  const best = percentPromos.reduce((current, promo) =>
    promo.discountValue > current.discountValue ? promo : current
  )
  const final = roundPrice(price * (1 - best.discountValue / 100))
  return {
    original: price,
    final,
    hasDiscount: final < price,
    promo: best
  }
}

export function getAppliedFreebies(cartItems, appliedPromotions) {
  const freebies = []
  for (const promo of appliedPromotions ?? []) {
    if (!isPromotionActive(promo) || promo.promoType !== PROMO_TYPES.FREEBIE) continue
    const triggerQty = (cartItems ?? [])
      .filter((item) => item.id === promo.triggerProductId)
      .reduce((sum, item) => sum + item.quantity, 0)
    if (triggerQty > 0) {
      freebies.push({
        promoId: promo.id,
        label: promo.freeItemLabel,
        title: promo.title,
        quantity: triggerQty
      })
    }
  }
  return freebies
}

export function calculateCartSummary(cartItems, appliedPromotions) {
  const items = cartItems ?? []
  const promos = appliedPromotions ?? []
  const subtotal = roundPrice(items.reduce((sum, item) => sum + item.price * item.quantity, 0))
  const lines = items.map((item) => {
    const rawTotal = roundPrice(item.price * item.quantity)
    const lineTotal = calculateLineTotal(item, promos)
    return {
      ...item,
      rawTotal,
      lineTotal,
      savings: roundPrice(rawTotal - lineTotal)
    }
  })
  const merchandiseTotal = roundPrice(lines.reduce((sum, line) => sum + line.lineTotal, 0))
  const freebies = getAppliedFreebies(items, promos)
  const savings = roundPrice(subtotal - merchandiseTotal)

  return {
    subtotal,
    merchandiseTotal,
    total: merchandiseTotal,
    savings,
    freebies,
    lines
  }
}

export function buildMenuLinkForPromotion(promo) {
  const query = { promo: String(promo.id) }
  if (promo.promoType === PROMO_TYPES.FREEBIE && promo.triggerProductId) {
    query.product = String(promo.triggerProductId)
  } else if (!promoTargetsAllCategories(promo) && promo.targetCategories?.length) {
    query.category = promo.targetCategories[0]
  }
  return query
}
