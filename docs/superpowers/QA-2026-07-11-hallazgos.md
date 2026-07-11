# QA / Auditoría — Fase 3 inmersiva (`main`) — Hallazgos

**Fecha:** 2026-07-11
**Rama de auditoría:** `feature/qa-auditoria` (desde `main` @ `62670ef`)
**Alcance:** auditoría de código estático + revisión arquitectónica, siguiendo la misión del §Addendum de `docs/superpowers/HANDOFF-2026-07-11-sonnet5.md`. **QA manual en navegador (Lighthouse, cross-browser, reduced-motion, sin-WebGL, móvil) aún NO ejecutado** — ver §5.

## Línea base

- `npm install`: OK (con 8 vulnerabilidades en deps transitivas — 1 crítica, 3 altas, 4 moderadas; NO se corrió `npm audit fix --force`, ver gotcha del handoff).
- `npm run test`: **25 archivos, 50 tests, 100% en verde.**
- `npx tsc -b`: sin errores.
- `npm run build`: OK. `ImmersiveCanvas` queda en chunk lazy separado (456 kB / gzip 116 kB — dentro del presupuesto de spec de <250 kB gzip).

## Hallazgos

### 🔴 Crítico 1 — Pantalla de entrada (`EnterScreen`) inaccesible por teclado/lector de pantalla

**Archivo:** `src/components/EnterScreen/EnterScreen.tsx:27`

```tsx
<div className={styles.overlay} onClick={handleClick}>
```

Es un `<div>` con `onClick`, sin `role="button"`, sin `tabIndex`, sin `onKeyDown` (Enter/Space). Como `EnterScreen` bloquea el render de todo lo demás (`Nav`, `main`, `Footer` solo se montan cuando `entered === true`, ver `App.tsx:39-47`), **un usuario que navega solo con teclado o con lector de pantalla no tiene forma de "hacer clic" y queda bloqueado permanentemente en la pantalla de entrada — no puede acceder a NINGÚN contenido del sitio.**

**Fix sugerido:** cambiar el contenedor a `<button type="button">` (o añadir `role="button" tabIndex={0}` + handler de `onKeyDown` para Enter/Space) y verificar con un test de accesibilidad (`fireEvent.keyDown(..., { key: 'Enter' })`).

### 🔴 Crítico 2 — El scroll no tiene recorrido suficiente para navegar los 6 clústeres

**Archivos:** `src/components/SectionOverlay/SectionOverlay.tsx`, `src/hooks/useScrollNavigation.ts`

`SectionOverlay` renderiza **una sola sección a la vez** (`sectionComponents[id]` según `activeIndex`) dentro de un wrapper `minHeight: '100vh'` — no apila las 6 secciones. `Nav` es `position: fixed` (fuera del flujo) y `Footer` tiene una altura modesta. Por lo tanto, la altura total scrolleable del documento (`document.documentElement.scrollHeight - window.innerHeight`) es, en la práctica, solo la del `Footer` (unos ~150-300px), NO seis pantallas de contenido.

`useScrollNavigation` calcula:
```ts
const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
const index = Math.min(Math.floor(progress * sectionCount), sectionCount - 1);
```//
Con un `scrollHeight` de solo ~200px, `progress` llega a 1 (y por tanto `activeCluster` salta a 5, "Contacto") con apenas un gesto de scroll — **el "viaje cinematográfico por 6 clústeres" que describe la spec (§User Flow) no puede ocurrir; en la práctica el usuario "salta" de Hero a Contacto casi de inmediato**, sin pasar de forma perceptible por Manifiesto/Servicios/Proyectos/Testimonios.

**Fix sugerido:** requiere decisión de diseño — dos caminos válidos: (a) dar al documento una altura real de `sectionCount * 100vh` (p. ej. un spacer invisible o renderizando las 6 secciones apiladas y ocultando visualmente las inactivas en vez de desmontarlas), o (b) abandonar el scroll nativo del documento y usar el modelo de "scroll-jacking" (rueda del mouse / touch como eventos discretos que avanzan `activeCluster` sin depender de `scrollHeight`). Reportar al usuario antes de elegir — es un cambio de arquitectura, no un fix trivial.

