const pad2 = (n: number) => String(n).padStart(2, '0');

/** HUD line for the active section, e.g. "SEC 04/06 · PROYECTOS" (index is 0-based). */
export function sectionReadout(index: number, total: number, label: string): string {
  return `SEC ${pad2(index + 1)}/${pad2(total)} · ${label.toUpperCase()}`;
}
