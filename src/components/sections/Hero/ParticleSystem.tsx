// src/components/sections/Hero/ParticleSystem.tsx
// React Three Fiber wrapper for WebGL particle system with performance optimization

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
}

interface ParticleRendererProps {
  particleCount: number;
  onEngineReady?: (engine: ParticleEngine) => void;
  performanceTier: "low" | "medium" | "high";
}

function ParticleRenderer({
  particleCount,
  onEngineReady,
  performanceTier,
}: ParticleRendererProps) {
  const { scene, size, gl } = useThree();
  const engineRef = useRef<ParticleEngine | null>(null);
  const [initialized, setInitialized] = useState(false);

  const initializeEngine = useCallback(() => {
    if (engineRef.current || !scene) return;

    const isLowPowerDevice = performanceTier === "low";
    const engine = new ParticleEngine({
      particleCount,
      baseColor: 0x00aaff,
      pointSize: isLowPowerDevice ? 3.0 : 4.0,
      noiseStrength: isLowPowerDevice ? 0.05 : 0.1,
      attractionStrength: isLowPowerDevice ? 0.3 : 0.5,
      isLowPowerDevice,
    });

    try {
      engine.init(scene);
      engineRef.current = engine;
      setInitialized(true);

      if (onEngineReady) {
        onEngineReady(engine);
      }
    } catch (error) {
      console.error("Failed to initialize particle engine:", error);
    }
  }, [scene, particleCount, performanceTier, onEngineReady]);

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
        dpr={[1, 2]}
        gl={{
          antialias: finalPerformanceTier !== "low",
          alpha: true,
          powerPreference:
            finalPerformanceTier === "low" ? "low-power" : "high-performance",
        }}
        camera={{
          position: [0, 0, 10],
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
      >
        <ParticleRenderer
          particleCount={resolvedParticleCount}
          onEngineReady={onEngineReady}
          performanceTier={finalPerformanceTier}
        />
      </Canvas>
    </div>
  );
}
