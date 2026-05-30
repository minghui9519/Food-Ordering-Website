import {
  cuisineCatalog,
  cuisineToFooterCuisine,
  filterCatalogProducts,
  normalizeCuisineLabel
} from './foodCatalog.js'
import { getDishImageUrl, foodImageFallbackUrl } from './foodImageMap.js'

const productNameVariants = [
  'Classic',
  'Signature',
  'Spicy',
  'Heritage',
  'Street Style',
  'Chef Special',
  'Premium',
  'Smoky',
  'Family Platter',
  'Deluxe'
]

const generatedProducts = cuisineCatalog.flatMap((cuisine, cuisineIndex) =>
  productNameVariants.map((variant, itemIndex) => {
    const category = cuisine.categories[itemIndex % cuisine.categories.length]
    const id = cuisineIndex * productNameVariants.length + itemIndex + 1
    const normalizedCuisine = normalizeCuisineLabel(cuisine.cuisineCategory)
    const image =
      getDishImageUrl(cuisine.cuisineCategory, category) ?? foodImageFallbackUrl
    return {
      id,
      name: `${normalizedCuisine} ${variant} ${category}`,
      description: `${variant} ${normalizedCuisine.toLowerCase()} ${category.toLowerCase()} prepared fresh with balanced flavors.`,
      price: Number((9.5 + cuisineIndex * 0.45 + itemIndex * 0.55).toFixed(2)),
      category,
      cuisineCategory: normalizedCuisine,
      footerCuisine: cuisineToFooterCuisine[cuisine.cuisineCategory],
      image
    }
  })
)

export const products = filterCatalogProducts(generatedProducts)

export const promotions = [
  { id: 1, title: 'Lunch Combo', detail: 'Buy 1 burger and get fries at 50% off.' },
  { id: 2, title: 'Pizza Friday', detail: '20% off all pizzas every Friday.' },
  { id: 3, title: 'Student Special', detail: 'Free drink for student card holders.' }
]
