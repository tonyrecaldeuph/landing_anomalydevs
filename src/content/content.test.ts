import { describe, it, expect } from 'vitest';
// @ts-expect-error: tipos de Node no incluidos en la landing; import solo para Vitest
import { readFileSync, existsSync } from 'node:fs';
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

  it('projects includes the portfolio from DESARROLLOS_UPHONE, 8 cases with unique ids', () => {
    const ids = projects.map((p) => p.id);
    expect(ids).toHaveLength(8);
    expect(new Set(ids).size).toBe(8);
    expect(ids).toEqual(expect.arrayContaining(['terminal-marketing', 'venecia-sartoria', 'data-automatizacion', 'telegram-pro-send']));
  });

  it('telegram-pro-send exposes its public download and no other project does', () => {
    const telegram = projects.find((p) => p.id === 'telegram-pro-send');
    expect(telegram).toBeDefined();
    expect(telegram?.download?.href).toBe('/files/TelegramProSend.zip');
    // @ts-expect-error: process solo existe en el runtime de Vitest/Node
    const zipPath = join(process.cwd(), 'public', 'files', 'TelegramProSend.zip');
    expect(existsSync(zipPath)).toBe(true);
    const signature = readFileSync(zipPath).subarray(0, 2).toString('utf8');
    expect(signature).toBe('PK');
    projects
      .filter((p) => p.id !== 'telegram-pro-send')
      .forEach((p) => {
        expect(p.download).toBeUndefined();
      });
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
