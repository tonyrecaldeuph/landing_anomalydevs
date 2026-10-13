import terminalCobranzaImage from '../assets/projects/terminal-cobranza.png';
import telegramProSendImage from '../assets/projects/telegram-pro-send.svg';
import smsProImage from '../assets/projects/sms-pro.png';
import mailerProImage from '../assets/projects/mailer-pro.png';
import scrapingMarketplaceImage from '../assets/projects/scraping-marketplace.svg';
import terminalMarketingImage from '../assets/projects/terminal-marketing.svg';
import veneciaSartoriaImage from '../assets/projects/venecia-sartoria.jpg';
import dataAutomatizacionImage from '../assets/projects/data-automatizacion.svg';

// Versión publicada de SMS_RCS_PRO. El zip lleva la versión en el nombre
// porque Cloudflare cachea /files/* 4 h: con un nombre fijo, otras PCs seguían
// descargando la versión anterior tras publicar una nueva.
export const SMS_PRO_VERSION = '3.0.4';
export const SMS_PRO_ZIP_NAME = `SmsProSend-${SMS_PRO_VERSION}.zip`;

// Versión publicada de Terminal Marketing (CRM Marketing Uphone). El instalador
// pesa ~196 MB y no cabe en git: se descarga del mismo servidor que alimenta el
// auto-update, así la landing y la app instalada nunca divergen de versión.
export const TERMINAL_MARKETING_VERSION = '3.0.9';
export const TERMINAL_MARKETING_INSTALLER_URL =
  'https://crm.anomalydevs.qzz.io/updates/' +
  encodeURIComponent(`CRM Marketing Uphone Setup ${TERMINAL_MARKETING_VERSION}.exe`);
export const TERMINAL_MARKETING_DOWNLOAD_NOTE =
  `v${TERMINAL_MARKETING_VERSION} · Sin licencia · El administrador crea tu usuario`;

// Misma regla que SMS: la versión va en el nombre del zip por la caché de
// Cloudflare. Se publica solo el zip versionado; MailerPro no tiene enlaces
// viejos con nombre fijo que mantener.
export const MAILER_PRO_VERSION = '3.3.1';
export const MAILER_PRO_ZIP_NAME = `MailerPro-${MAILER_PRO_VERSION}.zip`;

export interface Project {
  id: string;
  title: string;
  tags: string[];
  description: string;
  image: string;
  download?: { href: string; label: string; note: string };
  caseHref?: string;
}

export const projects: Project[] = [
  {
    id: 'terminal-cobranza',
    title: 'Terminal de Cobranza',
    tags: ['Electron', 'React', 'Node.js'],
    description:
      'Plataforma de escritorio para gestión de cobranza (asesor/supervisor), desplegada en el departamento de cobranza de Uphone — un holding empresarial que factura 40 millones de dólares anuales — con 200 usuarios activos.',
    image: terminalCobranzaImage,
  },
  {
    id: 'terminal-marketing',
    title: 'Terminal Marketing',
    tags: ['Electron', 'React', 'PostgreSQL'],
    description:
      'Aplicación de escritorio para cobranza y campañas: cartera asignada por asesor, marcación asistida desde Android, envíos masivos por WhatsApp, RCS y correo, y monitoreo del supervisor en tiempo real sobre PostgreSQL. No requiere licencia: el administrador del sistema crea tu usuario.',
    image: terminalMarketingImage,
    download: { href: TERMINAL_MARKETING_INSTALLER_URL, label: 'Descargar', note: TERMINAL_MARKETING_DOWNLOAD_NOTE },
    caseHref: '/productos/terminal-marketing/',
  },
  {
    id: 'venecia-sartoria',
    title: 'Venecia Sartoria',
    tags: ['Medusa v2', 'Next.js', 'Payphone'],
    description:
      'Tienda online de lujo trilingüe (español, inglés, italiano) para una sastrería artesanal de Quito: catálogo, pagos con Payphone y reserva de citas para trajes a medida.',
    image: veneciaSartoriaImage,
  },
  {
    id: 'telegram-pro-send',
    title: 'TelegramProSend',
    tags: ['Chrome Extension', 'JavaScript', 'Telegram'],
    description:
      'Extensión de Chrome para campañas masivas por Telegram Web: contactos desde Excel, mensajes personalizados con imagen, detección automática de números sin Telegram, historial y reportes exportables. Funciona incluso con el navegador minimizado.',
    image: telegramProSendImage,
    download: { href: '/files/TelegramProSend.zip', label: 'Descargar', note: 'Requiere licencia' },
    caseHref: '/productos/telegramprosend/',
  },
  {
    id: 'sms-pro',
    title: 'SMS Pro',
    tags: ['Chrome Extension', 'JavaScript', 'Automatización'],
    description:
      'Extensión que automatiza el envío masivo e ilimitado de campañas de SMS y RCS, con carga de contactos, intervalos configurables y seguimiento en tiempo real de la campaña.',
    image: smsProImage,
    download: { href: `/files/${SMS_PRO_ZIP_NAME}`, label: 'Descargar', note: `v${SMS_PRO_VERSION} · Requiere licencia` },
    caseHref: '/productos/smsprosend/',
  },
  {
    id: 'mailer-pro',
    title: 'Mailer Pro',
    tags: ['Chrome Extension', 'Gmail API', 'JavaScript'],
    description:
      'Extensión de Chrome para campañas masivas de correo desde tu propia cuenta de Gmail: contactos desde Excel, mensajes personalizados con imagen y PDF, revisión de direcciones dudosas, relevo de cuenta al agotar la cuota diaria y reportes exportables.',
    image: mailerProImage,
    download: { href: `/files/${MAILER_PRO_ZIP_NAME}`, label: 'Descargar', note: `v${MAILER_PRO_VERSION} · Requiere licencia` },
    caseHref: '/productos/mailerpro/',
  },
  {
    id: 'data-automatizacion',
    title: 'Data & automatización',
    tags: ['Python', 'PostgreSQL', 'Power BI'],
    description:
      'ETL diario de reportes SAP hacia un data warehouse en PostgreSQL con modelo estrella para Power BI, robot que descarga reportes del ERP, auditoría automática de plazos de aperturas y campañas por Telegram.',
    image: dataAutomatizacionImage,
  },
  {
    id: 'scraping-marketplace',
    title: 'Scraping Facebook Marketplace',
    tags: ['Python', 'Playwright', 'Web Scraping'],
    description:
      'Bot de scraping para estudio de mercado en Facebook Marketplace: monitorea publicaciones de forma recurrente y notifica coincidencias relevantes en tiempo real.',
    image: scrapingMarketplaceImage,
  },
];
