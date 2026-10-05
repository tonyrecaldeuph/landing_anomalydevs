import { describe, it, expect } from 'vitest';
import { terminalMarketingPage } from './terminalMarketing';

describe('terminalMarketingPage', () => {
  it('expone slug, nombre y resumen del producto', () => {
    expect(terminalMarketingPage.slug).toBe('terminal-marketing');
    expect(terminalMarketingPage.name).toBe('Terminal Marketing');
    expect(terminalMarketingPage.tagline.length).toBeGreaterThan(0);
    expect(terminalMarketingPage.summary).toMatch(/no necesita licencia/i);
  });

  it('describe 6 funcionalidades del producto', () => {
    expect(terminalMarketingPage.features).toHaveLength(6);
    terminalMarketingPage.features.forEach((feature) => {
      expect(feature.title.length).toBeGreaterThan(0);
      expect(feature.text.length).toBeGreaterThan(0);
    });
  });

  it('ofrece el instalador .exe de Windows con su versión y sin licencia', () => {
    expect(terminalMarketingPage.download.href).toMatch(/Setup%203\.0\.9\.exe$/);
    expect(terminalMarketingPage.download.note).toMatch(/v3\.0\.9 · Sin licencia/);
    expect(terminalMarketingPage.requirements.join(' ')).toMatch(/Windows 10\/11/);
  });

  it('explica que el acceso lo da el administrador creando el usuario, no una licencia', () => {
    const { access } = terminalMarketingPage;
    expect(access.heading).toBe('Acceso: sin licencia');
    expect(access.ctaLabel).toBe('Solicitar usuario al administrador');
    expect(access.steps.join(' ')).toMatch(/administrador del sistema crea tu usuario/);
    expect(access.imageAlt.length).toBeGreaterThan(0);
  });

  it('responde en la FAQ que no hace falta licencia', () => {
    const licencia = terminalMarketingPage.faq.find((entry) => /licencia/i.test(entry.question));
    expect(licencia?.answer).toMatch(/^No\./);
  });

  it('guía el uso con capturas accesibles en cada paso', () => {
    expect(terminalMarketingPage.usageSteps.length).toBeGreaterThanOrEqual(5);
    terminalMarketingPage.usageSteps.forEach((step) => {
      expect(step.image).toBeDefined();
      expect(step.imageAlt?.trim().length).toBeGreaterThan(0);
    });
  });
});
