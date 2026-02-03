/**
 * Mock Monitor Stream
 *
 * Simulates real-time vital sign monitoring with:
 * - Per-vital ring buffers for sparkline data
 * - Deterministic threshold-based alert generation
 * - Realistic vital sign variations
 */

import type {
  IMonitorStream,
  MonitorEvent,
  MonitorConfig,
  ConnectionStatus,
  ThresholdViolation,
} from "../../types/monitor";
import {
  DEFAULT_MONITOR_CONFIG,
  NEONATAL_THRESHOLDS,
  NEONATAL_BASELINES,
} from "../../types/monitor";
import type { VitalSign, Alert, VitalType, AlertType, Severity } from "../../types/domain";
import { RingBuffer } from "./ring-buffer";
import { generateId } from "../../utils/ids";
import { nowISO } from "../../utils/dates";

type Subscriber = (event: MonitorEvent) => void;

class MockMonitorStreamClass implements IMonitorStream {
  private config: MonitorConfig = { ...DEFAULT_MONITOR_CONFIG };
  private connectionStatus: ConnectionStatus = "disconnected";
  private patientId: string | null = null;
  private subscribers: Set<Subscriber> = new Set();
  private intervalId: ReturnType<typeof setInterval> | null = null;

  // Ring buffers per vital type
  private buffers: Map<VitalType, RingBuffer<VitalSign>> = new Map();

  // Latest values for quick access
  private latestValues: Map<VitalType, VitalSign> = new Map();

  // Threshold violation tracking for deterministic alerts
  private violations: Map<string, ThresholdViolation> = new Map();

  // Alert cooldown tracking
  private alertCooldowns: Map<string, number> = new Map();

  // Event simulation state
  private eventState: {
    inEvent: boolean;
    eventType: "brady" | "desat" | null;
    eventStartTime: number;
    eventDuration: number;
    recoveryStartTime: number | null;
  } = {
    inEvent: false,
    eventType: null,
    eventStartTime: 0,
    eventDuration: 0,
    recoveryStartTime: null,
  };

  constructor() {
    this.initializeBuffers();
  }

  private initializeBuffers(): void {
    const vitalTypes: VitalType[] = ["hr", "spo2", "rr", "temp"];
    for (const type of vitalTypes) {
      this.buffers.set(type, new RingBuffer(this.config.bufferSize));
    }
  }

  // ============================================================================
  // IMonitorStream Implementation
  // ============================================================================

  connect(patientId: string): void {
    if (this.connectionStatus === "connected") {
      this.disconnect();
    }

    this.patientId = patientId;
    this.connectionStatus = "connected";
    this.emit({ type: "connection", status: "connected" });

    // Clear old data
    this.clearBuffers();
    this.violations.clear();
    this.alertCooldowns.clear();

    // Start generating vitals
    this.startVitalGeneration();
  }

  disconnect(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.connectionStatus = "disconnected";
    this.patientId = null;
    this.emit({ type: "connection", status: "disconnected" });
  }

  subscribe(callback: Subscriber): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  isConnected(): boolean {
    return this.connectionStatus === "connected";
  }

  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  getBuffer(vitalType: VitalType): VitalSign[] {
    const buffer = this.buffers.get(vitalType);
    return buffer ? buffer.toArray() : [];
  }

  getLatestValue(vitalType: VitalType): VitalSign | null {
    return this.latestValues.get(vitalType) ?? null;
  }

