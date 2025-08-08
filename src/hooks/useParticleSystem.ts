// src/hooks/useParticleSystem.ts
// Phase 4: Performance optimized particle system hook with enhanced lifecycle management

import { invalidate, useThree, type RootState } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type * as THREE from "three";
import { detectDevicePerformanceSync } from "../lib/performance/DeviceDetection";
import {
  ParticleEngine,
  type ParticleEngineOptions,
} from "../lib/webgl/ParticleEngine";

export interface UseParticleSystemOptions {
  particleCount?: number;
  engine?: Partial<ParticleEngineOptions>;
  mode?: "always" | "demand" | "smart";
  performanceTier?: "low" | "medium" | "high";
  autoplay?: boolean;
  enableInteraction?: boolean;
  adaptiveQuality?: boolean;
}

export interface UseParticleSystemReturn {
  engine: ParticleEngine | null;
  points: THREE.Points | null;
  start: () => void;
  stop: () => void;
  isRunning: boolean;
  resize: (viewport: { width: number; height: number; dpr?: number }) => void;
  dispose: () => void;
  setInteractionEnabled: (enabled: boolean) => void;
  performanceStats: {
    frameTime: number;
    particleCount: number;
    tier: string;
  };
}

const MAX_DELTA_TIME = 0.033;
const PERFORMANCE_SAMPLE_SIZE = 60;

