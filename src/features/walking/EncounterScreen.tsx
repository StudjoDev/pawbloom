// PawBloom Encounter Screen - P0-2 Cinematic Reveal
// EXACT beat sheet from Production Spec:
// dim→bush shake→pause→shake→BREATHING silhouette→TAP→squash×3→freeze+spark→flash→crossfade→blink/tilt/wag→1.5s NO UI→stagger CTAs

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getPetById, type Rarity } from '@/data/pets';
import { PetRenderer } from '@/components/pets/PetRenderer';
import { audioManager } from '@/services/audio/AudioManager';
import { hapticsManager } from '@/services/audio/HapticsManager';
import Button from '@/components/ui/Button';
import ShareCard from '@/components/ui/ShareCard';
import styles from './EncounterScreen.module.css';

type EncounterPhase = 
  | 'dim'           // Background dims -15%
  | 'bush_shake_1'  // First bush shake
  | 'pause'         // Suspenseful pause
  | 'bush_shake_2'  // Second bush shake
  | 'silhouette'    // BREATHING silhouette (not static!)
  | 'wait_tap'      // Wait for player tap
  | 'squash_pulse'  // 3× squash pulse
  | 'freeze_spark'  // 200ms freeze + spark SFX
  | 'flash'         // Radial flash 300ms
  | 'crossfade'     // Pet crossfade in
  | 'landing'       // Blink → head tilt → tail wag
  | 'heart_pause'   // 1-1.5s NO UI, only pet + ❤️ (CRITICAL!)
  | 'show_ui';      // Stagger CTAs (nickname + buttons)

