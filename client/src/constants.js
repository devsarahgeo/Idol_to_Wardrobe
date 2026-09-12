const CATEGORY_ICONS = {
  jacket: '🧥',
  outerwear: '🧥',
  top: '👕',
  bottom: '👖',
  shoes: '👟',
  accessory: '💍',
  dress: '👗',
}

export function categoryIcon(category) {
  return CATEGORY_ICONS[category?.toLowerCase()] || '❓'
}
