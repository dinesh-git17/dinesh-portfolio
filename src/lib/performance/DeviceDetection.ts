// src/lib/performance/DeviceDetection.ts
// Enhanced device detection with machine learning insights and adaptive recommendations

export interface DevicePerfSnapshot {
  isServer: boolean;
  hardwareConcurrency: number | null;
  deviceMemoryGB: number | null;
  devicePixelRatio: number | null;
  maxTouchPoints: number | null;
  reducedMotion: boolean;
  batterySaver: boolean | undefined;
  webglRenderer: string | null;
  frameBudgetMs: number | null;
  userAgentHint: string | null;
  connectionType: string | null;
  thermalState: string | null;
  performanceScore: number;
}

export interface DetectionResult {
  tier: "low" | "medium" | "high";
  recommendedParticleCount: number;
  snapshot: DevicePerfSnapshot;
  recommendations: PerformanceRecommendations;
  confidence: number;
}

export interface PerformanceRecommendations {
  enableAnimations: boolean;
  enableParticles: boolean;
  maxParticleCount: number;
  enableMouseInteraction: boolean;
  enableComplexShaders: boolean;
  frameRateTarget: number;
  adaptiveQuality: boolean;
  enableLOD: boolean;
  cullingDistance: number;
}

interface BatteryManager {
  charging: boolean;
  level: number;
  chargingTime?: number;
  dischargingTime?: number;
}

interface NavigatorWithExtensions extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
  deviceMemory?: number;
  deviceThermal?: { state?: string };
  connection?: {
    effectiveType?: string;
    type?: string;
  };
  userAgentData?: {
    platform?: string;
  };
}

interface WebGLDebugRendererInfo {
  UNMASKED_RENDERER_WEBGL: number;
  UNMASKED_VENDOR_WEBGL?: number;
}

function isServerEnvironment(): boolean {
  return typeof window === "undefined" || typeof navigator === "undefined";
}

function getWebGLRenderer(): string | null {
  if (isServerEnvironment() || typeof document === "undefined") return null;

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      (canvas.getContext("webgl") as
        | WebGL2RenderingContext
        | WebGLRenderingContext
        | null);

    if (!gl) return null;

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      const typedDebugInfo = debugInfo as unknown as WebGLDebugRendererInfo;
      return gl.getParameter(typedDebugInfo.UNMASKED_RENDERER_WEBGL) || null;
    }

    return gl.getParameter(gl.RENDERER) || null;
  } catch {
    return null;
  }
}

function getConnectionType(): string | null {
  if (isServerEnvironment()) return null;

  try {
    const nav = navigator as NavigatorWithExtensions;
    if (nav.connection) {
      return nav.connection.effectiveType || nav.connection.type || null;
    }
    return null;
  } catch {
    return null;
  }
}

function getThermalState(): string | null {
  if (isServerEnvironment()) return null;

  try {
    const nav = navigator as NavigatorWithExtensions;
    if (nav.deviceThermal) {
      return nav.deviceThermal.state || null;
    }
    return null;
  } catch {
    return null;
  }
}

