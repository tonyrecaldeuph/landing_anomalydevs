import type { ProductPageContent } from './telegramProSend';
import { projects, MAILER_PRO_VERSION, MAILER_PRO_ZIP_NAME } from '../projects';
import contactosImage from '../../assets/products/mailer-pro/01-contactos.png';
import mensajeImage from '../../assets/products/mailer-pro/02-mensaje.png';
import cuentaImage from '../../assets/products/mailer-pro/03-cuenta.png';
import monitorImage from '../../assets/products/mailer-pro/04-monitor.png';
import resumenImage from '../../assets/products/mailer-pro/05-resumen.png';
import historialImage from '../../assets/products/mailer-pro/06-historial.png';
import licenciaImage from '../../assets/products/mailer-pro/07-licencia.png';

const mailerProject = projects.find((project) => project.id === 'mailer-pro');

function resolveDownload(): { href: string; label: string; note: string } {
  if (mailerProject?.download) {
    return mailerProject.download;
  }
  return { href: `/files/${MAILER_PRO_ZIP_NAME}`, label: 'Descargar', note: `v${MAILER_PRO_VERSION} · Requiere licencia` };
}

export const mailerProPage: ProductPageContent = {
  slug: 'mailerpro',
  name: 'MailerPro',
  kicker: 'Extensión de Chrome · Gmail',
  tagline: 'Campañas masivas de correo desde tu propia cuenta de Gmail.',
  summary:
    'MailerPro es una extensión para Chrome que envía correos masivos personalizados ' +
    'directamente desde tu cuenta de Gmail, sin servidores intermedios: tus listas de ' +
    'contactos no salen de tu navegador y cada correo queda en tu carpeta de Enviados. ' +
    'Importa un Excel, revisa las direcciones dudosas antes de enviar y sigue la campaña ' +
    'en vivo desde el panel lateral.',
  download: resolveDownload(),
  features: [
    {
      title: 'Desde tu propia cuenta de Gmail',
      text: 'Los correos salen de tu casilla por la API oficial de Gmail. La extensión solo pide permiso para enviar: no lee ni guarda tus mensajes.',
    },
    {
      title: 'Mensajes personalizados',
      text: 'Cada columna del Excel se vuelve una variable como {Nombre} o {Ciudad}, en el asunto y en el cuerpo, con negritas, listas y títulos.',
    },
    {
      title: 'Imagen y PDF adjuntos',
      text: 'Suma una imagen dentro del correo (JPG, PNG, GIF o WEBP de hasta 5 MB) y hasta 3 PDF de 5 MB cada uno como adjunto descargable.',
    },
    {
      title: 'Revisión de direcciones dudosas',
      text: 'Antes de enviar detecta dominios mal escritos (gmial.com → gmail.com) y correos de relleno. Tú decides: corregir, excluir o enviar igual, y descargar el reporte.',
    },
    {
      title: 'Relevo de cuenta al agotar la cuota',
      text: 'Gmail permite unos 500 correos por día (2.000 en Google Workspace). Al llegar al límite la campaña se pausa en el destinatario exacto y sigue con otra cuenta, sin repetir envíos.',
    },
    {
      title: 'Panel en vivo, historial y retomar',
      text: 'Sigue cada envío en el panel lateral, retoma una campaña cortada desde donde quedó y exporta cada campaña a CSV o Excel.',
    },
  ],
  requirements: [
    'Google Chrome actualizado (también funciona en Microsoft Edge, Brave y Opera). Firefox no es compatible.',
    'Una cuenta de Gmail o de Google Workspace desde la que enviar los correos.',
    'Clave de licencia de MailerPro provista por AnomalyDevs.',
  ],
  installSteps: [
    `Descomprime ${MAILER_PRO_ZIP_NAME} en una carpeta fija de tu computador (por ejemplo, Documentos/MailerPro). No borres ni muevas esa carpeta después, porque Chrome la usa cada vez.`,
    'Abre en Chrome la dirección chrome://extensions',
    'Activa arriba a la derecha la opción «Modo de desarrollador».',
    'Pulsa el botón «Cargar descomprimida» (Load unpacked).',
    'Elige la carpeta MailerPro que quedó al descomprimir: debe ser la que contiene manifest.json. Pulsa «Seleccionar carpeta».',
    'La extensión quedará instalada. Pulsa el icono de piezas (Extensiones) en la barra de Chrome y fija MailerPro para tenerla siempre a la vista.',
  ],
  access: {
    heading: 'Activar la licencia',
    ctaLabel: 'Solicitar licencia',
    ctaHref: '/#contacto',
    steps: [
      'Pulsa el icono de MailerPro en la barra de Chrome.',
      'Abre la sección «Licencia» en el menú superior.',
      'Pega tu clave (formato parecido a ANOMALYDEVS-XXXX-XXXX-XXXX) y pulsa «Activar». El indicador del pie pasa a verde con el nombre de tu empresa.',
      'Activa la licencia antes de conectar Gmail: sin una licencia vigente la extensión no abre la autorización de Google ni permite iniciar campañas.',
    ],
    image: licenciaImage,
    imageAlt: 'Ventana de licencia de MailerPro con el campo de clave y el botón Activar',
  },
  usageSteps: [
    {
      title: 'Conecta tu cuenta de Gmail',
      text: 'Abre «Configuración» y pulsa «Conectar cuenta de Gmail». Google avisará que la aplicación no está verificada: pulsa «Configuración avanzada» y luego «Ir a Mailer Pro» para autorizar el envío. Escribe el nombre de remitente que verán tus clientes y pulsa «Listo».',
      image: cuentaImage,
      imageAlt: 'Configuración de MailerPro con la cuenta de Gmail conectada y el nombre del remitente',
    },
    {
      title: 'Importa tus contactos',
      text: 'Pulsa «Importar Excel» y elige tu archivo .xlsx o .xls. Necesita una columna CORREO CLIENTE (también vale «email» o «correo»); el resto de columnas quedan como variables. Si hay direcciones dudosas, el aviso te deja corregirlas, excluirlas o enviar igual.',
      image: contactosImage,
      imageAlt: 'Lista de destinatarios importada con el aviso de una dirección dudosa y su corrección sugerida',
    },
    {
      title: 'Redacta el mensaje',
      text: 'Escribe el asunto y el cuerpo, y pulsa las variables detectadas para insertarlas. Si quieres, agrega una imagen dentro del correo y hasta 3 PDF como adjunto.',
      image: mensajeImage,
      imageAlt: 'Editor del mensaje con asunto, variables detectadas y opciones para adjuntar imagen y PDF',
    },
    {
      title: 'Envía y sigue el avance en vivo',
      text: 'Define el intervalo entre envíos (de 5 a 15 segundos es lo recomendado) y pulsa «Iniciar Campaña». Se abre el panel lateral con cada correo enviado o con error; desde ahí puedes pausar o cancelar.',
      image: monitorImage,
      imageAlt: 'Panel lateral de MailerPro con el avance de la campaña y el registro de envíos',
    },
    {
      title: 'Revisa el resumen y descarga el reporte',
      text: 'Al terminar verás cuántos correos se enviaron, cuántos dieron error y cuántos quedaron pendientes, con los botones para descargar el reporte en CSV o Excel.',
      image: resumenImage,
      imageAlt: 'Resumen de campaña con enviados, errores y pendientes y botones de descarga',
    },
    {
      title: 'Consulta el historial o retoma una campaña',
      text: 'Cada campaña queda en «Historial» con su reporte. Si Chrome se cerró a mitad de envío, al volver aparece «Retomar envío desde donde quedó»: subes el mismo Excel y se envía solo a quienes faltaban.',
      image: historialImage,
      imageAlt: 'Historial de campañas con sus totales y descargas en CSV y Excel',
    },
  ],
  results: [
    {
      status: 'Enviado',
      text: 'Marca verde: Gmail aceptó el correo y quedó en tu carpeta de Enviados.',
    },
    {
      status: 'Error',
      text: 'Cruz roja: Gmail rechazó el envío, por ejemplo porque la dirección no existe. El motivo aparece en el panel y en el reporte.',
    },
    {
      status: 'Pendiente',
      text: 'Reloj: todavía no se intentó, porque la campaña se pausó, se canceló o se cortó. Se puede retomar sin repetir los ya enviados.',
    },
  ],
  tips: [
    'Envía solo a contactos que esperan tus correos: rotar cuentas para mandar correo no solicitado termina con las casillas suspendidas por Google.',
    'Usa intervalos prudentes entre envíos: 3 a 5 segundos para menos de 50 correos y 10 a 15 segundos para más de 200.',
    'Para campañas de más de 500 correos, ten a mano una segunda casilla propia de la empresa para el relevo.',
  ],
  faq: [
    {
      question: '«Google dice que la aplicación no está verificada»',
      answer:
        'Es esperado mientras la verificación con Google está en trámite. Pulsa «Configuración avanzada» y luego «Ir a Mailer Pro». Solo se pide permiso para enviar correos.',
    },
    {
      question: '«No me deja conectar la cuenta de Gmail»',
      answer:
        'Primero activa tu licencia en «Licencia»: sin una licencia vigente la extensión no abre la autorización de Google.',
    },
    {
      question: '«Se pausó con un aviso de límite diario»',
      answer:
        'La cuenta llegó a su cupo diario de Gmail. Pulsa «Conectar otra cuenta y continuar» y elige otra casilla: la campaña sigue desde el mismo destinatario.',
    },
    {
      question: '«El Excel no se importa»',
      answer:
        'La primera fila debe tener los encabezados y una columna debe llamarse CORREO CLIENTE (o «email», «correo» o «correo electrónico»).',
    },
    {
      question: '«No encuentro la carpeta tras instalar»',
      answer:
        'Recuerda en qué carpeta descomprimiste el zip: Chrome la necesita siempre, no la borres ni la muevas.',
    },
  ],
  supportEmail: 'anomalydevsec@gmail.com',
};
