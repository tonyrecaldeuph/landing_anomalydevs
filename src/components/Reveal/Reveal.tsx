import { PropsWithChildren, useContext, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollContainerContext } from './scrollContainerContext';

gsap.registerPlugin(ScrollTrigger);

export function Reveal({ children }: PropsWithChildren) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollerRef = useContext(ScrollContainerContext);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const scroller = scrollerRef?.current ?? undefined;
    const tween = gsap.fromTo(
      el,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', ...(scroller ? { scroller } : {}) },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [scrollerRef]);

  return <div ref={ref}>{children}</div>;
}