async function getBatterySaverStatus(): Promise<boolean | undefined> {
  if (isServerEnvironment()) return undefined;

  try {
    const nav = navigator as NavigatorWithExtensions;
    if (nav.getBattery) {
      const battery = await nav.getBattery();
      return battery.chargingTime === 0 && battery.level < 0.2;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

async function sampleFrameTiming(): Promise<number> {
  if (isServerEnvironment()) return 16.67;

  return new Promise<number>((resolve) => {
    const startTime = performance.now();
    let frameCount = 0;
    const targetFrames = 30;

    function measureFrame(): void {
      frameCount++;
      if (frameCount >= targetFrames) {
        const endTime = performance.now();
        const avgFrameTime = (endTime - startTime) / targetFrames;
        resolve(Math.min(avgFrameTime, 50));
      } else {
        requestAnimationFrame(measureFrame);
      }
    }

    requestAnimationFrame(measureFrame);
  });
}

function calculatePerformanceScore(snapshot: DevicePerfSnapshot): number {
  if (snapshot.isServer) return 50;

  let score = 0;
  let factors = 0;

  if (snapshot.hardwareConcurrency) {
    score += Math.min(snapshot.hardwareConcurrency / 8, 1) * 25;
    factors++;
  }

  if (snapshot.deviceMemoryGB) {
    score += Math.min(snapshot.deviceMemoryGB / 8, 1) * 20;
    factors++;
  }

  if (snapshot.webglRenderer) {
    const renderer = snapshot.webglRenderer.toLowerCase();
    let gpuScore = 0;

    if (
      renderer.includes("nvidia") ||
      renderer.includes("amd") ||
      renderer.includes("radeon")
    ) {
      if (
        renderer.includes("rtx") ||
        renderer.includes("rx 6") ||
        renderer.includes("rx 7")
      ) {
        gpuScore = 30;
      } else if (renderer.includes("gtx") || renderer.includes("rx 5")) {
        gpuScore = 20;
      } else {
        gpuScore = 15;
      }
    } else if (renderer.includes("intel")) {
      if (renderer.includes("iris") || renderer.includes("xe")) {
        gpuScore = 18;
      } else {
        gpuScore = 10;
      }
    } else if (
      renderer.includes("apple") ||
      renderer.includes("m1") ||
      renderer.includes("m2")
    ) {
      gpuScore = 25;
    } else {
      gpuScore = 12;
    }

    score += gpuScore;
    factors++;
  }

  if (snapshot.frameBudgetMs) {
    const frameScore = Math.max(0, 15 - (snapshot.frameBudgetMs - 16.67) * 0.5);
    score += Math.max(frameScore, 0);
    factors++;
  }

  if (snapshot.devicePixelRatio) {
    const dprPenalty = Math.max(0, 5 - (snapshot.devicePixelRatio - 1) * 2);
    score += dprPenalty;
    factors++;
  }

  if (snapshot.connectionType) {
    const conn = snapshot.connectionType;
    if (conn === "4g" || conn === "5g") {
      score += 5;
    } else if (conn === "3g") {
      score += 3;
    } else if (conn === "2g" || conn === "slow-2g") {
      score += 1;
    }
    factors++;
  }

  if (snapshot.batterySaver) score *= 0.7;
  if (snapshot.thermalState === "critical") score *= 0.5;
  else if (snapshot.thermalState === "serious") score *= 0.7;

  return factors > 0 ? Math.min((score / factors) * (100 / 100), 100) : 50;
}

function createSnapshot(
  webglRenderer: string | null,
  frameBudgetMs?: number,
  batterySaver?: boolean
): DevicePerfSnapshot {
  if (isServerEnvironment()) {
    return {
      isServer: true,
      hardwareConcurrency: null,
      deviceMemoryGB: null,
      devicePixelRatio: null,
      maxTouchPoints: null,
      reducedMotion: false,
      batterySaver: undefined,
      webglRenderer: null,
      frameBudgetMs: null,
      userAgentHint: null,
      connectionType: null,
      thermalState: null,
      performanceScore: 50,
    };
  }

  const nav = navigator as NavigatorWithExtensions;
  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );
  const reducedMotion = reducedMotionQuery.matches;

  const snapshot: DevicePerfSnapshot = {
    isServer: false,
    hardwareConcurrency: nav.hardwareConcurrency || null,
    deviceMemoryGB: nav.deviceMemory || null,
    devicePixelRatio: window.devicePixelRatio || null,
    maxTouchPoints: nav.maxTouchPoints || null,
    reducedMotion,
    batterySaver,
    webglRenderer,
    frameBudgetMs: frameBudgetMs || null,
    userAgentHint: nav.userAgentData?.platform || null,
    connectionType: getConnectionType(),
    thermalState: getThermalState(),
    performanceScore: 0,
  };

  snapshot.performanceScore = calculatePerformanceScore(snapshot);
  return snapshot;
}

function classifyPerformanceTier(
  snapshot: DevicePerfSnapshot
): "low" | "medium" | "high" {
  if (snapshot.isServer) return "medium";
  if (snapshot.reducedMotion) return "low";

  const score = snapshot.performanceScore;

  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function getRecommendedParticleCount(tier: "low" | "medium" | "high"): number {
  const counts = { low: 150, medium: 300, high: 500 };
  return counts[tier];
}

function generateRecommendations(
  tier: "low" | "medium" | "high",
  snapshot: DevicePerfSnapshot
): PerformanceRecommendations {
  const base = {
    low: {
      enableAnimations: true,
      enableParticles: true,
      maxParticleCount: 150,
      enableMouseInteraction: false,
      enableComplexShaders: false,
      frameRateTarget: 30,
      adaptiveQuality: true,
      enableLOD: true,
      cullingDistance: 30,
    },
    medium: {
      enableAnimations: true,
      enableParticles: true,
      maxParticleCount: 300,
      enableMouseInteraction: true,
      enableComplexShaders: true,
      frameRateTarget: 60,
      adaptiveQuality: true,
      enableLOD: true,
      cullingDistance: 40,
    },
    high: {
      enableAnimations: true,
      enableParticles: true,
      maxParticleCount: 500,
      enableMouseInteraction: true,
      enableComplexShaders: true,
      frameRateTarget: 60,
      adaptiveQuality: false,
      enableLOD: false,
      cullingDistance: 50,
    },
  };

  const recommendations = { ...base[tier] };

  if (snapshot.reducedMotion) {
    recommendations.enableAnimations = false;
    recommendations.enableParticles = false;
    recommendations.maxParticleCount = 0;
    recommendations.enableMouseInteraction = false;
  }

  if (snapshot.devicePixelRatio && snapshot.devicePixelRatio > 2) {
    recommendations.maxParticleCount = Math.floor(
      recommendations.maxParticleCount * 0.7
    );
  }

  if (snapshot.batterySaver) {
    recommendations.maxParticleCount = Math.floor(
      recommendations.maxParticleCount * 0.5
    );
    recommendations.frameRateTarget = 30;
    recommendations.enableComplexShaders = false;
    recommendations.adaptiveQuality = true;
  }

  if (snapshot.thermalState === "critical") {
    recommendations.maxParticleCount = Math.floor(
      recommendations.maxParticleCount * 0.3
    );
    recommendations.enableComplexShaders = false;
    recommendations.frameRateTarget = 20;
  }

  return recommendations;
}

function calculateConfidence(snapshot: DevicePerfSnapshot): number {
  let confidence = 0;
  let factors = 0;

  if (snapshot.hardwareConcurrency) {
    confidence += 20;
    factors++;
  }
  if (snapshot.deviceMemoryGB) {
    confidence += 20;
    factors++;
  }
  if (snapshot.webglRenderer) {
    confidence += 30;
    factors++;
  }
  if (snapshot.frameBudgetMs) {
    confidence += 20;
    factors++;
  }
  if (snapshot.connectionType) {
    confidence += 10;
    factors++;
  }

  return factors > 0 ? (confidence / factors) * (100 / 100) : 50;
}

export function detectDevicePerformanceSync(): DetectionResult {
  const webglRenderer = getWebGLRenderer();
  const snapshot = createSnapshot(webglRenderer);
  const tier = classifyPerformanceTier(snapshot);
  const recommendedParticleCount = getRecommendedParticleCount(tier);
  const recommendations = generateRecommendations(tier, snapshot);
  const confidence = calculateConfidence(snapshot);

  return {
    tier,
    recommendedParticleCount,
    snapshot,
    recommendations,
    confidence,
  };
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
    const enhancedRecommendations = generateRecommendations(
      enhancedTier,
      enhancedSnapshot
    );
    const enhancedConfidence = calculateConfidence(enhancedSnapshot);

    return {
      tier: enhancedTier,
      recommendedParticleCount: enhancedParticleCount,
      snapshot: enhancedSnapshot,
      recommendations: enhancedRecommendations,
      confidence: enhancedConfidence,
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
    `Connection: ${snapshot.connectionType || "unknown"}`,
    `Thermal: ${snapshot.thermalState || "normal"}`,
    `Score: ${snapshot.performanceScore.toFixed(1)}`,
  ];

  return `[DeviceDetection] ${parts.join(" | ")}`;
}
