# Landing principal de AnomalyDevs — Diseño

**Fecha:** 2026-07-07
**Estado:** Aprobado por el usuario, pendiente de plan de implementación.

## 1. Resumen y objetivo

Landing one-page para AnomalyDevs (estudio de desarrollo de software), inspirada en la experiencia interactiva de `unseen.co/projects/blue-yard/` (nube de partículas 3D navegable, scroll narrativo, sonido ambiental opcional) pero reinterpretada con el lenguaje de marca ya existente de AnomalyDevs: negro + verde neón, tipografía JetBrains Mono, y el símbolo de "anomalía" — un nodo que se comporta distinto al resto de una red/grilla de datos.

**Narrativa central:** cada proyecto empieza siendo una anomalía — algo que no encaja en el molde — y el estudio la convierte en software que funciona. El hero materializa esto: una red de nodos 3D donde uno se comporta distinto al resto.

Headline propuesto: **"DETECTAMOS LA ANOMALÍA."** / subtítulo: **"Software que no sigue el molde."** con CTAs a Proyectos y a Contacto.

## 2. Alcance

**Incluido:**
- One-page completa con 7 secciones (ver §4).
- Experiencia 3D interactiva (red de nodos) en el hero + transiciones entre secciones.
- Copy placeholder editable en español para todas las secciones de contenido.
- Interactividad: sonido ambiental opcional, botones magnéticos, texto con reveal al scroll.
- Diseño responsive (desktop, tablet, móvil) y fallback para `prefers-reduced-motion` / sin WebGL.

**Fuera de alcance (por ahora):**
- Backend/CMS: el formulario de contacto no envía a un servidor real (placeholder de UI, se conecta después).
- Subpáginas de proyectos individuales (los casos del portfolio son tarjetas dentro de la misma página, sin rutas propias).
- Cursor personalizado (evaluado y descartado en esta ronda).
- Contenido real de servicios/proyectos/testimonios (se define con placeholders editables).

## 3. Stack técnico

- **React + Vite + TypeScript.**
- **`@react-three/fiber` + `@react-three/drei`** para la red de nodos en WebGL (puntos instanciados + segmentos de línea, shader propio para el glow neón).
- **GSAP + ScrollTrigger** para: animaciones de scroll-reveal, transiciones de la red de nodos entre secciones, y el efecto de botones magnéticos.
- Sin backend — el sitio es estático, desplegable en Vercel/Netlify.

### Estructura de carpetas

```
src/
  components/
    NodeNetwork/        # canvas R3F + máquina de estados (hero / transición / oculto)
    Hero/
    Manifesto/
    Services/
    Projects/
    Testimonials/
    Contact/
    Footer/
    Nav/
    MagneticButton/
    SoundToggle/
  content/              # copy placeholder en .ts — separado de los componentes
  styles/               # tokens de marca: color, tipografía, spacing
```

## 4. Estructura de la página y contenido placeholder

### 4.1 Hero
Pantalla completa. Red de nodos 3D interactiva de fondo (drag limitado + parallax con el mouse). Overlay con:
- Headline: "DETECTAMOS LA ANOMALÍA."
- Subtítulo: "Software que no sigue el molde."
- CTA primario: "Ver proyectos" (ancla a §4.4) — CTA secundario: "Hablemos" (ancla a §4.6).
- Indicador de scroll ("Desliza para explorar").

### 4.2 Manifiesto / Sobre nosotros
*(Transición: la red se reforma brevemente al entrar a esta sección)*

Placeholder de copy:
> "En AnomalyDevs no partimos de una plantilla. Partimos de lo que no encaja — el caso raro, el requisito imposible, el dato que se sale de la curva — y construimos el software que lo resuelve."

3 stat chips placeholder: `+30 proyectos entregados` · `5 años de experiencia` · `100% remoto, foco en LATAM`.

### 4.3 Servicios
Grid de 4-6 tarjetas, iconografía derivada del motivo de nodos/pulso del logo. Placeholder:
1. **Desarrollo web** — sitios y web apps a medida.
2. **Apps móviles** — iOS/Android nativo o híbrido.
3. **Automatización & IA** — integración de modelos e IA en flujos de negocio.
4. **Consultoría técnica** — arquitectura, auditoría, code review.
5. **Producto digital** — de la idea al MVP.
6. **Soporte & escalado** — mantenimiento y crecimiento post-lanzamiento.

Cada tarjeta: título, ícono, descripción corta (1-2 líneas), hover revela detalle adicional.

### 4.4 Proyectos
Grid de casos (placeholder, 4-6 tarjetas): imagen/gradiente placeholder, título de proyecto ficticio, tags de tecnología, hover revela título/tags con transición. Sin rutas individuales — enlace placeholder "Ver caso →" (deshabilitado o ancla a Contacto hasta que haya casos reales).

### 4.5 Testimonios
*(Transición: la red vuelve a aparecer brevemente)*

