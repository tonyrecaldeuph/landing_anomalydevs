import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TiltCard } from './TiltCard';

describe('TiltCard', () => {
  it('renders its children inside an article', () => {
    render(<TiltCard className="x"><h3>Tarjeta</h3></TiltCard>);
    expect(screen.getByRole('article')).toContainElement(screen.getByRole('heading', { name: 'Tarjeta' }));
  });

  it('writes tilt CSS variables on pointer move and resets them on leave', () => {
    render(<TiltCard><p>t</p></TiltCard>);
    const card = screen.getByRole('article');
    card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 }) as DOMRect;
    fireEvent.pointerMove(card, { clientX: 100, clientY: 0 });
    expect(card.style.getPropertyValue('--glare-x')).toBe('100%');
    fireEvent.pointerLeave(card);
    expect(card.style.getPropertyValue('--rx')).toBe('0deg');
  });
});
