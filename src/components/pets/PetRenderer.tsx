// PawBloom PetRenderer - Wrapper for PetSprite with frame animation
// Maps old state names to new pose system
// P0-4: Passes phaseOffset and instanceId for desynced idle animations

import React from 'react';
import PetSprite, { type PetPose } from './PetSprite';
import type { Rarity } from '@/data/pets';

interface PetRendererProps {
  petId: string;
  size?: number;
  state?: 'idle' | 'walk' | 'happy' | 'surprised' | 'sleepy' | 'silhouette';
  showRarityGlow?: boolean;
  rarity?: Rarity;
  className?: string;
  onClick?: () => void;
  delay?: number; // Legacy - ignored
  showShadow?: boolean;
  onPoseComplete?: () => void;
  // P0-4: Phase offset for desynced idle (0-1 or specific value)
  phaseOffset?: number;
  // Instance ID for deterministic per-pet variation
  instanceId?: string;
}

export const PetRenderer: React.FC<PetRendererProps> = ({
  petId,
  size = 128,
  state = 'idle',
  showRarityGlow = false,
  rarity = 'common',
  className = '',
  onClick,
  onPoseComplete,
  showShadow = true,
  phaseOffset,
  instanceId,
}) => {
  // Map state to pose
  const pose: PetPose = state as PetPose;

  return (
    <PetSprite
      petId={petId}
      size={size}
      pose={pose}
      showRarityGlow={showRarityGlow}
      rarity={rarity}
      className={className}
      onClick={onClick}
      onPoseComplete={onPoseComplete}
      showShadow={showShadow}
      phaseOffset={phaseOffset}
      instanceId={instanceId}
    />
  );
};

export default PetRenderer;
