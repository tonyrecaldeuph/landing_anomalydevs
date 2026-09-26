import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductPage } from './ProductPage';
import { telegramProSendPage } from '../../content/products/telegramProSend';
// @ts-expect-error: tipos de Node no incluidos en la landing; import solo para Vitest
import { readFileSync } from 'node:fs';
// @ts-expect-error: tipos de Node no incluidos en la landing; import solo para Vitest
import { join } from 'node:path';

vi.mock('../../components/ImmersiveCanvas/ImmersiveCanvas', () => ({
  ImmersiveCanvas: () => null,
}));

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

  it('apila el contenido sobre el fondo de partículas dejando ver el canvas', () => {
    // @ts-expect-error: process solo existe en el runtime de Vitest/Node
    const modulePath = join(process.cwd(), 'src', 'pages', 'ProductPage', 'ProductPage.module.css');
    const moduleCss = readFileSync(modulePath, 'utf8');
    expect(moduleCss).toContain('position: relative');
    expect(moduleCss).toContain('z-index: 1');
    expect(moduleCss).toContain('background: transparent');
    // @ts-expect-error: process solo existe en el runtime de Vitest/Node
    const globalPath = join(process.cwd(), 'src', 'pages', 'ProductPage', 'product.css');
    const globalCss = readFileSync(globalPath, 'utf8');
    expect(globalCss).toContain('background');

    const { container } = render(<ProductPage content={telegramProSendPage} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('no falla sin WebGL y no monta canvas', () => {
    const { container } = render(<ProductPage content={telegramProSendPage} />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'TelegramProSend' }),
    ).toBeInTheDocument();
    expect(container.querySelector('canvas')).toBeNull();
  });
});
