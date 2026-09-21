// PawBloom Walk Screen - Side-scrolling parallax walking experience

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getEnvironmentById, getEnvironmentForSteps, type EnvironmentDef } from '@/data/environments';
import { PETS, RARITY_WEIGHTS, type Rarity, type Personality, PERSONALITIES } from '@/data/pets';
import { PetRenderer } from '@/components/pets/PetRenderer';
import Button from '@/components/ui/Button';
import Panel from '@/components/ui/Panel';
import ProgressBar from '@/components/ui/ProgressBar';
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
    devMode
  } = useGameStore();
  
  const [isWalking, setIsWalking] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [showEncounterHint, setShowEncounterHint] = useState(false);
  const [encounterProgress, setEncounterProgress] = useState(0);
  const [nextEncounterAt, setNextEncounterAt] = useState(0);
  
  const walkInterval = useRef<NodeJS.Timeout | null>(null);
  const encounterCheckRef = useRef<number>(0);
  
  const environment = getEnvironmentById(currentEnvironment) || getEnvironmentById('park')!;
  
  // Initialize encounter distance
  useEffect(() => {
    setNextEncounterAt(getNextEncounterDistance());
    startWalk();
    return () => endWalk();
  }, [startWalk, endWalk]);
  
  // Auto-walk simulation (for development)
  useEffect(() => {
    if (isWalking) {
      walkInterval.current = setInterval(() => {
        addSteps(1);
        setScrollOffset(prev => prev + 2);
        encounterCheckRef.current += 1;
        setEncounterProgress(prev => Math.min(prev + 1, nextEncounterAt));
        
        // Check for encounter
        if (encounterCheckRef.current >= nextEncounterAt) {
          handleEncounter();
        }
        
        // Show hint when close
        if (encounterCheckRef.current >= nextEncounterAt - 50 && !showEncounterHint) {
          setShowEncounterHint(true);
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
    
    // Determine encounter
    const { petId, rarity, personality } = rollEncounter();
    triggerEncounter(petId, rarity, personality);
    navigate('/encounter');
  }, [triggerEncounter, navigate]);
  
  const handleBack = () => {
    endWalk();
    navigate('/home');
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
                left: `${20 + index * 25}%`,
                zIndex: 10 - index
              }}
              animate={isWalking ? {
                y: [0, -8, 0],
                x: [0, 2, 0, -2, 0]
              } : {
                y: [0, -3, 0]
              }}
              transition={{
                duration: isWalking ? 0.4 : 2,
                repeat: Infinity,
                delay: index * 0.1
              }}
            >
              <PetRenderer
                petId={pet.petId}
                size={80 - index * 10}
                state={isWalking ? 'walk' : 'idle'}
                rarity={pet.rarity}
              />
            </motion.div>
          ))}
        </div>
        
        {/* Encounter hint */}
        <AnimatePresence>
          {showEncounterHint && (
            <motion.div
              className={styles.encounterHint}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className={styles.hintText}>Something's nearby...</span>
              <motion.div
                className={styles.pawPrints}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🐾
              </motion.div>
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
          {/* Progress to encounter */}
          <div className={styles.progressSection}>
            <div className={styles.progressLabel}>
              <PawIcon />
              <span>Next Friend</span>
            </div>
            <ProgressBar
              value={encounterProgress}
              max={nextEncounterAt}
              color="accent"
              size="md"
            />
          </div>
          
          {/* Walk control */}
          <div className={styles.walkControl}>
            <Button
              variant={isWalking ? 'secondary' : 'primary'}
              size="lg"
              fullWidth
              onClick={() => setIsWalking(!isWalking)}
            >
              {isWalking ? 'Pause' : 'Walk'}
            </Button>
          </div>
          
          {/* Dev controls */}
          {devMode && (
            <div className={styles.devControls}>
              <Button size="sm" variant="ghost" onClick={() => {
                addSteps(100);
                setEncounterProgress(prev => Math.min(prev + 100, nextEncounterAt));
                encounterCheckRef.current += 100;
              }}>
                +100 Steps
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
          {/* Trees/buildings based on environment */}
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
          
          {environment.id === 'city' && (
            <g>
              {[0, 150, 320, 500, 680, 850, 1020, 1200, 1380].map((x, i) => (
                <g key={i} transform={`translate(${x}, 50)`}>
                  <rect x="10" y={100 - (i % 3) * 30} width="80" height={100 + (i % 3) * 30} fill="#D4C5B8" />
                  <rect x="20" y={110 - (i % 3) * 30} width="15" height="20" fill="#B8D4E8" opacity="0.6" />
                  <rect x="45" y={110 - (i % 3) * 30} width="15" height="20" fill="#B8D4E8" opacity="0.6" />
                  <rect x="20" y={140 - (i % 3) * 30} width="15" height="20" fill="#B8D4E8" opacity="0.6" />
                  <rect x="45" y={140 - (i % 3) * 30} width="15" height="20" fill="#B8D4E8" opacity="0.6" />
                </g>
              ))}
            </g>
          )}
          
          {environment.id === 'riverside' && (
            <g>
              {/* Willow trees */}
              {[100, 400, 700, 1000, 1300].map((x, i) => (
                <g key={i} transform={`translate(${x}, 60)`}>
                  <rect x="20" y="100" width="15" height="80" fill="#8B7355" />
                  <ellipse cx="25" cy="70" rx="50" ry="60" fill="#7CB369" />
                  {/* Drooping branches */}
                  <path d="M 0 60 Q -20 120 -10 150" stroke="#6B8F4E" strokeWidth="3" fill="none" />
                  <path d="M 50 60 Q 70 120 60 150" stroke="#6B8F4E" strokeWidth="3" fill="none" />
                </g>
              ))}
              {/* Water */}
              <rect x="0" y="180" width="1600" height="70" fill="#89B8D4" opacity="0.5" />
            </g>
          )}
          
          {environment.id === 'beach' && (
            <g>
              {/* Palm trees */}
              {[150, 500, 900, 1300].map((x, i) => (
                <g key={i} transform={`translate(${x}, 40)`}>
                  <path d={`M 25 180 Q 30 100 25 50`} stroke="#8B7355" strokeWidth="12" fill="none" />
                  <ellipse cx="25" cy="30" rx="60" ry="30" fill="#6B8F4E" />
                  <ellipse cx="-10" cy="40" rx="50" ry="25" fill="#7CB369" />
                  <ellipse cx="60" cy="40" rx="50" ry="25" fill="#7CB369" />
                </g>
              ))}
              {/* Water */}
              <rect x="0" y="200" width="1600" height="50" fill="#89B8D4" opacity="0.6" />
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
          {/* Main ground */}
          <rect x="0" y="50" width="2000" height="100" fill={colors.ground} />
          
          {/* Path */}
          <rect x="0" y="80" width="2000" height="40" fill={colors.path} />
          
          {/* Grass details */}
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
      
      {/* Foreground layer */}
      <div 
        className={styles.layer}
        style={{ transform: `translateX(${-scrollOffset * 1.3}px)` }}
      >
        <svg viewBox="0 0 2400 100" className={styles.foregroundLayer} preserveAspectRatio="xMidYMid slice">
          {/* Grass tufts */}
          <g fill={colors.accent}>
            {[...Array(30)].map((_, i) => (
              <g key={i} transform={`translate(${i * 80}, 0)`}>
                <path d="M 10 100 Q 15 70 12 100 Q 20 75 25 100 Q 18 80 30 100" />
              </g>
            ))}
          </g>
          
          {/* Flowers */}
          <g>
            {[...Array(15)].map((_, i) => (
              <g key={i} transform={`translate(${i * 160 + 40}, 60)`}>
                <line x1="0" y1="20" x2="0" y2="40" stroke="#6B8F4E" strokeWidth="2" />
                <circle cx="-4" cy="18" r="4" fill={i % 2 === 0 ? '#FFB7C5' : '#F4A261'} />
                <circle cx="4" cy="18" r="4" fill={i % 2 === 0 ? '#FFB7C5' : '#F4A261'} />
                <circle cx="0" cy="14" r="4" fill={i % 2 === 0 ? '#FFB7C5' : '#F4A261'} />
                <circle cx="0" cy="18" r="3" fill="#FFD93D" />
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
};

// Helper functions
function getNextEncounterDistance(): number {
  return Math.floor(Math.random() * 700) + 300; // 300-1000 steps
}

function rollEncounter(): { petId: string; rarity: Rarity; personality: Personality } {
  // Roll rarity
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
  
  // Get pets of this rarity
  const eligiblePets = PETS.filter(p => p.baseRarity === rarity);
  const pet = eligiblePets[Math.floor(Math.random() * eligiblePets.length)];
  
  // Random personality
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

const PawIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--color-accent)">
    <ellipse cx="12" cy="17" rx="5" ry="4" />
    <ellipse cx="6" cy="11" rx="2.5" ry="3" />
    <ellipse cx="12" cy="8" rx="2.5" ry="3" />
    <ellipse cx="18" cy="11" rx="2.5" ry="3" />
  </svg>
);

export default WalkScreen;
