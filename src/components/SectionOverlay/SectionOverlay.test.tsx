import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('gsap', () => ({
  default: { quickTo: vi.fn(() => vi.fn()) },
}));

const { SectionOverlay } = await import('./SectionOverlay');

describe('SectionOverlay', () => {
  it('renders Hero component for index 0', async () => {
    render(<SectionOverlay activeIndex={0} />);
    expect(await screen.findByText(/DETECTAMOS/i)).toBeInTheDocument();
  });
});
