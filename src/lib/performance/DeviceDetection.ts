// src/lib/performance/DeviceDetection.ts
// Privacy-safe device performance detection for particle system optimization

export type PerformanceTier = "low" | "medium" | "high";

export interface DevicePerfSnapshot {
  readonly isServer: boolean;
  readonly hardwareConcurrency?: number;
  readonly deviceMemoryGB?: number;
  readonly devicePixelRatio?: number;
  readonly maxTouchPoints?: number;
  readonly reducedMotion?: boolean;
  readonly batterySaver?: boolean;
  readonly webglRenderer?: string;
  readonly frameBudgetMs?: number;
  readonly userAgentHint?: "mobile" | "desktop" | "tablet" | "unknown";
}

export interface DetectionResult {
  readonly tier: PerformanceTier;
  readonly recommendedParticleCount: number;
  readonly snapshot: DevicePerfSnapshot;
}

interface BatteryManager {
  charging: boolean;
  level: number;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

interface NavigatorWithDeviceMemory extends Navigator {
  deviceMemory?: number;
}

// Threshold constants for performance tier classification
const PERFORMANCE_THRESHOLDS = {
  CPU_CORES: {
    LOW: 4,
    HIGH: 8,
  },
  MEMORY_GB: {
    LOW: 4,
    HIGH: 8,
  },
  PIXEL_RATIO: {
    HIGH_DPI_THRESHOLD: 2.75,
  },
  FRAME_BUDGET: {
    POOR: 20,
    GOOD: 12,
  },
  PARTICLE_COUNT: {
    LOW: 250,
    MEDIUM: 350,
    HIGH: 500,
  },
} as const;

const FRAME_SAMPLE_COUNT = 10;
const FRAME_SAMPLE_TIMEOUT = 1000;

function isServerEnvironment(): boolean {
  return typeof globalThis.window === "undefined";
}

function safeGetNavigator(): Navigator | undefined {
  if (isServerEnvironment()) return undefined;
  return globalThis.navigator;
}

function safeGetWindow(): Window | undefined {
  if (isServerEnvironment()) return undefined;
  return globalThis.window;
}

function getHardwareConcurrency(): number | undefined {
  const navigator = safeGetNavigator();
  return navigator?.hardwareConcurrency;
}

function getDeviceMemoryGB(): number | undefined {
  const navigator = safeGetNavigator() as NavigatorWithDeviceMemory | undefined;
  const deviceMemory = navigator?.deviceMemory;
  return typeof deviceMemory === "number"
    ? Math.floor(deviceMemory)
    : undefined;
}

function getDevicePixelRatio(): number | undefined {
  const window = safeGetWindow();
  return window?.devicePixelRatio;
}

function getMaxTouchPoints(): number | undefined {
  const navigator = safeGetNavigator();
  return navigator?.maxTouchPoints;
}

function getReducedMotionPreference(): boolean | undefined {
  const window = safeGetWindow();
  if (!window?.matchMedia) return undefined;

  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return undefined;
  }
}

function getUserAgentHint(): "mobile" | "desktop" | "tablet" | "unknown" {
  const window = safeGetWindow();
  const navigator = safeGetNavigator();

  if (!window || !navigator) return "unknown";

  const touchPoints = getMaxTouchPoints() || 0;
  const pixelRatio = getDevicePixelRatio() || 1;
  const screenWidth = window.screen?.width || 0;

  if (touchPoints > 5 && screenWidth > 768 && screenWidth < 1200) {
    return "tablet";
  }

  if (touchPoints > 0 && (pixelRatio > 2 || screenWidth < 768)) {
    return "mobile";
  }

  if (touchPoints === 0 && screenWidth >= 1024) {
    return "desktop";
  }

  return "unknown";
}

function getWebGLRenderer(): string | undefined {
  const window = safeGetWindow();
  if (!window || typeof document === "undefined") return undefined;

  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as
      | WebGL2RenderingContext
      | WebGLRenderingContext
      | null;

    if (!gl) return undefined;

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return undefined;

    const renderer = gl.getParameter(
      (debugInfo as unknown as { UNMASKED_RENDERER_WEBGL: number })
        .UNMASKED_RENDERER_WEBGL
    );

    canvas.remove();

    return typeof renderer === "string" ? renderer : undefined;
  } catch {
    return undefined;
  }
}

function classifyPerformanceTier(
  snapshot: DevicePerfSnapshot
): PerformanceTier {
  const {
    hardwareConcurrency = 0,
    deviceMemoryGB = 0,
    devicePixelRatio = 1,
    reducedMotion = false,
    batterySaver = false,
    frameBudgetMs,
    userAgentHint = "unknown",
  } = snapshot;

  if (reducedMotion || batterySaver) {
    return "low";
  }

  const isLowEndCPU =
    hardwareConcurrency > 0 &&
    hardwareConcurrency <= PERFORMANCE_THRESHOLDS.CPU_CORES.LOW;
  const isLowEndMemory =
    deviceMemoryGB > 0 &&
    deviceMemoryGB <= PERFORMANCE_THRESHOLDS.MEMORY_GB.LOW;
  const isPoorFrameTiming =
    frameBudgetMs && frameBudgetMs > PERFORMANCE_THRESHOLDS.FRAME_BUDGET.POOR;

  if (isLowEndCPU || isLowEndMemory || isPoorFrameTiming) {
    return "low";
  }

  const isHighEndCPU =
    hardwareConcurrency >= PERFORMANCE_THRESHOLDS.CPU_CORES.HIGH;
  const isHighEndMemory =
    deviceMemoryGB >= PERFORMANCE_THRESHOLDS.MEMORY_GB.HIGH;
  const isReasonableDPI =
    devicePixelRatio <= PERFORMANCE_THRESHOLDS.PIXEL_RATIO.HIGH_DPI_THRESHOLD;
  const isGoodFrameTiming =
    frameBudgetMs && frameBudgetMs < PERFORMANCE_THRESHOLDS.FRAME_BUDGET.GOOD;
  const isDesktopClass = userAgentHint === "desktop";

  if (
    isHighEndCPU &&
    isHighEndMemory &&
    isReasonableDPI &&
    (isGoodFrameTiming || !frameBudgetMs) &&
    isDesktopClass
  ) {
    return "high";
  }

  return "medium";
}

