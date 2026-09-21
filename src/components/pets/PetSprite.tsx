// PawBloom PetSprite - True frame-based sprite animation
// Uses actual PNG frame swapping for walk cycle, not just CSS transforms

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getPetById, type Rarity, RARITY_COLORS } from '@/data/pets';

export type PetPose = 'idle' | 'walk' | 'happy' | 'surprised' | 'sleepy' | 'silhouette';

interface PetSpriteProps {
  petId: string;
  size?: number;
  pose?: PetPose;
  showRarityGlow?: boolean;
  rarity?: Rarity;
  className?: string;
  onClick?: () => void;
  onPoseComplete?: () => void; // Called when one-shot pose (happy/surprised) finishes
}

const WALK_FPS = 9; // ~9 fps for walk cycle
const WALK_FRAMES = 4;
const ONE_SHOT_DURATION = 1200; // ms for happy/surprised/sleepy before returning to idle

const getAssetBase = () => import.meta.env.BASE_URL || '/';

export const PetSprite: React.FC<PetSpriteProps> = ({
  petId,
  size = 128,
  pose = 'idle',
  showRarityGlow = false,
  rarity = 'common',
  className = '',
  onClick,
  onPoseComplete,
}) => {
  const pet = getPetById(petId);
  const [walkFrame, setWalkFrame] = useState(1);
  const [currentPose, setCurrentPose] = useState<PetPose>(pose);
  const walkIntervalRef = useRef<number | null>(null);
  const poseTimeoutRef = useRef<number | null>(null);

  // Handle pose changes
  useEffect(() => {
    // Clear any existing timeouts
    if (poseTimeoutRef.current) {
      clearTimeout(poseTimeoutRef.current);
      poseTimeoutRef.current = null;
    }

    setCurrentPose(pose);

    // One-shot poses return to idle after duration
    if (pose === 'happy' || pose === 'surprised' || pose === 'sleepy') {
      poseTimeoutRef.current = window.setTimeout(() => {
        setCurrentPose('idle');
        onPoseComplete?.();
      }, ONE_SHOT_DURATION);
    }

    return () => {
      if (poseTimeoutRef.current) {
        clearTimeout(poseTimeoutRef.current);
      }
    };
  }, [pose, onPoseComplete]);

  // Walk frame animation
  useEffect(() => {
    if (currentPose === 'walk') {
      // Start walk cycle
      const frameInterval = 1000 / WALK_FPS;
      walkIntervalRef.current = window.setInterval(() => {
        setWalkFrame(prev => (prev % WALK_FRAMES) + 1);
      }, frameInterval);
    } else {
      // Stop walk cycle
      if (walkIntervalRef.current) {
        clearInterval(walkIntervalRef.current);
        walkIntervalRef.current = null;
      }
      setWalkFrame(1);
    }

    return () => {
      if (walkIntervalRef.current) {
        clearInterval(walkIntervalRef.current);
      }
    };
  }, [currentPose]);

  if (!pet) {
    return <div style={{ width: size, height: size }} className={className} />;
  }

  const assetBase = getAssetBase();
  
  // Build image path based on pose
  const getImagePath = (): string => {
    switch (currentPose) {
      case 'walk':
        return `${assetBase}pets/walk/${petId}-${walkFrame}.png`;
      case 'happy':
        return `${assetBase}pets/happy/${petId}.png`;
      case 'surprised':
        return `${assetBase}pets/surprised/${petId}.png`;
      case 'sleepy':
        return `${assetBase}pets/sleepy/${petId}.png`;
      case 'silhouette':
        return `${assetBase}pets/silhouette/${petId}.png`;
      case 'idle':
      default:
        return `${assetBase}pets/idle/${petId}.png`;
    }
  };

  // OBVIOUS idle animation - must be visible in 2-3 second recording
  const getIdleAnimation = () => {
    if (currentPose === 'idle') {
      // Large, obvious breathing motion: bob up/down + squash/stretch + sway
      return {
        y: [0, -12, 0, -8, 0],           // Strong vertical bob (±12px)
        scaleY: [1, 1.06, 1, 1.04, 1],   // Noticeable breathing (6% stretch)
        scaleX: [1, 0.97, 1, 0.98, 1],   // Squash effect
        rotate: [-2, 2, -1.5, 1.5, 0],   // Gentle sway (±2°)
      };
    }
    if (currentPose === 'happy') {
      return {
        y: [0, -25, 0],
        rotate: [-8, 8, -8],
        scale: [1, 1.12, 1],
      };
    }
    if (currentPose === 'surprised') {
      return {
        scale: [1, 1.18, 1.12],
        x: [0, -5, 5, 0],
      };
    }
    if (currentPose === 'sleepy') {
      return {
        y: [0, 5, 0],
        rotate: [0, 8, 0],
        opacity: [1, 0.85, 1],
      };
    }
    return {};
  };

  const getTransition = () => {
    if (currentPose === 'idle') {
      // Faster cycle so animation is obvious within 2-3 seconds
      return { duration: 1.8, repeat: Infinity, ease: 'easeInOut' };
    }
    if (currentPose === 'happy') {
      return { duration: 0.5, repeat: 2, ease: 'easeOut' };
    }
    if (currentPose === 'surprised') {
      return { duration: 0.35, ease: 'easeOut' };
    }
    if (currentPose === 'sleepy') {
      return { duration: 3, repeat: Infinity, ease: 'easeInOut' };
    }
    return { duration: 0.5 };
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
      {/* Rarity glow */}
      {showRarityGlow && currentPose !== 'silhouette' && (
        <motion.div
          style={{
            position: 'absolute',
            inset: -20,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${RARITY_COLORS[rarity]}60 0%, ${RARITY_COLORS[rarity]}20 50%, transparent 70%)`,
            filter: 'blur(15px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Ground shadow - synced with pet breathing animation */}
      {currentPose !== 'silhouette' && (
        <motion.div
          style={{
            position: 'absolute',
            bottom: 2,
            left: '50%',
            width: size * 0.5,
            height: size * 0.08,
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translateX(-50%)',
            zIndex: 0,
          }}
          animate={{
            scaleX: currentPose === 'walk' 
              ? [1, 0.8, 1] 
              : currentPose === 'idle'
              ? [1, 1.15, 1, 1.1, 1]  // Synced with idle breathing
              : [1, 1.1, 1],
            opacity: currentPose === 'walk' 
              ? [0.3, 0.2, 0.3] 
              : currentPose === 'idle'
              ? [0.3, 0.2, 0.3, 0.22, 0.3]  // Pulsing shadow
              : [0.3, 0.25, 0.3],
          }}
          transition={{
            duration: currentPose === 'walk' ? 0.25 : currentPose === 'idle' ? 1.8 : 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Pet sprite with frame animation */}
      <motion.img
        key={`${petId}-${currentPose}-${currentPose === 'walk' ? walkFrame : 0}`}
        src={getImagePath()}
        alt={pet.name}
        animate={currentPose !== 'walk' ? getIdleAnimation() : undefined}
        transition={currentPose !== 'walk' ? getTransition() : undefined}
        whileHover={onClick ? { scale: 1.08 } : undefined}
        whileTap={onClick ? { scale: 0.95 } : undefined}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          position: 'relative',
          zIndex: 1,
          background: 'transparent',
        }}
        draggable={false}
      />
    </div>
  );
};

export default PetSprite;
