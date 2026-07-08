export interface Service {
  id: string;
  title: string;
  description: string;
}

export const services: Service[] = [
  { id: 'web', title: 'Desarrollo web', description: 'Sitios y web apps a medida, rápidos y escalables.' },
  { id: 'mobile', title: 'Apps móviles', description: 'iOS y Android, nativo o híbrido.' },
  { id: 'ai', title: 'Automatización & IA', description: 'Integramos modelos e IA en flujos de negocio reales.' },
  { id: 'consulting', title: 'Consultoría técnica', description: 'Arquitectura, auditoría y code review con foco en escalabilidad.' },
  { id: 'product', title: 'Producto digital', description: 'De la idea al MVP, con foco en velocidad de lanzamiento.' },
  { id: 'support', title: 'Soporte & escalado', description: 'Mantenimiento y crecimiento post-lanzamiento.' },
];
