import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Contact } from './Contact';

describe('Contact', () => {
  it('renders heading, email and phone from content', () => {
    render(<Contact />);
    expect(screen.getByRole('heading', { name: '¿Tienes una anomalía que resolver?' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'anomalydevsec@gmail.com' })).toHaveAttribute('href', 'mailto:anomalydevsec@gmail.com');
    expect(screen.getByRole('link', { name: '+593 098 096 4513' })).toHaveAttribute('href', 'tel:+5930980964513');
  });

  it('shows a validation error when submitting with empty fields', () => {
    render(<Contact />);
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(screen.getByText('Completa todos los campos antes de enviar.')).toBeInTheDocument();
  });

  it('calls onSubmit with form values when all fields are filled', () => {
    const onSubmit = vi.fn();
    render(<Contact onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@example.com' } });
    fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: 'Hola, quiero cotizar un proyecto.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Ana', email: 'ana@example.com', message: 'Hola, quiero cotizar un proyecto.' });
  });
});
