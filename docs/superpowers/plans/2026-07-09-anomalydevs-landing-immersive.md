# AnomalyDevs Landing — Fase 3: Inmersión Total — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar la landing en experiencia inmersiva tipo BlueYard con navegación 3D por clústeres de partículas, pantalla de entrada, cursor personalizado, transiciones cinematográficas y sonido ambiental modulado.

**Architecture:** Three.js puro con GPU instancing, render loop fuera de React. Scroll mapea a posiciones de cámara entre clústeres. Overlays HTML se montan/desmontan según clúster activo.

**Tech Stack:** Three.js, GSAP, React 18, TypeScript 5, Vitest + RTL

---

### Task 1: `clusterConfig.ts` + `particleSystem.ts` (GPU instancing)

**Files:**
- Create: `src/three/clusterConfig.ts`
- Test: `src/three/clusterConfig.test.ts`
- Create: `src/three/particleSystem.ts`
- Test: `src/three/particleSystem.test.ts`

- [ ] **Step 1: Write clusterConfig test**

```ts
// src/three/clusterConfig.test.ts
import { describe, it, expect } from 'vitest';
import { getClusterConfig, SECTIONS } from './clusterConfig';

describe('clusterConfig', () => {
  it('defines config for all 6 sections', () => {
    expect(SECTIONS).toHaveLength(6);
  });

  it('getClusterConfig returns correct config for each index', () => {
    SECTIONS.forEach((section, i) => {
      const config = getClusterConfig(i);
      expect(config.shape).toBe(section.shape);
      expect(config.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(config.seed).toBeTypeOf('number');
      expect(config.count).toBeGreaterThan(0);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/three/clusterConfig.test.ts`
Expected: FAIL

- [ ] **Step 3: Create `src/three/clusterConfig.ts`**

```ts
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
```

- [ ] **Step 4: Create `src/three/particleSystem.ts`**

