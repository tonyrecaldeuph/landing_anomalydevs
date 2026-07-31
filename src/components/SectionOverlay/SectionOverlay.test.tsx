import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('gsap', () => ({
  default: {
    quickTo: vi.fn(() => vi.fn()),
    registerPlugin: vi.fn(),
    fromTo: vi.fn(() => ({ kill: vi.fn(), scrollTrigger: { kill: vi.fn() } })),
  },
}));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }));

const { SectionOverlay } = await import('./SectionOverlay');

describe('SectionOverlay', () => {
  it('renders Hero component for index 0', async () => {
    render(<SectionOverlay activeIndex={0} />);
    expect(await screen.findByText(/DETECTAMOS/i)).toBeInTheDocument();
  });

  it('fades to the next section after the transition delay', async () => {
    const { rerender } = render(<SectionOverlay activeIndex={0} />);
    await screen.findByText(/DETECTAMOS/i);
    rerender(<SectionOverlay activeIndex={1} />);
    expect(await screen.findByText('Sobre nosotros')).toBeInTheDocument();
    expect(screen.queryByText(/DETECTAMOS/i)).not.toBeInTheDocument();
  });

  it('renders the Footer inside the last section', async () => {
    render(<SectionOverlay activeIndex={5} />);
    expect(await screen.findByText(/Todos los derechos reservados/i)).toBeInTheDocument();
  });
});
