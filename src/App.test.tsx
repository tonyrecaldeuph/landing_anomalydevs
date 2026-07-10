import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('gsap', () => ({
  default: { quickTo: vi.fn(() => vi.fn()) },
}));

vi.mock('./components/ImmersiveCanvas/ImmersiveCanvas', () => ({
  ImmersiveCanvas: () => null,
}));

vi.mock('./hooks/useCursor', () => ({
  useCursor: () => {},
}));

const { default: App } = await import('./App');

describe('App', () => {
  it('shows EnterScreen first, then renders sections after click', async () => {
    render(<App />);

    expect(screen.getByText('Haz clic para entrar')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Haz clic para entrar'));

    await waitFor(() => {
      expect(screen.getByText('DETECTAMOS LA ANOMALÍA.')).toBeInTheDocument();
    });
  });
});
