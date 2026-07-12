import { useState, useCallback, useRef, lazy, Suspense } from 'react';
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

export default function App() {
  const [entered, setEntered] = useState(false);
  const sceneApiRef = useRef<ParticleSceneAPI | null>(null);
  const { activeCluster, navigateTo } = useScrollNavigation({ sectionCount: 6, enabled: entered });

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
        <>
          <Nav activeCluster={activeCluster} onNavigate={navigateTo} />
          <main>
            <SectionOverlay activeIndex={activeCluster} />
          </main>
          <Footer />
        </>
      )}
    </>
  );
}
