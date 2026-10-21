# ADR 20261021: Página y descarga de WhatsAppProSend

## Contexto

La landing ya publica TelegramProSend, SMS_RCS_PRO, Terminal Marketing y Mailer Pro. WhatsAppProSend usa el mismo componente `ProductPage`, pero su canal es distinto: app nativa de WhatsApp por ADB, varias cuentas por teléfono, cuota diaria y solo texto. El producto necesita una tarjeta en Proyectos, una ruta multipágina y un zip versionado propio.

## Decisión

1. Publicar `WhatsAppProSend` con slug `whatsappprosend`, id de proyecto `whatsapp-pro-send` y zip `WhatsAppProSend-1.1.4.zip`.
2. Reutilizar `ProductPage` y `projects.ts`; no duplicar el componente.
3. Añadir el estado `Sin WhatsApp` a `STATUS_ICONS` para que los resultados tengan icono propio.
4. Usar seis capturas propias y simular el WebSocket del puente en el arnés para la escena de cuentas; se omite la captura de progreso en vivo porque el resumen y el historial ya muestran los resultados.
5. Mantener la descarga pública sin token, igual que los otros productos, y enlazar la solicitud de licencia a `/#contacto`.
6. Advertir en la página que el envío masivo por la app nativa puede violar las condiciones de uso de WhatsApp y bloquear el número.

## Consecuencias

- Positivo: el producto queda con el mismo formato de página, card, tests y deploy que los demás.
- Positivo: el zip versionado evita la caché de Cloudflare y no hay alias viejo que mantener, porque el producto debuta con esta versión.
- Positivo: los tests fijan la ruta, el HTML, los metadatos y los enlaces de descarga.
- Negativo: la landing gana ~494 KB de binario y seis PNG.
- Negativo: la guía de uso tiene seis pasos y uno sin captura; se compensa con el resumen y el historial.
- Negativo: el mock WebSocket del arnés de capturas debe actualizarse si cambia el protocolo del puente.
- Trade-off: se prioriza una página honesta sobre los límites del producto antes que prometer imágenes o pausas que esta versión no ofrece.

## Métricas

- Big O: `projects.map` y las búsquedas por id son O(n) con n=9; el render de la página es O(cantidad de bloques de contenido).
- Big I: publicar una nueva versión requiere actualizar `WHATSAPP_PRO_VERSION` y reemplazar el zip. El usuario final descarga e instala con I(0) adicional: un clic y el instalador incluido.
