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

## Despliegues siguientes

```bash
ssh root@185.208.207.154
cd /opt/anomalydevs-landing
git pull
docker compose up -d --build
```

No hace falta volver a tocar el Caddyfile ni el `restart` de Caddy — solo la primera vez
(el bloque de sitio ya queda permanente en `/etc/caddy/Caddyfile`, fuera del repo).
