import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../three/supportsWebGL', () => ({ supportsWebGL: () => true }));

const disposeSpy = vi.fn();
const setPointerSpy = vi.fn();
const clearPointerSpy = vi.fn();
vi.mock('./ParticleScene', () => ({
  createParticleScene: vi.fn(() => ({
    domElement: document.createElement('canvas'),
    setActiveCluster: vi.fn(),
    startEnter: vi.fn(),
    dispose: disposeSpy,
    resize: vi.fn(),
    setPointer: setPointerSpy,
    clearPointer: clearPointerSpy,
  })),
}));

const { ImmersiveCanvas } = await import('./ImmersiveCanvas');

describe('ImmersiveCanvas', () => {
  it('does not leak a stale canvas when its effect cleans up and re-runs while still mounted', () => {
    // Mirrors what React StrictMode's mount -> cleanup -> mount actually does in dev, and what
    // happens any time this effect's deps change (e.g. reducedMotion toggling) in production too.
    const { container, rerender } = render(<ImmersiveCanvas onSceneReady={vi.fn()} />);
    expect(container.querySelectorAll('canvas')).toHaveLength(1);

    rerender(<ImmersiveCanvas onSceneReady={vi.fn()} />); // new callback reference -> effect cleans up + re-runs

    expect(disposeSpy).toHaveBeenCalled();
    expect(container.querySelectorAll('canvas')).toHaveLength(1);
  });

  it('forwards mouse moves to the scene as normalized device coordinates and clears on leave', () => {
    render(<ImmersiveCanvas onSceneReady={vi.fn()} />);
    fireEvent.pointerMove(window, { clientX: window.innerWidth, clientY: 0, pointerType: 'mouse' });
    expect(setPointerSpy).toHaveBeenLastCalledWith(1, 1);
    fireEvent.pointerLeave(document.documentElement);
    fireEvent.blur(window);
    expect(clearPointerSpy).toHaveBeenCalled();
  });
});
