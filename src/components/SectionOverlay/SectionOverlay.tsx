import {
  Suspense,
  lazy,
  ComponentType,
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Footer } from '../Footer/Footer';
import { ScrollContainerContext } from '../Reveal/scrollContainerContext';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import styles from './SectionOverlay.module.css';

const sectionComponents: Record<string, React.LazyExoticComponent<ComponentType>> = {
  hero: lazy(() => import('../Hero/Hero').then((m) => ({ default: m.Hero }))),
  manifesto: lazy(() => import('../Manifesto/Manifesto').then((m) => ({ default: m.Manifesto }))),
  services: lazy(() => import('../Services/Services').then((m) => ({ default: m.Services }))),
  projects: lazy(() => import('../Projects/Projects').then((m) => ({ default: m.Projects }))),
  testimonials: lazy(() => import('../Testimonials/Testimonials').then((m) => ({ default: m.Testimonials }))),
  contact: lazy(() => import('../Contact/Contact').then((m) => ({ default: m.Contact }))),
};

const sectionIds = ['hero', 'manifesto', 'services', 'projects', 'testimonials', 'contact'];

/** Fade-out of the leaving section, then fade-in of the entering one, while the camera flies. */
const FADE_OUT_MS = 250;
const FADE_IN_MS = 350;
const EDGE_TOLERANCE_PX = 2;

interface SectionOverlayProps {
  activeIndex: number;
  /** Scrollable container ref shared with useScrollNavigation so gestures and content edges agree. */
  scrollRef?: MutableRefObject<HTMLDivElement | null>;
}

export function SectionOverlay({ activeIndex, scrollRef }: SectionOverlayProps) {
  const internalRef = useRef<HTMLDivElement | null>(null);
  const containerRef = scrollRef ?? internalRef;
  const reducedMotion = usePrefersReducedMotion();
  const [displayedIndex, setDisplayedIndex] = useState(activeIndex);
  const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle');
  const [hintVisible, setHintVisible] = useState(false);
  const displayedIndexRef = useRef(activeIndex);
  const pendingScrollRef = useRef<'top' | 'bottom'>('top');

  useEffect(() => {
    if (activeIndex === displayedIndexRef.current) return;
    // Arriving from the section below lands at the end of the content, so continuing upward feels continuous.
    pendingScrollRef.current = activeIndex === displayedIndexRef.current - 1 ? 'bottom' : 'top';
    displayedIndexRef.current = activeIndex;
    if (reducedMotion) {
      setDisplayedIndex(activeIndex);
      setPhase('idle');
      return;
    }
    setPhase('out');
    const swapTimer = setTimeout(() => {
      setDisplayedIndex(activeIndex);
      setPhase('in');
    }, FADE_OUT_MS);
    const settleTimer = setTimeout(() => setPhase('idle'), FADE_OUT_MS + FADE_IN_MS);
    return () => {
      clearTimeout(swapTimer);
      clearTimeout(settleTimer);
    };
  }, [activeIndex, reducedMotion]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = pendingScrollRef.current === 'bottom' ? el.scrollHeight : 0;
  }, [displayedIndex, containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      setHintVisible(el.scrollHeight - el.scrollTop - el.clientHeight > EDGE_TOLERANCE_PX);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(update);
      observer.observe(el);
      if (el.firstElementChild) observer.observe(el.firstElementChild);
    }
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      observer?.disconnect();
    };
  }, [displayedIndex, containerRef]);

  const id = sectionIds[displayedIndex] || 'hero';
  const Component = sectionComponents[id];

  return (
    <div className={styles.wrapper}>
      <ScrollContainerContext.Provider value={containerRef}>
        <div className={styles.scroller} ref={containerRef}>
          <div className={styles.content} data-phase={phase}>
            <Suspense fallback={null}>
              <Component />
            </Suspense>
            {displayedIndex === sectionIds.length - 1 && <Footer />}
          </div>
        </div>
      </ScrollContainerContext.Provider>
      <div className={styles.scrollHint} data-visible={hintVisible ? 'true' : undefined} aria-hidden="true" />
    </div>
  );
}
