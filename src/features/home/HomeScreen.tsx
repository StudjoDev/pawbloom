// PawBloom Home Screen - Living scene with ambient life and Japanese cozy UI
// Gate C: Beautiful visual + Gate D: Audio integration

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useLongPress } from '@/components/ui/DevDrawer';
import { PetRenderer } from '@/components/pets/PetRenderer';
import { getPetById } from '@/data/pets';
import { usePlaySound } from '@/hooks/useAudio';
import { audioManager } from '@/services/audio/AudioManager';
import { hapticsManager } from '@/services/audio/HapticsManager';
import Button from '@/components/ui/Button';
import Panel from '@/components/ui/Panel';
import ProgressBar from '@/components/ui/ProgressBar';
import styles from './HomeScreen.module.css';

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { 
    initGame, 
    player, 
    teamPets, 
    ownedPets, 
    toggleDevMode,
    currentEnvironment 
  } = useGameStore();
  const { playSFX, playHaptic } = usePlaySound();
  
  const [petStates, setPetStates] = useState<Record<string, 'idle' | 'happy' | 'surprised'>>({});
  const [showWelcome, setShowWelcome] = useState(false);
  const [showHearts, setShowHearts] = useState<Record<string, boolean>>({});
  const [showSettings, setShowSettings] = useState(false);
  const longPressTimerRef = useRef<Record<string, NodeJS.Timeout>>({});
  
  const longPressProps = useLongPress(() => {
    toggleDevMode();
    playHaptic('tap');
  }, 3000);
  
  useEffect(() => {
    initGame();
    audioManager.playBGM('home');
    
    const timer = setTimeout(() => setShowWelcome(true), 500);
    return () => clearTimeout(timer);
  }, [initGame]);
  
  const handlePetTap = useCallback((instanceId: string) => {
    playSFX('tap');
    playHaptic('tap');
    
    setPetStates(prev => ({ ...prev, [instanceId]: 'happy' }));
    setTimeout(() => {
      setPetStates(prev => ({ ...prev, [instanceId]: 'idle' }));
    }, 1000);
  }, [playSFX, playHaptic]);

  // P0-4: Long-press to pet - shows hearts and plays bond haptic
  const handlePetTouchStart = useCallback((instanceId: string) => {
    longPressTimerRef.current[instanceId] = setTimeout(() => {
      audioManager.playSFX('bond_up');
      hapticsManager.play('bond');
      
      setPetStates(prev => ({ ...prev, [instanceId]: 'happy' }));
      setShowHearts(prev => ({ ...prev, [instanceId]: true }));
      
      setTimeout(() => {
        setPetStates(prev => ({ ...prev, [instanceId]: 'idle' }));
        setShowHearts(prev => ({ ...prev, [instanceId]: false }));
      }, 1500);
    }, 500);
  }, []);

  const handlePetTouchEnd = useCallback((instanceId: string) => {
    if (longPressTimerRef.current[instanceId]) {
      clearTimeout(longPressTimerRef.current[instanceId]);
      delete longPressTimerRef.current[instanceId];
    }
  }, []);
  
  const handleStartWalk = () => {
    playSFX('ui_click');
    playHaptic('tap');
    audioManager.playBGM('walk');
    navigate('/walk');
  };
  
  const handleCollection = () => {
    playSFX('ui_click');
    navigate('/collection');
  };
  
  const todaySteps = player?.todaySteps || 0;
  const totalSteps = player?.totalSteps || 0;
  const nextEncounterEstimate = Math.max(0, 500 - (totalSteps % 500));
  const progress = (totalSteps % 500) / 500;
  
  return (
    <div className={styles.container}>
      {/* Living background scene */}
      <div className={styles.scene}>
        <HomeBackground environment={currentEnvironment} />
        <AmbientLife />
      </div>
      
      {/* Header */}
      <motion.header 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.logo} {...longPressProps}>
          <LogoSmall />
          <span className={styles.logoText}>PawBloom</span>
        </div>
        <div className={styles.headerRight}>
          <motion.button
            className={styles.settingsButton}
            onClick={() => {
              playSFX('ui_click');
              setShowSettings(!showSettings);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SettingsIcon />
          </motion.button>
          <motion.button
            className={styles.collectionButton}
            onClick={handleCollection}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <CollectionIcon />
            <span className={styles.badge}>{ownedPets.length}</span>
          </motion.button>
        </div>
      </motion.header>
      
      {/* Welcome message */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            className={styles.welcomeMessage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span>{getGreeting()}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Pet display area - Living pets */}
      <div className={styles.petArea}>
        <div className={styles.petsContainer}>
          {teamPets.map((pet, index) => {
            const petDef = getPetById(pet.petId);
            const sizes = [100, 120, 95];
            const petSize = sizes[index] || 100;
            const offsets = [-25, 0, 30];
            const zIndexes = [8, 10, 7];
            
            return (
              <motion.div
                key={pet.instanceId}
                className={styles.petSlot}
                style={{
                  left: `${28 + index * 22}%`,
                  bottom: `${10 + Math.sin(index * 1.5) * 5}%`,
                  transform: `translateX(${offsets[index]}px)`,
                  zIndex: zIndexes[index],
                }}
                initial={{ opacity: 0, y: 40, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: 0.4 + index * 0.15, 
                  duration: 0.6, 
                  type: 'spring',
                  stiffness: 200,
                }}
                onClick={() => handlePetTap(pet.instanceId)}
                onTouchStart={() => handlePetTouchStart(pet.instanceId)}
                onTouchEnd={() => handlePetTouchEnd(pet.instanceId)}
                onMouseDown={() => handlePetTouchStart(pet.instanceId)}
                onMouseUp={() => handlePetTouchEnd(pet.instanceId)}
                onMouseLeave={() => handlePetTouchEnd(pet.instanceId)}
                onDoubleClick={() => {
                  playSFX('ui_click');
                  navigate(`/pet/${pet.instanceId}`);
                }}
              >
                <PetRenderer
                  petId={pet.petId}
                  size={petSize}
                  state={petStates[pet.instanceId] || 'idle'}
                  rarity={pet.rarity}
                  showShadow={true}
                  // P0-4: Distinct phase offset per pet (0.37s spacing)
                  phaseOffset={index * 0.37}
                  instanceId={pet.instanceId}
                />
                {/* P0-4: Bond as hearts ❤️❤️♡ not XP numbers */}
                <div className={styles.bondHearts}>
                  {getBondHearts(pet.bondLevel)}
                </div>
                
                {/* Hearts animation on long-press */}
                <AnimatePresence>
                  {showHearts[pet.instanceId] && (
                    <motion.div
                      className={styles.heartsFloat}
                      initial={{ opacity: 0, y: 0 }}
                      animate={{ opacity: [1, 1, 0], y: -40 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.2 }}
                    >
                      ❤️ ❤️ ❤️
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <motion.div 
                  className={styles.petLabel}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <span className={styles.petNickname}>
                    {pet.nickname || petDef?.name || 'Pet'}
                  </span>
                </motion.div>
              </motion.div>
            );
          })}
          
          {/* Empty slots with invite */}
          {teamPets.length < 3 && [...Array(3 - teamPets.length)].map((_, i) => (
            <motion.div
              key={`empty-${i}`}
              className={`${styles.petSlot} ${styles.emptySlot}`}
              style={{
                left: `${28 + (teamPets.length + i) * 22}%`,
                bottom: '12%',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.8 + i * 0.1 }}
            >
              <div className={styles.emptyIcon}>
                <PawPlaceholder />
              </div>
              <span className={styles.emptyText}>Walk to meet!</span>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Stats panel - Japanese cozy style */}
      <motion.div
        className={styles.statsArea}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Panel variant="glass" padding="md" rounded="xl" className={styles.statsPanel}>
          <div className={styles.statsGrid}>
            {/* Today's steps */}
            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <StepsIcon />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>Today</span>
                <span className={styles.statValue}>{todaySteps.toLocaleString()}</span>
              </div>
            </div>
            
            <div className={styles.statDivider} />
            
            {/* Next encounter */}
            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <PawIcon />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>Next Friend</span>
                <span className={styles.statValue}>~{nextEncounterEstimate}</span>
              </div>
            </div>
          </div>
          
          {/* Progress bar with paw markers */}
          <div className={styles.progressSection}>
            <div className={styles.progressTrack}>
              <ProgressBar
                value={totalSteps % 500}
                max={500}
                color="accent"
                size="md"
              />
              <motion.div 
                className={styles.progressPaw}
                style={{ left: `${progress * 100}%` }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🐾
              </motion.div>
            </div>
            <p className={styles.progressHint}>
              {nextEncounterEstimate < 100 
                ? "So close! A new friend awaits!" 
                : "Keep walking to discover friends!"}
            </p>
          </div>
        </Panel>
      </motion.div>
      
      {/* Action buttons - Powerful CTA */}
      <motion.div
        className={styles.actions}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleStartWalk}
            leftIcon={<WalkIcon />}
            className={styles.startWalkButton}
          >
            Start Walk
          </Button>
        </motion.div>
        
        {/* Paw decoration under CTA */}
        <div className={styles.ctaDecor}>
          <span>🐾</span>
          <span>🐾</span>
          <span>🐾</span>
        </div>
        
        <div className={styles.secondaryActions}>
          <Button
            variant="secondary"
            size="md"
            onClick={handleCollection}
          >
            📖 Collection
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              if (teamPets.length > 0) {
                playSFX('ui_click');
                navigate(`/pet/${teamPets[0].instanceId}`);
              }
            }}
            disabled={teamPets.length === 0}
          >
            💝 Pet Details
          </Button>
        </div>
      </motion.div>

      {/* Settings Panel (Audio) */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className={styles.settingsOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              className={styles.settingsPanel}
              initial={{ y: 300, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <AudioSettingsPanel onClose={() => setShowSettings(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Audio Settings Panel Component
const AudioSettingsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [bgmVolume, setBgmVolume] = useState(audioManager.bgmVolume * 100);
  const [sfxVolume, setSfxVolume] = useState(audioManager.sfxVolume * 100);
  const [isMuted, setIsMuted] = useState(audioManager.isMuted);
  const [hapticsEnabled, setHapticsEnabled] = useState(hapticsManager.isEnabled);

  const handleBgmChange = (value: number) => {
    setBgmVolume(value);
    audioManager.setBGMVolume(value / 100);
  };

  const handleSfxChange = (value: number) => {
    setSfxVolume(value);
    audioManager.setSFXVolume(value / 100);
  };

  const handleMuteToggle = () => {
    const newMuted = audioManager.toggleMute();
    setIsMuted(newMuted);
  };

  const handleHapticsToggle = () => {
    const newEnabled = hapticsManager.toggle();
    setHapticsEnabled(newEnabled);
  };

  const handleTestSfx = () => {
    audioManager.playSFX('tap');
    hapticsManager.play('tap');
  };

  return (
    <div className={styles.settingsContent}>
      <div className={styles.settingsHeader}>
        <h3>🔊 Audio Settings</h3>
        <button className={styles.closeSettingsBtn} onClick={onClose}>✕</button>
      </div>

      <div className={styles.settingRow}>
        <label>🎵 BGM</label>
        <input
          type="range"
          min="0"
          max="100"
          value={bgmVolume}
          onChange={(e) => handleBgmChange(Number(e.target.value))}
          className={styles.slider}
        />
        <span>{Math.round(bgmVolume)}%</span>
      </div>

      <div className={styles.settingRow}>
        <label>🔔 SFX</label>
        <input
          type="range"
          min="0"
          max="100"
          value={sfxVolume}
          onChange={(e) => handleSfxChange(Number(e.target.value))}
          className={styles.slider}
        />
        <span>{Math.round(sfxVolume)}%</span>
      </div>

      <div className={styles.settingRow}>
        <label>🔇 Mute All</label>
        <button 
          className={`${styles.toggleBtn} ${isMuted ? styles.active : ''}`}
          onClick={handleMuteToggle}
        >
          {isMuted ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className={styles.settingRow}>
        <label>📳 Haptics</label>
        <button 
          className={`${styles.toggleBtn} ${hapticsEnabled ? styles.active : ''}`}
          onClick={handleHapticsToggle}
        >
          {hapticsEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      <button className={styles.testSfxBtn} onClick={handleTestSfx}>
        Test Sound 🔊
      </button>
    </div>
  );
};

// Ambient life - butterflies, leaves, sparkles
const AmbientLife: React.FC = () => {
  return (
    <div className={styles.ambientLife}>
      {/* Floating butterflies */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`butterfly-${i}`}
          className={styles.butterfly}
          style={{
            left: `${20 + i * 30}%`,
            top: `${25 + i * 15}%`,
          }}
          animate={{
            x: [0, 30, -20, 40, 0],
            y: [0, -20, 10, -30, 0],
            rotate: [0, 10, -10, 5, 0],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <ButterflyIcon color={i % 2 === 0 ? '#FFB7C5' : '#D4A5C9'} />
        </motion.div>
      ))}
      
      {/* Floating leaves */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`leaf-${i}`}
          className={styles.leaf}
          style={{
            left: `${10 + i * 25}%`,
            top: '-10%',
          }}
          animate={{
            y: ['0%', '120%'],
            x: [0, 20, -20, 30, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12 + i * 3,
            repeat: Infinity,
            delay: i * 4,
            ease: 'linear',
          }}
        >
          <LeafIcon />
        </motion.div>
      ))}
      
      {/* Sparkles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className={styles.sparkle}
          style={{
            left: `${15 + i * 14}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2 + Math.random(),
            repeat: Infinity,
            delay: i * 0.8,
          }}
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
};

// Enhanced background with parallax layers
const HomeBackground: React.FC<{ environment: string }> = ({ environment }) => {
  const colors = getEnvironmentColors(environment);
  
  return (
    <svg viewBox="0 0 430 700" preserveAspectRatio="xMidYMid slice" className={styles.bgSvg}>
      <defs>
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.skyTop} />
          <stop offset="60%" stopColor={colors.skyBottom} />
          <stop offset="100%" stopColor={colors.skyBottom} />
        </linearGradient>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      
      {/* Sky */}
      <rect width="430" height="700" fill="url(#skyGrad)" />
      
      {/* Sun with glow */}
      <circle cx="350" cy="100" r="45" fill="#FFE4B5" opacity="0.6" filter="url(#softGlow)" />
      <circle cx="350" cy="100" r="35" fill="#FFD93D" opacity="0.8" />
      
      {/* Animated clouds */}
      <g fill="white" opacity="0.9">
        <motion.g
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ellipse cx="80" cy="90" rx="45" ry="22" />
          <ellipse cx="115" cy="85" rx="55" ry="28" />
          <ellipse cx="150" cy="92" rx="40" ry="20" />
        </motion.g>
        
        <motion.g
          animate={{ x: [0, -15, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ellipse cx="330" cy="140" rx="38" ry="20" />
          <ellipse cx="365" cy="135" rx="48" ry="25" />
          <ellipse cx="400" cy="142" rx="35" ry="18" />
        </motion.g>
      </g>
      
      {/* Distant hills - parallax layer */}
      <path
        d="M 0 400 Q 80 350 180 380 Q 280 420 350 370 Q 400 350 430 380 L 430 700 L 0 700 Z"
        fill={colors.farBg}
        opacity="0.35"
      />
      
      {/* Mid hills */}
      <path
        d="M 0 450 Q 100 410 180 440 Q 280 480 350 430 Q 400 420 430 450 L 430 700 L 0 700 Z"
        fill={colors.midBg}
        opacity="0.55"
      />
      
      {/* Trees */}
      {environment === 'park' && (
        <g>
          <Tree x={40} y={400} scale={0.9} />
          <Tree x={370} y={410} scale={0.7} />
          <Tree x={300} y={430} scale={0.55} />
        </g>
      )}
      
      {/* Ground with grass texture */}
      <path
        d="M 0 520 Q 80 505 180 515 Q 280 530 350 510 Q 400 505 430 520 L 430 700 L 0 700 Z"
        fill={colors.ground}
      />
      
      {/* Path/clearing for pets */}
      <ellipse cx="215" cy="600" rx="160" ry="50" fill={colors.path} opacity="0.6" />
      
      {/* Grass tufts */}
      <g fill={colors.accent} opacity="0.7">
        {[30, 90, 150, 220, 290, 350, 400].map((x, i) => (
          <path 
            key={i}
            d={`M ${x} 530 Q ${x+3} 515 ${x+1} 530 Q ${x+8} 518 ${x+12} 530`}
          />
        ))}
      </g>
      
      {/* Flowers */}
      <g>
        <Flower x={60} y={540} color="#FFB7C5" />
        <Flower x={130} y={545} color="#F4A261" />
        <Flower x={270} y={538} color="#D4A5C9" />
        <Flower x={340} y={543} color="#FFB7C5" />
        <Flower x={390} y={548} color="#9B8EC2" />
      </g>
    </svg>
  );
};

const Tree: React.FC<{ x: number; y: number; scale: number }> = ({ x, y, scale }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <rect x="-6" y="25" width="12" height="40" fill="#8B7355" rx="2" />
    <ellipse cx="0" cy="0" rx="30" ry="38" fill="#6B8F4E" />
    <ellipse cx="-15" cy="-12" rx="22" ry="28" fill="#7CB369" />
    <ellipse cx="15" cy="-8" rx="20" ry="26" fill="#8CB369" />
    <ellipse cx="0" cy="-20" rx="15" ry="18" fill="#9BD07D" />
  </g>
);

const Flower: React.FC<{ x: number; y: number; color: string }> = ({ x, y, color }) => (
  <g transform={`translate(${x}, ${y})`}>
    <line x1="0" y1="0" x2="0" y2="12" stroke="#6B8F4E" strokeWidth="2" />
    <circle cx="-5" cy="-3" r="4" fill={color} />
    <circle cx="5" cy="-3" r="4" fill={color} />
    <circle cx="0" cy="-7" r="4" fill={color} />
    <circle cx="-3" cy="1" r="3" fill={color} />
    <circle cx="3" cy="1" r="3" fill={color} />
    <circle cx="0" cy="-2" r="3" fill="#FFD93D" />
  </g>
);

// P0-4: Bond as hearts ❤️❤️♡ not XP numbers
function getBondHearts(bondLevel: number): string {
  const maxHearts = 5;
  const filledHearts = Math.min(bondLevel, maxHearts);
  const emptyHearts = maxHearts - filledHearts;
  return '❤️'.repeat(filledHearts) + '♡'.repeat(emptyHearts);
}

function getEnvironmentColors(env: string) {
  const colors: Record<string, any> = {
    park: {
      skyTop: '#B8D4E8',
      skyBottom: '#D4E8F5',
      farBg: '#6B8F4E',
      midBg: '#7CB369',
      ground: '#A8D08D',
      path: '#C8E8B0',
      accent: '#8CB369'
    },
    city: {
      skyTop: '#C5D5E8',
      skyBottom: '#E8EEF5',
      farBg: '#C9B8A8',
      midBg: '#D4C5B8',
      ground: '#E8D5BC',
      path: '#F5E6D3',
      accent: '#9B9B9B'
    },
    riverside: {
      skyTop: '#A8C8E8',
      skyBottom: '#D4E8F5',
      farBg: '#6B8F4E',
      midBg: '#89B8D4',
      ground: '#A8D08D',
      path: '#C8E8B0',
      accent: '#7CB369'
    },
    beach: {
      skyTop: '#F5D4C5',
      skyBottom: '#F5E6D3',
      farBg: '#89B8D4',
      midBg: '#B8D4E8',
      ground: '#F5E6D3',
      path: '#FFF5E6',
      accent: '#E8D5BC'
    }
  };
  return colors[env] || colors.park;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning! 🌸";
  if (hour < 18) return "Good afternoon! ☀️";
  return "Good evening! 🌙";
}

// Icon Components
const LogoSmall: React.FC = () => (
  <svg viewBox="0 0 40 40" width="32" height="32">
    <circle cx="20" cy="20" r="18" fill="var(--color-primary)" />
    <ellipse cx="20" cy="22" rx="10" ry="8" fill="var(--color-surface)" />
    <ellipse cx="14" cy="18" rx="2.5" ry="3" fill="#3D3D3D" />
    <ellipse cx="26" cy="18" rx="2.5" ry="3" fill="#3D3D3D" />
    <path d="M 11 13 L 14 6 L 18 12" fill="var(--color-surface)" />
    <path d="M 29 13 L 26 6 L 22 12" fill="var(--color-surface)" />
  </svg>
);

const CollectionIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--color-primary)" strokeWidth="2.5">
    <rect x="3" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="3" width="7" height="7" rx="2" />
    <rect x="3" y="14" width="7" height="7" rx="2" />
    <rect x="14" y="14" width="7" height="7" rx="2" />
  </svg>
);

const StepsIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="var(--color-accent)">
    <path d="M13.5 5.5C14.6 5.5 15.5 4.6 15.5 3.5C15.5 2.4 14.6 1.5 13.5 1.5C12.4 1.5 11.5 2.4 11.5 3.5C11.5 4.6 12.4 5.5 13.5 5.5Z" />
    <path d="M9.8 8.9L7 23H9.1L10.9 15L13 17V23H15V15.5L12.9 13.5L13.5 10.5C14.8 12 16.8 13 19 13V11C17.1 11 15.5 10 14.7 8.6L13.7 7C13.3 6.4 12.6 6 12 6C11.7 6 11.5 6.1 11.2 6.1L6 8.3V13H8V9.6L9.8 8.9Z" />
  </svg>
);

const PawIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="var(--color-primary)">
    <ellipse cx="12" cy="17" rx="5" ry="4" />
    <ellipse cx="6" cy="11" rx="2.5" ry="3" />
    <ellipse cx="12" cy="8" rx="2.5" ry="3" />
    <ellipse cx="18" cy="11" rx="2.5" ry="3" />
  </svg>
);

const WalkIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <circle cx="12" cy="4" r="2.5" />
    <path d="M15.89 8.11C15.5 7.72 14.83 7 13.53 7H10.47C9.17 7 8.5 7.72 8.11 8.11L5 11.22L6.41 12.64L9 10.06V22H11V15H13V22H15V10.06L17.59 12.64L19 11.22L15.89 8.11Z" />
  </svg>
);

const PawPlaceholder: React.FC = () => (
  <svg viewBox="0 0 40 40" width="40" height="40" fill="var(--color-text-muted)" opacity="0.4">
    <ellipse cx="20" cy="28" rx="10" ry="8" />
    <ellipse cx="10" cy="16" rx="5" ry="6" />
    <ellipse cx="20" cy="12" rx="5" ry="6" />
    <ellipse cx="30" cy="16" rx="5" ry="6" />
  </svg>
);

const ButterflyIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 24 24" width="20" height="20">
    <ellipse cx="8" cy="10" rx="5" ry="6" fill={color} opacity="0.8" />
    <ellipse cx="16" cy="10" rx="5" ry="6" fill={color} opacity="0.8" />
    <ellipse cx="8" cy="16" rx="4" ry="5" fill={color} opacity="0.6" />
    <ellipse cx="16" cy="16" rx="4" ry="5" fill={color} opacity="0.6" />
    <rect x="11" y="6" width="2" height="14" rx="1" fill="#3D3D3D" />
  </svg>
);

const LeafIcon: React.FC = () => (
  <svg viewBox="0 0 20 20" width="16" height="16">
    <path 
      d="M10 2 Q 18 8 10 18 Q 2 8 10 2" 
      fill="#8CB369" 
      opacity="0.7"
    />
    <path 
      d="M10 4 L 10 16" 
      stroke="#6B8F4E" 
      strokeWidth="1" 
      fill="none"
    />
  </svg>
);

const SettingsIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--color-text)" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export default HomeScreen;
