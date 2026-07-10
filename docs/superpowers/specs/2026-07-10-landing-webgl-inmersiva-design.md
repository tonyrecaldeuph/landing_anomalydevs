# Landing AnomalyDevs — Experiencia WebGL inmersiva — Diseño

**Fecha:** 2026-07-10
**Estado:** Aprobado por el usuario, pendiente de plan de implementación.
**Supersede a:** `2026-07-07-landing-anomalydevs-design.md`. Esta spec reemplaza el enfoque híbrido (red de nodos solo en hero + transiciones) por una experiencia WebGL inmersiva de página completa. El plan de Fase 1 (`docs/superpowers/plans/2026-07-07-anomalydevs-landing-static.md`) sigue siendo la base de contenido/scaffold con ajustes; el plan de Fase 2 (`2026-07-07-anomalydevs-landing-interactive.md`) queda obsoleto.

## 1. Resumen y objetivo

Landing one-page para AnomalyDevs (estudio de desarrollo de software) como experiencia WebGL inmersiva inspirada en `unseen.co/projects/blue-yard/`: una escena 3D persistente que ocupa toda la página, donde el scroll conduce a la cámara en un viaje a través de un campo de nodos conectados — la "red de anomalía expandida".

**Arco narrativo:** en el hero, el usuario detecta a lo lejos un nodo que pulsa distinto al resto (la anomalía); el scroll es el viaje hacia ella a través de la red; en Contacto, llega frente a ella. La metáfora de marca completa: *detectamos la anomalía → viajamos hasta ella → la resolvemos contigo*.

Headline y copy placeholder se mantienen de la spec anterior: **"DETECTAMOS LA ANOMALÍA."** / "Software que no sigue el molde." — todo el contenido de secciones (§4 de la spec 2026-07-07) sigue vigente y vive en `src/content/*.ts`.

## 2. Decisiones de diseño (validadas con el usuario)

| Decisión | Elección |
|---|---|
| Enfoque general | Rediseño total inmersivo (no ejecutar planes previos tal cual) |
| Modelo de navegación | Viaje scroll-driven: scroll = cámara avanza por la escena; secciones = paradas del recorrido |
| Motivo visual | Red de anomalía expandida: constelación de nodos + conexiones, un nodo anómalo pulsante como punto focal narrativo |
| Estructura de contenido | Las mismas 7 secciones de la spec anterior (Hero, Manifiesto, Servicios, Proyectos, Testimonios, Contacto, Footer) |
| Render de contenido | Overlays HTML reales sincronizados con el scroll (SEO, accesibilidad, tipografía nítida); el 3D es fondo protagonista |
| Stack | React Three Fiber + drei, GSAP ScrollTrigger (scrub), Lenis (smooth scroll), sobre Vite + React 18 + TypeScript + Vitest |

## 3. Alcance

**Incluido:**
- Escena WebGL persistente de página completa con viaje de cámara scroll-driven y 6 formaciones de la red (una por parada).
- Las 7 secciones de contenido como overlays HTML, con copy placeholder editable en `src/content/*.ts`.
- Interactividad: parallax de mouse en hero, hover de card de servicio ilumina su clúster 3D, botones magnéticos, sonido ambiental opcional (off por defecto, persistido).
- Fallbacks: `prefers-reduced-motion`, sin WebGL, móvil/gama baja.
- Responsive completo y verificación QA manual + tests de lógica pura.

**Fuera de alcance:**
- Backend/CMS: formulario de contacto sin envío real (punto de integración documentado).
- Subpáginas de proyectos individuales.
- Contenido real (se mantienen placeholders editables).
- Partículas exportadas de herramientas 3D externas (Houdini-style, como hace unseen.co) — las formaciones se generan de forma procedural en código.

## 4. Coreografía del viaje

Un único canvas fijo detrás del contenido. La altura del documento la definen los overlays HTML; el progress de scroll (0–1) conduce cámara y formaciones. Las paradas y sus porcentajes son aproximados y se afinan en implementación:

| # | Parada | ~Scroll | Formación de la red | Cámara |
|---|---|---|---|---|
| 1 | Hero | 0% | Campo denso e irregular; la anomalía pulsa a lo lejos como punto focal | Estática al borde del campo; deriva leve + parallax de mouse |
| 2 | Manifiesto | ~15% | El caos circundante se ordena en una grilla parcial al atravesarlo | Primer avance, entra al campo |
| 3 | Servicios | ~30% | 6 clústeres (uno por servicio) flanquean el camino; hover en card ilumina su clúster | Pasillo entre clústeres |
| 4 | Proyectos | ~50% | Claro de baja densidad; nodos como marco sutil, cards protagonistas | Zona despejada, movimiento mínimo (legibilidad) |
| 5 | Testimonios | ~65% | Nodos orbitan en anillos lentos alrededor del camino | Avance con leve rotación |
| 6 | Contacto | ~80% | La red converge hacia el nodo anómalo del hero, ahora de cerca, pulsando enorme | Desacelera y se detiene frente a la anomalía |
| 7 | Footer | 100% | La escena se atenúa, fade a negro | Quieta; opacidad baja |

Entre paradas, las posiciones de nodos se interpolan suavemente (el viaje nunca "corta" — es una escena continua).

## 5. Arquitectura técnica

### Estructura de carpetas

