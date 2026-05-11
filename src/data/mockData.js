const cuisineToFooterCuisine = {
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

const cuisineCatalog = [
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

import { getDishImageUrl, foodImageFallbackUrl } from './foodImageMap'

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

export const products = cuisineCatalog.flatMap((cuisine, cuisineIndex) =>
  productNameVariants.map((variant, itemIndex) => {
    const category = cuisine.categories[itemIndex % cuisine.categories.length]
    const id = cuisineIndex * productNameVariants.length + itemIndex + 1
    const normalizedCuisine = cuisine.cuisineCategory.replace(/([A-Z])/g, ' $1').trim()
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

export const promotions = [
  { id: 1, title: 'Lunch Combo', detail: 'Buy 1 burger and get fries at 50% off.' },
  { id: 2, title: 'Pizza Friday', detail: '20% off all pizzas every Friday.' },
  { id: 3, title: 'Student Special', detail: 'Free drink for student card holders.' }
]
