// PawBloom Reveal Screen - First pet encounter reveal animation

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getPetById, RARITY_COLORS } from '@/data/pets';
import { PetRenderer } from '@/components/pets/PetRenderer';
import Button from '@/components/ui/Button';
import styles from './RevealScreen.module.css';

type RevealPhase = 'silhouette' | 'revealing' | 'revealed' | 'card';

const RevealScreen: React.FC = () => {
  const navigate = useNavigate();
  const { selectedStarterId } = useGameStore();
  const [phase, setPhase] = useState<RevealPhase>('silhouette');
  const [showSparkles, setShowSparkles] = useState(false);
  
  const pet = selectedStarterId ? getPetById(selectedStarterId) : null;
  
  useEffect(() => {
    if (!selectedStarterId) {
      navigate('/starter', { replace: true });
      return;
    }
    
    // Auto-progress through phases
    const timers: NodeJS.Timeout[] = [];
    
    timers.push(setTimeout(() => {
      setPhase('revealing');
    }, 1500));
    
    timers.push(setTimeout(() => {
      setPhase('revealed');
      setShowSparkles(true);
    }, 2500));
    
    timers.push(setTimeout(() => {
      setPhase('card');
    }, 4000));
    
    return () => timers.forEach(clearTimeout);
  }, [selectedStarterId, navigate]);
  
  const handleTapReveal = () => {
    if (phase === 'silhouette') {
      setPhase('revealing');
      setTimeout(() => {
        setPhase('revealed');
        setShowSparkles(true);
      }, 800);
      setTimeout(() => setPhase('card'), 2000);
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
            opacity: phase === 'revealed' || phase === 'card' ? 0.6 : 0,
            scale: phase === 'revealed' || phase === 'card' ? 1.5 : 0.5
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
      
      {/* Pet display */}
      <motion.div
        className={styles.petStage}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Mystery state */}
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
                transition={{ duration: 0.8 }}
              >
                <PetRenderer
                  petId={selectedStarterId!}
                  size={200}
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
          
          {/* Revealed state */}
          {(phase === 'revealed' || phase === 'card') && (
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
                size={220}
                state="happy"
                showRarityGlow
                rarity="common"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Reveal text */}
      <AnimatePresence>
        {phase === 'revealed' && (
          <motion.div
            className={styles.revealText}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className={styles.petName}>{pet.name}</h2>
            <p className={styles.catchPhrase}>"{pet.catchPhrases[0]}"</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Collection card */}
      <AnimatePresence>
        {phase === 'card' && (
          <motion.div
            className={styles.cardContainer}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              type: 'spring',
              stiffness: 300,
              damping: 25
            }}
          >
            <div className={styles.collectionCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardBadge}>NEW FRIEND!</span>
              </div>
              
              <div className={styles.cardBody}>
                <h2 className={styles.cardName}>{pet.name}</h2>
                <p className={styles.cardDesc}>{pet.description}</p>
                
                <div className={styles.cardStats}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Species</span>
                    <span className={styles.statValue}>
                      {pet.species === 'dog' ? '🐕 Dog' : '🐱 Cat'}
                    </span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Rarity</span>
                    <span className={styles.statValue} style={{ color: RARITY_COLORS.common }}>
                      ★ Common
                    </span>
                  </div>
                </div>
                
                <p className={styles.funFact}>
                  <strong>Fun Fact:</strong> {pet.funFact}
                </p>
              </div>
              
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/naming');
                }}
              >
                Give a Nickname!
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SparkleIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill={color}>
    <path d="M12 0L14 8L22 10L14 12L12 20L10 12L2 10L10 8Z" />
  </svg>
);

export default RevealScreen;
