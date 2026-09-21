// PawBloom Audio Hook - React integration for audio system

import { useEffect, useCallback, useState } from 'react';
import { audioManager, hapticsManager, type SFXType, type BGMType } from '@/services/audio';

export function useAudio() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMuted, setIsMuted] = useState(audioManager.isMuted);
  const [masterVolume, setMasterVolumeState] = useState(audioManager.masterVolume);
  const [bgmVolume, setBgmVolumeState] = useState(audioManager.bgmVolume);
  const [sfxVolume, setSfxVolumeState] = useState(audioManager.sfxVolume);
  const [hapticsEnabled, setHapticsEnabled] = useState(hapticsManager.isEnabled);

  // Initialize audio on mount
  useEffect(() => {
    const init = async () => {
      if (!isInitialized) {
        await audioManager.init();
        setIsInitialized(true);
      }
    };
    init();
  }, [isInitialized]);

  // Play BGM
  const playBGM = useCallback((type: BGMType) => {
    audioManager.playBGM(type);
  }, []);

  // Stop BGM
  const stopBGM = useCallback(() => {
    audioManager.stopBGM();
  }, []);

  // Play SFX
  const playSFX = useCallback((type: SFXType) => {
    audioManager.playSFX(type);
  }, []);

  // Duck BGM for important sounds
  const duckBGM = useCallback((duration?: number) => {
    audioManager.duckBGM(duration);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMuted = audioManager.toggleMute();
    setIsMuted(newMuted);
    return newMuted;
  }, []);

  // Set volumes
  const setMasterVolume = useCallback((volume: number) => {
    audioManager.setMasterVolume(volume);
    setMasterVolumeState(volume);
  }, []);

  const setBgmVolume = useCallback((volume: number) => {
    audioManager.setBGMVolume(volume);
    setBgmVolumeState(volume);
  }, []);

  const setSfxVolume = useCallback((volume: number) => {
    audioManager.setSFXVolume(volume);
    setSfxVolumeState(volume);
  }, []);

  // Haptics
  const playHaptic = useCallback((pattern: 'tap' | 'light' | 'medium' | 'heavy' | 'reveal' | 'rare' | 'epic' | 'legendary' | 'reward' | 'bond' | 'level_up' | 'success' | 'error') => {
    hapticsManager.play(pattern);
  }, []);

  const toggleHaptics = useCallback(() => {
    const newEnabled = hapticsManager.toggle();
    setHapticsEnabled(newEnabled);
    return newEnabled;
  }, []);

  return {
    isInitialized,
    isMuted,
    masterVolume,
    bgmVolume,
    sfxVolume,
    hapticsEnabled,
    playBGM,
    stopBGM,
    playSFX,
    duckBGM,
    toggleMute,
    setMasterVolume,
    setBgmVolume,
    setSfxVolume,
    playHaptic,
    toggleHaptics,
  };
}

// Convenience hook for just playing sounds (no state management)
export function usePlaySound() {
  const playSFX = useCallback((type: SFXType) => {
    audioManager.playSFX(type);
  }, []);

  const playHaptic = useCallback((pattern: 'tap' | 'reveal' | 'rare' | 'epic' | 'legendary' | 'reward' | 'bond') => {
    hapticsManager.play(pattern);
  }, []);

  const playWithHaptic = useCallback((sfx: SFXType, haptic?: 'tap' | 'reveal' | 'rare' | 'epic' | 'legendary' | 'reward' | 'bond') => {
    audioManager.playSFX(sfx);
    if (haptic) {
      hapticsManager.play(haptic);
    }
  }, []);

  return { playSFX, playHaptic, playWithHaptic };
}

export default useAudio;
