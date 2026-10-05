import { describe, it, expect } from 'vitest';
import { smsProSendPage } from './smsProSend';

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

describe('smsProSendPage', () => {
  it('nombra el producto sin versión en todos sus textos', () => {
    const texts: string[] = [];
    collectTexts(smsProSendPage, texts);
    texts.forEach((text) => expect(text).not.toMatch(/V3\.0/));
  });

  it('expone slug, nombre y resumen del producto', () => {
    expect(smsProSendPage.slug).toBe('smsprosend');
    expect(smsProSendPage.name).toBe('SMS_RCS_PRO');
    expect(smsProSendPage.tagline.length).toBeGreaterThan(0);
    expect(smsProSendPage.summary.length).toBeGreaterThan(0);
  });

  it('describe 6 funcionalidades del producto', () => {
    expect(smsProSendPage.features).toHaveLength(6);
    smsProSendPage.features.forEach((feature) => {
      expect(feature.title.length).toBeGreaterThan(0);
      expect(feature.text.length).toBeGreaterThan(0);
    });
  });

  it('detalla la instalación con al menos 5 pasos y la URL de extensiones', () => {
    expect(smsProSendPage.installSteps.length).toBeGreaterThanOrEqual(5);
    const joined = smsProSendPage.installSteps.join(' ');
    expect(joined).toContain('chrome://extensions');
  });

  it('guía el uso en 6 pasos con capturas accesibles', () => {
    expect(smsProSendPage.usageSteps).toHaveLength(6);
    smsProSendPage.usageSteps.forEach((step) => {
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.text.length).toBeGreaterThan(0);
      if (step.image !== undefined) {
        expect(step.imageAlt?.trim().length).toBeGreaterThan(0);
      }
    });
  });

  it('reutiliza la descarga pública versionada de SmsProSend', () => {
    // Nombre versionado: Cloudflare cachea /files/* 4 h, un nombre fijo
    // seguía entregando la versión anterior tras publicar una nueva.
    expect(smsProSendPage.download.href).toBe('/files/SmsProSend-3.0.1.zip');
    expect(smsProSendPage.download.note).toContain('v3.0.1');
    expect(smsProSendPage.licenseCtaHref).toBe('/#contacto');
  });

  it('nombra el zip versionado en el primer paso de instalación', () => {
    expect(smsProSendPage.installSteps[0]).toContain('SmsProSend-3.0.1.zip');
  });

  it('menciona Google Messages como canal de envío', () => {
    const texts: string[] = [];
    collectTexts(smsProSendPage, texts);
    const joined = texts.join(' ');
    expect(joined).toContain('messages.google.com');
  });

  it('no menciona asistentes ni herramientas de autoría', () => {
    const texts: string[] = [];
    collectTexts(smsProSendPage, texts);
    const joined = texts.join(' ');
    expect(joined).not.toMatch(/claude|opencode|\bIA\b/i);
  });
});
