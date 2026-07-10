# AnomalyDevs Landing — Experiencia WebGL inmersiva — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir la landing estática de AnomalyDevs en una experiencia WebGL inmersiva: escena 3D persistente de página completa donde el scroll conduce a la cámara en un viaje por un campo de nodos que adopta una formación distinta en cada una de las 7 paradas (spec: `docs/superpowers/specs/2026-07-10-landing-webgl-inmersiva-design.md`).

**Architecture:** Un canvas R3F fijo detrás del contenido, persistente durante toda la página. La altura del documento la definen los overlays HTML (secciones de la Fase 1 adaptadas); Lenis suaviza el scroll y GSAP ScrollTrigger escribe el progress global (0–1) en un singleton (ref, nunca state de React). En `useFrame`, la cámara se interpola sobre una curva CatmullRom con waypoints por parada y los nodos se interpolan entre formaciones procedurales deterministas (campo → grilla → clústeres → claro → anillos → convergencia). Toda la lógica de formaciones/camino/tramos es pura y está cubierta por tests; la escena visual se verifica manualmente.

**Tech Stack:** React 18 + Vite + TypeScript + Vitest (base Fase 1), `three`, `@react-three/fiber`, `gsap` (ScrollTrigger), `lenis`, `zustand`. Nota: la spec menciona `drei`, pero ningún helper de drei es necesario en el diseño final (la cámara es propia y no hay OrbitControls) — se omite por YAGNI.

**Precondición:** El plan de Fase 1 estática (`docs/superpowers/plans/2026-07-07-anomalydevs-landing-static.md`) ya está ejecutado: existen `package.json` (Vite/React/TS/Vitest), `src/App.tsx`, `src/components/{Nav,Hero,Manifesto,Services,Projects,Testimonials,Contact,Footer}`, `src/content/*.ts`, `src/styles/{tokens.css,global.css}` y su suite de tests en verde. El plan de Fase 2 anterior (`2026-07-07-anomalydevs-landing-interactive.md`) NO se ejecuta — queda obsoleto.

**Directorio de trabajo:** raíz del repo `Anomalydevs/`.

---

### Task 1: Instalar dependencias

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Instalar dependencias de runtime**

Run: `npm install three@^0.169.0 @react-three/fiber@^8.17.10 gsap@^3.12.5 lenis@^1.1.13 zustand@^5.0.1`
Expected: exit code 0; `dependencies` gana 5 entradas.

**Importante:** `@react-three/fiber` se fija a la serie 8.x — la v9 requiere React 19 y este proyecto usa React 18.

- [ ] **Step 2: Instalar tipos**

Run: `npm install -D @types/three@^0.169.0`
Expected: exit code 0.

- [ ] **Step 3: Verificar que la suite de Fase 1 sigue en verde**

Run: `npm run test`
Expected: PASS (sin cambios de código todavía).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add three, react-three-fiber, gsap, lenis and zustand"
```

---

### Task 2: Mock de `window.matchMedia` en el test setup

Los hooks de esta fase usan `window.matchMedia`, que jsdom no implementa. Sin este mock, cualquier componente que lo use rompe la suite.

**Files:**
- Modify: `src/test-setup.ts`

- [ ] **Step 1: Reemplazar el contenido completo de `src/test-setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
```

- [ ] **Step 2: Verificar que la suite sigue pasando**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/test-setup.ts
git commit -m "test: add default window.matchMedia mock for jsdom"
```

---

### Task 3: `journey.ts` — tramos del viaje y easing

Lógica pura que mapea el progress global (0–1) al tramo actual entre paradas, con suavizado. La usan la cámara, las formaciones y el fade del footer.

**Files:**
- Create: `src/three/journey.ts`
- Test: `src/three/journey.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```ts
// src/three/journey.test.ts
import { describe, it, expect } from 'vitest';
import { getJourneySegment, smoothstep, STOP_PROGRESS, STOP_COUNT } from './journey';

describe('smoothstep', () => {
  it('clamps below 0 and above 1', () => {
    expect(smoothstep(-1)).toBe(0);
    expect(smoothstep(2)).toBe(1);
  });

  it('is 0.5 at the midpoint and monotonic', () => {
    expect(smoothstep(0.5)).toBeCloseTo(0.5);
    expect(smoothstep(0.3)).toBeLessThan(smoothstep(0.4));
  });
});

describe('STOP_PROGRESS', () => {
  it('has one entry per stop, from 0 to 1, strictly increasing', () => {
    expect(STOP_PROGRESS).toHaveLength(STOP_COUNT);
    expect(STOP_PROGRESS[0]).toBe(0);
    expect(STOP_PROGRESS[STOP_COUNT - 1]).toBe(1);
    for (let i = 1; i < STOP_COUNT; i++) {
      expect(STOP_PROGRESS[i]).toBeGreaterThan(STOP_PROGRESS[i - 1]);
    }
  });
});