const EncounterScreen: React.FC = () => {
  const navigate = useNavigate();
  const { pendingEncounter, collectPet, clearEncounter, currentEnvironment } = useGameStore();
  
  const [phase, setPhase] = useState<EncounterPhase>('dim');
  const [nickname, setNickname] = useState('');
  const [isCollecting, setIsCollecting] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [collectedPetData, setCollectedPetData] = useState<{
    petId: string;
    petName: string;
    nickname?: string;
    personality: string;
    rarity: Rarity;
    steps: number;
    discoveredAt: number;
  } | null>(null);
  
  const silhouetteControls = useAnimation();
  const petControls = useAnimation();
  const tapAreaRef = useRef<HTMLDivElement>(null);
  const revealInProgress = useRef(false);
  
  const pet = pendingEncounter ? getPetById(pendingEncounter.petId) : null;
  const rarity = pendingEncounter?.rarity || 'common';
  const personality = pendingEncounter?.personality || 'playful';
  
  const rarityConfig = useMemo(() => getRarityConfig(rarity), [rarity]);
  const isFirstOfKind = true; // Always show "New" for now

  // Phase progression - EXACT beat sheet
  useEffect(() => {
    // Don't navigate away if showing share card
    if (!pendingEncounter && !showShareCard) {
      navigate('/walk', { replace: true });
      return;
    }
    
    if (!pendingEncounter) return;

    audioManager.duckBGM(3000);
    
    const timers: NodeJS.Timeout[] = [];
    
    timers.push(setTimeout(() => {
      setPhase('bush_shake_1');
      audioManager.playSFX('rustle');
      hapticsManager.play('light');
    }, 500));
    
    timers.push(setTimeout(() => setPhase('pause'), 1100));
    
    timers.push(setTimeout(() => {
      setPhase('bush_shake_2');
      audioManager.playSFX('encounter_rumble');
      hapticsManager.play('medium');
    }, 1600));
    
    timers.push(setTimeout(() => {
      setPhase('silhouette');
      audioManager.playSFX('silhouette');
      silhouetteControls.start({
        scale: [1, 1.03, 1],
        y: [0, -3, 0],
        transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
      });
    }, 2200));
    
    timers.push(setTimeout(() => setPhase('wait_tap'), 3000));
    
    return () => timers.forEach(clearTimeout);
  }, [pendingEncounter, navigate, silhouetteControls, showShareCard]);

  // Handle player TAP to reveal
  const handleTapReveal = useCallback(async () => {
    if (phase !== 'wait_tap' && phase !== 'silhouette') return;
    if (revealInProgress.current) return;
    revealInProgress.current = true;
    
    audioManager.playSFX('tap');
    hapticsManager.play('tap');
    
    // Phase: squash_pulse (3× squash)
    setPhase('squash_pulse');
    silhouetteControls.stop();
    
    for (let i = 0; i < 3; i++) {
      await silhouetteControls.start({
        scaleX: [1, 1.15, 0.9, 1],
        scaleY: [1, 0.85, 1.1, 1],
        transition: { duration: 0.15, ease: 'easeOut' }
      });
    }
    
    // Phase: freeze_spark (200ms freeze + spark)
    setPhase('freeze_spark');
    audioManager.playSFX('reveal_whoosh');
    hapticsManager.play('reveal');
    
    await new Promise(r => setTimeout(r, 200));
    
    // Phase: flash (radial flash 300ms)
    setPhase('flash');
    setShowFlash(true);
    audioManager.playSFX('sparkle');
    
    const raritySfx = `rarity_${rarity}` as const;
    audioManager.playSFX(raritySfx);
    hapticsManager.rarityFeedback(rarity);
    
    await new Promise(r => setTimeout(r, 300));
    setShowFlash(false);
    
    // Phase: crossfade (pet appears)
    setPhase('crossfade');
    
    await new Promise(r => setTimeout(r, 400));
    
    // Phase: landing (blink → tilt → wag)
    setPhase('landing');
    await petControls.start({
      scale: [0.8, 1.1, 1],
      y: [20, -10, 0],
      rotate: [0, -5, 5, 0],
      transition: { duration: 0.6, ease: 'easeOut' }
    });
    
    // Show heart
    setShowHeart(true);
    audioManager.playSFX('bond_up');
    
    // CRITICAL: Phase heart_pause - 1.5s NO UI (only pet + heart visible)
    setPhase('heart_pause');
    console.log('[Encounter] heart_pause START - NO UI for 1.5s');
    
    // Wait EXACTLY 1.5 seconds with NO UI
    await new Promise(r => setTimeout(r, 1500));
    
    console.log('[Encounter] heart_pause END - showing UI');
    
    // Phase: show_ui (NOW show the modal)
    setPhase('show_ui');
    audioManager.playBGM('home');
    
  }, [phase, rarity, silhouetteControls, petControls]);
  
  // Handle collect - persists pet AND shows share card
  const handleCollect = async () => {
    if (isCollecting || !pet || !pendingEncounter) return;
    
    setIsCollecting(true);
    audioManager.playSFX('collect');
    hapticsManager.play('success');
    
    try {
      // Save data for share card BEFORE collecting
      const shareData = {
        petId: pendingEncounter.petId,
        petName: pet.name,
        nickname: nickname.trim() || undefined,
        personality,
        rarity,
        steps: useGameStore.getState().currentSteps,
        discoveredAt: Date.now(),
      };
      
      // Collect pet (persists to DB + updates team)
      const newPet = await collectPet(nickname.trim() || undefined);
      console.log('[Encounter] Pet collected:', newPet.instanceId);
      
      // Update share data with final nickname
      setCollectedPetData({
        ...shareData,
        nickname: newPet.nickname,
      });
      
      // Show share card (P0-5)
      setShowShareCard(true);
    } catch (error) {
      console.error('Failed to collect pet:', error);
      setIsCollecting(false);
    }
  };

  // Handle share card close - navigate to home
  const handleShareCardClose = () => {
    setShowShareCard(false);
    navigate('/home', { replace: true });
  };
  
  // Handle skip - still persists pet first!
  const handleSkip = async () => {
    if (!pet || !pendingEncounter) return;
    
    audioManager.playSFX('ui_back');
    
    // Still collect the pet (just skip share card)
    try {
      await collectPet(nickname.trim() || undefined);
      console.log('[Encounter] Pet collected (skipped share)');
    } catch (error) {
      console.error('Failed to collect pet:', error);
    }
    
    clearEncounter();
    audioManager.playBGM('walk');
    navigate('/walk', { replace: true });
  };
  
  // If showing share card, keep rendering even if encounter cleared
  if (showShareCard && collectedPetData) {
    return (
      <div className={styles.container}>
        <div className={styles.background} style={{ background: '#B8D4E8' }} />
        <ShareCard
          isOpen={showShareCard}
          onClose={handleShareCardClose}
          petId={collectedPetData.petId}
          petName={collectedPetData.petName}
          nickname={collectedPetData.nickname}
          personality={collectedPetData.personality}
          rarity={collectedPetData.rarity}
          steps={collectedPetData.steps}
          discoveredAt={collectedPetData.discoveredAt}
        />
      </div>
    );
  }
  
  if (!pet || !pendingEncounter) return null;
  
  // Render conditions based on phase
  const isDimmed = true;
  const showBush = ['dim', 'bush_shake_1', 'pause', 'bush_shake_2'].includes(phase);
  const isBushShaking = phase === 'bush_shake_1' || phase === 'bush_shake_2';
  const showSilhouette = ['silhouette', 'wait_tap', 'squash_pulse', 'freeze_spark'].includes(phase);
  const showPet = ['flash', 'crossfade', 'landing', 'heart_pause', 'show_ui'].includes(phase);
  const showTapPrompt = phase === 'wait_tap';
  
  // CRITICAL: Only show modal in show_ui phase (NOT heart_pause)
  const showModal = phase === 'show_ui';
  
  return (
    <div 
      className={styles.container}
      onClick={handleTapReveal}
      ref={tapAreaRef}
    >
      {/* Background with dim effect */}
      <motion.div 
        className={styles.background}
        animate={{ filter: isDimmed ? 'brightness(0.85)' : 'brightness(1)' }}
        transition={{ duration: 0.5 }}
        style={{
          background: `linear-gradient(180deg, ${getEnvSkyColor(currentEnvironment)} 0%, var(--color-background) 100%)`
        }}
      />
      
      {/* Camera zoom effect */}
      <motion.div
        className={styles.cameraContainer}
        animate={{ scale: isDimmed ? 1.04 : 1 }}
        transition={{ duration: 1 }}
      >
        {/* Bush */}
        <AnimatePresence>
          {showBush && (
            <motion.div
              className={styles.bushContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
            >
              <motion.div
                animate={isBushShaking ? {
                  x: [-10, 10, -8, 8, -5, 5, 0],
                  rotate: [-3, 3, -2, 2, -1, 1, 0],
                } : {}}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <BushSVG />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* BREATHING Silhouette */}
        <AnimatePresence>
          {showSilhouette && (
            <motion.div
              className={styles.silhouetteContainer}
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <motion.div animate={silhouetteControls}>
                <PetRenderer
                  petId={pendingEncounter.petId}
                  size={200}
                  state="silhouette"
                />
              </motion.div>
              
              {/* Tap prompt */}
              <AnimatePresence>
                {showTapPrompt && (
                  <motion.div
                    className={styles.tapPrompt}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: [0.6, 1, 0.6], y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ opacity: { duration: 1.2, repeat: Infinity } }}
                  >
                    <span className={styles.tapText}>Tap!</span>
                    <motion.div
                      className={styles.tapRing}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Radial flash */}
        <AnimatePresence>
          {showFlash && (
            <motion.div
              className={styles.radialFlash}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 2, 3] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ background: `radial-gradient(circle, ${rarityConfig.color}CC 0%, transparent 70%)` }}
            />
          )}
        </AnimatePresence>
        
        {/* Revealed Pet */}
        <AnimatePresence>
          {showPet && (
            <motion.div
              className={styles.petContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div animate={petControls}>
                <PetRenderer
                  petId={pendingEncounter.petId}
                  size={220}
                  state={phase === 'heart_pause' || phase === 'show_ui' ? 'happy' : 'surprised'}
                  showRarityGlow
                  rarity={rarity}
                />
              </motion.div>
              
              {/* Restrained particles */}
              <RarityParticles config={rarityConfig} />
              
              {/* Heart ❤️ */}
              <AnimatePresence>
                {showHeart && (
                  <motion.div
                    className={styles.heartBurst}
                    initial={{ opacity: 0, scale: 0, y: 0 }}
                    animate={{ opacity: 1, scale: 1, y: -30 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    ❤️
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Name + New ribbon (only in show_ui) */}
              <AnimatePresence>
                {phase === 'show_ui' && (
                  <motion.div
                    className={styles.nameReveal}
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    {isFirstOfKind && <span className={styles.newRibbon}>NEW!</span>}
                    <span className={styles.petNameBounce} style={{ color: rarityConfig.color }}>
                      {pet.name}
                    </span>
                    <span className={styles.personalityText}>
                      {getPersonalityLine(personality, pet.name)}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Collection Modal - ONLY in show_ui phase (NOT heart_pause!) */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className={styles.cardOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className={styles.collectionCard}
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.1 }}
            >
              {/* Rarity banner */}
              <div 
                className={styles.rarityBanner}
                style={{ background: `linear-gradient(135deg, ${rarityConfig.color} 0%, ${rarityConfig.colorDark} 100%)` }}
              >
                <span className={styles.rarityStars}>{getRarityStars(rarity)}</span>
                <span className={styles.rarityLabel}>{getRarityLabel(rarity)}</span>
              </div>
              
              {/* Pet preview */}
              <div className={styles.cardPetPreview}>
                <PetRenderer
                  petId={pendingEncounter.petId}
                  size={110}
                  state="happy"
                  rarity={rarity}
                />
              </div>
              
              {/* Pet info */}
              <div className={styles.cardInfo}>
                <h2 className={styles.cardPetName}>{pet.name}</h2>
                <p className={styles.cardPersonality}>{capitalizeFirst(personality)}</p>
                
                {/* Nickname input */}
                <div className={styles.nicknameSection}>
                  <input
                    type="text"
                    className={styles.nicknameInput}
                    placeholder="Give a nickname..."
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value.slice(0, 20))}
                    maxLength={20}
                  />
                </div>
              </div>
              
              {/* CTAs */}
              <div className={styles.cardActions}>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleCollect}
                  isLoading={isCollecting}
                >
                  Welcome Home! 🏠
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  disabled={isCollecting}
                >
                  Keep Walking
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* P0-5: Share Card for NEW PET */}
      {collectedPetData && (
        <ShareCard
          isOpen={showShareCard}
          onClose={handleShareCardClose}
          petId={collectedPetData.petId}
          petName={collectedPetData.petName}
          nickname={collectedPetData.nickname}
          personality={collectedPetData.personality}
          rarity={collectedPetData.rarity}
          steps={collectedPetData.steps}
          discoveredAt={collectedPetData.discoveredAt}
        />
      )}
    </div>
  );
};

// Restrained particles - 8-14 petals + few sparkles (NOT explosion)
const RarityParticles: React.FC<{ config: RarityConfig }> = ({ config }) => {
  const petalCount = Math.min(14, 8 + Math.floor(config.particleCount / 4));
  const sparkleCount = Math.min(6, Math.floor(config.particleCount / 6));
  
  return (
    <div className={styles.particleContainer}>
      {[...Array(petalCount)].map((_, i) => (
        <motion.div
          key={`petal-${i}`}
          className={styles.petal}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0.5],
            x: Math.cos((i / petalCount) * Math.PI * 2) * (80 + Math.random() * 40),
            y: Math.sin((i / petalCount) * Math.PI * 2) * (80 + Math.random() * 40) + 20,
            rotate: Math.random() * 360,
          }}
          transition={{ duration: 1.8, delay: i * 0.03, ease: 'easeOut' }}
        >
          <PetalSVG color={i % 2 === 0 ? config.color : config.colorLight} />
        </motion.div>
      ))}
      
      {[...Array(sparkleCount)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className={styles.sparkle}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0],
            x: (Math.random() - 0.5) * 150,
            y: (Math.random() - 0.5) * 150,
          }}
          transition={{ duration: 1.2, delay: 0.2 + i * 0.1 }}
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
};

