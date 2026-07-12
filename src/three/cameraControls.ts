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

export function flyToCluster(
  camera: THREE.PerspectiveCamera,
  targetPosition: [number, number, number],
  duration = 1.2,
): gsap.core.Tween {
  return gsap.to(camera.position, {
    x: targetPosition[0],
    y: targetPosition[1],
    z: targetPosition[2],
    duration,
    ease: 'power3.inOut',
    onUpdate: () => camera.lookAt(targetPosition[0], targetPosition[1], targetPosition[2]),
  });
}
