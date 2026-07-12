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
