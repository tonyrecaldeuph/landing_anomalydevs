import terminalCobranzaImage from '../assets/projects/terminal-cobranza.png';
import telegramProSendImage from '../assets/projects/telegram-pro-send.svg';
import smsProImage from '../assets/projects/sms-pro.png';
import mailerProImage from '../assets/projects/mailer-pro.png';
import scrapingMarketplaceImage from '../assets/projects/scraping-marketplace.svg';
import terminalMarketingImage from '../assets/projects/terminal-marketing.svg';
import veneciaSartoriaImage from '../assets/projects/venecia-sartoria.jpg';
import dataAutomatizacionImage from '../assets/projects/data-automatizacion.svg';

export interface Project {
  id: string;
  title: string;
  tags: string[];
  description: string;
  image: string;
  download?: { href: string; label: string; note: string };
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
      'Aplicación de escritorio para campañas masivas por SMS, WhatsApp y Email: importación de contactos desde Excel/CSV, roles y permisos, y estadísticas de entrega en tiempo real sobre PostgreSQL en la nube.',
    image: terminalMarketingImage,
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
  },
  {
    id: 'sms-pro',
    title: 'SMS Pro',
    tags: ['Chrome Extension', 'JavaScript', 'Automatización'],
    description:
      'Extensión que automatiza el envío masivo e ilimitado de campañas de SMS y RCS, con carga de contactos, intervalos configurables y seguimiento en tiempo real de la campaña.',
    image: smsProImage,
  },
  {
    id: 'mailer-pro',
    title: 'Mailer Pro',
    tags: ['Chrome Extension', 'Google Apps Script', 'JavaScript'],
    description:
      'Herramienta de envío masivo de correo electrónico con soporte multicuenta, pensada para campañas de comunicación a gran escala sin depender de un único remitente.',
    image: mailerProImage,
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
