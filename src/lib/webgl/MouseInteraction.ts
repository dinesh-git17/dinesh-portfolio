// src/lib/webgl/MouseInteraction.ts
// Mouse and touch interaction handler for WebGL particle systems with optimized event handling

import * as THREE from "three";

export interface MouseInteractionOptions {
  radius?: number;
  strength?: number;
  throttle?: boolean;
}

export interface InteractionData {
  position: THREE.Vector2;
  worldPosition: THREE.Vector3;
  isActive: boolean;
  strength: number;
  velocity: THREE.Vector2;
}

export class MouseInteraction {
  private camera: THREE.Camera;
  private domElement: HTMLElement;
  private options: Required<MouseInteractionOptions>;

  private ndcPosition: THREE.Vector2;
  private worldPosition: THREE.Vector3;
  private lastPosition: THREE.Vector2;
  private velocity: THREE.Vector2;
  private isActive: boolean;
  private strength: number;

  private rafPending: boolean;
  private rafId: number | null;
  private enabled: boolean;

  private boundHandlers: {
    onPointerMove: (event: PointerEvent) => void;
    onPointerDown: (event: PointerEvent) => void;
    onPointerUp: (event: PointerEvent) => void;
    onTouchMove: (event: TouchEvent) => void;
    onTouchStart: (event: TouchEvent) => void;
    onTouchEnd: (event: TouchEvent) => void;
  };

  constructor(
    camera: THREE.Camera,
    domElement: HTMLElement,
    options: MouseInteractionOptions = {}
  ) {
    this.camera = camera;
    this.domElement = domElement;
    this.options = {
      radius: options.radius ?? 1.5,
      strength: options.strength ?? 0.5,
      throttle: options.throttle ?? true,
    };

    this.ndcPosition = new THREE.Vector2(0, 0);
    this.worldPosition = new THREE.Vector3(0, 0, 0);
    this.lastPosition = new THREE.Vector2(0, 0);
    this.velocity = new THREE.Vector2(0, 0);
    this.isActive = false;
    this.strength = 0;
    this.rafPending = false;
    this.rafId = null;
    this.enabled = true;

    this.boundHandlers = {
      onPointerMove: this.handlePointerMove.bind(this),
      onPointerDown: this.handlePointerDown.bind(this),
      onPointerUp: this.handlePointerUp.bind(this),
      onTouchMove: this.handleTouchMove.bind(this),
      onTouchStart: this.handleTouchStart.bind(this),
      onTouchEnd: this.handleTouchEnd.bind(this),
    };

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    this.domElement.addEventListener(
      "pointermove",
      this.boundHandlers.onPointerMove,
      { passive: true }
    );
    this.domElement.addEventListener(
      "pointerdown",
      this.boundHandlers.onPointerDown,
      { passive: true }
    );
    this.domElement.addEventListener(
      "pointerup",
      this.boundHandlers.onPointerUp,
      { passive: true }
    );

    this.domElement.addEventListener(
      "touchmove",
      this.boundHandlers.onTouchMove,
      { passive: true }
    );
    this.domElement.addEventListener(
      "touchstart",
      this.boundHandlers.onTouchStart,
      { passive: true }
    );
    this.domElement.addEventListener(
      "touchend",
      this.boundHandlers.onTouchEnd,
      { passive: true }
    );
  }

  private removeEventListeners(): void {
    this.domElement.removeEventListener(
      "pointermove",
      this.boundHandlers.onPointerMove
    );
    this.domElement.removeEventListener(
      "pointerdown",
      this.boundHandlers.onPointerDown
    );
    this.domElement.removeEventListener(
      "pointerup",
      this.boundHandlers.onPointerUp
    );

    this.domElement.removeEventListener(
      "touchmove",
      this.boundHandlers.onTouchMove
    );
    this.domElement.removeEventListener(
      "touchstart",
      this.boundHandlers.onTouchStart
    );
    this.domElement.removeEventListener(
      "touchend",
      this.boundHandlers.onTouchEnd
    );
  }

  private handlePointerMove(event: PointerEvent): void {
    if (!this.enabled) return;
    this.scheduleUpdate(() =>
      this.updatePosition(event.clientX, event.clientY)
    );
  }

  private handlePointerDown(event: PointerEvent): void {
    if (!this.enabled) return;
    this.isActive = true;
    this.updatePosition(event.clientX, event.clientY);
  }

  private handlePointerUp(): void {
    if (!this.enabled) return;
    this.isActive = false;
    this.strength = 0;
  }

  private handleTouchMove(event: TouchEvent): void {
    if (!this.enabled || event.touches.length === 0) return;
    const touch = event.touches[0];
    this.scheduleUpdate(() =>
      this.updatePosition(touch.clientX, touch.clientY)
    );
  }

  private handleTouchStart(event: TouchEvent): void {
    if (!this.enabled || event.touches.length === 0) return;
    this.isActive = true;
    const touch = event.touches[0];
    this.updatePosition(touch.clientX, touch.clientY);
  }

  private handleTouchEnd(): void {
    if (!this.enabled) return;
    this.isActive = false;
    this.strength = 0;
  }

  private scheduleUpdate(updateFn: () => void): void {
    if (!this.options.throttle) {
      updateFn();
      return;
    }

    if (this.rafPending) return;

    this.rafPending = true;
    this.rafId = requestAnimationFrame(() => {
      updateFn();
      this.rafPending = false;
      this.rafId = null;
    });
  }

  private updatePosition(clientX: number, clientY: number): void {
    const rect = this.domElement.getBoundingClientRect();

    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    const currentPosition = new THREE.Vector2(x, y);

    this.velocity.subVectors(currentPosition, this.lastPosition);
    this.lastPosition.copy(currentPosition);
    this.ndcPosition.copy(currentPosition);

    this.updateWorldPosition();
    this.updateStrength();
  }

  private updateWorldPosition(): void {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(this.ndcPosition, this.camera);

    const distance = 10;
    this.worldPosition
      .copy(raycaster.ray.direction)
      .multiplyScalar(distance)
      .add(raycaster.ray.origin);
  }

  private updateStrength(): void {
    if (!this.isActive) {
      this.strength = Math.max(0, this.strength - 0.05);
      return;
    }

    const velocityMagnitude = this.velocity.length();
    const targetStrength = Math.min(1, velocityMagnitude * 10 + 0.3);

    this.strength = THREE.MathUtils.lerp(this.strength, targetStrength, 0.1);
  }

  public updatePointerPosition(position: THREE.Vector2): void {
    this.ndcPosition.copy(position);
    this.updateWorldPosition();
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.isActive = false;
      this.strength = 0;
    }
  }

  public getInteractionData(): InteractionData {
    return {
      position: this.ndcPosition.clone(),
      worldPosition: this.worldPosition.clone(),
      isActive: this.isActive,
      strength: this.strength,
      velocity: this.velocity.clone(),
    };
  }

  public dispose(): void {
    this.removeEventListeners();

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.enabled = false;
    this.isActive = false;
    this.rafPending = false;
  }
}
