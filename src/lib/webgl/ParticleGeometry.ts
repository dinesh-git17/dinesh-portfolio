// src/lib/webgl/ParticleGeometry.ts
// Particle buffer geometry system with deterministic physics-ready attributes

import * as THREE from "three";

export interface ParticleGeometryOptions {
  count: number;
  spawnRadius?: number;
  initialSpeed?: number;
  damping?: number;
  lifetimeRange?: [min: number, max: number];
  seed?: number;
  positionDistribution?: "sphere" | "disc" | "box";
  velocityDistribution?: "outward" | "random" | "upward";
}

export interface ParticleAttributes {
  position: THREE.BufferAttribute;
  velocity: THREE.BufferAttribute;
  lifetime: THREE.BufferAttribute;
  seed: THREE.BufferAttribute;
  damping: THREE.BufferAttribute;
}

function rng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 0x100000000;
    return (state >>> 0) / 0x100000000;
  };
}

function generateSpherePosition(
  random: () => number,
  radius: number
): [number, number, number] {
  const theta = random() * Math.PI * 2;
  const phi = Math.acos(1 - 2 * random());
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi) * Math.sin(theta);
  const z = radius * Math.cos(phi);
  return [x, y, z];
}

function generateDiscPosition(
  random: () => number,
  radius: number
): [number, number, number] {
  const angle = random() * Math.PI * 2;
  const r = Math.sqrt(random()) * radius;
  const x = r * Math.cos(angle);
  const y = r * Math.sin(angle);
  const z = 0;
  return [x, y, z];
}

function generateBoxPosition(
  random: () => number,
  radius: number
): [number, number, number] {
  const x = (random() - 0.5) * 2 * radius;
  const y = (random() - 0.5) * 2 * radius;
  const z = (random() - 0.5) * 2 * radius;
  return [x, y, z];
}

function generateOutwardVelocity(
  position: [number, number, number],
  speed: number
): [number, number, number] {
  const [x, y, z] = position;
  const length = Math.sqrt(x * x + y * y + z * z);
  if (length === 0) return [0, speed, 0];
  const invLength = speed / length;
  return [x * invLength, y * invLength, z * invLength];
}

function generateRandomVelocity(
  random: () => number,
  speed: number
): [number, number, number] {
  const theta = random() * Math.PI * 2;
  const phi = Math.acos(1 - 2 * random());
  const x = speed * Math.sin(phi) * Math.cos(theta);
  const y = speed * Math.sin(phi) * Math.sin(theta);
  const z = speed * Math.cos(phi);
  return [x, y, z];
}

function generateUpwardVelocity(
  random: () => number,
  speed: number
): [number, number, number] {
  const jitterAmount = 0.3;
  const x = (random() - 0.5) * jitterAmount * speed;
  const y = speed;
  const z = (random() - 0.5) * jitterAmount * speed;
  return [x, y, z];
}

function initializeParticleData(
  count: number,
  opts: Required<ParticleGeometryOptions>,
  random: () => number
): {
  positions: Float32Array;
  velocities: Float32Array;
  lifetimes: Float32Array;
  seeds: Float32Array;
  dampings: Float32Array;
} {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const lifetimes = new Float32Array(count);
  const seeds = new Float32Array(count);
  const dampings = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    let position: [number, number, number];
    switch (opts.positionDistribution) {
      case "sphere":
        position = generateSpherePosition(random, opts.spawnRadius);
        break;
      case "disc":
        position = generateDiscPosition(random, opts.spawnRadius);
        break;
      case "box":
        position = generateBoxPosition(random, opts.spawnRadius);
        break;
    }

    positions[i3] = position[0];
    positions[i3 + 1] = position[1];
    positions[i3 + 2] = position[2];

    let velocity: [number, number, number];
    switch (opts.velocityDistribution) {
      case "outward":
        velocity = generateOutwardVelocity(position, opts.initialSpeed);
        break;
      case "random":
        velocity = generateRandomVelocity(random, opts.initialSpeed);
        break;
      case "upward":
        velocity = generateUpwardVelocity(random, opts.initialSpeed);
        break;
    }

    velocities[i3] = velocity[0];
    velocities[i3 + 1] = velocity[1];
    velocities[i3 + 2] = velocity[2];

    const [minLifetime, maxLifetime] = opts.lifetimeRange;
    lifetimes[i] = minLifetime + random() * (maxLifetime - minLifetime);

    seeds[i] = random() * 1000;

    dampings[i] = opts.damping;
  }

  return { positions, velocities, lifetimes, seeds, dampings };
}

