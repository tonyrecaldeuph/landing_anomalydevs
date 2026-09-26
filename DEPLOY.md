# Despliegue — AnomalyDevs Landing

## Infraestructura

- **VPS:** `185.208.207.154` (hostname `vmi3404429`), Ubuntu 24.04, Docker + Docker Compose v5 ya instalados.
- **Dominio:** `anomalydevs.qzz.io`, DNS detrás de Cloudflare (Cloudflare termina el HTTPS de cara al visitante; el origen en el VPS sirve HTTP plano, mismo patrón que el resto de servicios de este VPS).
- **Proxy reverso del sistema:** Caddy corre como servicio systemd (`/etc/caddy/Caddyfile`), ya gestionando el gateway de UPHONE (`/hermes`, `/web`, `/`). Este proyecto se agrega como un bloque de sitio adicional — **no se modifican los bloques existentes**.
- **La app** corre containerizada (`docker-compose.yml` en la raíz del repo), publicada solo en `127.0.0.1:8643` (no expuesta directo a internet, igual que el resto de contenedores en este VPS). Caddy hace `reverse_proxy` desde el dominio hacia ese puerto.
- **Repo:** https://github.com/tonyrecaldeuph/landing_anomalydevs — clonado en el VPS en `/opt/anomalydevs-landing`.

## Primer despliegue (una sola vez, cuando ya exista código de la app para construir)

```bash
ssh root@185.208.207.154
cd /opt/anomalydevs-landing
git pull
docker compose up -d --build
```

Verificar que el contenedor responde localmente:

```bash
curl -sI http://127.0.0.1:8643/
```

Agregar este bloque a `/etc/caddy/Caddyfile` (sin tocar los bloques existentes de `/hermes`, `/web`, `/`):

```
http://anomalydevs.qzz.io {
	reverse_proxy 127.0.0.1:8643
}
```

Recargar Caddy:

```bash
systemctl restart caddy
```

> **Nota:** `systemctl reload caddy` **falla** en este VPS (`Error: sending configuration to
> instance: ... dial tcp [::1]:2019: connect: connection refused`) porque el Caddyfile global
> tiene `admin off`, y `reload` depende de la admin API para aplicar la config en caliente. Con
> `admin off` la única forma de aplicar cambios es un `restart` completo — el proceso viejo sigue
> sirviendo tráfico hasta que el nuevo termina de arrancar, así que el corte es sub-segundo, pero
> **afecta a todos los sitios** de este Caddy (incluido el gateway de UPHONE), no solo este
> proyecto. Confirmado en producción 2026-07-14.

## Backend de contacto (`/api`)

Desde 2026-07-31 el compose levanta **dos** servicios: `landing` (estático, Caddy) y `api`
(Node 20, `server/index.mjs`, sin dependencias npm). El Caddy del contenedor enruta
`/api/*` hacia `api:3000`; nada cambia en el Caddy del sistema ni en los puertos expuestos.

- Los leads del formulario se guardan **siempre** en el volumen `api-data`
  (`/data/leads.jsonl` dentro del contenedor `anomalydevs-api`). Verlos:
  `docker exec anomalydevs-api cat /data/leads.jsonl`
- La notificación por Telegram se activa creando `/opt/anomalydevs-landing/.env`
  (NO se versiona; ya está en `.gitignore`):

```
TELEGRAM_BOT_TOKEN=<token de @BotFather>
TELEGRAM_CHAT_ID=<chat id de @userinfobot>
```

  Tras crear o cambiar `.env`: `docker compose up -d` (recrea `api` con las nuevas vars).
  Sin `.env` el backend funciona igual, solo que sin notificación.

Verificación post-deploy:

```bash
curl -s http://127.0.0.1:8643/api/health        # → {"ok":true}
curl -s -X POST http://127.0.0.1:8643/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Prueba","email":"prueba@example.com","message":"Test de deploy"}'
```

## Link fijo de descarga de Terminal de Cobranza (`/descargas`)

Desde 2026-09-25 la API espeja el instalador que publica el feed de `electron-updater`
(`https://api.anomalydevs.qzz.io/updates/latest.yml`), verifica su sha512, lo comprime en
`Terminal-Cobranza-v<versión>.zip` y lo sirve en una URL que no cambia:

```
https://anomalydevs.qzz.io/descargas/terminal-cobranza/<DOWNLOAD_TOKEN>
https://anomalydevs.qzz.io/descargas/terminal-cobranza/<DOWNLOAD_TOKEN>/version   # JSON
```

