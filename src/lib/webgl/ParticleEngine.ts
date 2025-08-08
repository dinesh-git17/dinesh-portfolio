// src/lib/webgl/ParticleEngine.ts
// Phase 4: Performance optimized particle engine with advanced rendering features

import * as THREE from "three";
import {
  MouseInteraction,
  type MouseInteractionOptions,
} from "./MouseInteraction";
import {
  createParticleGeometry,
  type ParticleGeometryOptions,
} from "./ParticleGeometry";
import {
  particleFragmentShader,
  particleVertexShader,
} from "./ParticleShaders";

export interface ParticleEngineOptions {
  particleCount?: number;
  baseColor?: THREE.ColorRepresentation;
  pointSize?: number;
  noiseStrength?: number;
  attractionStrength?: number;
  deterministicSeed?: number;
  isLowPowerDevice?: boolean;
  geometryOptions?: Partial<ParticleGeometryOptions>;
  mouseOptions?: MouseInteractionOptions;
  enableLOD?: boolean;
  cullingDistance?: number;
  adaptiveRendering?: boolean;
}

interface EngineState {
  initialized: boolean;
  disposed: boolean;
  animationId: number | null;
  lastTime: number;
  frameCount: number;
  performanceLevel: "high" | "medium" | "low";
}

export class ParticleEngine {
  private readonly options: Required<
    Omit<ParticleEngineOptions, "geometryOptions" | "mouseOptions">
  >;
  private readonly geometryOptions: ParticleGeometryOptions;
  private readonly mouseOptions: MouseInteractionOptions;

  private geometry: THREE.BufferGeometry | null = null;
  private material: THREE.ShaderMaterial | null = null;
  private points: THREE.Points | null = null;
  private uniforms: {
    [uniform: string]: { value: number | THREE.Vector2 | THREE.Color };
  } | null = null;
  private mouseInteraction: MouseInteraction | null = null;
  private clock: THREE.Clock;
  private frustum: THREE.Frustum;
  private cameraMatrix: THREE.Matrix4;

  private state: EngineState = {
    initialized: false,
    disposed: false,
    animationId: null,
    lastTime: 0,
    frameCount: 0,
    performanceLevel: "high",
  };

  private performanceMonitor = {
    frameTime: 0,
    averageFrameTime: 16.67,
    frameTimes: [] as number[],
    lastOptimization: 0,
  };

  constructor(options: ParticleEngineOptions = {}) {
    const defaultCount = (options.isLowPowerDevice ?? false) ? 250 : 500;

    this.options = {
      particleCount: Math.max(
        1,
        Math.min(options.particleCount ?? defaultCount, 2000)
      ),
      baseColor: options.baseColor ?? 0x00aaff,
      pointSize: Math.max(0.1, Math.min(options.pointSize ?? 4.0, 20.0)),
      noiseStrength: Math.max(0, Math.min(options.noiseStrength ?? 0.1, 1.0)),
      attractionStrength: Math.max(
        0,
        Math.min(options.attractionStrength ?? 0.5, 2.0)
      ),
      deterministicSeed: options.deterministicSeed ?? 12345,
      isLowPowerDevice: options.isLowPowerDevice ?? false,
      enableLOD: options.enableLOD ?? true,
      cullingDistance: options.cullingDistance ?? 50.0,
      adaptiveRendering: options.adaptiveRendering ?? true,
    };

    this.geometryOptions = {
      count: this.options.particleCount,
      spawnRadius: 6.0,
      initialSpeed: this.options.isLowPowerDevice ? 0.3 : 0.5,
      damping: 0.985,
      lifetimeRange: [0.7, 1.0],
      seed: this.options.deterministicSeed,
      positionDistribution: "sphere",
      velocityDistribution: "outward",
      ...options.geometryOptions,
    };

    this.mouseOptions = {
      radius: this.options.isLowPowerDevice ? 1.0 : 1.5,
      strength: this.options.isLowPowerDevice ? 0.3 : 0.5,
      throttle: this.options.isLowPowerDevice,
      enableGestures: !this.options.isLowPowerDevice,
      dampingFactor: 0.85,
      ...options.mouseOptions,
    };

    this.clock = new THREE.Clock();
    this.frustum = new THREE.Frustum();
    this.cameraMatrix = new THREE.Matrix4();
  }