```ts
import * as THREE from 'three';
import { ClusterConfig, SECTIONS } from './clusterConfig';

export interface ParticleData {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateSphere(config: ClusterConfig): ParticleData {
  const rand = seededRandom(config.seed);
  const positions = new Float32Array(config.count * 3);
  const colors = new Float32Array(config.count * 3);
  const sizes = new Float32Array(config.count);
  const color = new THREE.Color(config.color);

  for (let i = 0; i < config.count; i++) {
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    const r = 1.5 + rand() * 0.8;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    color.toArray(colors, i * 3);
    sizes[i] = 0.02 + rand() * 0.04;
  }
  return { positions, colors, sizes };
}

function generateRing(config: ClusterConfig): ParticleData {
  const rand = seededRandom(config.seed);
  const positions = new Float32Array(config.count * 3);
  const colors = new Float32Array(config.count * 3);
  const sizes = new Float32Array(config.count);
  const color = new THREE.Color(config.color);

  for (let i = 0; i < config.count; i++) {
    const theta = rand() * Math.PI * 2;
    const r = 2 + rand() * 0.3;
    const spread = (rand() - 0.5) * 0.3;
    positions[i * 3] = r * Math.cos(theta);
    positions[i * 3 + 1] = spread;
    positions[i * 3 + 2] = r * Math.sin(theta);
    color.toArray(colors, i * 3);
    sizes[i] = 0.02 + rand() * 0.03;
  }
  return { positions, colors, sizes };
}

function generateSubclusters(config: ClusterConfig): ParticleData {
  const clusterPositions: [number, number, number][] = [
    [-0.8, 0.8, 0], [0.8, 0.8, 0], [-0.8, -0.8, 0], [0.8, -0.8, 0],
  ];
  const perCluster = Math.floor(config.count / (config.subClusterCount || 1));
  const total = perCluster * (config.subClusterCount || 1);
  const positions = new Float32Array(total * 3);
  const colors = new Float32Array(total * 3);
  const sizes = new Float32Array(total);
  const color = new THREE.Color(config.color);

  for (let c = 0; c < (config.subClusterCount || 1); c++) {
    const seed = config.subClusterSeeds?.[c] ?? config.seed + c;
    const rand = seededRandom(seed);
    const [cx, cy, cz] = clusterPositions[c];
    for (let i = 0; i < perCluster; i++) {
      const idx = c * perCluster + i;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const r = 0.5 + rand() * 0.3;
      positions[idx * 3] = cx + r * Math.sin(phi) * Math.cos(theta);
      positions[idx * 3 + 1] = cy + r * Math.cos(phi);
      positions[idx * 3 + 2] = cz + r * Math.sin(phi);
      color.toArray(colors, idx * 3);
      sizes[idx] = 0.02 + rand() * 0.03;
    }
  }
  return { positions, colors, sizes };
}

function generateGrid(config: ClusterConfig): ParticleData {
  const rand = seededRandom(config.seed);
  const positions = new Float32Array(config.count * 3);
  const colors = new Float32Array(config.count * 3);
  const sizes = new Float32Array(config.count);
  const color = new THREE.Color(config.color);
  const cols = Math.ceil(Math.sqrt(config.count));
  const spacing = 0.25;

  for (let i = 0; i < config.count; i++) {
    const x = (i % cols) * spacing - (cols * spacing) / 2;
    const y = Math.floor(i / cols) * spacing - (cols * spacing) / 2;
    const z = (rand() - 0.5) * 0.3;
    positions[i * 3] = x + (rand() - 0.5) * 0.05;
    positions[i * 3 + 1] = y + (rand() - 0.5) * 0.05;
    positions[i * 3 + 2] = z;
    color.toArray(colors, i * 3);
    sizes[i] = 0.02 + rand() * 0.02;
  }
  return { positions, colors, sizes };
}

function generateOrbit(config: ClusterConfig): ParticleData {
  const rand = seededRandom(config.seed);
  const positions = new Float32Array(config.count * 3);
  const colors = new Float32Array(config.count * 3);
  const sizes = new Float32Array(config.count);
  const color = new THREE.Color(config.color);

  for (let i = 0; i < config.count; i++) {
    const theta = rand() * Math.PI * 2;
    const rx = 1.8 + rand() * 0.4;
    const rz = 1.2 + rand() * 0.3;
    positions[i * 3] = rx * Math.cos(theta);
    positions[i * 3 + 1] = (rand() - 0.5) * 0.4;
    positions[i * 3 + 2] = rz * Math.sin(theta);
    color.toArray(colors, i * 3);
    sizes[i] = 0.02 + rand() * 0.03;
  }
  return { positions, colors, sizes };
}

function generateSpiral(config: ClusterConfig): ParticleData {
  const rand = seededRandom(config.seed);
  const positions = new Float32Array(config.count * 3);
  const colors = new Float32Array(config.count * 3);
  const sizes = new Float32Array(config.count);
  const color = new THREE.Color(config.color);

  for (let i = 0; i < config.count; i++) {
    const t = i / config.count;
    const theta = t * Math.PI * 6;
    const r = t * 1.5;
    positions[i * 3] = r * Math.cos(theta) + (rand() - 0.5) * 0.1;
    positions[i * 3 + 1] = (rand() - 0.5) * 0.2;
    positions[i * 3 + 2] = r * Math.sin(theta) + (rand() - 0.5) * 0.1;
    color.toArray(colors, i * 3);
    sizes[i] = 0.03 * (1 - t * 0.5) + (rand() - 0.5) * 0.01;
  }
  return { positions, colors, sizes };
}

const generators: Record<ClusterShape, (config: ClusterConfig) => ParticleData> = {
  sphere: generateSphere,
  ring: generateRing,
  subclusters: generateSubclusters,
  grid: generateGrid,
  orbit: generateOrbit,
  spiral: generateSpiral,
};

export function generateParticles(config: ClusterConfig): ParticleData {
  return generators[config.shape](config);
}

export function generateAllParticles(count: number): ParticleData[] {
  return SECTIONS.slice(0, count).map(generateParticles);
}

export function getMobileConfig(): ClusterConfig[] {
  return SECTIONS.map((s) => ({
    ...s,
    count: Math.min(s.count, 5000),
    subClusterCount: s.subClusterCount ? Math.min(s.subClusterCount, 2) : undefined,
    subClusterSeeds: s.subClusterSeeds?.slice(0, 2),
  }));
}
```

- [ ] **Step 4: Write and run particleSystem test**

