# AnomalyDevs Landing — Fase 1: Scaffold y contenido estático — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el scaffold del proyecto (Vite + React + TypeScript) y todas las secciones de contenido de la landing de AnomalyDevs en su forma estática (sin la red de nodos 3D ni animaciones de scroll, que son la Fase 2), con datos de contenido placeholder editables y tests para la lógica no-visual.

**Architecture:** SPA de una sola página armada por componentes (uno por sección) que leen de módulos de contenido en `src/content/`. Estilos con CSS Modules sobre variables CSS de marca (`src/styles/tokens.css`). Sin backend ni router — todo ancla dentro de la misma página.

**Tech Stack:** React 18, TypeScript, Vite, Vitest + React Testing Library, CSS Modules, `@fontsource/jetbrains-mono`, `@fontsource/inter`.

**Repo:** Este proyecto vive en la raíz de `Anomalydevs/` (ya es un repositorio git con `docs/superpowers/specs/2026-07-07-landing-anomalydevs-design.md` committeado). Todos los comandos de esta plan asumen que el directorio de trabajo es `Anomalydevs/`.

---

### Task 1: Scaffold del proyecto Vite + React + TypeScript

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/vite-env.d.ts`

- [ ] **Step 1: Crear `package.json`**

```json
{
  "name": "anomalydevs-landing",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@fontsource/jetbrains-mono": "^5.1.0",
    "@fontsource/inter": "^5.1.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.1",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.2",
    "jsdom": "^25.0.1",
    "typescript": "^5.6.3",
    "vite": "^5.4.9",
    "vitest": "^2.1.3"
  }
}
```

- [ ] **Step 2: Instalar dependencias**

Run: `npm install`
Expected: termina sin errores (exit code 0), se crea `node_modules/` y `package-lock.json`.

- [ ] **Step 3: Crear `vite.config.ts`**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    globals: true,
  },
});
```

- [ ] **Step 4: Crear `src/test-setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 5: Crear `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 6: Crear `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 7: Crear `index.html`**

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AnomalyDevs — Software que no sigue el molde</title>
    <meta name="description" content="AnomalyDevs es un estudio de desarrollo de software. Detectamos la anomalía y la convertimos en software que funciona." />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Crear `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 9: Crear `src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import './styles/tokens.css';
import './styles/global.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 10: Crear `src/App.tsx` (placeholder temporal, se reemplaza en Task 13)**

```tsx
export default function App() {
  return <div>AnomalyDevs</div>;
}
```

- [ ] **Step 11: Verificar que el scaffold levanta**

Run: `npm run dev -- --port 5173 &` luego revisar en el navegador `http://localhost:5173` que se vea el texto "AnomalyDevs". Detener el proceso después (Ctrl+C, o `kill %1` en bash).
Expected: la página carga sin errores en consola.

- [ ] **Step 12: Commit**

```bash
git add package.json package-lock.json vite.config.ts tsconfig.json tsconfig.node.json index.html src/main.tsx src/App.tsx src/vite-env.d.ts src/test-setup.ts
git commit -m "chore: scaffold Vite + React + TypeScript project"
```

---

### Task 2: Tokens de marca y estilos globales

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`

- [ ] **Step 1: Crear `src/styles/tokens.css`**

```css
:root {
  --color-black: #060A07;
  --color-neon: #33FF77;
  --color-mint: #9DFFC0;
  --color-node-highlight: #CFFFE0;
  --color-neon-muted: #1C6B3A;

  --color-bg: var(--color-black);
  --color-text: var(--color-node-highlight);
  --color-text-muted: #8FA898;
  --color-accent: var(--color-neon);
  --color-border: var(--color-neon-muted);

  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --font-sans: 'Inter', system-ui, sans-serif;

  --space-1: 0.5rem;
  --space-2: 1rem;
  --space-3: 1.5rem;
  --space-4: 2.5rem;
  --space-5: 4rem;
  --space-6: 6rem;

  --max-width: 1200px;
}
```

- [ ] **Step 2: Crear `src/styles/global.css`**

```css
*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  scroll-behavior: smooth;
}

h1, h2, h3, h4 {
  font-family: var(--font-mono);
  margin: 0;
  color: var(--color-node-highlight);
}

a {
  color: var(--color-accent);
}

button {
  font-family: var(--font-mono);
}

