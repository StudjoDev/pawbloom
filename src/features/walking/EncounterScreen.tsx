// PawBloom Encounter Screen - Full reveal sequence for new pets

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getPetById, RARITY_COLORS, type Rarity } from '@/data/pets';
import { PetRenderer } from '@/components/pets/PetRenderer';
import Button from '@/components/ui/Button';
import styles from './EncounterScreen.module.css';

type EncounterPhase = 
  | 'footprints' 
  | 'notice' 
  | 'bush' 
  | 'silhouette' 
  | 'tap' 
  | 'reveal' 
  | 'reaction' 
  | 'card';

const EncounterScreen: React.FC = () => {
  const navigate = useNavigate();
  const { pendingEncounter, collectPet, clearEncounter, currentEnvironment } = useGameStore();
  const [phase, setPhase] = useState<EncounterPhase>('footprints');
  const [nickname, setNickname] = useState('');
  const [isCollecting, setIsCollecting] = useState(false);
  
  const pet = pendingEncounter ? getPetById(pendingEncounter.petId) : null;
  const rarity = pendingEncounter?.rarity || 'common';
  const personality = pendingEncounter?.personality || 'playful';
  
  // Auto-advance through initial phases
  useEffect(() => {
    if (!pendingEncounter) {
      navigate('/walk', { replace: true });
      return;
    }
    
    const timers: NodeJS.Timeout[] = [];
    
    // Phase progression
    timers.push(setTimeout(() => setPhase('notice'), 1200));
    timers.push(setTimeout(() => setPhase('bush'), 2200));
    timers.push(setTimeout(() => setPhase('silhouette'), 3200));
    timers.push(setTimeout(() => setPhase('tap'), 4200));
    
    return () => timers.forEach(clearTimeout);
  }, [pendingEncounter, navigate]);
  
  const handleTap = useCallback(() => {
    if (phase === 'tap' || phase === 'silhouette') {
      setPhase('reveal');
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 100]);
      }
      
      setTimeout(() => setPhase('reaction'), 1500);
      setTimeout(() => setPhase('card'), 3000);
    }
  }, [phase]);
  
  const handleCollect = async () => {
    if (isCollecting) return;
    
    setIsCollecting(true);
    try {
      await collectPet(nickname.trim() || undefined);
      navigate('/home', { replace: true });
    } catch (error) {
      console.error('Failed to collect pet:', error);
      setIsCollecting(false);
    }
  };
  
  const handleSkip = () => {
    clearEncounter();
    navigate('/walk', { replace: true });
  };
  
  if (!pet || !pendingEncounter) return null;
  
  const rarityColor = RARITY_COLORS[rarity];
  const rarityLabel = getRarityLabel(rarity);
  
  return (
    <div 
      className={styles.container} 
      onClick={handleTap}
      style={{
        background: `linear-gradient(180deg, ${getEnvSkyColor(currentEnvironment)} 0%, var(--color-background) 100%)`
      }}
    >
      {/* Rarity glow effect */}
      <motion.div
        className={styles.rarityGlow}
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: phase === 'reveal' || phase === 'reaction' || phase === 'card' ? 0.6 : 0 
        }}
        style={{
          background: `radial-gradient(circle at 50% 40%, ${rarityColor}60 0%, transparent 60%)`
        }}
      />
      
      {/* Sparkle effects */}
      <AnimatePresence>
        {(phase === 'reveal' || phase === 'reaction') && (
          <div className={styles.sparklesContainer}>
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className={styles.sparkle}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  x: 0,
                  y: 0
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  x: Math.cos((i / 20) * Math.PI * 2) * (100 + Math.random() * 60),
                  y: Math.sin((i / 20) * Math.PI * 2) * (100 + Math.random() * 60)
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.03,
                  ease: 'easeOut'
                }}
              >
                <SparkleIcon color={rarityColor} size={12 + Math.random() * 12} />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
      
      {/* Phase: Footprints */}
      <AnimatePresence>
        {phase === 'footprints' && (
          <motion.div
            className={styles.footprints}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: [0, 1, 0.5], y: 0 }}
                transition={{ delay: i * 0.3, duration: 0.5 }}
                style={{ transform: `translateX(${i * 30 - 30}px) rotate(${i % 2 ? 15 : -15}deg)` }}
              >
                <PawPrintIcon />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Phase: Team notices */}
      <AnimatePresence>
        {phase === 'notice' && (
          <motion.div
            className={styles.noticeText}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <span>Your pets noticed something!</span>
            <motion.span
              className={styles.questionMarks}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              ❓
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Phase: Bush rustling */}
      <AnimatePresence>
        {phase === 'bush' && (
          <motion.div
            className={styles.bushContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              animate={{ 
                x: [-5, 5, -5],
                rotate: [-2, 2, -2]
              }}
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              <BushIcon />
            </motion.div>
            <motion.p
              className={styles.bushText}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              *rustle rustle*
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Phase: Silhouette & Tap */}
      <AnimatePresence>
        {(phase === 'silhouette' || phase === 'tap') && (
          <motion.div
            className={styles.silhouetteContainer}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
          >
            <motion.div
              animate={phase === 'tap' ? { 
                scale: [1, 1.05, 1],
              } : {}}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <PetRenderer
                petId={pendingEncounter.petId}
                size={180}
                state="silhouette"
              />
            </motion.div>
            
            {phase === 'tap' && (
              <motion.p
                className={styles.tapHint}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Tap to reveal!
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Phase: Reveal & Reaction */}
      <AnimatePresence>
        {(phase === 'reveal' || phase === 'reaction') && (
          <motion.div
            className={styles.revealContainer}
            initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <PetRenderer
              petId={pendingEncounter.petId}
              size={200}
              state={phase === 'reaction' ? 'happy' : 'surprised'}
              showRarityGlow
              rarity={rarity}
            />
            
            {phase === 'reaction' && (
              <motion.div
                className={styles.reactionBubble}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span>{getReactionText(personality)}</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Phase: Collection Card */}
      <AnimatePresence>
        {phase === 'card' && (
          <motion.div
            className={styles.cardOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className={styles.collectionCard}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* Rarity banner */}
              <div 
                className={styles.rarityBanner}
                style={{ background: `linear-gradient(135deg, ${rarityColor} 0%, ${rarityColor}CC 100%)` }}
              >
                <span className={styles.rarityStars}>
                  {getRarityStars(rarity)}
                </span>
                <span className={styles.rarityText}>{rarityLabel}</span>
              </div>
              
              {/* Pet preview */}
              <div className={styles.cardPetPreview}>
                <PetRenderer
                  petId={pendingEncounter.petId}
                  size={120}
                  state="happy"
                  rarity={rarity}
                />
              </div>
              
              {/* Pet info */}
              <div className={styles.cardInfo}>
                <h2 className={styles.cardPetName}>{pet.name}</h2>
                <p className={styles.cardPetDesc}>{pet.description}</p>
                
                <div className={styles.cardTraits}>
                  <div className={styles.trait}>
                    <span className={styles.traitLabel}>Personality</span>
                    <span className={styles.traitValue}>{capitalizeFirst(personality)}</span>
                  </div>
                  <div className={styles.trait}>
                    <span className={styles.traitLabel}>Species</span>
                    <span className={styles.traitValue}>{pet.species === 'dog' ? 'Dog' : 'Cat'}</span>
                  </div>
                </div>
                
                {/* Nickname input */}
                <div className={styles.nicknameSection}>
                  <label className={styles.nicknameLabel}>Give a nickname (optional)</label>
                  <input
                    type="text"
                    className={styles.nicknameInput}
                    placeholder={pet.name}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value.slice(0, 20))}
                    maxLength={20}
                  />
                </div>
              </div>
              
              {/* Actions */}
              <div className={styles.cardActions}>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleCollect}
                  isLoading={isCollecting}
                >
                  Welcome to the Family!
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  disabled={isCollecting}
                >
                  Continue Walking
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper functions
function getRarityLabel(rarity: Rarity): string {
  const labels: Record<Rarity, string> = {
    common: 'Common',
    uncommon: 'Uncommon',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary'
  };
  return labels[rarity];
}

function getRarityStars(rarity: Rarity): string {
  const stars: Record<Rarity, string> = {
    common: '★',
    uncommon: '★★',
    rare: '★★★',
    epic: '★★★★',
    legendary: '★★★★★'
  };
  return stars[rarity];
}

function getReactionText(personality: string): string {
  const reactions: Record<string, string> = {
    shy: '*peeks nervously*',
    playful: "Let's play!",
    sleepy: '*yawn* ...hi...',
    foodie: 'Got any treats?',
    curious: 'Ooh, new friend!',
    brave: "I'll protect you!",
    clingy: "Don't leave me!",
    tsundere: "I-it's not like I like you!",
    explorer: 'Adventure time!',
    mischievous: '*plotting something*'
  };
  return reactions[personality] || 'Nice to meet you!';
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getEnvSkyColor(env: string): string {
  const colors: Record<string, string> = {
    park: '#B8D4E8',
    city: '#C5D5E8',
    riverside: '#A8C8E8',
    beach: '#F5D4C5'
  };
  return colors[env] || colors.park;
}

// Icon components
const PawPrintIcon: React.FC = () => (
  <svg viewBox="0 0 40 40" width="40" height="40" fill="var(--color-primary)" opacity="0.6">
    <ellipse cx="20" cy="28" rx="10" ry="8" />
    <ellipse cx="10" cy="16" rx="5" ry="6" />
    <ellipse cx="20" cy="12" rx="5" ry="6" />
    <ellipse cx="30" cy="16" rx="5" ry="6" />
  </svg>
);

const BushIcon: React.FC = () => (
  <svg viewBox="0 0 120 80" width="150" height="100">
    <ellipse cx="60" cy="50" rx="50" ry="30" fill="#7CB369" />
    <ellipse cx="35" cy="45" rx="35" ry="25" fill="#8CB369" />
    <ellipse cx="85" cy="45" rx="35" ry="25" fill="#8CB369" />
    <ellipse cx="60" cy="35" rx="40" ry="25" fill="#6B8F4E" />
  </svg>
);

const SparkleIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
    <path d="M12 0L14 8L22 10L14 12L12 20L10 12L2 10L10 8Z" />
  </svg>
);

export default EncounterScreen;
