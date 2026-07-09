import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { Nav } from './Nav';

class MockAudioContext {
  currentTime = 0;
  createOscillator() {
    return { type: '', frequency: { value: 0 }, connect() { return this; }, start() {}, stop() {} };
  }
  createGain() {
    return { gain: { value: 0, linearRampToValueAtTime: () => {} }, connect() { return this; } };
  }
  destination = {};
  close() {}
}

describe('Nav', () => {
  beforeEach(() => {
    // @ts-expect-error test override, jsdom has no real Web Audio API
    global.AudioContext = MockAudioContext;
  });

  it('renders a link for each nav section plus the logo wordmark', () => {
    render(<Nav />);
    expect(screen.getByText('anomalydevs')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Servicios' })).toHaveAttribute('href', '#servicios');
    expect(screen.getByRole('link', { name: 'Proyectos' })).toHaveAttribute('href', '#proyectos');
    expect(screen.getByRole('link', { name: 'Testimonios' })).toHaveAttribute('href', '#testimonios');
    expect(screen.getByRole('link', { name: 'Contacto' })).toHaveAttribute('href', '#contacto');
  });
});