### 🔴 Crítico 3 — Los links del Nav no navegan a ningún lado

**Archivos:** `src/components/Nav/Nav.tsx`, `src/content/nav.ts`, `src/components/SectionOverlay/SectionOverlay.tsx`

`Nav` renderiza anclas (`href="#servicios"`, `#proyectos`, `#testimonios`, `#contacto"`, desde `content/nav.ts`). Pero el wrapper de `SectionOverlay` no asigna ningún `id` al contenedor de la sección activa, y solo UNA sección está montada en cada momento (con su propio `id` interno, p. ej. `id="top"` en `Hero.tsx`, que ni siquiera coincide con los hrefs del nav). **Resultado: clicar cualquier link del Nav no hace nada** — no hay ningún elemento con esos ids en el DOM en ningún momento.

Relacionado con el Hallazgo Crítico 2 pero es un bug independiente y observable incluso si se arreglara el scroll: el Nav quedó como reliquia de la Fase 1 estática (donde sí existían las 7 secciones simultáneamente en el DOM con anclas funcionales) y nunca se adaptó al modelo de Fase 3 (una sección montada a la vez, navegación por índice de clúster).

**Fix sugerido:** depende de la resolución del Hallazgo 2. Si se opta por scroll-jacking discreto, los links del Nav deberían llamar a `navigateTo(index)` (ya expuesto por `useScrollNavigation` pero **nunca usado** en ningún componente) en vez de usar anclas `href`.

### 🟡 Importante 1 — Sonido "modulado por sección activa" no está conectado

**Archivos:** `src/components/SoundToggle/SoundToggle.tsx`, `src/components/Nav/Nav.tsx:16`, `src/App.tsx`

`SoundToggle` implementa correctamente la modulación de frecuencia por clúster (`FREQ_BY_CLUSTER`, prop `activeCluster`) — cumple la spec ("Sonido: Tono ambiente modulado por sección activa"). Pero `Nav.tsx` lo renderiza sin pasarle la prop (`<SoundToggle />`), y `App.tsx` nunca pasa `activeCluster` a `Nav`. **La frecuencia queda fija en 110Hz (Hero) sin importar en qué sección esté el usuario — la feature existe pero está muerta.**

**Fix sugerido:** trivial una vez resuelto el Hallazgo 2 (pasar `activeCluster` desde `App` → `Nav` → `SoundToggle`). Se puede hacer con un test que verifique que `SoundToggle` recibe el `activeCluster` correcto vía props.

### 🟡 Importante 2 — Código muerto de la Fase 2 (pre-inmersiva)

**Archivos:** `src/components/NodeNetwork/**` (Container, Scene, Fallback + CSS + tests), `src/hooks/useNodeNetworkState.ts` (+test), `src/three/networkGeometry.ts` (+test), `src/three/networkConfig.ts` (+test).

Ninguno de estos archivos es importado por `App.tsx` ni por ningún componente activo (verificado por grep — solo se referencian entre sí y en sus propios tests). Son reliquia de la Fase 2 (red de nodos con `react-three-fiber`), reemplazada por la Fase 3 (partículas con Three.js puro). El árbol de build los descarta (tree-shaking), pero:
- Las dependencias `@react-three/fiber` y `@react-three/drei` en `package.json` **solo** las usa este código muerto (`NodeNetworkScene.tsx`) — se podrían eliminar junto con los archivos.
- 6+ archivos de test muertos siguen corriendo en cada `npm run test`, añadiendo ruido y tiempo sin verificar nada que el usuario final vea.

**Fix sugerido:** eliminar el subárbol `NodeNetwork/`, `useNodeNetworkState.*`, `networkGeometry.*`, `networkConfig.*`, y las dos dependencias r3f/drei de `package.json` (`npm uninstall @react-three/fiber @react-three/drei`). Cambio mecánico, bajo riesgo — pero confirmar con el usuario antes de borrar (podría querer conservarlos como referencia).

### 🟡 Importante 3 — Presupuesto de partículas/draw-calls incumplido

**Archivo:** `src/components/ImmersiveCanvas/ParticleScene.ts`

