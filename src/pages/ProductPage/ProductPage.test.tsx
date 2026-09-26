import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProductPage } from './ProductPage';
import { telegramProSendPage } from '../../content/products/telegramProSend';

describe('ProductPage', () => {
  it('muestra el nombre del producto como h1', () => {
    render(<ProductPage content={telegramProSendPage} />);
    expect(screen.getByRole('heading', { level: 1, name: 'TelegramProSend' })).toBeInTheDocument();
  });

  it('ofrece la descarga en el hero y en el cierre', () => {
    render(<ProductPage content={telegramProSendPage} />);
    const downloads = screen.getAllByRole('link', { name: /Descargar/ });
    expect(downloads.length).toBeGreaterThanOrEqual(2);
    downloads.forEach((link) => {
      expect(link).toHaveAttribute('href', '/files/TelegramProSend.zip');
      expect(link).toHaveAttribute('download');
    });
  });

  it('incluye las guías de instalación y uso', () => {
    render(<ProductPage content={telegramProSendPage} />);
    expect(screen.getByRole('heading', { name: 'Guía de instalación' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Guía de uso' })).toBeInTheDocument();
  });

  it('ilustra cada paso con capturas accesibles', () => {
    render(<ProductPage content={telegramProSendPage} />);
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThanOrEqual(7);
    images.forEach((img) => {
      const alt = img.getAttribute('alt') ?? '';
      expect(alt.trim().length).toBeGreaterThan(0);
    });
  });

  it('enlaza de vuelta a los proyectos de la home', () => {
    render(<ProductPage content={telegramProSendPage} />);
    expect(screen.getByRole('link', { name: /Volver a proyectos/ })).toHaveAttribute(
      'href',
      '/#proyectos',
    );
  });
});