  updateConfig(config: Partial<MonitorConfig>): void {
    this.config = { ...this.config, ...config };

    // Reinitialize buffers if size changed
    if (config.bufferSize !== undefined) {
      this.initializeBuffers();
    }

    // Restart generation if interval changed
    if (config.updateIntervalMs !== undefined && this.isConnected()) {
      this.stopVitalGeneration();
      this.startVitalGeneration();
    }
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private emit(event: MonitorEvent): void {
    for (const subscriber of this.subscribers) {
      try {
        subscriber(event);
      } catch (error) {
        console.error("[MockMonitor] Subscriber error:", error);
      }
    }
  }

  private clearBuffers(): void {
    for (const buffer of this.buffers.values()) {
      buffer.clear();
    }
    this.latestValues.clear();
  }

  private startVitalGeneration(): void {
    this.intervalId = setInterval(() => {
      this.generateVitals();
    }, this.config.updateIntervalMs);

    // Generate initial values immediately
    this.generateVitals();
  }

  private stopVitalGeneration(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private generateVitals(): void {
    if (!this.patientId) return;

    const now = Date.now();
    const timestamp = new Date(now).toISOString();

    // Check for event transitions
    this.updateEventState(now);

    // Generate each vital type
    const vitalTypes: VitalType[] = ["hr", "spo2", "rr", "temp"];

    for (const type of vitalTypes) {
      const value = this.generateVitalValue(type);
      const vital: VitalSign = {
        id: generateId(),
        patientId: this.patientId,
        occurredAt: timestamp,
        type,
        value,
        unit: NEONATAL_BASELINES[type].unit,
        source: "monitor",
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      // Store in buffer and latest
      this.buffers.get(type)?.push(vital);
      this.latestValues.set(type, vital);

      // Emit vital event
      this.emit({ type: "vital", data: vital });

      // Check for alerts
      if (this.config.alertsEnabled) {
        this.checkThresholds(type, value, now);
      }
    }
  }

  private generateVitalValue(type: VitalType): number {
    const baseline = NEONATAL_BASELINES[type];
    let value = this.gaussianRandom(baseline.mean, baseline.stdDev);

    // Apply event modifications
    if (this.eventState.inEvent) {
      value = this.applyEventEffect(type, value);
    }

    // Apply recovery curve if recovering
    if (this.eventState.recoveryStartTime !== null) {
      value = this.applyRecoveryEffect(type, value);
    }

    // Clamp to reasonable bounds
    value = this.clampVital(type, value);

    // Round appropriately
    return type === "temp" ? Math.round(value * 10) / 10 : Math.round(value);
  }

  private updateEventState(now: number): void {
    // Chance to start a new event (10% per minute = ~0.17% per second)
    if (!this.eventState.inEvent && Math.random() < 0.0017) {
      this.eventState.inEvent = true;
      this.eventState.eventType = Math.random() < 0.5 ? "brady" : "desat";
      this.eventState.eventStartTime = now;
      this.eventState.eventDuration = 5000 + Math.random() * 15000; // 5-20 seconds
      this.eventState.recoveryStartTime = null;
    }

    // Check if event should end
    if (this.eventState.inEvent) {
      const elapsed = now - this.eventState.eventStartTime;
      if (elapsed >= this.eventState.eventDuration) {
        this.eventState.inEvent = false;
        this.eventState.recoveryStartTime = now;
      }
    }

    // Check if recovery is complete (10 second recovery)
    if (this.eventState.recoveryStartTime !== null) {
      const recoveryElapsed = now - this.eventState.recoveryStartTime;
      if (recoveryElapsed >= 10000) {
        this.eventState.recoveryStartTime = null;
        this.eventState.eventType = null;
      }
    }
  }

  private applyEventEffect(type: VitalType, baseValue: number): number {
    if (this.eventState.eventType === "brady" && type === "hr") {
      // Bradycardia: drop HR to 70-90
      return 70 + Math.random() * 20;
    }

    if (this.eventState.eventType === "desat" && type === "spo2") {
      // Desaturation: drop SpO2 to 75-85
      return 75 + Math.random() * 10;
    }

    return baseValue;
  }

  private applyRecoveryEffect(type: VitalType, baseValue: number): number {
    if (!this.eventState.recoveryStartTime || !this.eventState.eventType) {
      return baseValue;
    }

    const recoveryProgress = Math.min(
      1,
      (Date.now() - this.eventState.recoveryStartTime) / 10000
    );

    if (this.eventState.eventType === "brady" && type === "hr") {
      // Recover from ~80 to normal ~140
      const lowValue = 80;
      const normalValue = NEONATAL_BASELINES.hr.mean;
      return lowValue + (normalValue - lowValue) * recoveryProgress;
    }

    if (this.eventState.eventType === "desat" && type === "spo2") {
      // Recover from ~80 to normal ~95
      const lowValue = 80;
      const normalValue = NEONATAL_BASELINES.spo2.mean;
      return lowValue + (normalValue - lowValue) * recoveryProgress;
    }

    return baseValue;
  }

  private clampVital(type: VitalType, value: number): number {
    const bounds: Record<VitalType, [number, number]> = {
      hr: [40, 220],
      spo2: [50, 100],
      rr: [0, 100],
      temp: [34, 40],
      bp_sys: [30, 120],
      bp_dia: [15, 80],
    };

    const [min, max] = bounds[type];
    return Math.max(min, Math.min(max, value));
  }

  private checkThresholds(type: VitalType, value: number, now: number): void {
    const thresholds = NEONATAL_THRESHOLDS[type];
    if (!thresholds) return;

    // Check each threshold level
    const checks: Array<{
      key: "low" | "high" | "criticalLow" | "criticalHigh";
      condition: boolean;
      alertType: AlertType;
      severity: Severity;
    }> = [
      {
        key: "criticalLow",
        condition:
          thresholds.criticalLow !== undefined &&
          value < thresholds.criticalLow.value,
        alertType: this.getAlertTypeForVital(type, "low"),
        severity: "critical",
      },
      {
        key: "criticalHigh",
        condition:
          thresholds.criticalHigh !== undefined &&
          value > thresholds.criticalHigh.value,
        alertType: this.getAlertTypeForVital(type, "high"),
        severity: "critical",
      },
      {
        key: "low",
        condition:
          thresholds.low !== undefined && value < thresholds.low.value,
        alertType: this.getAlertTypeForVital(type, "low"),
        severity: "warning",
      },
      {
        key: "high",
        condition:
          thresholds.high !== undefined && value > thresholds.high.value,
        alertType: this.getAlertTypeForVital(type, "high"),
        severity: "warning",
      },
    ];

    for (const check of checks) {
      const violationKey = `${type}-${check.key}`;
      const threshold = thresholds[check.key];

      if (!threshold) continue;

      if (check.condition) {
        // Threshold violated
        const existing = this.violations.get(violationKey);

        if (existing) {
          // Increment consecutive count
          existing.consecutiveCount++;

          // Check if duration threshold met
          const durationMet =
            existing.consecutiveCount >=
            threshold.duration / (this.config.updateIntervalMs / 1000);

          if (durationMet && !this.isInCooldown(violationKey, now)) {
            this.fireAlert(check.alertType, check.severity, type, value);
            this.alertCooldowns.set(violationKey, now);
            this.violations.delete(violationKey);
          }
        } else {
          // Start tracking violation
          this.violations.set(violationKey, {
            vitalType: type,
            thresholdType: check.key,
            startTime: now,
            consecutiveCount: 1,
          });
        }
      } else {
        // Value back to normal - clear violation tracking
        this.violations.delete(violationKey);
      }
    }
  }

  private getAlertTypeForVital(
    vitalType: VitalType,
    direction: "low" | "high"
  ): AlertType {
    const mapping: Record<VitalType, { low: AlertType; high: AlertType }> = {
      hr: { low: "bradycardia", high: "tachycardia" },
      spo2: { low: "desaturation", high: "custom" },
      rr: { low: "apnea", high: "custom" },
      temp: { low: "temp", high: "temp" },
      bp_sys: { low: "custom", high: "custom" },
      bp_dia: { low: "custom", high: "custom" },
    };

    return mapping[vitalType]?.[direction] ?? "custom";
  }

  private isInCooldown(key: string, now: number): boolean {
    const lastAlert = this.alertCooldowns.get(key);
    if (!lastAlert) return false;
    return now - lastAlert < this.config.alertCooldownMs;
  }

  private fireAlert(
    alertType: AlertType,
    severity: Severity,
    vitalType: VitalType,
    value: number
  ): void {
    if (!this.patientId) return;

    const timestamp = nowISO();
    const unit = NEONATAL_BASELINES[vitalType].unit;

    const messages: Record<AlertType, string> = {
      bradycardia: `Bradycardia detected: HR ${value} ${unit}`,
      tachycardia: `Tachycardia detected: HR ${value} ${unit}`,
      desaturation: `Desaturation detected: SpO2 ${value}${unit}`,
      apnea: `Apnea detected: RR ${value} ${unit}`,
      temp: `Temperature alert: ${value}${unit}`,
      custom: `Vital alert: ${vitalType} = ${value} ${unit}`,
      hemolysis_warning: `Hemolysis risk detected - elevated markers`,
      hemolysis_critical: `Critical hemolysis risk - immediate attention required`,
      phlebotomy_warning: `High phlebotomy blood loss - monitor hemoglobin`,
      phlebotomy_critical: `Critical phlebotomy blood loss - consider transfusion`,
    };

    const alert: Alert = {
      id: generateId(),
      patientId: this.patientId,
      occurredAt: timestamp,
      type: alertType,
      severity,
      message: messages[alertType],
      acknowledged: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.emit({ type: "alert", data: alert });
  }

  private gaussianRandom(mean: number, stdDev: number): number {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * stdDev;
  }
}

// Export singleton instance
export const MockMonitorStream = new MockMonitorStreamClass();
