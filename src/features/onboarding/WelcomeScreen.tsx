// PawBloom Welcome Screen

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import styles from './WelcomeScreen.module.css';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className={styles.container}>
      {/* Background decoration */}
      <div className={styles.bgDecor}>
        <motion.div
          className={styles.cloud}
          style={{ top: '10%', left: '10%' }}
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Cloud />
        </motion.div>
        <motion.div
          className={styles.cloud}
          style={{ top: '15%', right: '5%' }}
          animate={{ x: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Cloud />
        </motion.div>
      </div>
      
      {/* Main content */}
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Illustration */}
        <motion.div 
          className={styles.illustration}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <WelcomeIllustration />
        </motion.div>
        
        {/* Text */}
        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Welcome to PawBloom!
        </motion.h1>
        
        <motion.p 
          className={styles.description}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Take a walk and discover adorable pets waiting to be your friend. 
          Each step brings you closer to new furry companions!
        </motion.p>
        
        {/* Features */}
        <motion.div 
          className={styles.features}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🚶</span>
            <span>Walk</span>
          </div>
          <div className={styles.featureDot}>•</div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🐾</span>
            <span>Meet</span>
          </div>
          <div className={styles.featureDot}>•</div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>💝</span>
            <span>Bond</span>
          </div>
        </motion.div>
      </motion.div>
      
      {/* CTA Button */}
      <motion.div 
        className={styles.cta}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate('/starter')}
        >
          Let's Find Your First Friend!
        </Button>
      </motion.div>
    </div>
  );
};

