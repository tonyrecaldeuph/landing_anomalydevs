# HANDOFF — Estado del proyecto y guía de ejecución para el agente implementador

**Fecha:** 2026-07-11
**Destinatario:** agente Claude (Sonnet 5) que continuará la implementación.
**Rama de trabajo:** `feature/webgl-landing` (creada desde `main`; NUNCA commitear directo a `main`).
**Directorio de trabajo:** raíz del repo `Anomalydevs/` — **NO** usar el subdirectorio `Landing/` (está vacío y no forma parte del proyecto).

---

## 1. Misión

Construir la landing de AnomalyDevs como experiencia WebGL inmersiva (escena 3D persistente, viaje de cámara scroll-driven con 7 paradas). El trabajo está 100% especificado en dos planes que se ejecutan EN ORDEN:

1. **Plan Fase 1 (base estática):** `docs/superpowers/plans/2026-07-07-anomalydevs-landing-static.md` — 12 tasks. **EN CURSO** (ver §3).
2. **Plan inmersivo:** `docs/superpowers/plans/2026-07-10-anomalydevs-landing-webgl-inmersiva.md` — 20 tasks. **NO INICIADO.** Su precondición es haber terminado la Fase 1.

Documentos de referencia (leer si hay dudas de intención, no para desviarse del plan):
- Spec vigente: `docs/superpowers/specs/2026-07-10-landing-webgl-inmersiva-design.md`
- Spec anterior (superseded, solo contexto): `docs/superpowers/specs/2026-07-07-landing-anomalydevs-design.md`
- Plan Fase 2 antiguo: `docs/superpowers/plans/2026-07-07-anomalydevs-landing-interactive.md` — **OBSOLETO, NO EJECUTAR** (reemplazado por el plan inmersivo).

## 2. Estado del repo

- **Remote:** `https://github.com/tonyrecaldeuph/landing_anomalydevs.git` (origin).
- **Ramas:** `main` (docs + Docker) y `feature/webgl-landing` (implementación en curso).
- **Deploy (futuro, NO hacer ahora):** el VPS clona este repo y construye con el `Dockerfile` de la raíz (espera `npm run build` → `dist/`). Ver `DEPLOY.md`.
- Archivos de marca sin trackear en la raíz (`anomalydevs-brand-kit*`, `*.png`, `*.pdf`): material fuente del usuario. **Dejarlos como están** — no añadirlos a git, no borrarlos, no meterlos en `.gitignore` sin que lo pida el usuario.

### Commits realizados en `feature/webgl-landing` (implementación)

| SHA | Contenido | Task del plan |
|---|---|---|
| `7edd902` | Scaffold Vite + React + TS (package.json, configs, index.html, src/main.tsx, src/App.tsx placeholder, src/test-setup.ts) | Fase1 T1 |
| `0c1c42d` | Tokens de marca + estilos globales (`src/styles/tokens.css`, `src/styles/global.css`) | Fase1 T2 |
| `74746f6` | 7 módulos de contenido + `content.test.ts` (7 tests PASS) | Fase1 T3 |
| `d16e03e` | Tests de Nav/Hero/Manifesto escritos, **en rojo** (WIP, TDD) | Fase1 T4-T6 paso 1 |

`npm install` ya ejecutado (node_modules presente, `package-lock.json` committeado). La suite al día de hoy: `content.test.ts` PASS; `Nav.test.tsx`, `Hero.test.tsx`, `Manifesto.test.tsx` FAIL porque los componentes no existen todavía — **ese es exactamente el punto de reanudación.**

## 3. Estado milimétrico — Plan Fase 1 (static)

| Task | Estado | Detalle |
|---|---|---|
| T1 Scaffold | ✅ completo | Todos los archivos verbatim del plan. Dev server verificado respondiendo en :5173. Commit `7edd902`. |
| T2 Tokens/estilos | ✅ completo | Verbatim del plan. Commit `0c1c42d`. |
| T3 Contenido | ✅ completo | TDD completo (rojo→verde), 7/7 tests. Commit `74746f6`. |
| T4 Nav | 🟡 paso 1 de 6 | Test escrito y committeado (`d16e03e`). **Siguiente acción: paso 2** (correr `npm run test`, confirmar FAIL de Nav), luego pasos 3-6: crear `Nav.module.css`, `Nav.tsx`, verificar PASS, commit `feat: add Nav component`. |
| T5 Hero | 🟡 paso 1 de 6 | Ídem: test ya escrito. Faltan `Hero.module.css`, `Hero.tsx`, verificación, commit `feat: add static Hero section`. |
| T6 Manifesto | 🟡 paso 1 de 6 | Ídem: test ya escrito. Faltan `Manifesto.module.css`, `Manifesto.tsx`, verificación, commit `feat: add Manifesto section`. |
| T7 Services | ⬜ pendiente | Completo en el plan (test + CSS + componente). |
| T8 Projects | ⬜ pendiente | Ídem. |
| T9 Testimonials | ⬜ pendiente | Ídem. |
| T10 Contact | ⬜ pendiente | Incluye validación de formulario con 3 tests. |
| T11 Footer | ⬜ pendiente | Ídem. |
| T12 App | ⬜ pendiente | Ensambla todo + test de orden de headings + verificación manual en navegador. |

**Nota sobre T4-T6:** los 3 tests se escribieron en lote (adaptación aceptada del TDD del plan). Al implementar, respetar los commits individuales por componente que dicta el plan (el test de cada componente entra en el commit de su componente — ya están committeados en `d16e03e`, así que cada commit posterior solo llevará `.tsx` + `.module.css`).

