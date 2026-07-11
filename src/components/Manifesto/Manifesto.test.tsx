import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Manifesto } from './Manifesto';

describe('Manifesto', () => {
  it('renders heading, body and 3 stats', () => {
    render(<Manifesto />);
    expect(screen.getByRole('heading', { name: 'Sobre nosotros' })).toBeInTheDocument();
    expect(screen.getByText(/no partimos de una plantilla/)).toBeInTheDocument();
    expect(screen.getByText('+30')).toBeInTheDocument();
    expect(screen.getByText('proyectos entregados')).toBeInTheDocument();
  });
});
