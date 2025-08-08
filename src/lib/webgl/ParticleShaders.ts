// src/lib/webgl/ParticleShaders.ts
// Phase 4: Enhanced shaders with advanced effects and performance optimizations

import * as THREE from "three";

export interface ParticleUniforms {
  uTime: { value: number };
  uPixelRatio: { value: number };
  uViewport: { value: THREE.Vector2 };
  uBaseColor: { value: THREE.Color };
  uPointSize: { value: number };
  uNoiseStrength: { value: number };
  uAttractionStrength: { value: number };
  uMousePosition: { value: THREE.Vector2 };
  uMouseStrength: { value: number };
  uFadeDistance: { value: number };
  uColorVariation: { value: number };
}

export const particleUniforms: ParticleUniforms = {
  uTime: { value: 0 },
  uPixelRatio: { value: 1 },
  uViewport: { value: new THREE.Vector2(1920, 1080) },
  uBaseColor: { value: new THREE.Color(0x00aaff) },
  uPointSize: { value: 4.0 },
  uNoiseStrength: { value: 0.1 },
  uAttractionStrength: { value: 0.5 },
  uMousePosition: { value: new THREE.Vector2(0, 0) },
  uMouseStrength: { value: 0.0 },
  uFadeDistance: { value: 50.0 },
  uColorVariation: { value: 0.3 },
} as const;

export const particleVertexShader = `
precision highp float;

attribute vec3 position;
attribute vec3 velocity;
attribute float lifetime;
attribute float seed;
attribute float damping;
attribute float mass;
attribute float phase;

uniform float uTime;
uniform float uPixelRatio;
uniform vec2 uViewport;
uniform float uPointSize;
uniform float uNoiseStrength;
uniform float uAttractionStrength;
uniform vec2 uMousePosition;
uniform float uMouseStrength;
uniform float uFadeDistance;

varying float vLifetime;
varying float vSeed;
varying float vDistance;
varying float vMass;
varying float vPhase;
varying vec3 vWorldPosition;

// Simplex 3D noise
vec3 permute(vec3 x) { 
  return mod(((x*34.0)+1.0)*x, 289.0); 
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = 1.79284291400159 - 0.85373472095314 * 
              vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vLifetime = lifetime;
  vSeed = seed;
  vMass = mass;
  vPhase = phase;
  
  // Base animated position
  vec3 animatedPosition = position + velocity * uTime * 0.1;
  
  // Add noise displacement
  if (uNoiseStrength > 0.0) {
    float noiseScale = 0.5;
    float noiseSpeed = 0.3;
    
    vec3 noisePos = animatedPosition * noiseScale + uTime * noiseSpeed;
    float noise = snoise(noisePos + seed);
    
    float verticalNoise = snoise(noisePos * 1.5 + vec3(100.0, 0.0, 0.0));
    float spiralNoise = snoise(noisePos * 0.8 + vec3(0.0, 200.0, 0.0));
    
    vec3 noiseDisplacement = vec3(
      noise * cos(phase + uTime * 0.5),
      verticalNoise * 0.7,
      spiralNoise * sin(phase + uTime * 0.3)
    ) * uNoiseStrength;
    
    animatedPosition += noiseDisplacement;
  }
  
  // Mouse attraction
  if (uMouseStrength > 0.0 && uAttractionStrength > 0.0) {
    vec4 mvPosition = modelViewMatrix * vec4(animatedPosition, 1.0);
    vec2 screenPos = (mvPosition.xy / mvPosition.w) * 0.5 + 0.5;
    screenPos.y = 1.0 - screenPos.y;
    
    vec2 mouseDistance = uMousePosition - screenPos;
    float dist = length(mouseDistance);
    float influence = smoothstep(0.3, 0.0, dist);
    
    if (influence > 0.0) {
      vec3 attraction = vec3(mouseDistance * influence * uMouseStrength * uAttractionStrength, 0.0);
      animatedPosition += attraction * (1.0 / mass);
    }
  }
  
  vec4 mvPosition = modelViewMatrix * vec4(animatedPosition, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  vWorldPosition = animatedPosition;
  vDistance = length(mvPosition.xyz);
  
  // Adaptive point size based on distance and performance
  float distanceScale = 1.0 / max(-mvPosition.z, 0.1);
  float screenScale = min(uViewport.x, uViewport.y) / 1080.0;
  float massScale = mix(0.8, 1.2, mass);
  float lifetimeScale = smoothstep(0.0, 0.1, lifetime) * smoothstep(1.0, 0.9, lifetime);
  
  gl_PointSize = uPointSize * uPixelRatio * distanceScale * screenScale * massScale * lifetimeScale;
  gl_PointSize = clamp(gl_PointSize, 0.5, 32.0);
}
` as const;

