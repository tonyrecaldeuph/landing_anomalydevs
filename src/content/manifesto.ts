export interface Stat {
  value: string;
  label: string;
}

export const manifestoContent = {
  heading: 'Sobre nosotros',
  body:
    'En AnomalyDevs no partimos de una plantilla. Partimos de lo que no encaja — el caso raro, el requisito imposible, el dato que se sale de la curva — y construimos el software que lo resuelve.',
  stats: [
    { value: '+30', label: 'proyectos entregados' },
    { value: '5', label: 'años de experiencia' },
    { value: '100%', label: 'remoto, foco en LATAM' },
  ] as Stat[],
};
