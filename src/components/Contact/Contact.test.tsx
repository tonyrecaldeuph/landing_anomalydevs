import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { Contact } from './Contact';

function fillForm() {
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@example.com' } });
  fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: 'Hola, quiero cotizar un proyecto.' } });
}

describe('Contact', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

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

  it('POSTs the form to /api/contact and shows a success message', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ ok: true }) }));
    vi.stubGlobal('fetch', fetchMock);
    render(<Contact />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(await screen.findByRole('status')).toHaveTextContent('¡Mensaje enviado!');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/contact');
    expect(JSON.parse(init.body as string)).toEqual({
      name: 'Ana',
      email: 'ana@example.com',
      message: 'Hola, quiero cotizar un proyecto.',
      website: '',
    });
    // the form clears after a successful send
    expect(screen.getByLabelText('Nombre')).toHaveValue('');
  });

  it('shows the server-provided error when the API rejects the payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, json: async () => ({ ok: false, error: 'El email no parece válido.' }) })),
    );
    render(<Contact />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(await screen.findByText('El email no parece válido.')).toBeInTheDocument();
  });

  it('shows a generic error message when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new Error('network down'))));
    render(<Contact />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(await screen.findByText(/No se pudo enviar el mensaje/)).toBeInTheDocument();
    // the values stay so the user can retry
    await waitFor(() => expect(screen.getByLabelText('Nombre')).toHaveValue('Ana'));
  });
});
