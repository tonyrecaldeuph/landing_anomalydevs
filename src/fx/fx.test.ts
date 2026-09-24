import { describe, it, expect } from 'vitest';
import { scrambleFrame } from './scramble';
import { computeTilt } from './tilt';
import { parseStat, formatStat } from './stat';
import { bootProgress, visibleBootLines, BOOT_LINES } from './boot';
import { lerp, pointerToNdc } from './pointer';
import { sectionReadout } from './readout';

describe('scrambleFrame', () => {
  const glyph = () => '#';

  it('at progress 0 hides every non-space character behind a glyph', () => {
    expect(scrambleFrame('AB CD', 0, glyph)).toBe('## ##');
  });

  it('at progress 1 returns the final text untouched', () => {
    expect(scrambleFrame('AB CD', 1, glyph)).toBe('AB CD');
  });

  it('reveals characters left to right proportionally to progress', () => {
    expect(scrambleFrame('ABCD', 0.5, glyph)).toBe('AB##');
  });

  it('clamps progress outside [0, 1]', () => {
    expect(scrambleFrame('AB', -3, glyph)).toBe('##');
    expect(scrambleFrame('AB', 7, glyph)).toBe('AB');
  });
});

describe('computeTilt', () => {
  const rect = { left: 0, top: 0, width: 200, height: 100 };

  it('is flat with the glare centered when the pointer is at the center', () => {
    const t = computeTilt(rect, 100, 50, 10);
    expect(t.rotateX).toBeCloseTo(0);
    expect(t.rotateY).toBeCloseTo(0);
    expect(t.glareX).toBeCloseTo(50);
    expect(t.glareY).toBeCloseTo(50);
  });

  it('tilts toward the pointer up to maxDeg at the edges', () => {
    const t = computeTilt(rect, 200, 0, 10);
    expect(t.rotateY).toBeCloseTo(10);
    expect(t.rotateX).toBeCloseTo(10);
  });

  it('clamps pointers outside the card', () => {
    const t = computeTilt(rect, -500, 900, 10);
    expect(t.rotateY).toBeCloseTo(-10);
    expect(t.rotateX).toBeCloseTo(-10);
    expect(t.glareX).toBe(0);
    expect(t.glareY).toBe(100);
  });

  it('returns a flat tilt for a zero-size rect instead of NaN', () => {
    const t = computeTilt({ left: 0, top: 0, width: 0, height: 0 }, 10, 10, 10);
    expect(t).toEqual({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  });
});

describe('parseStat / formatStat', () => {
  it('splits prefix, numeric value and suffix', () => {
    expect(parseStat('+30')).toEqual({ prefix: '+', value: 30, suffix: '' });
    expect(parseStat('100%')).toEqual({ prefix: '', value: 100, suffix: '%' });
    expect(parseStat('5')).toEqual({ prefix: '', value: 5, suffix: '' });
  });

  it('treats non-numeric stats as a static suffix with value 0', () => {
    expect(parseStat('LATAM')).toEqual({ prefix: '', value: 0, suffix: 'LATAM' });
  });

  it('formats the eased count at a given progress', () => {
    const stat = parseStat('+30');
    expect(formatStat(stat, 0)).toBe('+0');
    expect(formatStat(stat, 1)).toBe('+30');
    expect(Number(formatStat(stat, 0.5).slice(1))).toBeGreaterThan(15);
  });
});

describe('boot sequence', () => {
  it('progress goes 0 → 100 and clamps', () => {
    expect(bootProgress(0, 1000)).toBe(0);
    expect(bootProgress(500, 1000)).toBe(50);
    expect(bootProgress(5000, 1000)).toBe(100);
  });

  it('reveals boot lines as progress advances, all of them at 100', () => {
    expect(visibleBootLines(0)).toHaveLength(0);
    expect(visibleBootLines(100)).toHaveLength(BOOT_LINES.length);
    expect(visibleBootLines(50).length).toBeGreaterThan(0);
    expect(visibleBootLines(50).length).toBeLessThan(BOOT_LINES.length);
  });
});

describe('pointer helpers', () => {
  it('lerp interpolates linearly', () => {
    expect(lerp(0, 10, 0.25)).toBe(2.5);
  });

  it('maps viewport pixels to normalized device coordinates', () => {
    expect(pointerToNdc(0, 0, 200, 100)).toEqual({ x: -1, y: 1 });
    expect(pointerToNdc(200, 100, 200, 100)).toEqual({ x: 1, y: -1 });
    expect(pointerToNdc(100, 50, 200, 100)).toEqual({ x: 0, y: 0 });
  });

  it('returns the center for a zero-size viewport', () => {
    expect(pointerToNdc(5, 5, 0, 0)).toEqual({ x: 0, y: 0 });
  });
});

describe('sectionReadout', () => {
  it('pads index and total and upper-cases the label', () => {
    expect(sectionReadout(3, 6, 'Proyectos')).toBe('SEC 04/06 · PROYECTOS');
  });
});
