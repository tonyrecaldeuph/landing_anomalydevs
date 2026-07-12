import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EnterScreen } from './EnterScreen';

describe('EnterScreen', () => {
  it('is a real button, reachable by keyboard and screen readers', () => {
    render(<EnterScreen onEnter={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Haz clic para entrar' })).toBeInTheDocument();
  });

  it('calls onEnter after clicking the entry button', () => {
    vi.useFakeTimers();
    const onEnter = vi.fn();
    render(<EnterScreen onEnter={onEnter} />);
    fireEvent.click(screen.getByRole('button', { name: 'Haz clic para entrar' }));
    vi.advanceTimersByTime(700);
    expect(onEnter).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('renders the wordmark, capitalized, as real reflowing text — not a fixed-width SVG that can clip long text', () => {
    const { container } = render(<EnterScreen onEnter={vi.fn()} />);
    expect(screen.getByText('Anomalydevs')).toBeInTheDocument();
    expect(container.querySelector('svg text')).toBeNull();
  });

  it('renders the brand icon mark', () => {
    const { container } = render(<EnterScreen onEnter={vi.fn()} />);
    expect(container.querySelector('svg')).not.toBeNull();
  });
});
