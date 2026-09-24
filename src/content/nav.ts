export interface NavSection {
  id: string;
  label: string;
}

export const navSections: NavSection[] = [
  { id: 'servicios', label: 'Servicios' },
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'testimonios', label: 'Testimonios' },
  { id: 'contacto', label: 'Contacto' },
];

/** One label per cluster, in navigation order (HUD readout and section rail). */
export const sectionLabels: string[] = ['Inicio', 'Manifiesto', 'Servicios', 'Proyectos', 'Testimonios', 'Contacto'];
