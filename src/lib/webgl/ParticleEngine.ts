// src/lib/webgl/ParticleEngine.ts
// Framework-agnostic particle engine for WebGL rendering with Three.js
// Provides deterministic physics simulation and GPU-optimized rendering

import * as THREE from "three";

export interface ParticleEngineOptions {
  particleCount?: number;
  baseColor?: THREE.ColorRepresentation;
  pointSize?: number;
  noiseStrength?: number;
  attractionStrength?: number;
  deterministicSeed?: number;
  isLowPowerDevice?: boolean;
}

interface ParticleState {
  positions: Float32Array;
  velocities: Float32Array;
  lifetimes: Float32Array;
  seeds: Float32Array;
}

export class ParticleEngine {
  private readonly options: Required<ParticleEngineOptions>;
  private geometry: THREE.BufferGeometry | null = null;
  private material: THREE.ShaderMaterial | null = null;
  private points: THREE.Points | null = null;
  private state: ParticleState | null = null;
  private initialized = false;
  private disposed = false;
  private time = 0;

  private mousePosition = new THREE.Vector2(0, 0);
  private enableMouseAttraction = false;
  private enableNoise = false;

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
    };
  }

  init(scene: THREE.Scene): void {
    if (this.initialized) {
      console.warn("ParticleEngine already initialized");
      return;
    }
    if (this.disposed) {
      throw new Error("Cannot reinitialize disposed ParticleEngine");
    }

    this.createGeometry();
    this.createMaterial();
    this.createPoints();
    this.initializeParticleState();

    if (this.points) {
      scene.add(this.points);
    }

    this.initialized = true;
  }

  update(dt: number): void {
    if (!this.initialized || this.disposed || !this.state || !this.geometry) {
      return;
    }

    this.time += dt;
    this.updateParticles(dt);
    this.updateUniforms();
    this.markAttributesForUpdate();
  }

  resize(viewport: { width: number; height: number; dpr?: number }): void {
    if (!this.material) return;

    const dpr = viewport.dpr ?? 1;
    this.material.uniforms.uViewport.value.set(viewport.width, viewport.height);
    this.material.uniforms.uPixelRatio.value = dpr;
  }

  dispose(): void {
    if (this.disposed) return;

    if (this.geometry) {
      this.geometry.dispose();
      this.geometry = null;
    }

    if (this.material) {
      this.material.dispose();
      this.material = null;
    }

    this.points = null;
    this.state = null;
    this.disposed = true;
    this.initialized = false;
  }

  get particlePoints(): THREE.Points | null {
    return this.points;
  }

  setMouseAttraction(enabled: boolean, position?: THREE.Vector2): void {
    this.enableMouseAttraction = enabled;
    if (enabled && position) {
      this.mousePosition.copy(position);
    }
  }

  setNoiseEnabled(enabled: boolean): void {
    this.enableNoise = enabled;
  }

  private createGeometry(): void {
    this.geometry = new THREE.BufferGeometry();

    const count = this.options.particleCount;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);
    const seeds = new Float32Array(count);

    this.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    this.geometry.setAttribute(
      "velocity",
      new THREE.Float32BufferAttribute(velocities, 3)
    );
    this.geometry.setAttribute(
      "lifetime",
      new THREE.Float32BufferAttribute(lifetimes, 1)
    );
    this.geometry.setAttribute(
      "seed",
      new THREE.Float32BufferAttribute(seeds, 1)
    );

    const positionAttr = this.geometry.getAttribute("position");
    const velocityAttr = this.geometry.getAttribute("velocity");

    if (positionAttr instanceof THREE.BufferAttribute) {
      positionAttr.setUsage(THREE.DynamicDrawUsage);
    }
    if (velocityAttr instanceof THREE.BufferAttribute) {
      velocityAttr.setUsage(THREE.DynamicDrawUsage);
    }
  }

  private createMaterial(): void {
    const baseColor = new THREE.Color(this.options.baseColor);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uViewport: { value: new THREE.Vector2(1920, 1080) },
        uBaseColor: { value: baseColor },
        uPointSize: { value: this.options.pointSize },
        uNoiseStrength: { value: this.options.noiseStrength },
        uAttractionStrength: { value: this.options.attractionStrength },
      },
      vertexShader: `
        attribute float lifetime;
        attribute float seed;
        attribute vec3 velocity;
        
        uniform float uTime;
        uniform float uPixelRatio;
        uniform vec2 uViewport;
        uniform float uPointSize;
        
        varying float vLifetime;
        varying float vSeed;
        
        void main() {
          vLifetime = lifetime;
          vSeed = seed;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          float distanceScale = 1.0 / (-mvPosition.z);
          float screenScale = min(uViewport.x, uViewport.y) / 1080.0;
          
          gl_PointSize = uPointSize * uPixelRatio * distanceScale * screenScale;
        }
      `,
      fragmentShader: `
        uniform vec3 uBaseColor;
        
        varying float vLifetime;
        varying float vSeed;
        
        void main() {
          vec2 center = gl_PointCoord - 0.5;
          float distance = length(center);
          
          if (distance > 0.5) discard;
          
          float alpha = 1.0 - smoothstep(0.3, 0.5, distance);
          alpha *= smoothstep(0.0, 0.1, vLifetime);
          alpha *= smoothstep(1.0, 0.9, vLifetime);
          
          vec3 color = uBaseColor;
          color += sin(vSeed * 6.28318) * 0.1;
          
          gl_FragColor = vec4(color, alpha * 0.8);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
    });
  }

  private createPoints(): void {
    if (!this.geometry || !this.material) return;
    this.points = new THREE.Points(this.geometry, this.material);
  }

  private initializeParticleState(): void {
    if (!this.geometry) return;

    const count = this.options.particleCount;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);
    const seeds = new Float32Array(count);

    const rng = this.createSeededRNG(this.options.deterministicSeed);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      positions[i3] = (rng() - 0.5) * 20;
      positions[i3 + 1] = (rng() - 0.5) * 20;
      positions[i3 + 2] = (rng() - 0.5) * 20;

      velocities[i3] = (rng() - 0.5) * 2;
      velocities[i3 + 1] = (rng() - 0.5) * 2;
      velocities[i3 + 2] = (rng() - 0.5) * 2;

      lifetimes[i] = rng();
      seeds[i] = rng() * 1000;
    }

    this.state = { positions, velocities, lifetimes, seeds };

    const positionAttr = this.geometry.getAttribute("position");
    const velocityAttr = this.geometry.getAttribute("velocity");
    const lifetimeAttr = this.geometry.getAttribute("lifetime");
    const seedAttr = this.geometry.getAttribute("seed");

    (positionAttr.array as Float32Array).set(positions);
    positionAttr.needsUpdate = true;

    (velocityAttr.array as Float32Array).set(velocities);
    velocityAttr.needsUpdate = true;

    (lifetimeAttr.array as Float32Array).set(lifetimes);
    lifetimeAttr.needsUpdate = true;

    (seedAttr.array as Float32Array).set(seeds);
    seedAttr.needsUpdate = true;
  }

  private updateParticles(dt: number): void {
    if (!this.state) return;

    const { positions, velocities, lifetimes, seeds } = this.state;
    const count = this.options.particleCount;
    const damping = 0.99;
    const rng = this.createSeededRNG(
      this.options.deterministicSeed + Math.floor(this.time * 1000)
    );

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      positions[i3] += velocities[i3] * dt;
      positions[i3 + 1] += velocities[i3 + 1] * dt;
      positions[i3 + 2] += velocities[i3 + 2] * dt;

      velocities[i3] *= damping;
      velocities[i3 + 1] *= damping;
      velocities[i3 + 2] *= damping;

      if (this.enableNoise) {
        const noiseScale = this.options.noiseStrength * dt;
        velocities[i3] += Math.sin(this.time * 0.5 + seeds[i]) * noiseScale;
        velocities[i3 + 1] += Math.cos(this.time * 0.7 + seeds[i]) * noiseScale;
        velocities[i3 + 2] += Math.sin(this.time * 0.3 + seeds[i]) * noiseScale;
      }

      if (this.enableMouseAttraction) {
        const dx = this.mousePosition.x - positions[i3];
        const dy = this.mousePosition.y - positions[i3 + 1];
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0.1) {
          const force = (this.options.attractionStrength * dt) / (distance + 1);
          velocities[i3] += dx * force;
          velocities[i3 + 1] += dy * force;
        }
      }

      lifetimes[i] -= dt * 0.2;

      if (lifetimes[i] <= 0) {
        positions[i3] = (rng() - 0.5) * 20;
        positions[i3 + 1] = (rng() - 0.5) * 20;
        positions[i3 + 2] = (rng() - 0.5) * 20;

        velocities[i3] = (rng() - 0.5) * 2;
        velocities[i3 + 1] = (rng() - 0.5) * 2;
        velocities[i3 + 2] = (rng() - 0.5) * 2;

        lifetimes[i] = 1;
        seeds[i] = rng() * 1000;
      }
    }
  }

  private updateUniforms(): void {
    if (!this.material) return;

    this.material.uniforms.uTime.value = this.time;
    this.material.uniforms.uNoiseStrength.value = this.enableNoise
      ? this.options.noiseStrength
      : 0;
    this.material.uniforms.uAttractionStrength.value = this
      .enableMouseAttraction
      ? this.options.attractionStrength
      : 0;
  }

  private markAttributesForUpdate(): void {
    if (!this.geometry) return;

    this.geometry.getAttribute("position").needsUpdate = true;
    this.geometry.getAttribute("velocity").needsUpdate = true;
    this.geometry.getAttribute("lifetime").needsUpdate = true;
    this.geometry.getAttribute("seed").needsUpdate = true;
  }

  private createSeededRNG(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 2147483647;
      return state / 2147483647;
    };
  }
}
