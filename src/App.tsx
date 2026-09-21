import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useAudio } from '@/hooks/useAudio';

// Screens
import OpenerScreen from '@/features/onboarding/OpenerScreen';
import StarterSelectScreen from '@/features/onboarding/StarterSelectScreen';
import RevealScreen from '@/features/onboarding/RevealScreen';
import NamingScreen from '@/features/onboarding/NamingScreen';
import HomeScreen from '@/features/home/HomeScreen';
import WalkScreen from '@/features/walking/WalkScreen';
import CollectionScreen from '@/features/collection/CollectionScreen';
import PetDetailScreen from '@/features/pets/PetDetailScreen';
import EncounterScreen from '@/features/walking/EncounterScreen';

// Components
import DevDrawer from '@/components/ui/DevDrawer';
import AudioSettingsButton from '@/components/ui/AudioSettings';

function App() {
  const hasCompletedOnboarding = useGameStore((state) => state.hasCompletedOnboarding);
  const { isInitialized } = useAudio();

  useEffect(() => {
    if (isInitialized) {
      console.log('[PawBloom] Audio system ready');
    }
  }, [isInitialized]);
  
  return (
    <HashRouter>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Onboarding Flow - P0-1 Scripted First 5 Minutes */}
          <Route path="/" element={
            hasCompletedOnboarding ? <Navigate to="/home" replace /> : <OpenerScreen />
          } />
          <Route path="/starter" element={<StarterSelectScreen />} />
          <Route path="/reveal" element={<RevealScreen />} />
          <Route path="/naming" element={<NamingScreen />} />
          
          {/* Main Game */}
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/walk" element={<WalkScreen />} />
          <Route path="/encounter" element={<EncounterScreen />} />
          <Route path="/collection" element={<CollectionScreen />} />
          <Route path="/pet/:instanceId" element={<PetDetailScreen />} />
        </Routes>
      </AnimatePresence>
      
      {/* Dev Tools - activated by long press on logo */}
      <DevDrawer />
      
      {/* Audio Settings - always accessible */}
      <AudioSettingsButton />
    </HashRouter>
  );
}

export default App;