// Helper Types & Functions
interface RarityConfig {
  color: string;
  colorLight: string;
  colorDark: string;
  particleCount: number;
}

function getRarityConfig(rarity: Rarity): RarityConfig {
  const configs: Record<Rarity, RarityConfig> = {
    common: { color: '#8B9A6B', colorLight: '#B8C99A', colorDark: '#6B7A4B', particleCount: 8 },
    uncommon: { color: '#6B8E8E', colorLight: '#9AC0C0', colorDark: '#4B6E6E', particleCount: 12 },
    rare: { color: '#9B8EC2', colorLight: '#C5B8E8', colorDark: '#7B6EA2', particleCount: 18 },
    epic: { color: '#D4A5C9', colorLight: '#F0D0E8', colorDark: '#B485A9', particleCount: 24 },
    legendary: { color: '#E8C87D', colorLight: '#FFE8B8', colorDark: '#C8A85D', particleCount: 32 },
  };
  return configs[rarity];
}

function getRarityLabel(rarity: Rarity): string {
  return { common: 'Everyday', uncommon: 'Unusual', rare: 'Special', epic: 'Dream', legendary: 'Legendary' }[rarity];
}

function getRarityStars(rarity: Rarity): string {
  return { common: '🌱', uncommon: '🌸', rare: '✨', epic: '🌙', legendary: '⭐' }[rarity];
}

