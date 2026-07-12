import { useState, useCallback, useEffect, useRef } from 'react';

interface UseScrollNavigationOptions {
  sectionCount: number;
  /** Attach gesture listeners only once the user has entered the experience. */
  enabled?: boolean;
  /** How long further gestures are ignored after one is accepted, to match the camera-fly duration. */
  lockDurationMs?: number;
  wheelThreshold?: number;
  touchThreshold?: number;
}

const DEFAULT_LOCK_MS = 1300;
const DEFAULT_WHEEL_THRESHOLD = 50;
const DEFAULT_TOUCH_THRESHOLD = 50;

/** Approximate pixels per "line" — browsers reporting DOM_DELTA_LINE (mode 1) use tiny deltaY (often 3). */
const LINE_HEIGHT_PX = 40;

/** Normalizes a WheelEvent's deltaY to pixel units regardless of the browser/device's reported deltaMode. */
function normalizedWheelDelta(e: WheelEvent): number {
  switch (e.deltaMode) {
    case 1: // DOM_DELTA_LINE
      return e.deltaY * LINE_HEIGHT_PX;
    case 2: // DOM_DELTA_PAGE
      return e.deltaY * window.innerHeight;
    default: // DOM_DELTA_PIXEL
      return e.deltaY;
  }
}

export function useScrollNavigation({
  sectionCount,
  enabled = true,
  lockDurationMs = DEFAULT_LOCK_MS,
  wheelThreshold = DEFAULT_WHEEL_THRESHOLD,
  touchThreshold = DEFAULT_TOUCH_THRESHOLD,
}: UseScrollNavigationOptions) {
  const [activeCluster, setActiveCluster] = useState(0);
  const activeClusterRef = useRef(0);
  const lockedRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);
  const wheelAccumulatorRef = useRef(0);

  const lock = useCallback(() => {
    wheelAccumulatorRef.current = 0;
    if (lockDurationMs <= 0) return;
    lockedRef.current = true;
    setTimeout(() => {
      lockedRef.current = false;
    }, lockDurationMs);
  }, [lockDurationMs]);

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, sectionCount - 1));
      if (clamped === activeClusterRef.current) return;
      activeClusterRef.current = clamped;
      setActiveCluster(clamped);
      lock();
    },
    [sectionCount, lock],
  );

  const navigateTo = useCallback((index: number) => goTo(index), [goTo]);

  useEffect(() => {
    if (!enabled) return;

    function handleWheel(e: WheelEvent) {
      if (lockedRef.current) return;
      e.preventDefault();
      wheelAccumulatorRef.current += normalizedWheelDelta(e);
      if (Math.abs(wheelAccumulatorRef.current) < wheelThreshold) return;
      const direction = wheelAccumulatorRef.current > 0 ? 1 : -1;
      wheelAccumulatorRef.current = 0;
      goTo(activeClusterRef.current + direction);
    }

    function handleTouchStart(e: TouchEvent) {
      touchStartYRef.current = e.touches[0]?.clientY ?? null;
    }

    function handleTouchEnd(e: TouchEvent) {
      const startY = touchStartYRef.current;
      touchStartYRef.current = null;
      if (startY === null || lockedRef.current) return;
      const endY = e.changedTouches[0]?.clientY ?? startY;
      const delta = startY - endY;
      if (Math.abs(delta) < touchThreshold) return;
      goTo(activeClusterRef.current + (delta > 0 ? 1 : -1));
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (lockedRef.current) return;
      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          goTo(activeClusterRef.current + 1);
          break;
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          goTo(activeClusterRef.current - 1);
          break;
        case 'Home':
          e.preventDefault();
          goTo(0);
          break;
        case 'End':
          e.preventDefault();
          goTo(sectionCount - 1);
          break;
        default:
          break;
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, goTo, sectionCount, wheelThreshold, touchThreshold]);

  return { activeCluster, navigateTo };
}