section {
  padding: var(--space-6) var(--space-3);
}

.section-inner {
  max-width: var(--max-width);
  margin: 0 auto;
}

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/styles
git commit -m "feat: add brand design tokens and global styles"
```

---

### Task 3: Módulos de contenido placeholder (con tests)

**Files:**
- Create: `src/content/hero.ts`
- Create: `src/content/nav.ts`
- Create: `src/content/manifesto.ts`
- Create: `src/content/services.ts`
- Create: `src/content/projects.ts`
- Create: `src/content/testimonials.ts`
- Create: `src/content/contact.ts`
- Test: `src/content/content.test.ts`

- [ ] **Step 1: Escribir el test que falla primero**

```ts
// src/content/content.test.ts
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
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npm run test`
Expected: FAIL — los módulos `./hero`, `./nav`, etc. no existen todavía.

- [ ] **Step 3: Crear `src/content/hero.ts`**

```ts
export const heroContent = {
  eyebrow: 'AnomalyDevs',
  headline: 'DETECTAMOS LA ANOMALÍA.',
  subheadline: 'Software que no sigue el molde.',
  primaryCta: { label: 'Ver proyectos', href: '#proyectos' },
  secondaryCta: { label: 'Hablemos', href: '#contacto' },
  scrollHint: 'Desliza para explorar',
};
```

- [ ] **Step 4: Crear `src/content/nav.ts`**

```ts
export interface NavSection {
  id: string;
  label: string;
}

export const navSections: NavSection[] = [
  { id: 'servicios', label: 'Servicios' },
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'testimonios', label: 'Testimonios' },
  { id: 'contacto', label: 'Contacto' },
];
```

- [ ] **Step 5: Crear `src/content/manifesto.ts`**

```ts
export interface Stat {
  value: string;
  label: string;
}

export const manifestoContent = {
  heading: 'Sobre nosotros',
  body:
    'En AnomalyDevs no partimos de una plantilla. Partimos de lo que no encaja — el caso raro, el requisito imposible, el dato que se sale de la curva — y construimos el software que lo resuelve.',
  stats: [
    { value: '+30', label: 'proyectos entregados' },
    { value: '5', label: 'años de experiencia' },
    { value: '100%', label: 'remoto, foco en LATAM' },
  ] as Stat[],
};
```

- [ ] **Step 6: Crear `src/content/services.ts`**

```ts
export interface Service {
  id: string;
  title: string;
  description: string;
}

export const services: Service[] = [
  { id: 'web', title: 'Desarrollo web', description: 'Sitios y web apps a medida, rápidos y escalables.' },
  { id: 'mobile', title: 'Apps móviles', description: 'iOS y Android, nativo o híbrido.' },
  { id: 'ai', title: 'Automatización & IA', description: 'Integramos modelos e IA en flujos de negocio reales.' },
  { id: 'consulting', title: 'Consultoría técnica', description: 'Arquitectura, auditoría y code review con foco en escalabilidad.' },
  { id: 'product', title: 'Producto digital', description: 'De la idea al MVP, con foco en velocidad de lanzamiento.' },
  { id: 'support', title: 'Soporte & escalado', description: 'Mantenimiento y crecimiento post-lanzamiento.' },
];
```

- [ ] **Step 7: Crear `src/content/projects.ts`**

```ts
export interface Project {
  id: string;
  title: string;
  tags: string[];
  description: string;
}

export const projects: Project[] = [
  { id: 'proyecto-1', title: 'Proyecto Ficticio Uno', tags: ['React', 'Node.js'], description: 'Plataforma interna de gestión de inventario en tiempo real.' },
  { id: 'proyecto-2', title: 'Proyecto Ficticio Dos', tags: ['React Native', 'Firebase'], description: 'App móvil de fidelización para retail.' },
  { id: 'proyecto-3', title: 'Proyecto Ficticio Tres', tags: ['Python', 'IA'], description: 'Motor de recomendación basado en aprendizaje automático.' },
  { id: 'proyecto-4', title: 'Proyecto Ficticio Cuatro', tags: ['Next.js', 'Stripe'], description: 'E-commerce headless con checkout optimizado.' },
];
```

- [ ] **Step 8: Crear `src/content/testimonials.ts`**

```ts
export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  initials: string;
}

