import type { ProductPageContent } from './telegramProSend';
import { projects, SMS_PRO_VERSION, SMS_PRO_ZIP_NAME } from '../projects';
import contactosImage from '../../assets/products/sms-pro-send/01-contactos.png';
import mensajeImage from '../../assets/products/sms-pro-send/02-mensaje.png';
import opcionesImage from '../../assets/products/sms-pro-send/03-opciones.png';
import resultadosImage from '../../assets/products/sms-pro-send/04-resultados.png';
import resumenImage from '../../assets/products/sms-pro-send/05-resumen.png';
import historialImage from '../../assets/products/sms-pro-send/06-historial.png';
import licenciaImage from '../../assets/products/sms-pro-send/07-licencia.png';

const smsProject = projects.find((project) => project.id === 'sms-pro');

function resolveDownload(): { href: string; label: string; note: string } {
  if (smsProject?.download) {
    return smsProject.download;
  }
  return { href: `/files/${SMS_PRO_ZIP_NAME}`, label: 'Descargar', note: `v${SMS_PRO_VERSION} · Requiere licencia` };
}

export const smsProSendPage: ProductPageContent = {
  slug: 'smsprosend',
  name: 'SMS_RCS_PRO',
  kicker: 'Extensión de Chrome · SMS/RCS',
  tagline: 'Campañas masivas SMS y RCS desde tu navegador.',
  summary:
    'SMS_RCS_PRO es una extensión para Chrome que envía mensajes masivos de campaña ' +
    'a través de Google Messages, con doble canal Web y ADB, promociones, historial y ' +
    'reportes exportables. La campaña sigue en segundo plano: puedes minimizar la ventana ' +
    'o cerrar el panel, solo deja la pestaña de Google Messages abierta.',
  download: resolveDownload(),
  features: [
    {
      title: 'SMS y RCS en un solo canal',
      text: 'Google Messages detecta solo si el destino soporta RCS o SMS tradicional; la extensión no necesita distinguir.',
    },
    {
      title: 'Doble canal Web y ADB',
      text: 'Envía por la pestaña de Chrome (Web) o reparte la campaña entre teléfonos físicos por USB con el puente ADB en ws://localhost:8765.',
    },
    {
      title: 'Promociones y variantes',
      text: 'Guarda promociones reutilizables, suma variantes que rotan al azar y usa variables {{Columna}} con spin {opción1|opción2}.',
    },
    {
      title: 'Control anti-spam',
      text: 'Eliminación de duplicados, intervalos aleatorios entre envíos (6–20 s) y mensajes únicos por contacto.',
    },
    {
      title: 'Historial con «Retomar envío» y programación',
      text: 'Cada campaña queda guardada con su desglose; retoma solo los pendientes o programa fecha y hora con alarmas.',
    },
    {
      title: 'Reportes CSV y Excel en vivo',
      text: 'Sigue cada fila como Pendiente, Enviando, Enviado, Error u Omitido y exporta a CSV o Excel al finalizar.',
    },
  ],
  requirements: [
    'Google Chrome actualizado (también funciona en navegadores basados en Chromium como Microsoft Edge o Brave).',
    'Sesión iniciada en https://messages.google.com/ con el teléfono Android vinculado.',
    'Clave de licencia de SMS_RCS_PRO provista por AnomalyDevs.',
  ],
  installSteps: [
    `Descomprime ${SMS_PRO_ZIP_NAME} en una carpeta fija de tu computador (por ejemplo, Documentos/SmsProSend). No borres ni muevas esa carpeta después, porque Chrome la usa cada vez.`,
    'Abre en Chrome la dirección chrome://extensions',
    'Activa arriba a la derecha la opción «Modo de desarrollador».',
    'Pulsa el botón «Cargar descomprimida» (Load unpacked).',
    'Elige la carpeta donde descomprimiste el archivo: debe ser la que contiene manifest.json. Pulsa «Seleccionar carpeta».',
    'La extensión quedará instalada. Pulsa el icono de piezas (Extensiones) en la barra de Chrome y fija SMS_RCS_PRO para tenerla siempre a la vista.',
  ],
  access: {
    heading: 'Activar la licencia',
    ctaLabel: 'Solicitar licencia',
    ctaHref: '/#contacto',
    steps: [
      'Pulsa el icono de SMS_RCS_PRO en la barra de Chrome.',
      'Abre la sección «Licencia».',
      'Pega tu clave (formato parecido a ANOMALYDEVS-XXXX-XXXX-XXXX).',
      'Pulsa «Activar». Sin licencia válida no se pueden enviar campañas.',
    ],
    image: licenciaImage,
    imageAlt: 'Ventana de licencia de SMS_RCS_PRO con el campo de clave y el botón Activar',
  },
  usageSteps: [
    {
      title: 'Importa tus contactos',
      text: 'Abre https://messages.google.com/ y comprueba que tu teléfono está vinculado. Luego abre la extensión y carga tu lista con «Importar contactos» (Excel .xlsx/.xls con columna de teléfono de 7 a 15 dígitos; los números 09XXXXXXXX se convierten solos a +593).',
      image: contactosImage,
      imageAlt: 'Lista de contactos importados en el panel de SMS_RCS_PRO',
    },
    {
      title: 'Redacta el mensaje y la promoción',
      text: 'Escribe el texto con variables {{Columna}} y spin {a|b}, suma variantes con «Añadir variante» y guarda la plantilla con «Guardar Promoción». Si quieres, adjunta una imagen con «Seleccionar imagen».',
      image: mensajeImage,
      imageAlt: 'Editor del mensaje con promociones, variantes y botón para seleccionar imagen',
    },
    {
      title: 'Configura las opciones y el canal',
      text: 'Activa eliminación de duplicados y aleatorización, define el tiempo mínimo y máximo entre envíos (6 y 20 segundos por defecto) y elige el canal Web (Google Messages) o ADB (teléfonos USB).',
      image: opcionesImage,
      imageAlt: 'Opciones de envío con tiempos mínimo y máximo y selector de canal Web o ADB',
    },
    {
      title: 'Envía y sigue el avance en vivo',
      text: 'Pulsa «Enviar ahora» y observa cada fila marcarse como Enviado, Error u Omitido en tiempo real, con el HUD flotante y el porcentaje en el icono.',
      image: resultadosImage,
      imageAlt: 'Avance en vivo de la campaña con filas marcadas por estado',
    },
    {
      title: 'Revisa el resumen y exporta',
      text: 'Al terminar verás el modal «Campaña Finalizada» con el conteo de RCS, SMS y Omitidos/Error, más los botones para descargar CSV o Excel y «Retomar envío».',
      image: resumenImage,
      imageAlt: 'Modal de campaña finalizada con conteo por canal y botones de descarga',
    },
    {
      title: 'Consulta el historial, retoma o programa',
      text: 'Cada campaña queda en el historial con su desglose. Si hubo errores, pulsa «Retomar envío» para reintentar solo los pendientes, o programa la próxima con fecha y hora.',
      image: historialImage,
      imageAlt: 'Historial de campañas con desglose por estado y botones de exportación',
    },
  ],
  results: [
    {
      status: 'Enviado',
      text: 'Marca verde: el mensaje salió como RCS o SMS según el destino. Google Messages lo resolvió solo.',
    },
    {
      status: 'Omitido',
      text: 'Círculo gris: duplicado o fila sin teléfono válido. No se reintenta.',
    },
    {
      status: 'Error',
      text: 'Cruz roja: no se pudo enviar. Usa «Retomar envío» desde el Historial para reintentar solo los pendientes.',
    },
  ],
  tips: [
    'Usa intervalos prudentes entre envíos (6 a 20 segundos): enviar muy rápido puede provocar bloqueos del operador.',
    'No abras Google Messages en dos pestañas o ventanas a la vez durante la campaña.',
    'No cierres la pestaña de Google Messages ni desvincules el teléfono mientras se envía; el banner amarillo del debugger es normal.',
  ],
  faq: [
    {
      question: '«No se conecta» u «Offline»',
      answer:
        'Comprueba que https://messages.google.com/ está abierto con tu teléfono vinculado. Recarga esa pestaña y vuelve a abrir la extensión.',
    },
    {
      question: '«La extensión dice que no hay licencia»',
      answer:
        'Revisa que pegaste la clave completa y pulsa Activar. Comprueba tu conexión a internet.',
    },
    {
      question: '«Muchos errores de envío»',
      answer:
        'Revisa tu conexión, evita cerrar la pestaña de Google Messages, verifica que el teléfono sigue vinculado y aumenta el tiempo entre envíos.',
    },
    {
      question: '«No encuentro la carpeta tras instalar»',
      answer:
        'Recuerda en qué carpeta descomprimiste el zip: Chrome la necesita siempre, no la borres ni la muevas.',
    },
  ],
  supportEmail: 'anomalydevsec@gmail.com',
};