describe('getJourneySegment', () => {
  it('starts at segment 0 with t=0', () => {
    expect(getJourneySegment(0)).toEqual({ from: 0, to: 1, t: 0 });
  });

  it('ends at the last segment with t=1', () => {
    expect(getJourneySegment(1)).toEqual({ from: 5, to: 6, t: 1 });
  });

  it('clamps out-of-range progress', () => {
    expect(getJourneySegment(-0.5)).toEqual({ from: 0, to: 1, t: 0 });
    expect(getJourneySegment(1.5)).toEqual({ from: 5, to: 6, t: 1 });
  });

  it('is halfway (t=0.5) in the middle of a segment', () => {
    // 0.25 está a mitad de camino entre las paradas 1/6 y 2/6
    const seg = getJourneySegment(0.25);
    expect(seg.from).toBe(1);
    expect(seg.to).toBe(2);
    expect(seg.t).toBeCloseTo(0.5);
  });

  it('t=0 exactly at each stop boundary', () => {
    const seg = getJourneySegment(STOP_PROGRESS[3]);
    expect(seg).toEqual({ from: 3, to: 4, t: 0 });
  });

  it('eased global position (from + t) never decreases as progress grows', () => {
    let prev = -1;
    for (let p = 0; p <= 1.001; p += 0.01) {
      const seg = getJourneySegment(p);
      const eased = seg.from + seg.t;
      expect(eased).toBeGreaterThanOrEqual(prev);
      prev = eased;
    }
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test -- journey`
Expected: FAIL — `./journey` no existe.

- [ ] **Step 3: Crear `src/three/journey.ts`**

```ts
export const STOP_COUNT = 7;

/** Progress de scroll (0–1) en el que cae cada parada. 7 secciones de igual altura → i/6. */
export const STOP_PROGRESS = [0, 1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6, 1];

export interface JourneySegment {
  from: number;
  to: number;
  t: number;
}

export function smoothstep(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

/**
 * Mapea el progress global al tramo actual entre paradas.
 * t va suavizado (smoothstep) → la red y la cámara "descansan" cerca de cada parada.
 */
export function getJourneySegment(progress: number): JourneySegment {
  const p = Math.min(1, Math.max(0, progress));
  let from = 0;
  while (from < STOP_COUNT - 2 && p >= STOP_PROGRESS[from + 1]) {
    from++;
  }
  const start = STOP_PROGRESS[from];
  const end = STOP_PROGRESS[from + 1];
  return { from, to: from + 1, t: smoothstep((p - start) / (end - start)) };
}
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `npm run test -- journey`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/three/journey.ts src/three/journey.test.ts
git commit -m "feat: add journey segment mapping with eased stops"
```

---

### Task 4: `networkFormations.ts` — formaciones procedurales de la red

Una formación por parada: campo, grilla, clústeres, claro, anillos, convergencia (×2: contacto y footer comparten formación; el footer se atenúa por opacidad). El nodo `ANOMALY_INDEX` ocupa `ANOMALY_POSITION` en TODAS las formaciones — es el destino narrativo fijo del viaje.

**Files:**
- Create: `src/three/networkFormations.ts`
- Test: `src/three/networkFormations.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```ts
// src/three/networkFormations.test.ts
import { describe, it, expect } from 'vitest';
import {
  getFormations,
  clusterOf,
  createRng,
  ANOMALY_INDEX,
  ANOMALY_POSITION,
  CLUSTER_COUNT,
} from './networkFormations';
import { STOP_COUNT } from './journey';

const COUNT = 200;

describe('createRng', () => {
  it('is deterministic for the same seed and differs across seeds', () => {
    const a1 = createRng(7);
    const a2 = createRng(7);
    const b = createRng(8);
    const seqA1 = [a1(), a1(), a1()];
    const seqA2 = [a2(), a2(), a2()];
    const seqB = [b(), b(), b()];
    expect(seqA1).toEqual(seqA2);
    expect(seqA1).not.toEqual(seqB);
    seqA1.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    });
  });
});

describe('getFormations', () => {
  it('returns one formation per stop, each with count*3 floats', () => {
    const formations = getFormations(COUNT, 42);
    expect(formations).toHaveLength(STOP_COUNT);
    formations.forEach((f) => expect(f).toHaveLength(COUNT * 3));
  });

  it('is deterministic for a given seed', () => {
    expect(getFormations(COUNT, 42)).toEqual(getFormations(COUNT, 42));
  });

  it('differs across seeds', () => {
    expect(getFormations(COUNT, 1)[0]).not.toEqual(getFormations(COUNT, 2)[0]);
  });

  it('pins the anomaly node to ANOMALY_POSITION in every formation', () => {
    getFormations(COUNT, 42).forEach((f) => {
      expect(f[ANOMALY_INDEX * 3]).toBe(ANOMALY_POSITION[0]);
      expect(f[ANOMALY_INDEX * 3 + 1]).toBe(ANOMALY_POSITION[1]);
      expect(f[ANOMALY_INDEX * 3 + 2]).toBe(ANOMALY_POSITION[2]);
    });
  });

  it('clearing formation (index 3) keeps a hollow center around the path axis', () => {
    const clearing = getFormations(COUNT, 42)[3];
    for (let i = 0; i < COUNT; i++) {
      if (i === ANOMALY_INDEX) continue;
      const x = clearing[i * 3];
      const y = clearing[i * 3 + 1];
      // los nodos se generan a radio >= 8 (y comprimido a 0.6)
      const radial = Math.sqrt(x * x + (y / 0.6) * (y / 0.6));
      expect(radial).toBeGreaterThanOrEqual(7.9);
    }
  });

  it('convergence formation (index 5) packs all nodes near the anomaly', () => {
    const convergence = getFormations(COUNT, 42)[5];
    for (let i = 0; i < COUNT; i++) {
      const dx = convergence[i * 3] - ANOMALY_POSITION[0];
      const dy = convergence[i * 3 + 1] - ANOMALY_POSITION[1];
      const dz = convergence[i * 3 + 2] - ANOMALY_POSITION[2];
      expect(Math.sqrt(dx * dx + dy * dy + dz * dz)).toBeLessThanOrEqual(5.01);
    }
  });

  it('rings formation (index 4) keeps nodes on rings around the axis', () => {
    const rings = getFormations(COUNT, 42)[4];
    for (let i = 0; i < COUNT; i++) {
      if (i === ANOMALY_INDEX) continue;
      const x = rings[i * 3];
      const y = rings[i * 3 + 1];
      const radial = Math.sqrt(x * x + y * y);
      expect(radial).toBeGreaterThanOrEqual(4.9);
      expect(radial).toBeLessThanOrEqual(8.5);
    }
  });
});

describe('clusterOf', () => {
  it('cycles node indices across CLUSTER_COUNT clusters', () => {
    expect(clusterOf(0)).toBe(0);
    expect(clusterOf(5)).toBe(5);
    expect(clusterOf(6)).toBe(0);
    expect(clusterOf(13)).toBe(13 % CLUSTER_COUNT);
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test -- networkFormations`
Expected: FAIL — `./networkFormations` no existe.

- [ ] **Step 3: Crear `src/three/networkFormations.ts`**

```ts
import { STOP_COUNT } from './journey';

export const CLUSTER_COUNT = 6;
export const ANOMALY_INDEX = 0;
export const ANOMALY_POSITION: [number, number, number] = [0, 0, -46];

/** PRNG determinista (LCG) — mismas posiciones para el mismo seed. */
export function createRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** Clúster (servicio) al que pertenece cada nodo. */
export function clusterOf(index: number): number {
  return index % CLUSTER_COUNT;
}

type Builder = (count: number, rand: () => number, out: Float32Array) => void;

/** Parada 1 — Hero: campo denso e irregular alrededor del inicio del camino. */
function buildField(count: number, rand: () => number, out: Float32Array): void {
  for (let i = 0; i < count; i++) {
    out[i * 3] = (rand() - 0.5) * 26;
    out[i * 3 + 1] = (rand() - 0.5) * 14;
    out[i * 3 + 2] = 12 - rand() * 26;
  }
}

/** Parada 2 — Manifiesto: el caos se ordena en una grilla parcial con jitter leve. */
function buildGrid(count: number, rand: () => number, out: Float32Array): void {
  const cols = 12;
  const rows = 8;
  for (let i = 0; i < count; i++) {
    const gx = i % cols;
    const gy = Math.floor(i / cols) % rows;
    const gz = Math.floor(i / (cols * rows));
    out[i * 3] = (gx - (cols - 1) / 2) * 2.2 + (rand() - 0.5) * 0.4;
    out[i * 3 + 1] = (gy - (rows - 1) / 2) * 2.0 + (rand() - 0.5) * 0.4;
    out[i * 3 + 2] = -2 - gz * 2.0 + (rand() - 0.5) * 0.4;
  }
}

/** Parada 3 — Servicios: 6 clústeres alternando izquierda/derecha flanqueando el camino. */
function buildClusters(count: number, rand: () => number, out: Float32Array): void {
  const centers: [number, number, number][] = [];
  for (let c = 0; c < CLUSTER_COUNT; c++) {
    centers.push([c % 2 === 0 ? -6 : 6, (rand() - 0.5) * 3, -12 - c * 2.6]);
  }
  for (let i = 0; i < count; i++) {
    const center = centers[clusterOf(i)];
    out[i * 3] = center[0] + (rand() - 0.5) * 3.4;
    out[i * 3 + 1] = center[1] + (rand() - 0.5) * 3.4;
    out[i * 3 + 2] = center[2] + (rand() - 0.5) * 3.4;
  }
}

/** Parada 4 — Proyectos: claro central; nodos en la periferia como túnel/marco. */
function buildClearing(count: number, rand: () => number, out: Float32Array): void {
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = 8 + rand() * 5;
    out[i * 3] = Math.cos(angle) * radius;
    out[i * 3 + 1] = Math.sin(angle) * radius * 0.6;
    out[i * 3 + 2] = -16 - rand() * 10;
  }
}

/** Parada 5 — Testimonios: anillos concéntricos alrededor del eje del camino. */
function buildRings(count: number, rand: () => number, out: Float32Array): void {
  const ringZ = [-28, -31.5, -35];
  for (let i = 0; i < count; i++) {
    const ring = i % ringZ.length;
    const angle = rand() * Math.PI * 2;
    const radius = 5.5 + ring * 1.2 + (rand() - 0.5) * 0.6;
    out[i * 3] = Math.cos(angle) * radius;
    out[i * 3 + 1] = Math.sin(angle) * radius;
    out[i * 3 + 2] = ringZ[ring] + (rand() - 0.5) * 0.8;
  }
}

/** Paradas 6 y 7 — Contacto/Footer: la red converge en una bola densa alrededor de la anomalía. */
function buildConvergence(count: number, rand: () => number, out: Float32Array): void {
  for (let i = 0; i < count; i++) {
    const r = Math.pow(rand(), 1.8) * 5;
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    out[i * 3] = ANOMALY_POSITION[0] + Math.sin(phi) * Math.cos(theta) * r;
    out[i * 3 + 1] = ANOMALY_POSITION[1] + Math.sin(phi) * Math.sin(theta) * r;
    out[i * 3 + 2] = ANOMALY_POSITION[2] + Math.cos(phi) * r;
  }
}

const BUILDERS: Builder[] = [
  buildField,
  buildGrid,
  buildClusters,
  buildClearing,
  buildRings,
  buildConvergence,
  buildConvergence,
];

/** Una formación (Float32Array de count*3) por parada del viaje. */
export function getFormations(count: number, seed = 42): Float32Array[] {
  return BUILDERS.map((build, i) => {
    const out = new Float32Array(count * 3);
    build(count, createRng(seed + i * 101), out);
    out[ANOMALY_INDEX * 3] = ANOMALY_POSITION[0];
    out[ANOMALY_INDEX * 3 + 1] = ANOMALY_POSITION[1];
    out[ANOMALY_INDEX * 3 + 2] = ANOMALY_POSITION[2];
    return out;
  });
}

// Sanity: una formación por parada
if (BUILDERS.length !== STOP_COUNT) {
  throw new Error('networkFormations: BUILDERS must have one entry per stop');
}
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `npm run test -- networkFormations`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/three/networkFormations.ts src/three/networkFormations.test.ts
git commit -m "feat: add deterministic per-stop network formations"
```

---

### Task 5: `connections.ts` — pares de conexión entre nodos

Devuelve pares de índices (no posiciones) para que las líneas puedan seguir a los nodos mientras morfean. Se recalculan solo al cambiar de tramo, no por frame.

**Files:**
- Create: `src/three/connections.ts`
- Test: `src/three/connections.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```ts
// src/three/connections.test.ts
import { describe, it, expect } from 'vitest';
import { buildConnectionPairs } from './connections';

describe('buildConnectionPairs', () => {
  const positions = new Float32Array([
    0, 0, 0, //  nodo 0
    1, 0, 0, //  nodo 1 (a 1 del nodo 0)
    0, 1.5, 0, // nodo 2 (a 1.5 del nodo 0, ~1.8 del nodo 1)
    50, 50, 50, // nodo 3 (lejos de todo)
  ]);

  it('connects only pairs within maxDistance, without self-connections', () => {
    expect(buildConnectionPairs(positions, 1.2, 100)).toEqual([0, 1]);
  });

  it('includes more pairs as maxDistance grows', () => {
    expect(buildConnectionPairs(positions, 1.9, 100)).toEqual([0, 1, 0, 2, 1, 2]);
  });

  it('returns empty when nothing is close enough', () => {
    expect(buildConnectionPairs(positions, 0.5, 100)).toEqual([]);
  });

  it('caps the number of pairs at maxPairs', () => {
    expect(buildConnectionPairs(positions, 1.9, 2)).toEqual([0, 1, 0, 2]);
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test -- connections`
Expected: FAIL — `./connections` no existe.

- [ ] **Step 3: Crear `src/three/connections.ts`**

```ts
/**
 * Pares de índices de nodos [i, j, i, j, ...] cuya distancia es < maxDistance.
 * Devuelve índices (no posiciones) para que las líneas sigan a los nodos al morfear.
 */
export function buildConnectionPairs(
  positions: Float32Array,
  maxDistance: number,
  maxPairs: number,
): number[] {
  const pairs: number[] = [];
  const count = positions.length / 3;
  const maxSq = maxDistance * maxDistance;
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      const dx = positions[i * 3] - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      if (dx * dx + dy * dy + dz * dz < maxSq) {
        pairs.push(i, j);
        if (pairs.length >= maxPairs * 2) return pairs;
      }
    }
  }
  return pairs;
}
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `npm run test -- connections`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/three/connections.ts src/three/connections.test.ts
git commit -m "feat: add distance-based connection pair builder"
```

---

### Task 6: `cameraPath.ts` — curva de cámara del viaje

Curva CatmullRom con un waypoint por parada. `getCameraPose(progress)` devuelve posición + punto de mirada; hacia el final del viaje la mirada se funde hacia la anomalía.

**Files:**
- Create: `src/three/cameraPath.ts`
- Test: `src/three/cameraPath.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```ts
// src/three/cameraPath.test.ts
import { describe, it, expect } from 'vitest';
import { getCameraPose, CAMERA_WAYPOINTS } from './cameraPath';
import { ANOMALY_POSITION } from './networkFormations';
import { STOP_COUNT, STOP_PROGRESS } from './journey';

describe('CAMERA_WAYPOINTS', () => {
  it('has one waypoint per stop with strictly decreasing z (the journey moves forward)', () => {
    expect(CAMERA_WAYPOINTS).toHaveLength(STOP_COUNT);
    for (let i = 1; i < STOP_COUNT; i++) {
      expect(CAMERA_WAYPOINTS[i][2]).toBeLessThan(CAMERA_WAYPOINTS[i - 1][2]);
    }
  });
});

describe('getCameraPose', () => {
  it('starts at the first waypoint', () => {
    const pose = getCameraPose(0);
    expect(pose.position[0]).toBeCloseTo(CAMERA_WAYPOINTS[0][0], 4);
    expect(pose.position[1]).toBeCloseTo(CAMERA_WAYPOINTS[0][1], 4);
    expect(pose.position[2]).toBeCloseTo(CAMERA_WAYPOINTS[0][2], 4);
  });

  it('ends at the last waypoint looking at the anomaly', () => {
    const pose = getCameraPose(1);
    expect(pose.position[2]).toBeCloseTo(CAMERA_WAYPOINTS[STOP_COUNT - 1][2], 4);
    expect(pose.target[0]).toBeCloseTo(ANOMALY_POSITION[0], 3);
    expect(pose.target[1]).toBeCloseTo(ANOMALY_POSITION[1], 3);
    expect(pose.target[2]).toBeCloseTo(ANOMALY_POSITION[2], 3);
  });

  it('looks forward (target z < position z) at the start', () => {
    const pose = getCameraPose(0);
    expect(pose.target[2]).toBeLessThan(pose.position[2]);
  });

  it('passes through each waypoint at its stop progress', () => {
    for (let i = 0; i < STOP_COUNT; i++) {
      const pose = getCameraPose(STOP_PROGRESS[i]);
      expect(pose.position[2]).toBeCloseTo(CAMERA_WAYPOINTS[i][2], 4);
    }
  });

  it('advances monotonically in z at the stops', () => {
    let prevZ = Infinity;
    for (let i = 0; i < STOP_COUNT; i++) {
      const pose = getCameraPose(STOP_PROGRESS[i]);
      expect(pose.position[2]).toBeLessThan(prevZ);
      prevZ = pose.position[2];
    }
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test -- cameraPath`
Expected: FAIL — `./cameraPath` no existe.

- [ ] **Step 3: Crear `src/three/cameraPath.ts`**

```ts
import { CatmullRomCurve3, Vector3 } from 'three';
import { getJourneySegment, smoothstep, STOP_COUNT } from './journey';
import { ANOMALY_POSITION } from './networkFormations';

/** Un waypoint por parada. z decrece: el viaje avanza hacia -z, donde espera la anomalía (z=-46). */
export const CAMERA_WAYPOINTS: [number, number, number][] = [
  [0, 0, 14],
  [1.5, 0.4, 4],
  [-1.2, -0.3, -6],
  [0.8, 0.4, -18],
  [-0.8, 0.2, -30],
  [0, 0, -38],
  [0, 0, -40],
];

const curve = new CatmullRomCurve3(
  CAMERA_WAYPOINTS.map((p) => new Vector3(p[0], p[1], p[2])),
  false,
  'catmullrom',
  0.5,
);

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
}

const anomaly = new Vector3(ANOMALY_POSITION[0], ANOMALY_POSITION[1], ANOMALY_POSITION[2]);

export function getCameraPose(progress: number): CameraPose {
  const seg = getJourneySegment(progress);
  const eased = (seg.from + seg.t) / (STOP_COUNT - 1);
  const position = curve.getPoint(eased);
  const ahead = curve.getPoint(Math.min(eased + 0.05, 1));
  // Desde ~2/3 del viaje, la mirada se funde hacia la anomalía (cierre narrativo).
  const blend = smoothstep((eased - 0.6) / 0.25);
  const target = ahead.clone().lerp(anomaly, blend);
  return {
    position: [position.x, position.y, position.z],
    target: [target.x, target.y, target.z],
  };
}
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `npm run test -- cameraPath`
Expected: PASS. Nota: `getCameraPose(1)` → `eased=1` → `ahead === position` en la punta de la curva, pero `blend=1` ahí, así que el target es 100% la anomalía — no hay mirada degenerada.

- [ ] **Step 5: Commit**

```bash
git add src/three/cameraPath.ts src/three/cameraPath.test.ts
git commit -m "feat: add scroll-driven camera path over CatmullRom curve"
```

---

### Task 7: `networkConfig.ts` — configuración según dispositivo

**Files:**
- Create: `src/three/networkConfig.ts`
- Test: `src/three/networkConfig.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```ts
// src/three/networkConfig.test.ts
import { describe, it, expect } from 'vitest';
import { getNetworkConfig } from './networkConfig';

describe('getNetworkConfig', () => {
  it('reduces node count, caps DPR to 1 and disables parallax on mobile', () => {
    expect(getNetworkConfig(true)).toEqual({
      nodeCount: 350,
      maxConnections: 400,
      dpr: 1,
      parallax: false,
    });
  });

  it('uses full settings on desktop', () => {
    expect(getNetworkConfig(false)).toEqual({
      nodeCount: 900,
      maxConnections: 1200,
      dpr: 1.5,
      parallax: true,
    });
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test -- networkConfig`
Expected: FAIL — `./networkConfig` no existe.

- [ ] **Step 3: Crear `src/three/networkConfig.ts`**

```ts
export interface NetworkConfig {
  nodeCount: number;
  maxConnections: number;
  dpr: number;
  parallax: boolean;
}

export function getNetworkConfig(isMobile: boolean): NetworkConfig {
  return isMobile
    ? { nodeCount: 350, maxConnections: 400, dpr: 1, parallax: false }
    : { nodeCount: 900, maxConnections: 1200, dpr: 1.5, parallax: true };
}
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `npm run test -- networkConfig`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/three/networkConfig.ts src/three/networkConfig.test.ts
git commit -m "feat: add device-based scene configuration"
```

---

### Task 8: `supportsWebGL.ts` — detección de soporte

**Files:**
- Create: `src/three/supportsWebGL.ts`
- Test: `src/three/supportsWebGL.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```ts
// src/three/supportsWebGL.test.ts
import { describe, it, expect } from 'vitest';
import { supportsWebGL } from './supportsWebGL';

describe('supportsWebGL', () => {
  it('returns false under jsdom (no real WebGL context available)', () => {
    expect(supportsWebGL()).toBe(false);
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test -- supportsWebGL`
Expected: FAIL — `./supportsWebGL` no existe.

- [ ] **Step 3: Crear `src/three/supportsWebGL.ts`**

```ts
export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `npm run test -- supportsWebGL`
Expected: PASS. (jsdom imprime "Not implemented: HTMLCanvasElement.prototype.getContext" — ruido esperado, no una falla.)

- [ ] **Step 5: Commit**

```bash
git add src/three/supportsWebGL.ts src/three/supportsWebGL.test.ts
git commit -m "feat: add WebGL support detection"
```

---

### Task 9: Hook `usePrefersReducedMotion`

**Files:**
- Create: `src/hooks/usePrefersReducedMotion.ts`
- Test: `src/hooks/usePrefersReducedMotion.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```ts
// src/hooks/usePrefersReducedMotion.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

function mockMatchMedia(matches: boolean) {
  const listeners: ((e: MediaQueryListEvent) => void)[] = [];
  window.matchMedia = vi.fn().mockReturnValue({
    matches,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.push(cb),
    removeEventListener: vi.fn(),
  }) as unknown as typeof window.matchMedia;
  return {
    fire: (next: boolean) => listeners.forEach((cb) => cb({ matches: next } as MediaQueryListEvent)),
  };
}

describe('usePrefersReducedMotion', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false when the user has no reduced-motion preference', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when the user prefers reduced motion', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it('updates when the media query changes', () => {
    const { fire } = mockMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
    act(() => fire(true));
    expect(result.current).toBe(true);
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test -- usePrefersReducedMotion`
Expected: FAIL — `./usePrefersReducedMotion` no existe.

- [ ] **Step 3: Crear `src/hooks/usePrefersReducedMotion.ts`**

```ts
import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return reduced;
}
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `npm run test -- usePrefersReducedMotion`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/usePrefersReducedMotion.ts src/hooks/usePrefersReducedMotion.test.ts
git commit -m "feat: add usePrefersReducedMotion hook"
```

---

### Task 10: `scrollProgress` + hook `useScrollJourney` (Lenis + ScrollTrigger)

El progress vive en un singleton mutable (no state de React) para que el frame loop lo lea sin re-renders. El hook instala Lenis, lo conecta al ticker de GSAP y crea un ScrollTrigger de documento completo que escribe el progress.

**Files:**
- Create: `src/three/scrollProgress.ts`
- Create: `src/hooks/useScrollJourney.ts`
- Test: `src/hooks/useScrollJourney.test.ts`

- [ ] **Step 1: Crear `src/three/scrollProgress.ts`** (trivial, sin test propio — lo cubre el test del hook)

```ts
/** Progress global de scroll (0–1). Singleton mutable leído por el frame loop sin re-renders. */
export const scrollProgress = { value: 0 };
```

- [ ] **Step 2: Escribir el test del hook que falla**

```ts
// src/hooks/useScrollJourney.test.ts
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const createMock = vi.fn();
const killMock = vi.fn();
const lenisDestroyMock = vi.fn();

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: (config: Record<string, unknown>) => {
      createMock(config);
      return { kill: killMock };
    },
    update: vi.fn(),
  },
}));
vi.mock('gsap', () => ({
  default: {
    registerPlugin: vi.fn(),
    ticker: { add: vi.fn(), remove: vi.fn(), lagSmoothing: vi.fn() },
  },
}));
vi.mock('lenis', () => ({
  default: class MockLenis {
    on = vi.fn();
    raf = vi.fn();
    destroy = lenisDestroyMock;
  },
}));

const { useScrollJourney } = await import('./useScrollJourney');
const { scrollProgress } = await import('../three/scrollProgress');

describe('useScrollJourney', () => {
  beforeEach(() => {
    createMock.mockClear();
    killMock.mockClear();
    lenisDestroyMock.mockClear();
    scrollProgress.value = 0;
  });

  it('creates one full-document ScrollTrigger when enabled', () => {
    renderHook(() => useScrollJourney(true));
    expect(createMock).toHaveBeenCalledTimes(1);
  });

  it('writes self.progress into the scrollProgress singleton on update', () => {
    renderHook(() => useScrollJourney(true));
    const config = createMock.mock.calls[0][0] as { onUpdate: (self: { progress: number }) => void };
    config.onUpdate({ progress: 0.42 });
    expect(scrollProgress.value).toBe(0.42);
  });

  it('does nothing when disabled (reduced motion)', () => {
    renderHook(() => useScrollJourney(false));
    expect(createMock).not.toHaveBeenCalled();
  });

  it('kills the trigger, destroys lenis and resets progress on unmount', () => {
    const { unmount } = renderHook(() => useScrollJourney(true));
    scrollProgress.value = 0.7;
    unmount();
    expect(killMock).toHaveBeenCalled();
    expect(lenisDestroyMock).toHaveBeenCalled();
    expect(scrollProgress.value).toBe(0);
  });
});
```

- [ ] **Step 3: Correr y verificar que falla**

Run: `npm run test -- useScrollJourney`
Expected: FAIL — `./useScrollJourney` no existe.

- [ ] **Step 4: Crear `src/hooks/useScrollJourney.ts`**

```ts
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { scrollProgress } from '../three/scrollProgress';

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth scroll (Lenis) + progress global del documento (ScrollTrigger) → scrollProgress.
 * Con enabled=false (reduced motion) no instala nada: scroll nativo y escena estática.
 */
export function useScrollJourney(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const trigger = ScrollTrigger.create({
      start: 0,
      end: () => document.documentElement.scrollHeight - window.innerHeight,
      onUpdate: (self) => {
        scrollProgress.value = self.progress;
      },
    });

    return () => {
      trigger.kill();
      gsap.ticker.remove(tick);
      lenis.destroy();
      scrollProgress.value = 0;
    };
  }, [enabled]);
}
```

- [ ] **Step 5: Correr y verificar que pasa**

Run: `npm run test -- useScrollJourney`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/three/scrollProgress.ts src/hooks/useScrollJourney.ts src/hooks/useScrollJourney.test.ts
git commit -m "feat: add Lenis + ScrollTrigger scroll journey progress"
```

---

### Task 11: Store de UI (`zustand`) — hover de servicio → clúster

**Files:**
- Create: `src/store/uiStore.ts`
- Test: `src/store/uiStore.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```ts
// src/store/uiStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useUiStore } from './uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    useUiStore.setState({ hoveredService: -1 });
  });

  it('starts with no hovered service', () => {
    expect(useUiStore.getState().hoveredService).toBe(-1);
  });

  it('sets and clears the hovered service index', () => {
    useUiStore.getState().setHoveredService(3);
    expect(useUiStore.getState().hoveredService).toBe(3);
    useUiStore.getState().setHoveredService(-1);
    expect(useUiStore.getState().hoveredService).toBe(-1);
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test -- uiStore`
Expected: FAIL — `./uiStore` no existe.

- [ ] **Step 3: Crear `src/store/uiStore.ts`**

```ts
import { create } from 'zustand';

interface UiState {
  /** Índice del servicio (= clúster) bajo el cursor; -1 si ninguno. */
  hoveredService: number;
  setHoveredService: (index: number) => void;
}

export const useUiStore = create<UiState>((set) => ({
  hoveredService: -1,
  setHoveredService: (index) => set({ hoveredService: index }),
}));
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `npm run test -- uiStore`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/store/uiStore.ts src/store/uiStore.test.ts
git commit -m "feat: add UI store for service-cluster hover"
```

---

### Task 12: `NodeField` — puntos + líneas con shader custom

Usa WebGL real — **no corre en jsdom**, no lleva test automatizado. Se verifica manualmente en el Task 15. Dos draw calls: `Points` con ShaderMaterial (glow, pulso de anomalía, boost por hover de clúster, fade de footer) y `LineSegments` con material básico.

**Files:**
- Create: `src/components/SceneCanvas/NodeField.tsx`

- [ ] **Step 1: Crear `src/components/SceneCanvas/NodeField.tsx`**

```tsx
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getFormations, clusterOf, ANOMALY_INDEX } from '../../three/networkFormations';
import { buildConnectionPairs } from '../../three/connections';
import { getJourneySegment } from '../../three/journey';
import { scrollProgress } from '../../three/scrollProgress';
import { useUiStore } from '../../store/uiStore';

const CONNECTION_DISTANCE = 2.2;

const vertexShader = /* glsl */ `
  attribute float aCluster;
  attribute float aType;
  uniform float uTime;
  uniform float uHoverCluster;
  varying float vType;
  varying float vBoost;

  void main() {
    vType = aType;
    float pulse = aType > 0.5 ? 1.0 + 0.35 * sin(uTime * 2.5) : 1.0;
    float hovered = (uHoverCluster >= 0.0 && abs(aCluster - uHoverCluster) < 0.5) ? 1.7 : 1.0;
    vBoost = hovered;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float base = aType > 0.5 ? 30.0 : 8.0;
    gl_PointSize = base * pulse * hovered * (28.0 / max(1.0, -mv.z));
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying float vType;
  varying float vBoost;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.08, d);
    vec3 mint = vec3(0.616, 1.0, 0.753);
    vec3 neon = vec3(0.2, 1.0, 0.467);
    vec3 color = mix(mint, neon, step(0.5, vType));
    float baseAlpha = vType > 0.5 ? 1.0 : 0.55;
    gl_FragColor = vec4(color * vBoost, alpha * baseAlpha * uOpacity);
  }
`;

interface NodeFieldProps {
  nodeCount: number;
  maxConnections: number;
  animated?: boolean;
}

export function NodeField({ nodeCount, maxConnections, animated = true }: NodeFieldProps) {
  const formations = useMemo(() => getFormations(nodeCount), [nodeCount]);
  const positions = useMemo(() => formations[0].slice(), [formations]);

  const clusters = useMemo(() => {
    const arr = new Float32Array(nodeCount);
    for (let i = 0; i < nodeCount; i++) {
      arr[i] = i === ANOMALY_INDEX ? -1 : clusterOf(i);
    }
    return arr;
  }, [nodeCount]);

  const types = useMemo(() => {
    const arr = new Float32Array(nodeCount);
    arr[ANOMALY_INDEX] = 1;
    return arr;
  }, [nodeCount]);

  const pairsRef = useRef<number[]>(
    buildConnectionPairs(formations[0], CONNECTION_DISTANCE, maxConnections),
  );
  const pairsSegmentRef = useRef(0);
  const linePositions = useMemo(
    () => new Float32Array(maxConnections * 6),
    [maxConnections],
  );

  const pointsGeo = useRef<THREE.BufferGeometry>(null);
  const linesGeo = useRef<THREE.BufferGeometry>(null);
  const lineMat = useRef<THREE.LineBasicMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHoverCluster: { value: -1 },
      uOpacity: { value: 1 },
    }),
    [],
  );

  useFrame((state) => {
    const p = scrollProgress.value;
    const seg = getJourneySegment(p);
    const from = formations[seg.from];
    const to = formations[seg.to];

    for (let k = 0; k < positions.length; k++) {
      positions[k] = from[k] + (to[k] - from[k]) * seg.t;
    }

    // Reconstruir pares de conexión solo al cambiar de tramo (nunca por frame)
    if (seg.from !== pairsSegmentRef.current) {
      pairsSegmentRef.current = seg.from;
      pairsRef.current = buildConnectionPairs(to, CONNECTION_DISTANCE, maxConnections);
    }
    const pairs = pairsRef.current;
    for (let n = 0; n < pairs.length; n += 2) {
      const a = pairs[n] * 3;
      const b = pairs[n + 1] * 3;
      const o = n * 3;
      linePositions[o] = positions[a];
      linePositions[o + 1] = positions[a + 1];
      linePositions[o + 2] = positions[a + 2];
      linePositions[o + 3] = positions[b];
      linePositions[o + 4] = positions[b + 1];
      linePositions[o + 5] = positions[b + 2];
    }

    if (pointsGeo.current) {
      (pointsGeo.current.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    }
    if (linesGeo.current) {
      (linesGeo.current.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      linesGeo.current.setDrawRange(0, pairs.length);
    }

    // Fade del footer: último tramo (contacto → footer) atenúa la escena
    const fade = 1 - 0.85 * (seg.from === 5 ? seg.t : 0);
    uniforms.uOpacity.value = fade;
    if (lineMat.current) lineMat.current.opacity = 0.28 * fade;

    if (animated) uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uHoverCluster.value = useUiStore.getState().hoveredService;
  });

  return (
    <group>
      <points frustumCulled={false}>
        <bufferGeometry ref={pointsGeo}>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aCluster" args={[clusters, 1]} />
          <bufferAttribute attach="attributes-aType" args={[types, 1]} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments frustumCulled={false}>
        <bufferGeometry ref={linesGeo}>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial ref={lineMat} color="#1C6B3A" transparent opacity={0.28} />
      </lineSegments>
    </group>
  );
}
```

- [ ] **Step 2: Verificar que compila**

Run: `npx tsc -b`
Expected: exit code 0, sin errores de tipos.

- [ ] **Step 3: Commit**

```bash
git add src/components/SceneCanvas/NodeField.tsx
git commit -m "feat: add NodeField points/lines scene with custom shader"
```

---

### Task 13: `CameraRig` — cámara scroll-driven con parallax en el hero

Sin test automatizado (requiere contexto R3F real); se verifica manualmente en el Task 15.

**Files:**
- Create: `src/components/SceneCanvas/CameraRig.tsx`

- [ ] **Step 1: Crear `src/components/SceneCanvas/CameraRig.tsx`**

```tsx
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getCameraPose } from '../../three/cameraPath';
import { getJourneySegment } from '../../three/journey';
import { scrollProgress } from '../../three/scrollProgress';

interface CameraRigProps {
  parallax: boolean;
  animated?: boolean;
}

export function CameraRig({ parallax, animated = true }: CameraRigProps) {
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!parallax) return;
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [parallax]);

  useFrame(({ camera }) => {
    const p = animated ? scrollProgress.value : 0;
    const pose = getCameraPose(p);
    const seg = getJourneySegment(p);
    // Parallax solo en el hero (tramo 0); se desvanece al empezar a avanzar
    const heroWeight = seg.from === 0 ? 1 - seg.t : 0;
    const px = parallax ? mouse.current.x * 0.6 * heroWeight : 0;
    const py = parallax ? -mouse.current.y * 0.35 * heroWeight : 0;
    camera.position.set(pose.position[0] + px, pose.position[1] + py, pose.position[2]);
    target.current.set(pose.target[0], pose.target[1], pose.target[2]);
    camera.lookAt(target.current);
  });

  return null;
}
```

- [ ] **Step 2: Verificar que compila**

Run: `npx tsc -b`
Expected: exit code 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/SceneCanvas/CameraRig.tsx
git commit -m "feat: add scroll-driven camera rig with hero parallax"
```

---

### Task 14: `Scene` + `SceneCanvas` — contenedor con fallbacks

`Scene` (Canvas R3F + three) va en chunk `lazy()` para no bloquear el LCP. `SceneCanvas` decide: sin WebGL → fondo estático CSS; con WebGL → escena (estática si reduced motion); pausa el frameloop cuando la pestaña no es visible.

**Files:**
- Create: `src/components/SceneCanvas/Scene.tsx`
- Create: `src/components/SceneCanvas/SceneCanvas.tsx`
- Create: `src/components/SceneCanvas/SceneCanvas.module.css`
- Test: `src/components/SceneCanvas/SceneCanvas.test.tsx`

- [ ] **Step 1: Escribir el test que falla**

```tsx
// src/components/SceneCanvas/SceneCanvas.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SceneCanvas } from './SceneCanvas';

describe('SceneCanvas', () => {
  it('renders the static CSS fallback under jsdom (no WebGL available)', () => {
    render(<SceneCanvas />);
    const fallback = screen.getByTestId('scene-fallback');
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveAttribute('aria-hidden', 'true');
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test -- SceneCanvas`
Expected: FAIL — `./SceneCanvas` no existe.

- [ ] **Step 3: Crear `src/components/SceneCanvas/SceneCanvas.module.css`**

```css
.container {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.staticFallback {
  position: fixed;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(1200px 700px at 50% 30%, rgba(28, 107, 58, 0.25) 0%, transparent 60%),
    radial-gradient(500px 300px at 50% 80%, rgba(51, 255, 119, 0.12) 0%, transparent 70%),
    #060a07;
}
```

- [ ] **Step 4: Crear `src/components/SceneCanvas/Scene.tsx`**

```tsx
import { Canvas } from '@react-three/fiber';
import { NodeField } from './NodeField';
import { CameraRig } from './CameraRig';
import type { NetworkConfig } from '../../three/networkConfig';

interface SceneProps {
  config: NetworkConfig;
  animated: boolean;
  frameloop: 'always' | 'never';
}

export function Scene({ config, animated, frameloop }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 14], fov: 55 }}
      dpr={[1, config.dpr]}
      frameloop={frameloop}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
    >
      <CameraRig parallax={config.parallax} animated={animated} />
      <NodeField
        nodeCount={config.nodeCount}
        maxConnections={config.maxConnections}
        animated={animated}
      />
    </Canvas>
  );
}
```

- [ ] **Step 5: Crear `src/components/SceneCanvas/SceneCanvas.tsx`**

```tsx
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { supportsWebGL } from '../../three/supportsWebGL';
import { getNetworkConfig } from '../../three/networkConfig';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import styles from './SceneCanvas.module.css';

// El chunk de three/R3F se descarga después de la pintura inicial — no bloquea el LCP.
const Scene = lazy(() => import('./Scene').then((m) => ({ default: m.Scene })));

export function SceneCanvas() {
  const reducedMotion = usePrefersReducedMotion();
  const [webgl] = useState(() => supportsWebGL());
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onVisibility = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const isMobile = useMemo(() => window.matchMedia('(max-width: 768px)').matches, []);

  if (!webgl) {
    return <div className={styles.staticFallback} aria-hidden="true" data-testid="scene-fallback" />;
  }

  const config = getNetworkConfig(isMobile);

  return (
    <div className={styles.container} aria-hidden="true">
      <Suspense fallback={null}>
        <Scene
          config={config}
          animated={!reducedMotion}
          frameloop={visible ? 'always' : 'never'}
        />
      </Suspense>
    </div>
  );
}
```

- [ ] **Step 6: Correr y verificar que pasa**

Run: `npm run test -- SceneCanvas`
Expected: PASS — jsdom no tiene WebGL → se renderiza el fallback estático; el chunk lazy de `Scene` ni se resuelve.

- [ ] **Step 7: Commit**

```bash
git add src/components/SceneCanvas/Scene.tsx src/components/SceneCanvas/SceneCanvas.tsx src/components/SceneCanvas/SceneCanvas.module.css src/components/SceneCanvas/SceneCanvas.test.tsx
git commit -m "feat: add SceneCanvas container with lazy scene and CSS fallback"
```

---

### Task 15: Overlays — estilos, ensamblaje de App y verificación en navegador

Adapta la base de Fase 1 a overlays sobre la escena: secciones a pantalla completa (definen la longitud del viaje), paneles semitransparentes para contraste, hero sin fondo propio, y monta `SceneCanvas` + `useScrollJourney` en `App`.

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/components/Hero/Hero.module.css`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Modificar `src/styles/global.css`** — reemplazar el contenido completo por:

```css
*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
}

/* Lenis gestiona el smooth scroll — sin scroll-behavior nativo (conflicto) */
html.lenis, html.lenis body {
  height: auto;
}
.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}

