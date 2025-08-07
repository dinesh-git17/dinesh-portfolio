// src/lib/webgl/ParticleShaders.ts
// Custom vertex and fragment shader source strings with strongly-typed uniform layouts

import * as THREE from "three";

export interface ParticleUniforms {
  uTime: { value: number };
  uPixelRatio: { value: number };
  uViewport: { value: THREE.Vector2 };
  uBaseColor: { value: THREE.Color };
  uPointSize: { value: number };
  uNoiseStrength: { value: number };
  uAttractionStrength: { value: number };
}

export const particleUniforms: ParticleUniforms = {
  uTime: { value: 0 },
  uPixelRatio: { value: 1 },
  uViewport: { value: new THREE.Vector2(1920, 1080) },
  uBaseColor: { value: new THREE.Color(0x00aaff) },
  uPointSize: { value: 4.0 },
  uNoiseStrength: { value: 0.1 },
  uAttractionStrength: { value: 0.5 },
} as const;

export const particleVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec3 velocity;
attribute float lifetime;
attribute float seed;

uniform float uTime;
uniform float uPixelRatio;
uniform vec2 uViewport;
uniform float uPointSize;
uniform float uNoiseStrength;

varying float vLifetime;
varying float vSeed;

void main() {
  vLifetime = lifetime;
  vSeed = seed;
  
  vec3 animatedPosition = position + velocity * uTime * 0.1;
  
  if (uNoiseStrength > 0.0) {
    float noiseX = sin(uTime * 0.5 + seed) * uNoiseStrength;
    float noiseY = cos(uTime * 0.7 + seed) * uNoiseStrength;
    float noiseZ = sin(uTime * 0.3 + seed) * uNoiseStrength;
    animatedPosition += vec3(noiseX, noiseY, noiseZ);
  }
  
  vec4 mvPosition = modelViewMatrix * vec4(animatedPosition, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  float distanceScale = 1.0 / max(-mvPosition.z, 0.1);
  float screenScale = min(uViewport.x, uViewport.y) / 1080.0;
  
  gl_PointSize = uPointSize * uPixelRatio * distanceScale * screenScale;
  gl_PointSize = clamp(gl_PointSize, 1.0, 64.0);
}
` as const;

export const particleFragmentShader = `
precision mediump float;

uniform vec3 uBaseColor;

varying float vLifetime;
varying float vSeed;

void main() {
  vec2 center = gl_PointCoord - 0.5;
  float distanceFromCenter = length(center);
  
  if (distanceFromCenter > 0.5) {
    discard;
  }
  
  float softEdge = 1.0 - smoothstep(0.3, 0.5, distanceFromCenter);
  
  float lifetimeFade = smoothstep(0.0, 0.1, vLifetime) * 
                       smoothstep(1.0, 0.9, vLifetime);
  
  float alpha = softEdge * lifetimeFade;
  
  vec3 color = uBaseColor;
  float colorVariation = sin(vSeed * 6.28318) * 0.1;
  color = mix(color, color * 1.2, colorVariation);
  
  gl_FragColor = vec4(color, alpha * 0.8);
}
` as const;
