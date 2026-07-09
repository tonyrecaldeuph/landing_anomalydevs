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
