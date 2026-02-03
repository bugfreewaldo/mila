/**
 * Monitor Stream Types
 *
 * Types for the vital sign monitor streaming system.
 */

import type { Alert, VitalSign, VitalType } from "./domain";

// ============================================================================
// Monitor Events
// ============================================================================

export type MonitorEvent =
  | { type: "vital"; data: VitalSign }
  | { type: "alert"; data: Alert }
  | { type: "connection"; status: ConnectionStatus };

export type ConnectionStatus = "connected" | "disconnected" | "reconnecting";

// ============================================================================
// Monitor Configuration
// ============================================================================

export interface MonitorConfig {
  /** Interval between vital updates in milliseconds */
  updateIntervalMs: number;
  /** Ring buffer size per vital type (entries) */
  bufferSize: number;
  /** Enable alert generation */
  alertsEnabled: boolean;
  /** Alert cooldown period in milliseconds */
  alertCooldownMs: number;
}

export const DEFAULT_MONITOR_CONFIG: MonitorConfig = {
  updateIntervalMs: 1000,
  bufferSize: 300, // 5 minutes at 1/sec
  alertsEnabled: true,
  alertCooldownMs: 30000, // 30 seconds
};

// ============================================================================
// Vital Thresholds
// ============================================================================

export interface VitalThreshold {
  value: number;
  duration: number; // seconds
}

export interface VitalThresholds {
  low?: VitalThreshold;
  high?: VitalThreshold;
  criticalLow?: VitalThreshold;
  criticalHigh?: VitalThreshold;
}

/**
 * Neonatal vital sign thresholds for alert generation
 */
export const NEONATAL_THRESHOLDS: Record<VitalType, VitalThresholds> = {
  hr: {
    low: { value: 100, duration: 10 }, // Bradycardia: <100 for 10s
    high: { value: 180, duration: 15 }, // Tachycardia: >180 for 15s
    criticalLow: { value: 80, duration: 5 }, // Severe brady
    criticalHigh: { value: 200, duration: 10 }, // Severe tachy
  },
  spo2: {
    low: { value: 88, duration: 10 }, // Desaturation: <88% for 10s
    criticalLow: { value: 80, duration: 5 }, // Severe desat: <80% for 5s
  },
  rr: {
    low: { value: 0, duration: 20 }, // Apnea: no breaths for 20s
    high: { value: 60, duration: 30 }, // Tachypnea: >60 for 30s
    criticalLow: { value: 0, duration: 30 }, // Prolonged apnea
  },
  temp: {
    low: { value: 36.0, duration: 60 }, // Hypothermia: <36°C for 60s
    high: { value: 37.5, duration: 60 }, // Hyperthermia: >37.5°C for 60s
    criticalLow: { value: 35.5, duration: 30 }, // Severe hypothermia
    criticalHigh: { value: 38.5, duration: 30 }, // Severe hyperthermia
  },
  bp_sys: {
    low: { value: 40, duration: 30 }, // Hypotension
    high: { value: 80, duration: 30 }, // Hypertension
  },
  bp_dia: {
    low: { value: 25, duration: 30 },
    high: { value: 50, duration: 30 },
  },
};

// ============================================================================
// Vital Baseline Configuration
// ============================================================================

export interface VitalBaseline {
  mean: number;
  stdDev: number;
  unit: string;
}

/**
 * Normal neonatal vital sign baselines for mock data generation
 */
export const NEONATAL_BASELINES: Record<VitalType, VitalBaseline> = {
  hr: { mean: 140, stdDev: 15, unit: "bpm" },
  spo2: { mean: 95, stdDev: 3, unit: "%" },
  rr: { mean: 40, stdDev: 8, unit: "/min" },
  temp: { mean: 36.8, stdDev: 0.3, unit: "°C" },
  bp_sys: { mean: 60, stdDev: 8, unit: "mmHg" },
  bp_dia: { mean: 35, stdDev: 5, unit: "mmHg" },
};

// ============================================================================
// Threshold Violation Tracking
// ============================================================================

export interface ThresholdViolation {
  vitalType: VitalType;
  thresholdType: "low" | "high" | "criticalLow" | "criticalHigh";
  startTime: number; // timestamp ms
  consecutiveCount: number;
}

// ============================================================================
// Monitor Stream Interface
// ============================================================================

export interface IMonitorStream {
  /** Connect to patient monitor stream */
  connect(patientId: string): void;

  /** Disconnect from monitor stream */
  disconnect(): void;

  /** Subscribe to monitor events */
  subscribe(callback: (event: MonitorEvent) => void): () => void;

  /** Check connection status */
  isConnected(): boolean;

  /** Get current connection status */
  getConnectionStatus(): ConnectionStatus;

  /** Get ring buffer for specific vital type */
  getBuffer(vitalType: VitalType): VitalSign[];

  /** Get latest value for specific vital type */
  getLatestValue(vitalType: VitalType): VitalSign | null;

  /** Update configuration */
  updateConfig(config: Partial<MonitorConfig>): void;
}
