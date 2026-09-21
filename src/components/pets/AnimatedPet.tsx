// PawBloom AnimatedPet - Real animations with Framer Motion
// Soft Anime Chibi style with transparent PNGs

import React from 'react';
import { motion } from 'framer-motion';
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
  delay?: number;
  showShadow?: boolean;
}

const getAssetBase = () => import.meta.env.BASE_URL || '/';

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

  if (!pet) {
    return <div style={{ width: size, height: size }} className={className} />;
  }

  const isSilhouette = state === 'silhouette';
  const assetBase = getAssetBase();
  
  const imagePath = isSilhouette
    ? `${assetBase}pets/silhouette/${petId}.png`
    : `${assetBase}pets/idle/${petId}.png`;

  // Get animation based on state - MORE VISIBLE animations
  const getAnimation = () => {
    switch (state) {
      case 'walk':
        return {
          y: [0, -14, 0, -10, 0],
          rotate: [-6, 6, -5, 5, 0],
          scaleX: [1, 0.95, 1, 0.96, 1],
        };
      case 'happy':
        return {
          y: [0, -35, -12, -25, 0],
          rotate: [0, -12, 12, -6, 0],
          scale: [1, 1.15, 1.08, 1.12, 1],
        };
      case 'surprised':
        return {
          scale: [1, 1.22, 1.1, 1.15, 1],
          x: [0, -8, 8, -5, 5, 0],
        };
      case 'sleepy':
        return {
          y: [0, 8, 5, 8, 0],
          rotate: [0, 8, 12, 8, 0],
          opacity: [1, 0.85, 0.78, 0.85, 1],
          scaleY: [1, 0.96, 0.93, 0.96, 1],
        };
      case 'silhouette':
        return {
          scale: [1, 1.05, 1],
        };
      case 'idle':
      default:
        // More visible idle - breathing + bob + gentle sway
        return {
          y: [0, -12, 0, -8, 0],
          scaleY: [1, 1.05, 1, 1.03, 1],
          rotate: [-3, 3, -2, 2, 0],
        };
    }
  };

  const getTransition = () => {
    const baseDelay = delay;
    switch (state) {
      case 'walk':
        return { duration: 0.45, repeat: Infinity, ease: 'easeInOut', delay: baseDelay };
      case 'happy':
        return { duration: 0.55, ease: 'easeOut', delay: baseDelay };
      case 'surprised':
        return { duration: 0.35, ease: 'easeOut', delay: baseDelay };
      case 'sleepy':
        return { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: baseDelay };
      case 'silhouette':
        return { duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: baseDelay };
      case 'idle':
      default:
        return { duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: baseDelay };
    }
  };

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
            bottom: 4,
            left: '50%',
            width: size * 0.55,
            height: size * 0.1,
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.25) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translateX(-50%)',
            zIndex: 0,
          }}
          animate={{
            scaleX: state === 'walk' ? [1, 0.85, 1] : [1, 1.08, 1],
            opacity: state === 'walk' ? [0.25, 0.15, 0.25] : [0.25, 0.2, 0.25],
          }}
          transition={{
            duration: state === 'walk' ? 0.45 : 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: delay,
          }}
        />
      )}

      {/* Animated pet image */}
      <motion.img
        src={imagePath}
        alt={pet.name}
        animate={getAnimation()}
        transition={getTransition()}
        whileHover={onClick ? { scale: 1.1 } : undefined}
        whileTap={onClick ? { scale: 0.92 } : undefined}
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
