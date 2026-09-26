import { projects } from '../projects';
import contactosImage from '../../assets/products/telegram-pro-send/01-contactos.png';
import mensajeImage from '../../assets/products/telegram-pro-send/02-mensaje.png';
import opcionesImage from '../../assets/products/telegram-pro-send/03-opciones.png';
import resultadosImage from '../../assets/products/telegram-pro-send/04-resultados.png';
import resumenImage from '../../assets/products/telegram-pro-send/05-resumen.png';
import historialImage from '../../assets/products/telegram-pro-send/06-historial.png';
import licenciaImage from '../../assets/products/telegram-pro-send/07-licencia.png';

export interface ProductFeature {
  title: string;
  text: string;
}

export interface ProductUsageStep {
  title: string;
  text: string;
  image?: string;
  imageAlt?: string;
}

export interface ProductResult {
  status: string;
  text: string;
}

export interface ProductFaq {
  question: string;
  answer: string;
}

export interface ProductPageContent {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  download: { href: string; label: string; note: string };
  licenseCtaHref: string;
  features: ProductFeature[];
  requirements: string[];
  installSteps: string[];
  licenseSteps: string[];
  licenseImage: string;
  licenseImageAlt: string;
  usageSteps: ProductUsageStep[];
  results: ProductResult[];
  tips: string[];
  faq: ProductFaq[];
  supportEmail: string;
}

const telegramProject = projects.find((project) => project.id === 'telegram-pro-send');

function resolveDownload(): { href: string; label: string; note: string } {
  if (telegramProject?.download) {
    return telegramProject.download;
  }
  return { href: '/files/TelegramProSend.zip', label: 'Descargar', note: 'Requiere licencia' };
}

