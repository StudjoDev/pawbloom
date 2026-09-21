// PawBloom Naming Screen - Give your new pet a nickname

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getPetById } from '@/data/pets';
import { PetRenderer } from '@/components/pets/PetRenderer';
import Button from '@/components/ui/Button';
import Panel from '@/components/ui/Panel';
import styles from './NamingScreen.module.css';

const NamingScreen: React.FC = () => {
  const navigate = useNavigate();
  const { selectedStarterId, starterNickname, setStarterNickname, completeOnboarding } = useGameStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const pet = selectedStarterId ? getPetById(selectedStarterId) : null;
  
  const handleSubmit = async () => {
    if (!selectedStarterId) return;
    
    setIsSubmitting(true);
    try {
      await completeOnboarding(selectedStarterId, starterNickname.trim());
      navigate('/home', { replace: true });
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setIsSubmitting(false);
    }
  };
  
  const handleSkip = async () => {
    if (!selectedStarterId) return;
    
    setIsSubmitting(true);
    try {
      await completeOnboarding(selectedStarterId, '');
      navigate('/home', { replace: true });
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setIsSubmitting(false);
    }
  };
  
  if (!pet || !selectedStarterId) {
    navigate('/starter', { replace: true });
    return null;
  }
  
  return (
    <div className={styles.container}>
      {/* Pet display */}
      <motion.div
        className={styles.petDisplay}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <PetRenderer
            petId={selectedStarterId}
            size={180}
            state={starterNickname.length > 0 ? 'happy' : 'idle'}
            showRarityGlow
            rarity="common"
          />
        </motion.div>
        
        {/* Speech bubble with reaction */}
        <motion.div
          className={styles.speechBubble}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {starterNickname.length > 0 ? (
            <p>I love the name "{starterNickname}"!</p>
          ) : (
            <p>What will you call me?</p>
          )}
        </motion.div>
      </motion.div>
      
      {/* Naming form */}
      <motion.div
        className={styles.formContainer}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Panel variant="elevated" padding="lg" rounded="xl">
          <h2 className={styles.title}>Give Your Friend a Name</h2>
          <p className={styles.subtitle}>
            Or keep the default name: <strong>{pet.name}</strong>
          </p>
          
          <div className={styles.inputWrapper}>
            <input
              type="text"
              className={styles.input}
              placeholder={pet.name}
              value={starterNickname}
              onChange={(e) => setStarterNickname(e.target.value.slice(0, 20))}
              maxLength={20}
              autoFocus
            />
            <span className={styles.charCount}>
              {starterNickname.length}/20
            </span>
          </div>
          
          {/* Suggestion chips */}
          <div className={styles.suggestions}>
            <p className={styles.suggestLabel}>Or try:</p>
            <div className={styles.chipRow}>
              {getSuggestions(pet.species, selectedStarterId).map((name) => (
                <motion.button
                  key={name}
                  className={styles.chip}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStarterNickname(name)}
                >
                  {name}
                </motion.button>
              ))}
            </div>
          </div>
          
          <div className={styles.buttonGroup}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              {starterNickname.trim() ? `Name "${starterNickname.trim()}"` : `Keep "${pet.name}"`}
            </Button>
            
            {starterNickname.trim() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                disabled={isSubmitting}
              >
                Use default name instead
              </Button>
            )}
          </div>
        </Panel>
      </motion.div>
    </div>
  );
};

function getSuggestions(species: string, petId: string): string[] {
  const dogNames = ['Mochi', 'Biscuit', 'Pudding', 'Tofu', 'Dango'];
  const catNames = ['Maru', 'Neko', 'Mikan', 'Sesame', 'Miso'];
  
  const petSpecific: Record<string, string[]> = {
    'shiba-inu': ['Hachi', 'Yuki', 'Kuma'],
    'corgi': ['Loaf', 'Potato', 'Bun'],
    'orange-tabby': ['Sunny', 'Marmalade', 'Ginger']
  };
  
  const specific = petSpecific[petId] || [];
  const general = species === 'dog' ? dogNames : catNames;
  
  return [...specific, ...general].slice(0, 5);
}

export default NamingScreen;
