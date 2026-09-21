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
      
      // Initialize game - P0-1: NO auto-seeding, player MUST go through First 5 Minutes
      initGame: async () => {
        const player = await initializePlayer();
        const pets = await getAllPets();
        const teamPets = pets.filter(p => player.teamPetIds.includes(p.instanceId));
        
        // P0-1 STRICT: Do NOT auto-seed pets - player must experience First 5 Minutes
        // Demo seeding DISABLED to ensure scripted first encounter at 60-100 steps
        
        set({
          player,
          ownedPets: pets,
          teamPets,
          currentSteps: player.totalSteps
        });
      },
      
      // P0-1: Complete onboarding with ONLY starter pet - NO bonus pets
      // CRITICAL: Must ensure player row exists BEFORE updatePlayer call
      completeOnboarding: async (starterPetId: string, nickname: string) => {
        console.log('[PawBloom] Starting onboarding - P0-1 single starter only');
        console.log('[PawBloom] Nickname from NamingScreen:', nickname || '(empty - use species name)');
        
        // CRITICAL FIX: Ensure player row exists BEFORE any updates
        // initializePlayer creates row if missing, returns existing if present
        const player = await initializePlayer();
        console.log('[PawBloom] Player initialized. Current teamPetIds:', player.teamPetIds);
        
        const personalities: Personality[] = ['playful', 'curious', 'shy', 'foodie', 'brave'];
        const getRandomPersonality = () => personalities[Math.floor(Math.random() * personalities.length)];
        
        // Main starter pet with nickname from NamingScreen
        const starterPet: PetInstance = {
          instanceId: uuidv4(),
          petId: starterPetId,
          nickname: nickname.trim() || undefined, // Empty string -> undefined -> falls back to species name
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
        
        // Add pet to DB first
        await addPet(starterPet);
        console.log('[PawBloom] Added starter pet:', starterPetId, 'with nickname:', starterPet.nickname);
        
        // ATOMIC team write - player row MUST exist (ensured by initializePlayer above)
        const newTeamIds = [starterPet.instanceId];
        await updatePlayer({ 
          teamPetIds: newTeamIds,
          stats: {
            ...player.stats,
            totalPetsCollected: player.stats.totalPetsCollected + 1
          }
        });
        
        // VERIFY: Read back from Dexie to confirm persistence
        const verifyPlayer = await db.player.get('main');
        
        // ASSERT: teamPetIds must include the starter
        if (!verifyPlayer?.teamPetIds.includes(starterPet.instanceId)) {
          console.error('[PawBloom] CRITICAL: teamPetIds not persisted! Attempting put fallback...');
          // Fallback: full put instead of update
          await db.player.put({
            ...player,
            teamPetIds: newTeamIds,
            lastPlayedAt: Date.now()
          });
          // Re-verify
          const fallbackPlayer = await db.player.get('main');
          console.log('[PawBloom] Fallback result:', fallbackPlayer?.teamPetIds);
        }
        
        // Re-read after potential fallback
        const finalPlayer = await db.player.get('main');
        const finalPets = await getAllPets();
        
        // Build teamPets from verified data
        const teamPets = finalPets.filter(p => finalPlayer?.teamPetIds.includes(p.instanceId));
        
        console.log('[PawBloom] Onboarding complete.');
        console.log('[PawBloom] Owned pets:', finalPets.length);
        console.log('[PawBloom] Team pets:', teamPets.length, teamPets.map(p => p.nickname || p.petId));
        console.log('[PawBloom] Player teamPetIds:', finalPlayer?.teamPetIds);
        
        set({
          hasCompletedOnboarding: true,
          player: finalPlayer || null,
          ownedPets: finalPets,
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
        
        // 1. Add pet to database
        await addPet(newPet);
        console.log('[PawBloom] Added new pet to DB:', newPet.instanceId);
        
        // 2. Auto-slot to team if team < 3
        const newTeamPetIds = [...player.teamPetIds];
        if (newTeamPetIds.length < 3) {
          newTeamPetIds.push(newPet.instanceId);
          console.log('[PawBloom] Auto-slotted to team. New team size:', newTeamPetIds.length);
        }
        
        // 3. Update player with stats AND teamPetIds
        await updatePlayer({
          teamPetIds: newTeamPetIds,
          stats: {
            ...player.stats,
            totalPetsCollected: player.stats.totalPetsCollected + 1,
            totalEncounters: player.stats.totalEncounters + 1
          }
        });
        
        // 4. Read back from DB to ensure persistence
        const updatedPets = await getAllPets();
        const updatedPlayer = await db.player.get('main');
        
        // 5. Build updated team from DB
        const updatedTeam = updatedPets.filter(p => 
          updatedPlayer?.teamPetIds.includes(p.instanceId)
        );
        
        console.log('[PawBloom] Collection complete. Owned:', updatedPets.length, 'Team:', updatedTeam.length);
        
        // 6. Update state with ALL changes
        set({
          pendingEncounter: null,
          ownedPets: updatedPets,
          teamPets: updatedTeam,
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
