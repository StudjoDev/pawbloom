// PawBloom Opener Screen - P0-1 First 5 Minutes
// Scripted opener: pet peek/blink/run-out, "Someone's waiting outside..."

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { audioManager } from '@/services/audio/AudioManager';
import { hapticsManager } from '@/services/audio/HapticsManager';
import styles from './OpenerScreen.module.css';

type OpenerPhase = 'dark' | 'peek' | 'blink' | 'hide' | 'text' | 'cta';

const OpenerScreen: React.FC = () => {
  const navigate = useNavigate();
  const { hasCompletedOnboarding } = useGameStore();
  const [phase, setPhase] = useState<OpenerPhase>('dark');

  useEffect(() => {
    if (hasCompletedOnboarding) {
      navigate('/home', { replace: true });
      return;
    }

    // Initialize audio
    audioManager.init();

    // Opener sequence timing
    const timers: NodeJS.Timeout[] = [];
    
    timers.push(setTimeout(() => setPhase('peek'), 800));
    timers.push(setTimeout(() => {
      setPhase('blink');
      hapticsManager.play('light');
    }, 1600));
    timers.push(setTimeout(() => setPhase('hide'), 2400));
    timers.push(setTimeout(() => setPhase('text'), 3000));
    timers.push(setTimeout(() => setPhase('cta'), 4200));

    return () => timers.forEach(clearTimeout);
  }, [hasCompletedOnboarding, navigate]);

  const handleStart = () => {
    audioManager.playSFX('tap');
    hapticsManager.play('tap');
    navigate('/starter');
  };

  return (
    <div className={styles.container}>
      {/* Soft gradient background */}
      <div className={styles.background}>
        <div className={styles.gradient} />
      </div>

      {/* Bottom grass/bush area where pet peeks from */}
      <div className={styles.bottomScene}>
        <svg viewBox="0 0 430 200" className={styles.grassSvg}>
          <defs>
            <linearGradient id="grassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A8D08D" />
              <stop offset="100%" stopColor="#7CB369" />
            </linearGradient>
          </defs>
          
          {/* Ground */}
          <path
            d="M 0 80 Q 100 60 200 75 Q 300 90 430 70 L 430 200 L 0 200 Z"
            fill="url(#grassGrad)"
          />
          
          {/* Bush left */}
          <ellipse cx="60" cy="90" rx="70" ry="45" fill="#6B8F4E" />
          <ellipse cx="40" cy="85" rx="50" ry="35" fill="#7CB369" />
          <ellipse cx="80" cy="80" rx="45" ry="30" fill="#8CB369" />
          
          {/* Bush right */}
          <ellipse cx="370" cy="95" rx="65" ry="40" fill="#6B8F4E" />
          <ellipse cx="350" cy="88" rx="50" ry="35" fill="#7CB369" />
          <ellipse cx="390" cy="85" rx="40" ry="28" fill="#8CB369" />
          
          {/* Center bush where pet hides */}
          <ellipse cx="215" cy="100" rx="90" ry="55" fill="#6B8F4E" />
          <ellipse cx="190" cy="92" rx="65" ry="42" fill="#7CB369" />
          <ellipse cx="240" cy="88" rx="60" ry="38" fill="#8CB369" />
          <ellipse cx="215" cy="78" rx="50" ry="32" fill="#9BD07D" />
          
          {/* Grass tufts */}
          <g fill="#8CB369" opacity="0.8">
            {[30, 90, 150, 280, 340, 400].map((x, i) => (
              <path
                key={i}
                d={`M ${x} 70 Q ${x+3} 55 ${x+1} 70 Q ${x+8} 58 ${x+12} 70`}
              />
            ))}
          </g>
          
          {/* Flowers */}
          <g>
            {[
              { x: 45, y: 72, color: '#FFB7C5' },
              { x: 120, y: 68, color: '#F4A261' },
              { x: 310, y: 75, color: '#D4A5C9' },
              { x: 385, y: 70, color: '#FFB7C5' },
            ].map((f, i) => (
              <g key={i} transform={`translate(${f.x}, ${f.y})`}>
                <line x1="0" y1="0" x2="0" y2="10" stroke="#6B8F4E" strokeWidth="2" />
                <circle cx="-3" cy="-2" r="3" fill={f.color} />
                <circle cx="3" cy="-2" r="3" fill={f.color} />
                <circle cx="0" cy="-5" r="3" fill={f.color} />
                <circle cx="0" cy="-1" r="2" fill="#FFD93D" />
              </g>
            ))}
          </g>
        </svg>

        {/* Peeking pet */}
        <AnimatePresence>
          {(phase === 'peek' || phase === 'blink') && (
            <motion.div
              className={styles.peekingPet}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <PeekingPet isBlinking={phase === 'blink'} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Text content */}
      <div className={styles.content}>
        <AnimatePresence>
          {(phase === 'text' || phase === 'cta') && (
            <motion.div
              className={styles.textSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.p
                className={styles.tagline}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Someone's waiting outside…
              </motion.p>
              
              <motion.h1
                className={styles.logo}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                <span className={styles.logoIcon}>🐾</span>
                <span className={styles.logoText}>PawBloom</span>
              </motion.h1>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase === 'cta' && (
            <motion.div
              className={styles.ctaSection}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.button
                className={styles.startButton}
                onClick={handleStart}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                animate={{
                  boxShadow: [
                    '0 4px 20px rgba(140, 179, 105, 0.3)',
                    '0 6px 30px rgba(140, 179, 105, 0.5)',
                    '0 4px 20px rgba(140, 179, 105, 0.3)',
                  ],
                }}
                transition={{
                  boxShadow: { duration: 2, repeat: Infinity },
                }}
              >
                <span>Let's go meet them</span>
                <span className={styles.arrow}>→</span>
              </motion.button>
              
              <motion.p
                className={styles.subtitle}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.8 }}
              >
                Walk. Meet. Collect. Bond.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Peeking pet component - cute eyes peeking from bush
const PeekingPet: React.FC<{ isBlinking: boolean }> = ({ isBlinking }) => (
  <svg viewBox="0 0 120 80" width="100" height="70">
    {/* Pet head silhouette behind bush */}
    <ellipse cx="60" cy="50" rx="35" ry="30" fill="#E8A857" />
    
    {/* Ears */}
    <path d="M 30 35 Q 35 10 50 30" fill="#E8A857" />
    <path d="M 90 35 Q 85 10 70 30" fill="#E8A857" />
    <path d="M 33 33 Q 37 15 48 30" fill="#F5D4A8" />
    <path d="M 87 33 Q 83 15 72 30" fill="#F5D4A8" />
    
    {/* Face */}
    <ellipse cx="60" cy="52" rx="25" ry="20" fill="#FFF5E6" />
    
    {/* Eyes */}
    {isBlinking ? (
      <>
        <path d="M 48 45 Q 53 42 58 45" stroke="#3D3D3D" strokeWidth="2" fill="none" />
        <path d="M 62 45 Q 67 42 72 45" stroke="#3D3D3D" strokeWidth="2" fill="none" />
      </>
    ) : (
      <>
        <ellipse cx="50" cy="45" rx="6" ry="7" fill="#3D3D3D" />
        <ellipse cx="70" cy="45" rx="6" ry="7" fill="#3D3D3D" />
        <circle cx="48" cy="43" r="2" fill="white" />
        <circle cx="68" cy="43" r="2" fill="white" />
      </>
    )}
    
    {/* Nose */}
    <ellipse cx="60" cy="55" rx="4" ry="3" fill="#3D3D3D" />
    
    {/* Blush */}
    <ellipse cx="42" cy="52" rx="5" ry="3" fill="#FFB7C5" opacity="0.5" />
    <ellipse cx="78" cy="52" rx="5" ry="3" fill="#FFB7C5" opacity="0.5" />
  </svg>
);

export default OpenerScreen;
