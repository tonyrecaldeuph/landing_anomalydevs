import * as THREE from 'three';
import { ClusterConfig, SECTIONS } from './clusterConfig';

export interface ParticleData {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateSphere(config: ClusterConfig): ParticleData {
  const rand = seededRandom(config.seed);
  const positions = new Float32Array(config.count * 3);
  const colors = new Float32Array(config.count * 3);
  const sizes = new Float32Array(config.count);
  const color = new THREE.Color(config.color);

  for (let i = 0; i < config.count; i++) {
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    const r = 1.5 + rand() * 0.8;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    color.toArray(colors, i * 3);
    sizes[i] = 0.02 + rand() * 0.04;
  }
  return { positions, colors, sizes };
}

function generateRing(config: ClusterConfig): ParticleData {
  const rand = seededRandom(config.seed);
  const positions = new Float32Array(config.count * 3);
  const colors = new Float32Array(config.count * 3);
  const sizes = new Float32Array(config.count);
  const color = new THREE.Color(config.color);

  for (let i = 0; i < config.count; i++) {
    const theta = rand() * Math.PI * 2;
    const r = 2 + rand() * 0.3;
    const spread = (rand() - 0.5) * 0.3;
    positions[i * 3] = r * Math.cos(theta);
    positions[i * 3 + 1] = spread;
    positions[i * 3 + 2] = r * Math.sin(theta);
    color.toArray(colors, i * 3);
    sizes[i] = 0.02 + rand() * 0.03;
  }
  return { positions, colors, sizes };
}

function generateSubclusters(config: ClusterConfig): ParticleData {
  const clusterPositions: [number, number, number][] = [
    [-0.8, 0.8, 0], [0.8, 0.8, 0], [-0.8, -0.8, 0], [0.8, -0.8, 0],
  ];
  const perCluster = Math.floor(config.count / (config.subClusterCount || 1));
  const total = perCluster * (config.subClusterCount || 1);
  const positions = new Float32Array(total * 3);
  const colors = new Float32Array(total * 3);
  const sizes = new Float32Array(total);
  const color = new THREE.Color(config.color);

  for (let c = 0; c < (config.subClusterCount || 1); c++) {
    const seed = config.subClusterSeeds?.[c] ?? config.seed + c;
    const rand = seededRandom(seed);
    const [cx, cy, cz] = clusterPositions[c];
    for (let i = 0; i < perCluster; i++) {
      const idx = c * perCluster + i;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const r = 0.5 + rand() * 0.3;
      positions[idx * 3] = cx + r * Math.sin(phi) * Math.cos(theta);
      positions[idx * 3 + 1] = cy + r * Math.cos(phi);
      positions[idx * 3 + 2] = cz + r * Math.sin(phi);
      color.toArray(colors, idx * 3);
      sizes[idx] = 0.02 + rand() * 0.03;
    }
  }
  return { positions, colors, sizes };
}

function generateGrid(config: ClusterConfig): ParticleData {
  const rand = seededRandom(config.seed);
  const positions = new Float32Array(config.count * 3);
  const colors = new Float32Array(config.count * 3);
  const sizes = new Float32Array(config.count);
  const color = new THREE.Color(config.color);
  const cols = Math.ceil(Math.sqrt(config.count));
  const spacing = 0.25;

  for (let i = 0; i < config.count; i++) {
    const x = (i % cols) * spacing - (cols * spacing) / 2;
    const y = Math.floor(i / cols) * spacing - (cols * spacing) / 2;
    const z = (rand() - 0.5) * 0.3;
    positions[i * 3] = x + (rand() - 0.5) * 0.05;
    positions[i * 3 + 1] = y + (rand() - 0.5) * 0.05;
    positions[i * 3 + 2] = z;
    color.toArray(colors, i * 3);
    sizes[i] = 0.02 + rand() * 0.02;
  }
  return { positions, colors, sizes };
}

function generateOrbit(config: ClusterConfig): ParticleData {
  const rand = seededRandom(config.seed);
  const positions = new Float32Array(config.count * 3);
  const colors = new Float32Array(config.count * 3);
  const sizes = new Float32Array(config.count);
  const color = new THREE.Color(config.color);

  for (let i = 0; i < config.count; i++) {
    const theta = rand() * Math.PI * 2;
    const rx = 1.8 + rand() * 0.4;
    const rz = 1.2 + rand() * 0.3;
    positions[i * 3] = rx * Math.cos(theta);
    positions[i * 3 + 1] = (rand() - 0.5) * 0.4;
    positions[i * 3 + 2] = rz * Math.sin(theta);
    color.toArray(colors, i * 3);
    sizes[i] = 0.02 + rand() * 0.03;
  }
  return { positions, colors, sizes };
}

function generateSpiral(config: ClusterConfig): ParticleData {
  const rand = seededRandom(config.seed);
  const positions = new Float32Array(config.count * 3);
  const colors = new Float32Array(config.count * 3);
  const sizes = new Float32Array(config.count);
  const color = new THREE.Color(config.color);

  for (let i = 0; i < config.count; i++) {
    const t = i / config.count;
    const theta = t * Math.PI * 6;
    const r = t * 1.5;
    positions[i * 3] = r * Math.cos(theta) + (rand() - 0.5) * 0.1;
    positions[i * 3 + 1] = (rand() - 0.5) * 0.2;
    positions[i * 3 + 2] = r * Math.sin(theta) + (rand() - 0.5) * 0.1;
    color.toArray(colors, i * 3);
    sizes[i] = 0.03 * (1 - t * 0.5) + (rand() - 0.5) * 0.01;
  }
  return { positions, colors, sizes };
}

const generators: Record<string, (config: ClusterConfig) => ParticleData> = {
  sphere: generateSphere,
  ring: generateRing,
  subclusters: generateSubclusters,
  grid: generateGrid,
  orbit: generateOrbit,
  spiral: generateSpiral,
};

export function generateParticles(config: ClusterConfig): ParticleData {
  return generators[config.shape](config);
}

export function generateAllParticles(count: number): ParticleData[] {
  return SECTIONS.slice(0, count).map(generateParticles);
}

export function getMobileConfig(): ClusterConfig[] {
  return SECTIONS.map((s) => ({
    ...s,
    count: Math.min(s.count, 5000),
    subClusterCount: s.subClusterCount ? Math.min(s.subClusterCount, 2) : undefined,
    subClusterSeeds: s.subClusterSeeds?.slice(0, 2),
  }));
}
