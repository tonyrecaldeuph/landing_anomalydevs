import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useScrollNavigation } from './useScrollNavigation';

describe('useScrollNavigation', () => {
  it('starts at cluster 0', () => {
    const { result } = renderHook(() => useScrollNavigation({ sectionCount: 6 }));
    expect(result.current.activeCluster).toBe(0);
  });

  it('navigateTo changes active cluster', () => {
    const { result } = renderHook(() => useScrollNavigation({ sectionCount: 6 }));
    act(() => result.current.navigateTo(3));
    expect(result.current.activeCluster).toBe(3);
  });
});
