import { describe, it, expect } from 'vitest';
// @ts-expect-error: tipos de Node no incluidos en la landing; import solo para Vitest
import { readFileSync, existsSync, statSync } from 'node:fs';
// @ts-expect-error: tipos de Node no incluidos en la landing; import solo para Vitest
import { join } from 'node:path';
import { heroContent } from './hero';
import { navSections } from './nav';
import { manifestoContent } from './manifesto';
import { services } from './services';
import { projects } from './projects';
import { testimonials } from './testimonials';
import { contactContent } from './contact';

describe('content modules', () => {
  it('hero content has headline, subheadline and two CTAs', () => {
    expect(heroContent.headline.length).toBeGreaterThan(0);
    expect(heroContent.subheadline.length).toBeGreaterThan(0);
    expect(heroContent.primaryCta.href).toMatch(/^#/);
    expect(heroContent.secondaryCta.href).toMatch(/^#/);
  });

  it('nav has one entry per content section', () => {
    const ids = navSections.map((s) => s.id);
    expect(ids).toEqual(['servicios', 'proyectos', 'testimonios', 'contacto']);
  });

  it('manifesto has exactly 3 stats', () => {
    expect(manifestoContent.stats).toHaveLength(3);
  });

  it('services has at least 4 entries, each with a unique id', () => {
    expect(services.length).toBeGreaterThanOrEqual(4);
    const ids = new Set(services.map((s) => s.id));
    expect(ids.size).toBe(services.length);
  });

  it('projects includes the portfolio from DESARROLLOS_UPHONE, 9 cases with unique ids', () => {
    const ids = projects.map((p) => p.id);
    expect(ids).toHaveLength(9);
    expect(new Set(ids).size).toBe(9);
    expect(ids).toEqual(expect.arrayContaining(['terminal-marketing', 'venecia-sartoria', 'data-automatizacion', 'telegram-pro-send', 'whatsapp-pro-send']));
  });

  it('telegram-pro-send, sms-pro, whatsapp-pro-send y mailer-pro exponen sus descargas públicas y ningún otro proyecto lo hace', () => {
    const telegram = projects.find((p) => p.id === 'telegram-pro-send');
    expect(telegram).toBeDefined();
    expect(telegram?.download?.href).toBe('/files/TelegramProSend-1.2.0.zip');
    // @ts-expect-error: process solo existe en el runtime de Vitest/Node
    const zipPath = join(process.cwd(), 'public', 'files', 'TelegramProSend-1.2.0.zip');
    expect(existsSync(zipPath)).toBe(true);
    const signature = readFileSync(zipPath).subarray(0, 2).toString('utf8');
    expect(signature).toBe('PK');
    // La 1.1.4 se conserva: quienes vienen de 1.1.3 o anterior la necesitan
    // para exportar su respaldo antes de migrar.
    // @ts-expect-error: process solo existe en el runtime de Vitest/Node
    const legacyPath = join(process.cwd(), 'public', 'files', 'TelegramProSend-1.1.4.zip');
    expect(existsSync(legacyPath)).toBe(true);
    expect(readFileSync(legacyPath).subarray(0, 2).toString('utf8')).toBe('PK');
    // Alias para enlaces viejos ya compartidos.
    // @ts-expect-error: process solo existe en el runtime de Vitest/Node
    const aliasPath = join(process.cwd(), 'public', 'files', 'TelegramProSend.zip');
    expect(existsSync(aliasPath)).toBe(true);
    expect(readFileSync(aliasPath).subarray(0, 2).toString('utf8')).toBe('PK');
    const sms = projects.find((p) => p.id === 'sms-pro');
    expect(sms).toBeDefined();
    expect(sms?.download?.href).toBe('/files/SmsProSend-3.0.4.zip');
    // @ts-expect-error: process solo existe en el runtime de Vitest/Node
    const smsZipPath = join(process.cwd(), 'public', 'files', 'SmsProSend-3.0.4.zip');
    expect(existsSync(smsZipPath)).toBe(true);
    const smsSignature = readFileSync(smsZipPath).subarray(0, 2).toString('utf8');
    expect(smsSignature).toBe('PK');
    // Espejo total de SMS PRO V3.0 (puente ADB, native-launcher, fixtures, docs):
    // el recorte mínimo pesaba ~445 KB; el espejo supera los 500 KB.
    expect(statSync(smsZipPath).size).toBeGreaterThan(500_000);
    const whatsapp = projects.find((p) => p.id === 'whatsapp-pro-send');
    expect(whatsapp?.download?.href).toBe('/files/WhatsAppProSend-1.1.4.zip');
    expect(whatsapp?.caseHref).toBe('/productos/whatsappprosend/');
    // @ts-expect-error: process solo existe en el runtime de Vitest/Node
    const whatsappZipPath = join(process.cwd(), 'public', 'files', 'WhatsAppProSend-1.1.4.zip');
    expect(existsSync(whatsappZipPath)).toBe(true);
    expect(readFileSync(whatsappZipPath).subarray(0, 2).toString('utf8')).toBe('PK');
    // Este zip incluye el puente y el launcher nativo: el recorte solo-extensión
    // pesaba ~415 KB y no servía para instalar desde cero.
    expect(statSync(whatsappZipPath).size).toBeGreaterThan(450_000);
    const mailer = projects.find((p) => p.id === 'mailer-pro');
    expect(mailer?.download?.href).toBe('/files/MailerPro-3.3.1.zip');
    expect(mailer?.caseHref).toBe('/productos/mailerpro/');
    // @ts-expect-error: process solo existe en el runtime de Vitest/Node
    const mailerZipPath = join(process.cwd(), 'public', 'files', 'MailerPro-3.3.1.zip');
    expect(readFileSync(mailerZipPath).subarray(0, 2).toString('utf8')).toBe('PK');
    projects
      .filter((p) => !['telegram-pro-send', 'sms-pro', 'whatsapp-pro-send', 'terminal-marketing', 'mailer-pro'].includes(p.id))
      .forEach((p) => {
        expect(p.download).toBeUndefined();
      });
  });

  it('terminal-marketing descarga el instalador desde el servidor de actualizaciones, sin licencia', () => {
    const terminal = projects.find((p) => p.id === 'terminal-marketing');
    // El .exe pesa ~196 MB: no cabe en git, se sirve desde el mismo origen del auto-update.
    expect(terminal?.download?.href).toBe(
      'https://crm.anomalydevs.qzz.io/updates/CRM%20Marketing%20Uphone%20Setup%203.0.9.exe',
    );
    expect(terminal?.download?.note).toMatch(/Sin licencia/);
    expect(terminal?.download?.note).toMatch(/administrador/);
    expect(terminal?.caseHref).toBe('/productos/terminal-marketing/');
  });

  it('never presents SQLite as a project stack — production runs on PostgreSQL', () => {
    projects.forEach((p) => {
      expect(`${p.description} ${p.tags.join(' ')}`).not.toMatch(/sqlite/i);
    });
  });

  it('projects has at least 4 entries, each with tags', () => {
    expect(projects.length).toBeGreaterThanOrEqual(4);
    projects.forEach((p) => expect(p.tags.length).toBeGreaterThan(0));
  });

  it('testimonials has at least 3 entries, each with initials', () => {
    expect(testimonials.length).toBeGreaterThanOrEqual(3);
    testimonials.forEach((t) => expect(t.initials).toMatch(/^[A-Z]{1,3}$/));
  });

  it('contact has a valid-looking email', () => {
    expect(contactContent.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });
});
