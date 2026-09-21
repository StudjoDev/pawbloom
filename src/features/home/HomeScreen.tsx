// PawBloom Home Screen - Main hub with team pets and daily info

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useLongPress } from '@/components/ui/DevDrawer';
import { PetRenderer } from '@/components/pets/PetRenderer';
import { getPetById } from '@/data/pets';
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
  
  // Long press on logo for dev mode
  const longPressProps = useLongPress(() => {
    toggleDevMode();
  }, 3000);
  
  useEffect(() => {
    initGame();
  }, [initGame]);
  
  const todaySteps = player?.todaySteps || 0;
  const totalSteps = player?.totalSteps || 0;
  const nextEncounterEstimate = Math.max(0, 500 - (totalSteps % 500));
  
  return (
    <div className={styles.container}>
      {/* Background scene */}
      <div className={styles.scene}>
        <HomeBackground environment={currentEnvironment} />
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
        </div>
        <div className={styles.headerRight}>
          <motion.button
            className={styles.iconButton}
            onClick={() => navigate('/collection')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <CollectionIcon />
            <span className={styles.badge}>{ownedPets.length}</span>
          </motion.button>
        </div>
      </motion.header>
      
      {/* Pet display area */}
      <div className={styles.petArea}>
        <div className={styles.petsContainer}>
          {teamPets.map((pet, index) => {
            const petDef = getPetById(pet.petId);
            const sizes = [110, 130, 100]; // Center pet is larger
            const petSize = sizes[index] || 100;
            return (
              <motion.div
                key={pet.instanceId}
                className={styles.petSlot}
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.2, duration: 0.6, type: 'spring' }}
                onClick={() => navigate(`/pet/${pet.instanceId}`)}
              >
                <PetRenderer
                  petId={pet.petId}
                  size={petSize}
                  state="idle"
                  rarity={pet.rarity}
                  delay={0.5 + index * 0.3}
                  showShadow={true}
                />
                <div className={styles.petLabel}>
                  <span className={styles.petNickname}>
                    {pet.nickname || petDef?.name || 'Pet'}
                  </span>
                  <span className={styles.petLevel}>Lv.{pet.bondLevel}</span>
                </div>
              </motion.div>
            );
          })}
          
          {/* Empty slots */}
          {teamPets.length < 3 && [...Array(3 - teamPets.length)].map((_, i) => (
            <motion.div
              key={`empty-${i}`}
              className={`${styles.petSlot} ${styles.emptySlot}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <div className={styles.emptyIcon}>+</div>
              <span className={styles.emptyText}>Walk to meet more!</span>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Stats panel */}
      <motion.div
        className={styles.statsArea}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Panel variant="glass" padding="md" rounded="xl">
          <div className={styles.statsGrid}>
            {/* Today's steps */}
            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <StepsIcon />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>Today's Steps</span>
                <span className={styles.statValue}>{todaySteps.toLocaleString()}</span>
              </div>
            </div>
            
            {/* Divider */}
            <div className={styles.statDivider} />
            
            {/* Next encounter */}
            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <PawIcon />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>Next Friend</span>
                <span className={styles.statValue}>~{nextEncounterEstimate} steps</span>
              </div>
            </div>
          </div>
          
          {/* Progress to next encounter */}
          <div className={styles.progressSection}>
            <ProgressBar
              value={totalSteps % 500}
              max={500}
              color="accent"
              size="md"
            />
            <p className={styles.progressHint}>Keep walking to discover new friends!</p>
          </div>
        </Panel>
      </motion.div>
      
      {/* Action buttons */}
      <motion.div
        className={styles.actions}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate('/walk')}
          leftIcon={<WalkIcon />}
        >
          Start Walk
        </Button>
        
        <div className={styles.secondaryActions}>
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/collection')}
          >
            Collection
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              if (teamPets.length > 0) {
                navigate(`/pet/${teamPets[0].instanceId}`);
              }
            }}
            disabled={teamPets.length === 0}
          >
            Pet Details
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// Home background with parallax layers
const HomeBackground: React.FC<{ environment: string }> = ({ environment }) => {
  const colors = getEnvironmentColors(environment);
  
  return (
    <svg viewBox="0 0 430 600" preserveAspectRatio="xMidYMid slice" className={styles.bgSvg}>
      {/* Sky gradient */}
      <defs>
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.skyTop} />
          <stop offset="100%" stopColor={colors.skyBottom} />
        </linearGradient>
      </defs>
      <rect width="430" height="600" fill="url(#skyGrad)" />
      
      {/* Clouds */}
      <g fill="white" opacity="0.8">
        <ellipse cx="80" cy="80" rx="40" ry="20" />
        <ellipse cx="110" cy="75" rx="50" ry="25" />
        <ellipse cx="140" cy="82" rx="35" ry="18" />
        
        <ellipse cx="320" cy="120" rx="35" ry="18" />
        <ellipse cx="350" cy="115" rx="45" ry="22" />
        <ellipse cx="380" cy="122" rx="30" ry="15" />
      </g>
      
      {/* Distant hills */}
      <path
        d="M 0 350 Q 100 300 200 330 Q 300 360 430 320 L 430 600 L 0 600 Z"
        fill={colors.farBg}
        opacity="0.4"
      />
      
      {/* Mid hills */}
      <path
        d="M 0 400 Q 80 370 150 390 Q 250 420 350 380 Q 400 370 430 400 L 430 600 L 0 600 Z"
        fill={colors.midBg}
        opacity="0.6"
      />
      
      {/* Ground */}
      <path
        d="M 0 480 Q 100 460 200 470 Q 300 485 430 470 L 430 600 L 0 600 Z"
        fill={colors.ground}
      />
      
      {/* Trees/decorations based on environment */}
      {environment === 'park' && (
        <g>
          <Tree x={50} y={420} scale={0.8} />
          <Tree x={380} y={430} scale={0.6} />
          <Tree x={320} y={450} scale={0.5} />
        </g>
      )}
      
      {/* Grass tufts */}
      <g fill={colors.accent} opacity="0.6">
        <path d="M 30 520 Q 35 500 32 520 Q 40 505 45 520" />
        <path d="M 100 530 Q 103 515 106 530" />
        <path d="M 200 525 Q 205 508 202 525 Q 210 512 215 525" />
        <path d="M 350 522 Q 353 510 356 522" />
        <path d="M 400 528 Q 405 512 402 528 Q 410 515 415 528" />
      </g>
      
      {/* Flowers */}
      <g>
        <Flower x={70} y={515} color="#FFB7C5" />
        <Flower x={180} y={522} color="#F4A261" />
        <Flower x={280} y={518} color="#FFB7C5" />
        <Flower x={360} y={525} color="#D4A5C9" />
      </g>
    </svg>
  );
};

const Tree: React.FC<{ x: number; y: number; scale: number }> = ({ x, y, scale }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <rect x="-5" y="20" width="10" height="30" fill="#8B7355" />
    <ellipse cx="0" cy="0" rx="25" ry="30" fill="#6B8F4E" />
    <ellipse cx="-12" cy="-10" rx="18" ry="22" fill="#7CB369" />
    <ellipse cx="12" cy="-5" rx="16" ry="20" fill="#8CB369" />
  </g>
);

const Flower: React.FC<{ x: number; y: number; color: string }> = ({ x, y, color }) => (
  <g transform={`translate(${x}, ${y})`}>
    <line x1="0" y1="0" x2="0" y2="10" stroke="#6B8F4E" strokeWidth="2" />
    <circle cx="-4" cy="-2" r="3" fill={color} />
    <circle cx="4" cy="-2" r="3" fill={color} />
    <circle cx="0" cy="-5" r="3" fill={color} />
    <circle cx="0" cy="0" r="2" fill="#FFD93D" />
  </g>
);

function getEnvironmentColors(env: string) {
  const colors: Record<string, any> = {
    park: {
      skyTop: '#B8D4E8',
      skyBottom: '#D4E8F5',
      farBg: '#6B8F4E',
      midBg: '#7CB369',
      ground: '#A8D08D',
      accent: '#8CB369'
    },
    city: {
      skyTop: '#C5D5E8',
      skyBottom: '#E8EEF5',
      farBg: '#C9B8A8',
      midBg: '#D4C5B8',
      ground: '#E8D5BC',
      accent: '#9B9B9B'
    },
    riverside: {
      skyTop: '#A8C8E8',
      skyBottom: '#D4E8F5',
      farBg: '#6B8F4E',
      midBg: '#89B8D4',
      ground: '#A8D08D',
      accent: '#7CB369'
    },
    beach: {
      skyTop: '#F5D4C5',
      skyBottom: '#F5E6D3',
      farBg: '#89B8D4',
      midBg: '#B8D4E8',
      ground: '#F5E6D3',
      accent: '#E8D5BC'
    }
  };
  return colors[env] || colors.park;
}

// Icon components
const LogoSmall: React.FC = () => (
  <svg viewBox="0 0 40 40" width="36" height="36">
    <circle cx="20" cy="20" r="18" fill="var(--color-primary)" />
    <ellipse cx="20" cy="22" rx="10" ry="8" fill="var(--color-surface)" />
    <ellipse cx="15" cy="18" rx="2" ry="2.5" fill="#3D3D3D" />
    <ellipse cx="25" cy="18" rx="2" ry="2.5" fill="#3D3D3D" />
    <path d="M 12 14 L 15 8 L 18 13" fill="var(--color-surface)" />
    <path d="M 28 14 L 25 8 L 22 13" fill="var(--color-surface)" />
  </svg>
);

const CollectionIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const StepsIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--color-accent)">
    <path d="M13.5 5.5C14.6 5.5 15.5 4.6 15.5 3.5C15.5 2.4 14.6 1.5 13.5 1.5C12.4 1.5 11.5 2.4 11.5 3.5C11.5 4.6 12.4 5.5 13.5 5.5Z" />
    <path d="M9.8 8.9L7 23H9.1L10.9 15L13 17V23H15V15.5L12.9 13.5L13.5 10.5C14.8 12 16.8 13 19 13V11C17.1 11 15.5 10 14.7 8.6L13.7 7C13.3 6.4 12.6 6 12 6C11.7 6 11.5 6.1 11.2 6.1L6 8.3V13H8V9.6L9.8 8.9Z" />
  </svg>
);

const PawIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--color-primary)">
    <ellipse cx="12" cy="17" rx="5" ry="4" />
    <ellipse cx="6" cy="11" rx="2.5" ry="3" />
    <ellipse cx="12" cy="8" rx="2.5" ry="3" />
    <ellipse cx="18" cy="11" rx="2.5" ry="3" />
  </svg>
);

const WalkIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <circle cx="12" cy="4" r="2" />
    <path d="M15.89 8.11C15.5 7.72 14.83 7 13.53 7H10.47C9.17 7 8.5 7.72 8.11 8.11L5 11.22L6.41 12.64L9 10.06V22H11V15H13V22H15V10.06L17.59 12.64L19 11.22L15.89 8.11Z" />
  </svg>
);

export default HomeScreen;