Grid o carrusel de 3-4 citas placeholder, con avatar tipo insignia hexagonal (reutilizando el estilo del monograma de marca) en vez de fotos reales:
> "AnomalyDevs entendió un problema que ningún otro equipo había resuelto bien." — *Placeholder, Cliente ficticio*

### 4.6 Contacto
CTA grande ("¿Tienes una anomalía que resolver?"), email de contacto, enlaces a redes, formulario simple (nombre, email, mensaje) sin backend real por ahora (se deja el punto de integración documentado en el código).

### 4.7 Footer
Logo (lockup "señal"), navegación ancla, redes sociales, copyright.

## 5. Sistema visual

- **Paleta** (de la guía de marca): fondo negro base `#060A07`; texto de cuerpo en blanco/mint claro `#CFFFE0` (el verde neón puro se reserva para acentos, headlines y CTAs — no para bloques largos de texto, por legibilidad y fidelidad a la guía de marca); verde neón principal `#33FF77`; mint acento `#9DFFC0`; verde apagado `#1C6B3A` para bordes/separadores sutiles.
- **Tipografía:** JetBrains Mono para headlines, navegación, labels y CTAs (identidad "terminal" de la marca). Para párrafos largos (manifiesto, descripciones de servicios) se usa una sans-serif complementaria de alta legibilidad, mantiene Mono reservado a títulos y elementos de interfaz.
- **Espaciado y jerarquía:** whitespace generoso entre secciones, siguiendo el patrón modular de la referencia (bloques de contenido bien separados, sin saturar con el neón).

## 6. La red de nodos interactiva (mecánica híbrida)

Un único `<canvas>` de fondo, fijo (`position: fixed`), gestionado por una máquina de estados con 3 modos:

1. **Hero (activa/interactiva):** puntos + líneas conectoras en 3D, con drag limitado (no orbit completo, para no desorientar) y parallax leve con el movimiento del mouse. Un nodo se distingue visualmente del resto (mayor brillo/tamaño/pulso) representando la "anomalía".
2. **Transición (entre secciones):** en los límites Hero→Manifiesto y Testimonios→Contacto, la red se anima armándose/desarmándose durante ~0.6-1s, disparada por `ScrollTrigger` al cruzar esos puntos del scroll.
3. **Oculta:** en el resto de las secciones (Servicios, Proyectos, dentro de Manifiesto/Testimonios ya asentadas), el canvas se desmonta del DOM — no consume GPU/CPU en segundo plano ni compite visualmente con el contenido.

## 7. Interactividad adicional

- **Botones magnéticos:** CTAs principales (hero, contacto) se desplazan levemente hacia el cursor al pasar cerca (implementado con GSAP `quickTo` sobre `transform`).
- **Reveal al scroll:** títulos y párrafos de cada sección aparecen con fade + slide (y glitch sutil opcional en headlines clave) al entrar en viewport, vía `ScrollTrigger`.
- **Sonido ambiental opcional:** loop sutil tipo synth/glitch, **apagado por defecto** (sin autoplay, respeta políticas de navegador), toggle visible en el nav, estado persistido en `localStorage`.

## 8. Rendimiento y accesibilidad

- `prefers-reduced-motion`: desactiva drag/autoplay de la red, transiciones agresivas y reveals; deja versión estática con glow sutil.
- **Fallback sin WebGL o gama baja:** detección de soporte WebGL/capacidad del dispositivo; si falla o es un dispositivo de gama baja, se sirve una versión Canvas2D más liviana (mismo lenguaje visual, sin 3D real) en vez de la escena de Three.js.
- **Mobile:** menos nodos en la red, sin drag (solo autoplay leve), tamaños de touch target ≥44px en CTAs.
- **Carga:** el hero pinta headline/CTA de inmediato (HTML/CSS); el bundle de Three.js se carga de forma diferida (code splitting) para no bloquear el LCP.
- Contraste de texto verificado sobre fondo negro; foco visible por teclado en todos los elementos interactivos; alt text en imágenes/placeholders de proyectos.

## 9. Verificación

Al no haber lógica de negocio ni backend, la verificación es principalmente visual/funcional, no de tests automatizados de unidad:
- Lighthouse (performance + accesibilidad) en desktop y mobile.
- Revisión cross-browser: Chrome, Firefox, Safari.
- Breakpoints responsive: móvil, tablet, desktop.
- Verificación manual de `prefers-reduced-motion` y del fallback sin WebGL.
- Verificación manual de que el toggle de sonido no autorreproduce y persiste su estado.

## 10. Notas para el plan de implementación

- El proyecto (`Anomalydevs/`) no es un repositorio git todavía — antes de empezar a implementar habrá que decidir si se inicializa `git init` aquí o en una carpeta de proyecto nueva (p. ej. `Anomalydevs/web/`).
- El copy placeholder de este documento (§4) es el que se usa en la primera implementación; vive en `src/content/*.ts` para que el usuario lo reemplace fácilmente por contenido real más adelante.
