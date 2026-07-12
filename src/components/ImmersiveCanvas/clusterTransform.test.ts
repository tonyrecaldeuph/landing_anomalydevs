import * as THREE from 'three';
import { describe, it, expect } from 'vitest';
import { applyClusterTransform } from './clusterTransform';
import { SECTIONS } from '../../three/clusterConfig';

describe('applyClusterTransform', () => {
  it('places the mesh at its cluster\'s configured world position', () => {
    const mesh = new THREE.Points();
    applyClusterTransform(mesh, SECTIONS[2]); // services: [4, 0, -4]
    expect(mesh.position.toArray()).toEqual([4, 0, -4]);
  });

  it('gives each of the 6 clusters a distinct world position', () => {
    const positions = SECTIONS.map((config) => {
      const mesh = new THREE.Points();
      applyClusterTransform(mesh, config);
      return mesh.position.toArray().join(',');
    });
    expect(new Set(positions).size).toBe(SECTIONS.length);
  });
});
