// PawBloom Pet Renderer - Procedural SVG Pet Art System
// Creates consistent Japanese kawaii-style pets using layered SVG

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getPetById, type PetDef, type Rarity } from '@/data/pets';
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
  
  return (
    <motion.div
      className={className}
      onClick={onClick}
      style={{ 
        width: size, 
        height: size, 
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative'
      }}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
    >
      {showRarityGlow && (
        <div
          style={{
            position: 'absolute',
            inset: -8,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${RARITY_COLORS[rarity]}40 0%, transparent 70%)`,
            animation: 'pulse 2s ease-in-out infinite'
          }}
        />
      )}
      
      {pet.species === 'dog' ? (
        <DogSVG pet={pet} size={size} state={state} isSilhouette={isSilhouette} />
      ) : (
        <CatSVG pet={pet} size={size} state={state} isSilhouette={isSilhouette} />
      )}
    </motion.div>
  );
};

// Animation variants for different states
const getAnimationProps = (state: string) => {
  switch (state) {
    case 'walk':
      return {
        animate: { y: [0, -3, 0] },
        transition: { duration: 0.4, repeat: Infinity, ease: 'easeInOut' }
      };
    case 'happy':
      return {
        animate: { rotate: [-3, 3, -3], scale: [1, 1.05, 1] },
        transition: { duration: 0.3, repeat: Infinity, ease: 'easeInOut' }
      };
    case 'surprised':
      return {
        animate: { y: [0, -8, 0], scale: [1, 1.1, 1] },
        transition: { duration: 0.4, ease: 'easeOut' }
      };
    case 'sleepy':
      return {
        animate: { y: [0, 2, 0] },
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
      };
    default:
      return {
        animate: { y: [0, -2, 0] },
        transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
      };
  }
};

interface PetSVGProps {
  pet: PetDef;
  size: number;
  state: string;
  isSilhouette: boolean;
}

const DogSVG: React.FC<PetSVGProps> = ({ pet, size, state, isSilhouette }) => {
  const { colors, traits, id } = pet;
  const animProps = getAnimationProps(state);
  
  const fillColor = isSilhouette ? '#2D2D2D' : colors.primary;
  const secondaryColor = isSilhouette ? '#2D2D2D' : colors.secondary;
  const accentColor = isSilhouette ? '#2D2D2D' : (colors.accent || '#3D3D3D');
  
  // Breed-specific adjustments
  const breedConfig = useMemo(() => getDogBreedConfig(id, traits), [id, traits]);
  
  return (
    <motion.svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      {...animProps}
    >
      {/* Body */}
      <ellipse
        cx="50"
        cy={65 + breedConfig.bodyYOffset}
        rx={breedConfig.bodyWidth}
        ry={breedConfig.bodyHeight}
        fill={fillColor}
      />
      
      {/* Chest/belly marking for two-tone breeds */}
      {!isSilhouette && breedConfig.hasChestMarking && (
        <ellipse
          cx="50"
          cy={68 + breedConfig.bodyYOffset}
          rx={breedConfig.bodyWidth * 0.6}
          ry={breedConfig.bodyHeight * 0.7}
          fill={secondaryColor}
        />
      )}
      
      {/* Legs */}
      <g>
        {/* Back legs */}
        <ellipse cx={35} cy={78} rx={breedConfig.legWidth} ry={breedConfig.legHeight} fill={fillColor} />
        <ellipse cx={65} cy={78} rx={breedConfig.legWidth} ry={breedConfig.legHeight} fill={fillColor} />
        {/* Front legs */}
        <ellipse cx={40} cy={80} rx={breedConfig.legWidth} ry={breedConfig.legHeight + 2} fill={fillColor} />
        <ellipse cx={60} cy={80} rx={breedConfig.legWidth} ry={breedConfig.legHeight + 2} fill={fillColor} />
        {/* Paws */}
        {!isSilhouette && (
          <>
            <ellipse cx={40} cy={88} rx={breedConfig.legWidth + 1} ry={4} fill={secondaryColor} />
            <ellipse cx={60} cy={88} rx={breedConfig.legWidth + 1} ry={4} fill={secondaryColor} />
          </>
        )}
      </g>
      
      {/* Tail */}
      <DogTail 
        type={breedConfig.tailType}
        color={fillColor}
        x={breedConfig.tailX}
        y={breedConfig.tailY}
        state={state}
        isSilhouette={isSilhouette}
      />
      
      {/* Head */}
      <ellipse
        cx="50"
        cy={40 + breedConfig.headYOffset}
        rx={breedConfig.headWidth}
        ry={breedConfig.headHeight}
        fill={fillColor}
      />
      
      {/* Face markings */}
      {!isSilhouette && breedConfig.hasFaceMarkings && (
        <path
          d={`M 50 ${30 + breedConfig.headYOffset} 
              Q 35 ${40 + breedConfig.headYOffset} 38 ${50 + breedConfig.headYOffset}
              Q 50 ${55 + breedConfig.headYOffset} 62 ${50 + breedConfig.headYOffset}
              Q 65 ${40 + breedConfig.headYOffset} 50 ${30 + breedConfig.headYOffset}`}
          fill={secondaryColor}
        />
      )}
      
      {/* Snout */}
      <ellipse
        cx="50"
        cy={48 + breedConfig.headYOffset + breedConfig.snoutOffset}
        rx={breedConfig.snoutWidth}
        ry={breedConfig.snoutHeight}
        fill={isSilhouette ? fillColor : secondaryColor}
      />
      
      {/* Ears */}
      <DogEars
        type={breedConfig.earType}
        color={fillColor}
        secondaryColor={secondaryColor}
        headY={40 + breedConfig.headYOffset}
        isSilhouette={isSilhouette}
        state={state}
      />
      
      {/* Face */}
      {!isSilhouette && (
        <g className="face">
          {/* Eyes */}
          <DogEyes 
            state={state} 
            headY={40 + breedConfig.headYOffset}
            eyeSize={breedConfig.eyeSize}
          />
          
          {/* Nose */}
          <ellipse
            cx="50"
            cy={48 + breedConfig.headYOffset + breedConfig.snoutOffset}
            rx="4"
            ry="3"
            fill={accentColor}
          />
          
          {/* Mouth */}
          <path
            d={`M 46 ${52 + breedConfig.headYOffset + breedConfig.snoutOffset} 
                Q 50 ${56 + breedConfig.headYOffset + breedConfig.snoutOffset} 
                54 ${52 + breedConfig.headYOffset + breedConfig.snoutOffset}`}
            fill="none"
            stroke={accentColor}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          
          {/* Blush */}
          <ellipse cx="36" cy={44 + breedConfig.headYOffset} rx="5" ry="3" fill="#FFB7C5" opacity="0.6" />
          <ellipse cx="64" cy={44 + breedConfig.headYOffset} rx="5" ry="3" fill="#FFB7C5" opacity="0.6" />
        </g>
      )}
    </motion.svg>
  );
};

const CatSVG: React.FC<PetSVGProps> = ({ pet, size, state, isSilhouette }) => {
  const { colors, traits, id } = pet;
  const animProps = getAnimationProps(state);
  
  const fillColor = isSilhouette ? '#2D2D2D' : colors.primary;
  const secondaryColor = isSilhouette ? '#2D2D2D' : colors.secondary;
  const accentColor = isSilhouette ? '#2D2D2D' : (colors.accent || '#3D3D3D');
  
  const breedConfig = useMemo(() => getCatBreedConfig(id, traits), [id, traits]);
  
  return (
    <motion.svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      {...animProps}
    >
      {/* Body */}
      <ellipse
        cx="50"
        cy={65 + breedConfig.bodyYOffset}
        rx={breedConfig.bodyWidth}
        ry={breedConfig.bodyHeight}
        fill={fillColor}
      />
      
      {/* Chest marking */}
      {!isSilhouette && breedConfig.hasChestMarking && (
        <ellipse
          cx="50"
          cy={68 + breedConfig.bodyYOffset}
          rx={breedConfig.bodyWidth * 0.5}
          ry={breedConfig.bodyHeight * 0.6}
          fill={secondaryColor}
        />
      )}
      
      {/* Calico/pattern patches */}
      {!isSilhouette && id === 'calico' && (
        <g>
          <ellipse cx="42" cy="62" rx="8" ry="6" fill={colors.secondary} />
          <ellipse cx="58" cy="68" rx="7" ry="5" fill={colors.accent} />
          <ellipse cx="55" cy="35" rx="6" ry="5" fill={colors.secondary} />
        </g>
      )}
      
      {/* Legs */}
      <g>
        <ellipse cx={38} cy={78} rx={breedConfig.legWidth} ry={breedConfig.legHeight} fill={fillColor} />
        <ellipse cx={62} cy={78} rx={breedConfig.legWidth} ry={breedConfig.legHeight} fill={fillColor} />
        <ellipse cx={42} cy={80} rx={breedConfig.legWidth} ry={breedConfig.legHeight + 1} fill={fillColor} />
        <ellipse cx={58} cy={80} rx={breedConfig.legWidth} ry={breedConfig.legHeight + 1} fill={fillColor} />
        {!isSilhouette && (
          <>
            <ellipse cx={42} cy={88} rx={breedConfig.legWidth + 1} ry={3} fill="#FFB7C5" opacity="0.8" />
            <ellipse cx={58} cy={88} rx={breedConfig.legWidth + 1} ry={3} fill="#FFB7C5" opacity="0.8" />
          </>
        )}
      </g>
      
      {/* Tail */}
      <CatTail
        color={fillColor}
        x={75}
        y={60}
        fluffy={breedConfig.fluffyTail}
        state={state}
      />
      
      {/* Head */}
      <ellipse
        cx="50"
        cy={38 + breedConfig.headYOffset}
        rx={breedConfig.headWidth}
        ry={breedConfig.headHeight}
        fill={fillColor}
      />
      
      {/* Tuxedo markings */}
      {!isSilhouette && id === 'tuxedo' && (
        <>
          <ellipse cx="50" cy={42 + breedConfig.headYOffset} rx="10" ry="8" fill={secondaryColor} />
          <ellipse cx="50" cy={70} rx="12" ry="10" fill={secondaryColor} />
        </>
      )}
      
      {/* Ragdoll pointed markings */}
      {!isSilhouette && id === 'ragdoll' && (
        <>
          <ellipse cx="50" cy={44 + breedConfig.headYOffset} rx="12" ry="10" fill={colors.secondary} />
        </>
      )}
      
      {/* Ears */}
      <CatEars
        color={fillColor}
        innerColor={isSilhouette ? fillColor : '#FFB7C5'}
        headY={38 + breedConfig.headYOffset}
        headWidth={breedConfig.headWidth}
        fluffy={breedConfig.fluffyEars}
        state={state}
      />
      
      {/* Face */}
      {!isSilhouette && (
        <g className="face">
          {/* Eyes */}
          <CatEyes
            state={state}
            headY={38 + breedConfig.headYOffset}
            eyeColor={breedConfig.eyeColor}
            eyeSize={breedConfig.eyeSize}
          />
          
          {/* Nose */}
          <path
            d="M 48 45 L 50 48 L 52 45 Z"
            fill="#FFB7C5"
            transform={`translate(0, ${breedConfig.headYOffset})`}
          />
          
          {/* Mouth */}
          <path
            d={`M 47 ${50 + breedConfig.headYOffset} Q 50 ${53 + breedConfig.headYOffset} 53 ${50 + breedConfig.headYOffset}`}
            fill="none"
            stroke={accentColor}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          
          {/* Whiskers */}
          <g stroke={accentColor} strokeWidth="0.8" opacity="0.6">
            <line x1="30" y1={44 + breedConfig.headYOffset} x2="42" y2={46 + breedConfig.headYOffset} />
            <line x1="28" y1={48 + breedConfig.headYOffset} x2="41" y2={48 + breedConfig.headYOffset} />
            <line x1="30" y1={52 + breedConfig.headYOffset} x2="42" y2={50 + breedConfig.headYOffset} />
            <line x1="70" y1={44 + breedConfig.headYOffset} x2="58" y2={46 + breedConfig.headYOffset} />
            <line x1="72" y1={48 + breedConfig.headYOffset} x2="59" y2={48 + breedConfig.headYOffset} />
            <line x1="70" y1={52 + breedConfig.headYOffset} x2="58" y2={50 + breedConfig.headYOffset} />
          </g>
          
          {/* Blush */}
          <ellipse cx="36" cy={44 + breedConfig.headYOffset} rx="4" ry="2.5" fill="#FFB7C5" opacity="0.5" />
          <ellipse cx="64" cy={44 + breedConfig.headYOffset} rx="4" ry="2.5" fill="#FFB7C5" opacity="0.5" />
        </g>
      )}
      
      {/* Tabby stripes */}
      {!isSilhouette && id === 'orange-tabby' && (
        <g fill={accentColor} opacity="0.3">
          <path d="M 45 30 Q 50 32 55 30" strokeWidth="2" stroke={accentColor} fill="none" />
          <path d="M 44 35 Q 50 37 56 35" strokeWidth="2" stroke={accentColor} fill="none" />
          <path d="M 40 60 L 42 70" strokeWidth="2" stroke={accentColor} fill="none" />
          <path d="M 60 60 L 58 70" strokeWidth="2" stroke={accentColor} fill="none" />
        </g>
      )}
    </motion.svg>
  );
};

// Sub-components for ears, eyes, tails

interface DogEarsProps {
  type: string;
  color: string;
  secondaryColor: string;
  headY: number;
  isSilhouette: boolean;
  state: string;
}

const DogEars: React.FC<DogEarsProps> = ({ type, color, secondaryColor, headY, isSilhouette, state }) => {
  const earWiggle = state === 'happy' || state === 'surprised' ? { rotate: [-5, 5, -5] } : {};
  
  switch (type) {
    case 'pointed-up':
    case 'pointed':
      return (
        <motion.g animate={earWiggle} transition={{ duration: 0.3, repeat: state === 'happy' ? Infinity : 0 }}>
          <path d={`M 30 ${headY - 5} L 35 ${headY + 10} L 40 ${headY - 2} Z`} fill={color} />
          <path d={`M 70 ${headY - 5} L 65 ${headY + 10} L 60 ${headY - 2} Z`} fill={color} />
          {!isSilhouette && (
            <>
              <path d={`M 32 ${headY - 2} L 35 ${headY + 6} L 38 ${headY} Z`} fill={secondaryColor} opacity="0.5" />
              <path d={`M 68 ${headY - 2} L 65 ${headY + 6} L 62 ${headY} Z`} fill={secondaryColor} opacity="0.5" />
            </>
          )}
        </motion.g>
      );
    case 'large-pointed':
      return (
        <motion.g animate={earWiggle}>
          <path d={`M 25 ${headY - 10} L 32 ${headY + 12} L 42 ${headY - 5} Z`} fill={color} />
          <path d={`M 75 ${headY - 10} L 68 ${headY + 12} L 58 ${headY - 5} Z`} fill={color} />
          {!isSilhouette && (
            <>
              <path d={`M 28 ${headY - 5} L 33 ${headY + 6} L 39 ${headY - 2} Z`} fill="#FFB7C5" opacity="0.4" />
              <path d={`M 72 ${headY - 5} L 67 ${headY + 6} L 61 ${headY - 2} Z`} fill="#FFB7C5" opacity="0.4" />
            </>
          )}
        </motion.g>
      );
    case 'floppy':
      return (
        <motion.g animate={state === 'walk' ? { rotate: [-2, 2, -2] } : {}}>
          <ellipse cx="32" cy={headY + 5} rx="10" ry="15" fill={color} />
          <ellipse cx="68" cy={headY + 5} rx="10" ry="15" fill={color} />
        </motion.g>
      );
    case 'bat':
      return (
        <motion.g animate={earWiggle}>
          <path d={`M 28 ${headY - 15} Q 30 ${headY + 5} 38 ${headY + 5} L 35 ${headY - 8} Z`} fill={color} />
          <path d={`M 72 ${headY - 15} Q 70 ${headY + 5} 62 ${headY + 5} L 65 ${headY - 8} Z`} fill={color} />
          {!isSilhouette && (
            <>
              <path d={`M 30 ${headY - 10} Q 32 ${headY} 36 ${headY + 2} L 34 ${headY - 5} Z`} fill="#FFB7C5" opacity="0.5" />
              <path d={`M 70 ${headY - 10} Q 68 ${headY} 64 ${headY + 2} L 66 ${headY - 5} Z`} fill="#FFB7C5" opacity="0.5" />
            </>
          )}
        </motion.g>
      );
    case 'small-pointed':
      return (
        <motion.g animate={earWiggle}>
          <path d={`M 35 ${headY - 3} L 38 ${headY + 8} L 43 ${headY} Z`} fill={color} />
          <path d={`M 65 ${headY - 3} L 62 ${headY + 8} L 57 ${headY} Z`} fill={color} />
        </motion.g>
      );
    default:
      return null;
  }
};

interface DogTailProps {
  type: string;
  color: string;
  x: number;
  y: number;
  state: string;
  isSilhouette: boolean;
}

const DogTail: React.FC<DogTailProps> = ({ type, color, x, y, state }) => {
  const wagAnimation = (state === 'happy' || state === 'walk') 
    ? { rotate: [-20, 20, -20] } 
    : {};
  
  switch (type) {
    case 'curled':
      return (
        <motion.g animate={wagAnimation} style={{ originX: '0.3', originY: '1' }}>
          <path
            d={`M ${x - 5} ${y} Q ${x + 10} ${y - 15} ${x + 5} ${y - 25} Q ${x - 5} ${y - 20} ${x} ${y - 10}`}
            fill={color}
          />
        </motion.g>
      );
    case 'short':
      return (
        <motion.g animate={wagAnimation}>
          <ellipse cx={x} cy={y} rx="6" ry="4" fill={color} />
        </motion.g>
      );
    case 'long-wavy':
      return (
        <motion.g animate={wagAnimation} style={{ originX: '0', originY: '0.5' }}>
          <path
            d={`M ${x - 8} ${y} Q ${x + 5} ${y - 5} ${x + 10} ${y + 5} Q ${x + 15} ${y + 15} ${x + 8} ${y + 20}`}
            fill={color}
          />
        </motion.g>
      );
    case 'fluffy-curl':
      return (
        <motion.g animate={wagAnimation}>
          <ellipse cx={x} cy={y - 10} rx="12" ry="10" fill={color} />
          <ellipse cx={x + 3} cy={y - 15} rx="8" ry="7" fill={color} />
        </motion.g>
      );
    case 'plume':
      return (
        <motion.g animate={wagAnimation}>
          <path
            d={`M ${x - 5} ${y} Q ${x + 5} ${y - 20} ${x + 15} ${y - 15}`}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
          />
          <ellipse cx={x + 12} cy={y - 18} rx="10" ry="8" fill={color} />
        </motion.g>
      );
    default:
      return (
        <motion.g animate={wagAnimation}>
          <ellipse cx={x} cy={y} rx="8" ry="5" fill={color} transform="rotate(-30)" />
        </motion.g>
      );
  }
};

interface DogEyesProps {
  state: string;
  headY: number;
  eyeSize: number;
}

const DogEyes: React.FC<DogEyesProps> = ({ state, headY, eyeSize }) => {
  if (state === 'sleepy') {
    return (
      <g>
        <path d={`M 38 ${headY - 2} Q 42 ${headY} 46 ${headY - 2}`} stroke="#3D3D3D" strokeWidth="2" fill="none" />
        <path d={`M 54 ${headY - 2} Q 58 ${headY} 62 ${headY - 2}`} stroke="#3D3D3D" strokeWidth="2" fill="none" />
      </g>
    );
  }
  
  const eyeScale = state === 'surprised' ? 1.3 : 1;
  
  return (
    <g>
      {/* Left eye */}
      <ellipse cx="42" cy={headY - 2} rx={eyeSize * eyeScale} ry={eyeSize * 1.2 * eyeScale} fill="#3D3D3D" />
      <ellipse cx={40} cy={headY - 4} rx={eyeSize * 0.3} ry={eyeSize * 0.4} fill="white" />
      {/* Right eye */}
      <ellipse cx="58" cy={headY - 2} rx={eyeSize * eyeScale} ry={eyeSize * 1.2 * eyeScale} fill="#3D3D3D" />
      <ellipse cx={56} cy={headY - 4} rx={eyeSize * 0.3} ry={eyeSize * 0.4} fill="white" />
      
      {state === 'happy' && (
        <>
          <path d={`M 38 ${headY - 2} Q 42 ${headY - 5} 46 ${headY - 2}`} stroke="#3D3D3D" strokeWidth="2" fill="none" />
          <path d={`M 54 ${headY - 2} Q 58 ${headY - 5} 62 ${headY - 2}`} stroke="#3D3D3D" strokeWidth="2" fill="none" />
        </>
      )}
    </g>
  );
};

interface CatEarsProps {
  color: string;
  innerColor: string;
  headY: number;
  headWidth: number;
  fluffy: boolean;
  state: string;
}

const CatEars: React.FC<CatEarsProps> = ({ color, innerColor, headY, fluffy, state }) => {
  const earWiggle = state === 'surprised' ? { rotate: [-8, 8, 0] } : {};
  
  if (fluffy) {
    return (
      <motion.g animate={earWiggle}>
        <path d={`M 30 ${headY - 8} Q 28 ${headY - 20} 38 ${headY - 15} L 40 ${headY - 5} Z`} fill={color} />
        <path d={`M 70 ${headY - 8} Q 72 ${headY - 20} 62 ${headY - 15} L 60 ${headY - 5} Z`} fill={color} />
        <ellipse cx="34" cy={headY - 10} rx="4" ry="3" fill={color} />
        <ellipse cx="66" cy={headY - 10} rx="4" ry="3" fill={color} />
      </motion.g>
    );
  }
  
  return (
    <motion.g animate={earWiggle}>
      <path d={`M 32 ${headY - 5} L 35 ${headY - 20} L 42 ${headY - 5} Z`} fill={color} />
      <path d={`M 68 ${headY - 5} L 65 ${headY - 20} L 58 ${headY - 5} Z`} fill={color} />
      <path d={`M 35 ${headY - 8} L 36 ${headY - 15} L 40 ${headY - 8} Z`} fill={innerColor} opacity="0.6" />
      <path d={`M 65 ${headY - 8} L 64 ${headY - 15} L 60 ${headY - 8} Z`} fill={innerColor} opacity="0.6" />
    </motion.g>
  );
};

interface CatTailProps {
  color: string;
  x: number;
  y: number;
  fluffy: boolean;
  state: string;
}

const CatTail: React.FC<CatTailProps> = ({ color, x, y, fluffy, state }) => {
  const swayAnimation = state === 'idle' 
    ? { rotate: [-10, 10, -10] } 
    : state === 'happy' 
      ? { rotate: [-20, 20, -20] }
      : {};
  
  return (
    <motion.g 
      animate={swayAnimation} 
      transition={{ duration: state === 'happy' ? 0.3 : 2, repeat: Infinity }}
      style={{ originX: '0', originY: '0.8' }}
    >
      <path
        d={`M ${x - 20} ${y + 5} Q ${x - 5} ${y - 10} ${x + 5} ${y - 20} Q ${x + 10} ${y - 30} ${x + 5} ${y - 35}`}
        fill="none"
        stroke={color}
        strokeWidth={fluffy ? 10 : 6}
        strokeLinecap="round"
      />
      {fluffy && (
        <ellipse cx={x + 5} cy={y - 35} rx="8" ry="6" fill={color} />
      )}
    </motion.g>
  );
};

interface CatEyesProps {
  state: string;
  headY: number;
  eyeColor: string;
  eyeSize: number;
}

const CatEyes: React.FC<CatEyesProps> = ({ state, headY, eyeColor, eyeSize }) => {
  if (state === 'sleepy') {
    return (
      <g>
        <path d={`M 38 ${headY - 2} Q 42 ${headY + 1} 46 ${headY - 2}`} stroke="#3D3D3D" strokeWidth="2" fill="none" />
        <path d={`M 54 ${headY - 2} Q 58 ${headY + 1} 62 ${headY - 2}`} stroke="#3D3D3D" strokeWidth="2" fill="none" />
      </g>
    );
  }
  
  const eyeScale = state === 'surprised' ? 1.4 : 1;
  const pupilSize = state === 'surprised' ? 0.9 : 0.5;
  
  return (
    <g>
      {/* Left eye */}
      <ellipse cx="42" cy={headY - 2} rx={eyeSize * eyeScale} ry={eyeSize * 1.3 * eyeScale} fill={eyeColor} />
      <ellipse cx="42" cy={headY - 2} rx={eyeSize * pupilSize} ry={eyeSize * 1.2 * eyeScale} fill="#1A1A1A" />
      <ellipse cx={40} cy={headY - 4} rx={eyeSize * 0.25} ry={eyeSize * 0.3} fill="white" />
      
      {/* Right eye */}
      <ellipse cx="58" cy={headY - 2} rx={eyeSize * eyeScale} ry={eyeSize * 1.3 * eyeScale} fill={eyeColor} />
      <ellipse cx="58" cy={headY - 2} rx={eyeSize * pupilSize} ry={eyeSize * 1.2 * eyeScale} fill="#1A1A1A" />
      <ellipse cx={56} cy={headY - 4} rx={eyeSize * 0.25} ry={eyeSize * 0.3} fill="white" />
      
      {state === 'happy' && (
        <>
          <path d={`M 38 ${headY - 2} Q 42 ${headY - 6} 46 ${headY - 2}`} stroke="#3D3D3D" strokeWidth="2.5" fill="none" />
          <path d={`M 54 ${headY - 2} Q 58 ${headY - 6} 62 ${headY - 2}`} stroke="#3D3D3D" strokeWidth="2.5" fill="none" />
        </>
      )}
    </g>
  );
};

// Breed configuration helpers
function getDogBreedConfig(id: string, traits: PetDef['traits']) {
  const baseConfig = {
    bodyWidth: 22,
    bodyHeight: 18,
    bodyYOffset: 0,
    headWidth: 20,
    headHeight: 18,
    headYOffset: 0,
    snoutWidth: 8,
    snoutHeight: 6,
    snoutOffset: 0,
    legWidth: 5,
    legHeight: 10,
    eyeSize: 4,
    earType: traits.earType,
    tailType: traits.tailType,
    tailX: 75,
    tailY: 60,
    hasChestMarking: true,
    hasFaceMarkings: true
  };
  
  switch (id) {
    case 'shiba-inu':
      return { ...baseConfig, headHeight: 20, hasFaceMarkings: true };
    case 'corgi':
      return { 
        ...baseConfig, 
        bodyWidth: 28, 
        bodyHeight: 14, 
        legHeight: 7,
        headWidth: 22,
        earType: 'large-pointed'
      };
    case 'golden-retriever':
      return { 
        ...baseConfig, 
        bodyWidth: 25, 
        bodyHeight: 20,
        headWidth: 22,
        headHeight: 20,
        earType: 'floppy',
        hasChestMarking: false
      };
    case 'french-bulldog':
      return { 
        ...baseConfig, 
        bodyWidth: 20, 
        bodyHeight: 16,
        headWidth: 22,
        headHeight: 20,
        snoutWidth: 10,
        snoutHeight: 5,
        snoutOffset: 3,
        earType: 'bat',
        legHeight: 8,
        hasFaceMarkings: false
      };
    case 'samoyed':
      return { 
        ...baseConfig, 
        bodyWidth: 26, 
        bodyHeight: 20,
        headWidth: 22,
        headHeight: 20,
        tailType: 'fluffy-curl',
        hasChestMarking: false,
        hasFaceMarkings: false
      };
    case 'pomeranian':
      return { 
        ...baseConfig, 
        bodyWidth: 18, 
        bodyHeight: 16,
        headWidth: 20,
        headHeight: 22,
        headYOffset: -3,
        legHeight: 6,
        earType: 'small-pointed',
        tailType: 'plume',
        eyeSize: 5
      };
    default:
      return baseConfig;
  }
}

function getCatBreedConfig(id: string, _traits: PetDef['traits']) {
  const baseConfig = {
    bodyWidth: 20,
    bodyHeight: 16,
    bodyYOffset: 0,
    headWidth: 18,
    headHeight: 16,
    headYOffset: 0,
    legWidth: 4,
    legHeight: 10,
    eyeSize: 4,
    eyeColor: '#7CB342',
    fluffyEars: false,
    fluffyTail: false,
    hasChestMarking: false
  };
  
  switch (id) {
    case 'orange-tabby':
      return { ...baseConfig, eyeColor: '#7CB342' };
    case 'tuxedo':
      return { ...baseConfig, hasChestMarking: true, eyeColor: '#7CB342' };
    case 'british-shorthair':
      return { 
        ...baseConfig, 
        bodyWidth: 22,
        headWidth: 20,
        headHeight: 18,
        eyeColor: '#C98E58',
        eyeSize: 5
      };
    case 'ragdoll':
      return { 
        ...baseConfig, 
        bodyWidth: 22,
        bodyHeight: 18,
        headWidth: 20,
        eyeColor: '#6B8BB8',
        eyeSize: 5,
        fluffyEars: true,
        fluffyTail: true
      };
    case 'calico':
      return { ...baseConfig, eyeColor: '#7CB342' };
    case 'black-cat':
      return { 
        ...baseConfig, 
        bodyWidth: 18,
        headWidth: 17,
        legHeight: 12,
        eyeColor: '#E8C87D',
        eyeSize: 5
      };
    default:
      return baseConfig;
  }
}

export default PetRenderer;
