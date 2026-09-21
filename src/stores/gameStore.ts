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
      
      // Initialize game - includes migration for existing saves with < 3 team pets
      // VERTICAL SLICE: Always ensure 3 team pets for demo purposes
      initGame: async () => {
        const player = await initializePlayer();
        let pets = await getAllPets();
        let teamPets = pets.filter(p => player.teamPetIds.includes(p.instanceId));
        
        // VERTICAL SLICE DEMO: If team has < 3 pets, seed missing starters automatically
        // This works regardless of onboarding state to ensure Home always shows 3 pets
        if (teamPets.length < 3) {
          console.log('[PawBloom] Demo mode: Seeding team to 3 pets...');
          
          const allStarters = ['shiba-inu', 'corgi', 'orange-tabby'];
          const teamPetIds = [...player.teamPetIds];
          const personalities: Personality[] = ['playful', 'curious', 'shy', 'foodie', 'brave'];
          const bonusNames = ['Mochi', 'Biscuit', 'Pudding', 'Cookie', 'Tofu'];
          
          // Add missing starters until we have 3
          for (const starterId of allStarters) {
            if (teamPets.length >= 3) break;
            
            // Check if already owned
            const existingPet = pets.find(p => p.petId === starterId);
            if (existingPet) {
              // Add to team if not already
              if (!teamPetIds.includes(existingPet.instanceId)) {
                teamPetIds.push(existingPet.instanceId);
                teamPets.push(existingPet);
              }
            } else {
              // Create new pet
              const newPet: PetInstance = {
                instanceId: uuidv4(),
                petId: starterId,
                nickname: bonusNames[Math.floor(Math.random() * bonusNames.length)],
                personality: personalities[Math.floor(Math.random() * personalities.length)],
                rarity: 'common',
                bondLevel: 1,
                bondXp: 0,
                totalStepsTogether: 0,
                equippedDecor: [],
                memories: [{
                  id: uuidv4(),
                  type: 'discovery',
                  title: 'Bonus Friend!',
                  description: 'A gift for your adventures!',
                  timestamp: Date.now()
                }],
                discoveredAt: Date.now(),
                isStarter: true
              };
              
              await addPet(newPet);
              pets.push(newPet);
              teamPetIds.push(newPet.instanceId);
              teamPets.push(newPet);
            }
          }
          
          // Persist updated team (limit to 3)
          const finalTeamIds = teamPetIds.slice(0, 3);
          await updatePlayer({ teamPetIds: finalTeamIds });
          teamPets = teamPets.slice(0, 3);
          
          // Also mark onboarding as complete since we now have pets
          set({ hasCompletedOnboarding: true });
          
          console.log('[PawBloom] Demo seeding complete. Team pets:', teamPets.map(p => p.petId));
        }
        
        set({
          player,
          ownedPets: pets,
          teamPets,
          currentSteps: player.totalSteps
        });
      },
      
      // Complete onboarding with starter pet + 2 bonus pets for Vertical Slice demo
      completeOnboarding: async (starterPetId: string, nickname: string) => {
        console.log('[PawBloom] Starting onboarding completion...');
        
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
          rarity: 'uncommon',
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
        
        // Add all 3 pets to Dexie
        await addPet(starterPet);
        await addPet(bonusPet1);
        await addPet(bonusPet2);
        console.log('[PawBloom] Added 3 pets to DB');
        
        // Set all 3 as team - CRITICAL: must happen before reading back
        const teamIds = [starterPet.instanceId, bonusPet1.instanceId, bonusPet2.instanceId];
        await updatePlayer({ teamPetIds: teamIds });
        console.log('[PawBloom] Updated player teamPetIds:', teamIds);
        
        // Read back from Dexie to verify persistence
        const verifyPlayer = await db.player.get('main');
        const verifyPets = await getAllPets();
        
        // ASSERT: Verify data was persisted correctly
        if (!verifyPlayer || verifyPlayer.teamPetIds.length !== 3) {
          console.error('[PawBloom] CRITICAL: teamPetIds not persisted!', verifyPlayer?.teamPetIds);
          throw new Error('Failed to persist team pet IDs');
        }
        if (verifyPets.length < 3) {
          console.error('[PawBloom] CRITICAL: Pets not persisted!', verifyPets.length);
          throw new Error('Failed to persist pets');
        }
        
        // Build teamPets from verified data
        const teamPets = verifyPets.filter(p => verifyPlayer.teamPetIds.includes(p.instanceId));
        
        if (teamPets.length !== 3) {
          console.error('[PawBloom] CRITICAL: Team pets mismatch!', teamPets.length);
          throw new Error('Team pets count mismatch after persistence');
        }
        
        console.log('[PawBloom] Onboarding complete. Team:', teamPets.map(p => p.petId));
        
        set({
          hasCompletedOnboarding: true,
          player: verifyPlayer,
          ownedPets: verifyPets,
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
