// PawBloom Decor System

export interface DecorItem {
  id: string;
  name: string;
  description: string;
  category: 'head' | 'body' | 'accessory';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockCondition: {
    type: 'default' | 'bond' | 'event' | 'collection' | 'purchase';
    value?: number | string;
  };
  colors: {
    primary: string;
    secondary?: string;
  };
}

export interface DecorSet {
  id: string;
  name: string;
  description: string;
  items: string[];
  bonusEffect?: string;
}

export const DECOR_ITEMS: DecorItem[] = [
  // NORMAL SET (Default)
  {
    id: 'collar-basic',
    name: 'Basic Collar',
    description: 'A simple, comfortable collar.',
    category: 'accessory',
    rarity: 'common',
    unlockCondition: { type: 'default' },
    colors: { primary: '#8CB369' }
  },
  
  // EXPLORER SET
  {
    id: 'explorer-backpack',
    name: 'Explorer Backpack',
    description: 'A tiny backpack for big adventures!',
    category: 'body',
    rarity: 'uncommon',
    unlockCondition: { type: 'bond', value: 2 },
    colors: { primary: '#8B7355', secondary: '#6B5344' }
  },
  {
    id: 'explorer-bandana',
    name: 'Explorer Bandana',
    description: 'A stylish bandana for the adventurous pet.',
    category: 'accessory',
    rarity: 'uncommon',
    unlockCondition: { type: 'bond', value: 2 },
    colors: { primary: '#E57373', secondary: '#FFFFFF' }
  },
  {
    id: 'explorer-hat',
    name: 'Explorer Hat',
    description: 'A tiny safari hat for exploring!',
    category: 'head',
    rarity: 'uncommon',
    unlockCondition: { type: 'collection', value: 3 },
    colors: { primary: '#C9B8A8', secondary: '#8B7355' }
  },
  
  // RAINCOAT SET
  {
    id: 'raincoat-yellow',
    name: 'Yellow Raincoat',
    description: 'Staying dry has never looked cuter!',
    category: 'body',
    rarity: 'uncommon',
    unlockCondition: { type: 'bond', value: 3 },
    colors: { primary: '#FFD93D', secondary: '#FFC107' }
  },
  {
    id: 'raincoat-boots',
    name: 'Rain Boots',
    description: 'Tiny boots for splashing in puddles.',
    category: 'accessory',
    rarity: 'uncommon',
    unlockCondition: { type: 'bond', value: 3 },
    colors: { primary: '#FFD93D', secondary: '#FFC107' }
  },
  {
    id: 'raincoat-hat',
    name: "Rain Hat",
    description: 'A cute hat to keep the rain off.',
    category: 'head',
    rarity: 'uncommon',
    unlockCondition: { type: 'collection', value: 5 },
    colors: { primary: '#FFD93D', secondary: '#FFC107' }
  },
  
  // SAKURA SET (Event)
  {
    id: 'sakura-crown',
    name: 'Sakura Flower Crown',
    description: 'A delicate crown of cherry blossoms.',
    category: 'head',
    rarity: 'rare',
    unlockCondition: { type: 'event', value: 'sakura-festival' },
    colors: { primary: '#FFB7C5', secondary: '#FF8FAB' }
  },
  {
    id: 'sakura-cape',
    name: 'Petal Cape',
    description: 'A flowing cape adorned with sakura petals.',
    category: 'body',
    rarity: 'rare',
    unlockCondition: { type: 'event', value: 'sakura-festival' },
    colors: { primary: '#FFB7C5', secondary: '#FFFFFF' }
  },
  {
    id: 'sakura-ribbon',
    name: 'Sakura Ribbon',
    description: 'A pretty pink ribbon with a sakura charm.',
    category: 'accessory',
    rarity: 'rare',
    unlockCondition: { type: 'event', value: 'sakura-festival' },
    colors: { primary: '#FFB7C5', secondary: '#FF8FAB' }
  }
];

export const DECOR_SETS: DecorSet[] = [
  {
    id: 'normal',
    name: 'Normal',
    description: 'The default look.',
    items: ['collar-basic']
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Ready for adventure!',
    items: ['explorer-backpack', 'explorer-bandana', 'explorer-hat'],
    bonusEffect: '+10% encounter rate in new areas'
  },
  {
    id: 'raincoat',
    name: 'Rainy Day',
    description: 'Perfect for puddle jumping!',
    items: ['raincoat-yellow', 'raincoat-boots', 'raincoat-hat'],
    bonusEffect: 'Special rainy day animations'
  },
  {
    id: 'sakura',
    name: 'Sakura Festival',
    description: 'Celebrate spring in style!',
    items: ['sakura-crown', 'sakura-cape', 'sakura-ribbon'],
    bonusEffect: 'Sakura petal trail effect'
  }
];

export function getDecorById(id: string): DecorItem | undefined {
  return DECOR_ITEMS.find(item => item.id === id);
}

export function getDecorByCategory(category: DecorItem['category']): DecorItem[] {
  return DECOR_ITEMS.filter(item => item.category === category);
}

export function getDecorSetById(id: string): DecorSet | undefined {
  return DECOR_SETS.find(set => set.id === id);
}

export function isDecorUnlocked(
  decor: DecorItem, 
  bondLevel: number, 
  collectionCount: number,
  activeEvents: string[]
): boolean {
  const { type, value } = decor.unlockCondition;
  
  switch (type) {
    case 'default':
      return true;
    case 'bond':
      return bondLevel >= (value as number);
    case 'collection':
      return collectionCount >= (value as number);
    case 'event':
      return activeEvents.includes(value as string);
    case 'purchase':
      return false; // Handled separately
    default:
      return false;
  }
}
