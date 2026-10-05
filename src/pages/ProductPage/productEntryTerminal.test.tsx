import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductPage } from './ProductPage';
import { terminalMarketingPage } from '../../content/products/terminalMarketing';
// @ts-expect-error: tipos de Node no incluidos en la landing; import solo para Vitest
import { readFileSync, existsSync } from 'node:fs';
// @ts-expect-error: tipos de Node no incluidos en la landing; import solo para Vitest
import { join } from 'node:path';

vi.mock('../../components/ImmersiveCanvas/ImmersiveCanvas', () => ({
  ImmersiveCanvas: () => null,
}));

describe('terminal marketing product page entry', () => {
  it('declara la página de Terminal Marketing como entrada multipágina de Vite', () => {
    // @ts-expect-error: process solo existe en el runtime de Vitest/Node
    const config = readFileSync(join(process.cwd(), 'vite.config.ts'), 'utf8');
    expect(config).toContain('productos/terminal-marketing/index.html');
  });

  it('publica el HTML de la página con su script y metadatos', () => {
    // @ts-expect-error: process solo existe en el runtime de Vitest/Node
    const htmlPath = join(process.cwd(), 'productos', 'terminal-marketing', 'index.html');
    expect(existsSync(htmlPath)).toBe(true);
    const html = readFileSync(htmlPath, 'utf8');
    expect(html).toContain('/src/pages/ProductPage/main-terminal-marketing.tsx');
    expect(html).toContain('<title>Terminal Marketing — ');
    expect(html).toContain('https://anomalydevs.qzz.io/productos/terminal-marketing/');
  });

  it('monta la página con su propio punto de entrada', () => {
    // @ts-expect-error: process solo existe en el runtime de Vitest/Node
    const mainPath = join(process.cwd(), 'src', 'pages', 'ProductPage', 'main-terminal-marketing.tsx');
    expect(existsSync(mainPath)).toBe(true);
    expect(readFileSync(mainPath, 'utf8')).toContain('terminalMarketingPage');
  });
});

describe('ProductPage con contenido de Terminal Marketing', () => {
  it('muestra el acceso sin licencia en lugar de la activación de licencia', () => {
    render(<ProductPage content={terminalMarketingPage} />);
    expect(screen.getByRole('heading', { name: 'Acceso: sin licencia' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Activar la licencia' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Solicitar usuario al administrador/ }).length).toBe(2);
    expect(screen.queryByRole('link', { name: /Solicitar licencia/ })).not.toBeInTheDocument();
  });

  it('ofrece el instalador en el hero y en el cierre', () => {
    render(<ProductPage content={terminalMarketingPage} />);
    const downloads = screen.getAllByRole('link', { name: /Descargar/ });
    expect(downloads).toHaveLength(2);
    downloads.forEach((link) => expect(link).toHaveAttribute('href', terminalMarketingPage.download.href));
  });
});