h1, h2, h3, h4 {
  font-family: var(--font-mono);
  margin: 0;
  color: var(--color-node-highlight);
}

a {
  color: var(--color-accent);
}

button {
  font-family: var(--font-mono);
}

/* Cada sección es una parada del viaje: pantalla completa, contenido centrado */
section {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--space-6) var(--space-3);
}

/* El contenido va por encima del canvas fijo (z-index 0) */
.content {
  position: relative;
  z-index: 1;
}

/* Panel semitransparente para legibilidad sobre la escena */
.section-inner {
  max-width: var(--max-width);
  margin: 0 auto;
  width: 100%;
  background: rgba(6, 10, 7, 0.55);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(28, 107, 58, 0.35);
  border-radius: 12px;
  padding: var(--space-4);
}

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

- [ ] **Step 2: Modificar `src/components/Hero/Hero.module.css`** — reemplazar solo la regla `.hero` existente (la escena debe verse detrás, sin fondo propio):

```css
.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: var(--space-3);
  padding: var(--space-3);
}
```

(El resto de reglas de `Hero.module.css` no cambian.)

- [ ] **Step 3: Reemplazar `src/App.tsx`**

```tsx
import { SceneCanvas } from './components/SceneCanvas/SceneCanvas';
import { Nav } from './components/Nav/Nav';
import { Hero } from './components/Hero/Hero';
import { Manifesto } from './components/Manifesto/Manifesto';
import { Services } from './components/Services/Services';
import { Projects } from './components/Projects/Projects';
import { Testimonials } from './components/Testimonials/Testimonials';
import { Contact } from './components/Contact/Contact';
import { Footer } from './components/Footer/Footer';
import { useScrollJourney } from './hooks/useScrollJourney';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';

export default function App() {
  const reducedMotion = usePrefersReducedMotion();
  useScrollJourney(!reducedMotion);

  return (
    <>
      <SceneCanvas />
      <div className="content">
        <Nav />
        <Hero />
        <Manifesto />
        <Services />
        <Projects />
        <Testimonials />
        <Contact />
        <Footer />
      </div>
    </>
  );
}
```

