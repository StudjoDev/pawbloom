// PawBloom Reveal Screen - First pet encounter reveal animation
// P0-2: CRITICAL heart_pause phase - 1.5s pet+heart ONLY before any UI/card

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getPetById, RARITY_COLORS } from '@/data/pets';
import { PetRenderer } from '@/components/pets/PetRenderer';
import { audioManager } from '@/services/audio/AudioManager';
import { hapticsManager } from '@/services/audio/HapticsManager';
import styles from './RevealScreen.module.css';

// CRITICAL: Added 'heart_pause' phase for 1.5s quiet beat
type RevealPhase = 'silhouette' | 'revealing' | 'revealed' | 'heart_pause' | 'navigate_naming';

const RevealScreen: React.FC = () => {
  const navigate = useNavigate();
  const { selectedStarterId } = useGameStore();
  const [phase, setPhase] = useState<RevealPhase>('silhouette');
  const [showSparkles, setShowSparkles] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  
  const pet = selectedStarterId ? getPetById(selectedStarterId) : null;
  
  useEffect(() => {
    if (!selectedStarterId) {
      navigate('/starter', { replace: true });
      return;
    }
    
    // Auto-progress through phases with proper timing
    const timers: NodeJS.Timeout[] = [];
    
    // Phase 1: silhouette (1.5s)
    timers.push(setTimeout(() => {
      setPhase('revealing');
      audioManager.playSFX('reveal_whoosh');
    }, 1500));
    
    // Phase 2: revealing -> revealed (0.8s)
    timers.push(setTimeout(() => {
      setPhase('revealed');
      setShowSparkles(true);
      audioManager.playSFX('sparkle');
      hapticsManager.play('success');
    }, 2300));
    
    // Phase 3: Show heart and enter heart_pause (1s after revealed)
    timers.push(setTimeout(() => {
      setShowHeart(true);
      setPhase('heart_pause');
      audioManager.playSFX('bond_up');
      console.log('[Reveal] heart_pause START - 1.5s quiet beat');
    }, 3300));
    
    // Phase 4: After 1.5s heart_pause, navigate to naming
    timers.push(setTimeout(() => {
      console.log('[Reveal] heart_pause END - navigating to naming');
      setPhase('navigate_naming');
      navigate('/naming');
    }, 4800)); // 3300 + 1500 = 4800ms
    
    return () => timers.forEach(clearTimeout);
  }, [selectedStarterId, navigate]);
  
  // Handle tap to speed up reveal (but still respect heart_pause)
  const handleTapReveal = () => {
    if (phase === 'silhouette') {
      setPhase('revealing');
      audioManager.playSFX('reveal_whoosh');
      
      setTimeout(() => {
        setPhase('revealed');
        setShowSparkles(true);
        audioManager.playSFX('sparkle');
        hapticsManager.play('success');
      }, 600);
      
      setTimeout(() => {
        setShowHeart(true);
        setPhase('heart_pause');
        audioManager.playSFX('bond_up');
        console.log('[Reveal] heart_pause START (tap) - 1.5s quiet beat');
      }, 1200);
      
      // CRITICAL: Must wait 1.5s in heart_pause before navigation
      setTimeout(() => {
        console.log('[Reveal] heart_pause END (tap) - navigating to naming');
        setPhase('navigate_naming');
        navigate('/naming');
      }, 2700); // 1200 + 1500 = 2700ms
    }
  };
  
  if (!pet) return null;
  
  return (
    <div className={styles.container} onClick={handleTapReveal}>
      {/* Background effects */}
      <div className={styles.bgEffects}>
        <motion.div
          className={styles.radialGlow}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: phase !== 'silhouette' && phase !== 'revealing' ? 0.6 : 0,
            scale: phase !== 'silhouette' && phase !== 'revealing' ? 1.5 : 0.5
          }}
          transition={{ duration: 0.8 }}
          style={{
            background: `radial-gradient(circle, ${RARITY_COLORS.common}40 0%, transparent 70%)`
          }}
        />
      </div>
      
      {/* Sparkles */}
      <AnimatePresence>
        {showSparkles && (
          <div className={styles.sparkles}>
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className={styles.sparkle}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  x: Math.cos((i / 12) * Math.PI * 2) * 120,
                  y: Math.sin((i / 12) * Math.PI * 2) * 120
                }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.05,
                  ease: 'easeOut'
                }}
              >
                <SparkleIcon color={RARITY_COLORS.common} />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
      
      {/* Pet display - LARGE and centered */}
      <motion.div
        className={styles.petStage}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Mystery state - silhouette */}
        <AnimatePresence mode="wait">
          {(phase === 'silhouette' || phase === 'revealing') && (
            <motion.div
              key="mystery"
              className={styles.mysteryContainer}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={phase === 'revealing' ? { 
                  scale: [1, 1.1, 1],
                  filter: ['brightness(0)', 'brightness(0.5)', 'brightness(0)']
                } : {}}
                transition={{ duration: 0.6 }}
              >
                <PetRenderer
                  petId={selectedStarterId!}
                  size={220}
                  state="silhouette"
                />
              </motion.div>
              
              <motion.p 
                className={styles.tapHint}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Tap to reveal!
              </motion.p>
            </motion.div>
          )}
          
          {/* Revealed state - full color pet */}
          {(phase === 'revealed' || phase === 'heart_pause' || phase === 'navigate_naming') && (
            <motion.div
              key="revealed"
              className={styles.revealedContainer}
              initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ 
                type: 'spring',
                stiffness: 200,
                damping: 20
              }}
            >
              <PetRenderer
                petId={selectedStarterId!}
                size={240}
                state="happy"
                showRarityGlow
                rarity="common"
              />
              
              {/* Heart - CRITICAL for heart_pause phase */}
              <AnimatePresence>
                {showHeart && (
                  <motion.div
                    className={styles.heartFloat}
                    initial={{ opacity: 0, scale: 0, y: 0 }}
                    animate={{ 
                      opacity: 1, 
                      scale: [1, 1.2, 1],
                      y: -40 
                    }}
                    transition={{ 
                      scale: { duration: 1, repeat: Infinity },
                      y: { type: 'spring', stiffness: 200 }
                    }}
                  >
                    ❤️
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Pet name text - only show after reveal, not during heart_pause focus */}
      <AnimatePresence>
        {(phase === 'revealed' || phase === 'heart_pause') && (
          <motion.div
            className={styles.revealText}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className={styles.petName}>{pet.name}</h2>
            <p className={styles.catchPhrase}>wants to be your friend!</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* NO CARD OR BUTTONS during reveal/heart_pause - navigation handles naming */}
    </div>
  );
};

const SparkleIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill={color}>
    <path d="M12 0L14 8L22 10L14 12L12 20L10 12L2 10L10 8Z" />
  </svg>
);

export default RevealScreen;
