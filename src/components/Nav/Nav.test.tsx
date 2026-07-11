import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Nav } from './Nav';

describe('Nav', () => {
  it('renders a link for each nav section plus the logo wordmark', () => {
    render(<Nav />);
    expect(screen.getByText('anomalydevs')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Servicios' })).toHaveAttribute('href', '#servicios');
    expect(screen.getByRole('link', { name: 'Proyectos' })).toHaveAttribute('href', '#proyectos');
    expect(screen.getByRole('link', { name: 'Testimonios' })).toHaveAttribute('href', '#testimonios');
    expect(screen.getByRole('link', { name: 'Contacto' })).toHaveAttribute('href', '#contacto');
  });
});
