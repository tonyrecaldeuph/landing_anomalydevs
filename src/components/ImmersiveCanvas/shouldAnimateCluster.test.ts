import { describe, it, expect } from 'vitest';
import { shouldAnimateCluster } from './shouldAnimateCluster';

describe('shouldAnimateCluster', () => {
  it('animates only the currently active cluster', () => {
    expect(shouldAnimateCluster(2, 2)).toBe(true);
  });

  it('does not animate clusters other than the active one', () => {
    expect(shouldAnimateCluster(0, 2)).toBe(false);
    expect(shouldAnimateCluster(5, 2)).toBe(false);
  });
});
