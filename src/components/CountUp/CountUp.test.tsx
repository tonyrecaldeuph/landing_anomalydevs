import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CountUp } from './CountUp';

describe('CountUp', () => {
  it('exposes the final stat value to assistive tech', () => {
    render(<CountUp value="+30" />);
    expect(screen.getByText('+30')).toBeInTheDocument();
  });
});
