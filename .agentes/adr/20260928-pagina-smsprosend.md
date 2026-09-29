# ADR 2.3 — Página de descarga SMS_RCS_PRO_V3.0 idéntica a TelegramProSend

- **Fecha:** 2026-09-28
- **Estado:** Aceptado

## Contexto

La landing ya publica TelegramProSend en `/productos/telegramprosend/` con componente
genérico `ProductPage` + contenido `src/content/products/telegramProSend.ts` + entrada
multipágina Vite + ZIP público en `public/files/TelegramProSend.zip`. Se pide replicar
idéntico formato para la versión SMS PRO V3.0 (nombre oficial `SMS_RCS_PRO_V3.0`,
manifest `RCS PRO - Campañas Masivas` v3.0.0, canal Google Messages + canal ADB por USB,
promociones, variantes, programación y reportes CSV/Excel), con slug
`/productos/smsprosend/` y descarga `/files/SmsProSend.zip` generada desde la carpeta
`SMS PRO V3.0`.

## Decisión

1. Reutilizar el componente genérico `ProductPage` sin duplicar markup ni CSS; solo se
   agrega contenido nuevo `src/content/products/smsProSend.ts` con la misma interfaz
   `ProductPageContent` (6 features, 6 usageSteps con captura, instalación con
   `chrome://extensions`, descarga y `licenseCtaHref: '/#contacto'`).
2. Nueva entrada multipágina: `productos/smsprosend/index.html` (título, metadatos y
   canonical propios) + `src/pages/ProductPage/main-sms.tsx` que monta
   `smsProSendPage`. `main.tsx` de Telegram queda intacto.
3. Registrar `smsprosend` en `vite.config.ts` junto a `telegramprosend`.
4. Actualizar `src/content/projects.ts` (`sms-pro`): `download` a
   `/files/SmsProSend.zip` y `caseHref` a `/productos/smsprosend/`.
5. Extender `STATUS_ICONS` en `ProductPage.tsx` solo de forma aditiva
   (`Omitido`, `RCS`, `SMS`, `Duplicado`); los iconos existentes no cambian.
6. Capturas `src/assets/products/sms-pro-send/01..07.png`: reutilizar como placeholder
   las capturas de Telegram hasta publicar las reales de SMS; se documenta como deuda.
7. ZIP `public/files/SmsProSend.zip` como espejo total de la carpeta `SMS PRO V3.0`
   con prefijo `SmsProSend/` (incluye `native-launcher`, `adb-bridge-server` con su
   `node_modules/ws`, `channels` con fixtures y pruebas, `docs`, `ui`, `assets` y
   raíz; más `INSTALACION.txt` generada). Única exclusión: `.git.bak` (respaldo de
   control de versiones, no parte del producto; mismo criterio `.git` del
   empaquetador de Telegram).

## Consecuencias (trade-offs)

- **+ Simplicidad/mantenibilidad:** un solo componente y CSS para N productos; agregar
  otro producto es solo contenido + entrada Vite (escalabilidad lineal sin bifurcar UI).
- **− Acoplamiento leve:** `smsProSend.ts` reutiliza el tipo `ProductPageContent`
  declarado en `telegramProSend.ts`; compromiso aceptado frente a duplicar 5 interfaces
  idénticas (léxico unívoco: un solo concepto de contenido de producto).
- **+ Riesgo acotado:** `main-sms.tsx` aísla el montaje; Telegram no se toca y sus
  pruebas siguen verdes.
- **− Fidelidad temporal:** placeholders de capturas hasta tener las 7 reales de SMS;
  el layout queda idéntico pero las imágenes se reemplazan sin cambiar código.

## Métricas

- **Big O:** render de la página O(s) con s = secciones fijas (7); build Vite O(m) con
  m = módulos (una entrada más, sin cambio de clase). ZIP O(f) con f = archivos incluidos.
- **Big I:** I(0) para el visitante (descarga directa pública); despliegue I(1):
  `git pull && docker compose up -d --build` en el VPS. Publicar nueva versión del ZIP:
  reemplazar `public/files/SmsProSend.zip` y redeplegar.