  init(
    scene: THREE.Scene,
    camera?: THREE.Camera,
    domElement?: HTMLElement
  ): void {
    if (this.state.initialized) {
      console.warn("ParticleEngine already initialized");
      return;
    }

    try {
      this.createGeometry();
      this.createMaterial();
      this.createPoints();

      if (this.points) {
        scene.add(this.points);
      }

      if (camera && domElement) {
        this.setupMouseInteraction(camera, domElement);
      }

      this.state.initialized = true;
      this.clock.start();

      console.log(
        `ParticleEngine initialized with ${this.options.particleCount} particles`
      );
    } catch (error) {
      console.error("Failed to initialize ParticleEngine:", error);
      this.dispose();
      throw error;
    }
  }

  update(deltaTime: number): void {
    if (!this.state.initialized || this.state.disposed || !this.uniforms) {
      return;
    }

    const clampedDelta = Math.min(deltaTime, 0.033);
    const elapsed = this.clock.getElapsedTime();

    this.updatePerformanceMonitoring(clampedDelta);
    this.updateUniforms(elapsed);
    this.updateMouseInteraction();

    if (this.options.adaptiveRendering) {
      this.adaptiveQualityControl();
    }

    this.markAttributesForUpdate();
    this.state.frameCount++;
  }

  private updatePerformanceMonitoring(deltaTime: number): void {
    const frameTime = deltaTime * 1000;
    this.performanceMonitor.frameTime = frameTime;
    this.performanceMonitor.frameTimes.push(frameTime);

    if (this.performanceMonitor.frameTimes.length > 60) {
      this.performanceMonitor.frameTimes.shift();
    }

    if (this.performanceMonitor.frameTimes.length >= 60) {
      const avg =
        this.performanceMonitor.frameTimes.reduce((a, b) => a + b, 0) / 60;
      this.performanceMonitor.averageFrameTime = avg;
    }
  }

  private adaptiveQualityControl(): void {
    const now = performance.now();
    const avgFrameTime = this.performanceMonitor.averageFrameTime;

    if (now - this.performanceMonitor.lastOptimization < 2000) {
      return;
    }

    if (avgFrameTime > 20 && this.state.performanceLevel !== "low") {
      this.degradeQuality();
      this.performanceMonitor.lastOptimization = now;
    } else if (avgFrameTime < 12 && this.state.performanceLevel !== "high") {
      this.improveQuality();
      this.performanceMonitor.lastOptimization = now;
    }
  }

  private degradeQuality(): void {
    if (this.state.performanceLevel === "high") {
      this.state.performanceLevel = "medium";
      this.setPointSize(this.options.pointSize * 0.8);
      this.setNoiseStrength(this.options.noiseStrength * 0.7);
    } else if (this.state.performanceLevel === "medium") {
      this.state.performanceLevel = "low";
      this.setPointSize(this.options.pointSize * 0.6);
      this.setNoiseStrength(this.options.noiseStrength * 0.5);
    }

    console.log(`Quality degraded to: ${this.state.performanceLevel}`);
  }

  private improveQuality(): void {
    if (this.state.performanceLevel === "low") {
      this.state.performanceLevel = "medium";
      this.setPointSize(this.options.pointSize * 0.8);
      this.setNoiseStrength(this.options.noiseStrength * 0.7);
    } else if (this.state.performanceLevel === "medium") {
      this.state.performanceLevel = "high";
      this.setPointSize(this.options.pointSize);
      this.setNoiseStrength(this.options.noiseStrength);
    }

    console.log(`Quality improved to: ${this.state.performanceLevel}`);
  }

  resize(viewport: { width: number; height: number; dpr?: number }): void {
    if (!this.uniforms) return;

    const dpr = viewport.dpr ?? 1;
    const viewportUniform = this.uniforms.uViewport;
    const pixelRatioUniform = this.uniforms.uPixelRatio;

    if (viewportUniform.value instanceof THREE.Vector2) {
      viewportUniform.value.set(viewport.width, viewport.height);
    }

    if (typeof pixelRatioUniform.value === "number") {
      pixelRatioUniform.value = dpr;
    }
  }

