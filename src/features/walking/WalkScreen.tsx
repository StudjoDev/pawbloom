// PawBloom Walk Screen - P0-1 Scripted First Encounter + Approach Tension
// First encounter: 60-100 steps (NOT 500+)
// Approach tension: ???/progress/N steps away, rustle+footprints at 12/8/5/3, final ••• + BGM duck

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getEnvironmentById, getEnvironmentForSteps, type EnvironmentDef } from '@/data/environments';
import { PETS, RARITY_WEIGHTS, type Rarity, type Personality, PERSONALITIES } from '@/data/pets';
import { PetRenderer } from '@/components/pets/PetRenderer';
import { audioManager } from '@/services/audio/AudioManager';
import { hapticsManager } from '@/services/audio/HapticsManager';
import Button from '@/components/ui/Button';
import Panel from '@/components/ui/Panel';
import styles from './WalkScreen.module.css';

const WalkScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    teamPets,
    currentSteps,
    sessionSteps,
    currentEnvironment,
    addSteps,
    startWalk,
    endWalk,
    setEnvironment,
    triggerEncounter,
    devMode,
    player
  } = useGameStore();
  
  const [isWalking, setIsWalking] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [encounterProgress, setEncounterProgress] = useState(0);
  const [nextEncounterAt, setNextEncounterAt] = useState(0);
  const [showRustle, setShowRustle] = useState(false);
  const [showFootprints, setShowFootprints] = useState(false);
  
  const walkInterval = useRef<NodeJS.Timeout | null>(null);
  const encounterCheckRef = useRef<number>(0);
  const isFirstEncounter = useRef(player?.stats.totalEncounters === 0);
  
  const environment = getEnvironmentById(currentEnvironment) || getEnvironmentById('park')!;
  
  // Initialize - P0-1: First encounter within 60-100 steps
  useEffect(() => {
    const firstEncounter = isFirstEncounter.current;
    // First encounter: 60-100 steps, subsequent: 150-400
    const distance = firstEncounter 
      ? Math.floor(Math.random() * 40) + 60  // 60-100 for first
      : Math.floor(Math.random() * 250) + 150; // 150-400 for later
    
    setNextEncounterAt(distance);
    startWalk();
    audioManager.playBGM('walk');
    
    return () => endWalk();
  }, [startWalk, endWalk]);
  
  // Auto-walk simulation with approach tension
  useEffect(() => {
    if (isWalking) {
      walkInterval.current = setInterval(() => {
        addSteps(1);
        setScrollOffset(prev => prev + 2);
        encounterCheckRef.current += 1;
        setEncounterProgress(prev => Math.min(prev + 1, nextEncounterAt));
        
        const stepsRemaining = nextEncounterAt - encounterCheckRef.current;
        
        // P0-1: Approach tension at 12/8/5/3 steps
        if (stepsRemaining === 12) {
          setShowRustle(true);
          audioManager.playSFX('rustle');
          hapticsManager.play('light');
          setTimeout(() => setShowRustle(false), 500);
        }
        if (stepsRemaining === 8) {
          setShowFootprints(true);
          audioManager.playSFX('footstep');
          hapticsManager.play('light');
        }
        if (stepsRemaining === 5) {
          audioManager.playSFX('paw');
          hapticsManager.play('medium');
        }
        if (stepsRemaining === 3) {
          // Final ••• + BGM duck
          audioManager.duckBGM(2000);
          hapticsManager.play('medium');
        }
        
        // Trigger encounter
        if (encounterCheckRef.current >= nextEncounterAt) {
          handleEncounter();
        }
      }, 100);
    }
    
    return () => {
      if (walkInterval.current) {
        clearInterval(walkInterval.current);
      }
    };
  }, [isWalking, nextEncounterAt, addSteps]);
  
  // Check for environment change
  useEffect(() => {
    const newEnv = getEnvironmentForSteps(currentSteps);
    if (newEnv.id !== currentEnvironment) {
      setEnvironment(newEnv.id);
    }
  }, [currentSteps, currentEnvironment, setEnvironment]);
  
  const handleEncounter = useCallback(() => {
    setIsWalking(false);
    
    // P0-1: First pet is scripted cute Common
    const firstEncounter = isFirstEncounter.current;
    let petId: string;
    let rarity: Rarity;
    let personality: Personality;
    
    if (firstEncounter) {
      // Scripted first encounter: cute common pet
      const cuteStarters = ['shiba-inu', 'corgi', 'orange-tabby'];
      petId = cuteStarters[Math.floor(Math.random() * cuteStarters.length)];
      rarity = 'common';
      const cutePersonalities: Personality[] = ['shy', 'playful', 'curious'];
      personality = cutePersonalities[Math.floor(Math.random() * cutePersonalities.length)];
      isFirstEncounter.current = false;
    } else {
      // Normal encounter roll
      const result = rollEncounter();
      petId = result.petId;
      rarity = result.rarity;
      personality = result.personality;
    }
    
    triggerEncounter(petId, rarity, personality);
    navigate('/encounter');
  }, [triggerEncounter, navigate]);
  
  const handleBack = () => {
    audioManager.playSFX('ui_back');
    endWalk();
    audioManager.playBGM('home');
    navigate('/home');
  };
  
  const handleToggleWalk = () => {
    audioManager.playSFX('tap');
    hapticsManager.play('tap');
    setIsWalking(!isWalking);
  };
  
  const stepsRemaining = nextEncounterAt - encounterProgress;
  const progressPercent = (encounterProgress / nextEncounterAt) * 100;
  
  // P0-1: Distance display with tension
  const getDistanceDisplay = () => {
    if (stepsRemaining > 50) return '???';
    if (stepsRemaining > 20) return `~${Math.ceil(stepsRemaining / 10) * 10} steps`;
    if (stepsRemaining > 5) return `${stepsRemaining} steps away`;
    if (stepsRemaining > 0) return '•••';
    return 'Here!';
  };
  
  return (
    <div className={styles.container}>
      {/* Parallax background */}
      <div className={styles.parallaxContainer}>
        <ParallaxBackground 
          environment={environment} 
          scrollOffset={scrollOffset} 
        />
      </div>
      
      {/* Header */}
      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button className={styles.backButton} onClick={handleBack}>
          <BackIcon />
        </button>
        <div className={styles.envLabel}>
          <span className={styles.envName}>{environment.name}</span>
        </div>
        <div className={styles.stepCounter}>
          <span className={styles.stepValue}>{sessionSteps}</span>
          <span className={styles.stepLabel}>steps</span>
        </div>
      </motion.header>
      
      {/* Walking pets */}
      <div className={styles.walkArea}>
        <div className={styles.petsWalking}>
          {teamPets.map((pet, index) => (
            <motion.div
              key={pet.instanceId}
              className={styles.walkingPet}
              style={{
                left: `${15 + index * 28}%`,
                zIndex: 10 - index
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              <PetRenderer
                petId={pet.petId}
                size={90 - index * 10}
                state={isWalking ? 'walk' : 'idle'}
                rarity={pet.rarity}
                showShadow={true}
              />
            </motion.div>
          ))}
        </div>
        
        {/* Approach hints - rustle effect */}
        <AnimatePresence>
          {showRustle && (
            <motion.div
              className={styles.rustleEffect}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <span>*rustle*</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Footprints hint */}
        <AnimatePresence>
          {showFootprints && stepsRemaining <= 8 && stepsRemaining > 0 && (
            <motion.div
              className={styles.footprintHint}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: [0, 1, 0.5], y: 0 }}
                  transition={{ delay: i * 0.2 }}
                >
                  🐾
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Controls */}
      <motion.div
        className={styles.controls}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Panel variant="glass" padding="md" rounded="xl">
          {/* Mystery progress - P0-1 tension display */}
          <div className={styles.mysterySection}>
            <div className={styles.mysteryHeader}>
              <span className={styles.mysteryIcon}>❓</span>
              <span className={styles.mysteryLabel}>Next Friend</span>
              <motion.span 
                className={styles.mysteryDistance}
                animate={stepsRemaining <= 5 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: stepsRemaining <= 5 ? Infinity : 0 }}
              >
                {getDistanceDisplay()}
              </motion.span>
            </div>
            
            {/* Progress bar with paw marker */}
            <div className={styles.progressTrack}>
              <div 
                className={styles.progressFill}
                style={{ width: `${progressPercent}%` }}
              />
              <motion.div 
                className={styles.progressPaw}
                style={{ left: `${progressPercent}%` }}
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                🐾
              </motion.div>
            </div>
          </div>
          
          {/* Walk control */}
          <div className={styles.walkControl}>
            <Button
              variant={isWalking ? 'secondary' : 'primary'}
              size="lg"
              fullWidth
              onClick={handleToggleWalk}
            >
              {isWalking ? '⏸ Pause' : '🚶 Walk'}
            </Button>
          </div>
          
          {/* Dev controls */}
          {devMode && (
            <div className={styles.devControls}>
              <Button size="sm" variant="ghost" onClick={() => {
                addSteps(50);
                setEncounterProgress(prev => Math.min(prev + 50, nextEncounterAt));
                encounterCheckRef.current += 50;
              }}>
                +50 Steps
              </Button>
              <Button size="sm" variant="ghost" onClick={() => {
                encounterCheckRef.current = nextEncounterAt;
                handleEncounter();
              }}>
                Force Encounter
              </Button>
            </div>
          )}
        </Panel>
      </motion.div>
    </div>
  );
};

