/**
 * FrameManager - Singleton RAF unique
 * 
 * - Centralise la boucle requestAnimationFrame pour toute l'application.
 * - Calcule un delta-time (dt) précis en secondes, plafonné strictement à 0.1s (100ms)
 *   pour éviter tout saut quantique après une perte de focus ou un lag.
 * - Suspension immédiate lors du basculement d'onglet via l'API visibilitychange (document.hidden).
 * - Respecte la préférence utilisateur `prefers-reduced-motion: reduce`.
 * - SSR-safe (vérifications d'environnement window / document).
 */

export type FrameCallback = (dt: number, time: number, isReducedMotion?: boolean) => void;

interface LegacyMediaQueryList {
  addListener?: (listener: (e: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (e: MediaQueryListEvent) => void) => void;
}

export class FrameManager {
  private static instance: FrameManager | null = null;

  public static readonly MAX_DT: number = 0.1; // 100 ms

  private subscribers: Set<FrameCallback> = new Set();
  private rafId: number | null = null;
  private lastTime: number = 0;
  private isPaused: boolean = false; // Pause manuelle explicite
  private isVisibilityHidden: boolean = false; // Suspension par document.hidden
  private prefersReducedMotion: boolean = false;

  private boundVisibilityChange: (() => void) | null = null;
  private boundMotionChange: ((e: MediaQueryListEvent) => void) | null = null;
  private motionQuery: MediaQueryList | null = null;

  private constructor() {
    this.init();
  }

  public static getInstance(): FrameManager {
    if (!FrameManager.instance) {
      FrameManager.instance = new FrameManager();
    }
    return FrameManager.instance;
  }

  private init(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    this.isVisibilityHidden = typeof document.hidden === 'boolean' ? document.hidden : false;

    // Suspension immédiate lors du basculement d'onglet via l'API visibilitychange (document.hidden)
    this.boundVisibilityChange = () => {
      if (document.hidden) {
        this.isVisibilityHidden = true;
        this.stopLoop();
      } else {
        this.isVisibilityHidden = false;
        if (!this.isPaused && this.subscribers.size > 0) {
          this.startLoop();
        }
      }
    };
    document.addEventListener('visibilitychange', this.boundVisibilityChange);

    // Respect de prefers-reduced-motion
    if (typeof window.matchMedia === 'function') {
      try {
        this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.prefersReducedMotion = this.motionQuery.matches;

        this.boundMotionChange = (e: MediaQueryListEvent) => {
          this.prefersReducedMotion = e.matches;
        };

        if (typeof this.motionQuery.addEventListener === 'function') {
          this.motionQuery.addEventListener('change', this.boundMotionChange);
        } else {
          const legacy = this.motionQuery as unknown as LegacyMediaQueryList;
          legacy.addListener?.(this.boundMotionChange);
        }
      } catch {
        // Fallback silencieux si matchMedia est limité dans l'environnement d'exécution
      }
    }
  }

  public subscribe(callback: FrameCallback): () => void {
    this.subscribers.add(callback);

    // Démarrage de la boucle si inactive et conditions d'affichage réunies
    if (!this.isPaused && !this.isVisibilityHidden && this.rafId === null) {
      const isHidden = typeof document !== 'undefined' && document.hidden;
      if (!isHidden) {
        this.startLoop();
      }
    }

    return () => {
      this.unsubscribe(callback);
    };
  }

  public unsubscribe(callback: FrameCallback): void {
    this.subscribers.delete(callback);

    // Si plus aucun abonné, extinction de la boucle RAF pour épargner le CPU/GPU
    if (this.subscribers.size === 0 && this.rafId !== null) {
      this.stopLoop();
    }
  }

  public pause(): void {
    this.isPaused = true;
    this.stopLoop();
  }

  public resume(): void {
    this.isPaused = false;
    const isHidden = (typeof document !== 'undefined' && document.hidden) || this.isVisibilityHidden;
    if (isHidden || this.subscribers.size === 0) {
      return;
    }

    this.startLoop();
  }

  private startLoop(): void {
    if (this.rafId !== null) return;
    if (this.isPaused || this.isVisibilityHidden) return;
    if (typeof document !== 'undefined' && document.hidden) return;
    if (typeof requestAnimationFrame === 'undefined') return;

    this.lastTime = 0;
    this.rafId = requestAnimationFrame(this.tick);
  }

  private stopLoop(): void {
    if (this.rafId !== null) {
      if (typeof cancelAnimationFrame !== 'undefined') {
        cancelAnimationFrame(this.rafId);
      }
      this.rafId = null;
    }
    this.lastTime = 0;
  }

  private tick = (timestamp: DOMHighResTimeStamp): void => {
    if (this.isPaused || this.isVisibilityHidden || this.subscribers.size === 0) {
      this.stopLoop();
      return;
    }

    const now = typeof timestamp === 'number' && timestamp > 0
      ? timestamp
      : (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());
    let rawDt = this.lastTime > 0 ? (now - this.lastTime) / 1000 : 0;
    if (rawDt < 0) rawDt = 0;

    // Plafonnement strict du dt à 0.1s
    const dt = Math.min(rawDt, FrameManager.MAX_DT);
    this.lastTime = now;

    // Itération sécurisée sur une copie pour autoriser les désabonnements en cours d'exécution
    const currentSubscribers = Array.from(this.subscribers);
    for (let i = 0; i < currentSubscribers.length; i++) {
      try {
        currentSubscribers[i](dt, now, this.prefersReducedMotion);
      } catch (error) {
        console.error('[FrameManager] Error inside subscriber callback:', error);
      }
    }

    if (this.subscribers.size > 0 && !this.isPaused && !this.isVisibilityHidden) {
      if (typeof requestAnimationFrame !== 'undefined') {
        this.rafId = requestAnimationFrame(this.tick);
      } else {
        this.rafId = null;
      }
    } else {
      this.stopLoop();
    }
  };

  public get isRunning(): boolean {
    return this.rafId !== null;
  }

  public get isReducedMotion(): boolean {
    return this.prefersReducedMotion;
  }

  public get subscriberCount(): number {
    return this.subscribers.size;
  }

  public setReducedMotionForTesting(value: boolean): void {
    this.prefersReducedMotion = value;
  }

  public setVisibilityHiddenForTesting(value: boolean): void {
    this.isVisibilityHidden = value;
    if (value) {
      this.stopLoop();
    } else if (!this.isPaused && this.subscribers.size > 0) {
      this.startLoop();
    }
  }

  public resetForTesting(): void {
    this.stopLoop();
    this.subscribers.clear();
    this.isPaused = false;
    this.isVisibilityHidden = false;
    this.prefersReducedMotion = false;
    this.lastTime = 0;
  }

  public destroy(): void {
    this.resetForTesting();
    if (typeof document !== 'undefined' && this.boundVisibilityChange) {
      document.removeEventListener('visibilitychange', this.boundVisibilityChange);
      this.boundVisibilityChange = null;
    }
    if (this.motionQuery && this.boundMotionChange) {
      if (typeof this.motionQuery.removeEventListener === 'function') {
        this.motionQuery.removeEventListener('change', this.boundMotionChange);
      } else {
        const legacy = this.motionQuery as unknown as LegacyMediaQueryList;
        legacy.removeListener?.(this.boundMotionChange);
      }
      this.boundMotionChange = null;
      this.motionQuery = null;
    }
  }
}

export const frameManager = FrameManager.getInstance();
