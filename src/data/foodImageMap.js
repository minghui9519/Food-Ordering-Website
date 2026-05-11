/** Stable fallback if a remote image fails in the browser. */
export const foodImageFallbackUrl =
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=640&h=640&fit=crop&q=85'

/**
 * One image URL per (cuisine × dish category), aligned with product names
 * (e.g. "American Classic Burger" → American + Burger).
 *
 * Mix of images.unsplash.com and images.pexels.com — each URL was HEAD-checked (200).
 */
const unsplash = (photoId) =>
  `https://images.unsplash.com/photo-${photoId}?w=640&h=640&fit=crop&q=85`

const pexels = (photoId) =>
  `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=640&h=640&dpr=1`

export const dishImageByCuisineAndCategory = {
  'American|Burger': unsplash('1568901346375-23c9450c58cd'),
  'American|Steak': unsplash('1544025162-d76694265947'),
  'American|Wrap': unsplash('1626700051175-6818013e1d4f'),

  'Italian|Pizza': unsplash('1604382354936-07c5d9983bd3'),
  'Italian|Pasta': unsplash('1621996346565-e3dbc646d9a9'),
  'Italian|Risotto': unsplash('1473093295043-cdd812d0e601'),

  'Mexican|Taco': pexels(8448339),
  'Mexican|Burrito': pexels(6210746),
  'Mexican|Quesadilla': pexels(15652996),

  'Japanese|Ramen': unsplash('1617093727343-374698b1b08d'),
  'Japanese|Donburi': unsplash('1546069901-ba9599a7e63c'),
  'Japanese|Udon': unsplash('1618841557871-b4664fbf0cb3'),

  'Korean|Bibimbap': unsplash('1608039755401-742074f0548d'),
  'Korean|Korean BBQ': pexels(1599487),
  'Korean|Stew': unsplash('1608039829572-78524f79c4c7'),

  'Thai|Curry': pexels(1585938),
  'Thai|Noodles': unsplash('1559314809-0d155014e29e'),
  'Thai|Rice': unsplash('1512058564366-18510be2db19'),

  'Chinese|Stir Fry': unsplash('1583032015879-e5022cb87c3b'),
  'Chinese|Noodles': unsplash('1585032226651-759b368d7246'),
  'Chinese|Dim Sum': pexels(14961162),

  'Indian|Curry': unsplash('1585937421612-70a008356fbe'),
  'Indian|Biryani': pexels(1633945),
  'Indian|Tandoori': pexels(1567620),

  'Vietnamese|Pho': unsplash('1582878826629-29b7ad1cdc43'),
  'Vietnamese|Banh Mi': unsplash('1601050690597-df0568f70950'),
  'Vietnamese|Vermicelli': unsplash('1551218808-94e220e084d2'),

  'French|Roast': unsplash('1559339352-11d035aa65de'),
  'French|Bistro': unsplash('1414235077428-338989a2e8c0'),
  'French|Crepe': pexels(15060849),

  'Spanish|Paella': unsplash('1515443961218-a51367888e4b'),
  'Spanish|Tapas': pexels(15460699),
  'Spanish|Grill': unsplash('1555939594-58d7cb561ad1'),

  'Turkish|Kebab': pexels(7440473),
  'Turkish|Pide': pexels(16049082),
  'Turkish|Meze': pexels(1647164),

  'MiddleEastern|Shawarma': pexels(7440473),
  'MiddleEastern|Rice Bowl': unsplash('1547592166-23ac45744acd'),
  'MiddleEastern|Grill': unsplash('1555939594-58d7cb561ad1'),

  'Mediterranean|Seafood': unsplash('1547592180-85f173990554'),
  'Mediterranean|Salad': unsplash('1512621776951-a57141f2eefd'),
  'Mediterranean|Grill': unsplash('1555939594-58d7cb561ad1'),

  'Indonesian|Rice Plate': pexels(15633798),
  'Indonesian|Satay': pexels(1628248),
  'Indonesian|Noodles': pexels(3296274),

  'Malaysian|Laksa': pexels(3611844),
  'Malaysian|Nasi': pexels(4253300),
  'Malaysian|Wok': pexels(15850322)
}

export function getDishImageUrl(cuisineKey, category) {
  const key = `${cuisineKey}|${category}`
  return dishImageByCuisineAndCategory[key] ?? null
}
