// src/components/sections/Hero/ParticleSystem.tsx
// React Three Fiber wrapper for integrated WebGL particle system with full geometry, shaders, and interaction support

"use client";

import { detectDevicePerformanceSync } from "@/lib/performance/DeviceDetection";
import { ParticleEngine } from "@/lib/webgl/ParticleEngine";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";

interface ParticleSystemProps {
  particleCount?: number;
  className?: string;
  style?: React.CSSProperties;
  onEngineReady?: (engine: ParticleEngine) => void;
  performanceTier?: "low" | "medium" | "high";
  enableInteraction?: boolean;
}

interface ParticleRendererProps {
  particleCount: number;
  onEngineReady?: (engine: ParticleEngine) => void;
  performanceTier: "low" | "medium" | "high";
  enableInteraction: boolean;
}

function ParticleRenderer({
  particleCount,
  onEngineReady,
  performanceTier,
  enableInteraction,
}: ParticleRendererProps) {
  const { scene, camera, size, gl } = useThree();
  const engineRef = useRef<ParticleEngine | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const [initialized, setInitialized] = useState(false);

  const initializeEngine = useCallback(() => {
    if (engineRef.current || !scene || !camera) return;

    const domElement = gl.domElement.parentElement || gl.domElement;
    containerRef.current = domElement;

    const isLowPowerDevice = performanceTier === "low";

    const engine = new ParticleEngine({
      particleCount,
      baseColor: 0x00aaff,
      pointSize: isLowPowerDevice ? 3.0 : 4.0,
      noiseStrength: isLowPowerDevice ? 0.05 : 0.1,
      attractionStrength: isLowPowerDevice ? 0.3 : 0.5,
      isLowPowerDevice,
      geometryOptions: {
        spawnRadius: 6.0,
        initialSpeed: isLowPowerDevice ? 0.3 : 0.5,
        damping: 0.985,
        lifetimeRange: [0.7, 1.0],
        positionDistribution: "sphere",
        velocityDistribution: "outward",
      },
      mouseOptions: {
        radius: isLowPowerDevice ? 1.0 : 1.5,
        strength: isLowPowerDevice ? 0.3 : 0.5,
        throttle: isLowPowerDevice,
      },
    });

    try {
      engine.init(scene, camera, domElement);
      engineRef.current = engine;
      setInitialized(true);

      engine.setNoiseEnabled(true);

      if (enableInteraction) {
        engine.setMouseAttraction(true);
      }

      if (onEngineReady) {
        onEngineReady(engine);
      }
    } catch (error) {
      console.error("Failed to initialize particle engine:", error);
    }
  }, [
    scene,
    camera,
    gl.domElement,
    particleCount,
    performanceTier,
    enableInteraction,
    onEngineReady,
  ]);

  useEffect(() => {
    initializeEngine();

    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
        setInitialized(false);
      }
    };
  }, [initializeEngine]);

  useEffect(() => {
    if (engineRef.current && initialized) {
      engineRef.current.resize({
        width: size.width,
        height: size.height,
        dpr: gl.getPixelRatio(),
      });
    }
  }, [size.width, size.height, gl, initialized]);

  useEffect(() => {
    if (engineRef.current && initialized) {
      engineRef.current.setMouseAttraction(enableInteraction);
    }
  }, [enableInteraction, initialized]);

  useFrame((_, delta) => {
    if (engineRef.current && initialized) {
      const clampedDelta = Math.min(delta, 0.033);
      engineRef.current.update(clampedDelta);
    }
  });

  return null;
}

export default function ParticleSystem({
  particleCount,
  className = "",
  style,
  onEngineReady,
  performanceTier,
  enableInteraction = true,
}: ParticleSystemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [resolvedParticleCount, setResolvedParticleCount] =
    useState<number>(350);
  const [resolvedPerformanceTier, setResolvedPerformanceTier] = useState<
    "low" | "medium" | "high"
  >("medium");

  useEffect(() => {
    if (particleCount !== undefined) {
      setResolvedParticleCount(particleCount);
    } else {
      try {
        const detection = detectDevicePerformanceSync();
        setResolvedParticleCount(detection.recommendedParticleCount);
        setResolvedPerformanceTier(detection.tier);
      } catch (error) {
        console.warn("Device detection failed, using fallback values:", error);
        setResolvedParticleCount(350);
        setResolvedPerformanceTier("medium");
      }
    }
  }, [particleCount]);

  const finalPerformanceTier = performanceTier || resolvedPerformanceTier;
  const frameloop = finalPerformanceTier === "low" ? "demand" : "always";

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={style}
    >
      <Canvas
        frameloop={frameloop}
        dpr={finalPerformanceTier === "low" ? [1, 1.5] : [1, 2]}
        gl={{
          antialias: finalPerformanceTier !== "low",
          alpha: true,
          powerPreference:
            finalPerformanceTier === "low" ? "low-power" : "high-performance",
          stencil: false,
          depth: true,
        }}
        camera={{
          position: [0, 0, 10],
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ParticleRenderer
          particleCount={resolvedParticleCount}
          onEngineReady={onEngineReady}
          performanceTier={finalPerformanceTier}
          enableInteraction={enableInteraction}
        />
      </Canvas>
    </div>
  );
}
