import type { ProductPageContent } from './telegramProSend';
import {
  projects,
  TERMINAL_MARKETING_DOWNLOAD_NOTE,
  TERMINAL_MARKETING_INSTALLER_URL,
} from '../projects';
import loginImage from '../../assets/products/terminal-marketing/01-login.png';
import consolaImage from '../../assets/products/terminal-marketing/02-consola.png';
import historialImage from '../../assets/products/terminal-marketing/03-historial.png';
import carteraImage from '../../assets/products/terminal-marketing/04-cartera.png';
import campanasImage from '../../assets/products/terminal-marketing/05-campanas.png';
import compromisosImage from '../../assets/products/terminal-marketing/06-compromisos.png';
import mensajesImage from '../../assets/products/terminal-marketing/07-mensajes.png';

const terminalProject = projects.find((project) => project.id === 'terminal-marketing');

function resolveDownload(): { href: string; label: string; note: string } {
  if (terminalProject?.download) {
    return terminalProject.download;
  }
  return { href: TERMINAL_MARKETING_INSTALLER_URL, label: 'Descargar', note: TERMINAL_MARKETING_DOWNLOAD_NOTE };
}

export const terminalMarketingPage: ProductPageContent = {
  slug: 'terminal-marketing',
  name: 'Terminal Marketing',
  kicker: 'Aplicación de escritorio · Windows',
  tagline: 'Cobranza y campañas desde un solo escritorio, en tiempo real.',
  summary:
    'Terminal Marketing es una aplicación de escritorio para equipos de cobranza: cada asesor ' +
    'trabaja su cartera, marca desde un teléfono Android conectado por USB, registra el ' +
    'resultado de cada llamada y envía campañas por WhatsApp, RCS y correo, mientras el ' +
    'supervisor ve el avance del equipo al instante. No necesita licencia: el administrador ' +
    'del sistema crea tu usuario y con él ya puedes ingresar.',
  download: resolveDownload(),
  access: {
    heading: 'Acceso: sin licencia',
    ctaLabel: 'Solicitar usuario al administrador',
    ctaHref: '/#contacto',
    steps: [
      'Terminal Marketing es gratuita: no hay claves ni activaciones.',
      'El administrador del sistema crea tu usuario (correo y contraseña) y te asigna el rol de Asesor, Supervisor o Administrador.',
      'Abre la aplicación, pulsa «Configurar IP del Servidor» y escribe la dirección del servidor que te indique el administrador.',
      'Ingresa tu correo y contraseña y pulsa «Iniciar Sesión». Verás solo las pantallas que corresponden a tu rol.',
    ],
    image: loginImage,
    imageAlt: 'Pantalla de inicio de sesión de Terminal Marketing con correo, contraseña y ajuste de IP del servidor',
  },
  features: [
    {
      title: 'Cartera por asesor',
      text: 'Cada asesor ve solo los clientes que tiene asignados, con su deuda, historial de gestiones y avance porcentual de la cartera.',
    },
    {
      title: 'Marcación asistida desde Android',
      text: 'Conecta un teléfono por USB y marca con un clic: la app controla el equipo con ADB y scrcpy, sin centralita telefónica.',
    },
    {
      title: 'Tipificación y compromisos de pago',
      text: 'Registra el resultado de cada llamada y agenda promesas de pago con fecha y monto para darles seguimiento.',
    },
    {
      title: 'Campañas por WhatsApp, RCS y correo',
      text: 'Envía mensajes masivos a la cartera desde la misma pantalla y deja constancia de cada envío en el historial del cliente.',
    },
    {
      title: 'Monitoreo del supervisor en tiempo real',
      text: 'Quién está conectado, cuántas llamadas lleva cada asesor, contactabilidad y avance por campaña, actualizados al instante.',
    },
    {
      title: 'Reportes en Excel y actualización automática',
      text: 'Descarga el detalle del día en Excel. Cada PC se actualiza sola cuando se publica una nueva versión.',
    },
  ],
  requirements: [
    'Windows 10/11 de 64 bits.',
    'Usuario creado por el administrador del sistema (no se necesita licencia).',
    'Dirección del servidor central de tu empresa, provista por el administrador.',
    'Para marcar: teléfono Android con «Depuración USB» activada y cable USB de datos.',
  ],
  installSteps: [
    'Descarga el instalador CRM Marketing Uphone Setup (.exe) desde esta página.',
    'Ejecútalo. Si Windows SmartScreen muestra un aviso, pulsa «Más información» y luego «Ejecutar de todas formas».',
    'Sigue el asistente; al terminar se crea el acceso directo «CRM Marketing Uphone» en el escritorio y la aplicación se abre sola.',
    'Las siguientes versiones se instalan automáticamente al iniciar sesión: no necesitas volver a descargar nada.',
  ],
  usageSteps: [
    {
      title: 'Arranca en la consola del asesor',
      text: 'Al ingresar ves tu panel de productividad: efectividad, monto comprometido, recuperación, avance de la campaña, metas por segmento y tu posición en el ranking del equipo. Marca tu estado (En gestión, Almuerzo, Capacitación…) para que cuente tu tiempo productivo.',
      image: consolaImage,
      imageAlt: 'Consola del asesor con indicadores de productividad, metas por segmento y ranking del equipo',
    },
    {
      title: 'Trabaja tu cartera asignada',
      text: 'En «Cartera Asignada» tienes a tus clientes con su mora, días de atraso y número de gestiones. Filtra por tramo (0, 1 o 2+ días), llama con un clic desde el teléfono conectado y registra el resultado: promesa de pago, no contesta, buzón de voz…',
      image: carteraImage,
      imageAlt: 'Tabla de cartera asignada con estado, mora, canales y resultado de la llamada (datos de clientes difuminados)',
    },
    {
      title: 'Consulta tu historial de gestiones',
      text: 'Cada llamada y su tipificación quedan en la bitácora del día, con duración y hora. Busca por nombre, teléfono o tipificación y descárgala en Excel.',
      image: historialImage,
      imageAlt: 'Historial de gestiones del asesor agrupado por día (datos de clientes difuminados)',
    },
    {
      title: 'Lanza campañas masivas',
      text: 'En «Campañas Masivas» la cartera se reparte en lotes para WhatsApp, RCS o correo. Copia el lote, envíalo y márcalo como enviado para llevar el avance.',
      image: campanasImage,
      imageAlt: 'Campañas de WhatsApp divididas en lotes con su avance y botones Copiar y Marcar enviado',
    },
    {
      title: 'Da seguimiento a los compromisos',
      text: 'En «Mis Compromisos» ves las promesas de pago del día con hora comprometida, monto y estado, y cuáles ya se pagaron.',
      image: compromisosImage,
      imageAlt: 'Compromisos y recalls del día con hora, fecha de pago y monto (datos de clientes difuminados)',
    },
    {
      title: 'Usa los mensajes del jefe de área',
      text: 'En «Mensajes» encuentras los textos que redacta tu jefe de área para cada tramo de mora, listos para copiar y enviar a tu cartera.',
      image: mensajesImage,
      imageAlt: 'Mensajes por tramo redactados por el jefe de área con botón Copiar mensaje',
    },
  ],
  results: [
    {
      status: 'Promesa de pago',
      text: 'El cliente se comprometió a pagar: queda agendado en «Compromisos» con fecha y monto.',
    },
    {
      status: 'Contactado',
      text: 'Hubo contacto sin compromiso: la gestión queda registrada en el historial del cliente.',
    },
    {
      status: 'No contactado',
      text: 'No contestó o el número no responde: el cliente sigue pendiente en la cartera para un nuevo intento.',
    },
  ],
  tips: [
    'Pide al administrador que cree un usuario por persona: no compartas credenciales, cada gestión queda auditada con tu nombre.',
    'Deja el teléfono Android conectado y desbloqueado durante la jornada para marcar sin interrupciones.',
    'Tipifica cada llamada apenas termina: las métricas del supervisor se calculan con esas tipificaciones.',
  ],
  faq: [
    {
      question: '¿Necesito comprar una licencia?',
      answer:
        'No. Terminal Marketing no usa licencias. Solo necesitas un usuario creado por el administrador del sistema.',
    },
    {
      question: '«No se pudo conectar al servidor»',
      answer:
        'Revisa en «Configurar IP del Servidor» que la dirección sea la que te dio el administrador y que tu PC tenga red. Si persiste, avísale al administrador.',
    },
    {
      question: '«Credenciales inválidas»',
      answer:
        'Comprueba el correo y la contraseña. Si olvidaste la contraseña, el administrador puede restablecerla desde su panel.',
    },
    {
      question: '«El teléfono no aparece para marcar»',
      answer:
        'Activa «Depuración USB» en las opciones de desarrollador del Android, usa un cable de datos y acepta el aviso de autorización que aparece en el teléfono.',
    },
  ],
  supportEmail: 'anomalydevsec@gmail.com',
};
