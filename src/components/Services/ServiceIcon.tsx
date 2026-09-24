/** Line icons per service id; unknown ids fall back to a generic node glyph. */
const ICON_PATHS: Record<string, string> = {
  web: 'M3 5h18v14H3z M3 9h18 M6 7h.01 M9 7h.01 M8 13l-2 2 2 2 M16 13l2 2-2 2 M13 12l-2 6',
  mobile: 'M7 2h10v20H7z M11 18h2 M9.5 5h5',
  ai: 'M9 3v3 M15 3v3 M9 18v3 M15 18v3 M3 9h3 M3 15h3 M18 9h3 M18 15h3 M6 6h12v12H6z M10 10h4v4h-4z',
  consulting: 'M4 20V10 M10 20V4 M16 20v-7 M22 20H2 M4 10l6-6 6 9 5-5',
  product: 'M12 2l3 6 6 1-4.5 4 1 6.5L12 16l-5.5 3.5 1-6.5L3 9l6-1z',
  support: 'M12 3a9 9 0 1 0 9 9 M21 3v6h-6 M12 8v4l3 2',
};

const FALLBACK = 'M12 4a8 8 0 1 0 0 16 8 8 0 1 0 0-16 M12 10a2 2 0 1 0 0 4 2 2 0 1 0 0-4';

export function ServiceIcon({ id, className }: { id: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d={ICON_PATHS[id] ?? FALLBACK}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
