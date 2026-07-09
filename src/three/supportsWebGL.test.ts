import { describe, it, expect } from 'vitest';
import { supportsWebGL } from './supportsWebGL';

describe('supportsWebGL', () => {
  it('returns false under jsdom (no real WebGL context available)', () => {
    expect(supportsWebGL()).toBe(false);
  });
});
