# AnomalyDevs Landing — Fase 2: Red de nodos 3D e interactividad — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir la capa "espectacular" sobre la landing estática de la Fase 1: la red de nodos 3D interactiva (hero + transiciones entre secciones), su fallback sin WebGL, sonido ambiental opcional, botones magnéticos y reveal de texto al hacer scroll — con manejo de `prefers-reduced-motion` y de dispositivos móviles.

**Architecture:** Un único componente `NodeNetworkContainer` fijo de fondo (`position: fixed`, detrás de todo el contenido) que se monta/desmonta según una máquina de estados (`hero` / `transition` / `hidden`) manejada por un hook que usa GSAP ScrollTrigger. Usa Three.js real (`react-three-fiber`) cuando hay soporte WebGL, y un fallback en `<canvas>` 2D en caso contrario. La geometría de la red (posiciones de nodos + conexiones) es lógica pura, reutilizada por ambos renderers y cubierta por tests. El resto de la interactividad (reveal de texto, botones magnéticos, sonido) son componentes/hooks independientes que se insertan sobre las secciones ya construidas en la Fase 1.

**Tech Stack:** `three`, `@react-three/fiber`, `@react-three/drei`, `gsap` (+ `ScrollTrigger`). Se apoya en el proyecto Vite/React/TS/Vitest ya scaffoldeado en la Fase 1.

**Precondición:** El plan de Fase 1 (`docs/superpowers/plans/2026-07-07-anomalydevs-landing-static.md`) ya está implementado — existen `src/App.tsx`, `src/components/{Nav,Hero,Manifesto,Services,Projects,Testimonials,Contact,Footer}` y `src/styles/{tokens.css,global.css}`.

---

### Task 1: Instalar dependencias de 3D y animación

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Instalar dependencias**

Run: `npm install three @react-three/fiber @react-three/drei gsap`
Expected: termina sin errores (exit code 0), `package.json` gana 4 entradas en `dependencies`.

- [ ] **Step 2: Instalar tipos de desarrollo**

Run: `npm install -D @types/three`
Expected: termina sin errores (exit code 0).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add three.js, react-three-fiber, drei and gsap dependencies"
```

---

### Task 2: Mock de `window.matchMedia` en el test setup

Varios hooks de esta fase (`usePrefersReducedMotion`, la detección de móvil) usan `window.matchMedia`, que **jsdom no implementa por defecto**. Sin este mock, cualquier test que monte un componente que lo use lanza `TypeError: window.matchMedia is not a function` — incluido el `App.test.tsx` ya existente de la Fase 1.

**Files:**
- Modify: `src/test-setup.ts`

- [ ] **Step 1: Añadir el mock por defecto**

Reemplazar el contenido completo de `src/test-setup.ts` por:

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

- [ ] **Step 2: Verificar que la suite existente (Fase 1) sigue pasando**

Run: `npm run test`
Expected: PASS — mismos tests que al final de la Fase 1, ahora con el mock disponible.

- [ ] **Step 3: Commit**

```bash
git add src/test-setup.ts
git commit -m "test: add default window.matchMedia mock for jsdom"
```

---

### Task 3: Geometría de la red (lógica pura, reutilizada por WebGL y fallback)

**Files:**
- Create: `src/three/networkGeometry.ts`
- Test: `src/three/networkGeometry.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```ts
// src/three/networkGeometry.test.ts
import { describe, it, expect } from 'vitest';
import { generateNetworkNodes, buildConnections } from './networkGeometry';

describe('generateNetworkNodes', () => {
  it('returns exactly `count` nodes with exactly one marked as anomaly', () => {
    const nodes = generateNetworkNodes(50, 1);
    expect(nodes).toHaveLength(50);
    expect(nodes.filter((n) => n.isAnomaly)).toHaveLength(1);
  });

  it('is deterministic for a given seed', () => {
    const a = generateNetworkNodes(20, 42);
    const b = generateNetworkNodes(20, 42);
    expect(a).toEqual(b);
  });

  it('produces different layouts for different seeds', () => {
    const a = generateNetworkNodes(20, 1);
    const b = generateNetworkNodes(20, 2);
    expect(a).not.toEqual(b);
  });
});

describe('buildConnections', () => {
  it('only connects node pairs within maxDistance, with no self-connections', () => {
    const nodes = [
      { position: [0, 0, 0] as [number, number, number], isAnomaly: false },
      { position: [0.5, 0, 0] as [number, number, number], isAnomaly: false },
      { position: [10, 10, 10] as [number, number, number], isAnomaly: false },
    ];
    const segments = buildConnections(nodes, 1);
    expect(segments).toHaveLength(6);
    expect(Array.from(segments)).toEqual([0, 0, 0, 0.5, 0, 0]);
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test`
Expected: FAIL — `./networkGeometry` no existe.

