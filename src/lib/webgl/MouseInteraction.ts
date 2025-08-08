// src/lib/webgl/MouseInteraction.ts
// Mouse and touch interaction handler for WebGL particle systems

import * as THREE from "three";

export interface MouseInteractionOptions {
  radius?: number;
  strength?: number;
  throttle?: boolean;
}

export class MouseInteraction {
  private _camera: THREE.Camera;
  private _domElement: HTMLElement;
  private _opts: Required<MouseInteractionOptions>;
  private _ndc: THREE.Vector2;
  private _world: THREE.Vector3;
  private _rafPending: boolean;
  private _rafId: number | null;

  private _onPointerMove: (event: PointerEvent) => void;
  private _onTouchMove: (event: TouchEvent) => void;

  constructor(
    camera: THREE.Camera,
    domElement: HTMLElement,
    opts: MouseInteractionOptions = {}
  ) {
    this._camera = camera;
    this._domElement = domElement;
    this._opts = {
      radius: opts.radius ?? 1.5,
      strength: opts.strength ?? 0.5,
      throttle: opts.throttle ?? true,
    };

    this._ndc = new THREE.Vector2();
    this._world = new THREE.Vector3();
    this._rafPending = false;
    this._rafId = null;

    this._onPointerMove = this._handlePointerMove.bind(this);
    this._onTouchMove = this._handleTouchMove.bind(this);

    if (typeof window !== "undefined") {
      this._addEventListeners();
    }
  }

  dispose(): void {
    if (typeof window !== "undefined") {
      this._removeEventListeners();
    }

    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }

    this._rafPending = false;
  }

  getMousePosition(): THREE.Vector2 {
    return this._ndc.clone();
  }

  getWorldPosition(planeZ: number = 0): THREE.Vector3 {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(this._ndc, this._camera);

    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -planeZ);
    const target = new THREE.Vector3();

    raycaster.ray.intersectPlane(plane, target);
    this._world.copy(target || new THREE.Vector3());

    return this._world.clone();
  }

  getOptions(): Required<MouseInteractionOptions> {
    return { ...this._opts };
  }

  setOptions(opts: Partial<MouseInteractionOptions>): void {
    this._opts = {
      ...this._opts,
      ...opts,
    };
  }

  private _addEventListeners(): void {
    this._domElement.addEventListener("pointermove", this._onPointerMove, {
      passive: true,
    });
    this._domElement.addEventListener("touchmove", this._onTouchMove, {
      passive: true,
    });
  }

  private _removeEventListeners(): void {
    this._domElement.removeEventListener("pointermove", this._onPointerMove);
    this._domElement.removeEventListener("touchmove", this._onTouchMove);
  }

  private _handlePointerMove(event: PointerEvent): void {
    if (this._opts.throttle && this._rafPending) {
      return;
    }

    const updatePosition = () => {
      this._updateNDC(event.clientX, event.clientY);
      this._rafPending = false;
      this._rafId = null;
    };

    if (this._opts.throttle) {
      this._rafPending = true;
      this._rafId = requestAnimationFrame(updatePosition);
    } else {
      updatePosition();
    }
  }

  private _handleTouchMove(event: TouchEvent): void {
    if (event.touches.length === 0) return;

    if (this._opts.throttle && this._rafPending) {
      return;
    }

    const touch = event.touches[0];
    const updatePosition = () => {
      this._updateNDC(touch.clientX, touch.clientY);
      this._rafPending = false;
      this._rafId = null;
    };

    if (this._opts.throttle) {
      this._rafPending = true;
      this._rafId = requestAnimationFrame(updatePosition);
    } else {
      updatePosition();
    }
  }

  private _updateNDC(clientX: number, clientY: number): void {
    const rect = this._domElement.getBoundingClientRect();

    this._ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this._ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  }
}
