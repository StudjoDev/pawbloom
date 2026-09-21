import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';

// Screens
import SplashScreen from '@/features/onboarding/SplashScreen';
import WelcomeScreen from '@/features/onboarding/WelcomeScreen';
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

function App() {
  const hasCompletedOnboarding = useGameStore((state) => state.hasCompletedOnboarding);
  
  return (
    <HashRouter>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Onboarding Flow */}
          <Route path="/" element={
            hasCompletedOnboarding ? <Navigate to="/home" replace /> : <SplashScreen />
          } />
          <Route path="/welcome" element={<WelcomeScreen />} />
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
    </HashRouter>
  );
}

export default App;
