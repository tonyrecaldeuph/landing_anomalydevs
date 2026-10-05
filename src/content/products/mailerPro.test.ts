import { describe, it, expect } from 'vitest';
import { mailerProPage } from './mailerPro';

function collectTexts(value: unknown, out: string[]): void {
  if (typeof value === 'string') {
    out.push(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectTexts(item, out));
    return;
  }
  if (typeof value === 'object' && value !== null) {
    Object.values(value).forEach((item) => collectTexts(item, out));
  }
}

function allTexts(): string {
  const texts: string[] = [];
  collectTexts(mailerProPage, texts);
  return texts.join(' ');
}

describe('mailerProPage', () => {
  it('expone slug, nombre y resumen del producto', () => {
    expect(mailerProPage.slug).toBe('mailerpro');
    expect(mailerProPage.name).toBe('MailerPro');
    expect(mailerProPage.kicker).toBe('Extensión de Chrome · Gmail');
    expect(mailerProPage.tagline.length).toBeGreaterThan(0);
    expect(mailerProPage.summary.length).toBeGreaterThan(0);
  });

  it('describe 6 funcionalidades del producto', () => {
    expect(mailerProPage.features).toHaveLength(6);
    mailerProPage.features.forEach((feature) => {
      expect(feature.title.length).toBeGreaterThan(0);
      expect(feature.text.length).toBeGreaterThan(0);
    });
  });

  it('detalla la instalación con al menos 5 pasos y la URL de extensiones', () => {
    expect(mailerProPage.installSteps.length).toBeGreaterThanOrEqual(5);
    expect(mailerProPage.installSteps.join(' ')).toContain('chrome://extensions');
  });

  it('nombra el zip versionado en el primer paso de instalación', () => {
    expect(mailerProPage.installSteps[0]).toContain('MailerPro-3.3.0.zip');
  });

  it('guía el uso en 6 pasos con capturas accesibles', () => {
    expect(mailerProPage.usageSteps).toHaveLength(6);
    mailerProPage.usageSteps.forEach((step) => {
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.text.length).toBeGreaterThan(0);
      expect(step.image).toBeDefined();
      expect(step.imageAlt?.trim().length).toBeGreaterThan(0);
    });
  });

  it('descarga el zip versionado y muestra la versión junto a la licencia', () => {
    // Nombre versionado: Cloudflare cachea /files/* 4 h, un nombre fijo
    // seguía entregando la versión anterior tras publicar una nueva.
    expect(mailerProPage.download.href).toBe('/files/MailerPro-3.3.0.zip');
    expect(mailerProPage.download.note).toBe('v3.3.0 · Requiere licencia');
    expect(mailerProPage.access.ctaHref).toBe('/#contacto');
  });

  it('avisa que la licencia va antes de conectar Gmail', () => {
    // La extensión no abre el consentimiento de Google sin licencia: si la
    // página dijera lo contrario, el cliente se trabaría en el primer paso.
    const joined = mailerProPage.access.steps.join(' ');
    expect(joined).toMatch(/antes de conectar/i);
  });

  it('explica la pantalla de app no verificada de Google', () => {
    expect(allTexts()).toMatch(/no está verificada/);
  });

  it('declara los límites diarios reales de Gmail', () => {
    const joined = allTexts();
    expect(joined).toContain('500');
    expect(joined).toContain('2.000');
  });

  it('no menciona el backend de Apps Script que ya no existe', () => {
    expect(allTexts()).not.toMatch(/apps script/i);
  });

  it('no menciona asistentes ni herramientas de autoría', () => {
    expect(allTexts()).not.toMatch(/claude|opencode|\bIA\b/i);
  });
});
