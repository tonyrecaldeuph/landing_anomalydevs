import { describe, it, expect } from 'vitest';
import { getNetworkConfig } from './networkConfig';

describe('getNetworkConfig', () => {
  it('reduces node count and disables drag on mobile', () => {
    expect(getNetworkConfig(true)).toEqual({ nodeCount: 150, allowDrag: false });
  });

  it('uses full node count and allows drag on desktop', () => {
    expect(getNetworkConfig(false)).toEqual({ nodeCount: 400, allowDrag: true });
  });
});