- [ ] **Step 3: Crear `src/three/networkGeometry.ts`**

```ts
export interface NetworkNode {
  position: [number, number, number];
  isAnomaly: boolean;
}

export function generateNetworkNodes(count: number, seed = 1): NetworkNode[] {
  let s = seed;
  function rand() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  }
  const nodes: NetworkNode[] = [];
  for (let i = 0; i < count; i++) {
    nodes.push({
      position: [(rand() - 0.5) * 10, (rand() - 0.5) * 10, (rand() - 0.5) * 10],
      isAnomaly: false,
    });
  }
  const anomalyIndex = Math.floor(count / 2);
  nodes[anomalyIndex].isAnomaly = true;
  return nodes;
}

export function buildConnections(nodes: NetworkNode[], maxDistance: number): Float32Array {
  const segments: number[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const [x1, y1, z1] = nodes[i].position;
      const [x2, y2, z2] = nodes[j].position;
      const distance = Math.hypot(x1 - x2, y1 - y2, z1 - z2);
      if (distance < maxDistance) {
        segments.push(x1, y1, z1, x2, y2, z2);
      }
    }
  }
  return new Float32Array(segments);
}
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/three/networkGeometry.ts src/three/networkGeometry.test.ts
git commit -m "feat: add deterministic node network geometry generator"
```

---

### Task 4: Configuración de la red según dispositivo

**Files:**
- Create: `src/three/networkConfig.ts`
- Test: `src/three/networkConfig.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```ts
// src/three/networkConfig.test.ts
import { describe, it, expect } from 'vitest';
import { getNetworkConfig } from './networkConfig';

