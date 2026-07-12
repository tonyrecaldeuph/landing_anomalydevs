import { useEffect, useRef, useCallback } from 'react';
import { createParticleScene, ParticleSceneAPI } from './ParticleScene';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { supportsWebGL } from '../../three/supportsWebGL';

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
    if (!supportsWebGL()) return;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const api = createParticleScene(isMobile, reducedMotion);
    apiRef.current = api;
    containerRef.current?.appendChild(api.domElement);
    onSceneReady?.(api);
    return () => {
      api.domElement.remove();
      api.dispose();
    };
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

  if (reducedMotion || !supportsWebGL()) return null;

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
