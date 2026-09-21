// PawBloom Pet Data - Core pet definitions

export type Species = 'dog' | 'cat';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type Personality = 
  | 'shy' | 'playful' | 'sleepy' | 'foodie' | 'curious' 
  | 'brave' | 'clingy' | 'tsundere' | 'explorer' | 'mischievous';

export interface PetDef {
  id: string;
  name: string;
  species: Species;
  description: string;
  baseRarity: Rarity;
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  traits: {
    bodyRatio: number;      // width:height
    headSize: number;       // 0-1 proportion
    earType: string;
    tailType: string;
    legLength: 'short' | 'medium' | 'long';
    coatType: 'smooth' | 'fluffy' | 'long';
  };
  catchPhrases: string[];
  funFact: string;
}

export const PETS: PetDef[] = [
  // DOGS
  {
    id: 'shiba-inu',
    name: 'Shiba Inu',
    species: 'dog',
    description: 'A confident and spirited companion with a fox-like face and curled tail.',
    baseRarity: 'common',
    colors: {
      primary: '#E8A857',
      secondary: '#FFF5E6',
      accent: '#3D3D3D'
    },
    traits: {
      bodyRatio: 1.2,
      headSize: 0.55,
      earType: 'pointed-up',
      tailType: 'curled',
      legLength: 'medium',
      coatType: 'fluffy'
    },
    catchPhrases: ['Much wow!', 'Such friend!', '*confident stance*'],
    funFact: 'Shiba Inus are one of the oldest dog breeds, originally from Japan!'
  },
  {
    id: 'corgi',
    name: 'Corgi',
    species: 'dog',
    description: 'A cheerful loaf with short legs, big ears, and an even bigger personality.',
    baseRarity: 'common',
    colors: {
      primary: '#D4915A',
      secondary: '#FFFFFF',
      accent: '#3D3D3D'
    },
    traits: {
      bodyRatio: 1.8,
      headSize: 0.5,
      earType: 'large-pointed',
      tailType: 'short',
      legLength: 'short',
      coatType: 'fluffy'
    },
    catchPhrases: ['*sploot*', 'Short legs, big dreams!', '*wiggle wiggle*'],
    funFact: 'Welsh legend says Corgis were ridden by fairy warriors!'
  },
  {
    id: 'golden-retriever',
    name: 'Golden Retriever',
    species: 'dog',
    description: 'The friendliest fluffball who just wants to make everyone happy.',
    baseRarity: 'uncommon',
    colors: {
      primary: '#E8C87D',
      secondary: '#F5E6D3',
      accent: '#3D3D3D'
    },
    traits: {
      bodyRatio: 1.3,
      headSize: 0.45,
      earType: 'floppy',
      tailType: 'long-wavy',
      legLength: 'medium',
      coatType: 'long'
    },
    catchPhrases: ['Best friend reporting!', '*happy tail wag*', 'Did someone say walk?!'],
    funFact: 'Golden Retrievers have such soft mouths they can carry eggs without breaking them!'
  },
  {
    id: 'french-bulldog',
    name: 'French Bulldog',
    species: 'dog',
    description: 'A compact charmer with bat ears and a heart full of snorts.',
    baseRarity: 'uncommon',
    colors: {
      primary: '#B8A090',
      secondary: '#F5E6D3',
      accent: '#3D3D3D'
    },
    traits: {
      bodyRatio: 1.0,
      headSize: 0.55,
      earType: 'bat',
      tailType: 'short',
      legLength: 'short',
      coatType: 'smooth'
    },
    catchPhrases: ['*snort*', 'I\'m not lazy, I\'m efficient!', '*bat ear wiggle*'],
    funFact: 'Despite their name, French Bulldogs were originally bred in England!'
  },
  {
    id: 'samoyed',
    name: 'Samoyed',
    species: 'dog',
    description: 'A fluffy cloud with the famous "Sammy smile" that warms every heart.',
    baseRarity: 'rare',
    colors: {
      primary: '#FFFFFF',
      secondary: '#F5F5F5',
      accent: '#3D3D3D'
    },
    traits: {
      bodyRatio: 1.2,
      headSize: 0.5,
      earType: 'pointed',
      tailType: 'fluffy-curl',
      legLength: 'medium',
      coatType: 'fluffy'
    },
    catchPhrases: ['*Sammy smile*', 'Floof incoming!', 'I\'m basically a cloud!'],
    funFact: 'Samoyed fur is hypoallergenic and has been used to knit clothing!'
  },
  {
    id: 'pomeranian',
    name: 'Pomeranian',
    species: 'dog',
    description: 'A tiny ball of fluff with a lion\'s heart and an attitude to match.',
    baseRarity: 'rare',
    colors: {
      primary: '#E8A857',
      secondary: '#FFF5E6',
      accent: '#3D3D3D'
    },
    traits: {
      bodyRatio: 0.8,
      headSize: 0.6,
      earType: 'small-pointed',
      tailType: 'plume',
      legLength: 'short',
      coatType: 'fluffy'
    },
    catchPhrases: ['Small but mighty!', '*fluffy strut*', 'I AM the main character!'],
    funFact: 'Pomeranians were once much larger and used to pull sleds!'
  },
  
  // CATS
  {
    id: 'orange-tabby',
    name: 'Orange Tabby',
    species: 'cat',
    description: 'A classic ginger with one shared brain cell and unlimited charm.',
    baseRarity: 'common',
    colors: {
      primary: '#E89A4A',
      secondary: '#FFF5E6',
      accent: '#F5C08A'
    },
    traits: {
      bodyRatio: 1.3,
      headSize: 0.5,
      earType: 'triangle',
      tailType: 'long',
      legLength: 'medium',
      coatType: 'smooth'
    },
    catchPhrases: ['*brain cell loading...*', 'Orange you glad to see me?', '*chaos mode activated*'],
    funFact: 'About 80% of orange cats are male!'
  },
  {
    id: 'tuxedo',
    name: 'Tuxedo Cat',
    species: 'cat',
    description: 'Always dressed for the occasion, with the sass to match.',
    baseRarity: 'common',
    colors: {
      primary: '#2D2D2D',
      secondary: '#FFFFFF',
      accent: '#4A4A4A'
    },
    traits: {
      bodyRatio: 1.2,
      headSize: 0.48,
      earType: 'triangle',
      tailType: 'long',
      legLength: 'medium',
      coatType: 'smooth'
    },
    catchPhrases: ['Formal attire only!', '*elegant poses*', 'Yes, I am this fancy.'],
    funFact: 'Tuxedo cats are known to be more intelligent and vocal than other cats!'
  },
  {
    id: 'british-shorthair',
    name: 'British Shorthair',
    species: 'cat',
    description: 'A distinguished chonk with copper eyes and endless dignity.',
    baseRarity: 'uncommon',
    colors: {
      primary: '#8B9AA5',
      secondary: '#B8C4CF',
      accent: '#C98E58'
    },
    traits: {
      bodyRatio: 1.1,
      headSize: 0.55,
      earType: 'round',
      tailType: 'medium',
      legLength: 'short',
      coatType: 'fluffy'
    },
    catchPhrases: ['*dignified stare*', 'I am not fat, I am fluffy.', 'Cheerio!'],
    funFact: 'British Shorthairs are often used as the model for the Cheshire Cat!'
  },
  {
    id: 'ragdoll',
    name: 'Ragdoll',
    species: 'cat',
    description: 'A floppy, blue-eyed sweetheart who goes limp in your arms.',
    baseRarity: 'rare',
    colors: {
      primary: '#F5E6D3',
      secondary: '#C4A882',
      accent: '#6B8BB8'
    },
    traits: {
      bodyRatio: 1.4,
      headSize: 0.48,
      earType: 'fluffy',
      tailType: 'fluffy-long',
      legLength: 'medium',
      coatType: 'long'
    },
    catchPhrases: ['*flop*', 'Pick me up!', 'I have no bones, only love.'],
    funFact: 'Ragdolls get their name from going completely limp when picked up!'
  },
  {
    id: 'calico',
    name: 'Calico',
    species: 'cat',
    description: 'A tri-colored treasure with a one-of-a-kind patchwork coat.',
    baseRarity: 'rare',
    colors: {
      primary: '#FFFFFF',
      secondary: '#E89A4A',
      accent: '#2D2D2D'
    },
    traits: {
      bodyRatio: 1.2,
      headSize: 0.5,
      earType: 'triangle',
      tailType: 'long',
      legLength: 'medium',
      coatType: 'smooth'
    },
    catchPhrases: ['I\'m a masterpiece!', '*sassy tail flick*', 'Yes, I know I\'m pretty.'],
    funFact: 'Almost all calico cats are female due to their unique genetics!'
  },
  {
    id: 'black-cat',
    name: 'Black Cat',
    species: 'cat',
    description: 'A sleek and elegant mystery wrapped in midnight fur.',
    baseRarity: 'uncommon',
    colors: {
      primary: '#1A1A1A',
      secondary: '#2D2D2D',
      accent: '#E8C87D'
    },
    traits: {
      bodyRatio: 1.3,
      headSize: 0.48,
      earType: 'pointed',
      tailType: 'long-slim',
      legLength: 'long',
      coatType: 'smooth'
    },
    catchPhrases: ['*mysterious appearance*', 'I bring good luck!', 'Void mode: activated.'],
    funFact: 'In Japan and the UK, black cats are considered good luck!'
  }
];

