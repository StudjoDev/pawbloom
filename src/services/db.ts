// PawBloom Database Service - IndexedDB with Dexie

import Dexie, { type Table } from 'dexie';
import type { Personality, Rarity } from '@/data/pets';

// Pet Instance - a specific pet owned by the player
export interface PetInstance {
  instanceId: string;
  petId: string;
  nickname?: string;
  personality: Personality;
  rarity: Rarity;
  bondLevel: number;
  bondXp: number;
  totalStepsTogether: number;
  equippedDecor: string[];
  memories: Memory[];
  discoveredAt: number; // timestamp
  isStarter: boolean;
}

export interface Memory {
  id: string;
  type: 'discovery' | 'bond' | 'adventure' | 'event' | 'milestone';
  title: string;
  description: string;
  timestamp: number;
  imageKey?: string;
}

// Player data
export interface PlayerData {
  id: string;
  totalSteps: number;
  todaySteps: number;
  lastStepDate: string; // YYYY-MM-DD
  teamPetIds: string[]; // Up to 3 pet instance IDs for walking
  currency: {
    treats: number;
    friendshipPaws: number;
  };
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    hapticEnabled: boolean;
    notificationsEnabled: boolean;
  };
  stats: {
    totalEncounters: number;
    totalPetsCollected: number;
    longestStreak: number;
    currentStreak: number;
  };
  createdAt: number;
  lastPlayedAt: number;
}

// Encounter history for pity system
export interface EncounterRecord {
  id: string;
  petId: string;
  rarity: Rarity;
  environment: string;
  stepCount: number;
  timestamp: number;
  wasPity: boolean;
}

// Quest/Achievement tracking
export interface QuestProgress {
  id: string;
  questId: string;
  progress: number;
  target: number;
  completed: boolean;
  claimedAt?: number;
}

class PawBloomDB extends Dexie {
  pets!: Table<PetInstance>;
  player!: Table<PlayerData>;
  encounters!: Table<EncounterRecord>;
  quests!: Table<QuestProgress>;

  constructor() {
    super('PawBloomDB');
    
    this.version(1).stores({
      pets: 'instanceId, petId, rarity, bondLevel, discoveredAt',
      player: 'id',
      encounters: 'id, petId, rarity, timestamp',
      quests: 'id, questId, completed'
    });
  }
}

export const db = new PawBloomDB();

// Helper functions
export async function getPlayer(): Promise<PlayerData | undefined> {
  return db.player.get('main');
}

export async function initializePlayer(): Promise<PlayerData> {
  const existing = await getPlayer();
  if (existing) return existing;
  
  const now = Date.now();
  const today = new Date().toISOString().split('T')[0];
  
  const newPlayer: PlayerData = {
    id: 'main',
    totalSteps: 0,
    todaySteps: 0,
    lastStepDate: today,
    teamPetIds: [],
    currency: {
      treats: 5,
      friendshipPaws: 0
    },
    settings: {
      soundEnabled: true,
      musicEnabled: true,
      hapticEnabled: true,
      notificationsEnabled: true
    },
    stats: {
      totalEncounters: 0,
      totalPetsCollected: 0,
      longestStreak: 0,
      currentStreak: 0
    },
    createdAt: now,
    lastPlayedAt: now
  };
  
  await db.player.add(newPlayer);
  return newPlayer;
}

export async function updatePlayer(updates: Partial<PlayerData>): Promise<void> {
  await db.player.update('main', { ...updates, lastPlayedAt: Date.now() });
}

export async function addPet(pet: PetInstance): Promise<string> {
  await db.pets.add(pet);
  return pet.instanceId;
}

export async function getPet(instanceId: string): Promise<PetInstance | undefined> {
  return db.pets.get(instanceId);
}

export async function getAllPets(): Promise<PetInstance[]> {
  return db.pets.toArray();
}

export async function updatePet(instanceId: string, updates: Partial<PetInstance>): Promise<void> {
  await db.pets.update(instanceId, updates);
}

export async function getTeamPets(teamIds: string[]): Promise<PetInstance[]> {
  const pets = await Promise.all(teamIds.map(id => getPet(id)));
  return pets.filter((p): p is PetInstance => p !== undefined);
}

export async function addEncounter(encounter: EncounterRecord): Promise<void> {
  await db.encounters.add(encounter);
}

export async function getRecentEncounters(limit = 10): Promise<EncounterRecord[]> {
  return db.encounters.orderBy('timestamp').reverse().limit(limit).toArray();
}

export async function getEncountersSinceRarity(rarity: Rarity): Promise<number> {
  const encounters = await db.encounters.orderBy('timestamp').reverse().toArray();
  let count = 0;
  for (const enc of encounters) {
    if (enc.rarity === rarity) break;
    count++;
  }
  return count;
}