- [ ] **Step 4: Actualizar `src/App.test.tsx`** — mockear el hook de scroll (Lenis/GSAP reales no aportan nada en jsdom):

```tsx
// src/App.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('./hooks/useScrollJourney', () => ({ useScrollJourney: vi.fn() }));

const App = (await import('./App')).default;

describe('App', () => {
  it('renders all sections in order: Hero, Manifesto, Services, Projects, Testimonials, Contact, Footer', () => {
    render(<App />);
    const headings = screen.getAllByRole('heading', { level: 1 }).concat(screen.getAllByRole('heading', { level: 2 }));
    const headingTexts = headings.map((h) => h.textContent);
    expect(headingTexts).toEqual([
      'DETECTAMOS LA ANOMALÍA.',
      'Sobre nosotros',
      'Servicios',
      'Proyectos',
      'Testimonios',
      '¿Tienes una anomalía que resolver?',
    ]);
  });

  it('mounts the scene fallback behind the content under jsdom', () => {
    render(<App />);
    expect(screen.getByTestId('scene-fallback')).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Correr toda la suite**

Run: `npm run test`
Expected: PASS — Fase 1 + todos los módulos nuevos.

- [ ] **Step 6: Verificación manual en navegador**

Run: `npm run dev`
Abrir `http://localhost:5173` y confirmar:
- El campo de nodos 3D se ve detrás del hero; un nodo verde neón pulsa a lo lejos (la anomalía) cerca del centro.
- El scroll es suave (Lenis) y la cámara avanza por la escena; la red cambia de formación al pasar por cada sección (grilla en Manifiesto, clústeres en Servicios, claro en Proyectos, anillos en Testimonios, convergencia en Contacto).
- En Contacto, la cámara queda frente al nodo anómalo pulsando de cerca; en el Footer, la escena se atenúa.
- Mover el mouse en el hero produce parallax leve; al avanzar, el parallax desaparece.
- Los paneles de contenido son legibles sobre la escena.
- En la pestaña Network de DevTools, el chunk de three se descarga en petición separada tras la carga inicial.

