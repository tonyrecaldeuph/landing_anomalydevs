import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('gsap', () => ({
  default: { quickTo: vi.fn(() => vi.fn()) },
}));

const gsap = (await import('gsap')).default;
const { MagneticButton } = await import('./MagneticButton');

describe('MagneticButton', () => {
  it('renders as a link with the given href and className', () => {
    render(
      <MagneticButton href="#contacto" className="my-cta">
        Hablemos
      </MagneticButton>,
    );
    const link = screen.getByRole('link', { name: 'Hablemos' });
    expect(link).toHaveAttribute('href', '#contacto');
    expect(link).toHaveClass('my-cta');
  });

  it('sets up quickTo tweens for x and y on mount', () => {
    render(<MagneticButton href="#contacto">Hablemos</MagneticButton>);
    expect(gsap.quickTo).toHaveBeenCalledWith(expect.anything(), 'x', expect.objectContaining({ duration: 0.4 }));
    expect(gsap.quickTo).toHaveBeenCalledWith(expect.anything(), 'y', expect.objectContaining({ duration: 0.4 }));
  });
});
