import terminalCobranzaImage from '../assets/projects/terminal-cobranza.png';
import smsProImage from '../assets/projects/sms-pro.png';
import mailerProImage from '../assets/projects/mailer-pro.png';
import scrapingMarketplaceImage from '../assets/projects/scraping-marketplace.png';

export interface Project {
  id: string;
  title: string;
  tags: string[];
  description: string;
  image: string;
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
    id: 'scraping-marketplace',
    title: 'Scraping Facebook Marketplace',
    tags: ['Python', 'Playwright', 'Web Scraping'],
    description:
      'Bot de scraping para estudio de mercado en Facebook Marketplace: monitorea publicaciones de forma recurrente y notifica coincidencias relevantes en tiempo real.',
    image: scrapingMarketplaceImage,
  },
];