// Welcome illustration with pets
const WelcomeIllustration: React.FC = () => (
  <svg viewBox="0 0 240 180" width="280" height="210">
    {/* Ground */}
    <ellipse cx="120" cy="165" rx="100" ry="15" fill="var(--color-primary-light)" opacity="0.3" />
    
    {/* Grass tufts */}
    <g fill="var(--color-primary)" opacity="0.6">
      <path d="M 30 160 Q 35 145 32 160 Q 37 150 40 160 Z" />
      <path d="M 200 160 Q 205 148 202 160 Q 207 152 210 160 Z" />
      <path d="M 100 165 Q 103 155 105 165 Z" />
      <path d="M 140 165 Q 143 155 145 165 Z" />
    </g>
    
    {/* Shiba (left) */}
    <g transform="translate(40, 80)">
      {/* Body */}
      <ellipse cx="30" cy="55" rx="22" ry="18" fill="#E8A857" />
      <ellipse cx="30" cy="58" rx="14" ry="12" fill="#FFF5E6" />
      {/* Legs */}
      <ellipse cx="18" cy="72" rx="6" ry="10" fill="#E8A857" />
      <ellipse cx="42" cy="72" rx="6" ry="10" fill="#E8A857" />
      {/* Tail */}
      <path d="M 50 50 Q 65 35 60 25" fill="none" stroke="#E8A857" strokeWidth="8" strokeLinecap="round" />
      {/* Head */}
      <ellipse cx="30" cy="30" rx="20" ry="18" fill="#E8A857" />
      <path d="M 30 20 Q 18 30 22 42 Q 30 48 38 42 Q 42 30 30 20" fill="#FFF5E6" />
      {/* Ears */}
      <path d="M 12 22 L 18 8 L 26 20 Z" fill="#E8A857" />
      <path d="M 48 22 L 42 8 L 34 20 Z" fill="#E8A857" />
      {/* Face */}
      <ellipse cx="23" cy="28" rx="4" ry="5" fill="#3D3D3D" />
      <ellipse cx="37" cy="28" rx="4" ry="5" fill="#3D3D3D" />
      <ellipse cx="21" cy="26" rx="1.5" ry="2" fill="white" />
      <ellipse cx="35" cy="26" rx="1.5" ry="2" fill="white" />
      <ellipse cx="30" cy="36" rx="4" ry="3" fill="#3D3D3D" />
      <ellipse cx="18" cy="32" rx="5" ry="3" fill="#FFB7C5" opacity="0.5" />
      <ellipse cx="42" cy="32" rx="5" ry="3" fill="#FFB7C5" opacity="0.5" />
    </g>
    
    {/* Orange Tabby (center) */}
    <g transform="translate(95, 85)">
      {/* Body */}
      <ellipse cx="30" cy="50" rx="20" ry="16" fill="#E89A4A" />
      {/* Stripes */}
      <path d="M 20 45 L 22 55" stroke="#D4874A" strokeWidth="3" strokeLinecap="round" />
      <path d="M 38 45 L 40 55" stroke="#D4874A" strokeWidth="3" strokeLinecap="round" />
      {/* Legs */}
      <ellipse cx="18" cy="66" rx="5" ry="9" fill="#E89A4A" />
      <ellipse cx="42" cy="66" rx="5" ry="9" fill="#E89A4A" />
      {/* Tail */}
      <path d="M 48 55 Q 65 45 70 30" fill="none" stroke="#E89A4A" strokeWidth="7" strokeLinecap="round" />
      {/* Head */}
      <ellipse cx="30" cy="28" rx="18" ry="16" fill="#E89A4A" />
      {/* Ears */}
      <path d="M 14 18 L 18 4 L 26 16 Z" fill="#E89A4A" />
      <path d="M 46 18 L 42 4 L 34 16 Z" fill="#E89A4A" />
      <path d="M 17 15 L 19 7 L 24 14 Z" fill="#FFB7C5" opacity="0.5" />
      <path d="M 43 15 L 41 7 L 36 14 Z" fill="#FFB7C5" opacity="0.5" />
      {/* Stripes on head */}
      <path d="M 25 15 Q 30 18 35 15" stroke="#D4874A" strokeWidth="2" />
      <path d="M 26 20 Q 30 22 34 20" stroke="#D4874A" strokeWidth="2" />
      {/* Face */}
      <ellipse cx="23" cy="26" rx="4" ry="5" fill="#7CB342" />
      <ellipse cx="37" cy="26" rx="4" ry="5" fill="#7CB342" />
      <ellipse cx="23" cy="26" rx="2" ry="4" fill="#1A1A1A" />
      <ellipse cx="37" cy="26" rx="2" ry="4" fill="#1A1A1A" />
      <ellipse cx="22" cy="24" rx="1" ry="1.5" fill="white" />
      <ellipse cx="36" cy="24" rx="1" ry="1.5" fill="white" />
      <path d="M 28 32 L 30 35 L 32 32 Z" fill="#FFB7C5" />
      {/* Whiskers */}
      <g stroke="#3D3D3D" strokeWidth="0.8" opacity="0.5">
        <line x1="10" y1="28" x2="20" y2="30" />
        <line x1="8" y1="32" x2="19" y2="32" />
        <line x1="40" y1="30" x2="50" y2="28" />
        <line x1="41" y1="32" x2="52" y2="32" />
      </g>
      <ellipse cx="16" cy="30" rx="4" ry="2.5" fill="#FFB7C5" opacity="0.5" />
      <ellipse cx="44" cy="30" rx="4" ry="2.5" fill="#FFB7C5" opacity="0.5" />
    </g>
    
    {/* Corgi (right) */}
    <g transform="translate(155, 90)">
      {/* Body */}
      <ellipse cx="30" cy="48" rx="26" ry="14" fill="#D4915A" />
      <ellipse cx="30" cy="50" rx="18" ry="10" fill="#FFFFFF" />
      {/* Fluffy butt */}
      <ellipse cx="52" cy="48" rx="8" ry="8" fill="#D4915A" />
      {/* Legs (short!) */}
      <ellipse cx="14" cy="62" rx="5" ry="7" fill="#D4915A" />
      <ellipse cx="28" cy="63" rx="5" ry="7" fill="#D4915A" />
      <ellipse cx="38" cy="63" rx="5" ry="7" fill="#D4915A" />
      <ellipse cx="50" cy="62" rx="5" ry="7" fill="#D4915A" />
      {/* Head */}
      <ellipse cx="30" cy="28" rx="20" ry="17" fill="#D4915A" />
      <path d="M 30 22 Q 18 30 22 40 Q 30 45 38 40 Q 42 30 30 22" fill="#FFFFFF" />
      {/* Big ears! */}
      <path d="M 8 22 L 16 0 L 28 18 Z" fill="#D4915A" />
      <path d="M 52 22 L 44 0 L 32 18 Z" fill="#D4915A" />
      <path d="M 12 18 L 17 5 L 25 16 Z" fill="#FFB7C5" opacity="0.4" />
      <path d="M 48 18 L 43 5 L 35 16 Z" fill="#FFB7C5" opacity="0.4" />
      {/* Face */}
      <ellipse cx="22" cy="26" rx="4" ry="5" fill="#3D3D3D" />
      <ellipse cx="38" cy="26" rx="4" ry="5" fill="#3D3D3D" />
      <ellipse cx="20" cy="24" rx="1.5" ry="2" fill="white" />
      <ellipse cx="36" cy="24" rx="1.5" ry="2" fill="white" />
      <ellipse cx="30" cy="35" rx="4" ry="3" fill="#3D3D3D" />
      <ellipse cx="16" cy="30" rx="5" ry="3" fill="#FFB7C5" opacity="0.5" />
      <ellipse cx="44" cy="30" rx="5" ry="3" fill="#FFB7C5" opacity="0.5" />
    </g>
    
    {/* Sparkles */}
    <g fill="var(--color-accent)">
      <path d="M 70 40 L 72 35 L 74 40 L 79 42 L 74 44 L 72 49 L 70 44 L 65 42 Z" opacity="0.8" />
      <path d="M 170 35 L 171.5 31 L 173 35 L 177 36.5 L 173 38 L 171.5 42 L 170 38 L 166 36.5 Z" opacity="0.6" />
      <path d="M 120 20 L 121 17 L 122 20 L 125 21 L 122 22 L 121 25 L 120 22 L 117 21 Z" opacity="0.7" />
    </g>
  </svg>
);

// Cloud decoration
const Cloud: React.FC = () => (
  <svg viewBox="0 0 80 40" width="80" height="40" fill="white" opacity="0.8">
    <ellipse cx="25" cy="25" rx="20" ry="15" />
    <ellipse cx="45" cy="20" rx="25" ry="18" />
    <ellipse cx="65" cy="25" rx="15" ry="12" />
  </svg>
);

export default WelcomeScreen;