  dispose(): void {
    if (this.state.disposed) return;

    if (this.mouseInteraction) {
      this.mouseInteraction.dispose();
      this.mouseInteraction = null;
    }

    if (this.geometry) {
      this.geometry.dispose();
      this.geometry = null;
    }

    if (this.material) {
      this.material.dispose();
      this.material = null;
    }

    this.points = null;
    this.uniforms = null;

    this.state.disposed = true;
    this.state.initialized = false;

    console.log("ParticleEngine disposed");
  }

  get particlePoints(): THREE.Points | null {
    return this.points;
  }

  get performanceStats() {
    return {
      frameTime: this.performanceMonitor.frameTime,
      averageFrameTime: this.performanceMonitor.averageFrameTime,
      particleCount: this.options.particleCount,
      performanceLevel: this.state.performanceLevel,
      frameCount: this.state.frameCount,
    };
  }

  setMouseAttraction(enabled: boolean, position?: THREE.Vector2): void {
    if (this.mouseInteraction) {
      this.mouseInteraction.setEnabled(enabled);
      if (enabled && position) {
        this.mouseInteraction.updatePointerPosition(position);
      }
    }
  }

  setNoiseEnabled(enabled: boolean): void {
    if (this.uniforms) {
      const noiseUniform = this.uniforms.uNoiseStrength;
      if (typeof noiseUniform.value === "number") {
        noiseUniform.value = enabled ? this.options.noiseStrength : 0;
      }
    }
  }

  setNoiseStrength(strength: number): void {
    if (this.uniforms) {
      const noiseUniform = this.uniforms.uNoiseStrength;
      if (typeof noiseUniform.value === "number") {
        noiseUniform.value = Math.max(0, Math.min(strength, 1));
      }
    }
  }

  setPointSize(size: number): void {
    if (this.uniforms) {
      const sizeUniform = this.uniforms.uPointSize;
      if (typeof sizeUniform.value === "number") {
        sizeUniform.value = Math.max(0.1, Math.min(size, 20));
      }
    }
  }

  private createGeometry(): void {
    const result = createParticleGeometry(this.geometryOptions);
    this.geometry = result.geometry;

    result.attrs.position.setUsage(THREE.DynamicDrawUsage);
    result.attrs.velocity.setUsage(THREE.DynamicDrawUsage);
  }

  private createMaterial(): void {
    this.uniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uViewport: { value: new THREE.Vector2(1920, 1080) },
      uBaseColor: { value: new THREE.Color(this.options.baseColor) },
      uPointSize: { value: this.options.pointSize },
      uNoiseStrength: { value: this.options.noiseStrength },
      uAttractionStrength: { value: this.options.attractionStrength },
    } as { [uniform: string]: { value: number | THREE.Vector2 | THREE.Color } };

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      vertexColors: false,
    });

    if (this.options.enableLOD) {
      this.material.defines = {
        ...this.material.defines,
        USE_LOD: "1",
      };
    }
  }

  private createPoints(): void {
    if (!this.geometry || !this.material) return;
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = true;
  }

  private setupMouseInteraction(
    camera: THREE.Camera,
    domElement: HTMLElement
  ): void {
    this.mouseInteraction = new MouseInteraction(
      camera,
      domElement,
      this.mouseOptions
    );
  }

  private updateUniforms(elapsed: number): void {
    if (!this.uniforms) return;

    const timeUniform = this.uniforms.uTime;
    if (typeof timeUniform.value === "number") {
      timeUniform.value = elapsed;
    }
  }

  private updateMouseInteraction(): void {
    if (!this.mouseInteraction || !this.uniforms) return;

    const mouseData = this.mouseInteraction.getInteractionData();
    const attractionUniform = this.uniforms.uAttractionStrength;

    if (typeof attractionUniform.value === "number") {
      if (mouseData.isActive) {
        const strengthMultiplier =
          mouseData.gestureType === "press"
            ? 1.5
            : mouseData.gestureType === "drag"
              ? 1.2
              : 1.0;
        attractionUniform.value =
          this.options.attractionStrength *
          mouseData.strength *
          strengthMultiplier;
      } else {
        attractionUniform.value = this.options.attractionStrength * 0.1;
      }
    }
  }

  private markAttributesForUpdate(): void {
    if (!this.geometry) return;

    const positionAttr = this.geometry.getAttribute("position");
    const velocityAttr = this.geometry.getAttribute("velocity");

    if (positionAttr) positionAttr.needsUpdate = true;
    if (velocityAttr) velocityAttr.needsUpdate = true;
  }
}
