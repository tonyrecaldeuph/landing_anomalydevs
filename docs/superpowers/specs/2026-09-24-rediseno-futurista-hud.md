# Rediseño futurista — "Centro de Detección de Anomalías"

## Objetivo

Elevar la landing a nivel de estudio de primera línea: estética HUD sci‑fi fiel a la marca
(negro #060A07 + neón #33FF77, JetBrains Mono), más interacción y más "wow" sin romper la
navegación por clusters ya validada en QA (useScrollNavigation, SectionOverlay).

## Alcance

1. **Escena WebGL**
   - `ShaderMaterial` propio: puntos redondos con halo, parpadeo, deriva por ruido en GPU
     (se elimina el bucle CPU por partícula por frame → CPU O(1) por frame).
   - Repulsión al puntero: el cursor proyectado al plano del cluster activo empuja partículas.
   - Campo de estrellas de fondo + parallax de cámara con el puntero.
   - Halo tipo bloom dentro del fragment shader (sin post-procesado) + calidad adaptativa por FPS.
2. **Arranque (EnterScreen)**: secuencia de boot tipo terminal (líneas de log + barra de
   progreso), símbolo "A" de marca dibujado con trazo, botón "Haz clic para entrar".
3. **HUD**: marco con esquinas, lectura de sección `SEC 03/06 · PROYECTOS`, reloj UTC‑5,
   y riel lateral de navegación (puntos accesibles por teclado).
4. **Nav**: cápsula de vidrio, símbolo de marca, CTA "Hablemos".
5. **Secciones**
   - Hero: badge de disponibilidad, titular con efecto *decode/scramble*, CTA con barrido.
   - Manifiesto: contadores animados.
   - Servicios: tarjetas holográficas con inclinación 3D + foco de luz que sigue al puntero,
     numeradas e iconografía SVG.
   - Proyectos: tarjetas con inclinación, escaneo sobre la imagen, índice `// 01`.
   - Testimonios: formato "transmisión entrante".
   - Contacto: formulario estilo consola con prompts.
6. **Global**: grano + scanlines sutiles, cursor anillo con inercia, favicon y metadatos OG.

## Restricciones

- `prefers-reduced-motion`: sin scramble, sin tilt, sin boot animado, sin WebGL (ya existente).
- Accesibilidad: textos animados conservan su texto real para lectores de pantalla.
- Sin dependencias nuevas.

## Pruebas

Unidades puras con TDD: `scrambleFrame`, `computeTilt`, `parseStat/formatStat`,
`bootProgress`, `pointerToNdc`, `lerp`, `sectionReadout`. Componentes: ScrambleText,
HudFrame, SectionRail, EnterScreen, Nav. Suite completa `npm test` + `npm run build` +
verificación visual en Chromium antes de desplegar.
