# Descarga fija de Terminal de Cobranza + Proyectos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** URL fija con token que siempre entrega el último instalador de Terminal de Cobranza en .zip, más tres tarjetas nuevas en Proyectos.

**Architecture:** Módulo `server/downloads.mjs` en la API Node sin dependencias: espeja el feed de electron-updater (`latest.yml`), verifica sha512, comprime a zip en streaming y sirve el archivo tras validar token. `server/index.mjs` solo monta las rutas. Contenido de Proyectos en `src/content/projects.ts`.

**Tech Stack:** Node 20 (`node:zlib` con `crc32`, `node:crypto`, `node:stream`), Vitest, Caddy, Docker Compose, React.

**Spec:** `docs/superpowers/specs/2026-09-25-descarga-terminal-y-proyectos-design.md`

## Global Constraints

- Sin dependencias npm en `server/`.
- Nunca devolver `null`: resultados como `{ ok: false, reason }` / `{ available: false }`.
- Token inválido o ausente → 404; sin `DOWNLOAD_TOKEN` la ruta no existe.
- Commits en español, imperativo, autoría Anomalydevs, sin metadatos de agente.
- Rate limit de descargas: 30 por IP por hora. Sync cada 15 minutos.

---

### Task 1: Parser de `latest.yml` y escritor ZIP

**Files:**
- Create: `server/downloads.mjs`
- Test: `server/downloads.test.mjs`

**Interfaces:**
- Produces: `parseLatestYml(text: string) → { ok: true, version, path, sha512, size, releaseDate } | { ok: false, reason }`;
  `writeZip(srcPath, entryName, outPath) → Promise<{ size: number }>`; `zipFileName(version) → string`.

- [ ] Prueba roja: parser con el `latest.yml` real del feed (versión 2.1.5, size 97585146), YAML vacío/incompleto → `ok: false`.
- [ ] Prueba roja: `writeZip` de un archivo de 300 KB aleatorio → el test lo lee con un lector mínimo (EOCD → directorio central → `inflateRawSync`) y compara bytes y CRC.
- [ ] Implementación mínima; verde; commit "Agrega parser del feed y escritor ZIP para descargas".

### Task 2: Espejo del instalador y rutas HTTP

**Files:**
- Modify: `server/downloads.mjs`, `server/index.mjs` (montar rutas + arranque de sync)
- Modify: `docker/Caddyfile` (`handle /descargas/*`), `docker-compose.yml` (env `DOWNLOAD_TOKEN`, `UPDATE_FEED_URL`), `DEPLOY.md`
- Test: `server/downloads.test.mjs`

**Interfaces:**
- Consumes: Task 1.
- Produces: `createInstallerMirror({ feedUrl, dataDir, fetchFn, logger }) → { sync(): Promise<{ changed: boolean }>, current(): Promise<Mirror> }`;
  `createDownloadRoutes({ mirror, token, rateLimiter }) → (req, res) => Promise<boolean>` (true si atendió la ruta).

- [ ] Pruebas rojas del espejo con `fetchFn` simulado: primera sync crea zip + manifest; segunda sync sin cambios no descarga; sha512 incorrecto → conserva copia previa y `changed:false`; dos `sync()` simultáneos → una sola descarga.
- [ ] Pruebas rojas de rutas: token correcto → 200 `application/zip` con `Content-Disposition` y bytes del zip; token incorrecto → 404; sin copia → 503; HEAD → cabeceras sin cuerpo; `/version` → JSON; rate limit → 429.
- [ ] Implementación; verde; Caddy/compose/DEPLOY; commit "Sirve el instalador de Terminal de Cobranza en un link fijo con token".

### Task 3: Tres proyectos nuevos

**Files:**
- Modify: `src/content/projects.ts`, `src/content/content.test.ts`
- Create: `src/assets/projects/terminal-marketing.*`, `venecia-sartoria.*`, `data-automatizacion.*`

- [ ] Prueba roja: `projects` tiene 7 entradas con ids `terminal-marketing`, `venecia-sartoria`, `data-automatizacion`.
- [ ] Contenido + imágenes; verde (suite completa) ; build; QA visual headless; commit "Agrega Terminal Marketing, Venecia Sartoria y Data & automatización a Proyectos".

### Task 4: Despliegue y verificación

- [ ] Generar token (32 bytes base64url) en `/opt/anomalydevs-landing/.env` del VPS, `git pull`, `docker compose up -d --build`.
- [ ] Esperar primera sync; `curl` a `/version` y descarga completa; verificar que el zip abre y el sha512 del .exe coincide con el feed.
- [ ] Entregar el link al usuario por chat (no se versiona).
