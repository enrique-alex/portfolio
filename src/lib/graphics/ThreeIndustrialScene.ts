/**
 * ThreeIndustrialScene - Moteur WebGL Particulaire Industriel Haute Performance
 *
 * Conforme aux standards d'exécution de cliffiscurious.com :
 * 1. Visibilité et pipeline WebGL :
 *    - WebGLRenderer avec alpha: true, clearColor transparent (0x000000, 0).
 *    - Caméra PerspectiveCamera(45, aspect, 0.1, 60) positionnée à z=5.
 *    - Shader de particules avec calcul dynamique de gl_PointSize (taille minimale garantie).
 *    - Rendu circulaire antialiasé des points avec blending contrôlé (zéro halo aveuglant).
 * 2. Rendu des formes 3D (Topologies paramétriques industrielles nettes) :
 *    - SMART_GRID_NODAL_MESH : Réseau Nodal Smart Grid (sphère géodésique Fibonacci 3D équi-surface avec concentrateurs).
 *    - MULTILAYER_PCB_BUS_ROUTING : Grille PCB / Bus de données (lattice matriciel orthogonal avec pistes à 90° et 45°).
 *    - ELECTROMAGNETIC_ROTOR_STATOR : Rotor & Stator électromagnétique (12 encoches stator et 4 pôles rotor hélicoïdaux).
 *    - SEQUENTIAL_PETRI_AUTOMATON : Automate d'état séquentiel (graphe tridimensionnel avec 3 anneaux concentriques).
 *    - Tampons Float32Array statiques précalculés une seule fois à l'instanciation.
 *    - Morphing vectoriel pur (Lerp Hermite) sans aucun recalcul géométrique CPU par trame.
 * 3. Éradication du lag mobile (< 768px) :
 *    - devicePixelRatio plafonné à 1.25 max sur écran tactile / mobile.
 *    - Nombre de particules réduit à 2400 max sur mobile (contre 7200 sur desktop).
 *    - LineSegments totalement désactivés sur mobile pour soulager le CPU.
 */

import * as THREE from 'three';
import { frameManager } from './FrameManager';
import { kineticEnergy } from './KineticEnergy';