- [ ] **Step 7: Commit**

```bash
git add src/styles/global.css src/components/Hero/Hero.module.css src/App.tsx src/App.test.tsx
git commit -m "feat: assemble immersive journey — overlays over persistent scene"
```

---

### Task 16: Hover de card de servicio → clúster iluminado

**Files:**
- Modify: `src/components/Services/Services.tsx`
- Modify: `src/components/Services/Services.test.tsx`

- [ ] **Step 1: Añadir el test que falla** — reemplazar `src/components/Services/Services.test.tsx`:

```tsx
// src/components/Services/Services.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { Services } from './Services';
import { services } from '../../content/services';
import { useUiStore } from '../../store/uiStore';

describe('Services', () => {
  beforeEach(() => {
    useUiStore.setState({ hoveredService: -1 });
  });

  it('renders one card per service with title and description', () => {
    render(<Services />);
    services.forEach((service) => {
      expect(screen.getByRole('heading', { name: service.title })).toBeInTheDocument();
      expect(screen.getByText(service.description)).toBeInTheDocument();
    });
  });

  it('sets the hovered service index in the UI store on mouse enter/leave', () => {
    render(<Services />);
    const thirdCard = screen.getByRole('heading', { name: services[2].title }).closest('article')!;
    // mouseOver/mouseOut (burbujean) — React deriva onMouseEnter/onMouseLeave de ellos;
    // fireEvent.mouseEnter no dispara los handlers sintéticos de React de forma confiable.
    fireEvent.mouseOver(thirdCard);
    expect(useUiStore.getState().hoveredService).toBe(2);
    fireEvent.mouseOut(thirdCard);
    expect(useUiStore.getState().hoveredService).toBe(-1);
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test -- Services`
Expected: FAIL — el componente aún no escribe en el store.