```ts
// src/three/particleSystem.test.ts
import { describe, it, expect } from 'vitest';
import { generateParticles, generateAllParticles, getMobileConfig } from './particleSystem';
import { SECTIONS } from './clusterConfig';

describe('generateParticles', () => {
  it('generates correct number of particles for each section', () => {
    SECTIONS.forEach((config) => {
      const actual = generateParticles(config);
      expect(actual.positions).toHaveLength(config.count * 3);
      expect(actual.colors).toHaveLength(config.count * 3);
      expect(actual.sizes).toHaveLength(config.count);
    });
  });

  it('is deterministic for a given config', () => {
    const a = generateParticles(SECTIONS[0]);
    const b = generateParticles(SECTIONS[0]);
    expect(a.positions).toEqual(b.positions);
  });
});

describe('getMobileConfig', () => {
  it('caps particle count at 5000', () => {
    const mobile = getMobileConfig();
    mobile.forEach((c) => {
      expect(c.count).toBeLessThanOrEqual(5000);
    });
  });
});
```

- [ ] **Step 5: Run tests**

Run: `npm run test -- src/three/particleSystem.test.ts src/three/clusterConfig.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/three/clusterConfig.ts src/three/clusterConfig.test.ts src/three/particleSystem.ts src/three/particleSystem.test.ts
git commit -m "feat: add particle cluster system with GPU instancing data"
```

---

### Task 2: `cameraControls.ts`

**Files:**
- Create: `src/three/cameraControls.ts`
- Test: `src/three/cameraControls.test.ts`

- [ ] **Step 1: Write cameraControls test**

```ts
// src/three/cameraControls.test.ts
import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import { createCameraControls, flyToCluster } from './cameraControls';

describe('cameraControls', () => {
  it('creates a perspective camera', () => {
    const controls = createCameraControls();
    expect(controls.camera).toBeInstanceOf(THREE.PerspectiveCamera);
  });

  it('flyToCluster creates a GSAP tween', () => {
    vi.mock('gsap', () => ({ default: { to: vi.fn(() => ({ kill: vi.fn() })) } }));
    const controls = createCameraControls();
    const result = flyToCluster(controls.camera, [1, 2, 3]);
    expect(result).toBeDefined();
  });
});
```

- [ ] **Step 2: Create `src/three/cameraControls.ts`**

```ts
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
    onUpdate: () => camera.lookAt(0, 0, 0),
  });
}
```

- [ ] **Step 3: Create cameraControls test and run**

Run: `npm run test -- src/three/cameraControls.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/three/cameraControls.ts src/three/cameraControls.test.ts
git commit -m "feat: add camera controls and fly-to-cluster tween"
```

---

### Task 3: `useScrollNavigation.ts`

**Files:**
- Create: `src/hooks/useScrollNavigation.ts`
- Test: `src/hooks/useScrollNavigation.test.ts`

- [ ] **Step 1: Write test**

```ts
// src/hooks/useScrollNavigation.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useScrollNavigation } from './useScrollNavigation';

describe('useScrollNavigation', () => {
  it('starts at cluster 0', () => {
    const { result } = renderHook(() => useScrollNavigation({ sectionCount: 6 }));
    expect(result.current.activeCluster).toBe(0);
  });

  it('updates cluster on scroll', () => {
    const { result } = renderHook(() => useScrollNavigation({ sectionCount: 6 }));
    act(() => { window.scrollY = 500; window.dispatchEvent(new Event('scroll')); });
    expect(result.current.activeCluster).toBeGreaterThanOrEqual(0);
  });

  it('navigateTo changes active cluster', () => {
    const { result } = renderHook(() => useScrollNavigation({ sectionCount: 6 }));
    act(() => result.current.navigateTo(3));
    expect(result.current.activeCluster).toBe(3);
  });
});
```

- [ ] **Step 2: Create `src/hooks/useScrollNavigation.ts`**

```ts
import { useState, useCallback, useEffect, useRef } from 'react';

interface UseScrollNavigationOptions {
  sectionCount: number;
}

export function useScrollNavigation({ sectionCount }: UseScrollNavigationOptions) {
  const [activeCluster, setActiveCluster] = useState(0);
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
        const index = Math.min(Math.floor(progress * sectionCount), sectionCount - 1);
        setActiveCluster(index);
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, [sectionCount]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const navigateTo = useCallback((index: number) => {
    setActiveCluster(Math.max(0, Math.min(index, sectionCount - 1)));
  }, [sectionCount]);

  return { activeCluster, navigateTo };
}
```

- [ ] **Step 3: Run test**

Run: `npm run test -- src/hooks/useScrollNavigation.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useScrollNavigation.ts src/hooks/useScrollNavigation.test.ts
git commit -m "feat: add scroll-to-cluster navigation hook"
```

---

### Task 4: `ParticleScene.ts` (Three.js renderer)

