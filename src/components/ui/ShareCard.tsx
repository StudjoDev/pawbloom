// PawBloom Share Card - P0-5 Viral Engine
// Auto static share card on NEW PET (~70% pet, few words, date, steps, personality)
// Hook: "Who will you meet on your walk?"

import React, { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PetRenderer } from '@/components/pets/PetRenderer';
import { getPetById, type Rarity } from '@/data/pets';
import styles from './ShareCard.module.css';

interface ShareCardProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  petName: string;
  nickname?: string;
  personality: string;
  rarity: Rarity;
  steps: number;
  discoveredAt: number;
}

const ShareCard: React.FC<ShareCardProps> = ({
  isOpen,
  onClose,
  petId,
  petName,
  nickname,
  personality,
  rarity,
  steps,
  discoveredAt,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const pet = getPetById(petId);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getRarityEmoji = (r: Rarity): string => {
    return {
      common: '🌱',
      uncommon: '🌸',
      rare: '✨',
      epic: '🌙',
      legendary: '⭐',
    }[r];
  };


  const handleShare = useCallback(async () => {
    // Try native share if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: `I met ${nickname || petName} on my walk! 🐾`,
          text: `Who will you meet on your walk? Play PawBloom!`,
          url: window.location.href,
        });
      } catch (e) {
        // User cancelled or error
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy link
      try {
        await navigator.clipboard.writeText(
          `I met ${nickname || petName} on my walk! 🐾 Play PawBloom: ${window.location.href}`
        );
        alert('Link copied to clipboard!');
      } catch {
        // Clipboard not available
      }
    }
  }, [nickname, petName]);

  if (!pet) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            ref={cardRef}
            className={styles.card}
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Card content - optimized for screenshots */}
            <div className={styles.cardContent}>
              {/* Pet takes ~70% of visual space */}
              <div className={styles.petSection}>
                <motion.div
                  className={styles.petGlow}
                  animate={{
                    boxShadow: [
                      `0 0 30px ${getRarityColor(rarity)}40`,
                      `0 0 50px ${getRarityColor(rarity)}60`,
                      `0 0 30px ${getRarityColor(rarity)}40`,
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <PetRenderer
                    petId={petId}
                    size={180}
                    state="happy"
                    showRarityGlow
                    rarity={rarity}
                  />
                </motion.div>
              </div>

              {/* Minimal info */}
              <div className={styles.infoSection}>
                <div className={styles.nameRow}>
                  <span className={styles.rarityEmoji}>{getRarityEmoji(rarity)}</span>
                  <h2 className={styles.petName}>{nickname || petName}</h2>
                </div>
                
                <p className={styles.personality}>{capitalizeFirst(personality)}</p>
                
                <div className={styles.statsRow}>
                  <span className={styles.stat}>
                    📅 {formatDate(discoveredAt)}
                  </span>
                  <span className={styles.statDivider}>•</span>
                  <span className={styles.stat}>
                    👟 {steps.toLocaleString()} steps
                  </span>
                </div>
              </div>

              {/* Branding */}
              <div className={styles.branding}>
                <span className={styles.logo}>🐾 PawBloom</span>
              </div>

              {/* Hook text */}
              <div className={styles.hookSection}>
                <p className={styles.hookText}>Who will you meet on your walk?</p>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <motion.button
                className={styles.shareButton}
                onClick={handleShare}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Share 📤
              </motion.button>
              <button className={styles.closeButton} onClick={onClose}>
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getRarityColor(rarity: Rarity): string {
  return {
    common: '#8B9A6B',
    uncommon: '#6B8E8E',
    rare: '#9B8EC2',
    epic: '#D4A5C9',
    legendary: '#E8C87D',
  }[rarity];
}

export default ShareCard;