- [ ] **Step 3: Reemplazar `src/components/Services/Services.tsx`**

```tsx
import { services } from '../../content/services';
import { useUiStore } from '../../store/uiStore';
import styles from './Services.module.css';

export function Services() {
  const setHoveredService = useUiStore((s) => s.setHoveredService);

  return (
    <section id="servicios" className="section-inner">
      <h2>Servicios</h2>
      <div className={styles.grid}>
        {services.map((service, index) => (
          <article
            className={styles.card}
            key={service.id}
            onMouseEnter={() => setHoveredService(index)}
            onMouseLeave={() => setHoveredService(-1)}
          >
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
```

Nota: `section-inner` va en el `<section>` para heredar el panel; si en la base de Fase 1 la clase estaba en un `div` interior, mover la clase al `section` como aquí.

- [ ] **Step 4: Correr y verificar que pasa**

Run: `npm run test -- Services`
Expected: PASS.

- [ ] **Step 5: Verificación manual**

Run: `npm run dev`
En la sección Servicios, pasar el mouse por una card → su clúster de nodos en la escena sube de brillo/tamaño; al salir, vuelve a la normalidad.

- [ ] **Step 6: Commit**

```bash
git add src/components/Services/Services.tsx src/components/Services/Services.test.tsx
git commit -m "feat: light up service cluster on card hover"
```

