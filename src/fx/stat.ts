export interface ParsedStat {
  prefix: string;
  value: number;
  suffix: string;
}

const STAT_PATTERN = /^(\D*?)(\d+)(.*)$/;

export function parseStat(raw: string): ParsedStat {
  const match = STAT_PATTERN.exec(raw);
  if (!match) return { prefix: '', value: 0, suffix: raw };
  return { prefix: match[1], value: Number(match[2]), suffix: match[3] };
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function formatStat(stat: ParsedStat, progress: number): string {
  const p = Math.min(1, Math.max(0, progress));
  return `${stat.prefix}${Math.round(stat.value * easeOutCubic(p))}${stat.suffix}`;
}