describe('getNetworkConfig', () => {
  it('reduces node count and disables drag on mobile', () => {
    expect(getNetworkConfig(true)).toEqual({ nodeCount: 150, allowDrag: false });
  });

  it('uses full node count and allows drag on desktop', () => {
    expect(getNetworkConfig(false)).toEqual({ nodeCount: 400, allowDrag: true });
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test`
Expected: FAIL — `./networkConfig` no existe.

- [ ] **Step 3: Crear `src/three/networkConfig.ts`**

```ts
export interface NetworkConfig {
  nodeCount: number;
  allowDrag: boolean;
}

export function getNetworkConfig(isMobile: boolean): NetworkConfig {
  return isMobile ? { nodeCount: 150, allowDrag: false } : { nodeCount: 400, allowDrag: true };
}
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/three/networkConfig.ts src/three/networkConfig.test.ts
git commit -m "feat: add device-based network configuration"
```

---

### Task 5: Detección de soporte WebGL

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

Run: `npm run test`
Expected: FAIL — `./supportsWebGL` no existe.

- [ ] **Step 3: Crear `src/three/supportsWebGL.ts`**

```ts
export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/three/supportsWebGL.ts src/three/supportsWebGL.test.ts
git commit -m "feat: add WebGL support detection"
```

---

### Task 6: Hook `usePrefersReducedMotion`

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

Run: `npm run test`
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

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/usePrefersReducedMotion.ts src/hooks/usePrefersReducedMotion.test.ts
git commit -m "feat: add usePrefersReducedMotion hook"
```

---

### Task 7: Escena 3D `NodeNetworkScene` (react-three-fiber)

Esta escena usa WebGL real — **no corre en jsdom**, así que no lleva test automatizado. Se verifica manualmente en el Task 10 (cuando ya está montada en la página) y en el checklist final (Task 14).

**Files:**
- Create: `src/components/NodeNetwork/NodeNetworkScene.tsx`

- [ ] **Step 1: Crear `src/components/NodeNetwork/NodeNetworkScene.tsx`**

```tsx
import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { generateNetworkNodes, buildConnections } from '../../three/networkGeometry';

interface SceneContentProps {
  interactive: boolean;
  nodeCount: number;
}

function SceneContent({ interactive, nodeCount }: SceneContentProps) {
  const nodes = useMemo(() => generateNetworkNodes(nodeCount, 42), [nodeCount]);
  const anomalyRef = useRef<THREE.Mesh>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(nodes.length * 3);
    nodes.forEach((n, i) => {
      arr[i * 3] = n.position[0];
      arr[i * 3 + 1] = n.position[1];
      arr[i * 3 + 2] = n.position[2];
    });
    return arr;
  }, [nodes]);

  const linePositions = useMemo(() => buildConnections(nodes, 1.8), [nodes]);
  const anomaly = nodes.find((n) => n.isAnomaly)!;

  useFrame((state) => {
    if (anomalyRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.25;
      anomalyRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#9DFFC0" size={0.05} transparent opacity={0.6} sizeAttenuation />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#1C6B3A" transparent opacity={0.35} />
      </lineSegments>
      <mesh ref={anomalyRef} position={anomaly.position}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#33FF77" />
      </mesh>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={interactive}
        autoRotate={!interactive}
        autoRotateSpeed={0.5}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
      />
    </>
  );
}

export interface NodeNetworkSceneProps {
  interactive?: boolean;
  nodeCount?: number;
}

export function NodeNetworkScene({ interactive = true, nodeCount = 400 }: NodeNetworkSceneProps) {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 1.5]}>
      <SceneContent interactive={interactive} nodeCount={nodeCount} />
    </Canvas>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/NodeNetwork/NodeNetworkScene.tsx
git commit -m "feat: add WebGL node network scene with react-three-fiber"
```

---

### Task 8: Fallback `NodeNetworkFallback` (Canvas2D, sin WebGL)

**Files:**
- Create: `src/components/NodeNetwork/NodeNetworkFallback.tsx`
- Test: `src/components/NodeNetwork/NodeNetworkFallback.test.tsx`

- [ ] **Step 1: Escribir el test que falla**

```tsx
// src/components/NodeNetwork/NodeNetworkFallback.test.tsx
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NodeNetworkFallback } from './NodeNetworkFallback';

describe('NodeNetworkFallback', () => {
  it('renders a canvas element and unmounts cleanly (jsdom has no real 2D context, the component must guard for that)', () => {
    const { container, unmount } = render(<NodeNetworkFallback />);
    expect(container.querySelector('canvas')).toBeInTheDocument();
    unmount();
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test`
Expected: FAIL — `./NodeNetworkFallback` no existe.

- [ ] **Step 3: Crear `src/components/NodeNetwork/NodeNetworkFallback.tsx`**

```tsx
import { useEffect, useRef } from 'react';
import { generateNetworkNodes, buildConnections } from '../../three/networkGeometry';

interface NodeNetworkFallbackProps {
  interactive?: boolean;
}

export function NodeNetworkFallback({ interactive: _interactive = true }: NodeNetworkFallbackProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const nodes = generateNetworkNodes(120, 7);
    const connections = buildConnections(nodes, 1.8);
    const anomalyIndex = nodes.findIndex((n) => n.isAnomaly);

    function project(p: [number, number, number]): [number, number] {
      return [width / 2 + p[0] * (width / 14), height / 2 + p[1] * (height / 14)];
    }

    function handleResize() {
      width = canvas!.width = window.innerWidth;
      height = canvas!.height = window.innerHeight;
    }
    window.addEventListener('resize', handleResize);

    let raf: number;
    function draw() {
      frame += 1;
      ctx!.fillStyle = 'rgba(6, 10, 7, 0.4)';
      ctx!.fillRect(0, 0, width, height);

      ctx!.strokeStyle = 'rgba(28, 107, 58, 0.5)';
      ctx!.lineWidth = 1;
      for (let i = 0; i < connections.length; i += 6) {
        const [x1, y1] = project([connections[i], connections[i + 1], connections[i + 2]]);
        const [x2, y2] = project([connections[i + 3], connections[i + 4], connections[i + 5]]);
        ctx!.beginPath();
        ctx!.moveTo(x1, y1);
        ctx!.lineTo(x2, y2);
        ctx!.stroke();
      }

      nodes.forEach((node, i) => {
        const [x, y] = project(node.position);
        if (i === anomalyIndex) {
          const pulse = 4 + Math.sin(frame * 0.05) * 2;
          ctx!.fillStyle = '#33FF77';
          ctx!.beginPath();
          ctx!.arc(x, y, pulse, 0, Math.PI * 2);
          ctx!.fill();
        } else {
          ctx!.fillStyle = 'rgba(157, 255, 192, 0.5)';
          ctx!.beginPath();
          ctx!.arc(x, y, 1.6, 0, Math.PI * 2);
          ctx!.fill();
        }
      });

      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />;
}
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `npm run test`
Expected: PASS. Nota: jsdom imprime en consola `Error: Not implemented: HTMLCanvasElement.prototype.getContext (without installing the canvas npm package)` — es ruido esperado (jsdom no tiene un renderer 2D real), no una falla del test; el componente ya lo maneja con el `if (!ctx) return;`.

- [ ] **Step 5: Commit**

```bash
git add src/components/NodeNetwork/NodeNetworkFallback.tsx src/components/NodeNetwork/NodeNetworkFallback.test.tsx
git commit -m "feat: add Canvas2D fallback for devices without WebGL"
```

---

### Task 9: Hook `useNodeNetworkState` (máquina de estados con GSAP ScrollTrigger)

**Files:**
- Create: `src/hooks/useNodeNetworkState.ts`
- Test: `src/hooks/useNodeNetworkState.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```ts
// src/hooks/useNodeNetworkState.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const createMock = vi.fn();
vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: (config: Record<string, unknown>) => createMock(config),
  },
}));
vi.mock('gsap', () => ({
  default: { registerPlugin: vi.fn() },
}));

const { useNodeNetworkState } = await import('./useNodeNetworkState');

interface FakeTrigger {
  onEnter?: () => void;
  onEnterBack?: () => void;
  onLeave?: () => void;
}

describe('useNodeNetworkState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    createMock.mockClear();
    createMock.mockImplementation(() => ({ kill: vi.fn() }));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('registers one ScrollTrigger for the hero and one per transition ref', () => {
    const heroRef = { current: document.createElement('div') };
    const transitionRefs = [{ current: document.createElement('div') }, { current: document.createElement('div') }];
    renderHook(() => useNodeNetworkState({ heroRef, transitionRefs }));
    expect(createMock).toHaveBeenCalledTimes(3);
  });

  it('starts as "hero" and moves to "hidden" when the hero trigger fires onLeave', () => {
    const heroRef = { current: document.createElement('div') };
    const transitionRefs: { current: HTMLDivElement }[] = [];
    const { result } = renderHook(() => useNodeNetworkState({ heroRef, transitionRefs }));
    expect(result.current).toBe('hero');

    const heroConfig = createMock.mock.calls[0][0] as FakeTrigger;
    act(() => heroConfig.onLeave!());
    expect(result.current).toBe('hidden');
  });

  it('moves to "transition" then back to "hidden" after the timeout when a transition ref fires onEnter', () => {
    const heroRef = { current: document.createElement('div') };
    const transitionRefs = [{ current: document.createElement('div') }];
    const { result } = renderHook(() =>
      useNodeNetworkState({ heroRef, transitionRefs, transitionDurationMs: 900 }),
    );

    const transitionConfig = createMock.mock.calls[1][0] as FakeTrigger;
    act(() => transitionConfig.onEnter!());
    expect(result.current).toBe('transition');

    act(() => vi.advanceTimersByTime(900));
    expect(result.current).toBe('hidden');
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test`
Expected: FAIL — `./useNodeNetworkState` no existe.

- [ ] **Step 3: Crear `src/hooks/useNodeNetworkState.ts`**

```ts
import { useEffect, useState, RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export type NodeNetworkState = 'hero' | 'transition' | 'hidden';

interface UseNodeNetworkStateOptions {
  heroRef: RefObject<Element>;
  transitionRefs: RefObject<Element>[];
  transitionDurationMs?: number;
}

export function useNodeNetworkState({
  heroRef,
  transitionRefs,
  transitionDurationMs = 900,
}: UseNodeNetworkStateOptions): NodeNetworkState {
  const [state, setState] = useState<NodeNetworkState>('hero');

  useEffect(() => {
    const triggers: ScrollTrigger[] = [];
    let hideTimeout: ReturnType<typeof setTimeout> | undefined;

    if (heroRef.current) {
      triggers.push(
        ScrollTrigger.create({
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          onEnter: () => setState('hero'),
          onEnterBack: () => setState('hero'),
          onLeave: () => setState('hidden'),
        }),
      );
    }

    transitionRefs.forEach((ref) => {
      if (!ref.current) return;
      const triggerTransition = () => {
        setState('transition');
        if (hideTimeout) clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => setState('hidden'), transitionDurationMs);
      };
      triggers.push(
        ScrollTrigger.create({
          trigger: ref.current,
          start: 'top center',
          onEnter: triggerTransition,
          onEnterBack: triggerTransition,
        }),
      );
    });

    return () => {
      triggers.forEach((t) => t.kill());
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [heroRef, transitionRefs, transitionDurationMs]);

  return state;
}
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useNodeNetworkState.ts src/hooks/useNodeNetworkState.test.ts
git commit -m "feat: add useNodeNetworkState hook driven by GSAP ScrollTrigger"
```

---

### Task 10: `NodeNetworkContainer` — ensamblar y montar en la página

**Files:**
- Create: `src/components/NodeNetwork/NodeNetworkContainer.tsx`
- Create: `src/components/NodeNetwork/NodeNetworkContainer.module.css`
- Modify: `src/components/Hero/Hero.module.css`
- Modify: `src/App.tsx`

- [ ] **Step 1: Crear `src/components/NodeNetwork/NodeNetworkContainer.module.css`**

```css
.container {
  position: fixed;
  inset: 0;
  z-index: -1;
}
```

- [ ] **Step 2: Crear `src/components/NodeNetwork/NodeNetworkContainer.tsx`**

`NodeNetworkScene` (react-three-fiber/three) y `NodeNetworkFallback` se importan con `lazy()` para que el bundle de Three.js no forme parte del chunk principal ni bloquee el LCP del hero — se descarga después de la pintura inicial (requisito del spec §8).

```tsx
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useNodeNetworkState } from '../../hooks/useNodeNetworkState';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { supportsWebGL } from '../../three/supportsWebGL';
import { getNetworkConfig } from '../../three/networkConfig';
import styles from './NodeNetworkContainer.module.css';

const NodeNetworkScene = lazy(() =>
  import('./NodeNetworkScene').then((m) => ({ default: m.NodeNetworkScene })),
);
const NodeNetworkFallback = lazy(() =>
  import('./NodeNetworkFallback').then((m) => ({ default: m.NodeNetworkFallback })),
);

export function NodeNetworkContainer() {
  const [ready, setReady] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const manifestoRef = useRef<HTMLElement | null>(null);
  const contactRef = useRef<HTMLElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const webglSupportedRef = useRef(supportsWebGL());

  useEffect(() => {
    heroRef.current = document.getElementById('top');
    manifestoRef.current = document.getElementById('manifiesto');
    contactRef.current = document.getElementById('contacto');
    setReady(true);
  }, []);

  const state = useNodeNetworkState({
    heroRef: heroRef as React.RefObject<Element>,
    transitionRefs: [manifestoRef as React.RefObject<Element>, contactRef as React.RefObject<Element>],
  });

  if (!ready || reducedMotion || state === 'hidden') return null;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const { nodeCount, allowDrag } = getNetworkConfig(isMobile);
  const interactive = state === 'hero' && allowDrag;

  return (
    <div
      className={styles.container}
      style={{ pointerEvents: interactive ? 'auto' : 'none' }}
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        {webglSupportedRef.current ? (
          <NodeNetworkScene interactive={interactive} nodeCount={nodeCount} />
        ) : (
          <NodeNetworkFallback interactive={interactive} />
        )}
      </Suspense>
    </div>
  );
}
```

- [ ] **Step 3: Modificar `src/components/Hero/Hero.module.css`**

Reemplazar la regla `.hero` existente (para que el fondo deje ver la red detrás, y para permitir que el drag "atraviese" el texto y llegue al canvas):

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
  background: radial-gradient(circle at 60% 35%, rgba(13, 31, 19, 0.35) 0%, rgba(6, 10, 7, 0.85) 65%);
  pointer-events: none;
}
```

Y añadir `pointer-events: auto;` a la regla `.ctaPrimary, .ctaSecondary` existente, que queda así:

```css
.ctaPrimary, .ctaSecondary {
  font-family: var(--font-mono);
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.9rem;
  pointer-events: auto;
}
```

- [ ] **Step 4: Modificar `src/App.tsx`**

Añadir el import y montar `<NodeNetworkContainer />` como primer hijo:

```tsx
import { NodeNetworkContainer } from './components/NodeNetwork/NodeNetworkContainer';
import { Nav } from './components/Nav/Nav';
import { Hero } from './components/Hero/Hero';
import { Manifesto } from './components/Manifesto/Manifesto';
import { Services } from './components/Services/Services';
import { Projects } from './components/Projects/Projects';
import { Testimonials } from './components/Testimonials/Testimonials';
import { Contact } from './components/Contact/Contact';
import { Footer } from './components/Footer/Footer';

export default function App() {
  return (
    <>
      <NodeNetworkContainer />
      <Nav />
      <Hero />
      <Manifesto />
      <Services />
      <Projects />
      <Testimonials />
      <Contact />
      <Footer />
    </>
  );
}
```

- [ ] **Step 5: Correr toda la suite y verificar que sigue en verde**

Run: `npm run test`
Expected: PASS — incluyendo `App.test.tsx` (Fase 1), que no revisa nada relacionado a `NodeNetworkContainer` pero debe seguir montando sin errores gracias al mock de `matchMedia` del Task 2. Al estar `NodeNetworkScene`/`NodeNetworkFallback` detrás de `lazy()`, en un render síncrono de test ni siquiera llegan a resolverse — `Suspense` muestra su `fallback={null}` y no hay nada que montar, así que tampoco aparece el ruido de consola de `NodeNetworkFallback` visto en el Task 8.

- [ ] **Step 6: Verificación manual en navegador**

Run: `npm run dev`
Abrir `http://localhost:5173`. Confirmar: la red de nodos 3D se ve detrás del headline del hero, se puede arrastrar para rotarla (dentro de un rango limitado), y un nodo brilla/pulsa distinto al resto (la "anomalía"). Al hacer scroll hacia Servicios/Proyectos, la red desaparece; al cruzar hacia el Manifiesto y hacia Contacto, reaparece brevemente y luego se oculta de nuevo. En la pestaña Network de DevTools, confirmar que el chunk de Three.js se descarga en una petición separada, después de la carga inicial del HTML/CSS del hero (no bloquea el primer render).

- [ ] **Step 7: Commit**

```bash
git add src/components/NodeNetwork/NodeNetworkContainer.tsx src/components/NodeNetwork/NodeNetworkContainer.module.css src/components/Hero/Hero.module.css src/App.tsx
git commit -m "feat: mount the interactive node network behind the page"
```

---

### Task 11: Componente `Reveal` (texto que aparece al hacer scroll)

**Files:**
- Create: `src/components/Reveal/Reveal.tsx`
- Test: `src/components/Reveal/Reveal.test.tsx`
- Modify: `src/components/Manifesto/Manifesto.tsx`
- Modify: `src/components/Services/Services.tsx`
- Modify: `src/components/Projects/Projects.tsx`
- Modify: `src/components/Testimonials/Testimonials.tsx`
- Modify: `src/components/Contact/Contact.tsx`

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
    const [, fromVars, toVars] = (gsap.fromTo as unknown as { mock: { calls: unknown[][] } }).mock.calls[0] as [
      unknown,
      { opacity: number; y: number },
      { opacity: number; y: number },
    ];
    expect(fromVars).toMatchObject({ opacity: 0, y: 24 });
    expect(toVars).toMatchObject({ opacity: 1, y: 0 });
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test`
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

- [ ] **Step 4: Correr y verificar que pasa**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Aplicar `Reveal` en las secciones de contenido**

En `src/components/Manifesto/Manifesto.tsx`, envolver el título y el cuerpo:

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

En `src/components/Services/Services.tsx`, envolver el título de sección:

```tsx
import { services } from '../../content/services';
import { Reveal } from '../Reveal/Reveal';
import styles from './Services.module.css';

export function Services() {
  return (
    <section id="servicios" className="section-inner">
      <Reveal>
        <h2>Servicios</h2>
      </Reveal>
      <div className={styles.grid}>
        {services.map((service) => (
          <article className={styles.card} key={service.id}>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
```

En `src/components/Projects/Projects.tsx`, envolver el título de sección:

```tsx
import { projects } from '../../content/projects';
import { Reveal } from '../Reveal/Reveal';
import styles from './Projects.module.css';

export function Projects() {
  return (
    <section id="proyectos" className="section-inner">
      <Reveal>
        <h2>Proyectos</h2>
      </Reveal>
      <div className={styles.grid}>
        {projects.map((project) => (
          <article className={styles.card} key={project.id}>
            <div className={styles.thumb} aria-hidden="true" />
            <div className={styles.body}>
              <h3>{project.title}</h3>
              <p className={styles.description}>{project.description}</p>
              <div className={styles.tags}>
                {project.tags.map((tag) => (
                  <span className={styles.tag} key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
```

En `src/components/Testimonials/Testimonials.tsx`, envolver el título de sección:

```tsx
import { testimonials } from '../../content/testimonials';
import { Reveal } from '../Reveal/Reveal';
import styles from './Testimonials.module.css';

export function Testimonials() {
  return (
    <section id="testimonios" className="section-inner">
      <Reveal>
        <h2>Testimonios</h2>
      </Reveal>
      <div className={styles.grid}>
        {testimonials.map((t) => (
          <article className={styles.card} key={t.id}>
            <p className={styles.quote}>&quot;{t.quote}&quot;</p>
            <div className={styles.person}>
              <span className={styles.badge}>{t.initials}</span>
              <div>
                <div className={styles.name}>{t.author}</div>
                <div className={styles.role}>{t.role}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
```

En `src/components/Contact/Contact.tsx`, envolver el título (dejar el resto del componente igual):

```tsx
import { FormEvent, useState } from 'react';
import { contactContent } from '../../content/contact';
import { Reveal } from '../Reveal/Reveal';
import styles from './Contact.module.css';

export interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

interface ContactProps {
  onSubmit?: (values: ContactFormValues) => void;
}

export function Contact({ onSubmit }: ContactProps) {
  const [values, setValues] = useState<ContactFormValues>({ name: '', email: '', message: '' });
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!values.name || !values.email || !values.message) {
      setError('Completa todos los campos antes de enviar.');
      return;
    }
    setError(null);
    onSubmit?.(values);
  }

  return (
    <section id="contacto" className={`section-inner ${styles.contact}`}>
      <Reveal>
        <h2>{contactContent.heading}</h2>
      </Reveal>
      <div className={styles.links}>
        <a href={`mailto:${contactContent.email}`}>{contactContent.email}</a>
        {contactContent.socials.map((social) => (
          <a href={social.href} key={social.label} target="_blank" rel="noreferrer">
            {social.label}
          </a>
        ))}
      </div>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="contact-name">Nombre</label>
          <input
            id="contact-name"
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-email">Email</label>
          <input
            id="contact-email"
            type="email"
            value={values.email}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-message">Mensaje</label>
          <textarea
            id="contact-message"
            rows={4}
            value={values.message}
            onChange={(e) => setValues({ ...values, message: e.target.value })}
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button className={styles.submit} type="submit">Enviar</button>
      </form>
    </section>
  );
}
```

- [ ] **Step 6: Correr toda la suite**

Run: `npm run test`
Expected: PASS — los tests de Manifesto/Services/Projects/Testimonials/Contact de la Fase 1 siguen pasando porque `Reveal` renderiza sus hijos igual (solo envuelve en un `<div>`), y `gsap` no está mockeado en esos archivos de test — es la librería real, pero como jsdom sí implementa `getBoundingClientRect` (aunque con valores en cero) `ScrollTrigger.create` no lanza excepción, solo queda inerte.

- [ ] **Step 7: Commit**

```bash
git add src/components/Reveal src/components/Manifesto/Manifesto.tsx src/components/Services/Services.tsx src/components/Projects/Projects.tsx src/components/Testimonials/Testimonials.tsx src/components/Contact/Contact.tsx
git commit -m "feat: add scroll-triggered reveal animation to section headings"
```

---

### Task 12: Componente `MagneticButton` (CTAs del hero)

**Files:**
- Create: `src/components/MagneticButton/MagneticButton.tsx`
- Test: `src/components/MagneticButton/MagneticButton.test.tsx`
- Modify: `src/components/Hero/Hero.tsx`

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

Run: `npm run test`
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

- [ ] **Step 4: Correr y verificar que pasa**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Usar `MagneticButton` en los CTAs del Hero**

Reemplazar `src/components/Hero/Hero.tsx`:

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

- [ ] **Step 6: Actualizar el test del Hero (Fase 1) para mockear gsap**

`src/components/Hero/Hero.test.tsx` ahora renderiza `MagneticButton`, que llama a `gsap.quickTo`. Mockear `gsap` al inicio del archivo:

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

- [ ] **Step 7: Correr toda la suite**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/MagneticButton src/components/Hero/Hero.tsx src/components/Hero/Hero.test.tsx
git commit -m "feat: add magnetic button interaction to hero CTAs"
```

---

### Task 13: Componente `SoundToggle` (sonido ambiental opcional)

**Files:**
- Create: `src/components/SoundToggle/SoundToggle.tsx`
- Create: `src/components/SoundToggle/SoundToggle.module.css`
- Test: `src/components/SoundToggle/SoundToggle.test.tsx`
- Modify: `src/components/Nav/Nav.tsx`
- Modify: `src/components/Nav/Nav.module.css`

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

Run: `npm run test`
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
import { useEffect, useRef, useState } from 'react';
import styles from './SoundToggle.module.css';

const STORAGE_KEY = 'anomalydevs:sound-enabled';

export function SoundToggle() {
  const [enabled, setEnabled] = useState(() => window.localStorage.getItem(STORAGE_KEY) === 'true');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

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
      audioCtxRef.current = ctx;
      gainRef.current = gain;
      oscillatorRef.current = oscillator;

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

- [ ] **Step 5: Correr y verificar que pasa**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 6: Añadir `SoundToggle` al Nav**

Modificar `src/components/Nav/Nav.tsx`:

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

- [ ] **Step 7: Actualizar el test del Nav (Fase 1) para mockear el Web Audio API**

`src/components/Nav/Nav.test.tsx` ahora monta `SoundToggle`. Añadir el mock de `AudioContext` al inicio del archivo:

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

- [ ] **Step 8: Añadir estilos de layout al Nav para el nuevo botón**

Modificar `src/components/Nav/Nav.module.css`, cambiando `.nav` para distribuir tres bloques (logo, links, toggle):

```css
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  background: rgba(6, 10, 7, 0.8);
  backdrop-filter: blur(6px);
  border-bottom: 1px solid var(--color-border);
}
```

(El resto de las reglas de `Nav.module.css` no cambian.)

- [ ] **Step 9: Correr toda la suite**

Run: `npm run test`
Expected: PASS — toda la suite de la Fase 1 y Fase 2 en verde.

- [ ] **Step 10: Verificación manual en navegador**

Run: `npm run dev`
Confirmar: el botón de sonido en el nav empieza en "Sonido: desactivado", no reproduce nada al cargar (sin autoplay), y al hacer clic activa un tono ambiental sutil y cambia a "Sonido: activado". Recargar la página y confirmar que el estado persiste.

- [ ] **Step 11: Commit**

```bash
git add src/components/SoundToggle src/components/Nav/Nav.tsx src/components/Nav/Nav.test.tsx src/components/Nav/Nav.module.css
git commit -m "feat: add optional ambient sound toggle to nav"
```

---

### Task 14: Verificación manual final (checklist de QA)

No hay código nuevo en esta tarea — es la lista de verificación manual del §9 del spec, ya que la mayor parte de esta fase es experiencia visual/interactiva que no se puede cubrir con tests automatizados.

- [ ] **Step 1: Lighthouse**

Run: `npm run build && npm run preview`
Abrir el sitio servido y correr Lighthouse (Chrome DevTools) en modo desktop y mobile. Revisar performance y accesibilidad; anotar cualquier hallazgo importante (p. ej. LCP alto por el bundle de Three.js) para una futura Fase 3 de optimización si hace falta.

- [ ] **Step 2: Cross-browser**

Abrir la landing en Chrome, Firefox y Safari (o el equivalente disponible). Confirmar que la red de nodos se ve y es arrastrable en cada uno, y que no hay errores en consola.

- [ ] **Step 3: `prefers-reduced-motion`**

En Chrome DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce". Recargar y confirmar que la red de nodos NO aparece en absoluto (el `NodeNetworkContainer` retorna `null`) y que el resto del sitio se ve bien sin ella.

- [ ] **Step 4: Fallback sin WebGL**

En Chrome, abrir `chrome://flags` y deshabilitar WebGL (o usar `chrome --disable-webgl` desde línea de comandos), recargar, y confirmar que aparece la versión Canvas2D (`NodeNetworkFallback`) en vez de un error o un hueco en blanco.

- [ ] **Step 5: Mobile**

En Chrome DevTools → device toolbar, simular un dispositivo móvil (ej. iPhone 12). Confirmar: la red usa menos nodos, no responde a drag (solo animación automática leve), y los CTAs/formulario son cómodos de tocar.

- [ ] **Step 6: Confirmar que no quedan cambios sin commitear**

Run: `git status`
Expected: working tree limpio (todo lo de esta fase ya está committeado en los tasks anteriores).

---

## Resumen de la Fase 2

Al terminar este plan, la landing de AnomalyDevs tiene la experiencia completa descrita en el spec: red de nodos 3D interactiva en el hero, transiciones al entrar al Manifiesto y a Contacto, fallback sin WebGL, respeto a `prefers-reduced-motion`, ajuste para móvil, sonido ambiental opcional, botones magnéticos y reveal de texto al hacer scroll — todo sobre la base estática y ya testeada de la Fase 1.
