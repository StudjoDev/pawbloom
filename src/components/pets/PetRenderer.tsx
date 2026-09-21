// PawBloom PetRenderer - Wrapper for AnimatedPet with transparent PNGs
// Style A Soft Anime Chibi art assets

import React from 'react';
import AnimatedPet, { type PetAnimState } from './AnimatedPet';
import type { Rarity } from '@/data/pets';

interface PetRendererProps {
  petId: string;
  size?: number;
  state?: 'idle' | 'walk' | 'happy' | 'surprised' | 'sleepy' | 'silhouette';
  showRarityGlow?: boolean;
  rarity?: Rarity;
  className?: string;
  onClick?: () => void;
  delay?: number;
  showShadow?: boolean;
}

export const PetRenderer: React.FC<PetRendererProps> = ({
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
  return (
    <AnimatedPet
      petId={petId}
      size={size}
      state={state as PetAnimState}
      showRarityGlow={showRarityGlow}
      rarity={rarity}
      className={className}
      onClick={onClick}
      delay={delay}
      showShadow={showShadow}
    />
  );
};

export default PetRenderer;
