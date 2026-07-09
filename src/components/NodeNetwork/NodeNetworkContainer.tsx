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