export const testimonials: Testimonial[] = [
  { id: 't1', quote: 'AnomalyDevs entendió un problema que ningún otro equipo había resuelto bien.', author: 'Cliente Ficticio', role: 'CTO, Empresa Placeholder', initials: 'CF' },
  { id: 't2', quote: 'Entregaron en tiempo récord sin sacrificar calidad.', author: 'Cliente Ficticio Dos', role: 'Founder, Startup Placeholder', initials: 'CD' },
  { id: 't3', quote: 'El equipo se sintió como una extensión interna, no como un proveedor externo.', author: 'Cliente Ficticio Tres', role: 'PM, Compañía Placeholder', initials: 'CT' },
];
```

- [ ] **Step 9: Crear `src/content/contact.ts`**

```ts
export const contactContent = {
  heading: '¿Tienes una anomalía que resolver?',
  email: 'hola@anomalydevs.com',
  socials: [
    { label: 'GitHub', href: 'https://github.com/anomalydevs' },
    { label: 'LinkedIn', href: 'https://linkedin.com/company/anomalydevs' },
  ],
};
```

- [ ] **Step 10: Correr el test y verificar que pasa**

Run: `npm run test`
Expected: PASS — 7 tests en `content.test.ts`.

- [ ] **Step 11: Commit**

```bash
git add src/content
git commit -m "feat: add placeholder content modules with validation tests"
```

---

### Task 4: Componente Nav

**Files:**
- Create: `src/components/Nav/Nav.tsx`
- Create: `src/components/Nav/Nav.module.css`
- Test: `src/components/Nav/Nav.test.tsx`

- [ ] **Step 1: Escribir el test que falla**

```tsx
// src/components/Nav/Nav.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Nav } from './Nav';

