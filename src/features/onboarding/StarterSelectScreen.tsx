// PawBloom Starter Selection Screen

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getStarterPets } from '@/data/pets';
import { PetRenderer } from '@/components/pets/PetRenderer';
import Button from '@/components/ui/Button';
import Panel from '@/components/ui/Panel';
import styles from './StarterSelectScreen.module.css';

const StarterSelectScreen: React.FC = () => {
  const navigate = useNavigate();
  const { selectedStarterId, setSelectedStarter } = useGameStore();
  const starters = getStarterPets();
  
  const handleContinue = () => {
    if (selectedStarterId) {
      navigate('/reveal');
    }
  };
  
  return (
    <div className={styles.container}>
      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={styles.title}>Choose Your First Friend</h1>
        <p className={styles.subtitle}>
          Who will join you on your walking adventures?
        </p>
      </motion.div>
      
      {/* Pet Selection Grid */}
      <div className={styles.petGrid}>
        {starters.map((pet, index) => (
          <motion.div
            key={pet.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.15, duration: 0.5 }}
          >
            <Panel
              variant={selectedStarterId === pet.id ? 'elevated' : 'default'}
              padding="md"
              rounded="xl"
              className={`${styles.petCard} ${selectedStarterId === pet.id ? styles.selected : ''}`}
              onClick={() => setSelectedStarter(pet.id)}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Selection indicator */}
              {selectedStarterId === pet.id && (
                <motion.div
                  className={styles.selectedBadge}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <CheckIcon />
                </motion.div>
              )}
              
              {/* Pet preview */}
              <div className={styles.petPreview}>
                <PetRenderer
                  petId={pet.id}
                  size={140}
                  state={selectedStarterId === pet.id ? 'happy' : 'idle'}
                  showRarityGlow={selectedStarterId === pet.id}
                  rarity="common"
                />
              </div>
              
              {/* Pet info */}
              <div className={styles.petInfo}>
                <h3 className={styles.petName}>{pet.name}</h3>
                <p className={styles.petDesc}>{pet.description}</p>
                
                {/* Catch phrase */}
                <div className={styles.catchPhrase}>
                  "{pet.catchPhrases[0]}"
                </div>
              </div>
            </Panel>
          </motion.div>
        ))}
      </div>
      
      {/* Continue Button */}
      <motion.div
        className={styles.footer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: selectedStarterId ? 1 : 0.5, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!selectedStarterId}
          onClick={handleContinue}
        >
          {selectedStarterId ? "Let's Meet!" : "Select a Friend"}
        </Button>
      </motion.div>
    </div>
  );
};

const CheckIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default StarterSelectScreen;
