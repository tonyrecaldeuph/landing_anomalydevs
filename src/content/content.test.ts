import { describe, it, expect } from 'vitest';
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
