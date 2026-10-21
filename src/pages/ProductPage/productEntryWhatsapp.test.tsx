import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductPage } from './ProductPage';
import { whatsappProSendPage } from '../../content/products/whatsappProSend';
// @ts-expect-error: tipos de Node no incluidos en la landing; import solo para Vitest
import { readFileSync, existsSync } from 'node:fs';
// @ts-expect-error: tipos de Node no incluidos en la landing; import solo para Vitest
import { join } from 'node:path';

vi.mock('../../components/ImmersiveCanvas/ImmersiveCanvas', () => ({
  ImmersiveCanvas: () => null,
}));

describe('whatsapp product page entry', () => {
  it('declara la página de WhatsAppProSend como entrada multipágina de Vite', () => {
    // @ts-expect-error: process solo existe en el runtime de Vitest/Node
    const configPath = join(process.cwd(), 'vite.config.ts');
    expect(existsSync(configPath)).toBe(true);
    const config = readFileSync(configPath, 'utf8');
    expect(config).toContain('productos/whatsappprosend/index.html');
  });

  it('publica el HTML de la página con su script y metadatos', () => {
    // @ts-expect-error: process solo existe en el runtime de Vitest/Node
    const htmlPath = join(process.cwd(), 'productos', 'whatsappprosend', 'index.html');
    expect(existsSync(htmlPath)).toBe(true);
    const html = readFileSync(htmlPath, 'utf8');
    expect(html).toContain('/src/pages/ProductPage/main-whatsapp.tsx');
    expect(html).toContain('<title>WhatsAppProSend — ');
    expect(html).toContain('https://anomalydevs.qzz.io/productos/whatsappprosend/');
  });

  it('monta la página con su propio punto de entrada', () => {
    // @ts-expect-error: process solo existe en el runtime de Vitest/Node
    const mainPath = join(process.cwd(), 'src', 'pages', 'ProductPage', 'main-whatsapp.tsx');
    expect(existsSync(mainPath)).toBe(true);
    const main = readFileSync(mainPath, 'utf8');
    expect(main).toContain('whatsappProSendPage');
  });
});

describe('ProductPage con contenido WhatsApp', () => {
  it('muestra el nombre WhatsAppProSend como h1 con kicker WhatsApp ADB', () => {
    render(<ProductPage content={whatsappProSendPage} />);
    expect(screen.getByRole('heading', { level: 1, name: 'WhatsAppProSend' })).toBeInTheDocument();
    expect(screen.getByText('Extensión de Chrome · WhatsApp ADB')).toBeInTheDocument();
  });

  it('ofrece la descarga versionada en el hero y en el cierre', () => {
    render(<ProductPage content={whatsappProSendPage} />);
    const downloads = screen.getAllByRole('link', { name: /Descargar/ });
    expect(downloads.length).toBeGreaterThanOrEqual(2);
    downloads.forEach((link) => {
      expect(link).toHaveAttribute('href', '/files/WhatsAppProSend-1.1.4.zip');
      expect(link).toHaveAttribute('download');
    });
    expect(screen.getByRole('heading', { name: 'Descarga WhatsAppProSend' })).toBeInTheDocument();
  });

  it('muestra la versión 1.1.4 junto a la descarga', () => {
    render(<ProductPage content={whatsappProSendPage} />);
    expect(screen.getAllByText(/v1\.1\.4/).length).toBeGreaterThanOrEqual(1);
  });

  it('pinta los cuatro resultados, incluido Sin WhatsApp', () => {
    render(<ProductPage content={whatsappProSendPage} />);
    ['Enviado', 'Sin WhatsApp', 'Pendiente', 'Error'].forEach((status) => {
      expect(screen.getByRole('heading', { name: new RegExp(`^${status}$`) })).toBeInTheDocument();
    });
  });

  it('incluye la guía de licencia y el instalador nativo', () => {
    render(<ProductPage content={whatsappProSendPage} />);
    expect(screen.getByRole('heading', { name: 'Activar la licencia' })).toBeInTheDocument();
    expect(screen.getAllByText(/native-launcher\\install\.exe/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByAltText(/Ventana de licencia de WhatsAppProSend/)).toBeInTheDocument();
  });
});
