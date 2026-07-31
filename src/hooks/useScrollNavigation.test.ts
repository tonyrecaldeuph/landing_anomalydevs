import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useScrollNavigation } from './useScrollNavigation';

function wheel(deltaY: number, deltaMode = 0) {
  window.dispatchEvent(new WheelEvent('wheel', { deltaY, deltaMode, cancelable: true }));
}

function key(key: string) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, cancelable: true, bubbles: true }));
}

function swipe(startY: number, endY: number) {
  window.dispatchEvent(
    new TouchEvent('touchstart', { touches: [{ clientY: startY } as Touch], cancelable: true }),
  );
  window.dispatchEvent(
    new TouchEvent('touchend', { changedTouches: [{ clientY: endY } as Touch], cancelable: true }),
  );
}

describe('useScrollNavigation', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts at cluster 0', () => {
    const { result } = renderHook(() => useScrollNavigation({ sectionCount: 6, enabled: true }));
    expect(result.current.activeCluster).toBe(0);
  });

  it('does not attach listeners when disabled: wheel events do nothing', () => {
    const { result } = renderHook(() => useScrollNavigation({ sectionCount: 6, enabled: false }));
    act(() => wheel(200));
    expect(result.current.activeCluster).toBe(0);
  });

  it('advances one cluster on a wheel-down gesture past the threshold', () => {
    const { result } = renderHook(() =>
      useScrollNavigation({ sectionCount: 6, enabled: true, wheelThreshold: 50 }),
    );
    act(() => wheel(80));
    expect(result.current.activeCluster).toBe(1);
  });

  it('ignores wheel gestures below the threshold', () => {
    const { result } = renderHook(() =>
      useScrollNavigation({ sectionCount: 6, enabled: true, wheelThreshold: 50 }),
    );
    act(() => wheel(20));
    expect(result.current.activeCluster).toBe(0);
  });

  it('moves back one cluster on a wheel-up gesture', () => {
    const { result } = renderHook(() =>
      useScrollNavigation({ sectionCount: 6, enabled: true, wheelThreshold: 50, lockDurationMs: 0 }),
    );
    act(() => wheel(80));
    expect(result.current.activeCluster).toBe(1);
    act(() => wheel(-80));
    expect(result.current.activeCluster).toBe(0);
  });

  it('clamps at the last cluster and does not go beyond', () => {
    const { result } = renderHook(() =>
      useScrollNavigation({ sectionCount: 3, enabled: true, wheelThreshold: 50, lockDurationMs: 0 }),
    );
    act(() => wheel(80));
    act(() => wheel(80));
    act(() => wheel(80));
    expect(result.current.activeCluster).toBe(2);
  });

  it('clamps at cluster 0 and does not go below', () => {
    const { result } = renderHook(() =>
      useScrollNavigation({ sectionCount: 3, enabled: true, wheelThreshold: 50, lockDurationMs: 0 }),
    );
    act(() => wheel(-80));
    expect(result.current.activeCluster).toBe(0);
  });

  it('locks out further gestures until lockDurationMs elapses', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() =>
      useScrollNavigation({ sectionCount: 6, enabled: true, wheelThreshold: 50, lockDurationMs: 1000 }),
    );
    act(() => wheel(80));
    expect(result.current.activeCluster).toBe(1);
    act(() => wheel(80));
    expect(result.current.activeCluster).toBe(1);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    act(() => wheel(80));
    expect(result.current.activeCluster).toBe(2);
  });

  it('navigateTo jumps directly to a cluster index, clamped to range', () => {
    const { result } = renderHook(() => useScrollNavigation({ sectionCount: 6, enabled: true }));
    act(() => result.current.navigateTo(4));
    expect(result.current.activeCluster).toBe(4);
    act(() => result.current.navigateTo(99));
    expect(result.current.activeCluster).toBe(5);
  });

  it('ArrowDown advances one cluster, ArrowUp moves back one', () => {
    const { result } = renderHook(() =>
      useScrollNavigation({ sectionCount: 6, enabled: true, lockDurationMs: 0 }),
    );
    act(() => key('ArrowDown'));
    expect(result.current.activeCluster).toBe(1);
    act(() => key('ArrowUp'));
    expect(result.current.activeCluster).toBe(0);
  });

  it('Home jumps to the first cluster, End jumps to the last', () => {
    const { result } = renderHook(() =>
      useScrollNavigation({ sectionCount: 6, enabled: true, lockDurationMs: 0 }),
    );
    act(() => key('End'));
    expect(result.current.activeCluster).toBe(5);
    act(() => key('Home'));
    expect(result.current.activeCluster).toBe(0);
  });

  it('an upward swipe (finger moves up) advances one cluster', () => {
    const { result } = renderHook(() =>
      useScrollNavigation({ sectionCount: 6, enabled: true, touchThreshold: 50 }),
    );
    act(() => swipe(400, 300));
    expect(result.current.activeCluster).toBe(1);
  });

  it('a downward swipe (finger moves down) moves back one cluster', () => {
    const { result } = renderHook(() =>
      useScrollNavigation({ sectionCount: 6, enabled: true, touchThreshold: 50, lockDurationMs: 0 }),
    );
    act(() => swipe(300, 400));
    expect(result.current.activeCluster).toBe(0);
    act(() => swipe(200, 500));
    expect(result.current.activeCluster).toBe(0);
  });

  it('normalizes line-mode deltas (small integers, e.g. deltaY=3) to pixels before comparing to the threshold', () => {
    const { result } = renderHook(() =>
      useScrollNavigation({ sectionCount: 6, enabled: true, wheelThreshold: 50 }),
    );
    // A single "line" notch (deltaMode 1) with deltaY=3 must, once normalized, cross a 50px threshold —
    // this is what a real line-mode mouse/browser reports per wheel click, unlike Playwright's pixel-mode default.
    act(() => wheel(3, 1));
    expect(result.current.activeCluster).toBe(1);
  });

  it('accumulates several small wheel events until the threshold is reached', () => {
    const { result } = renderHook(() =>
      useScrollNavigation({ sectionCount: 6, enabled: true, wheelThreshold: 50 }),
    );
    act(() => wheel(15));
    expect(result.current.activeCluster).toBe(0);
    act(() => wheel(15));
    expect(result.current.activeCluster).toBe(0);
    act(() => wheel(25));
    expect(result.current.activeCluster).toBe(1);
  });

  it('resets the accumulator after navigating, so leftover delta does not immediately trigger the next step', () => {
    const { result } = renderHook(() =>
      useScrollNavigation({ sectionCount: 6, enabled: true, wheelThreshold: 50, lockDurationMs: 0 }),
    );
    act(() => wheel(60)); // crosses threshold with 10 to spare
    expect(result.current.activeCluster).toBe(1);
    act(() => wheel(15)); // well below threshold on its own
    expect(result.current.activeCluster).toBe(1);
  });

  it('does not accumulate delta received while locked', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() =>
      useScrollNavigation({ sectionCount: 6, enabled: true, wheelThreshold: 50, lockDurationMs: 1000 }),
    );
    act(() => wheel(60));
    expect(result.current.activeCluster).toBe(1);
    act(() => wheel(30)); // locked, must be discarded, not banked for later
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    act(() => wheel(30)); // alone, below threshold — should NOT combine with the discarded 30 above
    expect(result.current.activeCluster).toBe(1);
  });

  describe('with a scrollable container', () => {
    function makeContainer({ scrollTop = 0, scrollHeight = 800, clientHeight = 800 } = {}) {
      const el = document.createElement('div');
      let top = scrollTop;
      Object.defineProperty(el, 'scrollTop', {
        get: () => top,
        set: (v: number) => {
          top = Math.max(0, Math.min(v, scrollHeight - clientHeight));
        },
      });
      Object.defineProperty(el, 'scrollHeight', { get: () => scrollHeight, configurable: true });
      Object.defineProperty(el, 'clientHeight', { get: () => clientHeight, configurable: true });
      return el;
    }

    it('lets the wheel scroll the content natively (no navigation) while there is room below', () => {
      const el = makeContainer({ scrollTop: 0, scrollHeight: 2000, clientHeight: 800 });
      const { result } = renderHook(() =>
        useScrollNavigation({ sectionCount: 6, enabled: true, containerRef: { current: el } }),
      );
      act(() => wheel(300));
      expect(result.current.activeCluster).toBe(0);
    });

    it('navigates when the container is at the bottom and the gesture passes the edge threshold', () => {
      const el = makeContainer({ scrollTop: 1200, scrollHeight: 2000, clientHeight: 800 });
      const { result } = renderHook(() =>
        useScrollNavigation({
          sectionCount: 6,
          enabled: true,
          containerRef: { current: el },
          wheelThreshold: 150,
        }),
      );
      act(() => wheel(160));
      expect(result.current.activeCluster).toBe(1);
    });

    it('discards wheel deltas during the cooldown right after the content reaches the bottom edge', () => {
      vi.useFakeTimers();
      const el = makeContainer({ scrollTop: 0, scrollHeight: 2000, clientHeight: 800 });
      const { result } = renderHook(() =>
        useScrollNavigation({
          sectionCount: 6,
          enabled: true,
          containerRef: { current: el },
          wheelThreshold: 150,
          edgeCooldownMs: 400,
        }),
      );
      // the user scrolls the content down to the bottom edge
      act(() => {
        el.scrollTop = 1200;
        el.dispatchEvent(new Event('scroll'));
      });
      act(() => wheel(300)); // same momentum, within cooldown — must be discarded
      expect(result.current.activeCluster).toBe(0);
      act(() => {
        vi.advanceTimersByTime(500);
      });
      act(() => wheel(300)); // deliberate new gesture after the cooldown
      expect(result.current.activeCluster).toBe(1);
    });

    it('a swipe that only reaches the edge during the gesture does not navigate; the next one does', () => {
      const el = makeContainer({ scrollTop: 1100, scrollHeight: 2000, clientHeight: 800 });
      const { result } = renderHook(() =>
        useScrollNavigation({
          sectionCount: 6,
          enabled: true,
          containerRef: { current: el },
          touchThreshold: 70,
        }),
      );
      act(() => {
        window.dispatchEvent(
          new TouchEvent('touchstart', { touches: [{ clientY: 500 } as Touch], cancelable: true }),
        );
        el.scrollTop = 1200; // native scroll brings it to the bottom mid-gesture
        window.dispatchEvent(
          new TouchEvent('touchend', { changedTouches: [{ clientY: 300 } as Touch], cancelable: true }),
        );
      });
      expect(result.current.activeCluster).toBe(0);
      act(() => swipe(500, 300)); // starts already at the edge → navigates
      expect(result.current.activeCluster).toBe(1);
    });

    it('ArrowDown scrolls the content instead of navigating while there is room', () => {
      const el = makeContainer({ scrollTop: 0, scrollHeight: 2000, clientHeight: 800 });
      const { result } = renderHook(() =>
        useScrollNavigation({ sectionCount: 6, enabled: true, containerRef: { current: el } }),
      );
      act(() => key('ArrowDown'));
      expect(result.current.activeCluster).toBe(0);
      expect(el.scrollTop).toBeGreaterThan(0);
    });

    it('ArrowDown navigates once the content is at the bottom', () => {
      const el = makeContainer({ scrollTop: 1200, scrollHeight: 2000, clientHeight: 800 });
      const { result } = renderHook(() =>
        useScrollNavigation({ sectionCount: 6, enabled: true, containerRef: { current: el } }),
      );
      act(() => key('ArrowDown'));
      expect(result.current.activeCluster).toBe(1);
    });
  });

  it('ignores keyboard gestures while typing in a form field', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    const { result } = renderHook(() => useScrollNavigation({ sectionCount: 6, enabled: true }));
    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
    });
    expect(result.current.activeCluster).toBe(0);
    input.remove();
  });

  it('removes its listeners on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useScrollNavigation({ sectionCount: 6, enabled: true }));
    const addedTypes = addSpy.mock.calls.map((c) => c[0]).sort();
    unmount();
    const removedTypes = removeSpy.mock.calls.map((c) => c[0]).sort();
    expect(removedTypes).toEqual(addedTypes);
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
