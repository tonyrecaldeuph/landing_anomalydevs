import * as THREE from 'three';

/**
 * All particle motion happens here, on the GPU: idle drift, twinkle, the "assemble" fly-in
 * on entering, and repulsion around the pointer. Buffers stay static after upload.
 * `color` is injected by three.js because the material sets vertexColors.
 */
export const PARTICLE_VERTEX_SHADER = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;
uniform float uAssemble;
uniform vec3 uPointer;
uniform float uPointerActive;
uniform float uPointerRadius;

attribute float size;
attribute float aRandom;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vec3 p = position;

  // Scattered start: each particle begins far out along its own direction and settles in.
  float settle = smoothstep(aRandom * 0.35, 0.65 + aRandom * 0.35, uAssemble);
  vec3 scatterDir = normalize(p + vec3(0.0001)) * (4.0 + aRandom * 9.0);
  p = mix(p + scatterDir, p, settle);

  float t = uTime * 0.35 + aRandom * 6.2831;
  p += vec3(sin(t + p.y * 1.7), cos(t * 0.9 + p.x * 1.3), sin(t * 1.1 + p.z * 1.5)) * 0.05 * (0.4 + aRandom);

  vec4 world = modelMatrix * vec4(p, 1.0);

  vec3 away = world.xyz - uPointer;
  float dist = length(away);
  float force = (1.0 - smoothstep(0.0, uPointerRadius, dist)) * uPointerActive;
  world.xyz += normalize(away + vec3(0.0001)) * force * 0.6;

  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;

  float twinkle = 0.55 + 0.45 * sin(uTime * (1.2 + aRandom * 2.0) + aRandom * 40.0);
  gl_PointSize = size * uSize * uPixelRatio * (1.0 + force * 1.8) / max(-mv.z, 0.1);

  vColor = mix(color, vec3(0.81, 1.0, 0.88), force);
  vAlpha = twinkle * (0.35 + 0.65 * settle);
}
`;

export const PARTICLE_FRAGMENT_SHADER = /* glsl */ `
uniform float uOpacity;

varying vec3 vColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  // Hot core + soft halo: the bloom look without a post-processing pass.
  float falloff = 1.0 - d * 2.0;
  float core = pow(falloff, 3.0);
  float halo = pow(falloff, 1.4) * 0.45;
  gl_FragColor = vec4(vColor * (0.5 + core * 1.2), (core + halo) * uOpacity * vAlpha);
}
`;

export interface ParticleUniformOptions {
  pixelRatio: number;
  size: number;
}

export function createParticleUniforms({ pixelRatio, size }: ParticleUniformOptions) {
  return {
    uTime: { value: 0 },
    uPixelRatio: { value: pixelRatio },
    uSize: { value: size },
    uAssemble: { value: 0 },
    uPointer: { value: new THREE.Vector3(9999, 9999, 9999) },
    uPointerActive: { value: 0 },
    uPointerRadius: { value: 1.1 },
    uOpacity: { value: 1 },
  };
}

export type ParticleUniforms = ReturnType<typeof createParticleUniforms>;
