// PawBloom Progress Bar Component

import React from 'react';
import { motion } from 'framer-motion';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: 'primary' | 'accent' | 'rarity';
  rarityColor?: string;
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  color = 'primary',
  rarityColor,
  showLabel = false,
  label,
  size = 'md',
  animated = true,
  className = ''
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const fillStyle: React.CSSProperties = {
    width: `${percentage}%`,
    backgroundColor: color === 'rarity' && rarityColor ? rarityColor : undefined
  };
  
  return (
    <div className={`${styles.container} ${className}`}>
      {showLabel && (
        <div className={styles.labelRow}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{value} / {max}</span>
        </div>
      )}
      <div className={`${styles.track} ${styles[size]}`}>
        <motion.div
          className={`${styles.fill} ${styles[color]}`}
          style={fillStyle}
          initial={animated ? { width: 0 } : false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        {/* Shimmer effect */}
        <div className={styles.shimmer} />
      </div>
    </div>
  );
};

export default ProgressBar;
