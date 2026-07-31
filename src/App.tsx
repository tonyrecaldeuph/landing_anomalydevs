import { useState, useCallback, useRef, lazy, Suspense } from 'react';
import { Nav } from './components/Nav/Nav';
import { EnterScreen } from './components/EnterScreen/EnterScreen';
import { SectionOverlay } from './components/SectionOverlay/SectionOverlay';
import { useScrollNavigation } from './hooks/useScrollNavigation';
import { NavigationContext } from './hooks/navigationContext';
import { useCursor } from './hooks/useCursor';
import { ParticleSceneAPI } from './components/ImmersiveCanvas/ParticleScene';

const ImmersiveCanvas = lazy(() =>
  import('./components/ImmersiveCanvas/ImmersiveCanvas').then((m) => ({ default: m.ImmersiveCanvas })),
);

export default function App() {
  const [entered, setEntered] = useState(false);
  const sceneApiRef = useRef<ParticleSceneAPI | null>(null);
  const overlayScrollRef = useRef<HTMLDivElement | null>(null);
  const { activeCluster, navigateTo } = useScrollNavigation({
    sectionCount: 6,
    enabled: entered,
    containerRef: overlayScrollRef,
  });

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
      {entered && (
        <NavigationContext.Provider value={navigateTo}>
          <Nav activeCluster={activeCluster} onNavigate={navigateTo} />
          <main>
            <SectionOverlay activeIndex={activeCluster} scrollRef={overlayScrollRef} />
          </main>
        </NavigationContext.Provider>
      )}
    </>
  );
}
