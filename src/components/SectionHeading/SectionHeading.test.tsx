import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SectionHeading } from './SectionHeading';

describe('SectionHeading', () => {
  it('renders the title as an h2 plus the index and kicker as decoration', () => {
    const { container } = render(<SectionHeading index={2} kicker="lo que hacemos" title="Servicios" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Servicios' })).toBeInTheDocument();
    expect(container.textContent).toContain('02');
    expect(container.textContent).toContain('lo que hacemos');
  });
});
