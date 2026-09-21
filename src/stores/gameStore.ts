// PawBloom Game Store - Zustand

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PetInstance, PlayerData } from '@/services/db';
import { db, initializePlayer, updatePlayer, addPet, getAllPets, updatePet } from '@/services/db';
import { v4 as uuidv4 } from 'uuid';
import type { Personality, Rarity } from '@/data/pets';

interface GameState {
  // Onboarding
  hasCompletedOnboarding: boolean;
  selectedStarterId: string | null;
  starterNickname: string;
  
  // Player
  player: PlayerData | null;
  
  // Pets
  ownedPets: PetInstance[];
  teamPets: PetInstance[];
  
  // Walking
  currentSteps: number;
  sessionSteps: number;
  currentEnvironment: string;
  isWalking: boolean;
  
  // Encounter
  pendingEncounter: {
    petId: string;
    rarity: Rarity;
    personality: Personality;
  } | null;
  
  // Dev mode
  devMode: boolean;
  
  // Actions
  initGame: () => Promise<void>;
  completeOnboarding: (starterPetId: string, nickname: string) => Promise<void>;
  setSelectedStarter: (petId: string) => void;
  setStarterNickname: (name: string) => void;
  addSteps: (steps: number) => Promise<void>;
  startWalk: () => void;
  endWalk: () => void;
  setEnvironment: (envId: string) => void;
  triggerEncounter: (petId: string, rarity: Rarity, personality: Personality) => void;
  collectPet: (nickname?: string) => Promise<PetInstance>;
  clearEncounter: () => void;
  feedPet: (instanceId: string) => Promise<void>;
  updatePetNickname: (instanceId: string, nickname: string) => Promise<void>;
  setTeamPet: (index: number, instanceId: string) => Promise<void>;
  toggleDevMode: () => void;
  resetGame: () => Promise<void>;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      hasCompletedOnboarding: false,
      selectedStarterId: null,
      starterNickname: '',
      player: null,
      ownedPets: [],
      teamPets: [],
      currentSteps: 0,
      sessionSteps: 0,
      currentEnvironment: 'park',
      isWalking: false,
      pendingEncounter: null,
      devMode: false,
      
      // Initialize game
      initGame: async () => {
        const player = await initializePlayer();
        const pets = await getAllPets();
        const teamPets = pets.filter(p => player.teamPetIds.includes(p.instanceId));
        
        set({
          player,
          ownedPets: pets,
          teamPets,
          currentSteps: player.totalSteps
        });
      },
      
