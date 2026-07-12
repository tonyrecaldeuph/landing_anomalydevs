import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
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

  it('renders the logo wordmark and a button for each nav section', () => {
    render(<Nav activeCluster={0} onNavigate={vi.fn()} />);
    expect(screen.getByText('anomalydevs')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Servicios' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Proyectos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Testimonios' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Contacto' })).toBeInTheDocument();
  });

  it('clicking a section button navigates to its cluster index', () => {
    const onNavigate = vi.fn();
    render(<Nav activeCluster={0} onNavigate={onNavigate} />);
    screen.getByRole('button', { name: 'Servicios' }).click();
    expect(onNavigate).toHaveBeenCalledWith(2);
    screen.getByRole('button', { name: 'Proyectos' }).click();
    expect(onNavigate).toHaveBeenCalledWith(3);
    screen.getByRole('button', { name: 'Testimonios' }).click();
    expect(onNavigate).toHaveBeenCalledWith(4);
    screen.getByRole('button', { name: 'Contacto' }).click();
    expect(onNavigate).toHaveBeenCalledWith(5);
  });

  it('clicking the logo navigates back to the hero cluster', () => {
    const onNavigate = vi.fn();
    render(<Nav activeCluster={3} onNavigate={onNavigate} />);
    screen.getByText('anomalydevs').click();
    expect(onNavigate).toHaveBeenCalledWith(0);
  });

  it('marks the button matching activeCluster as the current one', () => {
    render(<Nav activeCluster={3} onNavigate={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Proyectos' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('button', { name: 'Servicios' })).not.toHaveAttribute('aria-current');
  });

  it('passes activeCluster through to the sound toggle for frequency modulation', () => {
    render(<Nav activeCluster={2} onNavigate={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Sonido/ })).toBeInTheDocument();
  });
});
