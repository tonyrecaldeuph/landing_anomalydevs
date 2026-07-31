import { MouseEventHandler, PropsWithChildren, useEffect, useRef } from 'react';
import gsap from 'gsap';

interface MagneticButtonProps {
  href: string;
  className?: string;
  strength?: number;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export function MagneticButton({
  href,
  className,
  strength = 0.3,
  onClick,
  children,
}: PropsWithChildren<MagneticButtonProps>) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });

    function handleMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      xTo(relX * strength);
      yTo(relY * strength);
    }

    function handleLeave() {
      xTo(0);
      yTo(0);
    }

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [strength]);

  return (
    <a ref={ref} href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}
