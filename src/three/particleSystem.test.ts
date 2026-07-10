import { describe, it, expect } from 'vitest';
import { generateParticles, generateAllParticles, getMobileConfig } from './particleSystem';
import { SECTIONS } from './clusterConfig';

describe('generateParticles', () => {
  it('generates correct number of particles for each section', () => {
    SECTIONS.forEach((config) => {
      const actual = generateParticles(config);
      expect(actual.positions).toHaveLength(config.count * 3);
      expect(actual.colors).toHaveLength(config.count * 3);
      expect(actual.sizes).toHaveLength(config.count);
    });
  });

  it('is deterministic for a given config', () => {
    const a = generateParticles(SECTIONS[0]);
    const b = generateParticles(SECTIONS[0]);
    expect(a.positions).toEqual(b.positions);
  });
});

describe('getMobileConfig', () => {
  it('caps particle count at 5000', () => {
    const mobile = getMobileConfig();
    mobile.forEach((c) => {
      expect(c.count).toBeLessThanOrEqual(5000);
    });
  });
});
