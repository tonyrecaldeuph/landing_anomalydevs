import { describe, it, expect } from 'vitest';
import { getClusterConfig, SECTIONS } from './clusterConfig';

describe('clusterConfig', () => {
  it('defines config for all 6 sections', () => {
    expect(SECTIONS).toHaveLength(6);
  });

  it('getClusterConfig returns correct config for each index', () => {
    SECTIONS.forEach((section, i) => {
      const config = getClusterConfig(i);
      expect(config.shape).toBe(section.shape);
      expect(config.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(config.seed).toBeTypeOf('number');
      expect(config.count).toBeGreaterThan(0);
    });
  });
});