function getPersonalityLine(personality: string, petName: string): string {
  const lines: Record<string, string> = {
    shy: `${petName} found you... *peeks*`,
    playful: `${petName} wants to play!`,
    sleepy: `${petName} is a bit drowsy...`,
    foodie: `${petName} smells treats nearby!`,
    curious: `${petName} is curious about you!`,
    brave: `${petName} is ready for adventure!`,
    clingy: `${petName} doesn't want to leave!`,
    tsundere: `${petName}... noticed you. Maybe.`,
    explorer: `${petName} loves exploring!`,
    mischievous: `${petName} is plotting something...`,
  };
  return lines[personality] || `${petName} wants to be friends!`;
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getEnvSkyColor(env: string): string {
  return { park: '#B8D4E8', city: '#C5D5E8', riverside: '#A8C8E8', beach: '#F5D4C5' }[env] || '#B8D4E8';
}

// SVG Components
const BushSVG: React.FC = () => (
  <svg viewBox="0 0 200 120" width="220" height="140">
    <ellipse cx="100" cy="75" rx="80" ry="50" fill="#6B8F4E" />
    <ellipse cx="60" cy="68" rx="55" ry="40" fill="#7CB369" />
    <ellipse cx="140" cy="68" rx="55" ry="40" fill="#7CB369" />
    <ellipse cx="100" cy="55" rx="60" ry="40" fill="#8CB369" />
    <ellipse cx="70" cy="45" rx="35" ry="25" fill="#9BD07D" />
    <ellipse cx="130" cy="48" rx="32" ry="23" fill="#9BD07D" />
  </svg>
);

const PetalSVG: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 20 20" width="16" height="16">
    <ellipse cx="10" cy="10" rx="4" ry="8" fill={color} opacity="0.8" />
  </svg>
);

export default EncounterScreen;
