import type { VitalRangeDefinition, VitalType } from "../types/domain";

/**
 * Vital Sign Range Definitions
 *
 * Reference ranges for neonatal vital signs.
 * These are used for display and trend analysis (not alerting - see monitor thresholds).
 */

export const VITAL_RANGES: VitalRangeDefinition[] = [
  {
    type: "hr",
    name: "Heart Rate",
    unit: "bpm",
    normalLow: 120,
    normalHigh: 160,
    warningLow: 100,
    warningHigh: 180,
    criticalLow: 80,
    criticalHigh: 200,
  },
  {
    type: "spo2",
    name: "Oxygen Saturation",
    unit: "%",
    normalLow: 90,
    normalHigh: 100,
    warningLow: 88,
    warningHigh: 100,
    criticalLow: 80,
    criticalHigh: 100,
  },
  {
    type: "rr",
    name: "Respiratory Rate",
    unit: "/min",
    normalLow: 30,
    normalHigh: 60,
    warningLow: 20,
    warningHigh: 70,
    criticalLow: 0,
    criticalHigh: 80,
  },
  {
    type: "temp",
    name: "Temperature",
    unit: "°C",
    normalLow: 36.5,
    normalHigh: 37.5,
    warningLow: 36.0,
    warningHigh: 37.8,
    criticalLow: 35.5,
    criticalHigh: 38.5,
  },
  {
    type: "bp_sys",
    name: "Systolic BP",
    unit: "mmHg",
    normalLow: 50,
    normalHigh: 75,
    warningLow: 40,
    warningHigh: 85,
    criticalLow: 35,
    criticalHigh: 100,
  },
  {
    type: "bp_dia",
    name: "Diastolic BP",
    unit: "mmHg",
    normalLow: 30,
    normalHigh: 50,
    warningLow: 25,
    warningHigh: 55,
    criticalLow: 20,
    criticalHigh: 65,
  },
];

/**
 * Get vital range by type
 */
export function getVitalRange(type: VitalType): VitalRangeDefinition | undefined {
  return VITAL_RANGES.find((vr) => vr.type === type);
}

/**
 * Get display name for vital type
 */
export function getVitalName(type: VitalType): string {
  return getVitalRange(type)?.name ?? type.toUpperCase();
}

/**
 * Get unit for vital type
 */
export function getVitalUnit(type: VitalType): string {
  return getVitalRange(type)?.unit ?? "";
}

/**
 * Get severity level for a vital value
 */
export function getVitalSeverity(
  type: VitalType,
  value: number
): "normal" | "warning" | "critical" {
  const range = getVitalRange(type);
  if (!range) return "normal";

  // Check critical first
  if (range.criticalLow !== undefined && value <= range.criticalLow) {
    return "critical";
  }
  if (range.criticalHigh !== undefined && value >= range.criticalHigh) {
    return "critical";
  }

  // Check warning
  if (range.warningLow !== undefined && value < range.warningLow) {
    return "warning";
  }
  if (range.warningHigh !== undefined && value > range.warningHigh) {
    return "warning";
  }

  // Check normal bounds
  if (value < range.normalLow || value > range.normalHigh) {
    return "warning";
  }

  return "normal";
}

/**
 * Format vital value with unit
 */
export function formatVitalValue(type: VitalType, value: number): string {
  const unit = getVitalUnit(type);
  const decimals = type === "temp" ? 1 : 0;
  return `${value.toFixed(decimals)} ${unit}`;
}
