import * as THREE from 'three';
import gsap from 'gsap';
import { buildRandoms, generateParticles, generateStarfield, ParticleData } from '../../three/particleSystem';
import { SECTIONS } from '../../three/clusterConfig';
import {
  applyRig,
  createCameraControls,
  createCameraRig,
  flyRigToCluster,
} from '../../three/cameraControls';
import {
  createParticleUniforms,
  ParticleUniforms,
  PARTICLE_FRAGMENT_SHADER,
  PARTICLE_VERTEX_SHADER,
} from '../../three/particleShaders';
import { lerp } from '../../fx/pointer';
import { createFrameBudget } from '../../fx/frameBudget';
import { applyClusterTransform } from './clusterTransform';

export interface ParticleSceneAPI {
  domElement: HTMLCanvasElement;
  setActiveCluster: (index: number) => void;
  startEnter: () => void;
  /** Pointer in normalized device coordinates ([-1, 1], y up). */
  setPointer: (x: number, y: number) => void;
  clearPointer: () => void;
  dispose: () => void;
  resize: () => void;
}

const BG_COLOR = 0x060a07;
const INACTIVE_OPACITY = 0.14;
const PARALLAX_STRENGTH = 0.35;
const ENTER_START: [number, number, number] = [0, 3, 26];
const FLIGHT_S = 1.25;
const ENTER_FLIGHT_S = 2.4;
const ASSEMBLE_S = 2.8;
/** Frames sampled (after warm-up) before deciding whether full pixel ratio is affordable here. */
const BUDGET = { warmupFrames: 20, windowFrames: 60, minFps: 42 };

function createNoopScene(): ParticleSceneAPI {
  const canvas = document.createElement('canvas');
  canvas.width = 0;
  canvas.height = 0;
  return {
    domElement: canvas,
    setActiveCluster: () => {},
    startEnter: () => {},
    setPointer: () => {},
    clearPointer: () => {},
    dispose: () => {},
    resize: () => {},
  };
}

