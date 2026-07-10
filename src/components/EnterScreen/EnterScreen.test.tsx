import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EnterScreen } from './EnterScreen';

describe('EnterScreen', () => {
  it('renders hint text', () => {
    render(<EnterScreen onEnter={vi.fn()} />);
    expect(screen.getByText('Haz clic para entrar')).toBeInTheDocument();
  });

  it('calls onEnter on click', () => {
    vi.useFakeTimers();
    const onEnter = vi.fn();
    render(<EnterScreen onEnter={onEnter} />);
    fireEvent.click(screen.getByText('Haz clic para entrar'));
    vi.advanceTimersByTime(700);
    expect(onEnter).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