export function createParticleGeometry(opts: ParticleGeometryOptions): {
  geometry: THREE.BufferGeometry;
  attrs: ParticleAttributes;
} {
  const clampedCount = Math.max(1, Math.min(opts.count, 20000));
  const normalizedOpts: Required<ParticleGeometryOptions> = {
    count: clampedCount,
    spawnRadius: opts.spawnRadius ?? 2.0,
    initialSpeed: opts.initialSpeed ?? 0.2,
    damping: Math.max(0.9, Math.min(opts.damping ?? 0.985, 0.9999)),
    lifetimeRange: opts.lifetimeRange ?? [2, 5],
    seed: opts.seed ?? 1337,
    positionDistribution: opts.positionDistribution ?? "sphere",
    velocityDistribution: opts.velocityDistribution ?? "outward",
  };

  const geometry = new THREE.BufferGeometry();
  const random = rng(normalizedOpts.seed);

  const { positions, velocities, lifetimes, seeds, dampings } =
    initializeParticleData(clampedCount, normalizedOpts, random);

  const positionAttr = new THREE.Float32BufferAttribute(positions, 3);
  const velocityAttr = new THREE.Float32BufferAttribute(velocities, 3);
  const lifetimeAttr = new THREE.Float32BufferAttribute(lifetimes, 1);
  const seedAttr = new THREE.Float32BufferAttribute(seeds, 1);
  const dampingAttr = new THREE.Float32BufferAttribute(dampings, 1);

  if (positionAttr instanceof THREE.BufferAttribute) {
    positionAttr.setUsage(THREE.DynamicDrawUsage);
  }
  if (velocityAttr instanceof THREE.BufferAttribute) {
    velocityAttr.setUsage(THREE.DynamicDrawUsage);
  }

  geometry.setAttribute("position", positionAttr);
  geometry.setAttribute("velocity", velocityAttr);
  geometry.setAttribute("lifetime", lifetimeAttr);
  geometry.setAttribute("seed", seedAttr);
  geometry.setAttribute("damping", dampingAttr);

  updateBounding(geometry);

  const attrs: ParticleAttributes = {
    position: positionAttr,
    velocity: velocityAttr,
    lifetime: lifetimeAttr,
    seed: seedAttr,
    damping: dampingAttr,
  };

  return { geometry, attrs };
}

export function reseed(
  geometry: THREE.BufferGeometry,
  opts: Partial<ParticleGeometryOptions>
): void {
  const positionAttr = geometry.getAttribute("position");
  const velocityAttr = geometry.getAttribute("velocity");
  const lifetimeAttr = geometry.getAttribute("lifetime");
  const seedAttr = geometry.getAttribute("seed");
  const dampingAttr = geometry.getAttribute("damping");

  if (
    !positionAttr ||
    !velocityAttr ||
    !lifetimeAttr ||
    !seedAttr ||
    !dampingAttr ||
    !(positionAttr instanceof THREE.BufferAttribute) ||
    !(velocityAttr instanceof THREE.BufferAttribute)
  ) {
    throw new Error("Invalid geometry: missing required attributes");
  }

  const count = positionAttr.count;
  const currentSeed = opts.seed !== undefined ? opts.seed : 1337;

  const normalizedOpts: Required<ParticleGeometryOptions> = {
    count,
    spawnRadius: opts.spawnRadius ?? 2.0,
    initialSpeed: opts.initialSpeed ?? 0.2,
    damping: Math.max(0.9, Math.min(opts.damping ?? 0.985, 0.9999)),
    lifetimeRange: opts.lifetimeRange ?? [2, 5],
    seed: currentSeed,
    positionDistribution: opts.positionDistribution ?? "sphere",
    velocityDistribution: opts.velocityDistribution ?? "outward",
  };

  const random = rng(normalizedOpts.seed);
  const { positions, velocities, lifetimes, seeds, dampings } =
    initializeParticleData(count, normalizedOpts, random);

  (positionAttr.array as Float32Array).set(positions);
  positionAttr.needsUpdate = true;

  (velocityAttr.array as Float32Array).set(velocities);
  velocityAttr.needsUpdate = true;

  (lifetimeAttr.array as Float32Array).set(lifetimes);
  lifetimeAttr.needsUpdate = true;

  (seedAttr.array as Float32Array).set(seeds);
  seedAttr.needsUpdate = true;

  (dampingAttr.array as Float32Array).set(dampings);
  dampingAttr.needsUpdate = true;

  updateBounding(geometry);
}

export function updateBounding(geometry: THREE.BufferGeometry): void {
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
}
