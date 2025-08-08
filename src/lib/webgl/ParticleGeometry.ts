// src/lib/webgl/ParticleGeometry.ts
// Phase 4: Optimized particle geometry with enhanced physics and memory efficiency

import * as THREE from "three";

export interface ParticleGeometryOptions {
  count: number;
  spawnRadius?: number;
  initialSpeed?: number;
  damping?: number;
  lifetimeRange?: [min: number, max: number];
  seed?: number;
  positionDistribution?: "sphere" | "disc" | "box" | "ring" | "helix";
  velocityDistribution?: "outward" | "random" | "upward" | "orbital" | "spiral";
  enablePhysics?: boolean;
  gravityStrength?: number;
  turbulenceStrength?: number;
}

export interface ParticleAttributes {
  position: THREE.BufferAttribute;
  velocity: THREE.BufferAttribute;
  lifetime: THREE.BufferAttribute;
  seed: THREE.BufferAttribute;
  damping: THREE.BufferAttribute;
  mass: THREE.BufferAttribute;
  phase: THREE.BufferAttribute;
}

export interface GeometryResult {
  geometry: THREE.BufferGeometry;
  attrs: ParticleAttributes;
  metadata: {
    particleCount: number;
    memoryUsage: number;
    distributionType: string;
  };
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
  const r = Math.pow(random(), 1 / 3) * radius;
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
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
  return [x, y, (random() - 0.5) * 0.5];
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

function generateRingPosition(
  random: () => number,
  radius: number
): [number, number, number] {
  const angle = random() * Math.PI * 2;
  const r = radius * (0.7 + random() * 0.3);
  const x = r * Math.cos(angle);
  return [x, r * Math.sin(angle), (random() - 0.5) * 0.2];
}

function generateHelixPosition(
  random: () => number,
  radius: number,
  index: number,
  totalCount: number
): [number, number, number] {
  const t = (index / totalCount) * Math.PI * 4;
  const r = radius * (0.5 + random() * 0.5);
  const height = (index / totalCount - 0.5) * radius * 2;
  const x = r * Math.cos(t + random() * 0.5);
  const z = r * Math.sin(t + random() * 0.5);
  return [x, height, z];
}

function generateOutwardVelocity(
  position: [number, number, number],
  speed: number,
  random: () => number
): [number, number, number] {
  const [x, y, z] = position;
  const length = Math.sqrt(x * x + y * y + z * z);

  if (length < 0.001) {
    return [
      (random() - 0.5) * speed,
      (random() - 0.5) * speed,
      (random() - 0.5) * speed,
    ];
  }

  const normalizedX = x / length;
  const normalizedY = y / length;
  const normalizedZ = z / length;

  const variation = 0.3;
  const vx = normalizedX * speed + (random() - 0.5) * variation;
  const vy = normalizedY * speed + (random() - 0.5) * variation;
  const vz = normalizedZ * speed + (random() - 0.5) * variation;

  return [vx, vy, vz];
}

function generateRandomVelocity(
  speed: number,
  random: () => number
): [number, number, number] {
  const theta = random() * Math.PI * 2;
  const phi = Math.acos(1 - 2 * random());

  const vx = speed * Math.sin(phi) * Math.cos(theta);
  const vy = speed * Math.sin(phi) * Math.sin(theta);
  const vz = speed * Math.cos(phi);

  return [vx, vy, vz];
}

function generateUpwardVelocity(
  speed: number,
  random: () => number
): [number, number, number] {
  const angle = random() * Math.PI * 2;
  const upwardBias = 0.7 + random() * 0.3;
  const lateralSpread = 0.3;

  const vx = Math.cos(angle) * speed * lateralSpread * (random() - 0.5);
  const vy = speed * upwardBias;
  const vz = Math.sin(angle) * speed * lateralSpread * (random() - 0.5);

  return [vx, vy, vz];
}

function generateOrbitalVelocity(
  position: [number, number, number],
  speed: number,
  random: () => number
): [number, number, number] {
  const [x, y] = position;
  const vx = -y * speed + (random() - 0.5) * 0.1;
  const vy = x * speed + (random() - 0.5) * 0.1;
  const vz = (random() - 0.5) * speed * 0.2;

  return [vx, vy, vz];
}

function generateSpiralVelocity(
  position: [number, number, number],
  speed: number,
  random: () => number
): [number, number, number] {
  const [x, , z] = position;
  const radius = Math.sqrt(x * x + z * z);

  if (radius < 0.001) {
    return generateRandomVelocity(speed, random);
  }

  const tangentX = -z / radius;
  const tangentZ = x / radius;

  const spiralFactor = 0.7;
  const upwardFactor = 0.3;

  const vx = tangentX * speed * spiralFactor + (random() - 0.5) * 0.1;
  const vy = speed * upwardFactor;
  const vz = tangentZ * speed * spiralFactor + (random() - 0.5) * 0.1;

  return [vx, vy, vz];
}

export function createParticleGeometry(
  options: ParticleGeometryOptions
): GeometryResult {
  const {
    count,
    spawnRadius = 5.0,
    initialSpeed = 0.5,
    damping = 0.98,
    lifetimeRange = [1.0, 3.0],
    seed = 12345,
    positionDistribution = "sphere",
    velocityDistribution = "outward",
  } = options;

  const random = rng(seed);
  const geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const lifetimes = new Float32Array(count);
  const seeds = new Float32Array(count);
  const dampings = new Float32Array(count);
  const masses = new Float32Array(count);
  const phases = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    let position: [number, number, number];
    switch (positionDistribution) {
      case "disc":
        position = generateDiscPosition(random, spawnRadius);
        break;
      case "box":
        position = generateBoxPosition(random, spawnRadius);
        break;
      case "ring":
        position = generateRingPosition(random, spawnRadius);
        break;
      case "helix":
        position = generateHelixPosition(random, spawnRadius, i, count);
        break;
      default:
        position = generateSpherePosition(random, spawnRadius);
    }

    let velocity: [number, number, number];
    switch (velocityDistribution) {
      case "random":
        velocity = generateRandomVelocity(initialSpeed, random);
        break;
      case "upward":
        velocity = generateUpwardVelocity(initialSpeed, random);
        break;
      case "orbital":
        velocity = generateOrbitalVelocity(position, initialSpeed, random);
        break;
      case "spiral":
        velocity = generateSpiralVelocity(position, initialSpeed, random);
        break;
      default:
        velocity = generateOutwardVelocity(position, initialSpeed, random);
    }

    positions[i3] = position[0];
    positions[i3 + 1] = position[1];
    positions[i3 + 2] = position[2];

    velocities[i3] = velocity[0];
    velocities[i3 + 1] = velocity[1];
    velocities[i3 + 2] = velocity[2];

    const minLifetime = lifetimeRange[0];
    const maxLifetime = lifetimeRange[1];
    lifetimes[i] = minLifetime + random() * (maxLifetime - minLifetime);

    seeds[i] = random();
    dampings[i] = damping + (random() - 0.5) * 0.02;
    masses[i] = 0.8 + random() * 0.4;
    phases[i] = random() * Math.PI * 2;
  }