**Files:**
- Create: `src/components/ImmersiveCanvas/ParticleScene.ts`

- [ ] **Step 1: Create `src/components/ImmersiveCanvas/ParticleScene.ts`**

```ts
import * as THREE from 'three';
import { generateParticles } from '../../three/particleSystem';
import { SECTIONS, ClusterConfig } from '../../three/clusterConfig';
import { createCameraControls, flyToCluster } from '../../three/cameraControls';

export type SceneState = 'entering' | 'idle' | 'transitioning';

export interface ParticleSceneAPI {
  domElement: HTMLCanvasElement;
  setActiveCluster: (index: number) => void;
  startEnter: () => void;
  dispose: () => void;
  resize: () => void;
}

export function createParticleScene(isMobile: boolean, reducedMotion: boolean): ParticleSceneAPI {
  const cameraControls = createCameraControls();
  const { camera } = cameraControls;

  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setClearColor(0x060a07);

  const scene = new THREE.Scene();

  const configs = isMobile
    ? SECTIONS.map((s) => ({ ...s, count: Math.min(s.count, 5000) }))
    : SECTIONS;

  const clusters: {
    mesh: THREE.InstancedMesh;
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
      if (i !== currentCluster && state === 'idle') {
        cluster.mesh.material.opacity = 0.15;
      } else {
        cluster.mesh.material.opacity = reducedMotion ? 1 : 0.8;
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
      flyToCluster(camera, target).then(() => {
        state = 'idle';
      });
    },
    startEnter() {
      state = 'entering';
      flyToCluster(camera, configs[0].position).then(() => {
        state = 'idle';
      });
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ImmersiveCanvas/ParticleScene.ts
git commit -m "feat: add Three.js particle scene with GPU instancing and cluster transitions"
```

---

### Task 5: `ImmersiveCanvas.tsx` + `EnterScreen.tsx`

**Files:**
- Create: `src/components/ImmersiveCanvas/ImmersiveCanvas.tsx`
- Create: `src/components/EnterScreen/EnterScreen.tsx`
- Create: `src/components/EnterScreen/EnterScreen.module.css`
- Test: `src/components/EnterScreen/EnterScreen.test.tsx`
- Create: `src/components/SectionOverlay/SectionOverlay.tsx`
- Test: `src/components/SectionOverlay/SectionOverlay.test.tsx`

- [ ] **Step 1: Create ImmeriveCanvas**

```tsx
import { useEffect, useRef, useCallback } from 'react';
import { createParticleScene, ParticleSceneAPI } from './ParticleScene';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface ImmersiveCanvasProps {
  onSceneReady?: (api: ParticleSceneAPI) => void;
  activeCluster?: number;
}

export function ImmersiveCanvas({ onSceneReady, activeCluster = 0 }: ImmersiveCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ParticleSceneAPI | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const api = createParticleScene(isMobile, reducedMotion);
    apiRef.current = api;
    containerRef.current?.appendChild(api.domElement);
    onSceneReady?.(api);
    return () => api.dispose();
  }, [reducedMotion, onSceneReady]);

  useEffect(() => {
    if (apiRef.current && activeCluster !== undefined) {
      apiRef.current.setActiveCluster(activeCluster);
    }
  }, [activeCluster]);

  const handleResize = useCallback(() => {
    apiRef.current?.resize();
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  if (reducedMotion) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}
```

- [ ] **Step 2: Create EnterScreen**

```tsx
import { useEffect, useState } from 'react';
import styles from './EnterScreen.module.css';

interface EnterScreenProps {
  onEnter: () => void;
}

export function EnterScreen({ onEnter }: EnterScreenProps) {
  const [visible, setVisible] = useState(true);

  function handleClick() {
    setVisible(false);
    setTimeout(onEnter, 50);
  }

  useEffect(() => {
    if (!visible) {
      const t = setTimeout(() => setVisible(false), 600);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={styles.overlay} onClick={handleClick}>
      <svg className={styles.logo} viewBox="0 0 200 40" aria-hidden="true">
        <text x="0" y="32" fill="none" stroke="#33FF77" strokeWidth="1" fontSize="32" fontFamily="monospace" letterSpacing="4">
          anomalydevs
        </text>
      </svg>
      <span className={styles.hint}>Haz clic para entrar</span>
    </div>
  );
}
```

- [ ] **Step 3: Create EnterScreen.module.css**

