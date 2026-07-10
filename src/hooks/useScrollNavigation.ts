import { useState, useCallback, useEffect, useRef } from 'react';

interface UseScrollNavigationOptions {
  sectionCount: number;
}

export function useScrollNavigation({ sectionCount }: UseScrollNavigationOptions) {
  const [activeCluster, setActiveCluster] = useState(0);
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
        const index = Math.min(Math.floor(progress * sectionCount), sectionCount - 1);
        setActiveCluster(index);
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, [sectionCount]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const navigateTo = useCallback((index: number) => {
    setActiveCluster(Math.max(0, Math.min(index, sectionCount - 1)));
  }, [sectionCount]);

  return { activeCluster, navigateTo };
}
