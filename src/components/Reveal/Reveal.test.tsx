import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('gsap', () => ({
  default: {
    registerPlugin: vi.fn(),
    fromTo: vi.fn(() => ({ kill: vi.fn(), scrollTrigger: { kill: vi.fn() } })),
  },
}));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }));

const gsap = (await import('gsap')).default;
const { Reveal } = await import('./Reveal');

describe('Reveal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('renders its children', () => {
    const { getByText } = render(
      <Reveal>
        <p>Hola</p>
      </Reveal>,
    );
    expect(getByText('Hola')).toBeInTheDocument();
  });

  it('registers a scroll-triggered fromTo tween from hidden to visible', () => {
    render(
      <Reveal>
        <p>Hola</p>
      </Reveal>,
    );
    expect(gsap.fromTo).toHaveBeenCalledTimes(1);
    const [, fromVars, toVars] = (gsap.fromTo as unknown as { mock: { calls: unknown[][] } }).mock.calls[0] as [
      unknown,
      { opacity: number; y: number },
      { opacity: number; y: number },
    ];
    expect(fromVars).toMatchObject({ opacity: 0, y: 24 });
    expect(toVars).toMatchObject({ opacity: 1, y: 0 });
  });
});
