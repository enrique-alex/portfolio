/**
 * ThreeIndustrialScene - Moteur WebGL Particulaire de Sculptures Géométriques Pures
 *
 * Conforme aux standards d'exécution esthétique de cliffiscurious.com :
 * 1. Règle Absolue de Densité & Échantillonnage :
 *    - Point Count fixe et garanti : N = 9000 points sur Desktop / N = 5000 points sur Mobile.
 *    - Remplissage exhaustif des Float32Array sans aucune coquille vide.
 *    - Épaisseur volumétrique contrôlée : r_effectif = r_base * (1.0 + (random_symetrique() * 0.12)).
 *    - Normalisation spatiale : centré en (0, 0, 0) dans une sphère englobante R ≈ 1.95 (visible sous caméra 45° à z = 4.8).
 * 2. Catalogue des 5 Topologies d'Art Mathématique :
 *    - Topologie 1 : GOLDEN_TOROIDAL_OVOID (L'Ovoïde Toroïdal d'Or - Signature visuelle)
 *    - Topologie 2 : MOBIUS_VOLUMETRIC_STRIP (Le Ruban de Möbius Volumétrique Épais)
 *    - Topologie 3 : INTERTWINED_TORUS_KNOT (Le Nœud Torique Entrelacé p=3, q=5)
 *    - Topologie 4 : MINIMAL_GYROID_SHEET (La Nappe Harmonisante / Gyroïde Minimal)
 *    - Topologie 5 : FERMAT_VORTEX_NEBULA (La Nébuleuse Vortex & Double Spirale de Fermat)
 * 3. Morphing Organique (Nuée de Points Déphasée) :
 *    - Inertie individuelle de point : speed_i = 0.038 + (i % 100) * 0.0002.
 *    - Micro-bruit harmonique sinusoïdal sous énergie cinétique de scroll.
 *    - Amortissement complet vers la forme cible à 100% au repos.
 * 4. Calibrage Optique du Shader (ShaderMaterial) :
 *    - Taille des points : gl_PointSize = (4.0 / -mvPosition.z) * min(uDpr, 1.5) avec mise à l'échelle voluptueuse.
 *    - Découpe circulaire lisse avec smoothstep atténué sur les bords.
 *    - Teinte nominale beige crème doré (#E5E3C0), modulation de profondeur Z (alpha 0.35 à 0.90, reflet or pâle),
 *      et accents cyan technique (#00F0FF) sous vélocité cinétique.
 */

import * as THREE from 'three';
import { frameManager } from './FrameManager';
import { kineticEnergy } from './KineticEnergy';

export const TOPOLOGY_NAMES = [
  'GOLDEN_TOROIDAL_OVOID',
  'MOBIUS_VOLUMETRIC_STRIP',
  'INTERTWINED_TORUS_KNOT',
  'MINIMAL_GYROID_SHEET',
  'FERMAT_VORTEX_NEBULA',
] as const;

export type TopologyType = (typeof TOPOLOGY_NAMES)[number];

export interface ThreeIndustrialSceneOptions {
  pointCount?: number;
  decayRate?: number;
}

function pseudoRandom(i: number, seed: number = 1): number {
  const n = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return (n - Math.floor(n)) * 2.0 - 1.0;
}

