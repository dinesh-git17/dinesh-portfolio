// src/lib/webgl/MouseInteraction.ts
// Phase 4: Enhanced mouse interaction with improved performance and gesture support

import * as THREE from "three";

export interface MouseInteractionOptions {
  radius?: number;
  strength?: number;
  throttle?: boolean;
  enableGestures?: boolean;
  dampingFactor?: number;
}

export interface InteractionData {
  position: THREE.Vector2;
  worldPosition: THREE.Vector3;
  isActive: boolean;
  strength: number;
  velocity: THREE.Vector2;
  gestureType?: "hover" | "press" | "drag" | "release";
}

export class MouseInteraction {
  private camera: THREE.Camera;
  private domElement: HTMLElement;
  private options: Required<MouseInteractionOptions>;

  private ndcPosition: THREE.Vector2;
  private worldPosition: THREE.Vector3;
  private lastPosition: THREE.Vector2;
  private velocity: THREE.Vector2;
  private dampedVelocity: THREE.Vector2;
  private isActive: boolean;
  private strength: number;
  private gestureType: "hover" | "press" | "drag" | "release";

  private rafPending: boolean;
  private rafId: number | null;
  private enabled: boolean;
  private isPointerDown: boolean;
  private lastUpdateTime: number;

  private boundHandlers: {
    onPointerMove: (event: PointerEvent) => void;
    onPointerDown: (event: PointerEvent) => void;
    onPointerUp: (event: PointerEvent) => void;
    onPointerLeave: (event: PointerEvent) => void;
    onTouchMove: (event: TouchEvent) => void;
    onTouchStart: (event: TouchEvent) => void;
    onTouchEnd: (event: TouchEvent) => void;
    onWheel: (event: WheelEvent) => void;
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
      enableGestures: options.enableGestures ?? true,
      dampingFactor: options.dampingFactor ?? 0.85,
    };

    this.ndcPosition = new THREE.Vector2(0, 0);
    this.worldPosition = new THREE.Vector3(0, 0, 0);
    this.lastPosition = new THREE.Vector2(0, 0);
    this.velocity = new THREE.Vector2(0, 0);
    this.dampedVelocity = new THREE.Vector2(0, 0);
    this.isActive = false;
    this.strength = 0;
    this.gestureType = "hover";
    this.rafPending = false;
    this.rafId = null;
    this.enabled = true;
    this.isPointerDown = false;
    this.lastUpdateTime = performance.now();

    this.boundHandlers = {
      onPointerMove: this.handlePointerMove.bind(this),
      onPointerDown: this.handlePointerDown.bind(this),
      onPointerUp: this.handlePointerUp.bind(this),
      onPointerLeave: this.handlePointerLeave.bind(this),
      onTouchMove: this.handleTouchMove.bind(this),
      onTouchStart: this.handleTouchStart.bind(this),
      onTouchEnd: this.handleTouchEnd.bind(this),
      onWheel: this.handleWheel.bind(this),
    };

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const passiveOptions = { passive: true };
    const activeOptions = { passive: false };

    this.domElement.addEventListener(
      "pointermove",
      this.boundHandlers.onPointerMove,
      passiveOptions
    );
    this.domElement.addEventListener(
      "pointerdown",
      this.boundHandlers.onPointerDown,
      passiveOptions
    );
    this.domElement.addEventListener(
      "pointerup",
      this.boundHandlers.onPointerUp,
      passiveOptions
    );
    this.domElement.addEventListener(
      "pointerleave",
      this.boundHandlers.onPointerLeave,
      passiveOptions
    );

    this.domElement.addEventListener(
      "touchmove",
      this.boundHandlers.onTouchMove,
      activeOptions
    );
    this.domElement.addEventListener(
      "touchstart",
      this.boundHandlers.onTouchStart,
      passiveOptions
    );
    this.domElement.addEventListener(
      "touchend",
      this.boundHandlers.onTouchEnd,
      passiveOptions
    );

    this.domElement.addEventListener(
      "wheel",
      this.boundHandlers.onWheel,
      passiveOptions
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
      "pointerleave",
      this.boundHandlers.onPointerLeave
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

    this.domElement.removeEventListener("wheel", this.boundHandlers.onWheel);
  }

  private handlePointerMove(event: PointerEvent): void {
    if (!this.enabled) return;

    this.gestureType = this.isPointerDown ? "drag" : "hover";
    this.scheduleUpdate(() =>
      this.updatePosition(event.clientX, event.clientY)
    );
  }

