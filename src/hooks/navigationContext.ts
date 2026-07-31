import { createContext } from 'react';

/**
 * Anchor → cluster index. Anchors keep semantic hrefs for accessibility, but
 * only one section is mounted at a time, so real navigation goes by index.
 */
export const SECTION_INDEX_BY_HASH: Record<string, number> = {
  '#top': 0,
  '#manifiesto': 1,
  '#servicios': 2,
  '#proyectos': 3,
  '#testimonios': 4,
  '#contacto': 5,
};

/** Lets lazily-mounted sections trigger cluster navigation (provided by App). */
export const NavigationContext = createContext<(index: number) => void>(() => {});
