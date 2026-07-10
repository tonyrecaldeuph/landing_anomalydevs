import * as THREE from 'three';
import { generateParticles } from '../../three/particleSystem';
import { SECTIONS, ClusterConfig } from '../../three/clusterConfig';
import { createCameraControls, CameraControls, flyToCluster } from '../../three/cameraControls';

export type SceneState = 'entering' | 'idle' | 'transitioning';

export interface ParticleSceneAPI {
  domElement: HTMLCanvasElement;
  setActiveCluster: (index: number) => void;
  startEnter: () => void;
  dispose: () => void;
  resize: () => void;
}

function createNoopScene(): ParticleSceneAPI {
  const canvas = document.createElement('canvas');
  canvas.width = 0;
  canvas.height = 0;
  return {
    domElement: canvas,
    setActiveCluster: () => {},
    startEnter: () => {},
    dispose: () => {},
    resize: () => {},
  };
}

export function createParticleScene(isMobile: boolean, reducedMotion: boolean): ParticleSceneAPI {
  const cameraControls: CameraControls = createCameraControls();
  const { camera } = cameraControls;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    });
  } catch {
    return createNoopScene();
  }
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setClearColor(0x060a07);

  const scene = new THREE.Scene();

  const configs = isMobile
    ? SECTIONS.map((s) => ({ ...s, count: Math.min(s.count, 5000) }))
    : SECTIONS;

  const clusters: {
    mesh: THREE.Points;
    config: ClusterConfig;
    basePositions: Float32Array;
    phase: number;
  }[] = [];

  let currentCluster = 0;
  let state: SceneState = 'entering';
  let animFrame = 0;
  let rafId = 0;

  function buildCluster(config: ClusterConfig) {
    const data = generateParticles(config);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(data.colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(data.sizes, 1));

    const material = new THREE.PointsMaterial({
      size: isMobile ? 0.05 : 0.03,
      vertexColors: true,
      transparent: true,
      opacity: reducedMotion ? 1 : 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const mesh = new THREE.Points(geometry, material);
    scene.add(mesh);
    return { mesh, config, basePositions: data.positions, phase: Math.random() * Math.PI * 2 };
  }

  configs.forEach((cfg) => clusters.push(buildCluster(cfg)));

  function animate() {
    rafId = requestAnimationFrame(animate);
    animFrame++;

    clusters.forEach((cluster, i) => {
      const mat = cluster.mesh.material as THREE.PointsMaterial;
      if (i !== currentCluster && state === 'idle') {
        mat.opacity = 0.15;
      } else if (i === currentCluster) {
        mat.opacity = reducedMotion ? 1 : 0.8;
      }

      const positions = cluster.mesh.geometry.attributes.position.array as Float32Array;
      const base = cluster.basePositions;
      const speed = 0.002;
      const amp = isMobile ? 0.02 : 0.04;

      for (let j = 0; j < positions.length; j++) {
        positions[j] = base[j] + Math.sin(animFrame * speed + j * 0.1 + cluster.phase) * amp;
      }
      cluster.mesh.geometry.attributes.position.needsUpdate = true;
    });

    renderer.render(scene, camera);
  }

  animate();

  return {
    domElement: renderer.domElement,
    setActiveCluster(index: number) {
      if (index === currentCluster) return;
      currentCluster = index;
      state = 'transitioning';
      const target = configs[index].position;
      flyToCluster(camera, target);
    },
    startEnter() {
      state = 'entering';
      flyToCluster(camera, configs[0].position, 1.5);
      setTimeout(() => { state = 'idle'; }, 1600);
    },
    dispose() {
      cancelAnimationFrame(rafId);
      clusters.forEach((c) => {
        c.mesh.geometry.dispose();
        (c.mesh.material as THREE.Material).dispose();
      });
      renderer.dispose();
    },
    resize() {
      cameraControls.update(window.innerWidth / window.innerHeight);
      renderer.setSize(window.innerWidth, window.innerHeight);
    },
  };
}
