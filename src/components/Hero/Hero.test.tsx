import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('gsap', () => ({
  default: { quickTo: vi.fn(() => vi.fn()) },
}));

const { Hero } = await import('./Hero');

describe('Hero', () => {
  it('renders headline, subheadline and both CTAs from content', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { name: 'DETECTAMOS LA ANOMALÍA.' })).toBeInTheDocument();
    expect(screen.getByText('Software que no sigue el molde.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver proyectos' })).toHaveAttribute('href', '#proyectos');
    expect(screen.getByRole('link', { name: 'Hablemos' })).toHaveAttribute('href', '#contacto');
  });
});
