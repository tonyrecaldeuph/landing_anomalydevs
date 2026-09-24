export const BOOT_LINES: string[] = [
  'inicializando núcleo anomaly.sys',
  'calibrando sensores de desviación',
  'desplegando 41 000 nodos de partículas',
  'enlazando módulos: web · móvil · IA',
  'escaneo completo — anomalía detectada',
];

export function bootProgress(elapsedMs: number, totalMs: number): number {
  if (totalMs <= 0) return 100;
  return Math.round(Math.min(1, Math.max(0, elapsedMs / totalMs)) * 100);
}

/** Lines whose share of the bar has been reached; the last one lands exactly at 100. */
export function visibleBootLines(progress: number): string[] {
  const count = Math.floor((Math.min(100, Math.max(0, progress)) / 100) * BOOT_LINES.length);
  return BOOT_LINES.slice(0, count);
}
