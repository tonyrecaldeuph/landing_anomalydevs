# Zip versionado de TelegramProSend — Plan de implementación

> **Para agentes:** TDD estricto (Rojo → Verde → Refactor). Casillas `- [ ]`.

**Objetivo:** que la landing enlace `TelegramProSend-<versión>.zip` en vez de `TelegramProSend.zip`, para que la caché de 4 h de Cloudflare sobre `/files/*` no siga sirviendo la versión anterior tras cada release (ya pasó el 2026-10-13 con 1.1.3).

**Arquitectura:** mismo patrón ya usado por SMS_RCS_PRO (`SMS_PRO_VERSION` / `SMS_PRO_ZIP_NAME` en `src/content/projects.ts`): una constante de versión de la que salen el enlace, la nota `v<versión> · Requiere licencia` y el paso de instalación. `TelegramProSend.zip` se mantiene como alias para enlaces viejos ya compartidos.

**Stack:** React + TypeScript + Vitest (`npx vitest run`), build `npm run build`.

## Restricciones globales

- Versión publicada: `1.1.3`. Nombre: `TelegramProSend-1.1.3.zip`.
- El archivo `public/files/TelegramProSend-1.1.3.zip` YA está copiado en el árbol (sin trackear; es idéntico a `TelegramProSend.zip`). Se agrega con `git add -f` como hace DEPLOY.md con SMS.
- No borrar `public/files/TelegramProSend.zip` (alias para enlaces viejos).
- No tocar los productos SMS, MailerPro ni Terminal Marketing.
- Commits en español, imperativo, sin menciones a IA.

---

### Tarea 1: Constantes y enlaces versionados

**Archivos:** `src/content/projects.ts`, `src/content/products/telegramProSend.ts`, y los tests que hoy fijan `/files/TelegramProSend.zip`: `src/content/content.test.ts:47-52`, `src/content/products/telegramProSend.test.ts:52`, `src/components/Projects/Projects.test.tsx:64`, `src/pages/ProductPage/ProductPage.test.tsx:25`.

**Produce:** `export const TELEGRAM_PRO_VERSION = '1.1.3';` y `export const TELEGRAM_PRO_ZIP_NAME = \`TelegramProSend-${TELEGRAM_PRO_VERSION}.zip\`;` en `projects.ts`, justo antes del bloque de SMS, con un comentario de 2 líneas que remita a la regla de SMS (caché de Cloudflare) y diga que `TelegramProSend.zip` queda como alias.

- [ ] **Paso 1 (rojo):** cambiar los tests para que esperen:
  - `content.test.ts`: `telegram?.download?.href` = `'/files/TelegramProSend-1.1.3.zip'`, y que exista `public/files/TelegramProSend-1.1.3.zip` con firma `PK`. Agregar además que el alias `public/files/TelegramProSend.zip` siga existiendo con firma `PK`.
  - `telegramProSend.test.ts`: `download.href` = `'/files/TelegramProSend-1.1.3.zip'`, `download.note` = `'v1.1.3 · Requiere licencia'`, y que algún `installSteps` contenga `'TelegramProSend-1.1.3.zip'`.
  - `Projects.test.tsx` y `ProductPage.test.tsx`: href del enlace de descarga = `'/files/TelegramProSend-1.1.3.zip'`.
- [ ] **Paso 2:** `npx vitest run` → fallan exactamente esos tests.
- [ ] **Paso 3 (verde):**
  - `projects.ts`: constantes de arriba; la entrada `telegram-pro-send` pasa a `download: { href: \`/files/${TELEGRAM_PRO_ZIP_NAME}\`, label: 'Descargar', note: \`v${TELEGRAM_PRO_VERSION} · Requiere licencia\` }`.
  - `telegramProSend.ts`: importar las constantes; el fallback de `resolveDownload()` igual que el de `smsProSend.ts`; el primer `installSteps` pasa a template string con `${TELEGRAM_PRO_ZIP_NAME}` (como en `smsProSend.ts:63`).
- [ ] **Paso 4:** `npx vitest run` todo en verde y `npm run build` sin errores.
- [ ] **Paso 5:** `git add -f public/files/TelegramProSend-1.1.3.zip` + archivos tocados. Commit `Publica TelegramProSend con zip versionado para evitar la caché de Cloudflare`.

### Tarea 2: DEPLOY.md

**Archivo:** `DEPLOY.md` (sección de `/files/`, ~líneas 118-131).

- [ ] **Paso 1:** en la lista de URLs, cambiar `TelegramProSend.zip` por `TelegramProSend-1.1.3.zip`; reemplazar la frase "Para actualizar TelegramProSend se reemplaza `public/files/TelegramProSend.zip` y se redepliega." por una sección `### TelegramProSend — zip versionado` con los mismos 4 pasos que la de SMS_RCS_PRO, adaptados: subir `version` en `manifest.json` del repo `Campañas_telegram` y correr `npm run empaquetar` (sale `dist/TelegramProSend.zip`); cambiar `TELEGRAM_PRO_VERSION`; copiar el zip a `public/files/` con ambos nombres (`TelegramProSend-<versión>.zip` y el alias `TelegramProSend.zip`) con `git add -f`; redeploy. Mencionar también `npm run capturas` para regenerar las capturas de la página de producto.
- [ ] **Paso 2:** commit `Documenta la publicación versionada de TelegramProSend`.
