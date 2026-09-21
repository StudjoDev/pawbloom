// PawBloom Haptics Manager - P0-3 Haptic Vocabulary
// Patterns: tiny / soft / medium / success / rare
// Used for reveal, rare, reward, bond

export type HapticPattern = 
  | 'tiny'      // Quick tap feedback
  | 'soft'      // Gentle confirmation  
  | 'medium'    // Standard interaction
  | 'success'   // Positive outcome
  | 'rare'      // Special/rare reveal
  | 'tap'       // UI tap
  | 'light'     // Light feedback
  | 'heavy'     // Strong feedback
  | 'reveal'    // Reveal sequence
  | 'epic'      // Epic rarity
  | 'legendary' // Legendary rarity
  | 'reward'    // Getting reward
  | 'bond'      // Bond increase
  | 'level_up'  // Level up
  | 'error';    // Error feedback

interface HapticsState {
  enabled: boolean;
}

class HapticsManager {
  private state: HapticsState = {
    enabled: true,
  };

  private isSupported: boolean = false;

  constructor() {
    this.isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
    this.loadState();
  }

  private loadState(): void {
    try {
      const saved = localStorage.getItem('pawbloom_haptics');
      if (saved) {
        this.state = JSON.parse(saved);
      }
    } catch {
      // Use defaults
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem('pawbloom_haptics', JSON.stringify(this.state));
    } catch {
      // Storage not available
    }
  }

  private vibrate(pattern: number | number[]): void {
    if (!this.isSupported || !this.state.enabled) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Vibration failed silently
    }
  }

  play(pattern: HapticPattern): void {
    if (!this.state.enabled) return;

    switch (pattern) {
      // P0-3 Vocabulary
      case 'tiny':
        this.vibrate(8);
        break;

      case 'soft':
        this.vibrate(15);
        break;

      case 'medium':
        this.vibrate(30);
        break;

      case 'success':
        this.vibrate([25, 40, 35]);
        break;

      case 'rare':
        this.vibrate([40, 30, 50, 25, 70]);
        break;

      // Legacy patterns (mapped to vocabulary)
      case 'tap':
        this.vibrate(10);
        break;

      case 'light':
        this.vibrate(15);
        break;

      case 'heavy':
        this.vibrate(50);
        break;

      case 'reveal':
        // Build-up burst for reveal moment
        this.vibrate([30, 25, 45, 20, 70]);
        break;

      case 'epic':
        // Intense pattern for epic
        this.vibrate([45, 25, 45, 25, 65, 20, 85]);
        break;

      case 'legendary':
        // Grand pattern for legendary
        this.vibrate([55, 30, 55, 30, 70, 25, 90, 20, 110]);
        break;

      case 'reward':
        // Satisfying double tap
        this.vibrate([25, 50, 40]);
        break;

      case 'bond':
        // Warm pulse
        this.vibrate([20, 35, 30]);
        break;

      case 'level_up':
        // Triumphant
        this.vibrate([35, 30, 35, 30, 60]);
        break;

      case 'error':
        // Error buzz
        this.vibrate([80, 40, 80]);
        break;
    }
  }

  // Convenience methods
  tapFeedback(): void {
    this.play('tiny');
  }

  revealFeedback(): void {
    this.play('reveal');
  }

  rarityFeedback(rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'): void {
    switch (rarity) {
      case 'legendary':
        this.play('legendary');
        break;
      case 'epic':
        this.play('epic');
        break;
      case 'rare':
        this.play('rare');
        break;
      case 'uncommon':
        this.play('medium');
        break;
      default:
        this.play('soft');
    }
  }

  rewardFeedback(): void {
    this.play('reward');
  }

  bondFeedback(): void {
    this.play('bond');
  }

  levelUpFeedback(): void {
    this.play('level_up');
  }

  toggle(): boolean {
    this.state.enabled = !this.state.enabled;
    this.saveState();
    return this.state.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.state.enabled = enabled;
    this.saveState();
  }

  get isEnabled(): boolean {
    return this.state.enabled && this.isSupported;
  }

  get hasSupport(): boolean {
    return this.isSupported;
  }
}

export const hapticsManager = new HapticsManager();
export default hapticsManager;