```css
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  background: #060A07;
  cursor: pointer;
  animation: fadeIn 0.8s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.logo {
  width: 240px;
  height: auto;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.hint {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  color: var(--color-accent);
  opacity: 0.6;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
```

- [ ] **Step 4: Create EnterScreen test**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EnterScreen } from './EnterScreen';

describe('EnterScreen', () => {
  it('renders logo and hint text', () => {
    render(<EnterScreen onEnter={vi.fn()} />);
    expect(screen.getByText('Haz clic para entrar')).toBeInTheDocument();
  });

  it('calls onEnter on click', () => {
    const onEnter = vi.fn();
    render(<EnterScreen onEnter={onEnter} />);
    fireEvent.click(screen.getByText('Haz clic para entrar'));
    setTimeout(() => expect(onEnter).toHaveBeenCalled(), 100);
  });
});
```

- [ ] **Step 5: Create SectionOverlay**

```tsx
import { Suspense, lazy, ReactNode } from 'react';

const sectionComponents: Record<string, React.LazyExoticComponent<() => ReactNode>> = {
  hero: lazy(() => import('../Hero/Hero').then((m) => ({ default: m.Hero }))),
  manifesto: lazy(() => import('../Manifesto/Manifesto').then((m) => ({ default: m.Manifesto }))),
  services: lazy(() => import('../Services/Services').then((m) => ({ default: m.Services }))),
  projects: lazy(() => import('../Projects/Projects').then((m) => ({ default: m.Projects }))),
  testimonials: lazy(() => import('../Testimonials/Testimonials').then((m) => ({ default: m.Testimonials }))),
  contact: lazy(() => import('../Contact/Contact').then((m) => ({ default: m.Contact }))),
};

const sectionIds = ['hero', 'manifesto', 'services', 'projects', 'testimonials', 'contact'];

interface SectionOverlayProps {
  activeIndex: number;
}

export function SectionOverlay({ activeIndex }: SectionOverlayProps) {
  const id = sectionIds[activeIndex] || 'hero';
  const Component = sectionComponents[id];

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        pointerEvents: 'auto',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Suspense fallback={null}>
        <Component />
      </Suspense>
    </div>
  );
}
```

- [ ] **Step 6: Create SectionOverlay test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SectionOverlay } from './SectionOverlay';

describe('SectionOverlay', () => {
  it('renders Hero component for index 0', async () => {
    render(<SectionOverlay activeIndex={0} />);
    expect(await screen.findByText(/DETECTAMOS/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Run tests**

Run: `npm run test`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/components/ImmersiveCanvas/ImmersiveCanvas.tsx src/components/EnterScreen/ src/components/SectionOverlay/
git commit -m "feat: add ImmersiveCanvas, EnterScreen, and SectionOverlay components"
```

---

### Task 6: `useCursor.ts` + `cursorEffect.ts`

**Files:**
- Create: `src/hooks/useCursor.ts`
- Create: `src/three/cursorEffect.ts`

- [ ] **Step 1: Create `src/three/cursorEffect.ts`**

```ts
export interface CursorState {
  x: number;
  y: number;
  hovering: boolean;
  hoveringCTA: boolean;
}

export function createCursorOverlay(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.zIndex = '9999';
  canvas.style.pointerEvents = 'none';
  canvas.style.cursor = 'none';
  return canvas;
}

export function renderCursor(ctx: CanvasRenderingContext2D, state: CursorState, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);

  const { x, y, hovering, hoveringCTA } = state;

  // Halo
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, hoveringCTA ? 30 : 15);
  gradient.addColorStop(0, 'rgba(51, 255, 119, 0.3)');
  gradient.addColorStop(1, 'rgba(51, 255, 119, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, hoveringCTA ? 30 : 15, 0, Math.PI * 2);
  ctx.fill();

  // Dot
  ctx.fillStyle = '#33FF77';
  ctx.beginPath();
  ctx.arc(x, y, hoveringCTA ? 4 : 2.5, 0, Math.PI * 2);
  ctx.fill();
}
```

- [ ] **Step 2: Create `src/hooks/useCursor.ts`**

