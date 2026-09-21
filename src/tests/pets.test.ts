import { describe, it, expect } from 'vitest';
import { 
  PETS, 
  getPetById, 
  getPetsBySpecies, 
  getStarterPets,
  RARITY_WEIGHTS 
} from '@/data/pets';

describe('Pet Data', () => {
  it('should have 12 pets in the roster', () => {
    expect(PETS.length).toBe(12);
  });

  it('should have 6 dogs and 6 cats', () => {
    const dogs = PETS.filter(p => p.species === 'dog');
    const cats = PETS.filter(p => p.species === 'cat');
    expect(dogs.length).toBe(6);
    expect(cats.length).toBe(6);
  });

  it('should find pet by ID', () => {
    const shiba = getPetById('shiba-inu');
    expect(shiba).toBeDefined();
    expect(shiba?.name).toBe('Shiba Inu');
    expect(shiba?.species).toBe('dog');
  });

  it('should return undefined for unknown pet ID', () => {
    const unknown = getPetById('unknown-pet');
    expect(unknown).toBeUndefined();
  });

  it('should filter pets by species', () => {
    const dogs = getPetsBySpecies('dog');
    const cats = getPetsBySpecies('cat');
    
    expect(dogs.every(p => p.species === 'dog')).toBe(true);
    expect(cats.every(p => p.species === 'cat')).toBe(true);
  });

  it('should have correct starter pets', () => {
    const starters = getStarterPets();
    expect(starters.length).toBe(3);
    
    const starterIds = starters.map(p => p.id);
    expect(starterIds).toContain('shiba-inu');
    expect(starterIds).toContain('corgi');
    expect(starterIds).toContain('orange-tabby');
  });

  it('should have rarity weights summing to 100', () => {
    const total = Object.values(RARITY_WEIGHTS).reduce((sum, w) => sum + w, 0);
    expect(total).toBe(100);
  });

  it('should have all required fields for each pet', () => {
    for (const pet of PETS) {
      expect(pet.id).toBeTruthy();
      expect(pet.name).toBeTruthy();
      expect(pet.species).toMatch(/^(dog|cat)$/);
      expect(pet.description).toBeTruthy();
      expect(pet.baseRarity).toBeTruthy();
      expect(pet.colors).toBeDefined();
      expect(pet.traits).toBeDefined();
      expect(pet.catchPhrases.length).toBeGreaterThan(0);
      expect(pet.funFact).toBeTruthy();
    }
  });

  it('should have unique IDs for all pets', () => {
    const ids = PETS.map(p => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
