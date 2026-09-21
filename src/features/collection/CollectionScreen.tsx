// PawBloom Collection Screen - Adventure Journal / Sticker Book

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { PETS, RARITY_COLORS } from '@/data/pets';
import { PetRenderer } from '@/components/pets/PetRenderer';
import Panel from '@/components/ui/Panel';
import styles from './CollectionScreen.module.css';

type FilterType = 'all' | 'dogs' | 'cats' | 'discovered' | 'undiscovered';

const CollectionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { ownedPets } = useGameStore();
  const [filter, setFilter] = useState<FilterType>('all');
  
  // Get discovered pet IDs
  const discoveredPetIds = useMemo(() => {
    return new Set(ownedPets.map(p => p.petId));
  }, [ownedPets]);
  
  // Filter pets
  const displayPets = useMemo(() => {
    let filtered = [...PETS];
    
    switch (filter) {
      case 'dogs':
        filtered = filtered.filter(p => p.species === 'dog');
        break;
      case 'cats':
        filtered = filtered.filter(p => p.species === 'cat');
        break;
      case 'discovered':
        filtered = filtered.filter(p => discoveredPetIds.has(p.id));
        break;
      case 'undiscovered':
        filtered = filtered.filter(p => !discoveredPetIds.has(p.id));
        break;
    }
    
    return filtered;
  }, [filter, discoveredPetIds]);
  
  const collectionProgress = discoveredPetIds.size;
  const totalPets = PETS.length;
  
  return (
    <div className={styles.container}>
      {/* Header */}
      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button className={styles.backButton} onClick={() => navigate('/home')}>
          <BackIcon />
        </button>
        <h1 className={styles.title}>Collection</h1>
        <div className={styles.progress}>
          <span className={styles.progressText}>
            {collectionProgress}/{totalPets}
          </span>
        </div>
      </motion.header>
      
      {/* Progress bar */}
      <motion.div
        className={styles.progressBar}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div 
          className={styles.progressFill}
          style={{ width: `${(collectionProgress / totalPets) * 100}%` }}
        />
      </motion.div>
      
      {/* Filters */}
      <motion.div
        className={styles.filters}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {(['all', 'dogs', 'cats', 'discovered', 'undiscovered'] as FilterType[]).map((f) => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
            onClick={() => setFilter(f)}
          >
            {getFilterLabel(f)}
          </button>
        ))}
      </motion.div>
      
      {/* Collection grid */}
      <div className={styles.gridContainer}>
        <div className={styles.grid}>
          <AnimatePresence mode="popLayout">
            {displayPets.map((pet, index) => {
              const isDiscovered = discoveredPetIds.has(pet.id);
              const instances = ownedPets.filter(p => p.petId === pet.id);
              
              return (
                <motion.div
                  key={pet.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Panel
                    variant={isDiscovered ? 'elevated' : 'outlined'}
                    padding="sm"
                    rounded="lg"
                    className={`${styles.petCard} ${!isDiscovered ? styles.undiscovered : ''}`}
                    onClick={() => {
                      if (isDiscovered && instances.length > 0) {
                        navigate(`/pet/${instances[0].instanceId}`);
                      }
                    }}
                  >
                    {/* Pet image/silhouette */}
                    <div className={styles.petImage}>
                      <PetRenderer
                        petId={pet.id}
                        size={80}
                        state={isDiscovered ? 'idle' : 'silhouette'}
                        rarity={pet.baseRarity}
                      />
                      
                      {/* Instance count badge */}
                      {instances.length > 1 && (
                        <div className={styles.countBadge}>
                          ×{instances.length}
                        </div>
                      )}
                    </div>
                    
                    {/* Pet info */}
                    <div className={styles.petInfo}>
                      <span className={styles.petName}>
                        {isDiscovered ? pet.name : '???'}
                      </span>
                      <div 
                        className={styles.rarityDot}
                        style={{ 
                          backgroundColor: isDiscovered 
                            ? RARITY_COLORS[pet.baseRarity] 
                            : 'var(--color-text-muted)' 
                        }}
                      />
                    </div>
                  </Panel>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Empty state */}
      {displayPets.length === 0 && (
        <div className={styles.emptyState}>
          <p>No pets found with this filter.</p>
        </div>
      )}
    </div>
  );
};

function getFilterLabel(filter: FilterType): string {
  const labels: Record<FilterType, string> = {
    all: 'All',
    dogs: '🐕 Dogs',
    cats: '🐱 Cats',
    discovered: '✓ Found',
    undiscovered: '? Missing'
  };
  return labels[filter];
}

const BackIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18L9 12L15 6" />
  </svg>
);

export default CollectionScreen;
