/**
 * KineticEnergy - Accumulateur d'énergie cinétique avec amortissement exponentiel
 * 
 * - Écouteurs passifs sur window scroll et mousemove pour ne jamais bloquer le thread UI.
 * - Accumulation bornée dans l'intervalle [0.0, 1.0].
 * - Amortissement exponentiel continu (decay) indépendant du framerate :
 *   E(t + dt) = E(t) * exp(-decayRate * dt)
 * - Intégration dynamique et continue avec le singleton FrameManager (veille automatique à 0 énergie).
 * - Respect de prefers-reduced-motion (énergie maintenue à 0 en mode réduit).
 * - SSR-safe.
 */

import { frameManager } from './FrameManager';

export class KineticEnergy {
  private static instance: KineticEnergy | null = null;

  public static readonly DEFAULT_DECAY_RATE: number = 2.5; // Taux d'amortissement par seconde
  public static readonly ENERGY_THRESHOLD: number = 0.0001; // Seuil d'extinction

  private energy: number = 0;
  private decayRate: number = KineticEnergy.DEFAULT_DECAY_RATE;

  private lastMouseX: number | null = null;
  private lastMouseY: number | null = null;
  private lastScrollY: number | null = null;

  private unsubscribeFrame: (() => void) | null = null;
  private boundMouseMove: ((e: MouseEvent) => void) | null = null;
  private boundScroll: (() => void) | null = null;

  private constructor() {
    this.init();
  }

  public static getInstance(): KineticEnergy {
    if (!KineticEnergy.instance) {
      KineticEnergy.instance = new KineticEnergy();
    }
    return KineticEnergy.instance;
  }

  private init(): void {
    if (typeof window !== 'undefined') {
      // Écouteurs passifs sur scroll et mousemove
      this.boundMouseMove = (e: MouseEvent) => {
        this.handleMouseMove(e.clientX, e.clientY);
      };

      this.boundScroll = () => {
        if (typeof window !== 'undefined') {
          this.handleScroll(window.scrollY);
        }
      };

      window.addEventListener('mousemove', this.boundMouseMove, { passive: true });
      window.addEventListener('scroll', this.boundScroll, { passive: true });
    }
  }

  public attachFrameManager(): void {
    if (this.unsubscribeFrame) return; // Déjà abonné
    this.unsubscribeFrame = frameManager.subscribe((dt: number) => {
      this.update(dt);
    });
  }

  public detachFrameManager(): void {
    if (this.unsubscribeFrame) {
      this.unsubscribeFrame();
      this.unsubscribeFrame = null;
    }
  }

  public handleMouseMove(clientX: number, clientY: number): void {
    if (frameManager.isReducedMotion) {
      this.energy = 0;
      this.detachFrameManager();
      return;
    }

    if (this.lastMouseX === null || this.lastMouseY === null) {
      this.lastMouseX = clientX;
      this.lastMouseY = clientY;
      return;
    }

    const dx = clientX - this.lastMouseX;
    const dy = clientY - this.lastMouseY;
    this.lastMouseX = clientX;
    this.lastMouseY = clientY;

    const distance = Math.hypot(dx, dy);
    // Un déplacement vif de 500px cumule 1.0 d'énergie
    this.addEnergy(distance * 0.002);
  }

  public handleScroll(scrollY: number): void {
    if (frameManager.isReducedMotion) {
      this.energy = 0;
      this.detachFrameManager();
      return;
    }

    if (this.lastScrollY === null) {
      this.lastScrollY = scrollY;
      return;
    }

    const delta = Math.abs(scrollY - this.lastScrollY);
    this.lastScrollY = scrollY;

    // Un scroll vif de 300px cumule 0.6 d'énergie
    this.addEnergy(delta * 0.002);
  }

  public addEnergy(amount: number): void {
    if (amount <= 0 || Number.isNaN(amount)) return;
    if (frameManager.isReducedMotion) {
      this.energy = 0;
      this.detachFrameManager();
      return;
    }
    this.energy = Math.min(1.0, Math.max(0, this.energy + amount));
    if (this.energy > KineticEnergy.ENERGY_THRESHOLD) {
      this.attachFrameManager();
    }
  }

  public setEnergy(value: number): void {
    if (Number.isNaN(value)) return;
    this.energy = Math.min(1.0, Math.max(0, value));
    if (this.energy > KineticEnergy.ENERGY_THRESHOLD) {
      this.attachFrameManager();
    } else {
      this.energy = 0;
      this.detachFrameManager();
    }
  }

  public getEnergy(): number {
    return this.energy;
  }

  public setDecayRate(rate: number): void {
    if (rate >= 0 && !Number.isNaN(rate)) {
      this.decayRate = rate;
    }
  }

  public getDecayRate(): number {
    return this.decayRate;
  }

  public get isSubscribed(): boolean {
    return this.unsubscribeFrame !== null;
  }

  /**
   * Applique l'amortissement exponentiel continu pour une durée dt (en secondes)
   * Formule : E(t + dt) = E(t) * e^(-decayRate * dt)
   */
  public update(dt: number): number {
    if (dt <= 0 || Number.isNaN(dt)) {
      return this.energy;
    }

    if (this.energy > KineticEnergy.ENERGY_THRESHOLD) {
      this.energy = this.energy * Math.exp(-this.decayRate * dt);
      if (this.energy <= KineticEnergy.ENERGY_THRESHOLD) {
        this.energy = 0;
        this.detachFrameManager();
      }
    } else {
      this.energy = 0;
      this.detachFrameManager();
    }

    return this.energy;
  }

  public resetForTesting(): void {
    this.detachFrameManager();
    this.energy = 0;
    this.lastMouseX = null;
    this.lastMouseY = null;
    this.lastScrollY = null;
    this.decayRate = KineticEnergy.DEFAULT_DECAY_RATE;
  }

  public destroy(): void {
    this.detachFrameManager();

    if (typeof window !== 'undefined') {
      if (this.boundMouseMove) {
        window.removeEventListener('mousemove', this.boundMouseMove);
        this.boundMouseMove = null;
      }
      if (this.boundScroll) {
        window.removeEventListener('scroll', this.boundScroll);
        this.boundScroll = null;
      }
    }

    this.resetForTesting();
  }
}

export const kineticEnergy = KineticEnergy.getInstance();
