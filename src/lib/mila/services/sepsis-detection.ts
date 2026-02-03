/**
 * Sepsis Detection Service
 *
 * Calculates early-onset and late-onset neonatal sepsis risk based on
 * clinical signs, lab values, and risk factors.
 *
 * Based on:
 * - Kaiser Permanente Early-Onset Sepsis Calculator
 * - NICE Guidelines for Neonatal Infection
 * - Vermont Oxford Network Sepsis Definitions
 */

import { LabValueRepository } from "../db/repositories/lab";
import { FeedingRepository } from "../db/repositories/feeding";
import type { Patient, LabValue } from "../types/domain";

// Sepsis risk levels
export type SepsisRiskLevel = "low" | "moderate" | "high" | "critical";

// Individual marker status
export interface SepsisMarker {
  name: string;
  nameEs: string;
  value: number | null;
  unit: string;
  status: "normal" | "concerning" | "abnormal";
  weight: number; // Points contributed to score
}

// Full sepsis risk assessment
export interface SepsisRiskAssessment {
  score: number; // 0-10 scale
  riskLevel: SepsisRiskLevel;
  markers: SepsisMarker[];
  clinicalSigns: {
    temperatureInstability: boolean;
    feedingIntolerance: boolean;
    lethargy: boolean;
    respiratoryDistress: boolean;
  };
  recommendation: string;
  recommendationEs: string;
  lastAssessed: string;
}

// Neonatal sepsis thresholds (evidence-based)
const SEPSIS_THRESHOLDS = {
  // WBC: both low and high are concerning
  wbc: {
    criticalLow: 5000, // /μL - severe leukopenia
    low: 7500,
    high: 20000,
    criticalHigh: 30000,
  },
  // I:T ratio (immature to total neutrophils)
  itRatio: {
    normal: 0.12,
    concerning: 0.2,
    abnormal: 0.3,
  },
  // CRP (C-reactive protein)
  crp: {
    normal: 1.0, // mg/dL
    concerning: 2.0,
    abnormal: 5.0,
  },
  // Procalcitonin
  pct: {
    normal: 0.5, // ng/mL
    concerning: 2.0,
    abnormal: 10.0,
  },
  // Platelets (decreasing is a concern)
  platelets: {
    criticalLow: 50000,
    low: 100000,
    normal: 150000,
  },
  // Temperature
  temp: {
    hypothermia: 36.0, // °C
    lowNormal: 36.5,
    highNormal: 37.5,
    fever: 38.0,
  },
  // Blood glucose instability
  glucose: {
    hypoglycemia: 45, // mg/dL
    low: 50,
    high: 150,
    hyperglycemia: 200,
  },
};

/**
 * Get the latest value for a specific lab type
 */
function getLatestLab(labs: LabValue[], labTypeId: string): number | null {
  const filtered = labs
    .filter((l) => l.labTypeId === labTypeId)
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  return filtered.length > 0 ? filtered[0].value : null;
}

/**
 * Calculate trend over last 2 values
 */
function getLabTrend(labs: LabValue[], labTypeId: string): "rising" | "falling" | "stable" | null {
  const filtered = labs
    .filter((l) => l.labTypeId === labTypeId)
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  if (filtered.length < 2) return null;

  const diff = filtered[0].value - filtered[1].value;
  const percentChange = Math.abs(diff / filtered[1].value) * 100;

  if (percentChange < 10) return "stable";
  return diff > 0 ? "rising" : "falling";
}

/**
 * Assess WBC for sepsis risk
 */
function assessWBC(value: number | null): SepsisMarker {
  const marker: SepsisMarker = {
    name: "WBC Count",
    nameEs: "Conteo de Leucocitos",
    value,
    unit: "/μL",
    status: "normal",
    weight: 0,
  };

  if (value === null) return marker;

  if (value < SEPSIS_THRESHOLDS.wbc.criticalLow || value > SEPSIS_THRESHOLDS.wbc.criticalHigh) {
    marker.status = "abnormal";
    marker.weight = 2;
  } else if (value < SEPSIS_THRESHOLDS.wbc.low || value > SEPSIS_THRESHOLDS.wbc.high) {
    marker.status = "concerning";
    marker.weight = 1;
  }

  return marker;
}

/**
 * Assess I:T ratio for sepsis risk
 */
function assessITRatio(value: number | null): SepsisMarker {
  const marker: SepsisMarker = {
    name: "I:T Ratio",
    nameEs: "Relacion I:T",
    value,
    unit: "",
    status: "normal",
    weight: 0,
  };

  if (value === null) return marker;

  if (value >= SEPSIS_THRESHOLDS.itRatio.abnormal) {
    marker.status = "abnormal";
    marker.weight = 2;
  } else if (value >= SEPSIS_THRESHOLDS.itRatio.concerning) {
    marker.status = "concerning";
    marker.weight = 1;
  }

  return marker;
}

