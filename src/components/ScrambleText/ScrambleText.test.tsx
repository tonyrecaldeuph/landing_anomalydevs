import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScrambleText } from './ScrambleText';

describe('ScrambleText', () => {
  it('exposes the final text to assistive tech from the first render', () => {
    render(<ScrambleText as="h1" text="DETECTAMOS LA ANOMALÍA." />);
    expect(screen.getByRole('heading', { name: 'DETECTAMOS LA ANOMALÍA.' })).toBeInTheDocument();
  });

  it('keeps the animated glyph layer hidden from assistive tech', () => {
    const { container } = render(<ScrambleText text="HOLA" />);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });
});
