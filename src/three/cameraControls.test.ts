import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createCameraControls } from './cameraControls';

describe('cameraControls', () => {
  it('creates a perspective camera', () => {
    const controls = createCameraControls();
    expect(controls.camera).toBeInstanceOf(THREE.PerspectiveCamera);
  });
});
