import { Suspense, lazy, ComponentType } from 'react';

const sectionComponents: Record<string, React.LazyExoticComponent<ComponentType>> = {
  hero: lazy(() => import('../Hero/Hero').then((m) => ({ default: m.Hero }))),
  manifesto: lazy(() => import('../Manifesto/Manifesto').then((m) => ({ default: m.Manifesto }))),
  services: lazy(() => import('../Services/Services').then((m) => ({ default: m.Services }))),
  projects: lazy(() => import('../Projects/Projects').then((m) => ({ default: m.Projects }))),
  testimonials: lazy(() => import('../Testimonials/Testimonials').then((m) => ({ default: m.Testimonials }))),
  contact: lazy(() => import('../Contact/Contact').then((m) => ({ default: m.Contact }))),
};

const sectionIds = ['hero', 'manifesto', 'services', 'projects', 'testimonials', 'contact'];

interface SectionOverlayProps {
  activeIndex: number;
}

export function SectionOverlay({ activeIndex }: SectionOverlayProps) {
  const id = sectionIds[activeIndex] || 'hero';
  const Component = sectionComponents[id];

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        pointerEvents: 'auto',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Suspense fallback={null}>
        <Component />
      </Suspense>
    </div>
  );
}
