/**
 * ThreeIndustrialScene - Moteur WebGL Particulaire Industriel Haute Performance
 *
 * Conforme aux standards d'exécution de cliffiscurious.com :
 * 1. Restauration de l'écran de chargement (Boot Sequence) et synchronisation fluide.
 * 2. Physique d'interaction tactile et curseur (Touch & Mouse Repulsion Field) :
 *    - Conversion spatiale unifiée au plan de coupe caméra (z = 0).
 *    - Répulsion quadratique volumétrique sous le doigt / pointeur.
 *    - Amortissement élastique continu (0.88) pour un retour inertiel doux.
 * 3. Catalogue des 6 Topologies 3D Volumétriques Réelles (6000 points mobile / 9000 desktop) :
 *    - Topologie 1 : ENERGY_TOROIDAL_EGG (L'Œuf Toroïdal Énergétique - Signature visuelle)
 *    - Topologie 2 : ELECTROMAGNETIC_ROTOR_FIELD (Rotor Électromagnétique & Lignes de Champ)
 *    - Topologie 3 : ROBOTIC_ARM_6AXIS (Bras Robotique 6 Axes & Cinématique)
 *    - Topologie 4 : MICROPROCESSOR_CORE_BUS (Cœur Microprocesseur & Bus Matriciel 3D)
 *    - Topologie 5 : SCADA_SMART_FACTORY_NETWORK (Réseau Nodal SCADA & Smart Factory)
 *    - Topologie 6 : AWALE_GEOMETRIC_MATRIX (Matrice Géométrique Awalé - Combinatoire & Racines)
 * 4. Morphing vectoriel pur (currentPos += (target - currentPos) * 0.045) & onde de défilement sinusoïdale.
 * 5. Réglages optiques & Performance mobile :
 *    - Shader circulaire antialiasé (smoothstep), teinte beige doré (#E4E2BF) avec accents cyan (#00F0FF) sous énergie.
 *    - PixelRatio plafonné à 1.5 max pour garantir 60-120 FPS sur iPhone et Android.
 *    - Coupure immédiate du moteur via document.hidden.
 */

import * as THREE from 'three';
import { frameManager } from './FrameManager';
import { kineticEnergy } from './KineticEnergy';

export const TOPOLOGY_NAMES = [
  'ENERGY_TOROIDAL_EGG',
  'ELECTROMAGNETIC_ROTOR_FIELD',
  'ROBOTIC_ARM_6AXIS',
  'MICROPROCESSOR_CORE_BUS',
  'SCADA_SMART_FACTORY_NETWORK',
  'AWALE_GEOMETRIC_MATRIX',
] as const;

export type TopologyType = (typeof TOPOLOGY_NAMES)[number];

export interface ThreeIndustrialSceneOptions {
  pointCount?: number;
  decayRate?: number;
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
  private linesMesh: THREE.LineSegments | null = null;
  private geometry: THREE.BufferGeometry | null = null;
  private positionAttribute: THREE.BufferAttribute | null = null;

  private currentTopologyIndex: number = 0;
  private targetTopologyIndex: number = 0;
  private morphProgress: number = 1.0;
  private morphSpeed: number = 0.045;

  private mouseX: number = 0;
  private mouseY: number = 0;
  private targetMouseX: number = 0;
  private targetMouseY: number = 0;

  // Interaction tactile & pointeur unifiée
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