function getRecommendedParticleCount(tier: PerformanceTier): number {
  switch (tier) {
    case "low":
      return PERFORMANCE_THRESHOLDS.PARTICLE_COUNT.LOW;
    case "medium":
      return PERFORMANCE_THRESHOLDS.PARTICLE_COUNT.MEDIUM;
    case "high":
      return PERFORMANCE_THRESHOLDS.PARTICLE_COUNT.HIGH;
    default:
      return PERFORMANCE_THRESHOLDS.PARTICLE_COUNT.MEDIUM;
  }
}

function createSnapshot(
  webglRenderer?: string,
  frameBudgetMs?: number,
  batterySaver?: boolean
): DevicePerfSnapshot {
  return {
    isServer: isServerEnvironment(),
    hardwareConcurrency: getHardwareConcurrency(),
    deviceMemoryGB: getDeviceMemoryGB(),
    devicePixelRatio: getDevicePixelRatio(),
    maxTouchPoints: getMaxTouchPoints(),
    reducedMotion: getReducedMotionPreference(),
    batterySaver,
    webglRenderer,
    frameBudgetMs,
    userAgentHint: getUserAgentHint(),
  };
}

export function detectDevicePerformanceSync(): DetectionResult {
  const webglRenderer = getWebGLRenderer();
  const snapshot = createSnapshot(webglRenderer);
  const tier = classifyPerformanceTier(snapshot);
  const recommendedParticleCount = getRecommendedParticleCount(tier);

  return {
    tier,
    recommendedParticleCount,
    snapshot,
  };
}

async function getBatterySaverStatus(): Promise<boolean | undefined> {
  const navigator = safeGetNavigator() as NavigatorWithBattery | undefined;
  if (!navigator || typeof navigator.getBattery !== "function") {
    return undefined;
  }

  try {
    const battery = await navigator.getBattery();
    if (!battery) return undefined;

    return battery.charging === false && battery.level < 0.2;
  } catch {
    return undefined;
  }
}

async function sampleFrameTiming(): Promise<number | undefined> {
  const window = safeGetWindow();
  if (!window?.requestAnimationFrame) return undefined;

  return new Promise((resolve) => {
    const startTime = performance.now();
    const frameTimes: number[] = [];
    let frameCount = 0;
    let lastTime = startTime;

    const timeout = setTimeout(() => {
      resolve(undefined);
    }, FRAME_SAMPLE_TIMEOUT);

    function measureFrame(currentTime: number) {
      if (frameCount > 0) {
        frameTimes.push(currentTime - lastTime);
      }

      lastTime = currentTime;
      frameCount++;

      if (frameCount >= FRAME_SAMPLE_COUNT) {
        clearTimeout(timeout);
        const averageFrameTime =
          frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
        resolve(averageFrameTime);
        return;
      }

      requestAnimationFrame(measureFrame);
    }

    requestAnimationFrame(measureFrame);
  });
}

export async function detectDevicePerformance(): Promise<DetectionResult> {
  const syncResult = detectDevicePerformanceSync();

  if (isServerEnvironment()) {
    return syncResult;
  }

  try {
    const [batterySaver, frameBudgetMs] = await Promise.all([
      getBatterySaverStatus(),
      sampleFrameTiming(),
    ]);

    const enhancedSnapshot = createSnapshot(
      syncResult.snapshot.webglRenderer,
      frameBudgetMs,
      batterySaver
    );

    const enhancedTier = classifyPerformanceTier(enhancedSnapshot);
    const enhancedParticleCount = getRecommendedParticleCount(enhancedTier);

    return {
      tier: enhancedTier,
      recommendedParticleCount: enhancedParticleCount,
      snapshot: enhancedSnapshot,
    };
  } catch {
    return syncResult;
  }
}

export function __debugDescribe(snapshot: DevicePerfSnapshot): string {
  if (process.env.NODE_ENV === "production") return "";

  const parts = [
    `Server: ${snapshot.isServer}`,
    `CPU Cores: ${snapshot.hardwareConcurrency || "unknown"}`,
    `Memory: ${snapshot.deviceMemoryGB ? `${snapshot.deviceMemoryGB}GB` : "unknown"}`,
    `DPR: ${snapshot.devicePixelRatio || "unknown"}`,
    `Touch: ${snapshot.maxTouchPoints || 0}`,
    `Reduced Motion: ${snapshot.reducedMotion ? "yes" : "no"}`,
    `Battery Saver: ${snapshot.batterySaver === undefined ? "unknown" : snapshot.batterySaver ? "yes" : "no"}`,
    `WebGL: ${snapshot.webglRenderer ? snapshot.webglRenderer.substring(0, 30) + "..." : "unavailable"}`,
    `Frame Budget: ${snapshot.frameBudgetMs ? `${snapshot.frameBudgetMs.toFixed(1)}ms` : "unmeasured"}`,
    `UA Hint: ${snapshot.userAgentHint}`,
  ];

  return `[DeviceDetection] ${parts.join(" | ")}`;
}