// Parallax background component
interface ParallaxBackgroundProps {
  environment: EnvironmentDef;
  scrollOffset: number;
}

const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({ environment, scrollOffset }) => {
  const { colors } = environment;
  
  return (
    <div className={styles.parallax}>
      {/* Sky layer */}
      <div 
        className={styles.layer}
        style={{ 
          background: `linear-gradient(180deg, ${colors.skyTop} 0%, ${colors.skyBottom} 100%)`,
          transform: `translateX(${-scrollOffset * 0.05}px)`
        }}
      >
        <svg viewBox="0 0 800 300" className={styles.skyLayer} preserveAspectRatio="xMidYMid slice">
          {/* Sun */}
          <circle cx="650" cy="80" r="50" fill="#FFE4B5" opacity="0.8" />
          <circle cx="650" cy="80" r="40" fill="#FFD700" opacity="0.6" />
          
          {/* Clouds */}
          <g fill="white" opacity="0.9">
            <ellipse cx={100 - (scrollOffset * 0.02) % 200} cy="60" rx="40" ry="20" />
            <ellipse cx={130 - (scrollOffset * 0.02) % 200} cy="55" rx="50" ry="25" />
            <ellipse cx={160 - (scrollOffset * 0.02) % 200} cy="62" rx="35" ry="18" />
            
            <ellipse cx={400 - (scrollOffset * 0.03) % 300} cy="90" rx="35" ry="18" />
            <ellipse cx={430 - (scrollOffset * 0.03) % 300} cy="85" rx="45" ry="22" />
            <ellipse cx={460 - (scrollOffset * 0.03) % 300} cy="92" rx="30" ry="15" />
          </g>
        </svg>
      </div>
      
      {/* Far background */}
      <div 
        className={styles.layer}
        style={{ transform: `translateX(${-scrollOffset * 0.2}px)` }}
      >
        <svg viewBox="0 0 1200 200" className={styles.farLayer} preserveAspectRatio="xMidYMid slice">
          <path
            d={`M 0 150 
                Q 100 100 200 130 
                Q 350 180 500 120 
                Q 650 80 800 140 
                Q 950 160 1100 110
                L 1200 150 L 1200 200 L 0 200 Z`}
            fill={colors.ground}
            opacity="0.3"
          />
        </svg>
      </div>
      
      {/* Mid background */}
      <div 
        className={styles.layer}
        style={{ transform: `translateX(${-scrollOffset * 0.5}px)` }}
      >
        <svg viewBox="0 0 1600 250" className={styles.midLayer} preserveAspectRatio="xMidYMid slice">
          {environment.id === 'park' && (
            <g>
              {[0, 200, 450, 700, 950, 1200, 1450].map((x, i) => (
                <g key={i} transform={`translate(${x}, 80)`}>
                  <rect x="15" y="80" width="20" height="60" fill="#8B7355" />
                  <ellipse cx="25" cy="50" rx="40" ry="50" fill="#6B8F4E" />
                  <ellipse cx="10" cy="35" rx="30" ry="40" fill="#7CB369" />
                  <ellipse cx="40" cy="40" rx="28" ry="38" fill="#8CB369" />
                </g>
              ))}
            </g>
          )}
        </svg>
      </div>
      
      {/* Ground layer */}
      <div 
        className={styles.layer}
        style={{ transform: `translateX(${-scrollOffset}px)` }}
      >
        <svg viewBox="0 0 2000 150" className={styles.groundLayer} preserveAspectRatio="xMidYMid slice">
          <rect x="0" y="50" width="2000" height="100" fill={colors.ground} />
          <rect x="0" y="80" width="2000" height="40" fill={colors.path} />
          
          <g fill={colors.accent} opacity="0.7">
            {[...Array(40)].map((_, i) => (
              <path
                key={i}
                d={`M ${i * 50 + 20} 80 Q ${i * 50 + 25} 65 ${i * 50 + 22} 80 Q ${i * 50 + 30} 68 ${i * 50 + 35} 80`}
              />
            ))}
          </g>
        </svg>
      </div>
      
      {/* Foreground */}
      <div 
        className={styles.layer}
        style={{ transform: `translateX(${-scrollOffset * 1.3}px)` }}
      >
        <svg viewBox="0 0 2400 100" className={styles.foregroundLayer} preserveAspectRatio="xMidYMid slice">
          <g fill={colors.accent}>
            {[...Array(30)].map((_, i) => (
              <g key={i} transform={`translate(${i * 80}, 0)`}>
                <path d="M 10 100 Q 15 70 12 100 Q 20 75 25 100 Q 18 80 30 100" />
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
};

// Helper functions
function rollEncounter(): { petId: string; rarity: Rarity; personality: Personality } {
  const roll = Math.random() * 100;
  let cumulative = 0;
  let rarity: Rarity = 'common';
  
  for (const [r, weight] of Object.entries(RARITY_WEIGHTS) as [Rarity, number][]) {
    cumulative += weight;
    if (roll < cumulative) {
      rarity = r;
      break;
    }
  }
  
  const eligiblePets = PETS.filter(p => p.baseRarity === rarity);
  const pet = eligiblePets[Math.floor(Math.random() * eligiblePets.length)];
  
  const personalities = Object.keys(PERSONALITIES) as Personality[];
  const personality = personalities[Math.floor(Math.random() * personalities.length)];
  
  return { petId: pet.id, rarity, personality };
}

// Icons
const BackIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18L9 12L15 6" />
  </svg>
);

export default WalkScreen;
