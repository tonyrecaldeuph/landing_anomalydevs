import { describe, it, expect } from 'vitest';
import { generateParticles, getMobileConfig } from './particleSystem';
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

describe('hero orb', () => {
  it('keeps every particle well inside the camera standoff so the orb reads as a framed shape', async () => {
    const { CAMERA_STANDOFF } = await import('./cameraControls');
    const hero = generateParticles(SECTIONS[0]);
    let maxR = 0;
    for (let i = 0; i < SECTIONS[0].count; i++) {
      maxR = Math.max(maxR, Math.hypot(hero.positions[i * 3], hero.positions[i * 3 + 1], hero.positions[i * 3 + 2]));
    }
    expect(maxR).toBeLessThanOrEqual(CAMERA_STANDOFF * 0.4);
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

describe('generateStarfield', () => {
  it('places every star on a far shell, well beyond the cluster volume', async () => {
    const { generateStarfield } = await import('./particleSystem');
    const stars = generateStarfield(500, 3);
    expect(stars.positions).toHaveLength(1500);
    expect(stars.sizes).toHaveLength(500);
    for (let i = 0; i < 500; i++) {
      const r = Math.hypot(stars.positions[i * 3], stars.positions[i * 3 + 1], stars.positions[i * 3 + 2]);
      expect(r).toBeGreaterThanOrEqual(18);
      expect(r).toBeLessThanOrEqual(45);
    }
  });
});
