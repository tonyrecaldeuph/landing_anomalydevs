# ADR 2.3 — Rediseño futurista HUD con partículas en GPU

- **Fecha:** 2026-09-24
- **Estado:** Aceptado

## Contexto

La landing funciona (navegación por clusters, formulario con backend), pero la estética es
plana: partículas cuadradas (`PointsMaterial` sin textura), tarjetas de borde simple, arranque
con texto estático. Además la animación de partículas corre en CPU recorriendo cada vértice
en cada frame y re-subiendo el buffer a la GPU.

## Decisión

1. Mover animación de partículas a un `ShaderMaterial` (ruido + repulsión al puntero en el
   vertex shader, disco suave en el fragment shader). Los buffers quedan estáticos.
2. El brillo se obtiene en el fragment shader (núcleo + halo por partícula, mezcla aditiva), **sin
   post-procesado**. Se probó `UnrealBloomPass`: la pasada de copia final aplica conversión sRGB y
   las mips grandes integran la neblina de ~41k puntos → velo gris-verde sobre toda la pantalla.
   Se descartó.
3. Calidad adaptativa: tras 20 frames de calentamiento se promedian 60; si el FPS < 42, el render
   baja a pixel ratio 1 (decisión única, sin oscilar).
4. Capa HUD en React (marco, lectura de sección, riel de navegación) como componentes
   independientes que solo consumen `activeCluster` / `navigateTo`.
5. Efectos de UI (scramble, tilt, contadores) como funciones puras + hooks finos, testeables.

## Consecuencias (trade-offs)

- **+ Rendimiento CPU:** de O(n) por frame (n ≈ 41 000 partículas) a O(1); sin re-subida de
  buffers.
- **+ Coste GPU acotado:** una sola pasada de render (sin bloom). Pixel ratio acotado a 2 (1.5 en
  móvil) y degradado automático a 1 en equipos lentos.
- **− Fidelidad:** sin bloom real el halo es por partícula (no se funde entre partículas vecinas);
  compromiso aceptado a cambio de contraste limpio y rendimiento.
- **+ Mantenibilidad:** efectos aislados en `src/fx/*` con pruebas unitarias; la escena solo
  expone la misma API (`setActiveCluster`, `startEnter`, `resize`, `dispose`) + `setPointer`.
- **− Simplicidad:** GLSL embebido en strings no se tipa ni se prueba en jsdom; se mitiga
  verificando en Chromium real y cubriendo los uniforms por prueba de contrato.

## Métricas

- **Big O:** animación de partículas CPU O(n) → O(1) por frame; GPU O(n) (sin cambio de clase).
  Scramble O(k) por frame con k = longitud del titular (≤ 30).
- **Big I:** I(0) para el visitante (todo automático); navegación sigue en 1 gesto por sección.
  Despliegue I(1): `git pull && docker compose up -d --build` en el VPS.
