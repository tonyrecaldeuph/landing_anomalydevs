import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders all sections in order: Hero, Manifesto, Services, Projects, Testimonials, Contact, Footer', () => {
    render(<App />);
    const headings = screen.getAllByRole('heading', { level: 1 }).concat(screen.getAllByRole('heading', { level: 2 }));
    const headingTexts = headings.map((h) => h.textContent);
    expect(headingTexts).toEqual([
      'DETECTAMOS LA ANOMALÍA.',
      'Sobre nosotros',
      'Servicios',
      'Proyectos',
      'Testimonios',
      '¿Tienes una anomalía que resolver?',
    ]);
  });
});
