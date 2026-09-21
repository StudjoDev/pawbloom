// PawBloom Environment Data

export interface EnvironmentLayer {
  id: string;
  type: 'sky' | 'far-bg' | 'mid-bg' | 'ground' | 'foreground';
  parallaxSpeed: number;
  zIndex: number;
}

export interface EnvironmentDef {
  id: string;
  name: string;
  description: string;
  unlockSteps: number;
  layers: EnvironmentLayer[];
  colors: {
    skyTop: string;
    skyBottom: string;
    ground: string;
    path: string;
    accent: string;
  };
  elements: string[];
  ambience: string;
}

export const ENVIRONMENTS: EnvironmentDef[] = [
  {
    id: 'park',
    name: 'Sunny Park',
    description: 'A peaceful park with swaying trees and chirping birds.',
    unlockSteps: 0,
    layers: [
      { id: 'sky', type: 'sky', parallaxSpeed: 0.1, zIndex: 0 },
      { id: 'far-bg', type: 'far-bg', parallaxSpeed: 0.3, zIndex: 1 },
      { id: 'mid-bg', type: 'mid-bg', parallaxSpeed: 0.6, zIndex: 2 },
      { id: 'ground', type: 'ground', parallaxSpeed: 1.0, zIndex: 3 },
      { id: 'foreground', type: 'foreground', parallaxSpeed: 1.2, zIndex: 4 }
    ],
    colors: {
      skyTop: '#B8D4E8',
      skyBottom: '#D4E8F5',
      ground: '#A8D08D',
      path: '#E8D5BC',
      accent: '#8CB369'
    },
    elements: ['trees', 'benches', 'lamp-posts', 'flowers', 'birds', 'butterflies'],
    ambience: 'birds-chirping'
  },
  {
    id: 'city',
    name: 'Cozy Town',
    description: 'A charming neighborhood with colorful shops and cafes.',
    unlockSteps: 2000,
    layers: [
      { id: 'sky', type: 'sky', parallaxSpeed: 0.1, zIndex: 0 },
      { id: 'far-bg', type: 'far-bg', parallaxSpeed: 0.3, zIndex: 1 },
      { id: 'mid-bg', type: 'mid-bg', parallaxSpeed: 0.6, zIndex: 2 },
      { id: 'ground', type: 'ground', parallaxSpeed: 1.0, zIndex: 3 },
      { id: 'foreground', type: 'foreground', parallaxSpeed: 1.2, zIndex: 4 }
    ],
    colors: {
      skyTop: '#C5D5E8',
      skyBottom: '#E8EEF5',
      ground: '#9B9B9B',
      path: '#C9B8A8',
      accent: '#F4A261'
    },
    elements: ['shops', 'cafe', 'crosswalk', 'street-lamp', 'awnings', 'flower-pots'],
    ambience: 'city-gentle'
  },
  {
    id: 'riverside',
    name: 'Gentle River',
    description: 'A serene riverside with willow trees and gentle waters.',
    unlockSteps: 5000,
    layers: [
      { id: 'sky', type: 'sky', parallaxSpeed: 0.1, zIndex: 0 },
      { id: 'far-bg', type: 'far-bg', parallaxSpeed: 0.3, zIndex: 1 },
      { id: 'mid-bg', type: 'mid-bg', parallaxSpeed: 0.6, zIndex: 2 },
      { id: 'ground', type: 'ground', parallaxSpeed: 1.0, zIndex: 3 },
      { id: 'foreground', type: 'foreground', parallaxSpeed: 1.2, zIndex: 4 }
    ],
    colors: {
      skyTop: '#A8C8E8',
      skyBottom: '#D4E8F5',
      ground: '#7CB369',
      path: '#E8D5BC',
      accent: '#89B8D4'
    },
    elements: ['willows', 'bridge', 'ducks', 'reeds', 'stepping-stones', 'fish'],
    ambience: 'water-gentle'
  },
  {
    id: 'beach',
    name: 'Sunset Beach',
    description: 'A warm beach with soft sand and gentle waves.',
    unlockSteps: 10000,
    layers: [
      { id: 'sky', type: 'sky', parallaxSpeed: 0.1, zIndex: 0 },
      { id: 'far-bg', type: 'far-bg', parallaxSpeed: 0.3, zIndex: 1 },
      { id: 'mid-bg', type: 'mid-bg', parallaxSpeed: 0.6, zIndex: 2 },
      { id: 'ground', type: 'ground', parallaxSpeed: 1.0, zIndex: 3 },
      { id: 'foreground', type: 'foreground', parallaxSpeed: 1.2, zIndex: 4 }
    ],
    colors: {
      skyTop: '#F5D4C5',
      skyBottom: '#F5E6D3',
      ground: '#F5E6D3',
      path: '#E8D5BC',
      accent: '#89B8D4'
    },
    elements: ['palm-trees', 'umbrella', 'shells', 'waves', 'pier', 'seagulls'],
    ambience: 'ocean-waves'
  }
];

export function getEnvironmentById(id: string): EnvironmentDef | undefined {
  return ENVIRONMENTS.find(env => env.id === id);
}

export function getEnvironmentForSteps(totalSteps: number): EnvironmentDef {
  const sorted = [...ENVIRONMENTS].sort((a, b) => b.unlockSteps - a.unlockSteps);
  return sorted.find(env => totalSteps >= env.unlockSteps) || ENVIRONMENTS[0];
}

export function getUnlockedEnvironments(totalSteps: number): EnvironmentDef[] {
  return ENVIRONMENTS.filter(env => totalSteps >= env.unlockSteps);
}
