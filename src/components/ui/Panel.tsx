// PawBloom UI Panel Component

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import styles from './Panel.module.css';

interface PanelProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({
  variant = 'default',
  padding = 'md',
  rounded = 'lg',
  children,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      className={`${styles.panel} ${styles[variant]} ${styles[`padding-${padding}`]} ${styles[`rounded-${rounded}`]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Panel;
