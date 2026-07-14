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

## Despliegues siguientes

```bash
ssh root@185.208.207.154
cd /opt/anomalydevs-landing
git pull
docker compose up -d --build
```

No hace falta volver a tocar el Caddyfile ni el `restart` de Caddy — solo la primera vez
(el bloque de sitio ya queda permanente en `/etc/caddy/Caddyfile`, fuera del repo).
