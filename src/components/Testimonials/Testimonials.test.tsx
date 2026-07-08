import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Testimonials } from './Testimonials';
import { testimonials } from '../../content/testimonials';

describe('Testimonials', () => {
  it('renders each quote, author and initials badge', () => {
    render(<Testimonials />);
    testimonials.forEach((t) => {
      expect(screen.getByText(`"${t.quote}"`)).toBeInTheDocument();
      expect(screen.getByText(t.author)).toBeInTheDocument();
      expect(screen.getByText(t.initials)).toBeInTheDocument();
    });
  });
});
