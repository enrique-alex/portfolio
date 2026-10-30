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
  private highlightAttribute: THREE.BufferAttribute | null = null;
  private distAttribute: THREE.BufferAttribute | null = null;

  private earthCloudLoaded: boolean = false;
  private earthCloudPromise: Promise<void> | null = null;
  private earthHighlights: Float32Array;
  private earthDistances: Float32Array;
  private currentHighlights: Float32Array;
  private currentDistances: Float32Array;
  private form2Weight: number = 0.0;
  private tempPointerVec: THREE.Vector3 = new THREE.Vector3();
  private invMatrix: THREE.Matrix4 = new THREE.Matrix4();

  private currentTopologyIndex: number = 0;
  private targetTopologyIndex: number = 0;
  private morphProgress: number = 1.0;

  private mouseX: number = 0;
  private mouseY: number = 0;
  private targetMouseX: number = 0;
  private targetMouseY: number = 0;

  // Interaction tactile & curseur unifiée sécurisée hors-champ
  private mousePos = { x: -9999.0, y: -9999.0, active: false };
  private normPointerX: number = -9999.0;
  private normPointerY: number = -9999.0;
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

    this.earthHighlights = new Float32Array(this.pointCount);
    this.earthDistances = new Float32Array(this.pointCount);
    this.currentHighlights = new Float32Array(this.pointCount);
    this.currentDistances = new Float32Array(this.pointCount);

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

    // Chargement différé : import dynamique du masque à la première nécessité
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => {
          this.loadEarthCloud();
        });
      } else {
        setTimeout(() => {
          this.loadEarthCloud();
        }, 50);
      }
    }
  }

  /**
   * Chargement différé pur du globe terrestre avec le masque Land RLE
   */
  public async loadEarthCloud(): Promise<void> {
    if (this.earthCloudLoaded || this.isDestroyed) return;
    if (this.earthCloudPromise) return this.earthCloudPromise;

    this.earthCloudPromise = (async () => {
      try {
        const [{ generateEarthCloud }, maskModule] = await Promise.all([
          import('./earthCloud'),
          import('./landMask'),
        ]);

        if (this.isDestroyed) return;

        const earth = generateEarthCloud(this.pointCount, 42, maskModule);

        this.topologyBuffers[1].set(earth.positions);
        this.earthHighlights.set(earth.highlights);
        this.earthDistances.set(earth.distances);
        this.earthCloudLoaded = true;
      } catch (err) {
        console.warn('[ThreeIndustrialScene] Erreur de chargement du nuage Terre :', err);
      }
    })();

    return this.earthCloudPromise;
  }

  public get isEarthCloudLoaded(): boolean {
    return this.earthCloudLoaded;
  }

  private computePointSize(): number {
    const R = 2.05;
    const aTerre = 0.26344 * 4.0 * Math.PI * R * R;
    const activeCount = this.isMobile ? Math.min(this.pointCount, 5000) : this.pointCount;
    const avgSpacing = Math.sqrt(aTerre / (Math.max(1, activeCount) * 0.866));
    return 0.60 * avgSpacing;
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
      const nx = (e.clientX / w) * 2 - 1;
      const ny = -(e.clientY / h) * 2 + 1;
      this.normPointerX = nx;
      this.normPointerY = ny;
      this.mousePos.x = nx;
      this.mousePos.y = ny;
      this.mousePos.active = true;
      this.targetMouseX = nx;
      this.targetMouseY = ny;
      this.isPointerActive = true;

      const moveSpeed = Math.hypot(e.movementX || 0, e.movementY || 0);
      if (moveSpeed > 0) {
        kineticEnergy.addEnergy(Math.min(moveSpeed * 0.001, 0.04));
      }
    };
    this.boundPointerLeave = () => {
      this.isPointerActive = false;
      this.mousePos.active = false;
      this.normPointerX = -9999.0;
      this.normPointerY = -9999.0;
      this.mousePos.x = -9999.0;
      this.mousePos.y = -9999.0;
      this.targetMouseX = 0;
      this.targetMouseY = 0;
    };
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('pointermove', this.boundPointerMove, { passive: true });
      window.addEventListener('pointerleave', this.boundPointerLeave, { passive: true });
      window.addEventListener('blur', this.boundPointerLeave);
    }
    if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
      document.addEventListener('mouseleave', this.boundPointerLeave);
    }

    // Interaction tactile mobile
    this.boundTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        const w = window.innerWidth || 1;
        const h = window.innerHeight || 1;
        const nx = (touch.clientX / w) * 2 - 1;
        const ny = -(touch.clientY / h) * 2 + 1;
        this.normPointerX = nx;
        this.normPointerY = ny;
        this.mousePos.x = nx;
        this.mousePos.y = ny;
        this.mousePos.active = true;
        this.targetMouseX = nx;
        this.targetMouseY = ny;
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
        const nx = (touch.clientX / w) * 2 - 1;
        const ny = -(touch.clientY / h) * 2 + 1;
        this.normPointerX = nx;
        this.normPointerY = ny;
        this.mousePos.x = nx;
        this.mousePos.y = ny;
        this.mousePos.active = true;
        this.targetMouseX = nx;
        this.targetMouseY = ny;
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
      this.mousePos.active = false;
      this.normPointerX = -9999.0;
      this.normPointerY = -9999.0;
      this.mousePos.x = -9999.0;
      this.mousePos.y = -9999.0;
      this.targetMouseX = 0;
      this.targetMouseY = 0;
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
        if (this.boundPointerLeave) {
          this.boundPointerLeave();
        } else {
          this.isPointerActive = false;
        }
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

    this.highlightAttribute = new THREE.BufferAttribute(this.currentHighlights, 1);
    this.highlightAttribute.setUsage(THREE.DynamicDrawUsage);
    this.geometry.setAttribute('aHighlight', this.highlightAttribute);

    this.distAttribute = new THREE.BufferAttribute(this.currentDistances, 1);
    this.distAttribute.setUsage(THREE.DynamicDrawUsage);
    this.geometry.setAttribute('aDist', this.distAttribute);

    const rawDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const initialDpr = Math.min(rawDpr, 1.5);
    const height = typeof window !== 'undefined' ? window.innerHeight || 800 : 800;
    const fovRad = (this.camera.fov * Math.PI) / 180;
    const initialScale = height / (2.0 * Math.tan(fovRad * 0.5));

    this.pointsMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uPixelRatio: { value: initialDpr },
        uScale: { value: initialScale },
        uPointSize: { value: this.computePointSize() },
        uForm2Weight: { value: 0.0 },
        uMotion: { value: 1.0 },
        uBaseColor: { value: new THREE.Color(0xE5E3C0) },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uPixelRatio;
        uniform float uScale;
        uniform float uPointSize;
        uniform float uForm2Weight;
        uniform float uMotion;
        attribute float aHighlight;
        attribute float aDist;
        varying float vHighlight;
        varying float vFade;

        void main() {
          float h = aHighlight * uForm2Weight;
          vHighlight = h;
          float pLen = length(position);
          vec3 n = pLen > 0.0001 ? position / pLen : vec3(0.0, 1.0, 0.0);
          float wave = sin(uTime * 3.0 - aDist * 9.0) * 0.5 + 0.5; // onde sortante depuis le Cameroun
          vec3 p = position + n * (h * wave * 0.035 * uMotion);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          // Estompage de la face arrière avec le vrai vecteur de vue (horizon correct en perspective)
          vec3 vn = normalize(normalMatrix * n);
          float facing = dot(vn, normalize(-mv.xyz));
          vFade = mix(1.0, smoothstep(0.02, 0.45, facing), uForm2Weight);
          float pz = max(-mv.z, 0.001);
          float size = uPointSize * uScale * uPixelRatio / pz;
          size *= 1.0 + h * 0.5 * wave * uMotion;
          gl_PointSize = clamp(size, 1.5, 14.0);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 uBaseColor;
        varying float vHighlight;
        varying float vFade;

        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float disc = 1.0 - smoothstep(0.22, 0.5, d);
          vec3 colBase = uBaseColor; // lin / beige #E5E3C0
          vec3 colCameroon = vec3(1.0, 0.72, 0.14); // or ambré #FFB724
          vec3 col = mix(colBase, colCameroon, vHighlight);
          float a = disc * (0.75 + vHighlight * 0.25) * vFade;
          if (a < 0.02) discard;
          gl_FragColor = vec4(col, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    this.pointsMesh = new THREE.Points(this.geometry, this.pointsMaterial);
    this.pointsMesh.rotation.order = 'YXZ';
    this.pointsMesh.frustumCulled = false;

    const aspect = typeof window !== 'undefined' ? (window.innerWidth || 1) / (window.innerHeight || 1) : 1;
    const initialMeshScale = aspect < 1.0 ? Math.max(0.55, aspect * 1.05) : 1.0;
    this.pointsMesh.scale.set(initialMeshScale, initialMeshScale, initialMeshScale);

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
          // Préchargement différé anticipé à l'approche de la Forme 2
          if (rect.top <= vh * 1.5 && (sectionIds[i] === 'profile' || sectionIds[i] === 'academic')) {
            this.loadEarthCloud();
          }
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

    if (index === 1 && !this.earthCloudLoaded) {
      this.loadEarthCloud();
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

    const fovRad = (this.camera.fov * Math.PI) / 180;
    const uScale = height / (2.0 * Math.tan(fovRad * 0.5));

    if (this.pointsMaterial) {
      this.pointsMaterial.uniforms.uPixelRatio.value = this.renderer.getPixelRatio();
      this.pointsMaterial.uniforms.uScale.value = uScale;
      this.pointsMaterial.uniforms.uPointSize.value = this.computePointSize();
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
    const isForm2Target = this.targetTopologyIndex === 1 && this.earthCloudLoaded;

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

      // Morphing progressif des attributs Cameroun
      const targetH = isForm2Target ? this.earthHighlights[i] : 0.0;
      const targetD = isForm2Target ? this.earthDistances[i] : 0.0;

      const diffH = targetH - this.currentHighlights[i];
      if (Math.abs(diffH) > 0.0001) {
        this.currentHighlights[i] += diffH * speed_i;
      } else {
        this.currentHighlights[i] = targetH;
      }

      const diffD = targetD - this.currentDistances[i];
      if (Math.abs(diffD) > 0.0001) {
        this.currentDistances[i] += diffD * speed_i;
      } else {
        this.currentDistances[i] = targetD;
      }
    }

    if (this.highlightAttribute) {
      this.highlightAttribute.needsUpdate = true;
    }
    if (this.distAttribute) {
      this.distAttribute.needsUpdate = true;
    }

    if (hasMorphDelta) {
      this.morphProgress = Math.min(1.0, this.morphProgress + 0.04);
    } else {
      this.morphProgress = 1.0;
    }

    // Gestion fluide du poids de la Forme 2
    const clampedDt = Math.min(dt, 0.05);
    const targetForm2Weight = this.targetTopologyIndex === 1 ? 1.0 : 0.0;
    this.form2Weight += (targetForm2Weight - this.form2Weight) * (1.0 - Math.exp(-6.0 * clampedDt));
    if (Math.abs(targetForm2Weight - this.form2Weight) < 0.001) {
      this.form2Weight = targetForm2Weight;
    }

    // Rotation & Orientation pré-trame pour synchronisation géométrique parfaite
    if (this.pointsMesh) {
      if (this.targetTopologyIndex === 1) {
        // Forme 2 active : alignement précis vers le Cameroun (4.5°N, 12.0°E)
        const f = 1.0 - Math.exp(-4.5 * clampedDt);

        const swayAmp = isReduced ? 0.0 : (2.5 * Math.PI) / 180.0;
        const swayY = Math.sin((time / 1000.0) * 0.75) * swayAmp;
        const swayX = Math.cos((time / 1000.0) * 0.5) * (swayAmp * 0.4);

        const targetRotY =
          (-12.0 * Math.PI) / 180.0 + swayY + (!isReduced ? this.mouseX * 0.03 : 0.0);
        const targetRotX =
          (4.5 * Math.PI) / 180.0 + swayX + (!isReduced ? this.mouseY * 0.03 : 0.0);

        // Plus court chemin angulaire
        const deltaY = Math.atan2(
          Math.sin(targetRotY - this.pointsMesh.rotation.y),
          Math.cos(targetRotY - this.pointsMesh.rotation.y)
        );
        this.pointsMesh.rotation.y += deltaY * f;

        const deltaX = Math.atan2(
          Math.sin(targetRotX - this.pointsMesh.rotation.x),
          Math.cos(targetRotX - this.pointsMesh.rotation.x)
        );
        this.pointsMesh.rotation.x += deltaX * f;
        this.pointsMesh.rotation.z = 0.0;

        // Amortissement de position
        this.pointsMesh.position.x += (0.0 - this.pointsMesh.position.x) * f;
        this.pointsMesh.position.y += (0.0 - this.pointsMesh.position.y) * f;
      } else if (!isReduced) {
        // Section inactive : rotation planétaire douce existante
        const rotationSpeedY = 0.06 * dt + this.mouseX * 0.01;
        this.pointsMesh.rotation.y += rotationSpeedY;
        this.pointsMesh.rotation.x = this.mouseY * 0.12;
        this.pointsMesh.position.x = this.mouseX * 0.15;
        this.pointsMesh.position.y = this.mouseY * 0.15;
      } else {
        // Section inactive en prefers-reduced-motion : retour amorti vers le neutre
        const f = 1.0 - Math.exp(-4.5 * clampedDt);
        const deltaY = Math.atan2(
          Math.sin(0.0 - this.pointsMesh.rotation.y),
          Math.cos(0.0 - this.pointsMesh.rotation.y)
        );
        this.pointsMesh.rotation.y += deltaY * f;
        const deltaX = Math.atan2(
          Math.sin(0.0 - this.pointsMesh.rotation.x),
          Math.cos(0.0 - this.pointsMesh.rotation.x)
        );
        this.pointsMesh.rotation.x += deltaX * f;
        this.pointsMesh.position.x += (0.0 - this.pointsMesh.position.x) * f;
        this.pointsMesh.position.y += (0.0 - this.pointsMesh.position.y) * f;
      }
    }

    // 2. Conversion spatiale unifiée dans le plan de coupe caméra (z = 0)
    const fovRad = (this.camera.fov * 0.5 * Math.PI) / 180;
    const halfH = Math.tan(fovRad) * this.camera.position.z;
    const halfW = halfH * this.camera.aspect;
    const mouseWorldX = this.normPointerX * halfW;
    const mouseWorldY = this.normPointerY * halfH;

    const r_max = 0.55; // Unités monde 3D

    // Matrice de transformation monde et inverse pour projeter précisément le pointeur et les particules
    let m0 = 1, m4 = 0, m8 = 0, m12 = 0;
    let m1 = 0, m5 = 1, m9 = 0, m13 = 0;
    let inv0 = 1, inv4 = 0, inv8 = 0;
    let inv1 = 0, inv5 = 1, inv9 = 0;
    let inv2 = 0, inv6 = 0, inv10 = 1;

    if (this.pointsMesh) {
      this.pointsMesh.updateMatrixWorld();
      const m = this.pointsMesh.matrixWorld.elements;
      m0 = m[0]; m4 = m[4]; m8 = m[8]; m12 = m[12];
      m1 = m[1]; m5 = m[5]; m9 = m[9]; m13 = m[13];

      this.invMatrix.copy(this.pointsMesh.matrixWorld).invert();
      const inv = this.invMatrix.elements;
      inv0 = inv[0]; inv4 = inv[4]; inv8 = inv[8];
      inv1 = inv[1]; inv5 = inv[5]; inv9 = inv[9];
      inv2 = inv[2]; inv6 = inv[6]; inv10 = inv[10];
    }

    // 3. Répulsion volumétrique sous le pointeur / touch avec sécurisation absolue du falloff
    if (this.isPointerActive && this.mousePos.active && !isReduced) {
      for (let i = 0; i < count; i++) {
        const px = this.basePositions[i * 3];
        const py = this.basePositions[i * 3 + 1];
        const pz = this.basePositions[i * 3 + 2];

        // Position monde réelle de la particule projetée dans le plan caméra
        const pWorldX = m0 * px + m4 * py + m8 * pz + m12;
        const pWorldY = m1 * px + m5 * py + m9 * pz + m13;

        const dx = pWorldX - mouseWorldX;
        const dy = pWorldY - mouseWorldY;
        const d = Math.hypot(dx, dy);

        let repulsionForce = 0.0;
        if (!this.mousePos.active) {
          repulsionForce = 0.0;
        } else if (d >= r_max || d < 0.0001) {
          repulsionForce = 0.0;
        } else {
          // Décroissance garantie vers 0 aux bords
          const factor = Math.max(0.0, 1.0 - d / r_max);
          repulsionForce = Math.pow(factor, 2.0) * 0.35;
        }

        if (repulsionForce > 0.0) {
          const invD = 1.0 / d;
          const worldDispX = (dx * invD) * repulsionForce * 0.45;
          const worldDispY = (dy * invD) * repulsionForce * 0.45;
          const worldDispZ = repulsionForce * 0.25;

          // Rétroprojection du déplacement monde dans le repère local du mesh
          const localDispX = inv0 * worldDispX + inv4 * worldDispY + inv8 * worldDispZ;
          const localDispY = inv1 * worldDispX + inv5 * worldDispY + inv9 * worldDispZ;
          const localDispZ = inv2 * worldDispX + inv6 * worldDispY + inv10 * worldDispZ;

          this.offsetX[i] += localDispX;
          this.offsetY[i] += localDispY;
          this.offsetZ[i] += localDispZ;

          const curOffset = Math.hypot(this.offsetX[i], this.offsetY[i], this.offsetZ[i]);
          const maxRepelDist = r_max * 0.85;
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

      if (Math.abs(this.offsetX[i]) < 0.0001) this.offsetX[i] = 0.0;
      if (Math.abs(this.offsetY[i]) < 0.0001) this.offsetY[i] = 0.0;
      if (Math.abs(this.offsetZ[i]) < 0.0001) this.offsetZ[i] = 0.0;

      if (
        this.offsetX[i] !== 0.0 ||
        this.offsetY[i] !== 0.0 ||
        this.offsetZ[i] !== 0.0
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
      this.pointsMaterial.uniforms.uTime.value = time * 0.001;
      this.pointsMaterial.uniforms.uMotion.value = isReduced ? 0.0 : 1.0;
      this.pointsMaterial.uniforms.uForm2Weight.value = this.form2Weight;
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
    this.normPointerX = active ? normX : -9999.0;
    this.normPointerY = active ? normY : -9999.0;
    this.mousePos.x = this.normPointerX;
    this.mousePos.y = this.normPointerY;
    this.mousePos.active = active;
    this.targetMouseX = active ? normX : 0;
    this.targetMouseY = active ? normY : 0;
    this.isPointerActive = active;
  }

  public getMousePosForTesting(): { x: number; y: number; active: boolean } {
    return { ...this.mousePos };
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
        if (typeof document !== 'undefined' && typeof document.removeEventListener === 'function') {
          document.removeEventListener('mouseleave', this.boundPointerLeave);
        }
        window.removeEventListener('blur', this.boundPointerLeave);
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
        window.removeEventListener('touchcancel', this.boundTouchEnd);
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
      if (this.highlightAttribute) {
        this.geometry.deleteAttribute('aHighlight');
        this.highlightAttribute = null;
      }
      if (this.distAttribute) {
        this.geometry.deleteAttribute('aDist');
        this.distAttribute = null;
      }
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
