import { useState, useCallback, useEffect, useRef, RefObject } from 'react';

interface UseScrollNavigationOptions {
  sectionCount: number;
  /** Attach gesture listeners only once the user has entered the experience. */
  enabled?: boolean;
  /**
   * Scrollable container of the active section. While it can still scroll in the gesture's
   * direction, gestures consume content natively; navigation only triggers from its edges.
   * Without a container every gesture is treated as an edge gesture (legacy behavior).
   */
  containerRef?: RefObject<HTMLElement | null>;
  /** How long further gestures are ignored after one is accepted, to match the camera-fly duration. */
  lockDurationMs?: number;
  wheelThreshold?: number;
  touchThreshold?: number;
  /** Wheel deltas are discarded this long after reaching a content edge, so the momentum of the scroll that reached the edge cannot chain into a section change. */
  edgeCooldownMs?: number;
  /** Idle time after which the wheel accumulator resets, so a new gesture starts from zero. */
  gestureResetMs?: number;
}

const DEFAULT_LOCK_MS = 1300;
const DEFAULT_WHEEL_THRESHOLD = 150;
const DEFAULT_TOUCH_THRESHOLD = 70;
const DEFAULT_EDGE_COOLDOWN_MS = 400;
const DEFAULT_GESTURE_RESET_MS = 300;
const EDGE_TOLERANCE_PX = 2;
const ARROW_SCROLL_PX = 80;

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

function canScrollFurther(el: HTMLElement | null, direction: number): boolean {
  if (!el) return false;
  if (direction > 0) return el.scrollHeight - el.scrollTop - el.clientHeight > EDGE_TOLERANCE_PX;
  return el.scrollTop > EDGE_TOLERANCE_PX;
}

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable)
  );
}

export function useScrollNavigation({
  sectionCount,
  enabled = true,
  containerRef,
  lockDurationMs = DEFAULT_LOCK_MS,
  wheelThreshold = DEFAULT_WHEEL_THRESHOLD,
  touchThreshold = DEFAULT_TOUCH_THRESHOLD,
  edgeCooldownMs = DEFAULT_EDGE_COOLDOWN_MS,
  gestureResetMs = DEFAULT_GESTURE_RESET_MS,
}: UseScrollNavigationOptions) {
  const [activeCluster, setActiveCluster] = useState(0);
  const activeClusterRef = useRef(0);
  const lockedRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartEdgesRef = useRef({ up: false, down: false });
  const wheelAccumulatorRef = useRef(0);
  const lastWheelAtRef = useRef(-Infinity);
  const edgeReachedAtRef = useRef(-Infinity);
  const prevEdgesRef = useRef({ top: false, bottom: false });

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

    const container = () => containerRef?.current ?? null;

    function inEdgeCooldown() {
      return Date.now() - edgeReachedAtRef.current < edgeCooldownMs;
    }

    function handleWheel(e: WheelEvent) {
      if (lockedRef.current) {
        e.preventDefault();
        return;
      }
      const delta = normalizedWheelDelta(e);
      if (delta === 0) return;
      const direction = delta > 0 ? 1 : -1;
      // Content left to read in this direction: let the container scroll natively.
      if (canScrollFurther(container(), direction)) return;
      e.preventDefault();
      if (inEdgeCooldown()) return;
      const now = Date.now();
      if (now - lastWheelAtRef.current > gestureResetMs || Math.sign(wheelAccumulatorRef.current) !== direction) {
        wheelAccumulatorRef.current = 0;
      }
      lastWheelAtRef.current = now;
      wheelAccumulatorRef.current += delta;
      if (Math.abs(wheelAccumulatorRef.current) < wheelThreshold) return;
      wheelAccumulatorRef.current = 0;
      goTo(activeClusterRef.current + direction);
    }

    function handleContainerScroll() {
      const el = container();
      if (!el) return;
      const atTop = el.scrollTop <= EDGE_TOLERANCE_PX;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= EDGE_TOLERANCE_PX;
      // The gesture is consuming content, not navigating.
      if (!atTop && !atBottom) wheelAccumulatorRef.current = 0;
      if ((atTop && !prevEdgesRef.current.top) || (atBottom && !prevEdgesRef.current.bottom)) {
        edgeReachedAtRef.current = Date.now();
      }
      prevEdgesRef.current = { top: atTop, bottom: atBottom };
    }

    function handleTouchStart(e: TouchEvent) {
      touchStartYRef.current = e.touches[0]?.clientY ?? null;
      const el = container();
      touchStartEdgesRef.current = {
        up: !canScrollFurther(el, -1),
        down: !canScrollFurther(el, 1),
      };
    }

    function handleTouchEnd(e: TouchEvent) {
      const startY = touchStartYRef.current;
      touchStartYRef.current = null;
      if (startY === null || lockedRef.current) return;
      const endY = e.changedTouches[0]?.clientY ?? startY;
      const delta = startY - endY;
      if (Math.abs(delta) < touchThreshold) return;
      const direction = delta > 0 ? 1 : -1;
      // Navigate only when the section was already at this edge before the swipe began,
      // so the swipe that scrolled the content to the edge never chains into a section change.
      const startedAtEdge = direction > 0 ? touchStartEdgesRef.current.down : touchStartEdgesRef.current.up;
      if (!startedAtEdge || canScrollFurther(container(), direction) || inEdgeCooldown()) return;
      goTo(activeClusterRef.current + direction);
    }

    function scrollOrNavigate(direction: 1 | -1, amountPx: number) {
      const el = container();
      if (el && canScrollFurther(el, direction)) {
        if (typeof el.scrollBy === 'function') {
          el.scrollBy({ top: direction * amountPx, behavior: 'smooth' });
        } else {
          el.scrollTop += direction * amountPx;
        }
        return;
      }
      goTo(activeClusterRef.current + direction);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (lockedRef.current || isTypingTarget(e.target)) return;
      const el = container();
      const pagePx = el ? Math.max(el.clientHeight * 0.8, ARROW_SCROLL_PX) : ARROW_SCROLL_PX;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          scrollOrNavigate(1, ARROW_SCROLL_PX);
          break;
        case 'PageDown':
        case ' ':
          e.preventDefault();
          scrollOrNavigate(1, pagePx);
          break;
        case 'ArrowUp':
          e.preventDefault();
          scrollOrNavigate(-1, ARROW_SCROLL_PX);
          break;
        case 'PageUp':
          e.preventDefault();
          scrollOrNavigate(-1, pagePx);
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

    const el = container();
    prevEdgesRef.current = {
      top: !canScrollFurther(el, -1),
      bottom: !canScrollFurther(el, 1),
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    el?.addEventListener('scroll', handleContainerScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      el?.removeEventListener('scroll', handleContainerScroll);
    };
  }, [enabled, goTo, sectionCount, wheelThreshold, touchThreshold, edgeCooldownMs, gestureResetMs, containerRef]);

  return { activeCluster, navigateTo };
}
