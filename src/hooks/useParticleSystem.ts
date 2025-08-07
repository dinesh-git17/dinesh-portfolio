// src/hooks/useParticleSystem.ts
// Production-ready React hook for managing ParticleEngine lifecycle and render loop

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
  mode?: "always" | "demand";
  performanceTier?: "low" | "medium" | "high";
  autoplay?: boolean;
}

export interface UseParticleSystemReturn {
  engine: ParticleEngine | null;
  points: THREE.Points | null;
  start: () => void;
  stop: () => void;
  isRunning: boolean;
  resize: (viewport: { width: number; height: number; dpr?: number }) => void;
  dispose: () => void;
}

const MAX_DELTA_TIME = 0.1;

export function useParticleSystem(
  options: UseParticleSystemOptions = {}
): UseParticleSystemReturn {
  const {
    particleCount,
    engine: engineOptions = {},
    mode = "demand",
    performanceTier,
    autoplay = true,
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
  const [isRunning, setIsRunning] = useState(false);

  const finalParticleCount = useMemo(() => {
    if (particleCount !== undefined) {
      return particleCount;
    }

    if (typeof window === "undefined") {
      return 250;
    }

    const devicePerf = detectDevicePerformanceSync();

    if (performanceTier) {
      const tierMap = { low: 250, medium: 350, high: 500 } as const;
      return tierMap[performanceTier];
    }

    return devicePerf.recommendedParticleCount;
  }, [particleCount, performanceTier]);

  const engineConfig = useMemo<ParticleEngineOptions>(
    () => ({
      particleCount: finalParticleCount,
      ...engineOptions,
    }),
    [finalParticleCount, engineOptions]
  );

  useEffect(() => {
    if (typeof window === "undefined" || !scene) {
      return;
    }

    if (!engineRef.current) {
      engineRef.current = new ParticleEngine(engineConfig);
      engineRef.current.init(scene);
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, [scene, engineConfig]);

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

    engineRef.current.update(deltaTime);

    if (mode === "demand") {
      invalidate();
    }

    if (isRunning) {
      animationFrameRef.current = requestAnimationFrame(runAnimationLoop);
    }
  }, [isRunning, mode]);

  const start = useCallback(() => {
    if (isRunning || !engineRef.current) {
      return;
    }

    setIsRunning(true);
    lastTimeRef.current = performance.now() * 0.001;

    if (mode === "always") {
      animationFrameRef.current = requestAnimationFrame(runAnimationLoop);
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
  }, [stop]);

  useEffect(() => {
    if (mode === "always") {
      runAnimationLoop();
    }
  }, [mode, runAnimationLoop]);

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

  return {
    engine: engineRef.current,
    points: engineRef.current?.particlePoints ?? null,
    start,
    stop,
    isRunning,
    resize,
    dispose,
  };
}
