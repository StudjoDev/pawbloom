// PawBloom AnimatedPet - Real animations with Framer Motion
// Soft Anime Chibi style with transparent PNGs

import React, { useEffect, useState } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { getPetById, type Rarity, RARITY_COLORS } from '@/data/pets';

export type PetAnimState = 'idle' | 'walk' | 'happy' | 'surprised' | 'sleepy' | 'silhouette';

interface AnimatedPetProps {
  petId: string;
  size?: number;
  state?: PetAnimState;
  showRarityGlow?: boolean;
  rarity?: Rarity;
  className?: string;
  onClick?: () => void;
  delay?: number; // Stagger delay for multiple pets
  showShadow?: boolean;
}

const getAssetBase = () => import.meta.env.BASE_URL || '/';

// Animation variants
const idleVariants: Variants = {
  animate: {
    y: [0, -4, 0, -2, 0],
    scaleY: [1, 1.02, 1, 1.01, 1],
    rotate: [-1, 1, -0.5, 0.5, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const walkVariants: Variants = {
  animate: {
    y: [0, -8, 0, -6, 0],
    rotate: [-4, 4, -3, 3, 0],
    scaleX: [1, 0.98, 1, 0.99, 1],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const happyVariants: Variants = {
  animate: {
    y: [0, -24, -8, -16, 0],
    rotate: [0, -8, 8, -4, 0],
    scale: [1, 1.1, 1.05, 1.08, 1],
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const surprisedVariants: Variants = {
  animate: {
    scale: [1, 1.15, 1.1, 1.12, 1],
    x: [0, -4, 4, -2, 2, 0],
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

const sleepyVariants: Variants = {
  animate: {
    y: [0, 4, 2, 4, 0],
    rotate: [0, 5, 8, 5, 0],
    opacity: [1, 0.9, 0.85, 0.9, 1],
    scaleY: [1, 0.98, 0.97, 0.98, 1],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const getVariants = (state: PetAnimState): Variants => {
  switch (state) {
    case 'walk':
      return walkVariants;
    case 'happy':
      return happyVariants;
    case 'surprised':
      return surprisedVariants;
    case 'sleepy':
      return sleepyVariants;
    case 'silhouette':
    case 'idle':
    default:
      return idleVariants;
  }
};

export const AnimatedPet: React.FC<AnimatedPetProps> = ({
  petId,
  size = 128,
  state = 'idle',
  showRarityGlow = false,
  rarity = 'common',
  className = '',
  onClick,
  delay = 0,
  showShadow = true,
}) => {
  const pet = getPetById(petId);
  const controls = useAnimation();
  const [currentState, setCurrentState] = useState(state);

  useEffect(() => {
    setCurrentState(state);
    
    const startAnimation = async () => {
      await new Promise(resolve => setTimeout(resolve, delay * 1000));
      controls.start('animate');
    };
    
    startAnimation();
  }, [state, delay, controls]);

  // Trigger one-shot animations
  useEffect(() => {
    if (state === 'happy' || state === 'surprised') {
      controls.start('animate').then(() => {
        // Return to idle after one-shot animation
        setTimeout(() => {
          setCurrentState('idle');
          controls.start('animate');
        }, state === 'happy' ? 600 : 400);
      });
    }
  }, [state, controls]);

  if (!pet) {
    return <div style={{ width: size, height: size }} className={className} />;
  }

  const isSilhouette = currentState === 'silhouette';
  const assetBase = getAssetBase();
  
  const imagePath = isSilhouette
    ? `${assetBase}pets/silhouette/${petId}.png`
    : `${assetBase}pets/idle/${petId}.png`;

  const variants = getVariants(currentState);

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        width: size,
        height: size,
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Rarity glow effect */}
      {showRarityGlow && !isSilhouette && (
        <motion.div
          style={{
            position: 'absolute',
            inset: -16,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${RARITY_COLORS[rarity]}60 0%, ${RARITY_COLORS[rarity]}20 50%, transparent 70%)`,
            filter: 'blur(12px)',
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Ground shadow */}
      {showShadow && !isSilhouette && (
        <motion.div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            width: size * 0.6,
            height: size * 0.12,
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.2) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translateX(-50%)',
            zIndex: 0,
          }}
          animate={{
            scaleX: currentState === 'walk' ? [1, 0.9, 1] : [1, 1.05, 1],
            opacity: currentState === 'walk' ? [0.2, 0.15, 0.2] : [0.2, 0.18, 0.2],
          }}
          transition={{
            duration: currentState === 'walk' ? 0.5 : 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Animated pet image */}
      <motion.img
        src={imagePath}
        alt={pet.name}
        variants={variants}
        animate={controls}
        initial={{ y: 0, rotate: 0, scale: 1 }}
        whileHover={onClick ? { scale: 1.08 } : undefined}
        whileTap={onClick ? { scale: 0.95 } : undefined}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          position: 'relative',
          zIndex: 1,
          filter: isSilhouette ? 'brightness(0)' : 'none',
          background: 'transparent',
        }}
        draggable={false}
      />
    </div>
  );
};

export default AnimatedPet;