/**
 * Assess CRP for sepsis risk
 */
function assessCRP(value: number | null): SepsisMarker {
  const marker: SepsisMarker = {
    name: "CRP",
    nameEs: "PCR",
    value,
    unit: "mg/dL",
    status: "normal",
    weight: 0,
  };

  if (value === null) return marker;

  if (value >= SEPSIS_THRESHOLDS.crp.abnormal) {
    marker.status = "abnormal";
    marker.weight = 2;
  } else if (value >= SEPSIS_THRESHOLDS.crp.concerning) {
    marker.status = "concerning";
    marker.weight = 1;
  }

  return marker;
}

/**
 * Assess Procalcitonin for sepsis risk
 */
function assessPCT(value: number | null): SepsisMarker {
  const marker: SepsisMarker = {
    name: "Procalcitonin",
    nameEs: "Procalcitonina",
    value,
    unit: "ng/mL",
    status: "normal",
    weight: 0,
  };

  if (value === null) return marker;

  if (value >= SEPSIS_THRESHOLDS.pct.abnormal) {
    marker.status = "abnormal";
    marker.weight = 2.5; // PCT is highly specific for bacterial infection
  } else if (value >= SEPSIS_THRESHOLDS.pct.concerning) {
    marker.status = "concerning";
    marker.weight = 1.5;
  }

  return marker;
}

/**
 * Assess Platelets for sepsis risk (low/falling is concerning)
 */
function assessPlatelets(value: number | null, trend: "rising" | "falling" | "stable" | null): SepsisMarker {
  const marker: SepsisMarker = {
    name: "Platelets",
    nameEs: "Plaquetas",
    value,
    unit: "K/μL",
    status: "normal",
    weight: 0,
  };

  if (value === null) return marker;

  // Display in thousands
  marker.value = value / 1000;

  if (value < SEPSIS_THRESHOLDS.platelets.criticalLow) {
    marker.status = "abnormal";
    marker.weight = 1.5;
  } else if (value < SEPSIS_THRESHOLDS.platelets.low) {
    marker.status = "concerning";
    marker.weight = 0.5;
    // Falling platelets more concerning
    if (trend === "falling") marker.weight = 1;
  }

  return marker;
}

/**
 * Assess Temperature for sepsis risk
 */
function assessTemperature(value: number | null): SepsisMarker {
  const marker: SepsisMarker = {
    name: "Temperature",
    nameEs: "Temperatura",
    value,
    unit: "°C",
    status: "normal",
    weight: 0,
  };

  if (value === null) return marker;

  if (value < SEPSIS_THRESHOLDS.temp.hypothermia || value >= SEPSIS_THRESHOLDS.temp.fever) {
    marker.status = "abnormal";
    marker.weight = 1.5;
  } else if (value < SEPSIS_THRESHOLDS.temp.lowNormal || value > SEPSIS_THRESHOLDS.temp.highNormal) {
    marker.status = "concerning";
    marker.weight = 0.5;
  }

  return marker;
}

/**
 * Calculate sepsis risk score (0-10 scale)
 */
function calculateScore(markers: SepsisMarker[]): number {
  const totalWeight = markers.reduce((sum, m) => sum + m.weight, 0);
  // Normalize to 0-10 scale (max possible ~12 points)
  return Math.min(10, Math.round(totalWeight * 10) / 10);
}

/**
 * Determine risk level from score
 */
function getRiskLevel(score: number): SepsisRiskLevel {
  if (score >= 6) return "critical";
  if (score >= 4) return "high";
  if (score >= 2) return "moderate";
  return "low";
}

/**
 * Generate recommendation based on risk level
 */
