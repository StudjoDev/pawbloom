// PawBloom PetSprite - P0-4 Pet Lovability
// Idle: base breathe + random fidget with DISTINCT phase offsets per pet
// Walk: real walk cycle with ground contact (hop tied to frame, not float)
// Ground shadow stays planted

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  showShadow?: boolean;
  // P0-4: Phase offset for desynced idle animation (0-1)
  phaseOffset?: number;
  // Instance ID for deterministic randomness
  instanceId?: string;
}

const WALK_FPS = 8;
const WALK_FRAMES = 4;
const ONE_SHOT_DURATION = 1000;
const FIDGET_INTERVAL_MIN = 8000;
const FIDGET_INTERVAL_MAX = 15000;

const getAssetBase = () => import.meta.env.BASE_URL || '/';

const FIDGET_TYPES: FidgetType[] = ['yawn', 'scratch', 'look_left', 'look_right', 'ear_twitch', 'tail_wag'];

// Generate deterministic random from string seed
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return (Math.abs(hash) % 1000) / 1000;
}

// P0-4: Walk frame hop heights - small hop tied to frame, not continuous float
const WALK_FRAME_HOP: Record<number, number> = {
  1: 0,      // Contact frame - on ground
  2: -3,     // Push off - slight lift
  3: -5,     // Peak - highest point
  4: -2,     // Landing - coming down
};

// P0-4: Walk frame squash/stretch
const WALK_FRAME_SQUASH: Record<number, { scaleX: number; scaleY: number }> = {
  1: { scaleX: 1.02, scaleY: 0.98 },  // Contact - squash
  2: { scaleX: 0.98, scaleY: 1.02 },  // Push - stretch
  3: { scaleX: 1.0, scaleY: 1.0 },    // Air - normal
  4: { scaleX: 1.01, scaleY: 0.99 },  // Landing - slight squash
};

