# ADR — Página de producto y descarga de MailerPro

**Fecha:** 2026-10-05 · **Estado:** aceptada

## Contexto

MailerPro (extensión de Chrome que envía por la Gmail API) se publica igual que
TelegramProSend y SMS_RCS_PRO: zip en `/files/` y página en `/productos/<slug>/`.
La tarjeta existente describía la versión vieja sobre Google Apps Script.

## Decisión

- Página `/productos/mailerpro/` con el componente genérico `ProductPage` y
  contenido en `src/content/products/mailerPro.ts`.
- Zip versionado `MailerPro-3.3.0.zip` desde el primer día (caché de 4 h de
  Cloudflare). Sin copia con nombre fijo: no hay enlaces viejos que sostener.
- Capturas tomadas de la UI real de la extensión 3.3.0 con datos de demo
  ficticios y `chrome.*` simulado; ninguna cuenta real ni envío real.
- La página indica activar la licencia **antes** de conectar Gmail, porque la
  extensión 3.3.0 no abre el consentimiento de Google sin licencia (protege el
  cupo de 100 consentimientos de por vida de la app OAuth sin verificar).

## Consecuencias (trade-offs)

- Simplicidad: se reutiliza el componente y el flujo de despliegue existentes.
- Mantenibilidad: la versión vive en `MAILER_PRO_VERSION`; publicar otra exige
  cambiarla, copiar el zip nuevo y ajustar los tests que fijan la versión.
- Las capturas no se regeneran solas si cambia la UI.

## Métricas

- **Big O:** sin impacto en runtime (página estática).
- **Big I:** publicar una versión nueva = zip + constante + PR + deploy, I(4).
