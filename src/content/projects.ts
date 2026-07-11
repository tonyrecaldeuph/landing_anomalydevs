export interface Project {
  id: string;
  title: string;
  tags: string[];
  description: string;
}

export const projects: Project[] = [
  { id: 'proyecto-1', title: 'Proyecto Ficticio Uno', tags: ['React', 'Node.js'], description: 'Plataforma interna de gestión de inventario en tiempo real.' },
  { id: 'proyecto-2', title: 'Proyecto Ficticio Dos', tags: ['React Native', 'Firebase'], description: 'App móvil de fidelización para retail.' },
  { id: 'proyecto-3', title: 'Proyecto Ficticio Tres', tags: ['Python', 'IA'], description: 'Motor de recomendación basado en aprendizaje automático.' },
  { id: 'proyecto-4', title: 'Proyecto Ficticio Cuatro', tags: ['Next.js', 'Stripe'], description: 'E-commerce headless con checkout optimizado.' },
];
