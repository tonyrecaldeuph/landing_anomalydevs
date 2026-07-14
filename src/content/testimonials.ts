export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  initials: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    quote: 'La Terminal de Cobranza se implementó para 200 usuarios sin fricción y hoy es parte del día a día del equipo.',
    author: 'Supervisor de Cobranza',
    role: 'Uphone (holding, 40M+ en facturación anual)',
    initials: 'UP',
  },
  {
    id: 't2',
    quote: 'Con SMS Pro pasamos de campañas manuales a envíos masivos de SMS y RCS sin límite, con seguimiento en tiempo real.',
    author: 'Responsable de Marketing',
    role: 'Campañas de mensajería masiva',
    initials: 'SP',
  },
  {
    id: 't3',
    quote: 'Mailer Pro nos dejó operar varias cuentas en paralelo para el envío masivo de correo sin saturar ninguna.',
    author: 'Equipo de Comunicaciones',
    role: 'Envío masivo de email multicuenta',
    initials: 'MP',
  },
];
