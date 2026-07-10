# AnomalyDevs Landing — Fase 3: Inmersión Total (BlueYard-style)

## Goal
Transformar la landing estática + red de nodos 3D en una experiencia inmersiva completa al estilo BlueYard (unseen.co), con navegación 3D por clústeres de partículas, pantalla de entrada, cursor personalizado, transiciones cinematográficas entre secciones y sonido ambiental modulado.

## Architecture
Canvas Three.js puro (sin react-three-fiber) como fondo full-screen fijo, con GPU instancing para partículas. La navegación por scroll mapea a posiciones de cámara entre clústeres. Overlays HTML se montan/desmontan según el clúster activo. Todo el render loop corre fuera de React para evitar re-renders.

## Cluster Configuration

| Section | Shape | Color | Particles (desktop) | Seed |
|---------|-------|-------|--------------------|------|
| Hero | Nebulosa esférica | `#33FF77` | 15,000 | 1 |
| Manifiesto | Anillo rotante | `#9DFFC0` | 8,000 | 2 |
| Servicios | 4 sub-clústeres esféricos | `#CFFFE0` | 3,000 c/u | 3-6 |
| Proyectos | Retícula expansiva | `#1C6B3A` | 6,000 | 7 |
| Testimonios | Órbita elíptica | mint suave | 4,000 | 8 |
| Contacto | Espiral convergente | neón + mint | 5,000 | 9 |

## Performance Budget

| Metric | Desktop | Mobile |
|--------|---------|--------|
| Particle count | 15,000 | 5,000 |
| Draw calls | 1 (instanced) | 1 |
| FPS target | 60 | 30 |
| DPR limit | 2 | 1.5 |
| Three.js chunk | < 250 kB gzip | same |
| scroll handler | rAF-throttled 16ms | same |
| prefers-reduced-motion | Canvas desactivado | same |

## User Flow
1. **EnterScreen**: Pantalla negra con partículas animadas, logo + "Haz clic para entrar"
2. **Click**: Cámara hace zoom-in al clúster Hero, overlay Hero aparece con fade
3. **Scroll / Nav click**: Cámara vuela al clúster destino (1.2s), overlay anterior se oculta, nuevo aparece
4. **Cursor**: Punto neón con halo, reacciona a partículas y CTAs
5. **Sonido**: Tono ambiente modulado por sección activa

## File Structure
```
src/
├── three/
│   ├── particleSystem.ts      # Cluster generation + GPU instancing
│   ├── clusterConfig.ts       # Per-section config (shape, color, seed, count)
│   ├── cameraControls.ts      # Camera fly-between utility
│   └── cursorEffect.ts        # Custom cursor render + particle interaction
├── components/
│   ├── EnterScreen/
│   │   └── EnterScreen.tsx + .module.css + .test.tsx
│   ├── ImmersiveCanvas/
│   │   ├── ImmersiveCanvas.tsx
│   │   └── ParticleScene.ts
│   └── SectionOverlay/
│       └── SectionOverlay.tsx + .test.tsx
├── hooks/
│   ├── useScrollNavigation.ts + .test.ts
│   ├── useActiveCluster.ts + .test.ts
│   └── useCursor.ts + .test.ts
└── App.tsx
```

## Phasing
Fase 3 se implementa en una sola tanda (no hay sub-proyectos independientes) — todos los archivos son interdependientes.

## Constraints
- Three.js puro, NO react-three-fiber
- GPU instancing obligatorio para partículas
- Cursor nativo oculto con `cursor: none`
- Bundle splitting: ImmersiveCanvas lazy-loaded
- Tests unitarios para lógica pura (cluster generation, navigation state)
- prefers-reduced-motion: canvas 3D no se monta
- Mobile < 768px: partículas reducidas, sin drag, sin cursor personalizado
