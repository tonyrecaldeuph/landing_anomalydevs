import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';

vi.mock('gsap', () => ({ default: { to: vi.fn(() => ({})) } }));

const gsap = (await import('gsap')).default;
const { createCameraControls, flyToCluster, getCameraViewpoint, CAMERA_STANDOFF } = await import(
  './cameraControls'
);

describe('cameraControls', () => {
  it('creates a perspective camera', () => {
    const controls = createCameraControls();
    expect(controls.camera).toBeInstanceOf(THREE.PerspectiveCamera);
  });
});

describe('getCameraViewpoint', () => {
  it('stands off from the cluster center along z, so the camera never lands inside the particle cloud', () => {
    expect(getCameraViewpoint([4, 0, -4])).toEqual([4, 0, -4 + CAMERA_STANDOFF]);
  });

  it('the standoff is comfortably larger than a cluster radius (~2), to keep particles out of point-blank range', () => {
    expect(CAMERA_STANDOFF).toBeGreaterThan(2.5);
  });
});

describe('flyToCluster', () => {
  it('looks at the actual cluster position, not the standoff viewpoint it flies to', () => {
    const camera = new THREE.PerspectiveCamera();
    const lookAtSpy = vi.spyOn(camera, 'lookAt');

    flyToCluster(camera, [4, 0, -4]);

    const calls = (gsap.to as unknown as { mock: { calls: unknown[][] } }).mock.calls;
    const [, vars] = calls[calls.length - 1] as [unknown, { onUpdate: () => void }];
    vars.onUpdate();

    expect(lookAtSpy).toHaveBeenCalledWith(4, 0, -4);
  });

  it('animates the camera position to a standoff viewpoint, not directly onto the cluster center', () => {
    const camera = new THREE.PerspectiveCamera();
    flyToCluster(camera, [1, 2, 3], 0.8);

    const calls2 = (gsap.to as unknown as { mock: { calls: unknown[][] } }).mock.calls;
    const [target, vars] = calls2[calls2.length - 1] as [
      THREE.Vector3,
      { x: number; y: number; z: number; duration: number },
    ];

    expect(target).toBe(camera.position);
    expect(vars).toMatchObject({ x: 1, y: 2, z: 3 + CAMERA_STANDOFF, duration: 0.8 });
  });
});
