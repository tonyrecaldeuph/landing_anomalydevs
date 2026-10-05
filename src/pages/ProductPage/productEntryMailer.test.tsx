import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductPage } from './ProductPage';
import { mailerProPage } from '../../content/products/mailerPro';
// @ts-expect-error: tipos de Node no incluidos en la landing; import solo para Vitest
import { readFileSync, existsSync } from 'node:fs';
// @ts-expect-error: tipos de Node no incluidos en la landing; import solo para Vitest
import { join } from 'node:path';

vi.mock('../../components/ImmersiveCanvas/ImmersiveCanvas', () => ({
  ImmersiveCanvas: () => null,
}));

describe('mailer product page entry', () => {
  it('declara la página de MailerPro como entrada multipágina de Vite', () => {
    // @ts-expect-error: process solo existe en el runtime de Vitest/Node
    const config = readFileSync(join(process.cwd(), 'vite.config.ts'), 'utf8');
    expect(config).toContain('productos/mailerpro/index.html');
  });

  it('publica el HTML de la página con su script y metadatos', () => {
    // @ts-expect-error: process solo existe en el runtime de Vitest/Node
    const htmlPath = join(process.cwd(), 'productos', 'mailerpro', 'index.html');
    expect(existsSync(htmlPath)).toBe(true);
    const html = readFileSync(htmlPath, 'utf8');
    expect(html).toContain('/src/pages/ProductPage/main-mailer.tsx');
    expect(html).toContain('<title>MailerPro — ');
    expect(html).toContain('https://anomalydevs.qzz.io/productos/mailerpro/');
  });

  it('monta la página de MailerPro con su propio punto de entrada', () => {
    // @ts-expect-error: process solo existe en el runtime de Vitest/Node
    const main = readFileSync(join(process.cwd(), 'src', 'pages', 'ProductPage', 'main-mailer.tsx'), 'utf8');
    expect(main).toContain('mailerProPage');
  });
});

describe('ProductPage con contenido de MailerPro', () => {
  it('muestra el nombre MailerPro como h1 con kicker Gmail', () => {
    render(<ProductPage content={mailerProPage} />);
    expect(screen.getByRole('heading', { level: 1, name: 'MailerPro' })).toBeInTheDocument();
    expect(screen.getByText('Extensión de Chrome · Gmail')).toBeInTheDocument();
  });

  it('ofrece la descarga versionada en el hero y en el cierre', () => {
    render(<ProductPage content={mailerProPage} />);
    const downloads = screen.getAllByRole('link', { name: /Descargar/ });
    expect(downloads.length).toBeGreaterThanOrEqual(2);
    downloads.forEach((link) => {
      expect(link).toHaveAttribute('href', '/files/MailerPro-3.3.0.zip');
      expect(link).toHaveAttribute('download');
    });
    expect(screen.getByRole('heading', { name: 'Descarga MailerPro' })).toBeInTheDocument();
    expect(screen.getAllByText(/v3\.3\.0/).length).toBeGreaterThanOrEqual(1);
  });
});
