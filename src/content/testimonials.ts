export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  initials: string;
}

export const testimonials: Testimonial[] = [
  { id: 't1', quote: 'AnomalyDevs entendió un problema que ningún otro equipo había resuelto bien.', author: 'Cliente Ficticio', role: 'CTO, Empresa Placeholder', initials: 'CF' },
  { id: 't2', quote: 'Entregaron en tiempo récord sin sacrificar calidad.', author: 'Cliente Ficticio Dos', role: 'Founder, Startup Placeholder', initials: 'CD' },
  { id: 't3', quote: 'El equipo se sintió como una extensión interna, no como un proveedor externo.', author: 'Cliente Ficticio Tres', role: 'PM, Compañía Placeholder', initials: 'CT' },
];
