import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders the wordmark and the current year in the copyright line', () => {
    render(<Footer />);
    expect(screen.getByText('anomalydevs')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} AnomalyDevs`))).toBeInTheDocument();
  });
});
