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

  it('describe 7 funcionalidades del producto', () => {
    expect(telegramProSendPage.features).toHaveLength(7);
    telegramProSendPage.features.forEach((feature) => {
      expect(feature.title.length).toBeGreaterThan(0);
      expect(feature.text.length).toBeGreaterThan(0);
    });
  });

  it('anuncia el envío por celular (ADB) y aclara que la imagen es en Telegram Web', () => {
    const joined = telegramProSendPage.features.map((f) => `${f.title} ${f.text}`).join(' ');
    expect(joined).toMatch(/celular/i);
    expect(joined).toMatch(/ADB/);
    const imageFeature = telegramProSendPage.features.find((f) => f.title.toLowerCase().includes('imagen'));
    expect(imageFeature?.text).toMatch(/Telegram Web/);
  });

  it('menciona ambos canales en tagline y resumen', () => {
    expect(telegramProSendPage.tagline).toMatch(/celulares Android/);
    expect(telegramProSendPage.tagline).toMatch(/Telegram Web/);
    expect(telegramProSendPage.summary).toMatch(/celular/i);
  });

  it('pide el requisito opcional del canal celular e instala el puente', () => {
    const requirements = telegramProSendPage.requirements.join(' ');
    expect(requirements).toMatch(/celular/i);
    expect(requirements).toMatch(/depuraci.n USB/i);
    expect(requirements).toMatch(/install\.exe/);
    const installSteps = telegramProSendPage.installSteps.join(' ');
    expect(installSteps).toMatch(/native-launcher\\install\.exe/);
  });

  it('detalla la instalación con al menos 5 pasos y la URL de extensiones', () => {
    expect(telegramProSendPage.installSteps.length).toBeGreaterThanOrEqual(5);
    const joined = telegramProSendPage.installSteps.join(' ');
    expect(joined).toContain('chrome://extensions');
  });

  it('guía el uso en 7 pasos con capturas accesibles', () => {
    expect(telegramProSendPage.usageSteps).toHaveLength(7);
    telegramProSendPage.usageSteps.forEach((step) => {
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.text.length).toBeGreaterThan(0);
      if (step.image !== undefined) {
        expect(step.imageAlt?.trim().length).toBeGreaterThan(0);
      }
    });
  });

  it('incluye el paso opcional de envío desde celulares con su captura', () => {
    const step = telegramProSendPage.usageSteps.find((s) => s.title.toLowerCase().includes('celulares'));
    expect(step).toBeDefined();
    expect(step?.text).toMatch(/Celular \(ADB\)/);
    expect(step?.text).toMatch(/Iniciar puente/);
    expect(step?.image).toMatch(/08-celulares/);
    expect(step?.imageAlt?.trim().length).toBeGreaterThan(0);
  });

  it('aconseja no usar el celular durante la campaña', () => {
    expect(telegramProSendPage.tips.join(' ').toLowerCase()).toMatch(/celular/);
  });

  it('explica la migración desde la 1.1.x y el puente faltante', () => {
    const faq = telegramProSendPage.faq;
    const migration = faq.find((f) => f.question.toLowerCase().includes('1.1'));
    expect(migration).toBeDefined();
    expect(migration?.answer).toMatch(/Exportar/);
    expect(migration?.answer).toMatch(/Importar/);
    expect(migration?.answer).toMatch(/\/files\/TelegramProSend-1\.1\.4\.zip/);
    const bridge = faq.find((f) => f.question.toLowerCase().includes('puente'));
    expect(bridge).toBeDefined();
    expect(bridge?.answer).toMatch(/native-launcher\\install\.exe/);
  });

  it('explica los límites del canal celular', () => {
    const limites = telegramProSendPage.faq.find((f) => f.question.includes('límites') && f.question.toLowerCase().includes('celular'));
    expect(limites).toBeDefined();
    expect(limites?.answer).toMatch(/tildes/);
    expect(limites?.answer).toMatch(/imagen/);
    expect(limites?.answer).toMatch(/pausa/);
  });

  it('reutiliza la descarga pública de TelegramProSend', () => {
    expect(telegramProSendPage.download.href).toBe('/files/TelegramProSend-1.2.0.zip');
    expect(telegramProSendPage.download.note).toBe('v1.2.0 · Requiere licencia');
    expect(telegramProSendPage.installSteps.some((step) => step.includes('TelegramProSend-1.2.0.zip'))).toBe(true);
    expect(telegramProSendPage.access.ctaHref).toBe('/#contacto');
  });

  it('no menciona asistentes ni herramientas de autoría', () => {
    const texts: string[] = [];
    collectTexts(telegramProSendPage, texts);
    const joined = texts.join(' ');
    expect(joined).not.toMatch(/claude|opencode|\bIA\b/i);
  });
});
