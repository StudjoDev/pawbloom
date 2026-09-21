// PawBloom PetSprite - P0-4 Pet Lovability
// Idle: base breathe + random fidget (yawn/scratch/look around) ≥3 kinds every 8-15s
// Walk: real walk cycle (leg frames, not just translate)
// Ground shadow, paw contact, no floating

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { getPetById, type Rarity, RARITY_COLORS } from '@/data/pets';

export type PetPose = 'idle' | 'walk' | 'happy' | 'surprised' | 'sleepy' | 'silhouette';
type FidgetType = 'yawn' | 'scratch' | 'look_left' | 'look_right' | 'ear_twitch' | 'tail_wag';

interface PetSpriteProps {
  petId: string;
  size?: number;
  pose?: PetPose;
  showRarityGlow?: boolean;
  rarity?: Rarity;
  className?: string;
  onClick?: () => void;
  onPoseComplete?: () => void;
}

const WALK_FPS = 9;
const WALK_FRAMES = 4;
const ONE_SHOT_DURATION = 1000;
const FIDGET_INTERVAL_MIN = 8000;
const FIDGET_INTERVAL_MAX = 15000;

const getAssetBase = () => import.meta.env.BASE_URL || '/';

const FIDGET_TYPES: FidgetType[] = ['yawn', 'scratch', 'look_left', 'look_right', 'ear_twitch', 'tail_wag'];

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
  const [fidget, setFidget] = useState<FidgetType | null>(null);
  
  const walkIntervalRef = useRef<number | null>(null);
  const poseTimeoutRef = useRef<number | null>(null);
  const fidgetTimeoutRef = useRef<number | null>(null);
  
  const breatheControls = useAnimation();
  const fidgetControls = useAnimation();

  // Handle pose changes
  useEffect(() => {
    if (poseTimeoutRef.current) {
      clearTimeout(poseTimeoutRef.current);
      poseTimeoutRef.current = null;
    }

    setCurrentPose(pose);
    setFidget(null);

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

  // Walk frame animation - real walk cycle
  useEffect(() => {
    if (currentPose === 'walk') {
      const frameInterval = 1000 / WALK_FPS;
      walkIntervalRef.current = window.setInterval(() => {
        setWalkFrame(prev => (prev % WALK_FRAMES) + 1);
      }, frameInterval);
    } else {
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

  // P0-4: Idle breathing animation
  useEffect(() => {
    if (currentPose === 'idle' && !fidget) {
      breatheControls.start({
        y: [0, -4, 0, -2, 0],
        scaleY: [1, 1.02, 1, 1.01, 1],
        scaleX: [1, 0.99, 1, 0.995, 1],
        transition: {
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      });
    } else {
      breatheControls.stop();
    }
  }, [currentPose, fidget, breatheControls]);

  // P0-4: Random fidget every 8-15 seconds
  const scheduleFidget = useCallback(() => {
    if (currentPose !== 'idle') return;
    
    const delay = Math.random() * (FIDGET_INTERVAL_MAX - FIDGET_INTERVAL_MIN) + FIDGET_INTERVAL_MIN;
    
    fidgetTimeoutRef.current = window.setTimeout(() => {
      if (currentPose !== 'idle') return;
      
      // Pick random fidget
      const fidgetType = FIDGET_TYPES[Math.floor(Math.random() * FIDGET_TYPES.length)];
      setFidget(fidgetType);
      
      // Play fidget animation
      playFidgetAnimation(fidgetType);
      
      // Clear fidget after animation
      setTimeout(() => {
        setFidget(null);
        scheduleFidget();
      }, 1500);
    }, delay);
  }, [currentPose]);

  useEffect(() => {
    if (currentPose === 'idle') {
      scheduleFidget();
    }
    
    return () => {
      if (fidgetTimeoutRef.current) {
        clearTimeout(fidgetTimeoutRef.current);
      }
    };
  }, [currentPose, scheduleFidget]);

  const playFidgetAnimation = async (type: FidgetType) => {
    switch (type) {
      case 'yawn':
        await fidgetControls.start({
          scaleY: [1, 1.1, 1.15, 1],
          y: [0, -5, -8, 0],
          transition: { duration: 1.2, ease: 'easeInOut' },
        });
        break;
      case 'scratch':
        await fidgetControls.start({
          rotate: [0, -8, 8, -6, 6, 0],
          x: [0, 3, -3, 2, -2, 0],
          transition: { duration: 1, ease: 'easeInOut' },
        });
        break;
      case 'look_left':
        await fidgetControls.start({
          rotate: [0, -10, -10, 0],
          x: [0, -5, -5, 0],
          transition: { duration: 1.2, times: [0, 0.2, 0.8, 1] },
        });
        break;
      case 'look_right':
        await fidgetControls.start({
          rotate: [0, 10, 10, 0],
          x: [0, 5, 5, 0],
          transition: { duration: 1.2, times: [0, 0.2, 0.8, 1] },
        });
        break;
      case 'ear_twitch':
        await fidgetControls.start({
          scaleX: [1, 1.03, 0.97, 1.02, 1],
          transition: { duration: 0.5 },
        });
        break;
      case 'tail_wag':
        await fidgetControls.start({
          rotate: [0, -5, 5, -4, 4, -2, 2, 0],
          transition: { duration: 0.8, ease: 'easeInOut' },
        });
        break;
    }
  };

  if (!pet) {
    return <div style={{ width: size, height: size }} className={className} />;
  }

  const assetBase = getAssetBase();
  
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

  // Pose-specific animation (for non-idle poses)
  const getPoseAnimation = () => {
    if (currentPose === 'happy') {
      return {
        y: [0, -15, 0],
        rotate: [-5, 5, -5],
        scale: [1, 1.08, 1],
      };
    }
    if (currentPose === 'surprised') {
      return {
        scale: [1, 1.12, 1.08],
        x: [0, -3, 3, 0],
      };
    }
    if (currentPose === 'sleepy') {
      return {
        y: [0, 3, 0],
        rotate: [0, 5, 0],
        opacity: [1, 0.9, 1],
      };
    }
    return {};
  };

  const getPoseTransition = () => {
    if (currentPose === 'happy') {
      return { duration: 0.4, repeat: 2, ease: 'easeOut' };
    }
    if (currentPose === 'surprised') {
      return { duration: 0.3, ease: 'easeOut' };
    }
    if (currentPose === 'sleepy') {
      return { duration: 2.5, repeat: Infinity, ease: 'easeInOut' };
    }
    return { duration: 0.5 };
  };

  const isIdleBreathing = currentPose === 'idle' && !fidget;
  const isFidgeting = currentPose === 'idle' && fidget;

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
            inset: -15,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${RARITY_COLORS[rarity]}50 0%, ${RARITY_COLORS[rarity]}15 50%, transparent 70%)`,
            filter: 'blur(12px)',
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Ground shadow - P0-4: paw contact, no floating */}
      {currentPose !== 'silhouette' && (
        <motion.div
          style={{
            position: 'absolute',
            bottom: 4,
            left: '50%',
            width: size * 0.45,
            height: size * 0.06,
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.25) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translateX(-50%)',
            zIndex: 0,
          }}
          animate={{
            scaleX: currentPose === 'walk' 
              ? [1, 0.85, 1] 
              : isIdleBreathing
              ? [1, 1.08, 1, 1.04, 1]
              : [1, 1.05, 1],
            opacity: currentPose === 'walk' 
              ? [0.25, 0.18, 0.25] 
              : [0.25, 0.2, 0.25],
          }}
          transition={{
            duration: currentPose === 'walk' ? 0.25 : 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Pet sprite */}
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          zIndex: 1,
        }}
        animate={
          isIdleBreathing 
            ? breatheControls 
            : isFidgeting 
            ? fidgetControls 
            : currentPose !== 'walk' && currentPose !== 'silhouette'
            ? getPoseAnimation()
            : {}
        }
        transition={
          !isIdleBreathing && !isFidgeting && currentPose !== 'walk' && currentPose !== 'silhouette'
            ? getPoseTransition()
            : undefined
        }
      >
        <motion.img
          key={`${petId}-${currentPose}-${currentPose === 'walk' ? walkFrame : 0}`}
          src={getImagePath()}
          alt={pet.name}
          whileHover={onClick ? { scale: 1.05 } : undefined}
          whileTap={onClick ? { scale: 0.95 } : undefined}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            background: 'transparent',
          }}
          draggable={false}
        />
      </motion.div>
    </div>
  );
};

export default PetSprite;