  private handlePointerDown(event: PointerEvent): void {
    if (!this.enabled) return;

    this.isPointerDown = true;
    this.isActive = true;
    this.gestureType = "press";
    this.updatePosition(event.clientX, event.clientY);
  }

  private handlePointerUp(): void {
    if (!this.enabled) return;

    this.isPointerDown = false;
    this.gestureType = "release";

    setTimeout(() => {
      if (!this.isPointerDown) {
        this.isActive = false;
        this.strength = 0;
        this.gestureType = "hover";
      }
    }, 100);
  }

  private handlePointerLeave(): void {
    if (!this.enabled) return;

    this.isPointerDown = false;
    this.isActive = false;
    this.strength = 0;
    this.gestureType = "hover";
  }

  private handleTouchMove(event: TouchEvent): void {
    if (!this.enabled || event.touches.length === 0) return;

    event.preventDefault();
    const touch = event.touches[0];
    this.gestureType = "drag";
    this.scheduleUpdate(() =>
      this.updatePosition(touch.clientX, touch.clientY)
    );
  }

  private handleTouchStart(event: TouchEvent): void {
    if (!this.enabled || event.touches.length === 0) return;

    this.isPointerDown = true;
    this.isActive = true;
    this.gestureType = "press";
    const touch = event.touches[0];
    this.updatePosition(touch.clientX, touch.clientY);
  }

  private handleTouchEnd(): void {
    if (!this.enabled) return;

    this.isPointerDown = false;
    this.gestureType = "release";

    setTimeout(() => {
      if (!this.isPointerDown) {
        this.isActive = false;
        this.strength = 0;
        this.gestureType = "hover";
      }
    }, 150);
  }

  private handleWheel(event: WheelEvent): void {
    if (!this.enabled || !this.options.enableGestures) return;

    const wheelStrength = Math.abs(event.deltaY) * 0.01;
    this.strength = Math.min(
      this.strength + wheelStrength,
      this.options.strength * 2
    );

    setTimeout(() => {
      this.strength *= 0.9;
    }, 50);
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

    const currentTime = performance.now();
    const deltaTime = Math.min(currentTime - this.lastUpdateTime, 33);

    this.velocity
      .copy(this.ndcPosition)
      .sub(new THREE.Vector2(x, y))
      .divideScalar(deltaTime);
    this.dampedVelocity.lerp(this.velocity, this.options.dampingFactor);

    this.ndcPosition.set(x, y);
    this.lastPosition.copy(this.ndcPosition);
    this.lastUpdateTime = currentTime;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(this.ndcPosition, this.camera);

    const distance = 10;
    const direction = raycaster.ray.direction.clone().multiplyScalar(distance);
    this.worldPosition.copy(raycaster.ray.origin).add(direction);

    if (this.isActive) {
      const velocityMagnitude = Math.min(this.dampedVelocity.length() * 100, 1);
      const baseStrength = this.options.strength;

      switch (this.gestureType) {
        case "press":
          this.strength = baseStrength * 1.5;
          break;
        case "drag":
          this.strength = baseStrength * (1 + velocityMagnitude * 0.5);
          break;
        case "release":
          this.strength = baseStrength * 0.7;
          break;
        default:
          this.strength = baseStrength * 0.3;
      }
    }
  }

  public updatePointerPosition(position: THREE.Vector2): void {
    if (!this.enabled) return;

    this.scheduleUpdate(() => {
      this.ndcPosition.copy(position);
      this.updateWorldPosition();
    });
  }

  private updateWorldPosition(): void {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(this.ndcPosition, this.camera);

    const distance = 10;
    const direction = raycaster.ray.direction.clone().multiplyScalar(distance);
    this.worldPosition.copy(raycaster.ray.origin).add(direction);
  }

  public getInteractionData(): InteractionData {
    return {
      position: this.ndcPosition.clone(),
      worldPosition: this.worldPosition.clone(),
      isActive: this.isActive,
      strength: this.strength,
      velocity: this.dampedVelocity.clone(),
      gestureType: this.gestureType,
    };
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;

    if (!enabled) {
      this.isActive = false;
      this.strength = 0;
      this.isPointerDown = false;
      this.gestureType = "hover";
    }
  }

  public setStrength(strength: number): void {
    this.options.strength = Math.max(0, Math.min(strength, 2));
  }

  public setRadius(radius: number): void {
    this.options.radius = Math.max(0.1, Math.min(radius, 5));
  }

  public dispose(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.removeEventListeners();
    this.enabled = false;
    this.isActive = false;
  }
}
