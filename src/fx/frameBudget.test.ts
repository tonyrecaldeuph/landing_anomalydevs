import { describe, it, expect } from 'vitest';
import { createFrameBudget } from './frameBudget';

describe('createFrameBudget', () => {
  it('stays pending until it has seen a full window of frames', () => {
    const budget = createFrameBudget({ windowFrames: 3, minFps: 40 });
    expect(budget.sample(16)).toBe('pending');
    expect(budget.sample(16)).toBe('pending');
  });

  it('reports ok when the average frame rate meets the minimum', () => {
    const budget = createFrameBudget({ windowFrames: 3, minFps: 40 });
    budget.sample(16);
    budget.sample(17);
    expect(budget.sample(18)).toBe('ok');
  });

  it('reports degrade when the average frame rate falls below the minimum', () => {
    const budget = createFrameBudget({ windowFrames: 3, minFps: 40 });
    budget.sample(40);
    budget.sample(45);
    expect(budget.sample(50)).toBe('degrade');
  });

  it('decides once: later samples repeat the first verdict', () => {
    const budget = createFrameBudget({ windowFrames: 2, minFps: 40 });
    budget.sample(100);
    expect(budget.sample(100)).toBe('degrade');
    expect(budget.sample(5)).toBe('degrade');
  });
});
