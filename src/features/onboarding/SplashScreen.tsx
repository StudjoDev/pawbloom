// PawBloom Splash Screen - Logo reveal and initialization

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useLongPress } from '@/components/ui/DevDrawer';
import styles from './SplashScreen.module.css';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { initGame, hasCompletedOnboarding, toggleDevMode } = useGameStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showLogo, setShowLogo] = useState(false);
  
  // Long press on logo to activate dev mode
  const longPressProps = useLongPress(() => {
    toggleDevMode();
  }, 3000);
  
  useEffect(() => {
    const init = async () => {
      await initGame();
      setShowLogo(true);
      
      // Wait for logo animation then navigate
      setTimeout(() => {
        setIsLoading(false);
        setTimeout(() => {
          if (hasCompletedOnboarding) {
            navigate('/home', { replace: true });
          } else {
            navigate('/welcome', { replace: true });
          }
        }, 800);
      }, 2000);
    };
    
    init();
  }, [initGame, navigate, hasCompletedOnboarding]);
  
  return (
    <div className={styles.container}>
      {/* Animated background */}
      <div className={styles.bgPattern}>
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className={styles.paw}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.15, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut'
            }}
            style={{
              left: `${10 + (i % 4) * 25}%`,
              top: `${15 + Math.floor(i / 4) * 30}%`
            }}
          >
            <PawIcon />
          </motion.div>
        ))}
      </div>
      
      <AnimatePresence>
        {showLogo && (
          <motion.div
            className={styles.logoContainer}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            {...longPressProps}
          >
            {/* Logo mark */}
            <motion.div 
              className={styles.logoMark}
              animate={{ 
                rotate: [0, -5, 5, 0],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <LogoMark />
            </motion.div>
            
            {/* Logo text */}
            <motion.h1 
              className={styles.logoText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              PawBloom
            </motion.h1>
            
            {/* Tagline */}
            <motion.p 
              className={styles.tagline}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Walk. Meet. Collect. Bond.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Loading indicator */}
      <motion.div 
        className={styles.loadingBar}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isLoading ? 0.8 : 1 }}
        transition={{ duration: isLoading ? 2 : 0.3 }}
      />
    </div>
  );
};

// Logo mark - cute pet silhouette with flower
const LogoMark: React.FC = () => (
  <svg viewBox="0 0 80 80" width="100" height="100">
    {/* Flower/bloom behind */}
    <g fill="none" stroke="var(--color-accent)" strokeWidth="2">
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <ellipse
          key={i}
          cx="40"
          cy="25"
          rx="8"
          ry="12"
          transform={`rotate(${angle} 40 40)`}
          fill="var(--color-accent-light)"
          opacity="0.6"
        />
      ))}
    </g>
    
    {/* Pet silhouette */}
    <g fill="var(--color-primary)">
      {/* Body */}
      <ellipse cx="40" cy="55" rx="18" ry="14" />
      {/* Head */}
      <ellipse cx="40" cy="38" rx="14" ry="13" />
      {/* Ears */}
      <path d="M 28 30 L 30 18 L 38 28 Z" />
      <path d="M 52 30 L 50 18 L 42 28 Z" />
      {/* Inner ears */}
      <path d="M 30 27 L 31 21 L 36 27 Z" fill="var(--color-accent-light)" />
      <path d="M 50 27 L 49 21 L 44 27 Z" fill="var(--color-accent-light)" />
    </g>
    
    {/* Face */}
    <g>
      {/* Eyes */}
      <ellipse cx="35" cy="36" rx="3" ry="3.5" fill="#3D3D3D" />
      <ellipse cx="45" cy="36" rx="3" ry="3.5" fill="#3D3D3D" />
      <ellipse cx="34" cy="35" rx="1" ry="1.2" fill="white" />
      <ellipse cx="44" cy="35" rx="1" ry="1.2" fill="white" />
      {/* Nose */}
      <ellipse cx="40" cy="42" rx="3" ry="2" fill="#3D3D3D" />
      {/* Blush */}
      <ellipse cx="30" cy="40" rx="4" ry="2" fill="#FFB7C5" opacity="0.5" />
      <ellipse cx="50" cy="40" rx="4" ry="2" fill="#FFB7C5" opacity="0.5" />
    </g>
  </svg>
);

// Paw print icon for background
const PawIcon: React.FC = () => (
  <svg viewBox="0 0 40 40" width="40" height="40" fill="var(--color-primary)">
    <ellipse cx="20" cy="28" rx="10" ry="8" />
    <ellipse cx="10" cy="16" rx="5" ry="6" />
    <ellipse cx="20" cy="12" rx="5" ry="6" />
    <ellipse cx="30" cy="16" rx="5" ry="6" />
  </svg>
);

export default SplashScreen;
