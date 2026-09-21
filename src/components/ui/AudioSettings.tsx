// PawBloom Audio Settings - Volume control panel

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '@/hooks/useAudio';
import styles from './AudioSettings.module.css';

const AudioSettingsButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    isMuted,
    masterVolume,
    bgmVolume,
    sfxVolume,
    hapticsEnabled,
    toggleMute,
    setMasterVolume,
    setBgmVolume,
    setSfxVolume,
    toggleHaptics,
    playSFX,
    playHaptic,
  } = useAudio();

  const handleToggleMute = () => {
    toggleMute();
    playSFX('ui_click');
  };

  const handleTestSFX = () => {
    playSFX('tap');
    playHaptic('tap');
  };

  return (
    <>
      {/* Floating audio button */}
      <motion.button
        className={styles.floatingButton}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        {isMuted ? <MutedIcon /> : <SoundIcon />}
      </motion.button>

      {/* Settings Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className={styles.panel}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
            >
              <div className={styles.header}>
                <h3 className={styles.title}>Sound Settings</h3>
                <button
                  className={styles.closeButton}
                  onClick={() => setIsOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className={styles.content}>
                {/* Master Mute */}
                <div className={styles.row}>
                  <span className={styles.label}>Sound</span>
                  <button
                    className={`${styles.toggleButton} ${!isMuted ? styles.active : ''}`}
                    onClick={handleToggleMute}
                  >
                    {isMuted ? 'OFF' : 'ON'}
                  </button>
                </div>

                {/* Master Volume */}
                <div className={styles.sliderRow}>
                  <span className={styles.label}>Master</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={masterVolume * 100}
                    onChange={(e) => setMasterVolume(Number(e.target.value) / 100)}
                    className={styles.slider}
                    disabled={isMuted}
                  />
                  <span className={styles.value}>{Math.round(masterVolume * 100)}%</span>
                </div>

                {/* BGM Volume */}
                <div className={styles.sliderRow}>
                  <span className={styles.label}>Music</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={bgmVolume * 100}
                    onChange={(e) => setBgmVolume(Number(e.target.value) / 100)}
                    className={styles.slider}
                    disabled={isMuted}
                  />
                  <span className={styles.value}>{Math.round(bgmVolume * 100)}%</span>
                </div>

                {/* SFX Volume */}
                <div className={styles.sliderRow}>
                  <span className={styles.label}>SFX</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sfxVolume * 100}
                    onChange={(e) => setSfxVolume(Number(e.target.value) / 100)}
                    className={styles.slider}
                    disabled={isMuted}
                  />
                  <span className={styles.value}>{Math.round(sfxVolume * 100)}%</span>
                </div>

                {/* Haptics */}
                <div className={styles.row}>
                  <span className={styles.label}>Vibration</span>
                  <button
                    className={`${styles.toggleButton} ${hapticsEnabled ? styles.active : ''}`}
                    onClick={() => {
                      toggleHaptics();
                      playHaptic('tap');
                    }}
                  >
                    {hapticsEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Test Button */}
                <button
                  className={styles.testButton}
                  onClick={handleTestSFX}
                  disabled={isMuted}
                >
                  🔊 Test Sound
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const SoundIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
);

const MutedIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
  </svg>
);

export default AudioSettingsButton;
