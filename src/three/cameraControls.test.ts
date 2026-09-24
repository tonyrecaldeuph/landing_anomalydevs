import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';

vi.mock('gsap', () => ({ default: { to: vi.fn(() => ({})), killTweensOf: vi.fn() } }));

const gsap = (await import('gsap')).default;
const { createCameraControls, getCameraViewpoint, CAMERA_STANDOFF, createCameraRig, flyRigToCluster, applyRig } =
  await import('./cameraControls');

type ToCalls = { mock: { calls: unknown[][] } };

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

describe('flyRigToCluster', () => {
  it('tweens the rig position to the standoff viewpoint and its target to the cluster center', () => {
    const rig = createCameraRig([0, 0, 20], [0, 0, 0]);
    flyRigToCluster(rig, [1, 2, 3], 0.8);

    const calls = (gsap.to as unknown as ToCalls).mock.calls;
    const [posTarget, posVars] = calls[calls.length - 2] as [THREE.Vector3, Record<string, number>];
    const [lookTarget, lookVars] = calls[calls.length - 1] as [THREE.Vector3, Record<string, number>];

    expect(posTarget).toBe(rig.position);
    expect(posVars).toMatchObject({ x: 1, y: 2, z: 3 + CAMERA_STANDOFF, duration: 0.8 });
    expect(lookTarget).toBe(rig.target);
    expect(lookVars).toMatchObject({ x: 1, y: 2, z: 3, duration: 0.8 });
  });
});

describe('applyRig', () => {
  it('places the camera at the rig position plus the parallax offset and looks at the rig target', () => {
    const camera = new THREE.PerspectiveCamera();
    const lookAtSpy = vi.spyOn(camera, 'lookAt');
    const rig = createCameraRig([1, 1, 5], [1, 1, 0]);

    applyRig(camera, rig, { x: 0.5, y: -1 }, 0.4);

    expect(camera.position.x).toBeCloseTo(1.2);
    expect(camera.position.y).toBeCloseTo(0.6);
    expect(camera.position.z).toBeCloseTo(5);
    expect(lookAtSpy).toHaveBeenCalledWith(rig.target);
  });
});
