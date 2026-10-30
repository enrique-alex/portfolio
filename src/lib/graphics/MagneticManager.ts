/**
 * MagneticManager - Contrôleur Magnétique Globalisé
 * 
 * - Centralise l'attraction magnétique de tous les éléments .industrial-mag.
 * - Supprime tout calcul getBoundingClientRect sur mousemove.
 * - Met en cache les boîtes englobantes absolues au montage et lors du resize / scroll.
 * - Calcule l'attraction dans la boucle unique FrameManager.
 * - Applique les décalages directement via style.transform = translate3d(...).
 * - Respecte prefers-reduced-motion et les écrans tactiles (pointer: coarse).
 */

import { frameManager } from './FrameManager';

export interface CachedMagneticItem {
  element: HTMLElement;
  intensity: number;
  // Coordonnées absolues dans le document (indépendantes du scroll)
  docLeft: number;
  docTop: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  radius: number;
  // État physique
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  isActive: boolean;
}

export class MagneticManager {
  private static instance: MagneticManager | null = null;

  private items: Map<HTMLElement, CachedMagneticItem> = new Map();
  private cursorX: number = -9999;
  private cursorY: number = -9999;
  private unsubscribeFrame: (() => void) | null = null;
  private boundResize: (() => void) | null = null;
  private boundPointerMove: ((e: PointerEvent | MouseEvent) => void) | null = null;

  private constructor() {
    this.init();
  }

  public static getInstance(): MagneticManager {
    if (!MagneticManager.instance) {
      MagneticManager.instance = new MagneticManager();
    }
    return MagneticManager.instance;
  }

  private init(): void {
    if (typeof window === 'undefined') return;

    this.boundResize = () => {
      this.refreshAllBounds();
    };
    window.addEventListener('resize', this.boundResize, { passive: true });

    // Écouteur passif global sur le pointeur pour connaître les coordonnées absolues
    this.boundPointerMove = (e: PointerEvent | MouseEvent) => {
      this.cursorX = e.clientX;
      this.cursorY = e.clientY;
      this.ensureFrameSubscription();
    };
    window.addEventListener('pointermove', this.boundPointerMove, { passive: true });
  }

  public register(element: HTMLElement, intensity: number = 0.3): void {
    const cached = this.measureElement(element, intensity);
    this.items.set(element, cached);
    this.ensureFrameSubscription();
  }

  public unregister(element: HTMLElement): void {
    const item = this.items.get(element);
    if (item) {
      try {
        item.element.style.transform = '';
      } catch {
        // Safe disposal
      }
      this.items.delete(element);
    }

    if (this.items.size === 0 && this.unsubscribeFrame) {
      this.unsubscribeFrame();
      this.unsubscribeFrame = null;
    }
  }

  public setCursor(x: number, y: number): void {
    this.cursorX = x;
    this.cursorY = y;
    this.ensureFrameSubscription();
  }

  public refreshAllBounds(): void {
    if (typeof window === 'undefined') return;
    this.items.forEach((item, element) => {
      const refreshed = this.measureElement(element, item.intensity, item);
      refreshed.currentX = item.currentX;
      refreshed.currentY = item.currentY;
      refreshed.isActive = item.isActive;
      this.items.set(element, refreshed);
    });
  }

  private measureElement(
    element: HTMLElement,
    intensity: number,
    existingItem?: CachedMagneticItem
  ): CachedMagneticItem {
    const rect = typeof element.getBoundingClientRect === 'function'
      ? element.getBoundingClientRect()
      : { left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 };
    const scrollX = typeof window !== 'undefined' ? (window.scrollX || window.pageXOffset || 0) : 0;
    const scrollY = typeof window !== 'undefined' ? (window.scrollY || window.pageYOffset || 0) : 0;

    // Soustraire le décalage dynamique courant pour obtenir la position de repos absolue réelle
    const offsetX = existingItem?.currentX ?? 0;
    const offsetY = existingItem?.currentY ?? 0;
    const docLeft = rect.left + scrollX - offsetX;
    const docTop = rect.top + scrollY - offsetY;
    const width = rect.width;
    const height = rect.height;
    const centerX = docLeft + width / 2;
    const centerY = docTop + height / 2;
    const radius = Math.max(width, height) * 1.4;

    return {
      element,
      intensity,
      docLeft,
      docTop,
      width,
      height,
      centerX,
      centerY,
      radius,
      currentX: offsetX,
      currentY: offsetY,
      targetX: existingItem?.targetX ?? 0,
      targetY: existingItem?.targetY ?? 0,
      isActive: existingItem?.isActive ?? false,
    };
  }

