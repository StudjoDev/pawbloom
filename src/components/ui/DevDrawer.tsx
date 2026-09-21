// PawBloom Developer Drawer - Hidden dev tools activated by long press on logo

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import Button from './Button';
import Panel from './Panel';
import styles from './DevDrawer.module.css';

export const DevDrawer: React.FC = () => {
  const { devMode, addSteps, setEnvironment, resetGame, player } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  
  if (!devMode) return null;
  
  return (
    <>
      {/* Dev mode indicator */}
      <motion.button
        className={styles.devButton}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        🛠️
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className={styles.drawer}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Panel variant="elevated" padding="lg" rounded="xl">
                <h3 className={styles.title}>Developer Tools</h3>
                
                <div className={styles.section}>
                  <h4>Add Steps</h4>
                  <div className={styles.buttonRow}>
                    <Button size="sm" variant="secondary" onClick={() => addSteps(100)}>
                      +100
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => addSteps(500)}>
                      +500
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => addSteps(1000)}>
                      +1000
                    </Button>
                  </div>
                </div>
                
                <div className={styles.section}>
                  <h4>Environment</h4>
                  <div className={styles.buttonRow}>
                    <Button size="sm" variant="secondary" onClick={() => setEnvironment('park')}>
                      Park
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setEnvironment('city')}>
                      City
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setEnvironment('riverside')}>
                      River
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setEnvironment('beach')}>
                      Beach
                    </Button>
                  </div>
                </div>
                
                <div className={styles.section}>
                  <h4>Stats</h4>
                  <div className={styles.stats}>
                    <p>Total Steps: {player?.totalSteps || 0}</p>
                    <p>Today: {player?.todaySteps || 0}</p>
                    <p>Treats: {player?.currency.treats || 0}</p>
                    <p>Friendship Paws: {player?.currency.friendshipPaws || 0}</p>
                  </div>
                </div>
                
                <div className={styles.section}>
                  <h4>Danger Zone</h4>
                  <Button 
                    variant="accent" 
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure? This will reset ALL game data!')) {
                        resetGame();
                        setIsOpen(false);
                        window.location.href = '/';
                      }
                    }}
                  >
                    Reset All Data
                  </Button>
                </div>
              </Panel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Hook for long press detection (to activate dev mode)
export const useLongPress = (callback: () => void, ms = 3000) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const start = useCallback(() => {
    timerRef.current = setTimeout(callback, ms);
  }, [callback, ms]);
  
  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  
  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop
  };
};

export default DevDrawer;
