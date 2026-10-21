import type { ProductPageContent } from './telegramProSend';
import { projects, WHATSAPP_PRO_VERSION, WHATSAPP_PRO_ZIP_NAME } from '../projects';
import contactosImage from '../../assets/products/whatsapp-pro-send/01-contactos.png';
import mensajeImage from '../../assets/products/whatsapp-pro-send/02-mensaje.png';
import opcionesImage from '../../assets/products/whatsapp-pro-send/03-opciones.png';
import resumenImage from '../../assets/products/whatsapp-pro-send/04-resumen.png';
import historialImage from '../../assets/products/whatsapp-pro-send/05-historial.png';
import licenciaImage from '../../assets/products/whatsapp-pro-send/06-licencia.png';

const whatsappProject = projects.find((project) => project.id === 'whatsapp-pro-send');

function resolveDownload(): { href: string; label: string; note: string } {
  if (whatsappProject?.download) {
    return whatsappProject.download;
  }
  return { href: `/files/${WHATSAPP_PRO_ZIP_NAME}`, label: 'Descargar', note: `v${WHATSAPP_PRO_VERSION} · Requiere licencia` };
}

export const whatsappProSendPage: ProductPageContent = {
  slug: 'whatsappprosend',
  name: 'WhatsAppProSend',
  kicker: 'Extensión de Chrome · WhatsApp ADB',
  tagline: 'Campañas masivas por WhatsApp desde tus celulares Android, sin WhatsApp Web.',
  summary:
    'WhatsAppProSend es una extensión para Chrome que envía campañas por la app nativa de ' +
    'WhatsApp en celulares Android conectados por USB. Funciona con WhatsApp, WhatsApp Business ' +
    'y las copias de la app dual del teléfono, con contactos desde Excel, cuota diaria por cuenta, ' +
    'detección de números sin WhatsApp, historial y reportes exportables. No usa WhatsApp Web y ' +
    'en esta versión envía solo texto.',
  download: resolveDownload(),
  features: [
    {
      title: 'La app nativa, no WhatsApp Web',
      text: 'El puente ADB controla WhatsApp o WhatsApp Business instalado en el celular. Los mensajes salen desde el número real del teléfono, sin vincular una sesión web.',
    },
    {
      title: 'Varias cuentas por celular',
      text: 'Cada WhatsApp de cada teléfono es una cuenta emisora: personal, Business y las copias de la app dual. Las cuentas de un mismo celular se turnan; celulares distintos envían en paralelo.',
    },
    {
      title: 'Cuota diaria y ritmo humano',
      text: 'Define el tope diario por cuenta (150 por defecto) y respeta la espera de 40 a 90 segundos entre envíos. Lo que no entra en la cuota queda Pendiente y se retoma otro día.',
    },
    {
      title: 'Contactos desde Excel o CSV',
      text: 'Importa la lista con una columna de teléfono y una columna de cédula. Los números 09XXXXXXXX se convierten solos a +593, se detectan duplicados y la cédula identifica al cliente.',
    },
    {
      title: 'Mensajes personalizados',
      text: 'Usa variables con el nombre de la columna entre llaves dobles ({{Nombre}}) y variantes entre llaves simples ({Hola|Buenos días}) que rotan en cada envío.',
    },
    {
      title: 'Detección automática «Sin WhatsApp»',
      text: 'Antes de enviar, el sistema comprueba si el número tiene cuenta de WhatsApp. Los que no la tienen se descartan solos y no se reintentan.',
    },
    {
      title: 'Historial, resumen y reportes',
      text: 'Sigue el avance en vivo, revisa el resumen al terminar, exporta CSV o Excel y retoma desde el Historial solo los contactos pendientes.',
    },
  ],
  requirements: [
    'Computador con Windows y Google Chrome actualizado (también funciona en navegadores basados en Chromium).',
    'Uno o más celulares Android con WhatsApp y/o WhatsApp Business con la sesión iniciada.',
    'Depuración por USB activada y el computador autorizado en cada celular.',
    'Autocorrección del teclado desactivada y pantalla sin bloqueo durante la campaña.',
    'Cable USB de datos y WhatsAppProSend instalado con el puente ADB incluido en el zip.',
    'Clave de licencia de WhatsAppProSend provista por AnomalyDevs.',
  ],
  installSteps: [
    `Descomprime ${WHATSAPP_PRO_ZIP_NAME} en una carpeta fija de tu computador (por ejemplo, Documentos/WhatsAppProSend). No borres ni muevas esa carpeta después, porque Chrome la usa cada vez.`,
    'Abre en Chrome la dirección chrome://extensions',
    'Activa arriba a la derecha la opción «Modo de desarrollador».',
    'Pulsa el botón «Cargar descomprimida» (Load unpacked).',
    'Elige la carpeta donde descomprimiste el archivo: debe ser la que contiene manifest.json. Pulsa «Seleccionar carpeta».',
    'Fija WhatsAppProSend en la barra de Chrome con el icono de piezas (Extensiones).',
    'Ejecuta una sola vez native-launcher\\install.exe de la carpeta descomprimida: instala lo necesario para el puente ADB y registra el host que permite reiniciarlo.',
  ],
  access: {
    heading: 'Activar la licencia',
    ctaLabel: 'Solicitar licencia',
    ctaHref: '/#contacto',
    steps: [
      'Pulsa el icono de WhatsAppProSend en la barra de Chrome.',
      'Abre la sección «Licencia».',
      'Pega tu clave (formato parecido a ANOMALYDEVS-XXXX-XXXX-XXXX).',
      'Pulsa «Activar». Sin licencia válida no se pueden enviar campañas.',
    ],
    image: licenciaImage,
    imageAlt: 'Ventana de licencia de WhatsAppProSend con el campo de clave y el botón Activar',
  },
  usageSteps: [
    {
      title: 'Importa tus contactos',
      text: 'Abre la extensión y carga tu lista con «Importar contactos» (Excel o CSV). Necesitas una columna de teléfono y, si quieres identificar al cliente, una columna CEDULA, CÉDULA o IDENTIFICACION. Los números 09XXXXXXXX se convierten solos a +593.',
      image: contactosImage,
      imageAlt: 'Lista de contactos importados en el panel de WhatsAppProSend con cédula y teléfono',
    },
    {
      title: 'Redacta el mensaje',
      text: 'Escribe el texto con variables {{Columna}} y variantes {a|b}. Esta versión envía solo texto: una campaña con imagen se rechaza sin enviar nada.',
      image: mensajeImage,
      imageAlt: 'Editor del mensaje con variables, variantes y vista previa de WhatsAppProSend',
    },
    {
      title: 'Conecta los celulares y elige las cuentas',
      text: 'Conecta cada Android por USB, desbloquéalo y acepta la autorización de depuración. Pulsa «Buscar cuentas», activa las cuentas que enviarán y fija el tope diario por cuenta (150 por defecto).',
      image: opcionesImage,
      imageAlt: 'Cuentas de WhatsApp detectadas por WhatsAppProSend con su cuota diaria y el puente ADB',
    },
    {
      title: 'Envía y sigue el avance',
      text: 'Pulsa «Enviar ahora». Cada cuenta espera entre 40 y 90 segundos entre mensajes; las de un mismo celular se turnan y las de celulares distintos van en paralelo. Durante la campaña no uses los celulares.',
    },
    {
      title: 'Revisa el resumen y exporta',
      text: 'Al terminar verás el resumen con enviados, sin WhatsApp, pendientes y errores. Descarga los resultados en CSV o Excel y usa «Retomar envío» para reintentar solo lo que quedó pendiente.',
      image: resumenImage,
      imageAlt: 'Modal de campaña finalizada de WhatsAppProSend con conteo por estado y botones de exportación',
    },
    {
      title: 'Consulta el historial y retoma',
      text: 'Cada campaña queda en el Historial con su desglose. Si se agotó la cuota o hubo errores, pulsa «Retomar envío» para continuar solo con los pendientes.',
      image: historialImage,
      imageAlt: 'Historial de campañas de WhatsAppProSend con desglose por estado y botón para retomar',
    },
  ],
  results: [
    {
      status: 'Enviado',
      text: 'Marca verde: el mensaje salió al contacto desde la cuenta de WhatsApp asignada.',
    },
    {
      status: 'Sin WhatsApp',
      text: 'Círculo gris: ese número no tiene cuenta de WhatsApp. No se guarda el contacto ni se reintenta.',
    },
    {
      status: 'Pendiente',
      text: 'Reloj: se agotó la cuota diaria de las cuentas. Retoma la campaña otro día desde el Historial.',
    },
    {
      status: 'Error',
      text: 'Cruz roja: no se pudo enviar. Revisa la sesión del celular y usa «Retomar envío» para reintentar solo los pendientes.',
    },
  ],
  tips: [
    'Respeta el tope diario y la espera de 40 a 90 segundos entre envíos: enviar de más desde una cuenta es lo que termina en bloqueo del número.',
    'Automatizar envíos masivos va contra las condiciones de uso de WhatsApp y el número puede ser bloqueado. Usa cuentas destinadas a este fin y contactos que hayan dado su consentimiento.',
    'Mantén los celulares cargando, desbloqueados y sin uso durante la campaña.',
    'Desactiva la autocorrección del teclado: el sistema escribe con el teclado del celular y la autocorrección puede cambiar palabras, nombres o montos.',
    'Esta versión envía solo texto. Si tu campaña incluye una imagen, quítala antes de iniciar.',
  ],
  faq: [
    {
      question: '«Sin cuentas detectadas»',
      answer:
        'Revisa el cable USB, que la depuración por USB esté activa y que hayas aceptado el aviso de autorización en el celular. Pulsa «Reiniciar puente» y vuelve a intentar.',
    },
    {
      question: '«No se pudo iniciar el puente»',
      answer:
        'Ejecuta una sola vez native-launcher\\install.exe de la carpeta descomprimida y vuelve a abrir la extensión. El puente usa el puerto local 8766.',
    },
    {
      question: '«Una cuenta da error en todos los contactos»',
      answer:
        'Esa app de WhatsApp no tiene la sesión iniciada en el celular. Inicia sesión o desmarca esa cuenta antes de enviar.',
    },
    {
      question: '¿Puedo enviar por WhatsApp Web?',
      answer:
        'No. WhatsAppProSend usa la app nativa del celular por USB, precisamente para no depender de WhatsApp Web ni de una sesión vinculada en el navegador.',
    },
    {
      question: '¿Envía imágenes o archivos?',
      answer:
        'En esta versión solo se envía texto. Una campaña con imagen se rechaza sin enviar nada. Las variantes y variables sí están disponibles.',
    },
    {
      question: '¿Por qué quedan contactos en Pendiente?',
      answer:
        'Se agotó la cuota diaria de las cuentas habilitadas. La campaña queda en el Historial para retomarla otro día con «Retomar envío».',
    },
    {
      question: '¿La extensión dice que no hay licencia?',
      answer:
        'Revisa que pegaste la clave completa y pulsa Activar. Comprueba tu conexión a internet. Si cambiaste de computador, pide que registren el nuevo equipo.',
    },
    {
      question: '¿No encuentro la carpeta tras instalar?',
      answer:
        'Recuerda en qué carpeta descomprimiste el zip: Chrome la necesita siempre, no la borres ni la muevas.',
    },
  ],
  supportEmail: 'anomalydevsec@gmail.com',
};
