// PawBloom Pet Renderer - PNG Art System
// Uses Style A Soft Anime Chibi art assets

import React from 'react';
import { motion } from 'framer-motion';
import { getPetById, type Rarity } from '@/data/pets';
import { RARITY_COLORS } from '@/data/pets';

interface PetRendererProps {
  petId: string;
  size?: number;
  state?: 'idle' | 'walk' | 'happy' | 'surprised' | 'sleepy' | 'silhouette';
  showRarityGlow?: boolean;
  rarity?: Rarity;
  className?: string;
  onClick?: () => void;
}

// Get the base URL for assets (handles /pawbloom/ on GitHub Pages)
const getAssetBase = () => import.meta.env.BASE_URL || '/';

export const PetRenderer: React.FC<PetRendererProps> = ({
  petId,
  size = 128,
  state = 'idle',
  showRarityGlow = false,
  rarity = 'common',
  className = '',
  onClick
}) => {
  const pet = getPetById(petId);
  
  if (!pet) {
    return <div style={{ width: size, height: size }} className={className} />;
  }
  
  const isSilhouette = state === 'silhouette';
  const assetBase = getAssetBase();
  
  // Build image path
  const imagePath = isSilhouette 
    ? `${assetBase}pets/silhouette/${petId}.png`
    : `${assetBase}pets/idle/${petId}.png`;
  
  // Animation variants for different states
  const getAnimationProps = () => {
    switch (state) {
      case 'walk':
        return {
          animate: { y: [0, -4, 0] },
          transition: { duration: 0.4, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'happy':
        return {
          animate: { rotate: [-3, 3, -3], scale: [1, 1.05, 1] },
          transition: { duration: 0.3, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'surprised':
        return {
          animate: { y: [0, -10, 0], scale: [1, 1.15, 1] },
          transition: { duration: 0.4, ease: 'easeOut' }
        };
      case 'sleepy':
        return {
          animate: { y: [0, 3, 0], rotate: [-2, 2, -2] },
          transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
        };
      default: // idle
        return {
          animate: { y: [0, -3, 0] },
          transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
        };
    }
  };

  const animProps = getAnimationProps();

  return (
    <motion.div
      className={className}
      onClick={onClick}
      style={{ 
        width: size, 
        height: size, 
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
    >
      {/* Rarity glow effect */}
      {showRarityGlow && !isSilhouette && (
        <motion.div
          style={{
            position: 'absolute',
            inset: -12,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${RARITY_COLORS[rarity]}50 0%, ${RARITY_COLORS[rarity]}20 40%, transparent 70%)`,
            filter: 'blur(8px)'
          }}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.6, 0.9, 0.6]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      
      {/* Pet image with animation */}
      <motion.img
        src={imagePath}
        alt={pet.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          position: 'relative',
          zIndex: 1,
          imageRendering: 'auto',
          // Silhouette uses CSS filter for dark overlay
          filter: isSilhouette ? 'brightness(0) saturate(100%)' : 'none'
        }}
        draggable={false}
        {...animProps}
      />
    </motion.div>
  );
};

export default PetRenderer;
