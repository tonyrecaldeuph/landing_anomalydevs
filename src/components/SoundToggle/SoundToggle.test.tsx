import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { SoundToggle } from './SoundToggle';

class MockOscillator {
  type = '';
  frequency = { value: 0 };
  connect() { return this; }
  start() {}
  stop() {}
}
class MockGain {
  gain = { value: 0, linearRampToValueAtTime: () => {} };
  connect() { return this; }
}
class MockAudioContext {
  currentTime = 0;
  createOscillator() { return new MockOscillator(); }
  createGain() { return new MockGain(); }
  destination = {};
  close() {}
}

describe('SoundToggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    // @ts-expect-error test override, jsdom has no real Web Audio API
    global.AudioContext = MockAudioContext;
  });

  it('starts disabled by default', () => {
    render(<SoundToggle />);
    expect(screen.getByRole('button')).toHaveTextContent('Sonido: desactivado');
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('enables sound on click, updates the label, and persists the preference', () => {
    render(<SoundToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('Sonido: activado');
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    expect(window.localStorage.getItem('anomalydevs:sound-enabled')).toBe('true');
  });

  it('restores the persisted preference on mount', () => {
    window.localStorage.setItem('anomalydevs:sound-enabled', 'true');
    render(<SoundToggle />);
    expect(screen.getByRole('button')).toHaveTextContent('Sonido: activado');
  });
});