export const PetSprite: React.FC<PetSpriteProps> = ({
  petId,
  size = 128,
  pose = 'idle',
  showRarityGlow = false,
  rarity = 'common',
  className = '',
  onClick,
  onPoseComplete,
  showShadow = true,
  phaseOffset,
  instanceId,
}) => {
  const pet = getPetById(petId);
  const [walkFrame, setWalkFrame] = useState(1);
  const [currentPose, setCurrentPose] = useState<PetPose>(pose);
  const [fidget, setFidget] = useState<FidgetType | null>(null);
  
  const walkIntervalRef = useRef<number | null>(null);
  const poseTimeoutRef = useRef<number | null>(null);
  const fidgetTimeoutRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  
  const breatheControls = useAnimation();
  const fidgetControls = useAnimation();

  // P0-4: Generate unique idle parameters per pet instance
  const idleParams = useMemo(() => {
    const seed = instanceId || petId;
    const rand1 = seededRandom(seed + '_period');
    const rand2 = seededRandom(seed + '_amplitude');
    const rand3 = seededRandom(seed + '_phase');
    
    return {
      // Period varies from 2.0s to 3.5s
      period: 2.0 + rand1 * 1.5,
      // Amplitude varies from 0.7x to 1.3x
      amplitudeMultiplier: 0.7 + rand2 * 0.6,
      // Phase offset from 0 to full period (use prop if provided)
      phaseDelay: phaseOffset !== undefined ? phaseOffset : rand3,
    };
  }, [petId, instanceId, phaseOffset]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

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
        if (mountedRef.current) {
          setCurrentPose('idle');
          onPoseComplete?.();
        }
      }, ONE_SHOT_DURATION);
    }

    return () => {
      if (poseTimeoutRef.current) {
        clearTimeout(poseTimeoutRef.current);
      }
    };
  }, [pose, onPoseComplete]);

  // Walk frame animation - real walk cycle with frame swaps
  useEffect(() => {
    if (currentPose === 'walk') {
      const frameInterval = 1000 / WALK_FPS;
      walkIntervalRef.current = window.setInterval(() => {
        if (mountedRef.current) {
          setWalkFrame(prev => (prev % WALK_FRAMES) + 1);
        }
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

  // P0-4: Idle breathing animation with DISTINCT phase offsets
  useEffect(() => {
    if (currentPose === 'idle' && !fidget) {
      const { period, amplitudeMultiplier, phaseDelay } = idleParams;
      const baseY = 4 * amplitudeMultiplier;
      const halfY = 2 * amplitudeMultiplier;
      
      // Start animation after phase delay
      const delayMs = phaseDelay * period * 1000;
      
      const startAnimation = () => {
        if (!mountedRef.current || currentPose !== 'idle') return;
        
        breatheControls.start({
          y: [0, -baseY, 0, -halfY, 0],
          scaleY: [1, 1 + 0.02 * amplitudeMultiplier, 1, 1 + 0.01 * amplitudeMultiplier, 1],
          scaleX: [1, 1 - 0.01 * amplitudeMultiplier, 1, 1 - 0.005 * amplitudeMultiplier, 1],
          transition: {
            duration: period,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        });
      };
      
      const timer = setTimeout(startAnimation, delayMs);
      return () => {
        clearTimeout(timer);
        breatheControls.stop();
      };
    } else {
      breatheControls.stop();
    }
  }, [currentPose, fidget, breatheControls, idleParams]);

  // P0-4: Random fidget every 8-15 seconds (with random initial delay per pet)
  const scheduleFidget = useCallback(() => {
    if (currentPose !== 'idle' || !mountedRef.current) return;
    
    const delay = Math.random() * (FIDGET_INTERVAL_MAX - FIDGET_INTERVAL_MIN) + FIDGET_INTERVAL_MIN;
    
    fidgetTimeoutRef.current = window.setTimeout(() => {
      if (currentPose !== 'idle' || !mountedRef.current) return;
      
      const fidgetType = FIDGET_TYPES[Math.floor(Math.random() * FIDGET_TYPES.length)];
      setFidget(fidgetType);
      
      playFidgetAnimation(fidgetType);
      
      setTimeout(() => {
        if (mountedRef.current) {
          setFidget(null);
          scheduleFidget();
        }
      }, 1500);
    }, delay);
  }, [currentPose]);

  useEffect(() => {
    if (currentPose === 'idle') {
      // Initial random delay so pets don't fidget at the same time
      const initialDelay = Math.random() * 5000;
      const timer = setTimeout(scheduleFidget, initialDelay);
      return () => {
        clearTimeout(timer);
        if (fidgetTimeoutRef.current) {
          clearTimeout(fidgetTimeoutRef.current);
        }
      };
    }
    return () => {
      if (fidgetTimeoutRef.current) {
        clearTimeout(fidgetTimeoutRef.current);
      }
    };
  }, [currentPose, scheduleFidget]);

  const playFidgetAnimation = async (type: FidgetType) => {
    if (!mountedRef.current) return;
    
    const { amplitudeMultiplier } = idleParams;
    
    switch (type) {
      case 'yawn':
        await fidgetControls.start({
          scaleY: [1, 1.1 * amplitudeMultiplier, 1.15 * amplitudeMultiplier, 1],
          y: [0, -5 * amplitudeMultiplier, -8 * amplitudeMultiplier, 0],
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
  const isWalking = currentPose === 'walk';

  // P0-4: Walk animation - small hop tied to frame
  const walkHop = isWalking ? WALK_FRAME_HOP[walkFrame] : 0;
  const walkSquash = isWalking ? WALK_FRAME_SQUASH[walkFrame] : { scaleX: 1, scaleY: 1 };

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
        alignItems: 'flex-end',
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

      {/* Ground shadow - P0-4: stays PLANTED, doesn't move with pet */}
      {showShadow && currentPose !== 'silhouette' && (
        <div
          style={{
            position: 'absolute',
            bottom: 2,
            left: '50%',
            width: size * 0.5,
            height: size * 0.08,
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: `translateX(-50%) scaleX(${isWalking ? (walkFrame === 1 || walkFrame === 4 ? 1 : 0.85) : 1})`,
            opacity: isWalking ? (walkFrame === 3 ? 0.2 : 0.3) : 0.3,
            zIndex: 0,
            transition: 'transform 0.08s ease, opacity 0.08s ease',
          }}
        />
      )}

      {/* Pet sprite container */}
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          zIndex: 1,
          // P0-4: Walk hop is applied directly, not as continuous animation
          transform: isWalking 
            ? `translateY(${walkHop}px) scaleX(${walkSquash.scaleX}) scaleY(${walkSquash.scaleY})`
            : undefined,
          transition: isWalking ? 'transform 0.08s ease' : undefined,
        }}
        animate={
          isIdleBreathing 
            ? breatheControls 
            : isFidgeting 
            ? fidgetControls 
            : !isWalking && currentPose !== 'silhouette'
            ? getPoseAnimation()
            : undefined
        }
        transition={
          !isIdleBreathing && !isFidgeting && !isWalking && currentPose !== 'silhouette'
            ? getPoseTransition()
            : undefined
        }
      >
        <img
          key={`${petId}-${currentPose}-${isWalking ? walkFrame : 0}`}
          src={getImagePath()}
          alt={pet.name}
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
