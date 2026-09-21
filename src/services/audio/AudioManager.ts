// PawBloom Audio Manager - Production audio with real files
// Gate D: BGM + SFX + Haptics from audio pack

import { Howl, Howler } from 'howler';

export type SFXType =
  | 'tap'
  | 'footstep'
  | 'paw'
  | 'encounter_rumble'
  | 'silhouette'
  | 'reveal_whoosh'
  | 'rarity_common'
  | 'rarity_uncommon'
  | 'rarity_rare'
  | 'rarity_epic'
  | 'rarity_legendary'
  | 'reward'
  | 'bond_up'
  | 'level_up'
  | 'feed'
  | 'ui_click'
  | 'ui_back'
  | 'collect'
  | 'sparkle'
  | 'rustle';

export type BGMType = 'home' | 'walk' | 'encounter' | 'silence';

interface AudioManagerState {
  masterVolume: number;
  bgmVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  isUnlocked: boolean;
  currentBGM: BGMType | null;
}

const getAssetBase = () => import.meta.env.BASE_URL || '/';

class AudioManager {
  private state: AudioManagerState = {
    masterVolume: 0.7,
    bgmVolume: 0.5,
    sfxVolume: 0.8,
    isMuted: false,
    isUnlocked: false,
    currentBGM: null,
  };

  private bgmHowls: Map<BGMType, Howl> = new Map();
  private sfxHowls: Map<SFXType, Howl> = new Map();
  private currentBGMHowl: Howl | null = null;
  private crossfadeTime = 800;
  private pendingUnlock: (() => void)[] = [];
  private initialized = false;

  constructor() {
    this.loadState();
    this.setupUnlockListener();
  }