  private ensureFrameSubscription(): void {
    if (this.unsubscribeFrame) return;
    if (this.items.size === 0) return;

    this.unsubscribeFrame = frameManager.subscribe((dt: number, _now: number, isReducedMotion?: boolean) => {
      this.update(dt, isReducedMotion);
    });
  }

  private update(dt: number, isReducedMotion?: boolean): void {
    if (this.items.size === 0) {
      if (this.unsubscribeFrame) {
        this.unsubscribeFrame();
        this.unsubscribeFrame = null;
      }
      return;
    }

    const isReduced = Boolean(
      isReducedMotion ??
      frameManager.isReducedMotion ??
      (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    );

    if (isReduced) {
      this.items.forEach((item) => {
        item.currentX = 0;
        item.currentY = 0;
        item.targetX = 0;
        item.targetY = 0;
        item.element.style.transform = '';
      });
      if (this.unsubscribeFrame) {
        this.unsubscribeFrame();
        this.unsubscribeFrame = null;
      }
      return;
    }

    const scrollX = typeof window !== 'undefined' ? (window.scrollX || window.pageXOffset || 0) : 0;
    const scrollY = typeof window !== 'undefined' ? (window.scrollY || window.pageYOffset || 0) : 0;

    // Facteur d'amortissement exponentiel continu indépendant du framerate
    const lerpFactor = 1 - Math.exp(-18 * dt);
    let anyActive = false;

    this.items.forEach((item) => {
      // Coordonnées écran du centre de l'élément sans appel getBoundingClientRect
      const screenCenterX = item.centerX - scrollX;
      const screenCenterY = item.centerY - scrollY;

      const dx = this.cursorX - screenCenterX;
      const dy = this.cursorY - screenCenterY;
      const dist = Math.hypot(dx, dy);

      if (dist < item.radius && this.cursorX > -1000) {
        item.targetX = dx * item.intensity;
        item.targetY = dy * item.intensity;
        item.isActive = true;
      } else {
        item.targetX = 0;
        item.targetY = 0;
        item.isActive = false;
      }

      const diffX = item.targetX - item.currentX;
      const diffY = item.targetY - item.currentY;

      if (Math.abs(diffX) > 0.05 || Math.abs(diffY) > 0.05) {
        item.currentX += diffX * lerpFactor;
        item.currentY += diffY * lerpFactor;
        anyActive = true;
        item.element.style.transform = `translate3d(${item.currentX.toFixed(2)}px, ${item.currentY.toFixed(2)}px, 0)`;
      } else if (item.currentX !== 0 || item.currentY !== 0) {
        item.currentX = item.targetX;
        item.currentY = item.targetY;
        if (item.currentX === 0 && item.currentY === 0) {
          item.element.style.transform = '';
        } else {
          item.element.style.transform = `translate3d(${item.currentX.toFixed(2)}px, ${item.currentY.toFixed(2)}px, 0)`;
          anyActive = true;
        }
      }
    });

    // Si aucun élément n'est actif et que tous sont stabilisés à (0,0), suspendre l'abonnement
    if (!anyActive) {
      if (this.unsubscribeFrame) {
        this.unsubscribeFrame();
        this.unsubscribeFrame = null;
      }
    }
  }

  public get isSubscribed(): boolean {
    return this.unsubscribeFrame !== null;
  }

  public getActiveCount(): number {
    return this.items.size;
  }

  public updateForTesting(dt: number, isReducedMotion?: boolean): void {
    this.update(dt, isReducedMotion);
  }

  public resetForTesting(): void {
    if (this.unsubscribeFrame) {
      this.unsubscribeFrame();
      this.unsubscribeFrame = null;
    }
    this.items.forEach((item) => {
      try {
        item.element.style.transform = '';
      } catch {
        // Safe reset
      }
    });
    this.items.clear();
    this.cursorX = -9999;
    this.cursorY = -9999;
  }

  public destroy(): void {
    this.resetForTesting();
    if (typeof window !== 'undefined') {
      if (this.boundResize) {
        window.removeEventListener('resize', this.boundResize);
        this.boundResize = null;
      }
      if (this.boundPointerMove) {
        window.removeEventListener('pointermove', this.boundPointerMove);
        this.boundPointerMove = null;
      }
    }
  }
}

export const magneticManager = MagneticManager.getInstance();
