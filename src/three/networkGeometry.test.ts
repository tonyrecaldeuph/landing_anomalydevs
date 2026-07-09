import { describe, it, expect } from 'vitest';
import { generateNetworkNodes, buildConnections } from './networkGeometry';

describe('generateNetworkNodes', () => {
  it('returns exactly `count` nodes with exactly one marked as anomaly', () => {
    const nodes = generateNetworkNodes(50, 1);
    expect(nodes).toHaveLength(50);
    expect(nodes.filter((n) => n.isAnomaly)).toHaveLength(1);
  });

  it('is deterministic for a given seed', () => {
    const a = generateNetworkNodes(20, 42);
    const b = generateNetworkNodes(20, 42);
    expect(a).toEqual(b);
  });

  it('produces different layouts for different seeds', () => {
    const a = generateNetworkNodes(20, 1);
    const b = generateNetworkNodes(20, 2);
    expect(a).not.toEqual(b);
  });
});

describe('buildConnections', () => {
  it('only connects node pairs within maxDistance, with no self-connections', () => {
    const nodes = [
      { position: [0, 0, 0] as [number, number, number], isAnomaly: false },
      { position: [0.5, 0, 0] as [number, number, number], isAnomaly: false },
      { position: [10, 10, 10] as [number, number, number], isAnomaly: false },
    ];
    const segments = buildConnections(nodes, 1);
    expect(segments).toHaveLength(6);
    expect(Array.from(segments)).toEqual([0, 0, 0, 0.5, 0, 0]);
  });
});