export const telegramProSendPage: ProductPageContent = {
  slug: 'telegramprosend',
  name: 'TelegramProSend',
  tagline: 'Campañas masivas por Telegram Web desde tu navegador.',
  summary:
    'TelegramProSend es una extensión para Chrome que envía mensajes masivos de campaña ' +
    'a través de Telegram Web, con reportes, historial y control del envío. Funciona incluso ' +
    'con la ventana minimizada: no necesitas estar mirando la pantalla, solo dejar la pestaña abierta.',
  download: resolveDownload(),
  licenseCtaHref: '/#contacto',
  features: [
    {
      title: 'Envío con el navegador minimizado',
      text: 'La primera vez la pestaña de Telegram debe quedar visible un momento; después puedes minimizar la ventana sin detener la campaña.',
    },
    {
      title: 'Imagen y texto en un solo mensaje',
      text: 'Adjunta una imagen opcional que viaja junto al texto como pie en un único mensaje.',
    },
    {
      title: 'Detección automática «Sin Telegram»',
      text: 'Los números sin cuenta de Telegram se marcan solos y no se reintentan, para no desperdiciar envíos.',
    },
    {
      title: 'Mensajes personalizados',
      text: 'Usa el nombre de la columna entre llaves dobles ({{Nombre}}) y variantes entre llaves simples ({Hola|Buenos días}) que rotan en cada envío.',
    },
    {
      title: 'Historial con «Retomar envío»',
      text: 'Cada campaña queda guardada con su desglose; retoma solo los pendientes sin empezar de cero.',
    },
    {
      title: 'Reportes CSV y Excel',
      text: 'Exporta los resultados con los botones Descargar CSV y Descargar Excel al finalizar cada campaña.',
    },
  ],
  requirements: [
    'Google Chrome actualizado (también funciona en navegadores basados en Chromium como Microsoft Edge o Brave).',
    'Cuenta de Telegram con la sesión iniciada en https://web.telegram.org/k/',
    'Clave de licencia de TelegramProSend provista por AnomalyDevs.',
  ],
  installSteps: [
    'Descomprime TelegramProSend.zip en una carpeta fija de tu computador (por ejemplo, Documentos/TelegramProSend). No borres ni muevas esa carpeta después, porque Chrome la usa cada vez.',
    'Abre en Chrome la dirección chrome://extensions',
    'Activa arriba a la derecha la opción «Modo de desarrollador».',
    'Pulsa el botón «Cargar descomprimida» (Load unpacked).',
    'Elige la carpeta donde descomprimiste el archivo: debe ser la que contiene manifest.json. Pulsa «Seleccionar carpeta».',
    'La extensión quedará instalada. Pulsa el icono de piezas (Extensiones) en la barra de Chrome y fija TelegramProSend para tenerla siempre a la vista.',
  ],
  licenseSteps: [
    'Pulsa el icono de TelegramProSend en la barra de Chrome.',
    'Abre la sección «Licencia».',
    'Pega tu clave (formato parecido a UPHONE-XXXX-XXXX-XXXX).',
    'Pulsa «Activar». Sin licencia válida no se pueden enviar campañas.',
  ],
  licenseImage: licenciaImage,
  licenseImageAlt: 'Ventana de licencia de TelegramProSend con el campo de clave y el botón Activar',
  usageSteps: [
    {
      title: 'Importa tus contactos',
      text: 'Abre https://web.telegram.org/k/ y comprueba que tu sesión está iniciada. Luego abre la extensión y carga tu lista con «Importar contactos» (Excel o CSV con columna de teléfono; los números 09XXXXXXXX se convierten solos a +593).',
      image: contactosImage,
      imageAlt: 'Lista de contactos importados en el panel de TelegramProSend',
    },
    {
      title: 'Redacta el mensaje',
      text: 'Escribe el texto con variables {{Columna}} y variantes {a|b}. Si quieres, adjunta una imagen con «Seleccionar imagen»: viaja como pie en el mismo mensaje.',
      image: mensajeImage,
      imageAlt: 'Editor del mensaje con variables, variantes y botón para seleccionar imagen',
    },
    {
      title: 'Configura las opciones',
      text: 'Define el tiempo mínimo y máximo entre envíos, en segundos. Usa intervalos prudentes para evitar límites temporales.',
      image: opcionesImage,
      imageAlt: 'Opciones de envío con tiempos mínimo y máximo entre mensajes',
    },
    {
      title: 'Envía y sigue el avance en vivo',
      text: 'Pulsa «Enviar ahora» y observa cada fila marcarse como Enviado o Sin Telegram en tiempo real.',
      image: resultadosImage,
      imageAlt: 'Avance en vivo de la campaña con filas marcadas como enviadas',
    },
    {
      title: 'Revisa el resumen y exporta',
      text: 'Al terminar verás el modal «Campaña Finalizada» con el conteo por estado y los botones para descargar CSV o Excel.',
      image: resumenImage,
      imageAlt: 'Modal de campaña finalizada con conteo de enviados y botones de descarga',
    },
    {
      title: 'Consulta el historial y retoma',
      text: 'Cada campaña queda en el historial con su desglose. Si hubo errores, pulsa «Retomar envío» para reintentar solo los pendientes.',
      image: historialImage,
      imageAlt: 'Historial de campañas con desglose por estado y botones de exportación',
    },
  ],
  results: [
    {
      status: 'Enviado',
      text: 'Marca verde: el mensaje llegó al contacto.',
    },
    {
      status: 'Sin Telegram',
      text: 'Círculo gris: ese número no tiene cuenta de Telegram. No se reintenta.',
    },
    {
      status: 'Error',
      text: 'Cruz roja: no se pudo enviar. Usa «Retomar envío» desde el Historial para reintentar solo los pendientes.',
    },
  ],
  tips: [
    'Usa intervalos prudentes entre envíos (varios segundos): enviar muy rápido puede provocar límites temporales (FLOOD_WAIT).',
    'No abras Telegram Web en dos pestañas o ventanas a la vez durante la campaña.',
    'No cierres la pestaña de Telegram mientras se envía la campaña.',
  ],
  faq: [
    {
      question: '«No se conecta»',
      answer:
        'Comprueba que https://web.telegram.org/k/ está abierto con tu sesión iniciada. Recarga esa pestaña y vuelve a abrir la extensión.',
    },
    {
      question: '«La extensión dice que no hay licencia»',
      answer:
        'Revisa que pegaste la clave completa y pulsa Activar. Comprueba tu conexión a internet.',
    },
    {
      question: '«Muchos errores de envío»',
      answer:
        'Revisa tu conexión, evita cerrar la pestaña de Telegram y aumenta el tiempo entre envíos.',
    },
    {
      question: '«No encuentro la carpeta tras instalar»',
      answer:
        'Recuerda en qué carpeta descomprimiste el zip: Chrome la necesita siempre, no la borres ni la muevas.',
    },
  ],
  supportEmail: 'anomalydevsec@gmail.com',
};
