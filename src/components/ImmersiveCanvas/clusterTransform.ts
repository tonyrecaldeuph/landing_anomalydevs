import * as THREE from 'three';
import { ClusterConfig } from '../../three/clusterConfig';

/** Places a cluster's mesh at its configured world position, so distinct clusters occupy distinct space. */
export function applyClusterTransform(mesh: THREE.Object3D, config: ClusterConfig): void {
  mesh.position.set(config.position[0], config.position[1], config.position[2]);
}