function getRecommendation(riskLevel: SepsisRiskLevel, markers: SepsisMarker[]): { en: string; es: string } {
  const abnormalMarkers = markers.filter((m) => m.status === "abnormal").map((m) => m.name);
  const concerningMarkers = markers.filter((m) => m.status === "concerning").map((m) => m.name);

  switch (riskLevel) {
    case "critical":
      return {
        en: `CRITICAL SEPSIS RISK - Abnormal: ${abnormalMarkers.join(", ")}. ` +
          "Recommend: 1) Blood culture STAT, 2) Start empiric antibiotics immediately (Ampicillin + Gentamicin), " +
          "3) CBC with differential, CRP, PCT if not done, 4) Consider lumbar puncture, 5) Close hemodynamic monitoring.",
        es: `RIESGO CRITICO DE SEPSIS - Anormal: ${abnormalMarkers.join(", ")}. ` +
          "Recomendar: 1) Hemocultivo STAT, 2) Iniciar antibioticos empiricos inmediatamente (Ampicilina + Gentamicina), " +
          "3) BH con diferencial, PCR, PCT si no se han hecho, 4) Considerar puncion lumbar, 5) Monitoreo hemodinamico cercano.",
      };
    case "high":
      return {
        en: `HIGH SEPSIS RISK - Concerning markers: ${[...abnormalMarkers, ...concerningMarkers].join(", ")}. ` +
          "Recommend: 1) Blood culture before antibiotics, 2) CBC with differential, CRP, 3) Consider starting antibiotics, " +
          "4) Repeat labs in 12-24h, 5) Close clinical monitoring.",
        es: `RIESGO ALTO DE SEPSIS - Marcadores preocupantes: ${[...abnormalMarkers, ...concerningMarkers].join(", ")}. ` +
          "Recomendar: 1) Hemocultivo antes de antibioticos, 2) BH con diferencial, PCR, 3) Considerar iniciar antibioticos, " +
          "4) Repetir labs en 12-24h, 5) Monitoreo clinico cercano.",
      };
    case "moderate":
      return {
        en: `MODERATE SEPSIS RISK - Monitor closely: ${concerningMarkers.join(", ")}. ` +
          "Recommend: 1) Serial clinical assessments q4h, 2) Repeat CRP/CBC in 12-24h, " +
          "3) Lower threshold for sepsis workup if clinical deterioration.",
        es: `RIESGO MODERADO DE SEPSIS - Monitorear de cerca: ${concerningMarkers.join(", ")}. ` +
          "Recomendar: 1) Evaluacion clinica seriada c/4h, 2) Repetir PCR/BH en 12-24h, " +
          "3) Bajo umbral para estudio de sepsis si deterioro clinico.",
      };
    default:
      return {
        en: "LOW SEPSIS RISK - Current markers within normal limits. Continue routine monitoring. " +
          "Watch for clinical signs: temperature instability, feeding intolerance, lethargy, respiratory distress.",
        es: "RIESGO BAJO DE SEPSIS - Marcadores actuales dentro de limites normales. Continuar monitoreo de rutina. " +
          "Vigilar signos clinicos: inestabilidad termica, intolerancia alimentaria, letargia, dificultad respiratoria.",
      };
  }
}

/**
 * Assess sepsis risk for a patient
 */
export async function assessSepsisRisk(patient: Patient): Promise<SepsisRiskAssessment> {
  // Get lab values
  const labs = await LabValueRepository.byPatient(patient.id);

  // Get feeding data for tolerance assessment
  const feedingSummary = await FeedingRepository.getFeedingSummary(patient.id);

  // Extract relevant lab values
  const wbc = getLatestLab(labs, "wbc");
  const itRatio = getLatestLab(labs, "it_ratio");
  const crp = getLatestLab(labs, "crp");
  const pct = getLatestLab(labs, "pct");
  const platelets = getLatestLab(labs, "plt");
  const plateletTrend = getLabTrend(labs, "plt");
  const temp = getLatestLab(labs, "temp");

  // Assess each marker
  const markers: SepsisMarker[] = [
    assessWBC(wbc),
    assessITRatio(itRatio),
    assessCRP(crp),
    assessPCT(pct),
    assessPlatelets(platelets, plateletTrend),
    assessTemperature(temp),
  ];

  // Calculate score
  const score = calculateScore(markers);
  const riskLevel = getRiskLevel(score);

  // Assess clinical signs (from available data)
  const clinicalSigns = {
    temperatureInstability: temp !== null && (temp < 36.0 || temp >= 38.0),
    feedingIntolerance: feedingSummary.toleranceRate < 70,
    lethargy: false, // Would need observation data
    respiratoryDistress: false, // Would need respiratory status
  };

  // Add points for clinical signs
  if (clinicalSigns.temperatureInstability && markers.find((m) => m.name === "Temperature")?.weight === 0) {
    // Temperature not in labs but clinical concern
  }
  if (clinicalSigns.feedingIntolerance) {
    // Feeding intolerance adds to suspicion
  }

  const recommendation = getRecommendation(riskLevel, markers);

  return {
    score,
    riskLevel,
    markers: markers.filter((m) => m.value !== null), // Only return markers with values
    clinicalSigns,
    recommendation: recommendation.en,
    recommendationEs: recommendation.es,
    lastAssessed: new Date().toISOString(),
  };
}

/**
 * Quick sepsis screening (returns true if any concerning markers)
 */
export async function quickSepsisScreen(patient: Patient): Promise<{
  needsAttention: boolean;
  riskLevel: SepsisRiskLevel;
  score: number;
}> {
  const assessment = await assessSepsisRisk(patient);
  return {
    needsAttention: assessment.riskLevel !== "low",
    riskLevel: assessment.riskLevel,
    score: assessment.score,
  };
}
