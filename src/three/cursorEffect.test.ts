import { describe, it, expect } from 'vitest';
import { stepRing } from './cursorEffect';

describe('stepRing', () => {
  const pointer = { x: 100, y: 50, hovering: true, hoveringCTA: false };

  it('eases the ring toward the pointer without jumping onto it', () => {
    const next = stepRing({ x: 0, y: 0, radius: 16 }, pointer);
    expect(next.x).toBeGreaterThan(0);
    expect(next.x).toBeLessThan(100);
    expect(next.y).toBeGreaterThan(0);
    expect(next.y).toBeLessThan(50);
  });

  it('grows the ring over calls to action', () => {
    const next = stepRing({ x: 100, y: 50, radius: 16 }, { ...pointer, hoveringCTA: true });
    expect(next.radius).toBeGreaterThan(16);
  });
});
