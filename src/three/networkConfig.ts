export interface NetworkConfig {
  nodeCount: number;
  allowDrag: boolean;
}

export function getNetworkConfig(isMobile: boolean): NetworkConfig {
  return isMobile ? { nodeCount: 150, allowDrag: false } : { nodeCount: 400, allowDrag: true };
}
