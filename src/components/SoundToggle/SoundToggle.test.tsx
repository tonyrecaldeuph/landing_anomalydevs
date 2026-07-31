import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SoundToggle } from './SoundToggle';

const playSpy = vi.fn(() => Promise.resolve());
const pauseSpy = vi.fn();

describe('SoundToggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    playSpy.mockClear();
    pauseSpy.mockClear();
    // jsdom does not implement media playback
    vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(playSpy);
    vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(pauseSpy);
    vi.spyOn(window.HTMLMediaElement.prototype, 'paused', 'get').mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts disabled by default and does not touch the audio track', () => {
    render(<SoundToggle />);
    expect(screen.getByRole('button')).toHaveTextContent('Sonido: desactivado');
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    expect(playSpy).not.toHaveBeenCalled();
  });

  it('enables sound on click: plays the ambient track and persists the preference', () => {
    render(<SoundToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('Sonido: activado');
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    expect(window.localStorage.getItem('anomalydevs:sound-enabled')).toBe('true');
    expect(playSpy).toHaveBeenCalledTimes(1);
  });

  it('restores the persisted preference on mount and starts playback', () => {
    window.localStorage.setItem('anomalydevs:sound-enabled', 'true');
    render(<SoundToggle />);
    expect(screen.getByRole('button')).toHaveTextContent('Sonido: activado');
    expect(playSpy).toHaveBeenCalledTimes(1);
  });

  it('disabling sound pauses the track after the fade-out', async () => {
    render(<SoundToggle />);
    fireEvent.click(screen.getByRole('button')); // on
    fireEvent.click(screen.getByRole('button')); // off
    expect(screen.getByRole('button')).toHaveTextContent('Sonido: desactivado');
    await waitFor(() => expect(pauseSpy).toHaveBeenCalled(), { timeout: 2000 });
  });

  it('retries playback on the first user gesture when autoplay is blocked', async () => {
    playSpy.mockImplementationOnce(() => Promise.reject(new Error('NotAllowedError')));
    window.localStorage.setItem('anomalydevs:sound-enabled', 'true');
    render(<SoundToggle />);
    await waitFor(() => expect(playSpy).toHaveBeenCalledTimes(1));
    fireEvent.pointerDown(window);
    await waitFor(() => expect(playSpy).toHaveBeenCalledTimes(2));
  });
});
