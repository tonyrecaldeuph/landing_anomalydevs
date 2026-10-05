import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductPage } from './ProductPage';
import { smsProSendPage } from '../../content/products/smsProSend';
// @ts-expect-error: tipos de Node no incluidos en la landing; import solo para Vitest
import { readFileSync, existsSync } from 'node:fs';
// @ts-expect-error: tipos de Node no incluidos en la landing; import solo para Vitest
import { join } from 'node:path';

vi.mock('../../components/ImmersiveCanvas/ImmersiveCanvas', () => ({
  ImmersiveCanvas: () => null,
}));

describe('sms product page entry', () => {
  it('declara la página de SMS_RCS_PRO_V3.0 como entrada multipágina de Vite', () => {
    // @ts-expect-error: process solo existe en el runtime de Vitest/Node
    const configPath = join(process.cwd(), 'vite.config.ts');
    expect(existsSync(configPath)).toBe(true);
    const config = readFileSync(configPath, 'utf8');
    expect(config).toContain('productos/smsprosend/index.html');
  });

  it('publica el HTML de la página con su script y metadatos', () => {
    // @ts-expect-error: process solo existe en el runtime de Vitest/Node
    const htmlPath = join(process.cwd(), 'productos', 'smsprosend', 'index.html');
    expect(existsSync(htmlPath)).toBe(true);
    const html = readFileSync(htmlPath, 'utf8');
    expect(html).toContain('/src/pages/ProductPage/main-sms.tsx');
    expect(html).toContain('SMS_RCS_PRO_V3.0');
    expect(html).toContain('https://anomalydevs.qzz.io/productos/smsprosend/');
  });

  it('monta la página SMS con su propio punto de entrada', () => {
    // @ts-expect-error: process solo existe en el runtime de Vitest/Node
    const mainPath = join(process.cwd(), 'src', 'pages', 'ProductPage', 'main-sms.tsx');
    expect(existsSync(mainPath)).toBe(true);
    const main = readFileSync(mainPath, 'utf8');
    expect(main).toContain('smsProSendPage');
  });
});

describe('ProductPage con contenido SMS', () => {
  it('muestra el nombre SMS_RCS_PRO_V3.0 como h1 con kicker SMS/RCS', () => {
    render(<ProductPage content={smsProSendPage} />);
    expect(screen.getByRole('heading', { level: 1, name: 'SMS_RCS_PRO_V3.0' })).toBeInTheDocument();
    expect(screen.getByText('Extensión de Chrome · SMS/RCS')).toBeInTheDocument();
  });

  it('ofrece la descarga SMS en el hero y en el cierre con CTA dinámica', () => {
    render(<ProductPage content={smsProSendPage} />);
    const downloads = screen.getAllByRole('link', { name: /Descargar/ });
    expect(downloads.length).toBeGreaterThanOrEqual(2);
    downloads.forEach((link) => {
      expect(link).toHaveAttribute('href', '/files/SmsProSend-3.0.1.zip');
      expect(link).toHaveAttribute('download');
    });
    expect(screen.getByRole('heading', { name: 'Descarga SMS_RCS_PRO_V3.0' })).toBeInTheDocument();
  });

  it('muestra la versión 3.0.1 junto a la descarga', () => {
    render(<ProductPage content={smsProSendPage} />);
    expect(screen.getAllByText(/v3\.0\.1/).length).toBeGreaterThanOrEqual(1);
  });
});