---

### Task 17: Componente `Reveal` — texto que aparece al hacer scroll

**Files:**
- Create: `src/components/Reveal/Reveal.tsx`
- Test: `src/components/Reveal/Reveal.test.tsx`
- Modify: `src/components/Manifesto/Manifesto.tsx`

- [ ] **Step 1: Escribir el test que falla**

```tsx
// src/components/Reveal/Reveal.test.tsx
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('gsap', () => ({
  default: {
    registerPlugin: vi.fn(),
    fromTo: vi.fn(() => ({ kill: vi.fn(), scrollTrigger: { kill: vi.fn() } })),
  },
}));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }));

const gsap = (await import('gsap')).default;
const { Reveal } = await import('./Reveal');

describe('Reveal', () => {
  it('renders its children', () => {
    const { getByText } = render(
      <Reveal>
        <p>Hola</p>
      </Reveal>,
    );
    expect(getByText('Hola')).toBeInTheDocument();
  });

  it('registers a scroll-triggered fromTo tween from hidden to visible', () => {
    render(
      <Reveal>
        <p>Hola</p>
      </Reveal>,
    );
    expect(gsap.fromTo).toHaveBeenCalledTimes(1);
    const call = (gsap.fromTo as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
    expect(call[1]).toMatchObject({ opacity: 0, y: 24 });
    expect(call[2]).toMatchObject({ opacity: 1, y: 0 });
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test -- Reveal`
Expected: FAIL — `./Reveal` no existe.

- [ ] **Step 3: Crear `src/components/Reveal/Reveal.tsx`**

```tsx
import { PropsWithChildren, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function Reveal({ children }: PropsWithChildren) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tween = gsap.fromTo(
      el,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
```

- [ ] **Step 4: Aplicar `Reveal` en el Manifiesto** — reemplazar `src/components/Manifesto/Manifesto.tsx`:

```tsx
import { manifestoContent } from '../../content/manifesto';
import { Reveal } from '../Reveal/Reveal';
import styles from './Manifesto.module.css';

export function Manifesto() {
  return (
    <section id="manifiesto" className={`section-inner ${styles.manifesto}`}>
      <Reveal>
        <h2>{manifestoContent.heading}</h2>
      </Reveal>
      <Reveal>
        <p className={styles.body}>{manifestoContent.body}</p>
      </Reveal>
      <div className={styles.stats}>
        {manifestoContent.stats.map((stat) => (
          <div className={styles.stat} key={stat.label}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
```

Aplicar el mismo patrón (envolver solo el `<h2>` en `<Reveal>`) en `Services.tsx`, `Projects.tsx`, `Testimonials.tsx` y `Contact.tsx` — un solo cambio por archivo: `<h2>…</h2>` → `<Reveal><h2>…</h2></Reveal>` + `import { Reveal } from '../Reveal/Reveal';`.

- [ ] **Step 5: Correr toda la suite**

Run: `npm run test`
Expected: PASS — los tests de sección de Fase 1 siguen pasando: `Reveal` solo envuelve en un `<div>`; gsap real queda inerte en jsdom (no lanza).

- [ ] **Step 6: Commit**

```bash
git add src/components/Reveal src/components/Manifesto/Manifesto.tsx src/components/Services/Services.tsx src/components/Projects/Projects.tsx src/components/Testimonials/Testimonials.tsx src/components/Contact/Contact.tsx
git commit -m "feat: add scroll-triggered reveal to section headings"
```

---

### Task 18: Componente `MagneticButton` (CTAs del hero)

**Files:**
- Create: `src/components/MagneticButton/MagneticButton.tsx`
- Test: `src/components/MagneticButton/MagneticButton.test.tsx`
- Modify: `src/components/Hero/Hero.tsx`
- Modify: `src/components/Hero/Hero.test.tsx`

- [ ] **Step 1: Escribir el test que falla**

```tsx
// src/components/MagneticButton/MagneticButton.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('gsap', () => ({
  default: { quickTo: vi.fn(() => vi.fn()) },
}));

const gsap = (await import('gsap')).default;
const { MagneticButton } = await import('./MagneticButton');

describe('MagneticButton', () => {
  it('renders as a link with the given href and className', () => {
    render(
      <MagneticButton href="#contacto" className="my-cta">
        Hablemos
      </MagneticButton>,
    );
    const link = screen.getByRole('link', { name: 'Hablemos' });
    expect(link).toHaveAttribute('href', '#contacto');
    expect(link).toHaveClass('my-cta');
  });

  it('sets up quickTo tweens for x and y on mount', () => {
    render(<MagneticButton href="#contacto">Hablemos</MagneticButton>);
    expect(gsap.quickTo).toHaveBeenCalledWith(expect.anything(), 'x', expect.objectContaining({ duration: 0.4 }));
    expect(gsap.quickTo).toHaveBeenCalledWith(expect.anything(), 'y', expect.objectContaining({ duration: 0.4 }));
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test -- MagneticButton`
Expected: FAIL — `./MagneticButton` no existe.

- [ ] **Step 3: Crear `src/components/MagneticButton/MagneticButton.tsx`**

```tsx
import { PropsWithChildren, useEffect, useRef } from 'react';
import gsap from 'gsap';

interface MagneticButtonProps {
  href: string;
  className?: string;
  strength?: number;
}

export function MagneticButton({
  href,
  className,
  strength = 0.3,
  children,
}: PropsWithChildren<MagneticButtonProps>) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });

    function handleMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      xTo(relX * strength);
      yTo(relY * strength);
    }

    function handleLeave() {
      xTo(0);
      yTo(0);
    }

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [strength]);

  return (
    <a ref={ref} href={href} className={className}>
      {children}
    </a>
  );
}
```

- [ ] **Step 4: Usar `MagneticButton` en los CTAs del Hero** — reemplazar `src/components/Hero/Hero.tsx`:

```tsx
import { heroContent } from '../../content/hero';
import { MagneticButton } from '../MagneticButton/MagneticButton';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section id="top" className={styles.hero}>
      <span className={styles.eyebrow}>{heroContent.eyebrow}</span>
      <h1 className={styles.headline}>{heroContent.headline}</h1>
      <p className={styles.subheadline}>{heroContent.subheadline}</p>
      <div className={styles.ctas}>
        <MagneticButton className={styles.ctaPrimary} href={heroContent.primaryCta.href}>
          {heroContent.primaryCta.label}
        </MagneticButton>
        <MagneticButton className={styles.ctaSecondary} href={heroContent.secondaryCta.href}>
          {heroContent.secondaryCta.label}
        </MagneticButton>
      </div>
      <span className={styles.scrollHint}>{heroContent.scrollHint}</span>
    </section>
  );
}
```

- [ ] **Step 5: Actualizar `src/components/Hero/Hero.test.tsx`** — mockear gsap:

```tsx
// src/components/Hero/Hero.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('gsap', () => ({
  default: { quickTo: vi.fn(() => vi.fn()) },
}));

const { Hero } = await import('./Hero');

describe('Hero', () => {
  it('renders headline, subheadline and both CTAs from content', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { name: 'DETECTAMOS LA ANOMALÍA.' })).toBeInTheDocument();
    expect(screen.getByText('Software que no sigue el molde.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver proyectos' })).toHaveAttribute('href', '#proyectos');
    expect(screen.getByRole('link', { name: 'Hablemos' })).toHaveAttribute('href', '#contacto');
  });
});
```

- [ ] **Step 6: Correr toda la suite**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/MagneticButton src/components/Hero/Hero.tsx src/components/Hero/Hero.test.tsx
git commit -m "feat: add magnetic button interaction to hero CTAs"
```

---

### Task 19: Componente `SoundToggle` (sonido ambiental opcional)

**Files:**
- Create: `src/components/SoundToggle/SoundToggle.tsx`
- Create: `src/components/SoundToggle/SoundToggle.module.css`
- Test: `src/components/SoundToggle/SoundToggle.test.tsx`
- Modify: `src/components/Nav/Nav.tsx`
- Modify: `src/components/Nav/Nav.test.tsx`

- [ ] **Step 1: Escribir el test que falla**

```tsx
// src/components/SoundToggle/SoundToggle.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { SoundToggle } from './SoundToggle';

class MockOscillator {
  type = '';
  frequency = { value: 0 };
  connect() { return this; }
  start() {}
  stop() {}
}
class MockGain {
  gain = { value: 0, linearRampToValueAtTime: () => {} };
  connect() { return this; }
}
class MockAudioContext {
  currentTime = 0;
  createOscillator() { return new MockOscillator(); }
  createGain() { return new MockGain(); }
  destination = {};
  close() {}
}

describe('SoundToggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    // @ts-expect-error test override, jsdom has no real Web Audio API
    global.AudioContext = MockAudioContext;
  });

  it('starts disabled by default', () => {
    render(<SoundToggle />);
    expect(screen.getByRole('button')).toHaveTextContent('Sonido: desactivado');
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('enables sound on click, updates the label, and persists the preference', () => {
    render(<SoundToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('Sonido: activado');
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    expect(window.localStorage.getItem('anomalydevs:sound-enabled')).toBe('true');
  });

  it('restores the persisted preference on mount', () => {
    window.localStorage.setItem('anomalydevs:sound-enabled', 'true');
    render(<SoundToggle />);
    expect(screen.getByRole('button')).toHaveTextContent('Sonido: activado');
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test -- SoundToggle`
Expected: FAIL — `./SoundToggle` no existe.

- [ ] **Step 3: Crear `src/components/SoundToggle/SoundToggle.module.css`**

```css
.toggle {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  border-radius: 999px;
  padding: 0.35rem 0.8rem;
  font-size: 0.7rem;
  cursor: pointer;
}

.toggle[aria-pressed='true'] {
  color: var(--color-accent);
  border-color: var(--color-accent);
}
```

- [ ] **Step 4: Crear `src/components/SoundToggle/SoundToggle.tsx`**

```tsx
import { useEffect, useState } from 'react';
import styles from './SoundToggle.module.css';

const STORAGE_KEY = 'anomalydevs:sound-enabled';

export function SoundToggle() {
  const [enabled, setEnabled] = useState(() => window.localStorage.getItem(STORAGE_KEY) === 'true');

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(enabled));

    if (enabled) {
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 110;
      gain.gain.value = 0;
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start();
      gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 1.2);

      return () => {
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        oscillator.stop(ctx.currentTime + 0.3);
        ctx.close();
      };
    }

    return undefined;
  }, [enabled]);

  return (
    <button
      type="button"
      className={styles.toggle}
      aria-pressed={enabled}
      onClick={() => setEnabled((v) => !v)}
    >
      {enabled ? 'Sonido: activado' : 'Sonido: desactivado'}
    </button>
  );
}
```

- [ ] **Step 5: Añadir `SoundToggle` al Nav** — reemplazar `src/components/Nav/Nav.tsx`:

```tsx
import { navSections } from '../../content/nav';
import { SoundToggle } from '../SoundToggle/SoundToggle';
import styles from './Nav.module.css';

export function Nav() {
  return (
    <nav className={styles.nav}>
      <a className={styles.logo} href="#top">anomalydevs</a>
      <ul className={styles.links}>
        {navSections.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`}>{section.label}</a>
          </li>
        ))}
      </ul>
      <SoundToggle />
    </nav>
  );
}
```

- [ ] **Step 6: Actualizar `src/components/Nav/Nav.test.tsx`** — mockear el Web Audio API:

```tsx
// src/components/Nav/Nav.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { Nav } from './Nav';

class MockAudioContext {
  currentTime = 0;
  createOscillator() {
    return { type: '', frequency: { value: 0 }, connect() { return this; }, start() {}, stop() {} };
  }
  createGain() {
    return { gain: { value: 0, linearRampToValueAtTime: () => {} }, connect() { return this; } };
  }
  destination = {};
  close() {}
}

describe('Nav', () => {
  beforeEach(() => {
    // @ts-expect-error test override, jsdom has no real Web Audio API
    global.AudioContext = MockAudioContext;
  });

  it('renders a link for each nav section plus the logo wordmark', () => {
    render(<Nav />);
    expect(screen.getByText('anomalydevs')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Servicios' })).toHaveAttribute('href', '#servicios');
    expect(screen.getByRole('link', { name: 'Proyectos' })).toHaveAttribute('href', '#proyectos');
    expect(screen.getByRole('link', { name: 'Testimonios' })).toHaveAttribute('href', '#testimonios');
    expect(screen.getByRole('link', { name: 'Contacto' })).toHaveAttribute('href', '#contacto');
  });
});
```

- [ ] **Step 7: Correr toda la suite**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 8: Verificación manual**

Run: `npm run dev`
El botón "Sonido: desactivado" en el nav no reproduce nada al cargar; al hacer clic activa un tono ambiental sutil; recargar y confirmar que el estado persiste.

- [ ] **Step 9: Commit**

```bash
git add src/components/SoundToggle src/components/Nav/Nav.tsx src/components/Nav/Nav.test.tsx
git commit -m "feat: add optional ambient sound toggle to nav"
```

---

### Task 20: QA final (checklist manual del §9 del spec)

No hay código nuevo — verificación manual de la experiencia completa.

- [ ] **Step 1: Build + Lighthouse**

Run: `npm run build && npm run preview`
Correr Lighthouse (Chrome DevTools) en desktop y mobile. Revisar performance y accesibilidad. Anotar hallazgos (p. ej. peso del chunk de three) para optimización futura.

- [ ] **Step 2: Fluidez del viaje**

Scrollear de punta a punta en desktop: objetivo 60 fps sin jank visible (DevTools → Performance). Confirmar que las 6 transiciones de formación se ven continuas (nunca hay un "corte").

- [ ] **Step 3: Cross-browser**

Chrome, Firefox y Safari (o equivalente disponible): la escena se ve, el scroll suave funciona, sin errores en consola.

- [ ] **Step 4: `prefers-reduced-motion`**

DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce". Recargar: la escena queda estática en la formación del hero (sin viaje, sin pulso), el scroll es nativo y el contenido es totalmente usable.

- [ ] **Step 5: Fallback sin WebGL**

Deshabilitar WebGL (`chrome://flags` o `--disable-webgl`), recargar: aparece el fondo estático CSS con gradientes de marca — sin errores ni hueco en blanco.

- [ ] **Step 6: Mobile**

DevTools → device toolbar (ej. iPhone 12): menos nodos, DPR 1, sin parallax; overlays legibles y touch targets cómodos; scroll fluido.

- [ ] **Step 7: Sonido y hover**

Toggle de sonido: sin autoplay, persiste tras recarga. Hover de cards de Servicios ilumina el clúster correcto (card 1 → clúster izquierdo más cercano, etc.).

- [ ] **Step 8: Working tree limpio**

Run: `git status`
Expected: limpio — todo committeado en los tasks anteriores.

---

## Resumen

Al terminar este plan, la landing de AnomalyDevs es la experiencia inmersiva del spec 2026-07-10: escena de nodos persistente con viaje de cámara scroll-driven por 7 paradas y 6 formaciones, overlays HTML accesibles, hover servicio→clúster, botones magnéticos, reveals, sonido opcional, y fallbacks completos (reduced-motion, sin WebGL, móvil) — con toda la lógica no-visual cubierta por tests.
