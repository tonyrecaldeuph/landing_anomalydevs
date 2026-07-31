import { createContext, RefObject } from 'react';

/**
 * Ref to the scrollable section container. Reveal uses it as the ScrollTrigger scroller —
 * the window never scrolls in this app, so triggers tied to it would never fire.
 */
export const ScrollContainerContext = createContext<RefObject<HTMLElement | null> | null>(null);