- **Actualización automática:** al publicar una versión en el feed (runbook de
  terminal-cobranza), el link la entrega en ≤ 15 min. No hay paso extra.
- **Acceso:** solo personal Uphone. Sin el token correcto la ruta responde 404. Límite de 30
  descargas por IP por hora.
- **Configuración** en `/opt/anomalydevs-landing/.env` (no se versiona):

```
DOWNLOAD_TOKEN=<32 bytes aleatorios en base64url>
# UPDATE_FEED_URL=https://api.anomalydevs.qzz.io/updates/   # opcional, este es el valor por defecto
```

  Generar un token: `openssl rand -base64 32 | tr '+/' '-_' | tr -d '='`.
  **Rotar** (si el link se filtra): cambiar `DOWNLOAD_TOKEN` y `docker compose up -d`.
  Sin `DOWNLOAD_TOKEN` la ruta no existe y no se descarga nada.
- **Archivos:** volumen `api-data`, carpeta `/data/descargas/` (solo se conserva la versión
  vigente). Logs: `docker logs anomalydevs-api | grep descargas`.
- **Fijar un instalador local** (cuando el build bueno aún no está en el feed). Desde la PC con
  el instalador:

```bash
scp "terminal-cobranza/dist/Terminal de Cobranza Setup 3.1.6.exe" root@185.208.207.154:/tmp/setup.exe
ssh root@185.208.207.154 'docker cp /tmp/setup.exe anomalydevs-api:/tmp/setup.exe   && docker exec anomalydevs-api node server/pin-installer.mjs /tmp/setup.exe 3.1.6   && docker exec anomalydevs-api rm /tmp/setup.exe && rm /tmp/setup.exe'
```

  El link sirve `Terminal-Cobranza-v3.1.6.zip` al instante. La decisión de reemplazo es por
  **hash del build del feed**, no por número de versión: mientras el feed siga publicando el
  mismo build, se respeta lo fijado; en cuanto el feed publique un build distinto, el link lo
  toma automáticamente. Requiere que el feed esté accesible al fijar (se registra su build).

## Descargas públicas

Los archivos en `public/files/` se publican tal cual en el build (Vite los copia a
`dist/files/`) y el Caddy del contenedor los sirve estáticos (`/files/...` cae en el
`handle` genérico con `file_server`), sin pasar por la API:

```
https://anomalydevs.qzz.io/files/TelegramProSend.zip
```

A diferencia de `/descargas/*`, que va a la API con token y límite por IP, estas
descargas son públicas y sin control de acceso. Para actualizar TelegramProSend se
reemplaza `public/files/TelegramProSend.zip` y se redepliega.

## Páginas de producto

Además de la home inmersiva (`/`), el repo genera páginas de producto estáticas con la
configuración multipágina de Vite (`build.rollupOptions.input` en `vite.config.ts`).
Cada página vive en su propia ruta bajo `/productos/<slug>/`:

```
https://anomalydevs.qzz.io/productos/telegramprosend/
```

- **Entradas:** `productos/<slug>/index.html` (HTML propio con su `<script type="module">`)
  y `src/pages/ProductPage/main.tsx` (monta el componente con su contenido). La página de
  producto no carga la escena 3D ni la navegación de la home, y usa su propio CSS de
  desplazamiento en vez de `src/styles/global.css` (que fija `body { overflow: hidden }`).
- **Servido:** el Caddy del contenedor sirve `dist/` estático (`file_server`), así que
  `dist/productos/<slug>/index.html` responde la ruta sin tocar la API ni el Caddy del
  sistema. Verificar tras el build: `dist/productos/<slug>/index.html` existe.
- **Contenido:** `src/content/products/<slug>.ts` (datos) + `src/pages/ProductPage/`
  (componente genérico por props). El "Ver caso" de la tarjeta correspondiente apunta a
  la página mediante el campo `caseHref` del proyecto en `src/content/projects.ts`.
- **Agregar otra página:** duplica `productos/<slug>/index.html` (ajusta título, metadatos
  y canonical), crea su módulo en `src/content/products/`, registra la entrada en
  `vite.config.ts` y fija `caseHref` en su proyecto. Redepliega normal (`git pull` +
  `docker compose up -d --build`).

## Despliegues siguientes

```bash
ssh root@185.208.207.154
cd /opt/anomalydevs-landing
git pull
docker compose up -d --build
```

No hace falta volver a tocar el Caddyfile ni el `restart` de Caddy — solo la primera vez
(el bloque de sitio ya queda permanente en `/etc/caddy/Caddyfile`, fuera del repo).
