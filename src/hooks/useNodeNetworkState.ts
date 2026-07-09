import { useEffect, useState, RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export type NodeNetworkState = 'hero' | 'transition' | 'hidden';

interface UseNodeNetworkStateOptions {
  heroRef: RefObject<Element>;
  transitionRefs: RefObject<Element>[];
  transitionDurationMs?: number;
}

export function useNodeNetworkState({
  heroRef,
  transitionRefs,
  transitionDurationMs = 900,
}: UseNodeNetworkStateOptions): NodeNetworkState {
  const [state, setState] = useState<NodeNetworkState>('hero');

  useEffect(() => {
    const triggers: ScrollTrigger[] = [];
    let hideTimeout: ReturnType<typeof setTimeout> | undefined;

    if (heroRef.current) {
      triggers.push(
        ScrollTrigger.create({
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          onEnter: () => setState('hero'),
          onEnterBack: () => setState('hero'),
          onLeave: () => setState('hidden'),
        }),
      );
    }

    transitionRefs.forEach((ref) => {
      if (!ref.current) return;
      const triggerTransition = () => {
        setState('transition');
        if (hideTimeout) clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => setState('hidden'), transitionDurationMs);
      };
      triggers.push(
        ScrollTrigger.create({
          trigger: ref.current,
          start: 'top center',
          onEnter: triggerTransition,
          onEnterBack: triggerTransition,
        }),
      );
    });

    return () => {
      triggers.forEach((t) => t.kill());
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [heroRef, transitionRefs, transitionDurationMs]);

  return state;
}
