import { describe, it, expect } from 'vitest';
// @ts-expect-error: tipos de Node no incluidos en la landing; import solo para Vitest
import { readFileSync, existsSync } from 'node:fs';
// @ts-expect-error: tipos de Node no incluidos en la landing; import solo para Vitest
import { join } from 'node:path';

describe('product page entry', () => {
  it('declara la página de TelegramProSend como entrada multipágina de Vite', () => {
    // @ts-expect-error: process solo existe en el runtime de Vitest/Node
    const configPath = join(process.cwd(), 'vite.config.ts');
    expect(existsSync(configPath)).toBe(true);
    const config = readFileSync(configPath, 'utf8');
    expect(config).toContain('productos/telegramprosend/index.html');
    expect(config).toContain('rollupOptions');
  });

  it('publica el HTML de la página con su script y metadatos', () => {
    // @ts-expect-error: process solo existe en el runtime de Vitest/Node
    const htmlPath = join(process.cwd(), 'productos', 'telegramprosend', 'index.html');
    expect(existsSync(htmlPath)).toBe(true);
    const html = readFileSync(htmlPath, 'utf8');
    expect(html).toContain('/src/pages/ProductPage/main.tsx');
    expect(html).toContain('TelegramProSend');
    expect(html).toContain('https://anomalydevs.qzz.io/productos/telegramprosend/');
  });

  it('monta la página con su propio punto de entrada', () => {
    // @ts-expect-error: process solo existe en el runtime de Vitest/Node
    const mainPath = join(process.cwd(), 'src', 'pages', 'ProductPage', 'main.tsx');
    expect(existsSync(mainPath)).toBe(true);
    const main = readFileSync(mainPath, 'utf8');
    expect(main).toContain('telegramProSendPage');
  });
});
