import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HudFrame } from './HudFrame';
import { SectionRail } from './SectionRail';

describe('HudFrame', () => {
  it('reads out the active section', () => {
    render(<HudFrame activeCluster={3} />);
    expect(screen.getByText('SEC 04/06 · PROYECTOS')).toBeInTheDocument();
  });
});

describe('SectionRail', () => {
  it('renders one labelled button per section and marks the active one', () => {
    render(<SectionRail activeCluster={2} onNavigate={vi.fn()} />);
    expect(screen.getAllByRole('button')).toHaveLength(6);
    expect(screen.getByRole('button', { name: 'Ir a Servicios' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('button', { name: 'Ir a Inicio' })).not.toHaveAttribute('aria-current');
  });

  it('navigates to the clicked section index', () => {
    const onNavigate = vi.fn();
    render(<SectionRail activeCluster={0} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ir a Contacto' }));
    expect(onNavigate).toHaveBeenCalledWith(5);
  });
});
