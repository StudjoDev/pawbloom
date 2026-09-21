// PawBloom Pet Detail Screen - Individual pet view with interactions

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getPetById, RARITY_COLORS, PERSONALITIES } from '@/data/pets';
import { PetRenderer } from '@/components/pets/PetRenderer';
import Button from '@/components/ui/Button';
import Panel from '@/components/ui/Panel';
import ProgressBar from '@/components/ui/ProgressBar';
import styles from './PetDetailScreen.module.css';

const BOND_XP_THRESHOLDS = [0, 100, 300, 600, 1000];

const PetDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { instanceId } = useParams<{ instanceId: string }>();
  const { ownedPets, feedPet, updatePetNickname, player, teamPets, setTeamPet } = useGameStore();
  
  const [petState, setPetState] = useState<'idle' | 'happy' | 'surprised'>('idle');
  const [showRename, setShowRename] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [feedCooldown, setFeedCooldown] = useState(false);
  
  const petInstance = ownedPets.find(p => p.instanceId === instanceId);
  const petDef = petInstance ? getPetById(petInstance.petId) : null;
  
  if (!petInstance || !petDef) {
    navigate('/collection', { replace: true });
    return null;
  }
  
  const isInTeam = teamPets.some(p => p.instanceId === instanceId);
  const rarityColor = RARITY_COLORS[petInstance.rarity];
  const personalityInfo = PERSONALITIES[petInstance.personality];
  
  // Calculate bond progress
  const currentLevelXp = BOND_XP_THRESHOLDS[petInstance.bondLevel - 1] || 0;
  const nextLevelXp = BOND_XP_THRESHOLDS[petInstance.bondLevel] || BOND_XP_THRESHOLDS[BOND_XP_THRESHOLDS.length - 1];
  const xpInLevel = petInstance.bondXp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  
  const handleTap = () => {
    setPetState('happy');
    setTimeout(() => setPetState('idle'), 1000);
    
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };
  
  const handleFeed = async () => {
    if (feedCooldown || (player?.currency.treats || 0) <= 0) return;
    
    setFeedCooldown(true);
    setPetState('happy');
    
    await feedPet(instanceId!);
    
    setTimeout(() => {
      setPetState('idle');
      setFeedCooldown(false);
    }, 2000);
  };
  
  const handleRename = async () => {
    if (newNickname.trim()) {
      await updatePetNickname(instanceId!, newNickname.trim());
    }
    setShowRename(false);
    setNewNickname('');
  };
  
  const handleToggleTeam = async () => {
    if (isInTeam) {
      // Remove from team - set to empty slot
      const index = teamPets.findIndex(p => p.instanceId === instanceId);
      if (index !== -1 && teamPets.length > 1) {
        // Can't remove if only one team member
        // For now, just navigate back
        navigate('/home');
      }
    } else {
      // Add to team (will replace last slot if full)
      const nextIndex = Math.min(teamPets.length, 2);
      await setTeamPet(nextIndex, instanceId!);
    }
  };
  
  return (
    <div className={styles.container}>
      {/* Background with rarity glow */}
      <div 
        className={styles.background}
        style={{
          background: `linear-gradient(180deg, ${rarityColor}30 0%, var(--color-background) 50%)`
        }}
      />
      
      {/* Header */}
      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <BackIcon />
        </button>
        <div className={styles.headerTitle}>
          <span className={styles.petName}>
            {petInstance.nickname || petDef.name}
          </span>
          {petInstance.nickname && (
            <span className={styles.breedName}>{petDef.name}</span>
          )}
        </div>
        <button 
          className={styles.editButton}
          onClick={() => {
            setNewNickname(petInstance.nickname || '');
            setShowRename(true);
          }}
        >
          <EditIcon />
        </button>
      </motion.header>
      
      {/* Pet display - takes up 40%+ of screen */}
      <motion.div
        className={styles.petDisplay}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        onClick={handleTap}
      >
        <motion.div
          animate={petState === 'happy' ? { y: [0, -15, 0] } : { y: [0, -5, 0] }}
          transition={{ duration: petState === 'happy' ? 0.3 : 2, repeat: petState === 'idle' ? Infinity : 0 }}
        >
          <PetRenderer
            petId={petInstance.petId}
            size={200}
            state={petState}
            showRarityGlow
            rarity={petInstance.rarity}
          />
        </motion.div>
        
        {/* Tap hint */}
        <motion.p
          className={styles.tapHint}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Tap to interact!
        </motion.p>
        
        {/* Speech bubble on tap */}
        <AnimatePresence>
          {petState === 'happy' && (
            <motion.div
              className={styles.speechBubble}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              {personalityInfo.catchPhrase}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Info panels */}
      <motion.div
        className={styles.infoSection}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {/* Bond progress */}
        <Panel variant="elevated" padding="md" rounded="lg" className={styles.bondPanel}>
          <div className={styles.bondHeader}>
            <span className={styles.bondTitle}>Bond Level</span>
            <span className={styles.bondLevel}>Lv. {petInstance.bondLevel}</span>
          </div>
          <ProgressBar
            value={xpInLevel}
            max={xpNeeded}
            color="rarity"
            rarityColor={rarityColor}
            size="md"
          />
          <span className={styles.bondXp}>{xpInLevel} / {xpNeeded} XP</span>
        </Panel>
        
        {/* Stats grid */}
        <div className={styles.statsGrid}>
          <Panel variant="default" padding="sm" rounded="md" className={styles.statCard}>
            <span className={styles.statLabel}>Rarity</span>
            <span className={styles.statValue} style={{ color: rarityColor }}>
              {getRarityLabel(petInstance.rarity)}
            </span>
          </Panel>
          <Panel variant="default" padding="sm" rounded="md" className={styles.statCard}>
            <span className={styles.statLabel}>Personality</span>
            <span className={styles.statValue}>{capitalizeFirst(petInstance.personality)}</span>
          </Panel>
          <Panel variant="default" padding="sm" rounded="md" className={styles.statCard}>
            <span className={styles.statLabel}>Steps Together</span>
            <span className={styles.statValue}>{petInstance.totalStepsTogether.toLocaleString()}</span>
          </Panel>
          <Panel variant="default" padding="sm" rounded="md" className={styles.statCard}>
            <span className={styles.statLabel}>Met On</span>
            <span className={styles.statValue}>{formatDate(petInstance.discoveredAt)}</span>
          </Panel>
        </div>
        
        {/* Actions */}
        <div className={styles.actions}>
          <Button
            variant="accent"
            size="md"
            onClick={handleFeed}
            disabled={feedCooldown || (player?.currency.treats || 0) <= 0}
            leftIcon={<TreatIcon />}
          >
            Feed ({player?.currency.treats || 0})
          </Button>
          <Button
            variant={isInTeam ? 'secondary' : 'primary'}
            size="md"
            onClick={handleToggleTeam}
          >
            {isInTeam ? 'In Team ✓' : 'Add to Team'}
          </Button>
        </div>
        
        {/* Fun fact */}
        <Panel variant="outlined" padding="md" rounded="lg" className={styles.funFact}>
          <span className={styles.funFactLabel}>Fun Fact</span>
          <p className={styles.funFactText}>{petDef.funFact}</p>
        </Panel>
      </motion.div>
      
      {/* Rename modal */}
      <AnimatePresence>
        {showRename && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRename(false)}
          >
            <motion.div
              className={styles.modal}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={styles.modalTitle}>Rename Pet</h3>
              <input
                type="text"
                className={styles.renameInput}
                placeholder={petDef.name}
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value.slice(0, 20))}
                maxLength={20}
                autoFocus
              />
              <div className={styles.modalActions}>
                <Button variant="ghost" onClick={() => setShowRename(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleRename}>
                  Save
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper functions
function getRarityLabel(rarity: string): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Icons
const BackIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18L9 12L15 6" />
  </svg>
);

const EditIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TreatIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 2C9.24 2 7 4.24 7 7v1H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2h-2V7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v1H9V7c0-1.66 1.34-3 3-3z" />
  </svg>
);

export default PetDetailScreen;