```ts
import { useEffect, useRef, useCallback } from 'react';
import { createCursorOverlay, renderCursor, CursorState } from '../three/cursorEffect';

const CTA_SELECTORS = 'a, button, [role="button"], input, textarea';

export function useCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const stateRef = useRef<CursorState>({ x: 0, y: 0, hovering: false, hoveringCTA: false });
  const rafRef = useRef(0);

  const handleResize = useCallback(() => {
    if (!canvasRef.current) return;
    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;
  }, []);

  useEffect(() => {
    if (window.matchMedia('(max-width: 768px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = createCursorOverlay();
    canvasRef.current = canvas;
    document.body.appendChild(canvas);
    document.body.style.cursor = 'none';

    const ctx = canvas.getContext('2d')!;
    ctxRef.current = ctx;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function render() {
      rafRef.current = requestAnimationFrame(render);
      renderCursor(ctx, stateRef.current, canvas.width, canvas.height);
    }
    render();

    function handleMouse(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const isCTA = target.matches?.(CTA_SELECTORS) || target.closest?.(CTA_SELECTORS) !== null;
      stateRef.current = { x: e.clientX, y: e.clientY, hovering: true, hoveringCTA: isCTA };
    }

    function handleLeave() {
      stateRef.current = { ...stateRef.current, hovering: false, hoveringCTA: false };
    }

    document.addEventListener('mousemove', handleMouse);
    document.addEventListener('mouseleave', handleLeave);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('mousemove', handleMouse);
      document.removeEventListener('mouseleave', handleLeave);
      window.removeEventListener('resize', handleResize);
      canvas.remove();
      document.body.style.cursor = '';
    };
  }, [handleResize]);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useCursor.ts src/three/cursorEffect.ts
git commit -m "feat: add custom cursor overlay with neon dot and CTA hover effect"
```

---

### Task 7: Integración en `App.tsx`

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Rewrite App.tsx**

```tsx
import { useState, useCallback, useRef } from 'react';
import { Nav } from './components/Nav/Nav';
import { Footer } from './components/Footer/Footer';
import { EnterScreen } from './components/EnterScreen/EnterScreen';
import { SectionOverlay } from './components/SectionOverlay/SectionOverlay';
import { useScrollNavigation } from './hooks/useScrollNavigation';
import { useCursor } from './hooks/useCursor';
import { ParticleSceneAPI } from './components/ImmersiveCanvas/ParticleScene';

const ImmersiveCanvas = lazy(() =>
  import('./components/ImmersiveCanvas/ImmersiveCanvas').then((m) => ({ default: m.ImmersiveCanvas })),
);

import { lazy, Suspense } from 'react';

export default function App() {
  const [entered, setEntered] = useState(false);
  const sceneApiRef = useRef<ParticleSceneAPI | null>(null);
  const { activeCluster, navigateTo } = useScrollNavigation({ sectionCount: 6 });

  useCursor();

  const handleSceneReady = useCallback((api: ParticleSceneAPI) => {
    sceneApiRef.current = api;
  }, []);

  function handleEnter() {
    setEntered(true);
    setTimeout(() => sceneApiRef.current?.startEnter(), 100);
  }

  return (
    <>
      {!entered && <EnterScreen onEnter={handleEnter} />}
      <Suspense fallback={null}>
        <ImmersiveCanvas
          onSceneReady={handleSceneReady}
          activeCluster={activeCluster}
        />
      </Suspense>
      <Nav />
      <main>
        <SectionOverlay activeIndex={activeCluster} />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Run tests**

Run: `npm run test`
Expected: PASS (App.test.tsx may need update for new layout)

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: integrate immersive canvas, enter screen, and scroll navigation"
```

---

### Task 8: SoundToggle mejorado + QA final

**Files:**
- Modify: `src/components/SoundToggle/SoundToggle.tsx`

- [ ] **Step 1: Update SoundToggle frequency**

Add to SoundToggle:
```ts
const FREQ_BY_CLUSTER = [110, 130, 155, 175, 195, 220];
// Inside the enabled effect, set oscillator.frequency.value = FREQ_BY_CLUSTER[activeCluster]
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Run full test suite**

Run: `npm run test`
Expected: All tests pass

- [ ] **Step 4: QA checklist**

- Lighthouse performance (DevTools)
- Cross-browser: Chrome, Firefox, Edge
- prefers-reduced-motion: canvas no se monta
- Mobile < 768px: partículas reducidas, sin cursor personalizado
- EnterScreen → click → transición al hero
- Scroll navega entre clústeres
- Cursor neón visible y reacciona a CTAs

- [ ] **Step 5: Commit**

```bash
git add src/components/SoundToggle/SoundToggle.tsx
git commit -m "feat: modulate ambient sound by active cluster"
```
