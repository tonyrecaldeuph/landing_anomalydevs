import { describe, it, expect } from 'vitest';
import { whatsappProSendPage } from './whatsappProSend';

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

describe('whatsappProSendPage', () => {
  it('expone slug, nombre y resumen del producto', () => {
    expect(whatsappProSendPage.slug).toBe('whatsappprosend');
    expect(whatsappProSendPage.name).toBe('WhatsAppProSend');
    expect(whatsappProSendPage.tagline.length).toBeGreaterThan(0);
    expect(whatsappProSendPage.summary).toContain('No usa WhatsApp Web');
  });

  it('describe 7 funcionalidades del producto', () => {
    expect(whatsappProSendPage.features).toHaveLength(7);
    whatsappProSendPage.features.forEach((feature) => {
      expect(feature.title.length).toBeGreaterThan(0);
      expect(feature.text.length).toBeGreaterThan(0);
    });
  });

  it('detalla la instalación con chrome://extensions y el instalador nativo', () => {
    expect(whatsappProSendPage.installSteps.length).toBeGreaterThanOrEqual(7);
    const joined = whatsappProSendPage.installSteps.join(' ');
    expect(joined).toContain('chrome://extensions');
    expect(joined).toContain('native-launcher\\install.exe');
  });

  it('guía el uso en 6 pasos con capturas accesibles', () => {
    expect(whatsappProSendPage.usageSteps).toHaveLength(6);
    whatsappProSendPage.usageSteps.forEach((step) => {
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.text.length).toBeGreaterThan(0);
      if (step.image !== undefined) {
        expect(step.imageAlt?.trim().length).toBeGreaterThan(0);
      }
    });
    expect(whatsappProSendPage.usageSteps.filter((step) => step.image)).toHaveLength(5);
  });

  it('reutiliza la descarga pública versionada de WhatsAppProSend', () => {
    expect(whatsappProSendPage.download.href).toBe('/files/WhatsAppProSend-1.1.7.zip');
    expect(whatsappProSendPage.download.note).toContain('v1.1.7');
    expect(whatsappProSendPage.access.ctaHref).toBe('/#contacto');
  });

  it('nombra el zip versionado en el primer paso de instalación', () => {
    expect(whatsappProSendPage.installSteps[0]).toContain('WhatsAppProSend-1.1.7.zip');
  });

  it('explica los resultados propios del canal WhatsApp', () => {
    const estados = whatsappProSendPage.results.map((result) => result.status);
    expect(estados).toEqual(['Enviado', 'Sin WhatsApp', 'Pendiente', 'Error']);
  });

  it('menciona la app nativa, la cuota diaria y el límite de solo texto', () => {
    const texts: string[] = [];
    collectTexts(whatsappProSendPage, texts);
    const joined = texts.join(' ');
    expect(joined).toContain('app nativa');
    expect(joined).toContain('150');
    expect(joined).toContain('solo texto');
    expect(joined).not.toMatch(/WhatsApp Web para enviar/i);
  });

  it('advierte el riesgo de bloqueo y pide consentimiento', () => {
    const texts: string[] = [];
    collectTexts(whatsappProSendPage, texts);
    const joined = texts.join(' ');
    expect(joined).toMatch(/bloqueado/);
    expect(joined).toMatch(/consentimiento/);
    expect(joined).toMatch(/condiciones de uso/);
  });

  it('no menciona asistentes ni herramientas de autoría', () => {
    const texts: string[] = [];
    collectTexts(whatsappProSendPage, texts);
    const joined = texts.join(' ');
    expect(joined).not.toMatch(/claude|opencode|\bIA\b/i);
  });
});