      // Complete onboarding with starter pet + 2 bonus pets for Vertical Slice demo
      completeOnboarding: async (starterPetId: string, nickname: string) => {
        const personalities: Personality[] = ['playful', 'curious', 'shy', 'foodie', 'brave'];
        const getRandomPersonality = () => personalities[Math.floor(Math.random() * personalities.length)];
        
        // Main starter pet (user's choice)
        const starterPet: PetInstance = {
          instanceId: uuidv4(),
          petId: starterPetId,
          nickname: nickname || undefined,
          personality: getRandomPersonality(),
          rarity: 'common',
          bondLevel: 1,
          bondXp: 0,
          totalStepsTogether: 0,
          equippedDecor: [],
          memories: [{
            id: uuidv4(),
            type: 'discovery',
            title: 'Our First Meeting',
            description: 'The beginning of a beautiful friendship!',
            timestamp: Date.now()
          }],
          discoveredAt: Date.now(),
          isStarter: true
        };
        
        // Vertical Slice: Add 2 bonus starter pets to show full team of 3
        // Pick from other starters not chosen by user
        const allStarters = ['shiba-inu', 'corgi', 'orange-tabby'];
        const bonusStarters = allStarters.filter(id => id !== starterPetId).slice(0, 2);
        const bonusNames = ['Mochi', 'Biscuit', 'Pudding', 'Cookie'];
        
        const bonusPet1: PetInstance = {
          instanceId: uuidv4(),
          petId: bonusStarters[0],
          nickname: bonusNames[Math.floor(Math.random() * bonusNames.length)],
          personality: getRandomPersonality(),
          rarity: 'common',
          bondLevel: 1,
          bondXp: 0,
          totalStepsTogether: 0,
          equippedDecor: [],
          memories: [{
            id: uuidv4(),
            type: 'discovery',
            title: 'Bonus Friend!',
            description: 'A gift for joining our adventure!',
            timestamp: Date.now() - 1000
          }],
          discoveredAt: Date.now() - 1000,
          isStarter: true
        };
        
        const bonusPet2: PetInstance = {
          instanceId: uuidv4(),
          petId: bonusStarters[1],
          nickname: bonusNames[Math.floor(Math.random() * bonusNames.length)],
          personality: getRandomPersonality(),
          rarity: 'uncommon', // Make one slightly special
          bondLevel: 1,
          bondXp: 0,
          totalStepsTogether: 0,
          equippedDecor: [],
          memories: [{
            id: uuidv4(),
            type: 'discovery',
            title: 'Bonus Friend!',
            description: 'A gift for joining our adventure!',
            timestamp: Date.now() - 2000
          }],
          discoveredAt: Date.now() - 2000,
          isStarter: true
        };
        
        // Add all 3 pets
        await addPet(starterPet);
        await addPet(bonusPet1);
        await addPet(bonusPet2);
        
        // Set all 3 as team
        const teamIds = [starterPet.instanceId, bonusPet1.instanceId, bonusPet2.instanceId];
        await updatePlayer({ teamPetIds: teamIds });
        
        const player = await initializePlayer();
        const pets = await getAllPets();
        const teamPets = [starterPet, bonusPet1, bonusPet2];
        
        set({
          hasCompletedOnboarding: true,
          player,
          ownedPets: pets,
          teamPets,
          selectedStarterId: null,
          starterNickname: ''
        });
      },
      
      setSelectedStarter: (petId: string) => {
        set({ selectedStarterId: petId });
      },
      
      setStarterNickname: (name: string) => {
        set({ starterNickname: name });
      },
      
      // Add steps (from simulation or real pedometer)
      addSteps: async (steps: number) => {
        const { player, currentSteps, teamPets } = get();
        if (!player) return;
        
        const newTotal = currentSteps + steps;
        const today = new Date().toISOString().split('T')[0];
        const isNewDay = player.lastStepDate !== today;
        
        const newTodaySteps = isNewDay ? steps : player.todaySteps + steps;
        
        await updatePlayer({
          totalSteps: newTotal,
          todaySteps: newTodaySteps,
          lastStepDate: today
        });
        
        // Update bond XP for team pets
        const xpGain = Math.floor(steps / 10);
        for (const pet of teamPets) {
          const newXp = pet.bondXp + xpGain;
          const newSteps = pet.totalStepsTogether + steps;
          
          // Check for level up
          let newLevel = pet.bondLevel;
          const xpThresholds = [0, 100, 300, 600, 1000, 1500];
          while (newLevel < 5 && newXp >= xpThresholds[newLevel]) {
            newLevel++;
          }
          
          await updatePet(pet.instanceId, {
            bondXp: newXp,
            bondLevel: newLevel,
            totalStepsTogether: newSteps
          });
        }
        
        // Refresh state
        const updatedPlayer = await db.player.get('main');
        const updatedPets = await getAllPets();
        const updatedTeam = updatedPets.filter(p => 
          updatedPlayer?.teamPetIds.includes(p.instanceId)
        );
        
        set({
          currentSteps: newTotal,
          sessionSteps: get().sessionSteps + steps,
          player: updatedPlayer || null,
          ownedPets: updatedPets,
          teamPets: updatedTeam
        });
      },
      
      startWalk: () => set({ isWalking: true, sessionSteps: 0 }),
      endWalk: () => set({ isWalking: false }),
      
      setEnvironment: (envId: string) => set({ currentEnvironment: envId }),
      
      triggerEncounter: (petId: string, rarity: Rarity, personality: Personality) => {
        set({
          pendingEncounter: { petId, rarity, personality },
          isWalking: false
        });
      },
      