export function createParticleScene(isMobile: boolean, reducedMotion: boolean): ParticleSceneAPI {
  const { camera, update: updateCamera } = createCameraControls();

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
  } catch {
    return createNoopScene();
  }
  const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(BG_COLOR);

  const scene = new THREE.Scene();
  const configs = isMobile ? SECTIONS.map((s) => ({ ...s, count: Math.min(s.count, 5000) })) : SECTIONS;
  const pointSize = isMobile ? 520 : 430;

  function buildPoints(data: ParticleData, seed: number): { points: THREE.Points; uniforms: ParticleUniforms } {
    const count = data.sizes.length;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(data.colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(data.sizes, 1));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(buildRandoms(count, seed), 1));
    const uniforms = createParticleUniforms({ pixelRatio, size: pointSize });
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: PARTICLE_VERTEX_SHADER,
      fragmentShader: PARTICLE_FRAGMENT_SHADER,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { points: new THREE.Points(geometry, material), uniforms };
  }

  const clusters = configs.map((config) => {
    const { points, uniforms } = buildPoints(generateParticles(config), config.seed);
    applyClusterTransform(points, config);
    points.rotation.y = config.seed;
    scene.add(points);
    return { points, uniforms, config };
  });

  const stars = buildPoints(generateStarfield(isMobile ? 1200 : 2600, 99), 99);
  stars.uniforms.uAssemble.value = 1;
  stars.uniforms.uOpacity.value = 0.7;
  scene.add(stars.points);
  const allUniforms = [...clusters.map((c) => c.uniforms), stars.uniforms];

  const rig = createCameraRig(ENTER_START, configs[0].position);
  const pointerTarget = { x: 0, y: 0, active: 0 };
  const pointerSmooth = { x: 0, y: 0 };
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane();
  const planeNormal = new THREE.Vector3();
  const hit = new THREE.Vector3();
  const ndc = new THREE.Vector2();
  const clusterCenter = new THREE.Vector3();

  let currentCluster = 0;
  let rafId = 0;
  let running = true;
  let frameCount = 0;
  let degraded = pixelRatio <= 1;
  const budget = createFrameBudget({ windowFrames: BUDGET.windowFrames, minFps: BUDGET.minFps });
  const clock = new THREE.Clock();

  /** Slow device: render at 1x — keeps the experience fluid. */
  function degradeQuality() {
    degraded = true;
    renderer.setPixelRatio(1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    allUniforms.forEach((u) => {
      u.uPixelRatio.value = 1;
    });
  }

  function updatePointer() {
    pointerSmooth.x = lerp(pointerSmooth.x, pointerTarget.x, 0.08);
    pointerSmooth.y = lerp(pointerSmooth.y, pointerTarget.y, 0.08);
    const active = clusters[currentCluster];
    clusterCenter.set(...active.config.position);
    camera.getWorldDirection(planeNormal);
    plane.setFromNormalAndCoplanarPoint(planeNormal, clusterCenter);
    ndc.set(pointerSmooth.x, pointerSmooth.y);
    raycaster.setFromCamera(ndc, camera);
    const intersects = raycaster.ray.intersectPlane(plane, hit) !== null;
    const u = active.uniforms;
    u.uPointerActive.value = lerp(u.uPointerActive.value, intersects ? pointerTarget.active : 0, 0.06);
    if (intersects) u.uPointer.value.lerp(hit, 0.25);
  }

  function animate() {
    rafId = requestAnimationFrame(animate);
    if (!running) return;
    const rawDt = clock.getDelta();
    const dt = Math.min(rawDt, 0.05);
    const elapsed = clock.elapsedTime;
    if (!degraded && ++frameCount > BUDGET.warmupFrames && budget.sample(rawDt * 1000) === 'degrade') {
      degradeQuality();
    }

    allUniforms.forEach((u) => {
      u.uTime.value = elapsed;
    });

    clusters.forEach((cluster, i) => {
      const target = i === currentCluster ? 1 : INACTIVE_OPACITY;
      cluster.uniforms.uOpacity.value = lerp(cluster.uniforms.uOpacity.value, target, 0.05);
      if (i !== currentCluster) cluster.uniforms.uPointerActive.value *= 0.9;
      cluster.points.rotation.y += dt * (i === currentCluster ? 0.06 : 0.02);
    });
    stars.points.rotation.y += dt * 0.004;

    applyRig(camera, rig, pointerSmooth, reducedMotion ? 0 : PARALLAX_STRENGTH);
    updatePointer();
    renderer.render(scene, camera);
  }

  // First frame from the rig so nothing renders from the default camera pose.
  applyRig(camera, rig, pointerSmooth, 0);
  animate();

  function handleVisibility() {
    running = !document.hidden;
    if (running) clock.getDelta();
  }
  document.addEventListener('visibilitychange', handleVisibility);

  return {
    domElement: renderer.domElement,
    setActiveCluster(index: number) {
      if (index === currentCluster || !clusters[index]) return;
      currentCluster = index;
      flyRigToCluster(rig, configs[index].position, FLIGHT_S);
    },
    startEnter() {
      flyRigToCluster(rig, configs[currentCluster].position, ENTER_FLIGHT_S);
      clusters.forEach((c) => {
        gsap.to(c.uniforms.uAssemble, { value: 1, duration: ASSEMBLE_S, ease: 'power2.out' });
      });
    },
    setPointer(x: number, y: number) {
      pointerTarget.x = x;
      pointerTarget.y = y;
      pointerTarget.active = 1;
    },
    clearPointer() {
      pointerTarget.active = 0;
    },
    dispose() {
      cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', handleVisibility);
      gsap.killTweensOf(rig.position);
      gsap.killTweensOf(rig.target);
      [...clusters, stars].forEach((c) => {
        gsap.killTweensOf(c.uniforms.uAssemble);
        c.points.geometry.dispose();
        (c.points.material as THREE.Material).dispose();
      });
      renderer.dispose();
    },
    resize() {
      updateCamera(window.innerWidth / window.innerHeight);
      renderer.setSize(window.innerWidth, window.innerHeight);
    },
  };
}