// Helper functions
export function getPetById(id: string): PetDef | undefined {
  return PETS.find(pet => pet.id === id);
}

export function getPetsBySpecies(species: Species): PetDef[] {
  return PETS.filter(pet => pet.species === species);
}

export function getPetsByRarity(rarity: Rarity): PetDef[] {
  return PETS.filter(pet => pet.baseRarity === rarity);
}

export function getStarterPets(): PetDef[] {
  return PETS.filter(pet => 
    pet.id === 'shiba-inu' || pet.id === 'corgi' || pet.id === 'orange-tabby'
  );
}

// Rarity weights for encounter system
export const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 55,
  uncommon: 25,
  rare: 12,
  epic: 6,
  legendary: 2
};

// Rarity colors
export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#8B9A6B',
  uncommon: '#6B8E8E',
  rare: '#9B8EC2',
  epic: '#D4A5C9',
  legendary: '#E8C87D'
};

// Personalities with their behavior modifiers
export const PERSONALITIES: Record<Personality, { walkSpeed: number; interactionRate: number; catchPhrase: string }> = {
  shy: { walkSpeed: 0.8, interactionRate: 0.5, catchPhrase: '*hides behind paw*' },
  playful: { walkSpeed: 1.2, interactionRate: 1.5, catchPhrase: 'Let\'s play!' },
  sleepy: { walkSpeed: 0.7, interactionRate: 0.3, catchPhrase: '*yawn*' },
  foodie: { walkSpeed: 1.0, interactionRate: 1.2, catchPhrase: 'Is that a treat?!' },
  curious: { walkSpeed: 1.1, interactionRate: 1.3, catchPhrase: 'Ooh, what\'s that?' },
  brave: { walkSpeed: 1.1, interactionRate: 1.0, catchPhrase: 'I\'ll protect you!' },
  clingy: { walkSpeed: 0.9, interactionRate: 1.4, catchPhrase: 'Don\'t leave me!' },
  tsundere: { walkSpeed: 1.0, interactionRate: 0.8, catchPhrase: 'It\'s not like I like you or anything!' },
  explorer: { walkSpeed: 1.3, interactionRate: 1.1, catchPhrase: 'Adventure awaits!' },
  mischievous: { walkSpeed: 1.2, interactionRate: 1.4, catchPhrase: '*plotting something*' }
};