function pseudoGaussian(i: number, seed: number = 1): number {
  const u1 = Math.max(1e-6, (pseudoRandom(i, seed) + 1.0) * 0.5);
  const u2 = (pseudoRandom(i, seed + 107) + 1.0) * 0.5;
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

export class ThreeIndustrialScene {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  private isMobile: boolean = false;
  private pointCount: number;
  private currentPositions: Float32Array;
  private basePositions: Float32Array;
  private targetPositions: Float32Array;
  private sourcePositions: Float32Array;
  private offsetX: Float32Array;
  private offsetY: Float32Array;
  private offsetZ: Float32Array;
  private topologyBuffers: Float32Array[] = [];

  private pointsMesh: THREE.Points | null = null;
  private pointsMaterial: THREE.ShaderMaterial | null = null;
  private geometry: THREE.BufferGeometry | null = null;
  private positionAttribute: THREE.BufferAttribute | null = null;

  private currentTopologyIndex: number = 0;
  private targetTopologyIndex: number = 0;
  private morphProgress: number = 1.0;

  private mouseX: number = 0;
  private mouseY: number = 0;
  private targetMouseX: number = 0;
  private targetMouseY: number = 0;

  // Interaction tactile & curseur unifiée
  private normPointerX: number = 0;
  private normPointerY: number = 0;
  private isPointerActive: boolean = false;
  private lastTouchX: number = 0;
  private lastTouchY: number = 0;

  private lastScrollY: number = 0;
  private scrollVelocityY: number = 0;

  private unsubscribeFrame: (() => void) | null = null;
  private boundPointerMove: ((e: PointerEvent | MouseEvent) => void) | null = null;
  private boundPointerLeave: (() => void) | null = null;
  private boundTouchStart: ((e: TouchEvent) => void) | null = null;
  private boundTouchMove: ((e: TouchEvent) => void) | null = null;
  private boundTouchEnd: (() => void) | null = null;
  private boundScroll: (() => void) | null = null;
  private boundResize: (() => void) | null = null;
  private boundVisibilityChange: (() => void) | null = null;
  private boundContextLost: ((e: Event) => void) | null = null;
  private boundContextRestored: (() => void) | null = null;

  private hasDisplacement: boolean = false;
  private isDestroyed: boolean = false;
  private themeObserver: MutationObserver | null = null;

  public constructor(canvas: HTMLCanvasElement, options?: ThreeIndustrialSceneOptions) {
    this.canvas = canvas;

    this.isMobile =
      typeof window !== 'undefined' &&
      (window.innerWidth < 768 ||
        (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches));

    // Règle 1 : Point Count fixe et garanti (N = 9000 sur Desktop / N = 5000 sur Mobile)
    this.pointCount = options?.pointCount ?? (this.isMobile ? 5000 : 9000);

    // Initialisation des tampons géométriques statiques
    this.currentPositions = new Float32Array(this.pointCount * 3);
    this.basePositions = new Float32Array(this.pointCount * 3);
    this.targetPositions = new Float32Array(this.pointCount * 3);
    this.sourcePositions = new Float32Array(this.pointCount * 3);
    this.offsetX = new Float32Array(this.pointCount);
    this.offsetY = new Float32Array(this.pointCount);
    this.offsetZ = new Float32Array(this.pointCount);

    this.scene = new THREE.Scene();
    const aspect =
      typeof window !== 'undefined' ? (window.innerWidth || 1) / (window.innerHeight || 1) : 1;
    // Caméra Three.js : positionnée à z = 4.8 pour cadrage idéal sous champ à 45°
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 60);
    this.camera.position.set(0, 0, 4.8);
    this.camera.lookAt(0, 0, 0);

    // Amortissement cinétique
    kineticEnergy.setDecayRate(options?.decayRate ?? 0.93);

    // Précalcul géométrique des 5 topologies d'art mathématique
    this.generateTopologies();

    const initialBuf = this.topologyBuffers[0];
    for (let i = 0; i < this.pointCount * 3; i++) {
      this.currentPositions[i] = initialBuf[i];
      this.basePositions[i] = initialBuf[i];
      this.sourcePositions[i] = initialBuf[i];
      this.targetPositions[i] = initialBuf[i];
    }

    this.init();
  }

  private init(): void {
    if (this.canvas && typeof this.canvas.addEventListener === 'function') {
      this.boundContextLost = (e: Event) => {
        e.preventDefault();
        console.warn('[ThreeIndustrialScene] Contexte WebGL perdu.');
      };
      this.boundContextRestored = () => {
        console.info('[ThreeIndustrialScene] Contexte WebGL restauré.');
        this.updateSize();
      };
      this.canvas.addEventListener('webglcontextlost', this.boundContextLost, false);
      this.canvas.addEventListener('webglcontextrestored', this.boundContextRestored, false);
    }

    if (typeof window === 'undefined') return;

    // Initialisation WebGLRenderer haute performance
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: 'high-performance',
      });
      this.renderer.setClearColor(0x000000, 0);

      const rawDpr = window.devicePixelRatio || 1;
      const dpr = Math.min(rawDpr, 1.5);
      this.renderer.setPixelRatio(dpr);
      this.updateSize();
    } catch (e) {
      console.warn('[ThreeIndustrialScene] Contexte WebGL inaccessible pour Three.js :', e);
    }

    // Construction géométrie et shader particulaire
    this.buildGeometry();

    // Interaction souris desktop
    this.boundPointerMove = (e: PointerEvent | MouseEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      this.normPointerX = (e.clientX / w) * 2 - 1;
      this.normPointerY = -(e.clientY / h) * 2 + 1;
      this.targetMouseX = this.normPointerX;
      this.targetMouseY = this.normPointerY;
      this.isPointerActive = true;

      const moveSpeed = Math.hypot(e.movementX || 0, e.movementY || 0);
      if (moveSpeed > 0) {
        kineticEnergy.addEnergy(Math.min(moveSpeed * 0.001, 0.04));
      }
    };
    this.boundPointerLeave = () => {
      this.isPointerActive = false;
    };
    window.addEventListener('pointermove', this.boundPointerMove, { passive: true });
    window.addEventListener('pointerleave', this.boundPointerLeave, { passive: true });

    // Interaction tactile mobile
    this.boundTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        const w = window.innerWidth || 1;
        const h = window.innerHeight || 1;
        this.normPointerX = (touch.clientX / w) * 2 - 1;
        this.normPointerY = -(touch.clientY / h) * 2 + 1;
        this.targetMouseX = this.normPointerX;
        this.targetMouseY = this.normPointerY;
        this.lastTouchX = touch.clientX;
        this.lastTouchY = touch.clientY;
        this.isPointerActive = true;
      }
    };
    this.boundTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        const w = window.innerWidth || 1;
        const h = window.innerHeight || 1;
        this.normPointerX = (touch.clientX / w) * 2 - 1;
        this.normPointerY = -(touch.clientY / h) * 2 + 1;
        this.targetMouseX = this.normPointerX;
        this.targetMouseY = this.normPointerY;
        this.isPointerActive = true;

        const deltaX = touch.clientX - this.lastTouchX;
        const deltaY = touch.clientY - this.lastTouchY;
        this.lastTouchX = touch.clientX;
        this.lastTouchY = touch.clientY;
        const touchSpeed = Math.hypot(deltaX, deltaY);
        if (touchSpeed > 0) {
          kineticEnergy.addEnergy(Math.min(touchSpeed * 0.002, 0.04));
        }
      }
    };
    this.boundTouchEnd = () => {
      this.isPointerActive = false;
    };
    window.addEventListener('touchstart', this.boundTouchStart, { passive: true });
    window.addEventListener('touchmove', this.boundTouchMove, { passive: true });
    window.addEventListener('touchend', this.boundTouchEnd, { passive: true });
    window.addEventListener('touchcancel', this.boundTouchEnd, { passive: true });

    // Scroll & trigger topologique par section
    this.lastScrollY = window.scrollY || window.pageYOffset || 0;
    this.boundScroll = () => {
      const currentScrollY = window.scrollY || window.pageYOffset || 0;
      const delta = currentScrollY - this.lastScrollY;
      this.lastScrollY = currentScrollY;
      this.scrollVelocityY = delta;

      kineticEnergy.addEnergy(Math.abs(delta) * 0.003);
      this.handleScrollTopologyTrigger(currentScrollY);
    };
    window.addEventListener('scroll', this.boundScroll, { passive: true });

    this.boundResize = () => {
      this.updateSize();
    };
    window.addEventListener('resize', this.boundResize, { passive: true });

    // Coupure immédiate du moteur via document.hidden
    this.boundVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.hidden) {
        this.isPointerActive = false;
      }
    };
    if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
      document.addEventListener('visibilitychange', this.boundVisibilityChange);
    }

    // Observation du thème (clair / sombre)
    this.updateThemeColors();
    if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
      this.themeObserver = new MutationObserver(() => {
        this.updateThemeColors();
      });
      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }

    // Raccordement à la boucle unique FrameManager
    this.unsubscribeFrame = frameManager.subscribe((dt: number, time: number, isReducedMotion?: boolean) => {
      this.renderFrame(dt, time, isReducedMotion);
    });
  }

  /**
   * Normalisation spatiale stricte :
   * Chaque forme est centrée en (0, 0, 0) et inscrite dans une sphère englobante de rayon targetRadius ≈ 1.95.
   */
  private normalizeBuffer(buf: Float32Array, N: number, targetRadius = 1.95): void {
    let cx = 0;
    let cy = 0;
    let cz = 0;
    for (let i = 0; i < N; i++) {
      cx += buf[i * 3];
      cy += buf[i * 3 + 1];
      cz += buf[i * 3 + 2];
    }
    cx /= N;
    cy /= N;
    cz /= N;

    let maxR = 0;
    for (let i = 0; i < N; i++) {
      buf[i * 3] -= cx;
      buf[i * 3 + 1] -= cy;
      buf[i * 3 + 2] -= cz;
      const r = Math.hypot(buf[i * 3], buf[i * 3 + 1], buf[i * 3 + 2]);
      if (r > maxR) maxR = r;
    }

    if (maxR > 0.0001) {
      const scale = targetRadius / maxR;
      for (let i = 0; i < N * 3; i++) {
        buf[i] *= scale;
      }
    }
  }

  /**
   * Catalogue des 5 Topologies d'Art Mathématique Pures
   */
  private generateTopologies(): void {
    const N = this.pointCount;
    this.topologyBuffers = [
      new Float32Array(N * 3), // 0: GOLDEN_TOROIDAL_OVOID
      new Float32Array(N * 3), // 1: MOBIUS_VOLUMETRIC_STRIP
      new Float32Array(N * 3), // 2: INTERTWINED_TORUS_KNOT
      new Float32Array(N * 3), // 3: MINIMAL_GYROID_SHEET
      new Float32Array(N * 3), // 4: FERMAT_VORTEX_NEBULA
    ];

    this.generateGoldenToroidalOvoid(this.topologyBuffers[0], N);
    this.generateMobiusVolumetricStrip(this.topologyBuffers[1], N);
    this.generateIntertwinedTorusKnot(this.topologyBuffers[2], N);
    this.generateHarmonicGyroid(this.topologyBuffers[3], N);
    this.generateFermatVortexNebula(this.topologyBuffers[4], N);
  }

  /**
   * Topologie 1 : L'Ovoïde Toroïdal d'Or (Signature visuelle CliffIsCurious)
   * - Distribution de Fibonacci sur sphère
   * - Profil en œuf : déformation non-linéaire sur Y (y = y * (1.35 + 0.25 * y))
   * - Évidement central toroïdal oblique le long d'un axe passant par le centre,
   *   repoussant les points vers une lèvre extérieure dense et courbée (anneau organique asymétrique)
   * - Épaisseur volumétrique radiale contrôlée : r_effectif = r_base * (1.0 + random_symetrique() * 0.12)
   */
  private generateGoldenToroidalOvoid(buf: Float32Array, N: number): void {
    const phi = Math.PI * (3 - Math.sqrt(5)); // Angle d'or (~2.39996 rad)

    // Axe oblique traversant le centre (inclinaison harmonieuse ~28° sur X, ~16° sur Y)
    const tiltX = 0.48;
    const tiltY = 0.28;
    const rawAx = Math.sin(tiltY);
    const rawAy = Math.sin(tiltX) * Math.cos(tiltY);
    const rawAz = Math.cos(tiltX) * Math.cos(tiltY);
    const aLen = Math.hypot(rawAx, rawAy, rawAz) || 1.0;
    const ax = rawAx / aLen;
    const ay = rawAy / aLen;
    const az = rawAz / aLen;

    const Rcore = 0.65; // Rayon de l'évidement central toroïdal

    for (let i = 0; i < N; i++) {
      const u = N > 1 ? (i + 0.5) / N : 0.5;
      const yNorm = 1.0 - 2.0 * u; // [-1.0, 1.0]
      const rBase = Math.sqrt(Math.max(0.001, 1.0 - yNorm * yNorm));
      const theta = i * phi;

      // Profil en œuf : déformation non linéaire sur Y et évasement à la base
      const yEgg = yNorm * (1.35 + 0.25 * yNorm);
      const eggTaper = 1.0 - 0.16 * yNorm;

      let x = Math.cos(theta) * rBase * eggTaper;
      let y = yEgg;
      let z = Math.sin(theta) * rBase * eggTaper;

      // Projection sur l'axe oblique pour creuser la cavité toroïdale
      const h = x * ax + y * ay + z * az;
      const px = x - h * ax;
      const py = y - h * ay;
      const pz = z - h * az;
      const dPerp = Math.hypot(px, py, pz);

      // Évidement toroïdal : repousse les points du centre vers la lèvre extérieure dense
      const dPerpNew = Math.sqrt(dPerp * dPerp + Rcore * Rcore);
      const scale = dPerpNew / Math.max(dPerp, 1e-4);

      // Courbure de la lèvre le long de l'axe (profil en tore doux)
      const hNew = h * (1.0 - 0.20 * (Rcore * Rcore) / (dPerp * dPerp + Rcore * Rcore));

      x = hNew * ax + px * scale;
      y = hNew * ay + py * scale;
      z = hNew * az + pz * scale;

      // Injection d'épaisseur volumétrique contrôlée : r_effectif = r_base * (1.0 + random_symetrique() * 0.12)
      const rVol = 1.0 + pseudoRandom(i, 11) * 0.12;
      buf[i * 3] = x * rVol;
      buf[i * 3 + 1] = y * rVol;
      buf[i * 3 + 2] = z * rVol;
    }

    this.normalizeBuffer(buf, N, 1.95);
  }

  /**
   * Topologie 2 : Le Ruban de Möbius Volumétrique Épais
   * - Ruban infini à torsion continue sur [0, 2π]
   * - x = (R + v * cos(u/2)) * cos(u)
   * - y = (R + v * cos(u/2)) * sin(u)
   * - z = v * sin(u/2) + épaisseur
   * - Distribution équitensionnelle sans étirement
   */
  private generateMobiusVolumetricStrip(buf: Float32Array, N: number): void {
    const R = 1.45;
    const w = 0.55;
    const d = 0.18;

    for (let i = 0; i < N; i++) {
      const u = (i / N) * Math.PI * 2 + (pseudoRandom(i, 21) * Math.PI * 0.5) / N;
      const v = pseudoRandom(i, 22) * w;
      const thick = pseudoRandom(i, 23) * d;

      // Épaisseur volumétrique contrôlée
      const rVol = 1.0 + pseudoRandom(i, 24) * 0.12;
      const t = thick * rVol;

      const cu = Math.cos(u);
      const su = Math.sin(u);
      const cu2 = Math.cos(u * 0.5);
      const su2 = Math.sin(u * 0.5);

      // Déplacement normal volumétrique complet garantissant continuité et épaisseur
      const rad = R + v * cu2 - t * su2;
      buf[i * 3] = rad * cu;
      buf[i * 3 + 1] = rad * su;
      buf[i * 3 + 2] = v * su2 + t * cu2;
    }

    this.normalizeBuffer(buf, N, 1.95);
  }

  /**
   * Topologie 3 : Le Nœud Torique Entrelacé (Torus Knot p=3, q=5 volumétrique)
   * - Courbe maîtresse auto-enlacée : r = cos(q*φ) + 2.0; x = r*cos(p*φ); y = r*sin(p*φ); z = -sin(q*φ)
   * - Manchon tubulaire dense de rayon variable autour de la trajectoire
   */
  private generateIntertwinedTorusKnot(buf: Float32Array, N: number): void {
    const p = 3;
    const q = 5;

    for (let i = 0; i < N; i++) {
      const phi = (i / N) * Math.PI * 2 + (pseudoRandom(i, 31) * Math.PI * 0.4) / N;
      const rKnot = Math.cos(q * phi) + 2.0;
      const cx = rKnot * Math.cos(p * phi);
      const cy = rKnot * Math.sin(p * phi);
      const cz = -Math.sin(q * phi);

      // Dérivée tangente
      const dr = -q * Math.sin(q * phi);
      const tx = dr * Math.cos(p * phi) - p * rKnot * Math.sin(p * phi);
      const ty = dr * Math.sin(p * phi) + p * rKnot * Math.cos(p * phi);
      const tz = -q * Math.cos(q * phi);
      const tLen = Math.hypot(tx, ty, tz) || 1.0;
      const utx = tx / tLen, uty = ty / tLen, utz = tz / tLen;

      // Base orthonormée de Frenet
      let nx = -uty, ny = utx, nz = 0;
      const nLen = Math.hypot(nx, ny, nz);
      if (nLen < 0.001) { nx = 1; ny = 0; nz = 0; } else { nx /= nLen; ny /= nLen; }
      const bx = uty * nz - utz * ny;
      const by = utz * nx - utx * nz;
      const bz = utx * ny - uty * nx;

      // Manchon tubulaire dense de rayon variable
      const psi = i * 2.39996323 + pseudoRandom(i, 32) * 0.35;
      const rVar = 0.36 + 0.12 * Math.cos(2 * q * phi);
      const tubeRadius = Math.sqrt(Math.abs(pseudoRandom(i, 33))) * rVar;
      const rVol = 1.0 + pseudoRandom(i, 34) * 0.12;
      const rEff = tubeRadius * rVol;

      buf[i * 3] = cx + rEff * (Math.cos(psi) * nx + Math.sin(psi) * bx);
      buf[i * 3 + 1] = cy + rEff * (Math.cos(psi) * ny + Math.sin(psi) * by);
      buf[i * 3 + 2] = cz + rEff * (Math.cos(psi) * nz + Math.sin(psi) * bz);
    }

    this.normalizeBuffer(buf, N, 1.95);
  }

  /**
   * Topologie 4 : La Nappe Harmonisante / Gyroïde Minimal
   * - Surface ondulatoire minimale à triple périodicité : sin(x)cos(y) + sin(y)cos(z) + sin(z)cos(x) = 0
   * - Projection par méthode de Newton-Raphson avec densité isotrope
   */
  private generateHarmonicGyroid(buf: Float32Array, N: number): void {
    const scale = 2.4;

    for (let i = 0; i < N; i++) {
      const u = N > 1 ? (i + 0.5) / N : 0.5;
      const zSeed = (1.0 - 2.0 * u) * 1.7;
      const rSeed = Math.sqrt(Math.max(0.001, 1.7 * 1.7 - zSeed * zSeed));
      const thSeed = i * 2.39996323;
      const shellRad = 0.35 + 0.65 * Math.pow((i % 120) / 119, 0.5);

      let gx = Math.cos(thSeed) * rSeed * shellRad * scale;
      let gy = Math.sin(thSeed) * rSeed * shellRad * scale;
      let gz = zSeed * shellRad * scale;

      // 4 itérations de Newton-Raphson vers le zéro harmonique
      for (let step = 0; step < 4; step++) {
        const val = Math.sin(gx) * Math.cos(gy) + Math.sin(gy) * Math.cos(gz) + Math.sin(gz) * Math.cos(gx);
        const dx = Math.cos(gx) * Math.cos(gy) - Math.sin(gz) * Math.sin(gx);
        const dy = Math.cos(gy) * Math.cos(gz) - Math.sin(gx) * Math.sin(gy);
        const dz = Math.cos(gz) * Math.cos(gx) - Math.sin(gy) * Math.sin(gz);
        const gradSq = dx * dx + dy * dy + dz * dz + 1e-6;
        const delta = val / gradSq;
        gx -= delta * dx;
        gy -= delta * dy;
        gz -= delta * dz;
      }

      let x = gx / scale;
      let y = gy / scale;
      let z = gz / scale;

      // Normale de surface pour injection volumétrique contrôlée
      const normX = Math.cos(gx) * Math.cos(gy) - Math.sin(gz) * Math.sin(gx);
      const normY = Math.cos(gy) * Math.cos(gz) - Math.sin(gx) * Math.sin(gy);
      const normZ = Math.cos(gz) * Math.cos(gx) - Math.sin(gy) * Math.sin(gz);
      const nLen = Math.hypot(normX, normY, normZ) || 1.0;

      const thick = pseudoRandom(i, 41) * 0.16 * (1.0 + pseudoRandom(i, 42) * 0.12);
      x += (normX / nLen) * thick;
      y += (normY / nLen) * thick;
      z += (normZ / nLen) * thick;

      // Enveloppe sphérique douce
      const d = Math.hypot(x, y, z);
      if (d > 1.95) {
        const f = 1.95 / d;
        x *= f; y *= f; z *= f;
      }

      buf[i * 3] = x;
      buf[i * 3 + 1] = y;
      buf[i * 3 + 2] = z;
    }

    this.normalizeBuffer(buf, N, 1.95);
  }

  /**
   * Topologie 5 : La Nébuleuse Vortex & Double Spirale de Fermat
   * - Deux spirales logarithmiques intriquées
   * - Cœur dense et lumineux au centre
   * - Dispersion volumétrique gaussienne vers l'extérieur
   */
  private generateFermatVortexNebula(buf: Float32Array, N: number): void {
    for (let i = 0; i < N; i++) {
      const arm = i % 2;
      const armOffset = arm * Math.PI;

      // Biais vers le centre pour un cœur compact et lumineux
      const u = Math.pow(i / N, 1.25);
      const theta = u * (Math.PI * 6.5) + armOffset;
      const rBase = 0.15 + 1.85 * Math.pow(u, 0.75);

      // Entonnoir vortex central
      const zCore = -0.65 * Math.exp(-(rBase * rBase) / 0.45);
      const zWave = 0.28 * Math.sin(theta * 2.0) * (1.0 - u * 0.35);
      const zBase = zCore + zWave;

      // Dispersion volumétrique gaussienne vers l'extérieur
      const sigma = 0.04 + 0.18 * u;
      const gX = pseudoGaussian(i, 51) * sigma;
      const gY = pseudoGaussian(i, 52) * sigma;
      const gZ = pseudoGaussian(i, 53) * sigma * 1.4;

      const rVol = 1.0 + pseudoRandom(i, 54) * 0.12;
      buf[i * 3] = (rBase * Math.cos(theta) + gX) * rVol;
      buf[i * 3 + 1] = (rBase * Math.sin(theta) + gY) * rVol;
      buf[i * 3 + 2] = (zBase + gZ) * rVol;
    }

    this.normalizeBuffer(buf, N, 1.95);
  }

  /**
   * Construction de la géométrie et du ShaderMaterial optimisé
   */
  private buildGeometry(): void {
    this.geometry = new THREE.BufferGeometry();
    this.positionAttribute = new THREE.BufferAttribute(this.currentPositions, 3);
    this.positionAttribute.setUsage(THREE.DynamicDrawUsage);
    this.geometry.setAttribute('position', this.positionAttribute);

    const rawDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const initialDpr = Math.min(rawDpr, 1.5);

    this.pointsMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uDpr: { value: initialDpr },
        uBaseColor: { value: new THREE.Color(0xE5E3C0) },
        uEnergyColor: { value: new THREE.Color(0x00F0FF) },
        uOpacity: { value: 0.90 },
        uEnergy: { value: 0.0 },
        uTouch: { value: new THREE.Vector2(0, 0) },
        uTouchActive: { value: 0.0 },
        uMeshScale: { value: 1.0 },
      },
      vertexShader: `
        uniform float uDpr;
        uniform float uEnergy;
        uniform vec2 uTouch;
        uniform float uTouchActive;
        uniform float uMeshScale;

        varying float vEnergy;
        varying float vDepthNorm;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // Calibrage optique : gl_PointSize = (4.0 / -mvPosition.z) * min(uDpr, 1.5);
          // Ajusté pour un rendu voluptueux, tangible et sans pixellisation
          float pz = max(-mvPosition.z, 0.001);
          float optDpr = min(uDpr, 1.5);
          gl_PointSize = clamp((4.0 / pz) * optDpr * 5.0, 2.5, 9.0);

          // Normalisation de la profondeur Z (caméra à z = 4.8)
          // Foreground (-2.8) -> vDepthNorm = 0.0 ; Background (-6.8) -> vDepthNorm = 1.0
          vDepthNorm = clamp((-mvPosition.z - 2.8) / 4.0, 0.0, 1.0);

          // Rayonnement d'énergie cinétique et tactile
          float dist = length(position.xy - uTouch);
          float glowRadius = 1.10 / max(uMeshScale, 0.001);
          float touchGlow = uTouchActive * smoothstep(glowRadius, 0.0, dist);
          vEnergy = clamp(uEnergy * 1.5 + touchGlow * 1.0, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uBaseColor;
        uniform vec3 uEnergyColor;
        uniform float uOpacity;

        varying float vEnergy;
        varying float vDepthNorm;

        void main() {
          // Découpe circulaire nette et antialiasée (smoothstep doux sur les bords)
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;
          float circleAlpha = smoothstep(0.5, 0.15, dist);

          // Modulation en fonction de Z :
          // Arrière-plan assombri (alpha ≈ 0.35, teinte plus sombre)
          // Avant-plan net et lumineux (alpha ≈ 0.90, reflet or pâle)
          float frontFactor = 1.0 - vDepthNorm;
          float depthAlpha = mix(0.35, 0.90, frontFactor);

          vec3 backColor = uBaseColor * 0.40;
          vec3 frontColor = mix(uBaseColor, vec3(1.0, 0.96, 0.82), 0.35);
          vec3 shadedColor = mix(backColor, frontColor, frontFactor);

          // Lueur cyan technique (#00F0FF) sous énergie cinétique sur les crêtes de vélocité
          vec3 finalColor = mix(shadedColor, uEnergyColor, vEnergy * 0.75);
          float finalAlpha = circleAlpha * depthAlpha * uOpacity;

          gl_FragColor = vec4(finalColor, finalAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    this.pointsMesh = new THREE.Points(this.geometry, this.pointsMaterial);
    this.pointsMesh.frustumCulled = false;

    const aspect = typeof window !== 'undefined' ? (window.innerWidth || 1) / (window.innerHeight || 1) : 1;
    const initialScale = aspect < 1.0 ? Math.max(0.55, aspect * 1.05) : 1.0;
    this.pointsMesh.scale.set(initialScale, initialScale, initialScale);

    if (this.geometry) {
      const activeCount = this.isMobile ? Math.min(this.pointCount, 5000) : this.pointCount;
      this.geometry.setDrawRange(0, activeCount);
    }

    this.scene.add(this.pointsMesh);
  }

  /**
   * Déclencheur topologique au scroll par section
   */
  private handleScrollTopologyTrigger(scrollY: number): void {
    const sectionIds = ['home', 'profile', 'academic', 'experience', 'projects', 'skills', 'contact'];
    const sectionTopologyMap: Record<string, number> = {
      home: 0,       // Topologie 1: L'Ovoïde Toroïdal d'Or
      profile: 1,    // Topologie 2: Le Ruban de Möbius
      academic: 1,   // Topologie 2: Le Ruban de Möbius
      experience: 2, // Topologie 3: Le Nœud Torique Entrelacé
      projects: 3,   // Topologie 4: La Nappe Harmonisante / Gyroïde Minimal
      skills: 4,     // Topologie 5: La Nébuleuse Vortex & Double Spirale de Fermat
      contact: 4,    // Topologie 5: La Nébuleuse Vortex & Double Spirale de Fermat
    };

    if (typeof document !== 'undefined') {
      const vh = window.innerHeight || 800;
      const triggerY = vh * 0.4;

      let foundSection = false;
      let targetIdx = 0;

      for (let i = 0; i < sectionIds.length; i++) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          foundSection = true;
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerY && rect.bottom >= triggerY) {
            targetIdx = sectionTopologyMap[sectionIds[i]] ?? 0;
            break;
          } else if (rect.top <= triggerY) {
            targetIdx = sectionTopologyMap[sectionIds[i]] ?? 0;
          }
        }
      }

      if (foundSection) {
        if (targetIdx !== this.targetTopologyIndex) {
          this.setTopology(targetIdx);
        }
        return;
      }
    }

    // Repli de secours sur le pourcentage de défilement
    const scrollHeight =
      typeof document !== 'undefined'
        ? Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, 1)
        : 1;
    const docHeight = Math.max(1, scrollHeight - (window.innerHeight || 1));
    const progress = Math.min(1.0, Math.max(0.0, scrollY / docHeight));
    const nextTopologyIndex = Math.min(4, Math.floor(progress * 5));

    if (nextTopologyIndex !== this.targetTopologyIndex) {
      this.setTopology(nextTopologyIndex);
    }
  }

  public setTopology(index: number): void {
    if (index < 0 || index >= this.topologyBuffers.length || index === this.targetTopologyIndex) {
      return;
    }

    for (let i = 0; i < this.pointCount * 3; i++) {
      this.sourcePositions[i] = this.currentPositions[i];
    }

    this.currentTopologyIndex = this.targetTopologyIndex;
    this.targetTopologyIndex = index;
    this.morphProgress = 0.0;
  }

  public nextTopology(): void {
    const nextIdx = (this.targetTopologyIndex + 1) % this.topologyBuffers.length;
    this.setTopology(nextIdx);
  }

  public get activeTopologyName(): TopologyType {
    return TOPOLOGY_NAMES[this.targetTopologyIndex];
  }

  private updateSize(): void {
    if (!this.renderer || typeof window === 'undefined') return;

    const width = window.innerWidth || 1;
    const height = window.innerHeight || 1;

    this.isMobile =
      width < 768 ||
      (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches);

    const aspect = width / height;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    // Cadrage responsive
    const scale = aspect < 1.0 ? Math.max(0.55, aspect * 1.05) : 1.0;
    if (this.pointsMesh) {
      this.pointsMesh.scale.set(scale, scale, scale);
    }

    // Plafonnement du nombre de particules (5000 max sur mobile)
    if (this.geometry) {
      const activeCount = this.isMobile ? Math.min(this.pointCount, 5000) : this.pointCount;
      this.geometry.setDrawRange(0, activeCount);
    }

    // Plafonnement strict du pixel ratio à 1.5 max
    const rawDpr = window.devicePixelRatio || 1;
    const dpr = Math.min(rawDpr, 1.5);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);

    if (this.pointsMaterial) {
      this.pointsMaterial.uniforms.uDpr.value = dpr;
    }
  }

  /**
   * Boucle de trame synchronisée sur le singleton FrameManager
   */
  private renderFrame(dt: number, time: number, isReducedMotion?: boolean): void {
    if (this.isDestroyed) return;

    if (typeof document !== 'undefined' && document.hidden) {
      return;
    }

    const isReduced = Boolean(
      isReducedMotion ??
      frameManager.isReducedMotion ??
      (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    );

    const mouseLerpFactor = 1 - Math.exp(-12 * dt);
    this.mouseX += (this.targetMouseX - this.mouseX) * mouseLerpFactor;
    this.mouseY += (this.targetMouseY - this.mouseY) * mouseLerpFactor;

    const energy = isReduced ? 0.0 : kineticEnergy.getEnergy();
    const count = this.isMobile ? Math.min(this.pointCount, 5000) : this.pointCount;

    // 1. Morphing Organique avec micro-déphasage individuel :
    // Chaque point i possède un facteur d'inertie individuel : speed_i = 0.038 + (i % 100) * 0.0002
    const targetBuf = this.topologyBuffers[this.targetTopologyIndex];
    let hasMorphDelta = false;

    for (let i = 0; i < count; i++) {
      const speed_i = isReduced ? 0.15 : 0.038 + (i % 100) * 0.0002;
      const idx = i * 3;

      for (let c = 0; c < 3; c++) {
        const diff = targetBuf[idx + c] - this.basePositions[idx + c];
        if (Math.abs(diff) > 0.0001) {
          this.basePositions[idx + c] += diff * speed_i;
          hasMorphDelta = true;
        } else {
          this.basePositions[idx + c] = targetBuf[idx + c];
        }
      }
    }

    if (hasMorphDelta) {
      this.morphProgress = Math.min(1.0, this.morphProgress + 0.04);
    } else {
      this.morphProgress = 1.0;
    }

    // 2. Conversion spatiale unifiée dans le plan de coupe caméra (z = 0)
    const fovRad = (this.camera.fov * 0.5 * Math.PI) / 180;
    const halfH = Math.tan(fovRad) * this.camera.position.z;
    const halfW = halfH * this.camera.aspect;
    const targetX = this.normPointerX * halfW;
    const targetY = this.normPointerY * halfH;

    let localPointerX = targetX;
    let localPointerY = targetY;
    let localPointerZ = 0;
    let effectiveRadius = 1.10;
    const intensity = 1.0;

    if (this.pointsMesh) {
      this.pointsMesh.updateMatrixWorld();
      const tempVec = new THREE.Vector3(targetX, targetY, 0);
      this.pointsMesh.worldToLocal(tempVec);
      localPointerX = tempVec.x;
      localPointerY = tempVec.y;
      localPointerZ = tempVec.z;
      const meshScale = this.pointsMesh.scale.x || 1.0;
      effectiveRadius = 1.10 / meshScale;
    }

    // 3. Répulsion volumétrique sous le pointeur / touch
    if (this.isPointerActive && !isReduced) {
      const effRadSq = effectiveRadius * effectiveRadius;
      for (let i = 0; i < count; i++) {
        const px = this.basePositions[i * 3];
        const py = this.basePositions[i * 3 + 1];
        const pz = this.basePositions[i * 3 + 2];
        const dx = px - localPointerX;
        const dy = py - localPointerY;
        const dz = (pz - localPointerZ) * 0.5;
        const dSq = dx * dx + dy * dy + dz * dz;

        if (dSq < effRadSq) {
          const d = Math.sqrt(dSq);
          const force = Math.pow(1.0 - d / effectiveRadius, 2.0) * intensity;
          const invD = 1.0 / Math.max(d, 0.0001);
          this.offsetX[i] += (dx * invD) * force * 0.45;
          this.offsetY[i] += (dy * invD) * force * 0.45;
          this.offsetZ[i] += force * 0.25;

          const curOffset = Math.hypot(this.offsetX[i], this.offsetY[i], this.offsetZ[i]);
          const maxRepelDist = effectiveRadius * 0.85;
          if (curOffset > maxRepelDist) {
            const factor = maxRepelDist / curOffset;
            this.offsetX[i] *= factor;
            this.offsetY[i] *= factor;
            this.offsetZ[i] *= factor;
          }
        }
      }
    }

    // 4. Amortissement élastique continu (* 0.88) & micro-bruit harmonique sinusoïdal
    const wavePhase = (time / 1000) * 3.0;
    const scrollEnergy = Math.min(Math.abs(this.scrollVelocityY) * 0.015, 0.35);
    const effectiveEnergy = Math.max(energy, scrollEnergy);
    const hasWave = !isReduced && effectiveEnergy > 0.001;
    const swimAmp = hasWave ? effectiveEnergy * 0.16 : 0.0;
    let hasActiveOffsets = false;

    for (let i = 0; i < count; i++) {
      this.offsetX[i] *= 0.88;
      this.offsetY[i] *= 0.88;
      this.offsetZ[i] *= 0.88;

      if (
        Math.abs(this.offsetX[i]) > 0.0001 ||
        Math.abs(this.offsetY[i]) > 0.0001 ||
        Math.abs(this.offsetZ[i]) > 0.0001
      ) {
        hasActiveOffsets = true;
      }

      const idx = i * 3;
      let swimX = 0;
      let swimY = 0;
      let swimZ = 0;

      if (hasWave) {
        // Micro-bruit harmonique sinusoïdal (nuée d'oiseaux nageant fluidement)
        const birdPhase = wavePhase * 1.4 + (i % 80) * 0.09;
        swimX = Math.sin(birdPhase + this.basePositions[idx + 1] * 1.8) * swimAmp;
        swimY = Math.cos(birdPhase * 0.85 + this.basePositions[idx + 2] * 1.8) * swimAmp;
        swimZ = Math.sin(birdPhase * 1.15 + this.basePositions[idx] * 1.8) * swimAmp;
      }

      this.currentPositions[idx] = this.basePositions[idx] + this.offsetX[i] + swimX;
      this.currentPositions[idx + 1] = this.basePositions[idx + 1] + this.offsetY[i] + swimY;
      this.currentPositions[idx + 2] = this.basePositions[idx + 2] + this.offsetZ[i] + swimZ;
    }

    this.hasDisplacement = hasWave || hasActiveOffsets;

    if (this.positionAttribute) {
      this.positionAttribute.needsUpdate = true;
    }

    this.scrollVelocityY *= 0.9;

    // Mise à jour des uniforms
    if (this.pointsMaterial) {
      this.pointsMaterial.uniforms.uEnergy.value = energy;
      this.pointsMaterial.uniforms.uTouch.value.set(localPointerX, localPointerY);
      this.pointsMaterial.uniforms.uTouchActive.value = this.isPointerActive && !isReduced ? 1.0 : 0.0;
      this.pointsMaterial.uniforms.uMeshScale.value = this.pointsMesh ? this.pointsMesh.scale.x : 1.0;
    }

    // Rotation orbitale douce
    if (!isReduced && this.pointsMesh) {
      const rotationSpeedY = 0.06 * dt + this.mouseX * 0.01;
      this.pointsMesh.rotation.y += rotationSpeedY;
      this.pointsMesh.rotation.x = this.mouseY * 0.12;
      this.pointsMesh.position.x = this.mouseX * 0.15;
      this.pointsMesh.position.y = this.mouseY * 0.15;
    }

    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  private updateThemeColors(): void {
    if (typeof document === 'undefined') return;
    const isDark = document.documentElement.classList.contains('dark');
    if (this.pointsMaterial) {
      this.pointsMaterial.uniforms.uBaseColor.value.setHex(isDark ? 0xE5E3C0 : 0x524B38);
      this.pointsMaterial.uniforms.uEnergyColor.value.setHex(isDark ? 0x00F0FF : 0x0284C7);
    }
  }

  public get morphProgressValue(): number {
    return this.morphProgress;
  }

  public get currentPositionsBuffer(): Float32Array {
    return this.currentPositions;
  }

  public get cameraInstance(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public getTopologyBuffer(index: number): Float32Array {
    return this.topologyBuffers[index];
  }

  public renderFrameForTesting(dt: number, time: number, isReducedMotion?: boolean): void {
    this.renderFrame(dt, time, isReducedMotion);
  }

  public setPointerForTesting(normX: number, normY: number, active: boolean): void {
    this.normPointerX = normX;
    this.normPointerY = normY;
    this.isPointerActive = active;
  }

  public getOffsetsForTesting(): { offsetX: Float32Array; offsetY: Float32Array; offsetZ: Float32Array } {
    return {
      offsetX: this.offsetX,
      offsetY: this.offsetY,
      offsetZ: this.offsetZ,
    };
  }

  public destroy(): void {
    this.isDestroyed = true;

    if (this.unsubscribeFrame) {
      this.unsubscribeFrame();
      this.unsubscribeFrame = null;
    }

    if (typeof window !== 'undefined') {
      if (this.boundPointerMove) {
        window.removeEventListener('pointermove', this.boundPointerMove);
        this.boundPointerMove = null;
      }
      if (this.boundPointerLeave) {
        window.removeEventListener('pointerleave', this.boundPointerLeave);
        this.boundPointerLeave = null;
      }
      if (this.boundTouchStart) {
        window.removeEventListener('touchstart', this.boundTouchStart);
        this.boundTouchStart = null;
      }
      if (this.boundTouchMove) {
        window.removeEventListener('touchmove', this.boundTouchMove);
        this.boundTouchMove = null;
      }
      if (this.boundTouchEnd) {
        window.removeEventListener('touchend', this.boundTouchEnd);
        this.boundTouchEnd = null;
      }
      if (this.boundScroll) {
        window.removeEventListener('scroll', this.boundScroll);
        this.boundScroll = null;
      }
      if (this.boundResize) {
        window.removeEventListener('resize', this.boundResize);
        this.boundResize = null;
      }
    }

    if (typeof document !== 'undefined' && typeof document.removeEventListener === 'function' && this.boundVisibilityChange) {
      document.removeEventListener('visibilitychange', this.boundVisibilityChange);
      this.boundVisibilityChange = null;
    }

    if (this.themeObserver) {
      this.themeObserver.disconnect();
      this.themeObserver = null;
    }

    if (this.canvas) {
      if (this.boundContextLost) {
        this.canvas.removeEventListener('webglcontextlost', this.boundContextLost);
      }
      if (this.boundContextRestored) {
        this.canvas.removeEventListener('webglcontextrestored', this.boundContextRestored);
      }
    }

    if (this.geometry) {
      this.geometry.dispose();
      this.geometry = null;
    }

    if (this.pointsMesh) {
      if (this.pointsMaterial) {
        this.pointsMaterial.dispose();
        this.pointsMaterial = null;
      }
      this.scene.remove(this.pointsMesh);
      this.pointsMesh = null;
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
  }
}

export function initThreeIndustrialScene(canvas: HTMLCanvasElement): () => void {
  if (typeof window === 'undefined') return () => {};

  const sceneInstance = new ThreeIndustrialScene(canvas);

  return () => {
    sceneInstance.destroy();
  };
}