describe('Nav', () => {
  it('renders a link for each nav section plus the logo wordmark', () => {
    render(<Nav />);
    expect(screen.getByText('anomalydevs')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Servicios' })).toHaveAttribute('href', '#servicios');
    expect(screen.getByRole('link', { name: 'Proyectos' })).toHaveAttribute('href', '#proyectos');
    expect(screen.getByRole('link', { name: 'Testimonios' })).toHaveAttribute('href', '#testimonios');
    expect(screen.getByRole('link', { name: 'Contacto' })).toHaveAttribute('href', '#contacto');
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test`
Expected: FAIL — `./Nav` no existe.

- [ ] **Step 3: Crear `src/components/Nav/Nav.module.css`**

```css
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  background: rgba(6, 10, 7, 0.8);
  backdrop-filter: blur(6px);
  border-bottom: 1px solid var(--color-border);
}

.logo {
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--color-accent);
  text-decoration: none;
  font-size: 1rem;
}

.links {
  display: flex;
  gap: var(--space-3);
  list-style: none;
  margin: 0;
  padding: 0;
}

.links a {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  text-decoration: none;
  color: var(--color-text);
}

.links a:hover {
  color: var(--color-accent);
}
```

- [ ] **Step 4: Crear `src/components/Nav/Nav.tsx`**

```tsx
import { navSections } from '../../content/nav';
import styles from './Nav.module.css';

export function Nav() {
  return (
    <nav className={styles.nav}>
      <a className={styles.logo} href="#top">anomalydevs</a>
      <ul className={styles.links}>
        {navSections.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`}>{section.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 5: Correr y verificar que pasa**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/Nav
git commit -m "feat: add Nav component"
```

---

### Task 5: Componente Hero (estático)

**Files:**
- Create: `src/components/Hero/Hero.tsx`
- Create: `src/components/Hero/Hero.module.css`
- Test: `src/components/Hero/Hero.test.tsx`

- [ ] **Step 1: Escribir el test que falla**

```tsx
// src/components/Hero/Hero.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Hero } from './Hero';

describe('Hero', () => {
  it('renders headline, subheadline and both CTAs from content', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { name: 'DETECTAMOS LA ANOMALÍA.' })).toBeInTheDocument();
    expect(screen.getByText('Software que no sigue el molde.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver proyectos' })).toHaveAttribute('href', '#proyectos');
    expect(screen.getByRole('link', { name: 'Hablemos' })).toHaveAttribute('href', '#contacto');
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test`
Expected: FAIL — `./Hero` no existe.

- [ ] **Step 3: Crear `src/components/Hero/Hero.module.css`**

```css
.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: radial-gradient(circle at 60% 35%, #0d1f13 0%, var(--color-black) 65%);
}

.eyebrow {
  font-family: var(--font-mono);
  color: var(--color-mint);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-size: 0.8rem;
}

.headline {
  font-size: clamp(2rem, 6vw, 4.5rem);
  color: var(--color-accent);
  text-shadow: 0 0 24px rgba(51, 255, 119, 0.35);
  max-width: 900px;
}

.subheadline {
  font-family: var(--font-sans);
  font-size: clamp(1rem, 2vw, 1.4rem);
  color: var(--color-text);
  max-width: 600px;
}

.ctas {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.ctaPrimary, .ctaSecondary {
  font-family: var(--font-mono);
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.9rem;
}

.ctaPrimary {
  background: var(--color-accent);
  color: var(--color-black);
}

.ctaSecondary {
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.scrollHint {
  position: absolute;
  bottom: var(--space-3);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
```

- [ ] **Step 4: Crear `src/components/Hero/Hero.tsx`**

```tsx
import { heroContent } from '../../content/hero';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section id="top" className={styles.hero}>
      <span className={styles.eyebrow}>{heroContent.eyebrow}</span>
      <h1 className={styles.headline}>{heroContent.headline}</h1>
      <p className={styles.subheadline}>{heroContent.subheadline}</p>
      <div className={styles.ctas}>
        <a className={styles.ctaPrimary} href={heroContent.primaryCta.href}>
          {heroContent.primaryCta.label}
        </a>
        <a className={styles.ctaSecondary} href={heroContent.secondaryCta.href}>
          {heroContent.secondaryCta.label}
        </a>
      </div>
      <span className={styles.scrollHint}>{heroContent.scrollHint}</span>
    </section>
  );
}
```

- [ ] **Step 5: Correr y verificar que pasa**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/Hero
git commit -m "feat: add static Hero section"
```

---

### Task 6: Componente Manifesto

**Files:**
- Create: `src/components/Manifesto/Manifesto.tsx`
- Create: `src/components/Manifesto/Manifesto.module.css`
- Test: `src/components/Manifesto/Manifesto.test.tsx`

- [ ] **Step 1: Escribir el test que falla**

```tsx
// src/components/Manifesto/Manifesto.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Manifesto } from './Manifesto';

describe('Manifesto', () => {
  it('renders heading, body and 3 stats', () => {
    render(<Manifesto />);
    expect(screen.getByRole('heading', { name: 'Sobre nosotros' })).toBeInTheDocument();
    expect(screen.getByText(/no partimos de una plantilla/)).toBeInTheDocument();
    expect(screen.getByText('+30')).toBeInTheDocument();
    expect(screen.getByText('proyectos entregados')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test`
Expected: FAIL — `./Manifesto` no existe.

- [ ] **Step 3: Crear `src/components/Manifesto/Manifesto.module.css`**

```css
.manifesto {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-4);
}

.body {
  font-size: clamp(1.1rem, 2.5vw, 1.6rem);
  max-width: 760px;
  line-height: 1.5;
}

.stats {
  display: flex;
  gap: var(--space-5);
  flex-wrap: wrap;
  justify-content: center;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.statValue {
  font-family: var(--font-mono);
  font-size: 2rem;
  color: var(--color-accent);
}

.statLabel {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-text-muted);
}
```

- [ ] **Step 4: Crear `src/components/Manifesto/Manifesto.tsx`**

```tsx
import { manifestoContent } from '../../content/manifesto';
import styles from './Manifesto.module.css';

export function Manifesto() {
  return (
    <section id="manifiesto" className={`section-inner ${styles.manifesto}`}>
      <h2>{manifestoContent.heading}</h2>
      <p className={styles.body}>{manifestoContent.body}</p>
      <div className={styles.stats}>
        {manifestoContent.stats.map((stat) => (
          <div className={styles.stat} key={stat.label}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Correr y verificar que pasa**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/Manifesto
git commit -m "feat: add Manifesto section"
```

---

### Task 7: Componente Services

**Files:**
- Create: `src/components/Services/Services.tsx`
- Create: `src/components/Services/Services.module.css`
- Test: `src/components/Services/Services.test.tsx`

- [ ] **Step 1: Escribir el test que falla**

```tsx
// src/components/Services/Services.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Services } from './Services';
import { services } from '../../content/services';

describe('Services', () => {
  it('renders one card per service with title and description', () => {
    render(<Services />);
    services.forEach((service) => {
      expect(screen.getByRole('heading', { name: service.title })).toBeInTheDocument();
      expect(screen.getByText(service.description)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test`
Expected: FAIL — `./Services` no existe.

- [ ] **Step 3: Crear `src/components/Services/Services.module.css`**

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--space-3);
}

.card {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.card:hover {
  border-color: var(--color-accent);
  transform: translateY(-4px);
}

.card h3 {
  font-size: 1.1rem;
  color: var(--color-accent);
}

.card p {
  color: var(--color-text);
  font-size: 0.95rem;
  margin: 0;
}
```

- [ ] **Step 4: Crear `src/components/Services/Services.tsx`**

```tsx
import { services } from '../../content/services';
import styles from './Services.module.css';

export function Services() {
  return (
    <section id="servicios" className="section-inner">
      <h2>Servicios</h2>
      <div className={styles.grid}>
        {services.map((service) => (
          <article className={styles.card} key={service.id}>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Correr y verificar que pasa**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/Services
git commit -m "feat: add Services grid section"
```

---

### Task 8: Componente Projects

**Files:**
- Create: `src/components/Projects/Projects.tsx`
- Create: `src/components/Projects/Projects.module.css`
- Test: `src/components/Projects/Projects.test.tsx`

- [ ] **Step 1: Escribir el test que falla**

```tsx
// src/components/Projects/Projects.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Projects } from './Projects';
import { projects } from '../../content/projects';

describe('Projects', () => {
  it('renders one card per project with title and all its tags', () => {
    render(<Projects />);
    projects.forEach((project) => {
      expect(screen.getByRole('heading', { name: project.title })).toBeInTheDocument();
      project.tags.forEach((tag) => {
        expect(screen.getAllByText(tag).length).toBeGreaterThan(0);
      });
    });
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test`
Expected: FAIL — `./Projects` no existe.

- [ ] **Step 3: Crear `src/components/Projects/Projects.module.css`**

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-3);
}

.card {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.thumb {
  height: 160px;
  background: linear-gradient(135deg, #0d1f13, var(--color-black));
}

.body {
  padding: var(--space-2);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.tags {
  display: flex;
  gap: var(--space-1);
  flex-wrap: wrap;
}

.tag {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--color-mint);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.15rem 0.6rem;
}

.description {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin: 0;
}
```

- [ ] **Step 4: Crear `src/components/Projects/Projects.tsx`**

```tsx
import { projects } from '../../content/projects';
import styles from './Projects.module.css';

export function Projects() {
  return (
    <section id="proyectos" className="section-inner">
      <h2>Proyectos</h2>
      <div className={styles.grid}>
        {projects.map((project) => (
          <article className={styles.card} key={project.id}>
            <div className={styles.thumb} aria-hidden="true" />
            <div className={styles.body}>
              <h3>{project.title}</h3>
              <p className={styles.description}>{project.description}</p>
              <div className={styles.tags}>
                {project.tags.map((tag) => (
                  <span className={styles.tag} key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Correr y verificar que pasa**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/Projects
git commit -m "feat: add Projects grid section"
```

---

### Task 9: Componente Testimonials

**Files:**
- Create: `src/components/Testimonials/Testimonials.tsx`
- Create: `src/components/Testimonials/Testimonials.module.css`
- Test: `src/components/Testimonials/Testimonials.test.tsx`

- [ ] **Step 1: Escribir el test que falla**

```tsx
// src/components/Testimonials/Testimonials.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Testimonials } from './Testimonials';
import { testimonials } from '../../content/testimonials';

describe('Testimonials', () => {
  it('renders each quote, author and initials badge', () => {
    render(<Testimonials />);
    testimonials.forEach((t) => {
      expect(screen.getByText(`"${t.quote}"`)).toBeInTheDocument();
      expect(screen.getByText(t.author)).toBeInTheDocument();
      expect(screen.getByText(t.initials)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test`
Expected: FAIL — `./Testimonials` no existe.

- [ ] **Step 3: Crear `src/components/Testimonials/Testimonials.module.css`**

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-3);
}

.card {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.quote {
  font-style: italic;
  color: var(--color-text);
  margin: 0;
}

.person {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.badge {
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-accent);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  color: var(--color-accent);
  font-size: 0.85rem;
  flex-shrink: 0;
}

.name {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--color-node-highlight);
}

.role {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}
```

- [ ] **Step 4: Crear `src/components/Testimonials/Testimonials.tsx`**

```tsx
import { testimonials } from '../../content/testimonials';
import styles from './Testimonials.module.css';

export function Testimonials() {
  return (
    <section id="testimonios" className="section-inner">
      <h2>Testimonios</h2>
      <div className={styles.grid}>
        {testimonials.map((t) => (
          <article className={styles.card} key={t.id}>
            <p className={styles.quote}>&quot;{t.quote}&quot;</p>
            <div className={styles.person}>
              <span className={styles.badge}>{t.initials}</span>
              <div>
                <div className={styles.name}>{t.author}</div>
                <div className={styles.role}>{t.role}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Correr y verificar que pasa**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/Testimonials
git commit -m "feat: add Testimonials section"
```

---

### Task 10: Componente Contact (con validación de formulario)

**Files:**
- Create: `src/components/Contact/Contact.tsx`
- Create: `src/components/Contact/Contact.module.css`
- Test: `src/components/Contact/Contact.test.tsx`

- [ ] **Step 1: Escribir el test que falla**

```tsx
// src/components/Contact/Contact.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Contact } from './Contact';

describe('Contact', () => {
  it('renders heading, email and social links from content', () => {
    render(<Contact />);
    expect(screen.getByRole('heading', { name: '¿Tienes una anomalía que resolver?' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'hola@anomalydevs.com' })).toHaveAttribute('href', 'mailto:hola@anomalydevs.com');
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/anomalydevs');
  });

  it('shows a validation error when submitting with empty fields', () => {
    render(<Contact />);
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(screen.getByText('Completa todos los campos antes de enviar.')).toBeInTheDocument();
  });

  it('calls onSubmit with form values when all fields are filled', () => {
    const onSubmit = vi.fn();
    render(<Contact onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@example.com' } });
    fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: 'Hola, quiero cotizar un proyecto.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Ana', email: 'ana@example.com', message: 'Hola, quiero cotizar un proyecto.' });
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test`
Expected: FAIL — `./Contact` no existe.

- [ ] **Step 3: Crear `src/components/Contact/Contact.module.css`**

```css
.contact {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  text-align: center;
}

.links {
  display: flex;
  gap: var(--space-3);
  font-family: var(--font-mono);
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
  max-width: 480px;
  text-align: left;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field label {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.field input,
.field textarea {
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.6rem;
  color: var(--color-text);
  font-family: var(--font-sans);
}

.field input:focus,
.field textarea:focus {
  border-color: var(--color-accent);
  outline: none;
}

.submit {
  align-self: flex-start;
  background: var(--color-accent);
  color: var(--color-black);
  border: none;
  border-radius: 4px;
  padding: 0.7rem 1.6rem;
  cursor: pointer;
}

.error {
  color: #ff6b6b;
  font-size: 0.85rem;
  margin: 0;
}
```

- [ ] **Step 4: Crear `src/components/Contact/Contact.tsx`**

```tsx
import { FormEvent, useState } from 'react';
import { contactContent } from '../../content/contact';
import styles from './Contact.module.css';

export interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

interface ContactProps {
  onSubmit?: (values: ContactFormValues) => void;
}

export function Contact({ onSubmit }: ContactProps) {
  const [values, setValues] = useState<ContactFormValues>({ name: '', email: '', message: '' });
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!values.name || !values.email || !values.message) {
      setError('Completa todos los campos antes de enviar.');
      return;
    }
    setError(null);
    // Sin backend todavía: el punto de integración es este callback.
    onSubmit?.(values);
  }

  return (
    <section id="contacto" className={`section-inner ${styles.contact}`}>
      <h2>{contactContent.heading}</h2>
      <div className={styles.links}>
        <a href={`mailto:${contactContent.email}`}>{contactContent.email}</a>
        {contactContent.socials.map((social) => (
          <a href={social.href} key={social.label} target="_blank" rel="noreferrer">
            {social.label}
          </a>
        ))}
      </div>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="contact-name">Nombre</label>
          <input
            id="contact-name"
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-email">Email</label>
          <input
            id="contact-email"
            type="email"
            value={values.email}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-message">Mensaje</label>
          <textarea
            id="contact-message"
            rows={4}
            value={values.message}
            onChange={(e) => setValues({ ...values, message: e.target.value })}
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button className={styles.submit} type="submit">Enviar</button>
      </form>
    </section>
  );
}
```

- [ ] **Step 5: Correr y verificar que pasa**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/Contact
git commit -m "feat: add Contact section with client-side form validation"
```

---

### Task 11: Componente Footer

**Files:**
- Create: `src/components/Footer/Footer.tsx`
- Create: `src/components/Footer/Footer.module.css`
- Test: `src/components/Footer/Footer.test.tsx`

- [ ] **Step 1: Escribir el test que falla**

```tsx
// src/components/Footer/Footer.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders the wordmark and the current year in the copyright line', () => {
    render(<Footer />);
    expect(screen.getByText('anomalydevs')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} AnomalyDevs`))).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test`
Expected: FAIL — `./Footer` no existe.

- [ ] **Step 3: Crear `src/components/Footer/Footer.module.css`**

```css
.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-3);
  border-top: 1px solid var(--color-border);
  text-align: center;
}

.wordmark {
  font-family: var(--font-mono);
  color: var(--color-accent);
  font-weight: 700;
}

.copyright {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
```

- [ ] **Step 4: Crear `src/components/Footer/Footer.tsx`**

```tsx
import styles from './Footer.module.css';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <span className={styles.wordmark}>anomalydevs</span>
      <span className={styles.copyright}>© {year} AnomalyDevs. Todos los derechos reservados.</span>
    </footer>
  );
}
```

- [ ] **Step 5: Correr y verificar que pasa**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/Footer
git commit -m "feat: add Footer component"
```

---

### Task 12: Ensamblar App.tsx

**Files:**
- Modify: `src/App.tsx`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Escribir el test que falla**

```tsx
// src/App.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders all sections in order: Hero, Manifesto, Services, Projects, Testimonials, Contact, Footer', () => {
    render(<App />);
    const headings = screen.getAllByRole('heading', { level: 1 }).concat(screen.getAllByRole('heading', { level: 2 }));
    const headingTexts = headings.map((h) => h.textContent);
    expect(headingTexts).toEqual([
      'DETECTAMOS LA ANOMALÍA.',
      'Sobre nosotros',
      'Servicios',
      'Proyectos',
      'Testimonios',
      '¿Tienes una anomalía que resolver?',
    ]);
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test`
Expected: FAIL — `App.tsx` todavía es el placeholder del Task 1.

- [ ] **Step 3: Reemplazar `src/App.tsx`**

```tsx
import { Nav } from './components/Nav/Nav';
import { Hero } from './components/Hero/Hero';
import { Manifesto } from './components/Manifesto/Manifesto';
import { Services } from './components/Services/Services';
import { Projects } from './components/Projects/Projects';
import { Testimonials } from './components/Testimonials/Testimonials';
import { Contact } from './components/Contact/Contact';
import { Footer } from './components/Footer/Footer';

export default function App() {
  return (
    <>
      <Nav />
      <Hero />
      <Manifesto />
      <Services />
      <Projects />
      <Testimonials />
      <Contact />
      <Footer />
    </>
  );
}
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `npm run test`
Expected: PASS — todos los tests (content, Nav, Hero, Manifesto, Services, Projects, Testimonials, Contact, Footer, App) en verde.

- [ ] **Step 5: Verificación manual en navegador**

Run: `npm run dev`
Abrir `http://localhost:5173` y confirmar visualmente: nav fija arriba, hero a pantalla completa con headline en verde neón, y el resto de secciones en orden con la paleta negro/verde/mint. Probar el formulario de contacto (dejar un campo vacío → ver mensaje de error; llenar todos → sin error).
Detener el server con Ctrl+C al terminar.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat: assemble full static landing page in App"
```

---

## Resumen de la Fase 1

Al terminar este plan, `npm run dev` sirve una landing de una sola página, completamente estática (sin 3D ni animaciones de scroll), con las 7 secciones definidas en el spec, contenido placeholder editable en `src/content/`, y cobertura de tests para todo lo no-visual (forma del contenido, renderizado de cada sección, validación del formulario de contacto).

**Siguiente paso:** Plan de Fase 2 — la red de nodos 3D interactiva (`react-three-fiber`), las transiciones de scroll con GSAP, el sonido ambiental y los botones magnéticos, sobre esta base ya funcional.