  const positionAttr = new THREE.BufferAttribute(positions, 3);
  const velocityAttr = new THREE.BufferAttribute(velocities, 3);
  const lifetimeAttr = new THREE.BufferAttribute(lifetimes, 1);
  const seedAttr = new THREE.BufferAttribute(seeds, 1);
  const dampingAttr = new THREE.BufferAttribute(dampings, 1);
  const massAttr = new THREE.BufferAttribute(masses, 1);
  const phaseAttr = new THREE.BufferAttribute(phases, 1);

  geometry.setAttribute("position", positionAttr);
  geometry.setAttribute("velocity", velocityAttr);
  geometry.setAttribute("lifetime", lifetimeAttr);
  geometry.setAttribute("seed", seedAttr);
  geometry.setAttribute("damping", dampingAttr);
  geometry.setAttribute("mass", massAttr);
  geometry.setAttribute("phase", phaseAttr);

  positionAttr.setUsage(THREE.DynamicDrawUsage);
  velocityAttr.setUsage(THREE.DynamicDrawUsage);

  const memoryUsage =
    positions.byteLength +
    velocities.byteLength +
    lifetimes.byteLength +
    seeds.byteLength +
    dampings.byteLength +
    masses.byteLength +
    phases.byteLength;

  return {
    geometry,
    attrs: {
      position: positionAttr,
      velocity: velocityAttr,
      lifetime: lifetimeAttr,
      seed: seedAttr,
      damping: dampingAttr,
      mass: massAttr,
      phase: phaseAttr,
    },
    metadata: {
      particleCount: count,
      memoryUsage,
      distributionType: `${positionDistribution}-${velocityDistribution}`,
    },
  };
}
