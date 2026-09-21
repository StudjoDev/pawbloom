import { describe, it, expect } from 'vitest';
import { 
  ENVIRONMENTS, 
  getEnvironmentById, 
  getEnvironmentForSteps,
  getUnlockedEnvironments 
} from '@/data/environments';

describe('Environment Data', () => {
  it('should have 4 environments', () => {
    expect(ENVIRONMENTS.length).toBe(4);
  });

  it('should have correct environment IDs', () => {
    const ids = ENVIRONMENTS.map(e => e.id);
    expect(ids).toContain('park');
    expect(ids).toContain('city');
    expect(ids).toContain('riverside');
    expect(ids).toContain('beach');
  });

  it('should find environment by ID', () => {
    const park = getEnvironmentById('park');
    expect(park).toBeDefined();
    expect(park?.name).toBe('Sunny Park');
  });

  it('should return undefined for unknown environment', () => {
    const unknown = getEnvironmentById('unknown');
    expect(unknown).toBeUndefined();
  });

  it('should return park for 0 steps', () => {
    const env = getEnvironmentForSteps(0);
    expect(env.id).toBe('park');
  });

  it('should return city for 2000+ steps', () => {
    const env = getEnvironmentForSteps(2000);
    expect(env.id).toBe('city');
  });

  it('should return riverside for 5000+ steps', () => {
    const env = getEnvironmentForSteps(5000);
    expect(env.id).toBe('riverside');
  });

  it('should return beach for 10000+ steps', () => {
    const env = getEnvironmentForSteps(10000);
    expect(env.id).toBe('beach');
  });

  it('should return correct unlocked environments', () => {
    expect(getUnlockedEnvironments(0).length).toBe(1);
    expect(getUnlockedEnvironments(2000).length).toBe(2);
    expect(getUnlockedEnvironments(5000).length).toBe(3);
    expect(getUnlockedEnvironments(10000).length).toBe(4);
  });

  it('should have all required layers for each environment', () => {
    for (const env of ENVIRONMENTS) {
      expect(env.layers.length).toBe(5);
      const layerTypes = env.layers.map(l => l.type);
      expect(layerTypes).toContain('sky');
      expect(layerTypes).toContain('far-bg');
      expect(layerTypes).toContain('mid-bg');
      expect(layerTypes).toContain('ground');
      expect(layerTypes).toContain('foreground');
    }
  });
});
