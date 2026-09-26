import { describe, it, expect } from 'vitest';
import { telegramProSendPage } from './telegramProSend';

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

describe('telegramProSendPage', () => {
  it('expone slug, nombre y resumen del producto', () => {
    expect(telegramProSendPage.slug).toBe('telegramprosend');
    expect(telegramProSendPage.name).toBe('TelegramProSend');
    expect(telegramProSendPage.tagline.length).toBeGreaterThan(0);
    expect(telegramProSendPage.summary.length).toBeGreaterThan(0);
  });

  it('describe 6 funcionalidades del producto', () => {
    expect(telegramProSendPage.features).toHaveLength(6);
    telegramProSendPage.features.forEach((feature) => {
      expect(feature.title.length).toBeGreaterThan(0);
      expect(feature.text.length).toBeGreaterThan(0);
    });
  });

  it('detalla la instalación con al menos 5 pasos y la URL de extensiones', () => {
    expect(telegramProSendPage.installSteps.length).toBeGreaterThanOrEqual(5);
    const joined = telegramProSendPage.installSteps.join(' ');
    expect(joined).toContain('chrome://extensions');
  });

  it('guía el uso en 6 pasos con capturas accesibles', () => {
    expect(telegramProSendPage.usageSteps).toHaveLength(6);
    telegramProSendPage.usageSteps.forEach((step) => {
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.text.length).toBeGreaterThan(0);
      if (step.image !== undefined) {
        expect(step.imageAlt?.trim().length).toBeGreaterThan(0);
      }
    });
  });

  it('reutiliza la descarga pública de TelegramProSend', () => {
    expect(telegramProSendPage.download.href).toBe('/files/TelegramProSend.zip');
    expect(telegramProSendPage.licenseCtaHref).toBe('/#contacto');
  });

  it('no menciona asistentes ni herramientas de autoría', () => {
    const texts: string[] = [];
    collectTexts(telegramProSendPage, texts);
    const joined = texts.join(' ');
    expect(joined).not.toMatch(/claude|opencode|\bIA\b/i);
  });
});
