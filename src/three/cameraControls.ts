import * as THREE from 'three';
import gsap from 'gsap';

export interface CameraControls {
  camera: THREE.PerspectiveCamera;
  update: (aspect: number) => void;
}

export function createCameraControls(): CameraControls {
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 120);
  camera.position.set(0, 0, 6);
  camera.lookAt(0, 0, 0);
  return {
    camera,
    update(aspect: number) {
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    },
  };
}

/** Distance the camera stands off from a cluster's center — comfortably past its particle radius (~2). */
export const CAMERA_STANDOFF = 3.5;

/** Where the camera should fly TO for a given cluster: offset from its center, never landing inside the particle cloud. */
export function getCameraViewpoint(clusterPosition: [number, number, number]): [number, number, number] {
  return [clusterPosition[0], clusterPosition[1], clusterPosition[2] + CAMERA_STANDOFF];
}

/**
 * The camera's "intent": where it stands and what it looks at. Flights tween the rig; each
 * frame the camera is derived from it plus a pointer parallax, so the two never fight.
 */
export interface CameraRig {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

export function createCameraRig(position: [number, number, number], target: [number, number, number]): CameraRig {
  return { position: new THREE.Vector3(...position), target: new THREE.Vector3(...target) };
}

export function flyRigToCluster(rig: CameraRig, clusterPosition: [number, number, number], duration = 1.2): void {
  const [vx, vy, vz] = getCameraViewpoint(clusterPosition);
  const [cx, cy, cz] = clusterPosition;
  gsap.killTweensOf(rig.position);
  gsap.killTweensOf(rig.target);
  gsap.to(rig.position, { x: vx, y: vy, z: vz, duration, ease: 'power3.inOut' });
  gsap.to(rig.target, { x: cx, y: cy, z: cz, duration, ease: 'power3.inOut' });
}

export function applyRig(
  camera: THREE.PerspectiveCamera,
  rig: CameraRig,
  parallax: { x: number; y: number },
  strength: number,
): void {
  camera.position.set(
    rig.position.x + parallax.x * strength,
    rig.position.y + parallax.y * strength,
    rig.position.z,
  );
  camera.lookAt(rig.target);
}