La spec (§Performance Budget) exige `Draw calls: 1 (instanced)` y `GPU instancing obligatorio`. La implementación real construye las 6 secciones como 6 objetos `THREE.Points` independientes (`configs.forEach((cfg) => clusters.push(buildCluster(cfg)))`, línea 87) — **6 draw calls, no 1**, y no usa `THREE.InstancedMesh` (GPU instancing real). Además, los 6 clústeres (≈50.000 partículas en desktop: 15000+8000+4×3000+6000+4000+5000) se animan TODOS en cada frame con `Math.sin()` por partícula (línea 106-109), incluidos los clústeres inactivos que solo bajan de opacidad — no se "pausa" el cómputo de los inactivos. El presupuesto de spec dice "Particle count: 15,000 desktop", que solo tiene sentido si es "por clúster activo", pero el código mantiene los 6 en memoria y animados simultáneamente.

**Fix sugerido:** requiere decisión de diseño — reconstruir con `THREE.InstancedMesh`/`InstancedBufferGeometry` para 1 draw call, o (más simple) omitir la animación `sin()` de los clústeres no activos ya que solo son visibles al 15% de opacidad. Medir FPS real en Chrome DevTools antes de decidir cuánto esfuerzo vale la pena invertir aquí.

### 🟢 Menor 1 — Cursor personalizado activo antes de "entrar" al sitio

**Archivo:** `src/App.tsx:19`

`useCursor()` se invoca incondicionalmente, incluso mientras `EnterScreen` sigue visible (`entered === false`). El cursor nativo desaparece desde el primer render, antes de que el usuario haya "entrado". Probablemente no es intencional según el flujo descrito en la spec (§User Flow: el cursor aparece como parte de la experiencia post-entrada). Impacto bajo — anotar para confirmar con el usuario si es deseado.

### 🟢 Menor 2 — Vulnerabilidades de `npm audit`

8 vulnerabilidades en dependencias transitivas (1 crítica, 3 altas, 4 moderadas). No se investigó el detalle (`npm audit` para verlo) ni se corrigió — el handoff explícitamente prohíbe `npm audit fix --force` sin aprobación (podría romper versiones pineadas). Reportar al usuario si quiere que se revise el detalle.

## Pendiente (no ejecutado en esta pasada)

Checklist de QA manual del §5 del handoff — requiere navegador real, no se puede verificar solo con lectura de código:
- [ ] Verificación visual del flujo completo en `npm run dev` (EnterScreen → clic → escena → secciones → formulario)
- [ ] Lighthouse desktop/mobile
- [ ] `prefers-reduced-motion` (código ya lo contempla en `ImmersiveCanvas`/`useCursor`/`ImmersiveCanvas`, pero falta confirmación visual)
- [ ] Deshabilitar WebGL → fallback
- [ ] Emulación móvil (<768px): sin cursor personalizado (confirmado en código), partículas reducidas, touch targets
- [ ] Consola sin errores en navegador real
- [ ] Toggle de sonido: sin autoplay, persistencia tras recarga

**Nota:** los Hallazgos Críticos 1-3 tienen alta probabilidad de hacer que la verificación manual del flujo completo (primer ítem de la lista) falle o se sienta "rota" — se recomienda resolverlos (o al menos el 1 y 3, que son más baratos) antes de invertir tiempo en el resto del checklist manual.

## Recomendación de siguiente paso

Los 3 hallazgos Críticos son cambios de arquitectura/UX, no bugs triviales con fix de una línea — **no se implementaron cambios de código en esta pasada**, conforme a la instrucción del handoff de reportar brechas grandes antes de tocar código. Se necesita decisión del usuario sobre:
1. Cómo resolver el modelo de scroll (Crítico 2) — determina el fix de Crítico 3 (Nav) y el flujo de Nav→sonido (Importante 1).
2. Si limpiar el código muerto de Fase 2 (Importante 2) ahora o dejarlo.
3. Cuánto esfuerzo invertir en el draw-call budget (Importante 3) — depende de si el QA manual de rendimiento (Lighthouse/FPS) muestra un problema real o es solo una desviación de spec sin impacto perceptible.