      collectPet: async (nickname?: string) => {
        const { pendingEncounter, player } = get();
        if (!pendingEncounter || !player) {
          throw new Error('No pending encounter');
        }
        
        const newPet: PetInstance = {
          instanceId: uuidv4(),
          petId: pendingEncounter.petId,
          nickname,
          personality: pendingEncounter.personality,
          rarity: pendingEncounter.rarity,
          bondLevel: 1,
          bondXp: 0,
          totalStepsTogether: 0,
          equippedDecor: [],
          memories: [{
            id: uuidv4(),
            type: 'discovery',
            title: 'New Friend!',
            description: `Met during a walk.`,
            timestamp: Date.now()
          }],
          discoveredAt: Date.now(),
          isStarter: false
        };
        
        await addPet(newPet);
        
        // Update stats
        await updatePlayer({
          ...player,
          stats: {
            ...player.stats,
            totalPetsCollected: player.stats.totalPetsCollected + 1,
            totalEncounters: player.stats.totalEncounters + 1
          }
        });
        
        const updatedPets = await getAllPets();
        const updatedPlayer = await db.player.get('main');
        
        set({
          pendingEncounter: null,
          ownedPets: updatedPets,
          player: updatedPlayer || null
        });
        
        return newPet;
      },
      
      clearEncounter: () => set({ pendingEncounter: null }),
      
      feedPet: async (instanceId: string) => {
        const { player, ownedPets } = get();
        if (!player || player.currency.treats <= 0) return;
        
        const pet = ownedPets.find(p => p.instanceId === instanceId);
        if (!pet) return;
        
        const newXp = pet.bondXp + 20;
        let newLevel = pet.bondLevel;
        const xpThresholds = [0, 100, 300, 600, 1000, 1500];
        while (newLevel < 5 && newXp >= xpThresholds[newLevel]) {
          newLevel++;
        }
        
        await updatePet(instanceId, {
          bondXp: newXp,
          bondLevel: newLevel
        });
        
        await updatePlayer({
          currency: {
            ...player.currency,
            treats: player.currency.treats - 1
          }
        });
        
        const updatedPets = await getAllPets();
        const updatedPlayer = await db.player.get('main');
        const updatedTeam = updatedPets.filter(p => 
          updatedPlayer?.teamPetIds.includes(p.instanceId)
        );
        
        set({
          ownedPets: updatedPets,
          player: updatedPlayer || null,
          teamPets: updatedTeam
        });
      },
      
      updatePetNickname: async (instanceId: string, nickname: string) => {
        await updatePet(instanceId, { nickname });
        const updatedPets = await getAllPets();
        set({ ownedPets: updatedPets });
      },
      
      setTeamPet: async (index: number, instanceId: string) => {
        const { player } = get();
        if (!player) return;
        
        const newTeamIds = [...player.teamPetIds];
        
        // Remove if already in team
        const existingIndex = newTeamIds.indexOf(instanceId);
        if (existingIndex !== -1) {
          newTeamIds.splice(existingIndex, 1);
        }
        
        // Add at new position (max 3)
        if (index < 3) {
          newTeamIds[index] = instanceId;
        }
        
        // Filter out undefined and limit to 3
        const cleanTeamIds = newTeamIds.filter(Boolean).slice(0, 3);
        
        await updatePlayer({ teamPetIds: cleanTeamIds });
        
        const updatedPlayer = await db.player.get('main');
        const updatedPets = await getAllPets();
        const updatedTeam = updatedPets.filter(p => 
          cleanTeamIds.includes(p.instanceId)
        );
        
        set({
          player: updatedPlayer || null,
          teamPets: updatedTeam
        });
      },
      
      toggleDevMode: () => set((state) => ({ devMode: !state.devMode })),
      
      resetGame: async () => {
        await db.pets.clear();
        await db.player.clear();
        await db.encounters.clear();
        await db.quests.clear();
        
        set({
          hasCompletedOnboarding: false,
          selectedStarterId: null,
          starterNickname: '',
          player: null,
          ownedPets: [],
          teamPets: [],
          currentSteps: 0,
          sessionSteps: 0,
          currentEnvironment: 'park',
          isWalking: false,
          pendingEncounter: null
        });
      }
    }),
    {
      name: 'pawbloom-game',
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        devMode: state.devMode
      })
    }
  )
);