export function useParticleSystem(
  options: UseParticleSystemOptions = {}
): UseParticleSystemReturn {
  const {
    particleCount,
    engine: engineOptions = {},
    mode = "smart",
    performanceTier,
    autoplay = true,
    enableInteraction = true,
    adaptiveQuality = true,
  } = options;

  const { scene, gl, size, viewport } = useThree((state: RootState) => ({
    scene: state.scene,
    gl: state.gl,
    size: state.size,
    viewport: state.viewport,
  }));

  const engineRef = useRef<ParticleEngine | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const frameTimesRef = useRef<number[]>([]);
  const performanceMonitorRef = useRef<{
    lastCheck: number;
    frameCount: number;
    averageFrameTime: number;
  }>({ lastCheck: 0, frameCount: 0, averageFrameTime: 16.67 });

  const [isRunning, setIsRunning] = useState(false);
  const [interactionEnabled, setInteractionEnabled] =
    useState(enableInteraction);
  const [currentTier, setCurrentTier] = useState<"low" | "medium" | "high">(
    "medium"
  );

  const finalParticleCount = useMemo(() => {
    if (particleCount !== undefined) {
      return particleCount;
    }

    if (typeof window === "undefined") {
      return 250;
    }

    const devicePerf = detectDevicePerformanceSync();
    const tier = performanceTier || devicePerf.tier;
    setCurrentTier(tier);

    const tierMap = {
      low: 200,
      medium: 350,
      high: 500,
    } as const;

    return tierMap[tier];
  }, [particleCount, performanceTier]);

  const engineConfig = useMemo<ParticleEngineOptions>(() => {
    const isLowPower = currentTier === "low";

    return {
      particleCount: finalParticleCount,
      baseColor: 0x00aaff,
      pointSize: isLowPower ? 3.0 : 4.0,
      noiseStrength: isLowPower ? 0.05 : 0.1,
      attractionStrength: isLowPower ? 0.3 : 0.5,
      isLowPowerDevice: isLowPower,
      geometryOptions: {
        spawnRadius: isLowPower ? 4.0 : 6.0,
        initialSpeed: isLowPower ? 0.3 : 0.5,
        damping: 0.985,
        lifetimeRange: [0.7, 1.0],
        positionDistribution: "sphere",
        velocityDistribution: "outward",
      },
      mouseOptions: {
        radius: isLowPower ? 1.0 : 1.5,
        strength: isLowPower ? 0.3 : 0.5,
        throttle: isLowPower,
      },
      ...engineOptions,
    };
  }, [finalParticleCount, currentTier, engineOptions]);

  const updatePerformanceStats = useCallback(
    (deltaTime: number) => {
      const frameTime = deltaTime * 1000;
      frameTimesRef.current.push(frameTime);

      if (frameTimesRef.current.length > PERFORMANCE_SAMPLE_SIZE) {
        frameTimesRef.current.shift();
      }

      const monitor = performanceMonitorRef.current;
      monitor.frameCount++;

      const now = performance.now();
      if (now - monitor.lastCheck >= 1000) {
        const avgFrameTime =
          frameTimesRef.current.reduce((a, b) => a + b, 0) /
          frameTimesRef.current.length;
        monitor.averageFrameTime = avgFrameTime;
        monitor.lastCheck = now;
        monitor.frameCount = 0;

        if (adaptiveQuality && avgFrameTime > 20 && currentTier !== "low") {
          console.warn(
            "Performance degradation detected, consider reducing particle count"
          );
        }
      }
    },
    [adaptiveQuality, currentTier]
  );

  const runAnimationLoop = useCallback(() => {
    if (!engineRef.current || !isRunning) {
      return;
    }

    const currentTime = performance.now() * 0.001;
    const deltaTime =
      lastTimeRef.current === 0
        ? 0
        : Math.min(currentTime - lastTimeRef.current, MAX_DELTA_TIME);

    lastTimeRef.current = currentTime;

    if (deltaTime > 0) {
      engineRef.current.update(deltaTime);
      updatePerformanceStats(deltaTime);
    }

    if (mode === "demand" || mode === "smart") {
      invalidate();
    }

    if (isRunning) {
      if (mode === "always") {
        animationFrameRef.current = requestAnimationFrame(runAnimationLoop);
      }
    }
  }, [isRunning, mode, updatePerformanceStats]);

  useEffect(() => {
    if (typeof window === "undefined" || !scene) {
      return;
    }

    if (!engineRef.current) {
      engineRef.current = new ParticleEngine(engineConfig);

      try {
        engineRef.current.init(scene);

        if (interactionEnabled) {
          engineRef.current.setMouseAttraction(true);
        }
      } catch (error) {
        console.error("Failed to initialize particle engine:", error);
        return;
      }
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, [scene, engineConfig, interactionEnabled]);

  const start = useCallback(() => {
    if (isRunning || !engineRef.current) {
      return;
    }

    setIsRunning(true);
    lastTimeRef.current = performance.now() * 0.001;

    if (mode === "always") {
      animationFrameRef.current = requestAnimationFrame(runAnimationLoop);
    } else if (mode === "smart") {
      invalidate();
    }
  }, [isRunning, mode, runAnimationLoop]);

  const stop = useCallback(() => {
    if (!isRunning) {
      return;
    }

    setIsRunning(false);

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [isRunning]);

  const resize = useCallback(
    (newViewport: { width: number; height: number; dpr?: number }) => {
      if (!engineRef.current) {
        return;
      }

      const dpr = newViewport.dpr ?? gl.getPixelRatio();
      engineRef.current.resize({
        width: newViewport.width,
        height: newViewport.height,
        dpr,
      });
    },
    [gl]
  );

  const dispose = useCallback(() => {
    stop();

    if (engineRef.current) {
      engineRef.current.dispose();
      engineRef.current = null;
    }

    frameTimesRef.current = [];
  }, [stop]);

  const handleSetInteractionEnabled = useCallback((enabled: boolean) => {
    setInteractionEnabled(enabled);

    if (engineRef.current) {
      engineRef.current.setMouseAttraction(enabled);
    }
  }, []);

  useEffect(() => {
    if (mode === "always" && isRunning) {
      runAnimationLoop();
    }
  }, [mode, isRunning, runAnimationLoop]);

  useEffect(() => {
    if (autoplay && engineRef.current && !isRunning) {
      start();
    }
  }, [autoplay, start, isRunning]);

  useEffect(() => {
    resize({ width: size.width, height: size.height, dpr: viewport.dpr });
  }, [size.width, size.height, viewport.dpr, resize]);

  useEffect(() => {
    return () => {
      dispose();
    };
  }, [dispose]);

  const performanceStats = useMemo(
    () => ({
      frameTime: performanceMonitorRef.current.averageFrameTime,
      particleCount: finalParticleCount,
      tier: currentTier,
    }),
    [finalParticleCount, currentTier]
  );

  return {
    engine: engineRef.current,
    points: engineRef.current?.particlePoints ?? null,
    start,
    stop,
    isRunning,
    resize,
    dispose,
    setInteractionEnabled: handleSetInteractionEnabled,
    performanceStats,
  };
}