```
src/
  components/
    SceneCanvas/        # canvas R3F fijo, persistente toda la página
    NodeField/          # puntos instanciados + líneas, shader custom, interpolación de formaciones
    Nav/  Hero/  Manifesto/  Services/  Projects/  Testimonials/  Contact/  Footer/
    MagneticButton/  SoundToggle/
  three/
    networkGeometry.ts    # nodos + conexiones por distancia (determinista, con seed)
    networkFormations.ts  # posiciones objetivo por parada (campo, grilla, clústeres, claro, anillos, convergencia)
    cameraPath.ts         # curva CatmullRom con waypoints por sección; progress → posición/mirada
    networkConfig.ts      # nodos/DPR/flags según dispositivo
    supportsWebGL.ts
  hooks/
    useScrollProgress.ts        # Lenis + ScrollTrigger scrub → progress en ref (sin re-renders)
    usePrefersReducedMotion.ts
  content/              # copy placeholder en .ts (igual que spec anterior)
  styles/               # tokens de marca, global
```

### Data flow

```
scroll nativo (altura definida por overlays HTML)
  → Lenis (suavizado) → GSAP ScrollTrigger (scrub)
  → progress global 0–1 escrito en un ref (nunca state de React)
  → useFrame (R3F): interpola posición de cámara sobre cameraPath
    e interpola posiciones de nodos entre formaciones adyacentes
  → GPU (2 draw calls: puntos instanciados + line segments)
```

HTML y 3D comparten únicamente el número de progress: los overlays usan el scroll nativo del documento (con reveals GSAP), la escena lo lee del ref. Sin acoplamiento adicional.

### Puntos técnicos clave

- **`NodeField`:** un `Points` instanciado con shader material custom (glow neón, atenuación de tamaño/alfa por profundidad, pulso de la anomalía por uniform de tiempo) + un `LineSegments` para conexiones con alfa por distancia. Las conexiones se recalculan solo por formación (no por frame).
- **Formaciones:** cada una es un `Float32Array` de posiciones objetivo generado de forma determinista (seed fija) por `networkFormations.ts`. El frame loop hace lerp entre la formación actual y la siguiente según el progress local del tramo. Lógica pura → cubierta por tests.
- **Hover card → clúster:** store ligero (zustand) con `hoveredServiceId`; `NodeField` sube la intensidad del clúster correspondiente vía uniform. Sin re-render de React en el hover.
- **Carga:** el chunk de three/R3F se importa con `lazy()`; el hero (HTML/CSS) pinta primero — LCP no depende del 3D.

## 6. Sistema visual

Sin cambios respecto a la spec anterior (guía de marca):
- Fondo negro `#060A07`; texto cuerpo blanco/mint `#CFFFE0`; verde neón `#33FF77` solo para acentos/headlines/CTAs; mint `#9DFFC0`; verde apagado `#1C6B3A` para bordes y conexiones de la red.
- JetBrains Mono para headlines/nav/labels/CTAs; Inter para párrafos largos.
- Los overlays HTML usan paneles con fondo semitransparente oscuro + blur sutil donde haga falta contraste sobre la escena.

## 7. Interactividad

- **Parallax de mouse (hero):** desplazamiento leve de cámara hacia el cursor; desactivado en móvil y con reduced-motion.
- **Hover servicio → clúster:** ver §5.
- **Botones magnéticos:** CTAs de hero y contacto (GSAP `quickTo`).
- **Reveal al scroll:** títulos/párrafos con fade + slide al entrar en viewport (GSAP ScrollTrigger).
- **Sonido ambiental opcional:** loop synth sutil, off por defecto, sin autoplay, toggle en nav, persistido en `localStorage` (igual que spec anterior).

## 8. Rendimiento y accesibilidad

- **`prefers-reduced-motion`:** sin viaje de cámara ni scrub — escena estática con la formación del hero y glow sutil; overlays con scroll normal sin reveals agresivos.
- **Sin WebGL:** no se monta canvas; fondo estático CSS (gradiente radial + glow) con el mismo lenguaje visual.
- **Móvil/gama baja:** menos nodos, DPR limitado a 1.5, sin parallax; touch targets ≥44px.
- **Carga:** hero HTML pinta de inmediato; three/R3F en chunk diferido; render pausado cuando la pestaña no es visible (`document.visibilitychange`).
- Contraste verificado sobre la escena (paneles semitransparentes cuando el fondo compita); foco visible por teclado; el canvas es `aria-hidden` y todo el contenido es HTML accesible.

## 9. Verificación

- **Tests (Vitest):** formaciones (determinismo, conteos, forma esperada), camera path (progress → posición monótona en el eje del viaje), mapping progress→tramo, módulos de contenido, componentes de sección, validación del formulario.
- **QA manual:** Lighthouse desktop/mobile (performance + accesibilidad); Chrome/Firefox/Safari; breakpoints móvil/tablet/desktop; `prefers-reduced-motion`; fallback sin WebGL; sonido sin autoplay y persistente; hover card→clúster; fluidez del scrub (objetivo 60 fps desktop, sin jank visible en móvil de gama media).

## 10. Notas para el plan de implementación

- Reutilizar del plan Fase 1 (2026-07-07): scaffold Vite/React/TS/Vitest, tokens de estilo, módulos de contenido con tests, componentes de sección (adaptando su presentación a overlays sobre la escena) y formulario de contacto.
- El plan de Fase 2 anterior no se ejecuta; sirve solo como referencia parcial (hooks de reduced-motion, detección WebGL, sound toggle, magnetic button).
- El código vive en la raíz del repo `Anomalydevs/` (el directorio `Landing/` está vacío y no se usa; el Dockerfile existente en la raíz espera el build de Vite ahí).
