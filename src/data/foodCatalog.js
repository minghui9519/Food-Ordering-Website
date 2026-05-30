/** Maps full cuisine names to footer "Popular Cuisines" groups. */
export const cuisineToFooterCuisine = {
  American: 'American',
  Italian: 'Italian',
  Mexican: 'Mexican',
  Japanese: 'Japanese',
  Korean: 'Korean',
  Thai: 'Thai',
  Chinese: 'Japanese',
  Indian: 'Thai',
  Vietnamese: 'Thai',
  French: 'Italian',
  Spanish: 'Italian',
  Turkish: 'Italian',
  MiddleEastern: 'Italian',
  Mediterranean: 'Italian',
  Indonesian: 'Thai',
  Malaysian: 'Thai'
}

export const cuisineCatalog = [
  { cuisineCategory: 'American', categories: ['Burger', 'Steak', 'Wrap'], image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600' },
  { cuisineCategory: 'Italian', categories: ['Pizza', 'Pasta', 'Risotto'], image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600' },
  { cuisineCategory: 'Mexican', categories: ['Taco', 'Burrito', 'Quesadilla'], image: 'https://images.unsplash.com/photo-1565299585323-38174c4a6471?w=600' },
  { cuisineCategory: 'Japanese', categories: ['Ramen', 'Donburi', 'Udon'], image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=600' },
  { cuisineCategory: 'Korean', categories: ['Bibimbap', 'Korean BBQ', 'Stew'], image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=600' },
  { cuisineCategory: 'Thai', categories: ['Curry', 'Noodles', 'Rice'], image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600' },
  { cuisineCategory: 'Chinese', categories: ['Stir Fry', 'Noodles', 'Dim Sum'], image: 'https://images.unsplash.com/photo-1583032015879-e5022cb87c3b?w=600' },
  { cuisineCategory: 'Indian', categories: ['Curry', 'Biryani', 'Tandoori'], image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600' },
  { cuisineCategory: 'Vietnamese', categories: ['Pho', 'Banh Mi', 'Vermicelli'], image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600' },
  { cuisineCategory: 'French', categories: ['Roast', 'Bistro', 'Crepe'], image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600' },
  { cuisineCategory: 'Spanish', categories: ['Paella', 'Tapas', 'Grill'], image: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=600' },
  { cuisineCategory: 'Turkish', categories: ['Kebab', 'Pide', 'Meze'], image: 'https://images.unsplash.com/photo-1604908177522-4726f9f2f13f?w=600' },
  { cuisineCategory: 'MiddleEastern', categories: ['Shawarma', 'Rice Bowl', 'Grill'], image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600' },
  { cuisineCategory: 'Mediterranean', categories: ['Seafood', 'Salad', 'Grill'], image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600' },
  { cuisineCategory: 'Indonesian', categories: ['Rice Plate', 'Satay', 'Noodles'], image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600' },
  { cuisineCategory: 'Malaysian', categories: ['Laksa', 'Nasi', 'Wok'], image: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=600' }
]

export const popularCuisines = [...new Set(Object.values(cuisineToFooterCuisine))].sort()

export function normalizeCuisineLabel(key) {
  return key.replace(/([A-Z])/g, ' $1').trim()
}

export function cuisineKeyFromLabel(label) {
  if (!label) return ''
  const entry = cuisineCatalog.find(
    (item) => normalizeCuisineLabel(item.cuisineCategory) === label.trim()
  )
  return entry?.cuisineCategory ?? label.replace(/\s+/g, '')
}

export function resolveFooterCuisine(cuisineLabel) {
  const key = cuisineKeyFromLabel(cuisineLabel)
  if (!key || !(key in cuisineToFooterCuisine)) return null
  return cuisineToFooterCuisine[key]
}

/** True when cuisine and food category exist in the catalog (any pairing allowed). */
export function isValidCatalogProduct(product) {
  if (!product?.category || !product?.cuisineCategory || !product?.footerCuisine) {
    return false
  }

  const key = cuisineKeyFromLabel(product.cuisineCategory)
  const cuisineKnown = cuisineCatalog.some((item) => item.cuisineCategory === key)
  if (!cuisineKnown || !allProductCategories.includes(product.category)) {
    return false
  }

  const expectedFooter = cuisineToFooterCuisine[key]
  if (!expectedFooter || !popularCuisines.includes(expectedFooter)) {
    return false
  }

  return product.footerCuisine === expectedFooter
}

export function filterCatalogProducts(products) {
  return products.filter(isValidCatalogProduct)
}

export const cuisineOptions = cuisineCatalog.map((item) => ({
  key: item.cuisineCategory,
  label: normalizeCuisineLabel(item.cuisineCategory),
  image: item.image,
  categories: item.categories
}))

export const allProductCategories = [...new Set(cuisineCatalog.flatMap((item) => item.categories))].sort()

export function productCategoriesForCuisine(cuisineLabel) {
  const key = cuisineKeyFromLabel(cuisineLabel)
  const entry = cuisineCatalog.find((item) => item.cuisineCategory === key)
  return entry ? [...entry.categories] : []
}
