import * as THREE from 'three';
import gsap from 'gsap';

export interface CameraControls {
  camera: THREE.PerspectiveCamera;
  update: (aspect: number) => void;
}

export function createCameraControls(): CameraControls {
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
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

export function flyToCluster(
  camera: THREE.PerspectiveCamera,
  clusterPosition: [number, number, number],
  duration = 1.2,
): gsap.core.Tween {
  const viewpoint = getCameraViewpoint(clusterPosition);
  return gsap.to(camera.position, {
    x: viewpoint[0],
    y: viewpoint[1],
    z: viewpoint[2],
    duration,
    ease: 'power3.inOut',
    onUpdate: () => camera.lookAt(clusterPosition[0], clusterPosition[1], clusterPosition[2]),
  });
}
