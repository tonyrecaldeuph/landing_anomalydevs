# ADR 2.3 — Descarga de Terminal Marketing desde el servidor de actualizaciones

**Fecha:** 2026-10-05 · **Estado:** Aceptado

## Contexto
La tarjeta «Terminal Marketing» (app de escritorio CRM Marketing Uphone) debía ofrecer su
instalador y una página de producto como TelegramProSend y SMS_RCS_PRO. Dos diferencias:
- El instalador NSIS pesa ~196 MB: no cabe en `public/files` (GitHub rechaza archivos > 100 MB)
  y engordaría la imagen Docker de la landing en cada versión.
- El producto no usa licencia: el acceso lo da el administrador del sistema creando el usuario.
  `ProductPage` tenía la sección «Activar la licencia» y el enlace «Solicitar licencia» fijos.

## Decisión
- El botón enlaza `https://crm.anomalydevs.qzz.io/updates/CRM%20Marketing%20Uphone%20Setup%20<versión>.exe`,
  el mismo origen del auto-update (`electron-builder.yml → publish.url`). Versión única en
  `TERMINAL_MARKETING_VERSION` (`src/content/projects.ts`); el nombre versionado evita la caché de 4 h.
- `ProductPageContent` reemplaza `licenseCtaHref/licenseSteps/licenseImage/licenseImageAlt` por un
  objeto `access` (`heading`, `ctaLabel`, `ctaHref`, `steps`, `image`, `imageAlt`). Licencia y
  usuario de administrador se pintan igual; solo cambian los textos, sin condicionales en la vista.
- Página nueva en `/productos/terminal-marketing/`, entrada multipágina de Vite.

## Consecuencias (trade-offs)
- **Mantenibilidad sobre autonomía:** la landing depende de que el servidor de updates del CRM esté arriba;
  a cambio, la versión descargada es siempre la misma que reciben las PCs por auto-update y no se versionan binarios en git.
- Publicar una versión nueva del CRM exige cambiar `TERMINAL_MARKETING_VERSION` y redeplegar la landing;
  si se olvida, se sigue descargando la anterior, que se autoactualiza al iniciar sesión.
- El instalador no está firmado: Windows SmartScreen avisa en la primera ejecución (documentado en la guía).

## Métricas
- **Big O:** sin impacto en runtime (constantes de build).
- **Big I:** I(1) por versión del CRM (cambiar la constante); I(0) para el usuario tras la primera instalación (auto-update).