  private loadState() {
    try {
      const saved = localStorage.getItem('pawbloom_audio');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = { ...this.state, ...parsed, isUnlocked: false };
      }
    } catch {
      // Use defaults
    }
  }

  private saveState() {
    try {
      const { isUnlocked, currentBGM, ...toSave } = this.state;
      localStorage.setItem('pawbloom_audio', JSON.stringify(toSave));
    } catch {
      // Storage not available
    }
  }

  private setupUnlockListener() {
    const unlock = async () => {
      if (this.state.isUnlocked) return;

      try {
        Howler.ctx?.resume();
        this.state.isUnlocked = true;
        console.log('[Audio] Unlocked on user gesture');

        // Run pending actions
        this.pendingUnlock.forEach(fn => fn());
        this.pendingUnlock = [];
      } catch (e) {
        console.warn('[Audio] Unlock failed:', e);
      }
    };

    const events = ['touchstart', 'touchend', 'click', 'keydown'];
    const handler = () => {
      unlock();
      events.forEach(e => document.removeEventListener(e, handler));
    };
    events.forEach(e => document.addEventListener(e, handler, { once: false, passive: true }));
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    
    const base = getAssetBase();
    
    // Load BGM from audio pack
    this.bgmHowls.set('home', new Howl({
      src: [`${base}audio/home-cozy.ogg`],
      loop: true,
      volume: 0,
      html5: true,
      preload: true,
    }));

    this.bgmHowls.set('walk', new Howl({
      src: [`${base}audio/walk-adventure.ogg`],
      loop: true,
      volume: 0,
      html5: true,
      preload: true,
    }));

    // Encounter BGM uses home with lower pitch feel (duck effect)
    this.bgmHowls.set('encounter', new Howl({
      src: [`${base}audio/home-cozy.ogg`],
      loop: true,
      volume: 0,
      html5: true,
      rate: 0.9,
    }));

    // Load SFX from audio pack
    const sfxFiles: Partial<Record<SFXType, string>> = {
      tap: 'tap.ogg',
      footstep: 'footstep.ogg',
      paw: 'paw.ogg',
      encounter_rumble: 'encounter-rumble.ogg',
      silhouette: 'silhouette.ogg',
      reveal_whoosh: 'reveal-whoosh.ogg',
      rarity_rare: 'rarity-sting-rare.ogg',
      rarity_epic: 'rarity-sting-epic.ogg',
      rarity_legendary: 'rarity-sting-legendary.ogg',
      reward: 'reward.ogg',
      bond_up: 'bond-up.ogg',
      level_up: 'level-up.ogg',
      feed: 'feed.ogg',
    };

    for (const [sfx, file] of Object.entries(sfxFiles)) {
      this.sfxHowls.set(sfx as SFXType, new Howl({
        src: [`${base}audio/${file}`],
        volume: this.state.sfxVolume * this.state.masterVolume,
        preload: true,
      }));
    }

    // Synthesize missing SFX that aren't in pack
    await this.synthesizeMissingSFX();
    
    this.initialized = true;
    console.log('[Audio] Initialized with audio pack');
  }

  private async synthesizeMissingSFX(): Promise<void> {
    // Create simple synthesized SFX for ones not in pack
    const missingSFX: SFXType[] = [
      'ui_click', 'ui_back', 'collect', 'sparkle', 'rustle',
      'rarity_common', 'rarity_uncommon'
    ];

    for (const sfx of missingSFX) {
      const dataUri = await this.synthesizeSFX(sfx);
      this.sfxHowls.set(sfx, new Howl({
        src: [dataUri],
        volume: this.state.sfxVolume * this.state.masterVolume,
      }));
    }
  }

  private async synthesizeSFX(type: SFXType): Promise<string> {
    const ctx = new OfflineAudioContext(1, 44100 * 1, 44100);
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(ctx.destination);

    switch (type) {
      case 'ui_click': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.4, 0);
        gain.gain.exponentialRampToValueAtTime(0.01, 0.06);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(0);
        osc.stop(0.08);
        break;
      }
      case 'ui_back': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, 0);
        osc.frequency.exponentialRampToValueAtTime(300, 0.1);
        gain.gain.setValueAtTime(0.3, 0);
        gain.gain.exponentialRampToValueAtTime(0.01, 0.1);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(0);
        osc.stop(0.12);
        break;
      }
      case 'collect': {
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0, i * 0.06);
          gain.gain.linearRampToValueAtTime(0.25, i * 0.06 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.01, i * 0.06 + 0.25);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(i * 0.06);
          osc.stop(i * 0.06 + 0.3);
        });
        break;
      }
      case 'sparkle': {
        for (let i = 0; i < 4; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = 2000 + Math.random() * 1500;
          const t = i * 0.04;
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.15, t + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.15);
        }
        break;
      }
      case 'rustle': {
        const bufferSize = ctx.sampleRate * 0.3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15)) * 0.3;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        filter.Q.value = 1;
        source.connect(filter);
        filter.connect(masterGain);
        source.start(0);
        break;
      }
      case 'rarity_common': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 523.25;
        gain.gain.setValueAtTime(0, 0);
        gain.gain.linearRampToValueAtTime(0.3, 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, 0.3);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(0);
        osc.stop(0.35);
        break;
      }
      case 'rarity_uncommon': {
        const notes = [523.25, 659.25];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0, i * 0.1);
          gain.gain.linearRampToValueAtTime(0.25, i * 0.1 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.01, i * 0.1 + 0.3);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(i * 0.1);
          osc.stop(i * 0.1 + 0.35);
        });
        break;
      }
    }

    const buffer = await ctx.startRendering();
    return this.bufferToDataUri(buffer);
  }

  private bufferToDataUri(buffer: AudioBuffer): string {
    const numChannels = buffer.numberOfChannels;
    const length = buffer.length;
    const sampleRate = buffer.sampleRate;

    const wavBuffer = new ArrayBuffer(44 + length * numChannels * 2);
    const view = new DataView(wavBuffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numChannels * 2, true);

    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }

    const bytes = new Uint8Array(wavBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return 'data:audio/wav;base64,' + btoa(binary);
  }

  // Public API

  playBGM(type: BGMType): void {
    if (this.state.isMuted || type === 'silence') {
      this.stopBGM();
      return;
    }

    if (!this.state.isUnlocked) {
      this.pendingUnlock.push(() => this.playBGM(type));
      return;
    }

    if (this.state.currentBGM === type && this.currentBGMHowl?.playing()) {
      return; // Already playing this BGM
    }

    const newHowl = this.bgmHowls.get(type);
    if (!newHowl) return;

    const targetVolume = this.state.bgmVolume * this.state.masterVolume;

    if (this.currentBGMHowl && this.state.currentBGM !== type) {
      // Crossfade
      const oldHowl = this.currentBGMHowl;
      oldHowl.fade(oldHowl.volume(), 0, this.crossfadeTime);
      setTimeout(() => oldHowl.stop(), this.crossfadeTime);
    }

    newHowl.volume(0);
    newHowl.play();
    newHowl.fade(0, targetVolume, this.crossfadeTime);

    this.currentBGMHowl = newHowl;
    this.state.currentBGM = type;
  }

  stopBGM(): void {
    if (this.currentBGMHowl) {
      this.currentBGMHowl.fade(this.currentBGMHowl.volume(), 0, 400);
      setTimeout(() => {
        this.currentBGMHowl?.stop();
        this.currentBGMHowl = null;
      }, 400);
    }
    this.state.currentBGM = null;
  }

  playSFX(type: SFXType): void {
    if (this.state.isMuted || !this.state.isUnlocked) return;

    const howl = this.sfxHowls.get(type);
    if (howl) {
      howl.volume(this.state.sfxVolume * this.state.masterVolume);
      howl.play();
    }
  }

  duckBGM(duration: number = 500): void {
    if (!this.currentBGMHowl) return;
    const originalVolume = this.state.bgmVolume * this.state.masterVolume;
    const duckedVolume = originalVolume * 0.25;
    this.currentBGMHowl.fade(originalVolume, duckedVolume, 150);
    setTimeout(() => {
      this.currentBGMHowl?.fade(duckedVolume, originalVolume, duration);
    }, duration);
  }

  setMasterVolume(volume: number): void {
    this.state.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
    this.saveState();
  }

  setBGMVolume(volume: number): void {
    this.state.bgmVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
    this.saveState();
  }

  setSFXVolume(volume: number): void {
    this.state.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveState();
  }

  toggleMute(): boolean {
    this.state.isMuted = !this.state.isMuted;
    if (this.state.isMuted) {
      this.stopBGM();
    }
    this.saveState();
    return this.state.isMuted;
  }

  private updateVolumes(): void {
    if (this.currentBGMHowl) {
      this.currentBGMHowl.volume(this.state.bgmVolume * this.state.masterVolume);
    }
  }

  get isMuted(): boolean {
    return this.state.isMuted;
  }

  get isUnlocked(): boolean {
    return this.state.isUnlocked;
  }

  get masterVolume(): number {
    return this.state.masterVolume;
  }

  get bgmVolume(): number {
    return this.state.bgmVolume;
  }

  get sfxVolume(): number {
    return this.state.sfxVolume;
  }
}

export const audioManager = new AudioManager();
export default audioManager;