## 4. Estado — Plan inmersivo (20 tasks)

**Ninguna task iniciada.** Ejecutar en orden T1→T20 tras cerrar Fase 1. El plan es autocontenido: cada task trae test completo, código completo, comandos y commit exacto. Puntos que NO se deben "mejorar" ni desviar (decisiones de diseño ya validadas con el usuario):

- `STOP_PROGRESS = [0, 1/6, 2/6, 3/6, 4/6, 5/6, 1]` — 7 paradas equiespaciadas (las secciones HTML miden ~100vh cada una).
- `ANOMALY_INDEX = 0`, `ANOMALY_POSITION = [0, 0, -46]` — el nodo anómalo está fijo en TODAS las formaciones (destino narrativo).
- Formaciones deterministas con `createRng(seed)` (LCG) — los tests dependen del determinismo.
- El progress de scroll vive en un **singleton mutable** (`scrollProgress.value`), jamás en state de React.
- 2 draw calls: `Points` (ShaderMaterial custom) + `LineSegments`. Los pares de conexión se recalculan **solo al cambiar de tramo**.
- `drei` NO se instala (YAGNI, no hay OrbitControls). La cámara es propia (`CameraRig` + `cameraPath.ts`).
- Contenido = overlays HTML reales (SEO/a11y); el canvas es `aria-hidden` con `pointer-events: none`.

## 5. Cómo ejecutar (workflow obligatorio)

1. **Skill:** seguir `superpowers:executing-plans` (ejecución inline). Si el entorno ofrece subagentes y el usuario lo aprueba, `superpowers:subagent-driven-development` es la alternativa.
2. **TDD estricto por task:** escribir/usar el test del plan → correr y VER el fallo → implementar exactamente el código del plan → correr y VER el verde → commit con el mensaje EXACTO del plan.
3. **Suite completa** (`npm run test`) al cierre de cada task — nunca avanzar con la suite en rojo.
4. **No inventar:** el código de cada archivo está completo en los planes. Copiar verbatim. Si algo no compila o un test del plan falla por un error del plan, DETENERSE y reportarlo al usuario en vez de improvisar una corrección silenciosa (se permite arreglar typos obvios documentándolo en el mensaje de commit).
5. **Commits:** mensajes exactos del plan. No agrupar tasks en un commit. No usar `--no-verify`.
6. **Tracking:** marcar los checkboxes `- [ ]` → `- [x]` del plan al completar cada paso (committear el plan actualizado junto con el commit de su task o en un commit final de la fase).
7. **Al terminar Fase 1:** verificación manual del navegador (T12 paso 5) y luego arrancar el plan inmersivo T1.
8. **Al terminar TODO:** usar `superpowers:finishing-a-development-branch` — presentar opciones al usuario (merge a `main`, PR, etc.). **No mergear ni pushear a `main` sin aprobación explícita del usuario.** Push de la rama feature sí está permitido y es bienvenido tras cada task.

## 6. Entorno y gotchas conocidos (leer antes de tocar nada)

- **SO:** Windows 11. Shell disponible: Git Bash y PowerShell. Rutas con `C:/Users/HP/Desktop/DESARROLLOS_UPHONE/Anomalydevs`.
- **cwd trampa:** la sesión puede arrancar con cwd en `Anomalydevs/Landing` (vacío). SIEMPRE `cd` a la raíz del repo antes de npm/git.
- **Warnings CRLF de git** (`LF will be replaced by CRLF`): inofensivos, ignorar.
- **Ruido jsdom:** `Not implemented: HTMLCanvasElement.prototype.getContext` en tests que tocan canvas — esperado, no es fallo.
- **Versiones pineadas (plan inmersivo T1):** `three@^0.169.0`, `@react-three/fiber@^8.17.10` (⚠️ la v9 exige React 19 — NO subir), `gsap@^3.12.5`, `lenis@^1.1.13` (paquete `lenis`, no `@studio-freight/lenis`), `zustand@^5.0.1`, `-D @types/three@^0.169.0`.
- **Tests de hover (inmersivo T16):** usar `fireEvent.mouseOver`/`mouseOut` (NO `mouseEnter`/`mouseLeave` — no disparan los handlers sintéticos de React de forma confiable en jsdom).
- **Mock de `window.matchMedia`** (inmersivo T2) es prerequisito de los hooks del plan inmersivo — no saltarse esa task.
- **Verificación del dev server:** `npm run dev` en background + `curl -s http://localhost:5173` (ya se usó este patrón con éxito).
- **`npm audit` reporta vulnerabilidades** de dependencias transitivas — NO correr `npm audit fix --force` (rompería versiones pineadas). Ignorar por ahora.
- El usuario habla **español** — responderle siempre en español; código/identificadores en inglés como en los planes.

## 7. Definition of Done global

- Fase 1: 12 tasks committeadas, suite completa verde, landing estática visible en :5173 con las 7 secciones y paleta de marca.
- Inmersivo: 20 tasks committeadas, suite verde, y el checklist de QA manual de T20 ejecutado (Lighthouse, fluidez del viaje, cross-browser, reduced-motion, sin-WebGL, mobile, sonido, hover clúster).
- La verificación visual final (T20) requiere criterio humano: pedir al usuario que mire el resultado antes de darlo por cerrado.
- Trabajo terminado = rama `feature/webgl-landing` pusheada + opciones de integración presentadas al usuario (skill finishing-a-development-branch). Nada mergeado a `main` sin su OK.
