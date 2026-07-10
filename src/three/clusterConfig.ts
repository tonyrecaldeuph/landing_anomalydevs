export type ClusterShape = 'sphere' | 'ring' | 'subclusters' | 'grid' | 'orbit' | 'spiral';

export interface ClusterConfig {
  id: string;
  label: string;
  shape: ClusterShape;
  color: string;
  seed: number;
  count: number;
  position: [number, number, number];
  subClusterCount?: number;
  subClusterSeeds?: number[];
}

export const SECTIONS: ClusterConfig[] = [
  { id: 'hero', label: 'Hero', shape: 'sphere', color: '#33FF77', seed: 1, count: 15000, position: [0, 0, 0] },
  { id: 'manifesto', label: 'Manifiesto', shape: 'ring', color: '#9DFFC0', seed: 2, count: 8000, position: [0, 4, -4] },
  { id: 'services', label: 'Servicios', shape: 'subclusters', color: '#CFFFE0', seed: 3, count: 3000, position: [4, 0, -4], subClusterCount: 4, subClusterSeeds: [3, 4, 5, 6] },
  { id: 'projects', label: 'Proyectos', shape: 'grid', color: '#1C6B3A', seed: 7, count: 6000, position: [-4, 0, -4] },
  { id: 'testimonials', label: 'Testimonios', shape: 'orbit', color: '#8FA898', seed: 8, count: 4000, position: [0, -4, -4] },
  { id: 'contact', label: 'Contacto', shape: 'spiral', color: '#33FF77', seed: 9, count: 5000, position: [0, 0, -8] },
];

export function getClusterConfig(index: number): ClusterConfig {
  return SECTIONS[index];
}
