# Link fijo de descarga de Terminal de Cobranza + ampliación de Proyectos

## 1. Descarga fija del instalador (solo personal Uphone)

### Objetivo

Una URL que no cambia, `https://anomalydevs.qzz.io/descargas/terminal-cobranza/<token>`, que
siempre entrega la última versión publicada del instalador, comprimida en .zip, sin pasos
manuales por release.

### Fuente de verdad

El feed de `electron-updater` que ya existe: `https://api.anomalydevs.qzz.io/updates/latest.yml`.
Publicar una versión en el feed (flujo actual del runbook de terminal-cobranza) actualiza el link
por sí solo. El link nunca publica nada en el feed.

### Componentes (API del VPS, `server/downloads.mjs`, sin dependencias npm)

- `parseLatestYml(text)` → `{ ok: true, version, path, sha512, size, releaseDate }` o
  `{ ok: false, reason }` (Caso Especial, sin null).
- `writeZip(srcPath, entryName, outPath)` → ZIP de una entrada, deflate en streaming,
  descriptor de datos, CRC32 con `zlib.crc32`. Memoria O(1) respecto al tamaño del .exe.
- `createInstallerMirror({ feedUrl, dataDir, fetchFn, logger })`:
  - `sync()`: lee `latest.yml`; si la versión ya está espejada no hace nada; si no, descarga el
    .exe a un temporal, verifica tamaño y sha512 contra el manifiesto, lo comprime, escribe
    `manifest.json` de forma atómica y borra zips anteriores. Syncs concurrentes se colapsan en
    uno. Cualquier fallo deja intacta la copia anterior.
  - `current()`: `{ available: true, version, zipFile, size, releaseDate }` o
    `{ available: false }`.
- Rutas:
  - `GET|HEAD /descargas/terminal-cobranza/<token>` → zip como adjunto
    (`Terminal-Cobranza-v<versión>.zip`).
  - `GET /descargas/terminal-cobranza/<token>/version` → JSON con versión y fecha.
  - Token inválido o ausente → 404 (no revela que la ruta existe). Comparación en tiempo
    constante. Sin `DOWNLOAD_TOKEN` configurado, la ruta no existe.
  - Todavía sin copia → 503 con mensaje en español.
  - Límite de 30 descargas por IP por hora.
- Sync al arrancar y cada 15 minutos.
- Caddy del contenedor enruta `/descargas/*` a la API. Variables nuevas en compose:
  `DOWNLOAD_TOKEN`, `UPDATE_FEED_URL`.

### Trade-offs

- **+** Big I = 0 por release; integridad verificada (sha512 del propio feed); el link sobrevive a
  caídas del feed con la última copia buena.
- **−** ~100 MB en disco del VPS por versión (solo se conserva la vigente); el link tarda hasta
  15 min en reflejar una release.
- **−** Token en URL: quien reciba el link puede reenviarlo. Mitigación: rotación del token en
  `.env` + rate limit. Si se requiere identidad por persona, migrar a Cloudflare Access.

## 2. Proyectos

Se agregan tres tarjetas a las cuatro actuales, basadas en los repos de `DESARROLLOS_UPHONE`:

- **Terminal Marketing** — campañas masivas SMS, WhatsApp y Email; Electron + React +
  SQLite/PostgreSQL.
- **Venecia Sartoria** — e-commerce de lujo trilingüe (es/en/it), Medusa v2, pagos Payphone,
  reservas bespoke.
- **Data & automatización** — ETL SAP→PostgreSQL (modelo estrella)→Power BI, robot de descarga
  diaria del ERP, auditoría de plazos de aperturas, campañas por Telegram.

Imágenes: capturas reales de cada repo; si no existen, se generan del propio producto.
La tarjeta de Terminal de Cobranza no muestra el link (es interno).

## Pruebas

TDD en `server/downloads.test.mjs`: parser, zip (verificado con lector propio + CRC), mirror con
fetch simulado (primera sync, sync idempotente, sha512 inválido conserva la copia previa,
concurrencia), rutas (token válido/inválido, 503, HEAD, rate limit). Contenido: pruebas de
`content.test.ts` y `Projects.test.tsx` cubren las 7 tarjetas.
