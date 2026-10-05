# ADR 2.3 — Zip versionado para la descarga de SMS_RCS_PRO_V3.0

**Fecha:** 2026-10-05 · **Estado:** Aceptado

## Contexto
Tras publicar la versión con aislamiento de teléfonos ADB, una PC distinta seguía descargando
la anterior: Cloudflare cachea `/files/SmsProSend.zip` 4 h (`max-age=14400`, `cf-cache-status: HIT`)
y el navegador también. Sin acceso para purgar la caché de Cloudflare.

## Decisión
- La descarga enlaza `/files/SmsProSend-<versión>.zip`; versión única en `SMS_PRO_VERSION`
  (`src/content/projects.ts`), de la que derivan enlace, nota `v<versión> · Requiere licencia`
  y paso de instalación.
- `SmsProSend.zip` se mantiene con el mismo contenido solo para enlaces antiguos.
- La extensión lleva la misma versión en `manifest.json` (3.0.1).

## Consecuencias (trade-offs)
- **Confiabilidad sobre simplicidad:** cada versión es una URL nueva, nunca servida desde caché vieja,
  sin depender de purgas manuales. A cambio, cada entrega exige cambiar una constante y los tests que la fijan.
- El repo acumula un zip por versión si no se borran los anteriores (~560 KB cada uno).
- El alias `SmsProSend.zip` puede quedar viejo hasta 4 h en caché.

## Métricas
- **Big O:** sin impacto en runtime (constante de build).
- **Big I:** I(1) por entrega (cambiar `SMS_PRO_VERSION`); I(0) para el usuario final, que siempre recibe la versión vigente.
