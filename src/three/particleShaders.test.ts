import { describe, it, expect } from 'vitest';
import { PARTICLE_VERTEX_SHADER, PARTICLE_FRAGMENT_SHADER, createParticleUniforms } from './particleShaders';
import { buildRandoms } from './particleSystem';

describe('particle shader contract', () => {
  const uniforms = createParticleUniforms({ pixelRatio: 2, size: 400 });

  it('every uniform the vertex shader declares exists in the uniforms factory', () => {
    const declared = [...PARTICLE_VERTEX_SHADER.matchAll(/uniform\s+\w+\s+(\w+);/g)].map((m) => m[1]);
    expect(declared.length).toBeGreaterThan(0);
    declared.forEach((name) => expect(uniforms).toHaveProperty(name));
  });

  it('every uniform the fragment shader declares exists in the uniforms factory', () => {
    const declared = [...PARTICLE_FRAGMENT_SHADER.matchAll(/uniform\s+\w+\s+(\w+);/g)].map((m) => m[1]);
    declared.forEach((name) => expect(uniforms).toHaveProperty(name));
  });

  it('starts scattered (uAssemble 0) and with the pointer inactive', () => {
    expect(uniforms.uAssemble.value).toBe(0);
    expect(uniforms.uPointerActive.value).toBe(0);
    expect(uniforms.uPixelRatio.value).toBe(2);
    expect(uniforms.uSize.value).toBe(400);
  });
});

describe('buildRandoms', () => {
  it('returns one deterministic value in [0, 1) per particle', () => {
    const a = buildRandoms(100, 7);
    const b = buildRandoms(100, 7);
    expect(a).toHaveLength(100);
    expect(Array.from(a)).toEqual(Array.from(b));
    a.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    });
  });
});