export const particleFragmentShader = `
precision highp float;

uniform vec3 uBaseColor;
uniform float uTime;
uniform float uColorVariation;
uniform float uFadeDistance;

varying float vLifetime;
varying float vSeed;
varying float vDistance;
varying float vMass;
varying float vPhase;
varying vec3 vWorldPosition;

void main() {
  vec2 center = gl_PointCoord - 0.5;
  float distanceFromCenter = length(center);
  
  // Discard pixels outside circle
  if (distanceFromCenter > 0.5) {
    discard;
  }
  
  // Soft circular edge
  float softEdge = 1.0 - smoothstep(0.2, 0.5, distanceFromCenter);
  
  // Core glow effect
  float coreGlow = 1.0 - smoothstep(0.0, 0.3, distanceFromCenter);
  coreGlow = pow(coreGlow, 2.0);
  
  // Lifetime-based fade
  float lifetimeFade = smoothstep(0.0, 0.1, vLifetime) * smoothstep(1.0, 0.8, vLifetime);
  
  // Distance-based fade
  float distanceFade = 1.0 - smoothstep(uFadeDistance * 0.5, uFadeDistance, vDistance);
  
  // Color variation based on seed and world position
  vec3 color = uBaseColor;
  
  if (uColorVariation > 0.0) {
    float colorShift = sin(vSeed * 6.28318 + uTime * 0.2) * 0.5 + 0.5;
    float heightInfluence = (vWorldPosition.y + 10.0) / 20.0;
    
    // Create color palette variations
    vec3 color1 = vec3(0.2, 0.6, 1.0);  // Blue
    vec3 color2 = vec3(0.6, 0.2, 1.0);  // Purple
    vec3 color3 = vec3(0.2, 1.0, 0.6);  // Cyan
    
    if (colorShift < 0.33) {
      color = mix(color1, color2, colorShift * 3.0);
    } else if (colorShift < 0.66) {
      color = mix(color2, color3, (colorShift - 0.33) * 3.0);
    } else {
      color = mix(color3, color1, (colorShift - 0.66) * 3.0);
    }
    
    color = mix(uBaseColor, color, uColorVariation * heightInfluence);
  }
  
  // Pulsing effect based on phase
  float pulse = sin(vPhase + uTime * 2.0) * 0.1 + 0.9;
  color *= pulse;
  
  // Mass affects brightness
  float massBrightness = mix(0.7, 1.3, vMass);
  color *= massBrightness;
  
  // Enhanced glow for core
  float glowIntensity = coreGlow * 0.3 + 0.7;
  color *= glowIntensity;
  
  // Final alpha calculation
  float alpha = softEdge * lifetimeFade * distanceFade;
  alpha *= 0.9; // Base transparency
  
  // Add subtle sparkle effect
  float sparkle = smoothstep(0.8, 1.0, sin(vSeed * 50.0 + uTime * 3.0));
  alpha += sparkle * 0.3 * coreGlow;
  
  gl_FragColor = vec4(color, alpha);
}
` as const;