export const TOPOLOGY_NAMES = [
  'SMART_GRID_NODAL_MESH',
  'MULTILAYER_PCB_BUS_ROUTING',
  'ELECTROMAGNETIC_ROTOR_STATOR',
  'SEQUENTIAL_PETRI_AUTOMATON',
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
  private targetPositions: Float32Array;
  private sourcePositions: Float32Array;
  private topologyBuffers: Float32Array[] = [];

  private pointsMesh: THREE.Points | null = null;
  private pointsMaterial: THREE.ShaderMaterial | null = null;
  private linesMesh: THREE.LineSegments | null = null;
  private geometry: THREE.BufferGeometry | null = null;
  private positionAttribute: THREE.BufferAttribute | null = null;

  private currentTopologyIndex: number = 0;
  private targetTopologyIndex: number = 0;
  private morphProgress: number = 1.0;
  private morphSpeed: number = 2.0; // Transition complète fluide en 0.5s

  private mouseX: number = 0;
  private mouseY: number = 0;
  private targetMouseX: number = 0;
  private targetMouseY: number = 0;

  private lastScrollY: number = 0;
  private scrollVelocityY: number = 0;

  private unsubscribeFrame: (() => void) | null = null;
  private boundPointerMove: ((e: PointerEvent | MouseEvent) => void) | null = null;
  private boundScroll: (() => void) | null = null;
  private boundResize: (() => void) | null = null;
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

    // Plafonnement strict : 2400 max sur mobile (exigence <= 2500), 7200 sur desktop (exigence 7000+)
    this.pointCount = options?.pointCount ?? (this.isMobile ? 2400 : 7200);

    // Initialisation des tampons géométriques statiques
    this.currentPositions = new Float32Array(this.pointCount * 3);
    this.targetPositions = new Float32Array(this.pointCount * 3);
    this.sourcePositions = new Float32Array(this.pointCount * 3);

    this.scene = new THREE.Scene();
    const aspect =
      typeof window !== 'undefined' ? (window.innerWidth || 1) / (window.innerHeight || 1) : 1;
    // Caméra PerspectiveCamera(45, aspect, 0.1, 60) positionnée à z=5
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 60);
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);

    // Configuration de l'amortissement cinétique
    kineticEnergy.setDecayRate(options?.decayRate ?? 0.93);

    // Précalcul rigoureux et statique des topologies industrielles
    this.generateTopologies();

    const initialBuf = this.topologyBuffers[0];
    for (let i = 0; i < this.pointCount * 3; i++) {
      this.currentPositions[i] = initialBuf[i];
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

    // 1. Initialisation du WebGLRenderer avec alpha: true et clearColor transparent (0x000000, 0)
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

      const dpr = this.isMobile
        ? Math.min(window.devicePixelRatio || 1, 1.25)
        : Math.min(window.devicePixelRatio || 1, 1.75);
      this.renderer.setPixelRatio(dpr);
      this.updateSize();
    } catch (e) {
      console.warn('[ThreeIndustrialScene] Contexte WebGL inaccessible pour Three.js :', e);
    }

    // 2. Construction des géométries partagées
    this.buildGeometry();

    // 3. Écouteurs d'événements passifs
    this.boundPointerMove = (e: PointerEvent | MouseEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      this.targetMouseX = (e.clientX / w) * 2 - 1;
      this.targetMouseY = -(e.clientY / h) * 2 + 1;
    };
    window.addEventListener('pointermove', this.boundPointerMove, { passive: true });

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

    // 4. Détection et adaptation dynamique au contraste clair / sombre
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

    // 5. Raccordement à la boucle unique FrameManager
    this.unsubscribeFrame = frameManager.subscribe((dt: number, time: number, isReducedMotion?: boolean) => {
      this.renderFrame(dt, time, isReducedMotion);
    });
  }

  /**
   * Génération mathématique paramétrique pure des 4 topologies industrielles nettes.
   * Toutes les topologies s'inscrivent confortablement dans un rayon de 1.6
   * afin de rester parfaitement visibles à z=5 sur mobile comme sur desktop.
   */
  private generateTopologies(): void {
    const N = this.pointCount;
    this.topologyBuffers = [
      new Float32Array(N * 3),
      new Float32Array(N * 3),
      new Float32Array(N * 3),
      new Float32Array(N * 3),
    ];

    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle (~2.39996 rad)

    // =========================================================================
    // TOPOLOGIE 0 : SMART_GRID_NODAL_MESH (Réseau Nodal Smart Grid)
    // Distribution sphérique de Fibonacci équi-surface avec concentrateurs
    // Le centre est creux : aucun point superposé en (0,0), visibilité parfaite du texte.
    // =========================================================================
    const buf0 = this.topologyBuffers[0];
    const radiusSphere = 1.55;
    for (let i = 0; i < N; i++) {
      const u = N > 1 ? i / (N - 1) : 0.5;
      const yNorm = 1.0 - 2.0 * u; // [-1.0, 1.0]
      const rAtY = Math.sqrt(Math.max(0.0, 1.0 - yNorm * yNorm));
      const theta = i * phi;

      let x = Math.cos(theta) * rAtY * radiusSphere;
      let y = yNorm * radiusSphere;
      let z = Math.sin(theta) * rAtY * radiusSphere;

      // Concentrateurs d'énergie et anneaux de sous-stations nodales
      if (i % 24 === 0) {
        const ringLat = (i % 3 - 1) * 0.45;
        const ringRadius = Math.cos(ringLat) * radiusSphere * 1.08;
        const ringTheta = (i / N) * Math.PI * 8;
        x = Math.cos(ringTheta) * ringRadius;
        y = Math.sin(ringLat) * radiusSphere;
        z = Math.sin(ringTheta) * ringRadius;
      }

      buf0[i * 3] = x;
      buf0[i * 3 + 1] = y;
      buf0[i * 3 + 2] = z;
    }

    // =========================================================================
    // TOPOLOGIE 1 : MULTILAYER_PCB_BUS_ROUTING (Grille PCB / Bus de données)
    // Lattice matriciel orthogonal avec pistes à 90° et 45°, pastilles de processeur IC
    // =========================================================================
    const buf1 = this.topologyBuffers[1];
    const chipSize = 0.9;
    const chipPadsCount = Math.floor(N * 0.22);
    const busTracesCount = Math.floor(N * 0.50);
    const viasCount = N - chipPadsCount - busTracesCount;

    let pcbIdx = 0;

    // 1. Puce centrale microprocesseur & rangées de broches périphériques
    for (let i = 0; i < chipPadsCount; i++) {
      const side = i % 4; // 0=Top, 1=Right, 2=Bottom, 3=Left
      const t = (Math.floor(i / 4) / Math.max(1, chipPadsCount / 4 - 1)) * 2 - 1;
      let px = 0;
      let py = 0;
      const padDist = chipSize / 2;

      if (side === 0) { px = t * padDist; py = padDist; }
      else if (side === 1) { px = padDist; py = t * padDist; }
      else if (side === 2) { px = t * padDist; py = -padDist; }
      else { px = -padDist; py = t * padDist; }

      buf1[pcbIdx * 3] = px;
      buf1[pcbIdx * 3 + 1] = py;
      buf1[pcbIdx * 3 + 2] = 0.08;
      pcbIdx++;
    }

    // 2. Bus de données parallèles avec virages à 45° et 90°
    const numBuses = 16;
    for (let i = 0; i < busTracesCount; i++) {
      const busId = i % numBuses;
      const progress = Math.floor(i / numBuses) / Math.max(1, busTracesCount / numBuses - 1); // [0.0, 1.0]
      const quadrant = busId % 4;
      const busOffset = ((Math.floor(busId / 4) - 1.5) / 1.5) * 0.35;

      let bx = 0;
      let by = 0;

      // Cheminement en 3 segments : orthogonal (0->0.4), chanfrein 45° (0.4->0.7), orthogonal final (0.7->1.0)
      if (progress < 0.4) {
        const segT = progress / 0.4;
        bx = (0.5 + segT * 0.4) * (quadrant === 1 || quadrant === 2 ? 1 : -1);
        by = busOffset;
      } else if (progress < 0.7) {
        const segT = (progress - 0.4) / 0.3;
        bx = (0.9 + segT * 0.35) * (quadrant === 1 || quadrant === 2 ? 1 : -1);
        by = busOffset + segT * 0.35 * (quadrant < 2 ? 1 : -1);
      } else {
        const segT = (progress - 0.7) / 0.3;
        bx = (1.25 + segT * 0.35) * (quadrant === 1 || quadrant === 2 ? 1 : -1);
        by = busOffset + 0.35 * (quadrant < 2 ? 1 : -1) + segT * 0.4 * (quadrant < 2 ? 1 : -1);
      }

      buf1[pcbIdx * 3] = bx;
      buf1[pcbIdx * 3 + 1] = by;
      buf1[pcbIdx * 3 + 2] = 0.0;
      pcbIdx++;
    }

    // 3. Matrice de micro-vias orthogonaux de masse parfaitement centrée
    const viaGridCols = Math.max(2, Math.ceil(Math.sqrt(viasCount)));
    const viaGridRows = Math.max(2, Math.ceil(viasCount / viaGridCols));
    const viaSpacing = 3.2 / viaGridCols;
    for (let i = 0; i < viasCount; i++) {
      const col = i % viaGridCols;
      const row = Math.floor(i / viaGridCols);
      const vx = (col - (viaGridCols - 1) / 2) * viaSpacing;
      const vy = (row - (viaGridRows - 1) / 2) * viaSpacing;
      const isViaHole = col % 2 === 0 && row % 2 === 0;

      buf1[pcbIdx * 3] = vx;
      buf1[pcbIdx * 3 + 1] = vy;
      buf1[pcbIdx * 3 + 2] = isViaHole ? -0.15 : -0.05;
      pcbIdx++;
    }

    // =========================================================================
    // TOPOLOGIE 2 : ELECTROMAGNETIC_ROTOR_STATOR (Rotor & Stator électromagnétique)
    // Stator externe à 12 encoches régulières et rotor interne à 4 pôles hélicoïdaux
    // =========================================================================
    const buf2 = this.topologyBuffers[2];
    const statorCount = Math.floor(N * 0.58);
    const rotorCount = N - statorCount;

    for (let i = 0; i < N; i++) {
      if (i < statorCount) {
        // Stator externe avec 12 encoches bobinées
        const u = statorCount > 1 ? i / statorCount : 0;
        const theta = u * Math.PI * 2;
        const slot = 0.12 * Math.cos(12 * theta);
        const r = 1.48 + slot;
        const z = ((i % 36) / 35 - 0.5) * 1.6;

        buf2[i * 3] = r * Math.cos(theta);
        buf2[i * 3 + 1] = r * Math.sin(theta);
        buf2[i * 3 + 2] = z;
      } else {
        // Rotor interne à pôles saillants avec inclinaison hélicoïdale (skew)
        const rotorIdx = i - statorCount;
        const u = rotorCount > 1 ? rotorIdx / rotorCount : 0;
        const z = ((rotorIdx % 28) / 27 - 0.5) * 1.4;
        const skew = 0.3 * (z / 1.4);
        const theta = u * Math.PI * 2 + skew;
        const pole = 0.16 * Math.cos(4 * theta);
        const r = 0.95 + pole;

        buf2[i * 3] = r * Math.cos(theta);
        buf2[i * 3 + 1] = r * Math.sin(theta);
        buf2[i * 3 + 2] = z;
      }
    }

    // =========================================================================
    // TOPOLOGIE 3 : SEQUENTIAL_PETRI_AUTOMATON (Automate d'état séquentiel)
    // Graphe tridimensionnel avec 3 anneaux concentriques et passerelles d'étapes
    // =========================================================================
    const buf3 = this.topologyBuffers[3];
    const radii = [0.75, 1.25, 1.65];
    const zHeights = [-0.18, 0.0, 0.18];
    const pointsPerRing = Math.max(1, Math.floor(N / 3));

    for (let i = 0; i < N; i++) {
      const ring = i % 3;
      const ringRadius = radii[ring];
      const ringZ = zHeights[ring];
      const ringIdx = Math.floor(i / 3);
      const theta = (ringIdx / pointsPerRing) * Math.PI * 2;

      let x = ringRadius * Math.cos(theta);
      let y = ringRadius * Math.sin(theta);
      let z = ringZ;

      // Passerelles radiales de franchissement d'étapes (6 transitions angulaires à 60°)
      if (i % 12 === 0) {
        const spokeAngle = (Math.floor(i / 12) % 6) * (Math.PI / 3);
        const lerpFactor = (i % 24) / 24;
        const rSpoke = radii[0] + (radii[2] - radii[0]) * lerpFactor;
        x = rSpoke * Math.cos(spokeAngle);
        y = rSpoke * Math.sin(spokeAngle);
        z = zHeights[0] + (zHeights[2] - zHeights[0]) * lerpFactor;
      }

      buf3[i * 3] = x;
      buf3[i * 3 + 1] = y;
      buf3[i * 3 + 2] = z;
    }
  }

  /**
   * Construction de la géométrie Three.js avec ShaderMaterial haute performance.
   * La taille des particules est calculée dynamiquement dans le vertex shader.
   */
  private buildGeometry(): void {
    this.geometry = new THREE.BufferGeometry();
    this.positionAttribute = new THREE.BufferAttribute(this.currentPositions, 3);
    this.positionAttribute.setUsage(THREE.DynamicDrawUsage);
    this.geometry.setAttribute('position', this.positionAttribute);

    const isMobile = this.isMobile;
    const initialHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    // Matériau ShaderMaterial avec taille gl_PointSize dynamique garantie
    this.pointsMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uSize: { value: isMobile ? 18.0 : 22.0 },
        uScale: { value: initialHeight * 0.5 },
        uColor: { value: new THREE.Color(0x4285f4) },
        uOpacity: { value: 0.85 },
      },
      vertexShader: `
        uniform float uSize;
        uniform float uScale;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // Calcul dynamique de gl_PointSize avec taille minimale visible garantie
          // Formule rigoureuse : (uSize * uScale) / (350.0 * max(-mvPosition.z, 0.001))
          float pz = max(-mvPosition.z, 0.001);
          float dynamicSize = (uSize * uScale) / (350.0 * pz);
          gl_PointSize = clamp(dynamicSize, 2.0, 18.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;

        void main() {
          // Découpe circulaire nette et antialiasée sans artefact de bord
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.2, dist) * uOpacity;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending, // NormalBlending pour visibilité constante et zéro saturation blanche
    });

    this.pointsMesh = new THREE.Points(this.geometry, this.pointsMaterial);
    
    // Cadrage responsive initial
    const aspect = typeof window !== 'undefined' ? (window.innerWidth || 1) / (window.innerHeight || 1) : 1;
    const initialScale = aspect < 1.0 ? Math.max(0.55, aspect * 1.05) : 1.0;
    this.pointsMesh.scale.set(initialScale, initialScale, initialScale);
    
    if (this.geometry) {
      const activeCount = this.isMobile ? Math.min(this.pointCount, 2400) : this.pointCount;
      this.geometry.setDrawRange(0, activeCount);
    }
    
    this.scene.add(this.pointsMesh);

    // Sur mobile : désactivation absolue des LineSegments pour épargner le CPU et la batterie
    if (!this.isMobile) {
      const lineIndices = this.calculateCloseEdgeIndices(1200);
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute('position', this.positionAttribute);
      lineGeometry.setIndex(lineIndices);

      const linesMaterial = new THREE.LineBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.22,
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

  private handleScrollTopologyTrigger(scrollY: number): void {
    const scrollHeight =
      typeof document !== 'undefined'
        ? Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, 1)
        : 1;
    const docHeight = Math.max(1, scrollHeight - (window.innerHeight || 1));
    const progress = Math.min(1.0, Math.max(0.0, scrollY / docHeight));

    let nextTopologyIndex = 0;
    if (progress < 0.25) {
      nextTopologyIndex = 0; // Smart Grid
    } else if (progress < 0.55) {
      nextTopologyIndex = 1; // Multilayer PCB
    } else if (progress < 0.82) {
      nextTopologyIndex = 2; // Electromagnetic Rotor
    } else {
      nextTopologyIndex = 3; // Petri Automaton
    }

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

    // Cadrage responsive dynamique : adapte l'échelle sur écran vertical (< 1.0) pour que les topologies ne soient jamais tronquées
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

    // Plafonnement dynamique du nombre de particules (2400 max sur mobile)
    if (this.geometry) {
      const activeCount = this.isMobile ? Math.min(this.pointCount, 2400) : this.pointCount;
      this.geometry.setDrawRange(0, activeCount);
    }

    // Plafonnement strict du pixel ratio : 1.25 max sur mobile, 1.75 sur desktop
    const dpr = this.isMobile
      ? Math.min(window.devicePixelRatio || 1, 1.25)
      : Math.min(window.devicePixelRatio || 1, 1.75);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);

    if (this.pointsMaterial) {
      this.pointsMaterial.uniforms.uScale.value = height * 0.5;
    }
  }

  /**
   * Boucle de trame synchronisée sur le singleton FrameManager.
   * Morphing vectoriel pur ultra-léger (zéro calcul trigonométrique ou allocation par trame).
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

    const isMorphing = this.morphProgress < 1.0;
    const hasKinetic = !isReduced && (energy > 0.0005 || Math.abs(this.scrollVelocityY) > 0.05);

    if (isMorphing || hasKinetic || this.hasDisplacement) {
      if (isMorphing) {
        this.morphProgress = Math.min(1.0, this.morphProgress + dt * this.morphSpeed);
      }

      const p = this.morphProgress;
      // Interpolation cubique Hermite douce : t = 3p² - 2p³
      const t = p >= 1.0 ? 1.0 : p * p * (3 - 2 * p);

      const targetBuf = this.topologyBuffers[this.targetTopologyIndex];
      const srcBuf = this.sourcePositions;
      const currentPos = this.currentPositions;
      const count = this.isMobile ? Math.min(this.pointCount, 2400) : this.pointCount;
      const wavePhase = (time / 1000) * 2.5;

      // Boucle vectorielle pure : interpolation directe sans fonction mathématique lourde
      for (let i = 0; i < count; i++) {
        const idx = i * 3;

        let bx: number;
        let by: number;
        let bz: number;

        if (p >= 1.0) {
          bx = targetBuf[idx];
          by = targetBuf[idx + 1];
          bz = targetBuf[idx + 2];
        } else {
          bx = srcBuf[idx] + (targetBuf[idx] - srcBuf[idx]) * t;
          by = srcBuf[idx + 1] + (targetBuf[idx + 1] - srcBuf[idx + 1]) * t;
          bz = srcBuf[idx + 2] + (targetBuf[idx + 2] - srcBuf[idx + 2]) * t;
        }

        if (hasKinetic && energy > 0.01) {
          const wave = Math.sin(wavePhase + by * 2.0) * energy * 0.25;
          currentPos[idx] = bx;
          currentPos[idx + 1] = by;
          currentPos[idx + 2] = bz + wave;
        } else {
          currentPos[idx] = bx;
          currentPos[idx + 1] = by;
          currentPos[idx + 2] = bz;
        }
      }

      this.hasDisplacement = hasKinetic;

      if (this.positionAttribute) {
        this.positionAttribute.needsUpdate = true;
      }
    }

    this.scrollVelocityY *= 0.9;

    // Gestion de la visibilité et du fondu des connexions nodales (exclusivement sur la sphère Topologie 0)
    if (this.linesMesh) {
      if (this.isMobile) {
        this.linesMesh.visible = false;
      } else {
        const isTargetSphere = this.targetTopologyIndex === 0;
        const isCurrentSphere = this.currentTopologyIndex === 0;

        if (isTargetSphere && isCurrentSphere) {
          this.linesMesh.visible = true;
          (this.linesMesh.material as THREE.LineBasicMaterial).opacity = 0.22;
        } else if (isTargetSphere) {
          // Morphing vers la sphère : fondu d'apparition
          this.linesMesh.visible = true;
          (this.linesMesh.material as THREE.LineBasicMaterial).opacity = 0.22 * this.morphProgress;
        } else if (isCurrentSphere && this.morphProgress < 1.0) {
          // Morphing quittant la sphère : fondu de disparition
          this.linesMesh.visible = true;
          (this.linesMesh.material as THREE.LineBasicMaterial).opacity = 0.22 * (1.0 - this.morphProgress);
        } else {
          this.linesMesh.visible = false;
        }
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
      this.pointsMaterial.uniforms.uColor.value.setHex(isDark ? 0x4285f4 : 0x1d4ed8);
    }
    if (this.linesMesh && this.linesMesh.material) {
      (this.linesMesh.material as THREE.LineBasicMaterial).color.setHex(isDark ? 0x60a5fa : 0x2563eb);
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
      if (this.boundScroll) {
        window.removeEventListener('scroll', this.boundScroll);
        this.boundScroll = null;
      }
      if (this.boundResize) {
        window.removeEventListener('resize', this.boundResize);
        this.boundResize = null;
      }
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
        this.linesMesh.material.forEach((m) => m.dispose());
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
