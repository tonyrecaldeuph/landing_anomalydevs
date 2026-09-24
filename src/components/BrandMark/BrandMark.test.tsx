import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrandMark } from './BrandMark';

describe('BrandMark', () => {
  it('is a decorative svg hidden from assistive tech', () => {
    const { container } = render(<BrandMark />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
