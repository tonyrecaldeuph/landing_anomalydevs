export interface NetworkNode {
  position: [number, number, number];
  isAnomaly: boolean;
}

export function generateNetworkNodes(count: number, seed = 1): NetworkNode[] {
  let s = seed;
  function rand() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  }
  const nodes: NetworkNode[] = [];
  for (let i = 0; i < count; i++) {
    nodes.push({
      position: [(rand() - 0.5) * 10, (rand() - 0.5) * 10, (rand() - 0.5) * 10],
      isAnomaly: false,
    });
  }
  const anomalyIndex = Math.floor(count / 2);
  nodes[anomalyIndex].isAnomaly = true;
  return nodes;
}

export function buildConnections(nodes: NetworkNode[], maxDistance: number): Float32Array {
  const segments: number[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const [x1, y1, z1] = nodes[i].position;
      const [x2, y2, z2] = nodes[j].position;
      const distance = Math.hypot(x1 - x2, y1 - y2, z1 - z2);
      if (distance < maxDistance) {
        segments.push(x1, y1, z1, x2, y2, z2);
      }
    }
  }
  return new Float32Array(segments);
}
