export function getCategoryCustomizationDefaults(cuisineCategory = '', category = '') {
  const key = `${cuisineCategory} ${category}`.toLowerCase()
  const options = [
    'Protein',
    'Rice',
    'Vegetables',
    'Sauce',
    'Herbs',
    'Cheese',
    'Onion',
    'Garlic'
  ]
  if (key.includes('pizza') || key.includes('pasta')) {
    return ['Cheese', 'Sauce', 'Garlic', 'Mushroom', 'Olives']
  }
  if (key.includes('burger') || key.includes('wrap')) {
    return ['Cheese', 'Onion', 'Lettuce', 'Tomato', 'Sauce']
  }
  if (key.includes('ramen') || key.includes('noodle')) {
    return ['Noodles', 'Egg', 'Spring onion', 'Chili', 'Broth']
  }
  if (key.includes('curry') || key.includes('rice')) {
    return ['Protein', 'Rice', 'Chili', 'Herbs', 'Sauce']
  }
  return options
}

export function getProductCustomizationOptions(product) {
  if (product?.customizationOptions?.length) {
    return [...product.customizationOptions]
  }
  return getCategoryCustomizationDefaults(product?.cuisineCategory, product?.category)
}
