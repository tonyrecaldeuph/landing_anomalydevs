import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('gsap', () => ({
  default: { quickTo: vi.fn(() => vi.fn()) },
}));

const { Hero } = await import('./Hero');
const { NavigationContext } = await import('../../hooks/navigationContext');

describe('Hero', () => {
  it('renders headline, subheadline and both CTAs from content', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { name: 'DETECTAMOS LA ANOMALÍA.' })).toBeInTheDocument();
    expect(screen.getByText('Software que no sigue el molde.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver proyectos' })).toHaveAttribute('href', '#proyectos');
    expect(screen.getByRole('link', { name: 'Hablemos' })).toHaveAttribute('href', '#contacto');
  });

  it('CTAs navigate by cluster index: Ver proyectos → 3, Hablemos → 5', () => {
    const navigateTo = vi.fn();
    render(
      <NavigationContext.Provider value={navigateTo}>
        <Hero />
      </NavigationContext.Provider>,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Ver proyectos' }));
    expect(navigateTo).toHaveBeenCalledWith(3);
    fireEvent.click(screen.getByRole('link', { name: 'Hablemos' }));
    expect(navigateTo).toHaveBeenCalledWith(5);
  });
});