    // Plafonnement strict : 6000 points sur mobile / 9000 sur desktop
    this.pointCount = options?.pointCount ?? (this.isMobile ? 6000 : 9000);

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
    // Caméra PerspectiveCamera(45, aspect, 0.1, 60) positionnée à z=5
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 60);
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);

    // Amortissement cinétique
    kineticEnergy.setDecayRate(options?.decayRate ?? 0.93);

    // Précalcul statique et haute fidélité des 6 topologies industrielles
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

    // 1. Initialisation WebGLRenderer avec alpha: true et clearColor transparent (0x000000, 0)
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

      // Plafonnement du pixelRatio à 1.5 max (mobile & desktop)
      const rawDpr = window.devicePixelRatio || 1;
      const dpr = Math.min(rawDpr, 1.5);
      this.renderer.setPixelRatio(dpr);
      this.updateSize();
    } catch (e) {
      console.warn('[ThreeIndustrialScene] Contexte WebGL inaccessible pour Three.js :', e);
    }

    // 2. Construction des géométries et shaders
    this.buildGeometry();

    // 3. Écouteurs unifiés (Souris Desktop & Touch Mobile)
    this.boundPointerMove = (e: PointerEvent | MouseEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      this.normPointerX = (e.clientX / w) * 2 - 1;
      this.normPointerY = -(e.clientY / h) * 2 + 1;
      this.targetMouseX = this.normPointerX;
      this.targetMouseY = this.normPointerY;
      this.isPointerActive = true;

      // Injection d'énergie cinétique selon la vitesse du curseur
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

    // Tactile mobile ({ passive: true })
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

    // Scroll & trigger topologique
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

    // Thème clair / sombre
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
   * Catalogue des 6 Topologies 3D Volumétriques Réelles
   */
  private generateTopologies(): void {
    const N = this.pointCount;
    this.topologyBuffers = [
      new Float32Array(N * 3), // 0: ENERGY_TOROIDAL_EGG
      new Float32Array(N * 3), // 1: ELECTROMAGNETIC_ROTOR_FIELD
      new Float32Array(N * 3), // 2: ROBOTIC_ARM_6AXIS
      new Float32Array(N * 3), // 3: MICROPROCESSOR_CORE_BUS
      new Float32Array(N * 3), // 4: SCADA_SMART_FACTORY_NETWORK
      new Float32Array(N * 3), // 5: AWALE_GEOMETRIC_MATRIX
    ];

    const phi = Math.PI * (3 - Math.sqrt(5)); // Angle d'or (~2.39996 rad)

    // =========================================================================
    // TOPOLOGIE 1 : ENERGY_TOROIDAL_EGG (L'Œuf Toroïdal Énergétique - Signature)
    // Ellipsoïde vertical creux avec une cavité circulaire asymétrique dense au centre
    // =========================================================================
    const buf0 = this.topologyBuffers[0];
    const eggOuterCount = Math.floor(N * 0.65);
    const eggInnerCount = N - eggOuterCount;

    // Coque externe ellipsoïdale avec distribution de Fibonacci et gradient Y non-linéaire
    for (let i = 0; i < eggOuterCount; i++) {
      const u = eggOuterCount > 1 ? i / (eggOuterCount - 1) : 0.5;
      const yNorm = 1.0 - 2.0 * u; // [-1.0, 1.0]
      const eggFactor = 1.0 - 0.20 * yNorm; // Plus large à la base, plus effilé au sommet
      const rShell = 1.35 * Math.sqrt(Math.max(0.001, 1.0 - yNorm * yNorm)) * eggFactor;
      const theta = i * phi;

      const y = Math.sign(yNorm) * Math.pow(Math.abs(yNorm), 0.95) * 1.55;
      const indent = 1.0 - 0.25 * Math.exp(-(y * y * 4.0 + Math.pow(Math.cos(theta) * 0.7, 2)));
      const shellThick = 0.94 + 0.06 * Math.sin(i * 11.0);

      buf0[i * 3] = Math.cos(theta) * rShell * indent * shellThick;
      buf0[i * 3 + 1] = y;
      buf0[i * 3 + 2] = Math.sin(theta) * rShell * indent * shellThick;
    }

    // Cavité circulaire asymétrique dense au centre (vortex toroïdal incliné)
    for (let i = 0; i < eggInnerCount; i++) {
      const idx = eggOuterCount + i;
      const t = eggInnerCount > 1 ? i / eggInnerCount : 0.5;
      const phiTorus = t * Math.PI * 2 * 9.0;
      const thetaTorus = t * Math.PI * 2;
      const rMajor = 0.58;
      const rMinor = 0.22 + 0.08 * Math.cos(phiTorus * 2.0);

      const tx = (rMajor + rMinor * Math.cos(phiTorus)) * Math.cos(thetaTorus);
      const ty = (rMajor + rMinor * Math.cos(phiTorus)) * Math.sin(thetaTorus) * 0.82;
      const tz = rMinor * Math.sin(phiTorus);

      // Inclinaison asymétrique de 22°
      const cosTilt = Math.cos(0.38);
      const sinTilt = Math.sin(0.38);

      buf0[idx * 3] = tx * cosTilt - tz * sinTilt;
      buf0[idx * 3 + 1] = ty;
      buf0[idx * 3 + 2] = tx * sinTilt + tz * cosTilt;
    }

    // =========================================================================
    // TOPOLOGIE 2 : ELECTROMAGNETIC_ROTOR_FIELD (Rotor Électromagnétique & Lignes de Champ)
    // Rotor circulaire à 6 pôles magnétiques, anneaux de flux toriques et nappes de dispersion
    // =========================================================================
    const buf1 = this.topologyBuffers[1];
    const rotorCount = Math.floor(N * 0.40);
    const fluxCount = Math.floor(N * 0.35);
    const fieldCount = N - rotorCount - fluxCount;

    // 1. Rotor cylindrique central à 6 pôles magnétiques saillants avec skew hélicoïdal
    for (let i = 0; i < rotorCount; i++) {
      const t = rotorCount > 1 ? i / rotorCount : 0;
      const theta = t * Math.PI * 2 * 12;
      const z = ((i % 40) / 39 - 0.5) * 1.4;
      const skew = 0.28 * (z / 1.4);
      const ang = theta + skew;
      const pole = 0.20 * Math.cos(6 * ang);
      const r = 0.72 + pole + 0.05 * Math.sin(i * 3.0);

      buf1[i * 3] = r * Math.cos(ang);
      buf1[i * 3 + 1] = r * Math.sin(ang);
      buf1[i * 3 + 2] = z;
    }

    // 2. Anneaux de flux toriques (3 anneaux de flux magnétiques déphasés à 0°, 60°, 120°)
    const ptsPerRing = Math.max(1, Math.floor(fluxCount / 3));
    for (let i = 0; i < fluxCount; i++) {
      const idx = rotorCount + i;
      const ringPhase = Math.floor(i / ptsPerRing);
      const tilt = ringPhase * (Math.PI / 3);
      const u = ((i % ptsPerRing) / ptsPerRing) * Math.PI * 2;
      const v = ((i % 24) / 24) * Math.PI * 2;
      const R_flux = 1.30;
      const r_flux = 0.18;

      const fx = (R_flux + r_flux * Math.cos(v)) * Math.cos(u);
      const fy = (R_flux + r_flux * Math.cos(v)) * Math.sin(u);
      const fz = r_flux * Math.sin(v);

      buf1[idx * 3] = fx * Math.cos(tilt) - fz * Math.sin(tilt);
      buf1[idx * 3 + 1] = fy;
      buf1[idx * 3 + 2] = fx * Math.sin(tilt) + fz * Math.cos(tilt);
    }

    // 3. Lignes de champ dipolaires arquées (dispersion magnétique)
    for (let i = 0; i < fieldCount; i++) {
      const idx = rotorCount + fluxCount + i;
      const poleIdx = i % 6;
      const poleAngle = poleIdx * (Math.PI / 3);
      const s = (i % 50) / 49;
      const rField = 0.85 + 0.80 * Math.sin(s * Math.PI);
      const zField = (s - 0.5) * 1.6;

      buf1[idx * 3] = rField * Math.cos(poleAngle + (s - 0.5) * 0.35);
      buf1[idx * 3 + 1] = rField * Math.sin(poleAngle + (s - 0.5) * 0.35);
      buf1[idx * 3 + 2] = zField;
    }

    // =========================================================================
    // TOPOLOGIE 3 : ROBOTIC_ARM_6AXIS (Bras Robotique 6 Axes & Cinématique)
    // Base rotative, épaule articulée, bras, coude, poignet 3 axes et pince outil
    // =========================================================================
    const buf2 = this.topologyBuffers[2];
    const basePts = Math.floor(N * 0.15);
    const link1Pts = Math.floor(N * 0.25);
    const link2Pts = Math.floor(N * 0.25);
    const wristPts = Math.floor(N * 0.20);
    const gripperPts = N - basePts - link1Pts - link2Pts - wristPts;

    // 1. Base rotative cylindrique (J1)
    for (let i = 0; i < basePts; i++) {
      const u = basePts > 1 ? i / basePts : 0;
      const rBase = Math.sqrt((i % 30) / 29) * 0.72;
      const th = u * Math.PI * 2 * 10;
      const y = -1.35 + ((i % 15) / 14) * 0.32;

      buf2[i * 3] = rBase * Math.cos(th);
      buf2[i * 3 + 1] = y;
      buf2[i * 3 + 2] = rBase * Math.sin(th);
    }

    // 2. Articulation d'épaule et bras inférieur J2 (de (0, -1.0, 0) à (-0.45, -0.15, 0.25))
    for (let i = 0; i < link1Pts; i++) {
      const idx = basePts + i;
      const t = (i % 60) / 59;
      const coreX = 0 + (-0.45 - 0) * t;
      const coreY = -1.0 + (-0.15 - (-1.0)) * t;
      const coreZ = 0 + (0.25 - 0) * t;
      const radArm = 0.16;
      const ang = (i / 60) * Math.PI * 2;

      buf2[idx * 3] = coreX + radArm * Math.cos(ang);
      buf2[idx * 3 + 1] = coreY + radArm * 0.6 * Math.sin(ang);
      buf2[idx * 3 + 2] = coreZ + radArm * Math.sin(ang);
    }

    // 3. Coude et avant-bras J3 (de (-0.45, -0.15, 0.25) à (0.40, 0.65, -0.15))
    for (let i = 0; i < link2Pts; i++) {
      const idx = basePts + link1Pts + i;
      const t = (i % 60) / 59;
      const coreX = -0.45 + (0.40 - (-0.45)) * t;
      const coreY = -0.15 + (0.65 - (-0.15)) * t;
      const coreZ = 0.25 + (-0.15 - 0.25) * t;
      const radForearm = 0.13;
      const ang = (i / 60) * Math.PI * 2;

      buf2[idx * 3] = coreX + radForearm * Math.cos(ang);
      buf2[idx * 3 + 1] = coreY + radForearm * Math.sin(ang);
      buf2[idx * 3 + 2] = coreZ + radForearm * Math.sin(ang + 1.0);
    }

    // 4. Ensemble poignet 3 axes J4-J5-J6 (de (0.40, 0.65, -0.15) à (0.75, 0.95, -0.05))
    for (let i = 0; i < wristPts; i++) {
      const idx = basePts + link1Pts + link2Pts + i;
      const t = (i % 40) / 39;
      const coreX = 0.40 + 0.35 * t;
      const coreY = 0.65 + 0.30 * t;
      const coreZ = -0.15 + 0.10 * t;
      const radWrist = 0.10 + 0.05 * Math.sin(t * Math.PI);
      const ang = i * 0.4;

      buf2[idx * 3] = coreX + radWrist * Math.cos(ang);
      buf2[idx * 3 + 1] = coreY + radWrist * Math.sin(ang);
      buf2[idx * 3 + 2] = coreZ + radWrist * Math.sin(ang * 2.0);
    }

    // 5. Préhenseur / Pince outil à doubles mors parallèles
    for (let i = 0; i < gripperPts; i++) {
      const idx = basePts + link1Pts + link2Pts + wristPts + i;
      const finger = i % 2 === 0 ? 1 : -1;
      const t = (i % 30) / 29;
      const offsetJaw = finger * 0.10;

      buf2[idx * 3] = 0.75 + 0.25 * t;
      buf2[idx * 3 + 1] = 0.95 + 0.20 * t + offsetJaw;
      buf2[idx * 3 + 2] = -0.05 + ((i % 5) - 2) * 0.03;
    }

    // =========================================================================
    // TOPOLOGIE 4 : MICROPROCESSOR_CORE_BUS (Cœur Microprocesseur & Bus Matriciel 3D)
    // Die de silicium rectangulaire central très dense, bus de données étagés et pistes 45°/90°
    // =========================================================================
    const buf3 = this.topologyBuffers[3];
    const dieCount = Math.floor(N * 0.35);
    const busCount = Math.floor(N * 0.40);
    const viaCount = N - dieCount - busCount;

    // 1. Cœur silicium central plan très dense (Die CPU multi-cœurs)
    for (let i = 0; i < dieCount; i++) {
      const gridSide = Math.max(2, Math.floor(Math.sqrt(dieCount)));
      const col = i % gridSide;
      const row = Math.floor(i / gridSide);
      const px = ((col / (gridSide - 1)) - 0.5) * 1.15;
      const py = ((row / (gridSide - 1)) - 0.5) * 1.15;
      const pz = ((i % 5) - 2) * 0.03;

      buf3[i * 3] = px;
      buf3[i * 3 + 1] = py;
      buf3[i * 3 + 2] = pz;
    }

    // 2. Bus de données orthogonaux étagés en 3 nappes (z = -0.15, 0.0, 0.15) avec chanfreins à 45°
    const numTraces = 20;
    for (let i = 0; i < busCount; i++) {
      const idx = dieCount + i;
      const traceId = i % numTraces;
      const progress = Math.floor(i / numTraces) / Math.max(1, busCount / numTraces - 1);
      const quadrant = traceId % 4; // 0=Top, 1=Right, 2=Bottom, 3=Left
      const busOffset = ((Math.floor(traceId / 4) - 2) / 2) * 0.38;
      const layerZ = ((traceId % 3) - 1) * 0.14;

      let bx = 0;
      let by = 0;

      if (progress < 0.4) {
        const segT = progress / 0.4;
        bx = (0.60 + segT * 0.35) * (quadrant === 1 || quadrant === 2 ? 1 : -1);
        by = busOffset;
      } else if (progress < 0.7) {
        const segT = (progress - 0.4) / 0.3;
        bx = (0.95 + segT * 0.30) * (quadrant === 1 || quadrant === 2 ? 1 : -1);
        by = busOffset + segT * 0.30 * (quadrant < 2 ? 1 : -1);
      } else {
        const segT = (progress - 0.7) / 0.3;
        bx = (1.25 + segT * 0.35) * (quadrant === 1 || quadrant === 2 ? 1 : -1);
        by = busOffset + 0.30 * (quadrant < 2 ? 1 : -1) + segT * 0.40 * (quadrant < 2 ? 1 : -1);
      }

      buf3[idx * 3] = bx;
      buf3[idx * 3 + 1] = by;
      buf3[idx * 3 + 2] = layerZ;
    }

    // 3. Matrice de micro-vias périphériques et pastilles BGA
    const viaCols = Math.max(2, Math.ceil(Math.sqrt(viaCount)));
    const viaSpacing = 3.2 / viaCols;
    for (let i = 0; i < viaCount; i++) {
      const idx = dieCount + busCount + i;
      const col = i % viaCols;
      const row = Math.floor(i / viaCols);
      const vx = (col - (viaCols - 1) / 2) * viaSpacing;
      const vy = (row - (viaCols - 1) / 2) * viaSpacing;
      const isHole = col % 2 === 0 && row % 2 === 0;

      buf3[idx * 3] = vx;
      buf3[idx * 3 + 1] = vy;
      buf3[idx * 3 + 2] = isHole ? -0.22 : -0.08;
    }

    // =========================================================================
    // TOPOLOGIE 5 : SCADA_SMART_FACTORY_NETWORK (Réseau Nodal SCADA & Smart Factory)
    // Grappes hiérarchiques connectées en 3 couches (Supervision, PLCs maîtres, E/S esclaves)
    // =========================================================================
    const buf4 = this.topologyBuffers[4];
    const topScadaPts = Math.floor(N * 0.20);
    const plcMasterPts = Math.floor(N * 0.35);
    const ioFieldPts = Math.floor(N * 0.30);
    const commBusPts = N - topScadaPts - plcMasterPts - ioFieldPts;

    // Niveau 1 : Supervision SCADA & Passerelle Cloud (y = 0.95, z = 0.30)
    for (let i = 0; i < topScadaPts; i++) {
      const u = topScadaPts > 1 ? i / topScadaPts : 0;
      const ang = u * Math.PI * 2 * 6;
      const r = 0.35 * Math.sqrt((i % 20) / 19);
      const subHub = i % 5;
      const hubOffsetX = subHub === 0 ? 0 : (subHub === 1 ? -0.4 : subHub === 2 ? 0.4 : subHub === 3 ? -0.2 : 0.2);
      const hubOffsetY = subHub === 0 ? 0 : (subHub < 3 ? 0.2 : -0.2);

      buf4[i * 3] = hubOffsetX + r * Math.cos(ang);
      buf4[i * 3 + 1] = 0.95 + hubOffsetY + r * Math.sin(ang);
      buf4[i * 3 + 2] = 0.30 + ((i % 7) - 3) * 0.04;
    }

    // Niveau 2 : Automates Maîtres PLCs (Anneau hexagonal à y = 0.05, z = -0.10)
    for (let i = 0; i < plcMasterPts; i++) {
      const idx = topScadaPts + i;
      const stationId = i % 6;
      const stationAngle = stationId * (Math.PI / 3);
      const stationR = 1.15;
      const centerX = Math.cos(stationAngle) * stationR;
      const centerY = 0.05 + Math.sin(stationAngle) * stationR * 0.55;
      const centerZ = -0.10;

      // Module PLC volumétrique (rack modulaire)
      const u = (i % 30) / 29;
      const v = (Math.floor(i / 30) % 15) / 14;
      const modX = (u - 0.5) * 0.25;
      const modY = (v - 0.5) * 0.35;
      const modZ = ((i % 5) - 2) * 0.05;

      buf4[idx * 3] = centerX + modX;
      buf4[idx * 3 + 1] = centerY + modY;
      buf4[idx * 3 + 2] = centerZ + modZ;
    }

    // Niveau 3 : E/S déportées esclaves et capteurs de terrain (y = -0.90, z = 0.20)
    for (let i = 0; i < ioFieldPts; i++) {
      const idx = topScadaPts + plcMasterPts + i;
      const dropId = i % 12;
      const dropAngle = dropId * (Math.PI / 6);
      const dropR = 1.45;
      const centerX = Math.cos(dropAngle) * dropR;
      const centerY = -0.90 + Math.sin(dropAngle) * 0.25;
      const centerZ = 0.20;

      const subU = ((i % 15) / 14) * Math.PI * 2;
      const subR = 0.12 * Math.sqrt((i % 7) / 6);

      buf4[idx * 3] = centerX + subR * Math.cos(subU);
      buf4[idx * 3 + 1] = centerY + subR * Math.sin(subU);
      buf4[idx * 3 + 2] = centerZ + ((i % 5) - 2) * 0.03;
    }

    // Bus de communication industriel (lignes de flux de paquets entre les niveaux)
    for (let i = 0; i < commBusPts; i++) {
      const idx = topScadaPts + plcMasterPts + ioFieldPts + i;
      const progress = i / Math.max(1, commBusPts - 1);
      const stationId = i % 6;
      const stationAngle = stationId * (Math.PI / 3);
      const stationR = 1.15;
      const masterX = Math.cos(stationAngle) * stationR;
      const masterY = 0.05 + Math.sin(stationAngle) * stationR * 0.55;

      // Trajet SCADA -> PLC ou PLC -> Field
      if (i % 2 === 0) {
        // SCADA vers PLC
        const t = (i % 50) / 49;
        buf4[idx * 3] = masterX * t;
        buf4[idx * 3 + 1] = 0.95 + (masterY - 0.95) * t;
        buf4[idx * 3 + 2] = 0.30 + (-0.10 - 0.30) * t;
      } else {
        // PLC vers Field Drop
        const t = (i % 50) / 49;
        const dropAngle = (stationId * 2 + (i % 2)) * (Math.PI / 6);
        const dropX = Math.cos(dropAngle) * 1.45;
        const dropY = -0.90;
        buf4[idx * 3] = masterX + (dropX - masterX) * t;
        buf4[idx * 3 + 1] = masterY + (dropY - masterY) * t;
        buf4[idx * 3 + 2] = -0.10 + (0.20 - (-0.10)) * t;
      }
    }

    // =========================================================================
    // TOPOLOGIE 6 : AWALE_GEOMETRIC_MATRIX (Matrice Géométrique Awalé)
    // Double rangée symétrique de 6 alvéoles toroïdales régulières interconnectées
    // =========================================================================
    const buf5 = this.topologyBuffers[5];
    const bowlPts = Math.floor(N * 0.60);
    const seedsPts = Math.floor(N * 0.20);
    const loopPts = N - bowlPts - seedsPts;

    // 1. Les 12 alvéoles toroïdales creuses régulières (2 rangées de 6 alvéoles)
    const ptsPerBowl = Math.max(1, Math.floor(bowlPts / 12));
    for (let i = 0; i < bowlPts; i++) {
      const bowlIdx = Math.floor(i / ptsPerBowl); // 0..11
      const isTopRow = bowlIdx < 6;
      const col = isTopRow ? bowlIdx : 11 - bowlIdx; // 0..5
      const bowlX = -1.25 + col * 0.50;
      const bowlY = isTopRow ? 0.48 : -0.48;

      const u = (i % ptsPerBowl) / ptsPerBowl;
      const phiBowl = u * Math.PI * 2 * 10;
      const thetaBowl = ((i % 25) / 24) * (Math.PI * 0.5);
      const radBowl = 0.20 * Math.sin(thetaBowl);
      const depthBowl = 0.25 * Math.cos(thetaBowl);

      buf5[i * 3] = bowlX + radBowl * Math.cos(phiBowl);
      buf5[i * 3 + 1] = bowlY + radBowl * Math.sin(phiBowl);
      buf5[i * 3 + 2] = -depthBowl;
    }

    // 2. Graines / jetons nodaux concentrés au fond de chaque alvéole
    const ptsPerSeedGroup = Math.max(1, Math.floor(seedsPts / 12));
    for (let i = 0; i < seedsPts; i++) {
      const idx = bowlPts + i;
      const bowlIdx = Math.floor(i / ptsPerSeedGroup);
      const isTopRow = bowlIdx < 6;
      const col = isTopRow ? bowlIdx : 11 - bowlIdx;
      const bowlX = -1.25 + col * 0.50;
      const bowlY = isTopRow ? 0.48 : -0.48;

      const seedAng = (i * 0.85);
      const seedR = 0.08 * Math.sqrt((i % 15) / 14);

      buf5[idx * 3] = bowlX + seedR * Math.cos(seedAng);
      buf5[idx * 3 + 1] = bowlY + seedR * Math.sin(seedAng);
      buf5[idx * 3 + 2] = -0.22 + ((i % 5) - 2) * 0.02;
    }

    // 3. Rails d'égrenage cyclique fermés et calebasses d'accumulation aux deux extrémités
    for (let i = 0; i < loopPts; i++) {
      const idx = bowlPts + seedsPts + i;
      const u = loopPts > 1 ? i / loopPts : 0;
      const trackAng = u * Math.PI * 2;
      const loopX = 1.48 * Math.cos(trackAng);
      const loopY = 0.52 * Math.sin(trackAng);
      const loopZ = 0.06 * Math.sin(trackAng * 6.0);

      buf5[idx * 3] = loopX;
      buf5[idx * 3 + 1] = loopY;
      buf5[idx * 3 + 2] = loopZ;
    }
  }

  /**
   * Construction de la géométrie Three.js avec ShaderMaterial haute performance.
   */
  private buildGeometry(): void {
    this.geometry = new THREE.BufferGeometry();
    this.positionAttribute = new THREE.BufferAttribute(this.currentPositions, 3);
    this.positionAttribute.setUsage(THREE.DynamicDrawUsage);
    this.geometry.setAttribute('position', this.positionAttribute);

    const isMobile = this.isMobile;
    const initialHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    // Matériau ShaderMaterial avec taille gl_PointSize dynamique et palette beige doré / cyan
    this.pointsMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uSize: { value: isMobile ? 16.0 : 18.0 },
        uScale: { value: initialHeight * 0.5 },
        uBaseColor: { value: new THREE.Color(0xE4E2BF) },
        uEnergyColor: { value: new THREE.Color(0x00F0FF) },
        uOpacity: { value: 0.88 },
        uEnergy: { value: 0.0 },
        uTouch: { value: new THREE.Vector2(0, 0) },
        uTouchActive: { value: 0.0 },
        uMeshScale: { value: 1.0 },
      },
      vertexShader: `
        uniform float uSize;
        uniform float uScale;
        uniform float uEnergy;
        uniform vec2 uTouch;
        uniform float uTouchActive;
        uniform float uMeshScale;

        varying float vEnergy;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // Calcul dynamique de gl_PointSize avec taille minimale garantie
          float pz = max(-mvPosition.z, 0.001);
          float dynamicSize = (uSize * uScale) / (350.0 * pz);
          gl_PointSize = clamp(dynamicSize, 2.0, 18.0);

          // Rayonnement d'énergie sous le toucher et avec la cinétique
          float dist = length(position.xy - uTouch);
          float glowRadius = 0.70 / max(uMeshScale, 0.001);
          float touchGlow = uTouchActive * smoothstep(glowRadius, 0.0, dist);
          vEnergy = clamp(uEnergy * 1.5 + touchGlow * 1.0, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uBaseColor;
        uniform vec3 uEnergyColor;
        uniform float uOpacity;

        varying float vEnergy;

        void main() {
          // Découpe circulaire nette et antialiasée (smoothstep)
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.15, dist) * uOpacity;

          // Teinte beige doré (#E4E2BF) avec accents cyan (#00F0FF) sous énergie
          vec3 col = mix(uBaseColor, uEnergyColor, vEnergy);
          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    this.pointsMesh = new THREE.Points(this.geometry, this.pointsMaterial);

    // Cadrage responsive initial
    const aspect = typeof window !== 'undefined' ? (window.innerWidth || 1) / (window.innerHeight || 1) : 1;
    const initialScale = aspect < 1.0 ? Math.max(0.55, aspect * 1.05) : 1.0;
    this.pointsMesh.scale.set(initialScale, initialScale, initialScale);

    if (this.geometry) {
      const activeCount = this.isMobile ? Math.min(this.pointCount, 6000) : this.pointCount;
      this.geometry.setDrawRange(0, activeCount);
    }

    this.scene.add(this.pointsMesh);

    // Lignes discrètes optionnelles sur desktop uniquement
    if (!this.isMobile) {
      const lineIndices = this.calculateCloseEdgeIndices(1200);
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute('position', this.positionAttribute);
      lineGeometry.setIndex(lineIndices);

      const linesMaterial = new THREE.LineBasicMaterial({
        color: 0xE4E2BF,
        transparent: true,
        opacity: 0.16,
        blending: THREE.NormalBlending,
        depthWrite: false,
      });
      this.linesMesh = new THREE.LineSegments(lineGeometry, linesMaterial);
      this.linesMesh.scale.set(initialScale, initialScale, initialScale);
      this.scene.add(this.linesMesh);
    }
  }

  /**
   * Calcul des arêtes spatialement proches pour desktop (max 1200 arêtes)
   */
  private calculateCloseEdgeIndices(maxEdges = 1200): number[] {
    const indices: number[] = [];
    const buf = this.topologyBuffers[0];
    const N = this.pointCount;
    const maxDist = 0.35;
    const maxDistSq = maxDist * maxDist;
    const minDistSq = 0.008;

    const cellSize = 0.45;
    const grid = new Map<string, number[]>();

    for (let i = 0; i < N; i++) {
      const cx = Math.floor(buf[i * 3] / cellSize);
      const cy = Math.floor(buf[i * 3 + 1] / cellSize);
      const cz = Math.floor(buf[i * 3 + 2] / cellSize);
      const key = `${cx},${cy},${cz}`;
      let cell = grid.get(key);
      if (!cell) {
        cell = [];
        grid.set(key, cell);
      }
      cell.push(i);
    }

    const neighborOffsets = [
      [0, 0, 0], [1, 0, 0], [-1, 0, 0],
      [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
    ];

    for (let i = 0; i < N && indices.length / 2 < maxEdges; i++) {
      const px = buf[i * 3];
      const py = buf[i * 3 + 1];
      const pz = buf[i * 3 + 2];
      const cx = Math.floor(px / cellSize);
      const cy = Math.floor(py / cellSize);
      const cz = Math.floor(pz / cellSize);

      for (const [ox, oy, oz] of neighborOffsets) {
        const neighborKey = `${cx + ox},${cy + oy},${cz + oz}`;
        const neighborPoints = grid.get(neighborKey);
        if (!neighborPoints) continue;

        for (let k = 0; k < neighborPoints.length; k++) {
          const j = neighborPoints[k];
          if (j <= i) continue;
          const dx = px - buf[j * 3];
          const dy = py - buf[j * 3 + 1];
          const dz = pz - buf[j * 3 + 2];
          const dSq = dx * dx + dy * dy + dz * dz;

          if (dSq >= minDistSq && dSq <= maxDistSq) {
            indices.push(i, j);
            if (indices.length / 2 >= maxEdges) break;
          }
        }
        if (indices.length / 2 >= maxEdges) break;
      }
    }

    if (indices.length < 100) {
      for (let i = 0; i < Math.min(N - 1, maxEdges); i++) {
        indices.push(i, i + 1);
      }
    }

    return indices;
  }

  /**
   * Découpage par section du portfolio
   */
  private handleScrollTopologyTrigger(scrollY: number): void {
    const sectionIds = ['home', 'profile', 'experience', 'projects', 'skills', 'contact'];

    if (typeof document !== 'undefined') {
      const vh = window.innerHeight || 800;
      const triggerY = vh * 0.4;

      let foundSection = false;
      let activeIdx = 0;

      for (let i = 0; i < sectionIds.length; i++) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          foundSection = true;
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerY && rect.bottom >= triggerY) {
            activeIdx = i;
            break;
          } else if (rect.top <= triggerY) {
            activeIdx = i;
          }
        }
      }

      if (foundSection) {
        if (activeIdx !== this.targetTopologyIndex) {
          this.setTopology(activeIdx);
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
    const nextTopologyIndex = Math.min(5, Math.floor(progress * 6));

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
    if (this.linesMesh) {
      this.linesMesh.scale.set(scale, scale, scale);
      if (this.isMobile) {
        this.linesMesh.visible = false;
      }
    }

    // Plafonnement du nombre de particules (6000 max sur mobile)
    if (this.geometry) {
      const activeCount = this.isMobile ? Math.min(this.pointCount, 6000) : this.pointCount;
      this.geometry.setDrawRange(0, activeCount);
    }

    // Plafonnement strict du pixel ratio à 1.5 max
    const rawDpr = window.devicePixelRatio || 1;
    const dpr = Math.min(rawDpr, 1.5);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);

    if (this.pointsMaterial) {
      this.pointsMaterial.uniforms.uScale.value = height * 0.5;
    }
  }

  /**
   * Boucle de trame synchronisée sur le singleton FrameManager.
   */
  private renderFrame(dt: number, time: number, isReducedMotion?: boolean): void {
    if (this.isDestroyed) return;

    // Coupure immédiate du moteur si l'onglet est masqué
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
    const count = this.isMobile ? Math.min(this.pointCount, 6000) : this.pointCount;

    // 1. Morphing vectoriel pur : currentPos[i] += (targetTopology[i] - currentPos[i]) * 0.045
    const targetBuf = this.topologyBuffers[this.targetTopologyIndex];
    const morphRate = 0.045;
    let hasMorphDelta = false;

    for (let i = 0; i < count * 3; i++) {
      const diff = targetBuf[i] - this.basePositions[i];
      if (Math.abs(diff) > 0.0001) {
        this.basePositions[i] += diff * morphRate;
        hasMorphDelta = true;
      } else {
        this.basePositions[i] = targetBuf[i];
      }
    }

    if (hasMorphDelta) {
      this.morphProgress = Math.min(1.0, this.morphProgress + morphRate);
    } else {
      this.morphProgress = 1.0;
    }

    // 2. Conversion spatiale unifiée dans le plan de coupe caméra (z = 0)
    const fovRad = (this.camera.fov * 0.5 * Math.PI) / 180;
    const halfH = Math.tan(fovRad) * this.camera.position.z;
    const halfW = halfH * this.camera.aspect;
    const targetX = this.normPointerX * halfW;
    const targetY = this.normPointerY * halfH;

    // Conversion spatiale dans le repère local de la sculpture 3D (rotation & échelle responsive)
    let localPointerX = targetX;
    let localPointerY = targetY;
    let localPointerZ = 0;
    let effectiveRadius = 0.65;
    const intensity = 1.0;

    if (this.pointsMesh) {
      this.pointsMesh.updateMatrixWorld();
      const tempVec = new THREE.Vector3(targetX, targetY, 0);
      this.pointsMesh.worldToLocal(tempVec);
      localPointerX = tempVec.x;
      localPointerY = tempVec.y;
      localPointerZ = tempVec.z;
      const meshScale = this.pointsMesh.scale.x || 1.0;
      effectiveRadius = 0.65 / meshScale;
    }

    // 3. Champ de répulsion volumétrique (Touch & Mouse Repulsion Field)
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
          this.offsetZ[i] += force * 0.25; // Expulsion subtile vers l'observateur
        }
      }
    }

    // 4. Amortissement élastique continu (* 0.88) & injection de la position finale
    const wavePhase = (time / 1000) * 3.0;
    const scrollEnergy = Math.min(Math.abs(this.scrollVelocityY) * 0.015, 0.35);
    const effectiveEnergy = Math.max(energy, scrollEnergy);
    const hasWave = !isReduced && effectiveEnergy > 0.001;
    const waveAmp = hasWave ? effectiveEnergy * 0.35 : 0.0;
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
      const wave = hasWave ? Math.sin(wavePhase + this.basePositions[idx + 1] * 2.5) * waveAmp : 0.0;

      this.currentPositions[idx] = this.basePositions[idx] + this.offsetX[i];
      this.currentPositions[idx + 1] = this.basePositions[idx + 1] + this.offsetY[i];
      this.currentPositions[idx + 2] = this.basePositions[idx + 2] + this.offsetZ[i] + wave;
    }

    this.hasDisplacement = hasWave || hasActiveOffsets;

    if (this.positionAttribute) {
      this.positionAttribute.needsUpdate = true;
    }

    this.scrollVelocityY *= 0.9;

    // Mise à jour des uniforms du shader
    if (this.pointsMaterial) {
      this.pointsMaterial.uniforms.uEnergy.value = energy;
      this.pointsMaterial.uniforms.uTouch.value.set(localPointerX, localPointerY);
      this.pointsMaterial.uniforms.uTouchActive.value = this.isPointerActive && !isReduced ? 1.0 : 0.0;
      this.pointsMaterial.uniforms.uMeshScale.value = this.pointsMesh ? this.pointsMesh.scale.x : 1.0;
    }

    // Gestion de l'affichage des arêtes (desktop uniquement)
    if (this.linesMesh) {
      if (this.isMobile) {
        this.linesMesh.visible = false;
      } else {
        this.linesMesh.visible = this.targetTopologyIndex === 0 || this.targetTopologyIndex === 4;
      }
    }

    // Rotation orbitale douce de la scène
    if (!isReduced && this.pointsMesh) {
      const rotationSpeedY = 0.06 * dt + this.mouseX * 0.01;
      this.pointsMesh.rotation.y += rotationSpeedY;
      this.pointsMesh.rotation.x = this.mouseY * 0.12;
      this.pointsMesh.position.x = this.mouseX * 0.15;
      this.pointsMesh.position.y = this.mouseY * 0.15;

      if (this.linesMesh && this.linesMesh.visible) {
        this.linesMesh.rotation.y = this.pointsMesh.rotation.y;
        this.linesMesh.rotation.x = this.pointsMesh.rotation.x;
        this.linesMesh.position.x = this.pointsMesh.position.x;
        this.linesMesh.position.y = this.pointsMesh.position.y;
      }
    }

    // Draw call unique Three.js
    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  private updateThemeColors(): void {
    if (typeof document === 'undefined') return;
    const isDark = document.documentElement.classList.contains('dark');
    if (this.pointsMaterial) {
      // Beige doré (#E4E2BF) avec accents cyan (#00F0FF) sous forte énergie
      this.pointsMaterial.uniforms.uBaseColor.value.setHex(isDark ? 0xE4E2BF : 0x524B38);
      this.pointsMaterial.uniforms.uEnergyColor.value.setHex(isDark ? 0x00F0FF : 0x0284C7);
    }
    if (this.linesMesh && this.linesMesh.material) {
      (this.linesMesh.material as THREE.LineBasicMaterial).color.setHex(isDark ? 0xE4E2BF : 0x524B38);
    }
  }

  public get morphProgressValue(): number {
    return this.morphProgress;
  }

  public get currentPositionsBuffer(): Float32Array {
    return this.currentPositions;
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

    if (this.linesMesh) {
      if (this.linesMesh.geometry) {
        this.linesMesh.geometry.dispose();
      }
      if (Array.isArray(this.linesMesh.material)) {
        this.linesMesh.material.forEach((m: THREE.Material) => m.dispose());
      } else {
        this.linesMesh.material.dispose();
      }
      this.scene.remove(this.linesMesh);
      this.linesMesh = null;
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
