/**
 * Transfusion Thresholds - Evidence-Based Guidelines for Premature Neonates
 *
 * Based on:
 * - ETTNO Trial (2020) - Effects of Transfusion Thresholds on Neurocognitive Outcomes
 * - TOP Trial (2020) - Transfusion of Prematures
 * - PlaNeT-2/MATISSE Trial (2019) - Platelet transfusion thresholds
 * - AAP/AABB Guidelines 2024
 * - British Committee for Standards in Haematology (BCSH) Guidelines
 *
 * Key Finding: RESTRICTIVE thresholds are SAFE and may REDUCE adverse outcomes
 * in premature neonates. The PlaNeT-2 trial showed LOWER platelet thresholds
 * (25,000) reduced mortality compared to higher thresholds (50,000).
 */

import type { TransfusionType } from "../types";

// ============================================================================
// Age-Dependent Threshold Definitions for Premature Neonates
// ============================================================================

export interface PrematureRBCThreshold {
  daysOfLife: string;
  description: string;
  descriptionEs: string;
  respiratorySupport: number; // Hgb threshold if on respiratory support
  stable: number; // Hgb threshold if stable (no respiratory support)
}

/**
 * RBC Transfusion Thresholds by Age (ETTNO/TOP Trials)
 *
 * Note: These are RESTRICTIVE thresholds which have been shown to be
 * as safe as liberal thresholds, with potentially fewer transfusions.
 */
export const PRETERM_RBC_THRESHOLDS: PrematureRBCThreshold[] = [
  {
    daysOfLife: "1-7",
    description: "First week of life",
    descriptionEs: "Primera semana de vida",
    respiratorySupport: 11.5, // Hgb g/dL if on mechanical ventilation/CPAP
    stable: 10.0, // Hgb g/dL if stable on room air
  },
  {
    daysOfLife: "8-14",
    description: "Second week of life",
    descriptionEs: "Segunda semana de vida",
    respiratorySupport: 10.0,
    stable: 8.5,
  },
  {
    daysOfLife: "15-28",
    description: "Weeks 3-4 of life",
    descriptionEs: "Semanas 3-4 de vida",
    respiratorySupport: 8.5,
    stable: 7.5,
  },
  {
    daysOfLife: ">28",
    description: "After 4 weeks of life",
    descriptionEs: "Después de 4 semanas de vida",
    respiratorySupport: 7.5,
    stable: 7.0,
  },
];

// ============================================================================
// Standard Threshold Definitions
// ============================================================================

export interface TransfusionThreshold {
  type: TransfusionType;
  labTypeId: string;
  labName: string;
  unit: string;
  // Threshold below which transfusion is clearly indicated (stable patient)
  nonBleedingThreshold: number;
  // Higher threshold for active bleeding/surgery/respiratory support
  bleedingThreshold: number;
  // Warning if value is ABOVE this (transfusion may not be justified)
  warningIfAbove: number;
  // Clinical notes
  notes: string;
  notesEs: string;
}

/**
 * Transfusion Thresholds for Premature Neonates
 *
 * RBC: Based on ETTNO/TOP trials - uses restrictive thresholds
 * Platelets: Based on PlaNeT-2 trial - 25,000/μL for stable, 50,000 for sick/bleeding
 * Plasma: INR-based with clinical indication required
 */
export const TRANSFUSION_THRESHOLDS: Record<TransfusionType, TransfusionThreshold> = {
  rbc: {
    type: "rbc",
    labTypeId: "hgb",
    labName: "Hemoglobin",
    unit: "g/dL",
    // These are general thresholds - use PRETERM_RBC_THRESHOLDS for age-specific
    nonBleedingThreshold: 7.0, // Stable preterm after first week
    bleedingThreshold: 12.0, // Active bleeding/major surgery
    warningIfAbove: 8.0, // Warn if Hgb > 8 for stable preterm
    notes: "Use age-specific thresholds. Consider respiratory status. Restrictive thresholds (ETTNO/TOP) are safe.",
    notesEs: "Usar umbrales por edad. Considerar estado respiratorio. Umbrales restrictivos (ETTNO/TOP) son seguros.",
  },
  platelet: {
    type: "platelet",
    labTypeId: "plt",
    labName: "Platelet Count",
    unit: "/μL",
    // PlaNeT-2 Trial: 25,000 threshold REDUCED mortality vs 50,000
    nonBleedingThreshold: 25000, // Stable preterm - DO NOT transfuse above this!
    bleedingThreshold: 50000, // Active bleeding, NEC, sepsis, before procedure
    warningIfAbove: 25000, // PlaNeT-2: Higher thresholds INCREASE mortality
    notes: "PlaNeT-2 Trial: Threshold of 25,000 REDUCED mortality vs 50,000. Avoid prophylactic transfusions above 25,000.",
    notesEs: "Estudio PlaNeT-2: Umbral de 25,000 REDUJO mortalidad vs 50,000. Evitar transfusiones profilácticas sobre 25,000.",
  },
  plasma: {
    type: "plasma",
    labTypeId: "inr",
    labName: "INR",
    unit: "",
    nonBleedingThreshold: 2.0, // INR > 2.0 with bleeding indication
    bleedingThreshold: 1.5, // Lower threshold for active bleeding
    warningIfAbove: 0, // Special handling - warn if INR normal
    notes: "Plasma rarely indicated in neonates. Requires active bleeding + coagulopathy. Do NOT use prophylactically.",
    notesEs: "Plasma raramente indicado en neonatos. Requiere sangrado activo + coagulopatía. NO usar profilácticamente.",
  },
  other: {
    type: "other",
    labTypeId: "",
    labName: "",
    unit: "",
    nonBleedingThreshold: 0,
    bleedingThreshold: 0,
    warningIfAbove: 0,
    notes: "",
    notesEs: "",
  },
};

// ============================================================================
// Specific Clinical Indications (Beyond Lab Values)
// ============================================================================

export interface ClinicalIndication {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  suggestedThreshold: string;
}

export const RBC_CLINICAL_INDICATIONS: ClinicalIndication[] = [
  {
    id: "acute_blood_loss",
    name: "Acute blood loss >10% blood volume",
    nameEs: "Pérdida aguda >10% volumen sanguíneo",
    description: "Immediate transfusion regardless of Hgb",
    descriptionEs: "Transfusión inmediata independiente de Hgb",
    suggestedThreshold: "Immediate",
  },
  {
    id: "mechanical_ventilation",
    name: "Mechanical ventilation (FiO2 >35%)",
    nameEs: "Ventilación mecánica (FiO2 >35%)",
    description: "Use respiratory support thresholds",
    descriptionEs: "Usar umbrales de soporte respiratorio",
    suggestedThreshold: "Hgb 10-11.5 g/dL based on age",
  },
  {
    id: "symptomatic_anemia",
    name: "Symptomatic anemia",
    nameEs: "Anemia sintomática",
    description: "Tachycardia, poor weight gain, apnea, increased O2 requirement",
    descriptionEs: "Taquicardia, pobre ganancia de peso, apnea, aumento requerimiento O2",
    suggestedThreshold: "Consider at Hgb 7-8 g/dL",
  },
  {
    id: "major_surgery",
    name: "Major surgery planned",
    nameEs: "Cirugía mayor planeada",
    description: "Optimize Hgb before surgery",
    descriptionEs: "Optimizar Hgb antes de cirugía",
    suggestedThreshold: "Hgb >10 g/dL",
  },
];

export const PLATELET_CLINICAL_INDICATIONS: ClinicalIndication[] = [
  {
    id: "active_bleeding",
    name: "Active major bleeding",
    nameEs: "Sangrado mayor activo",
    description: "Pulmonary hemorrhage, IVH, GI bleeding",
    descriptionEs: "Hemorragia pulmonar, HIV, sangrado GI",
    suggestedThreshold: "PLT <50,000",
  },
  {
    id: "nec_sepsis",
    name: "NEC or sepsis with DIC",
    nameEs: "NEC o sepsis con CID",
    description: "Consider higher threshold during acute illness",
    descriptionEs: "Considerar umbral más alto durante enfermedad aguda",
    suggestedThreshold: "PLT <50,000",
  },
  {
    id: "pre_procedure",
    name: "Before invasive procedure",
    nameEs: "Antes de procedimiento invasivo",
    description: "LP, central line, surgery",
    descriptionEs: "PL, línea central, cirugía",
    suggestedThreshold: "PLT <50,000",
  },
  {
    id: "stable_preterm",
    name: "Stable preterm (no bleeding)",
    nameEs: "Prematuro estable (sin sangrado)",
    description: "PlaNeT-2: DO NOT transfuse above 25,000!",
    descriptionEs: "PlaNeT-2: ¡NO transfundir sobre 25,000!",
    suggestedThreshold: "PLT <25,000 ONLY",
  },
];

// ============================================================================
// Cumulative Exposure Limits (per kg body weight)
// ============================================================================

export interface CumulativeLimit {
  type: TransfusionType;
  warningMlPerKg: number;
  criticalMlPerKg: number;
}

export const CUMULATIVE_LIMITS: Record<TransfusionType, CumulativeLimit> = {
  rbc: {
    type: "rbc",
    warningMlPerKg: 80, // 80 ml/kg cumulative (typical dose 15-20 ml/kg)
    criticalMlPerKg: 120, // Multiple transfusions - increased risk
  },
  platelet: {
    type: "platelet",
    warningMlPerKg: 30, // 30 ml/kg cumulative (typical dose 10-15 ml/kg)
    criticalMlPerKg: 50,
  },
  plasma: {
    type: "plasma",
    warningMlPerKg: 30, // 30 ml/kg cumulative (typical dose 10-15 ml/kg)
    criticalMlPerKg: 50,
  },
  other: {
    type: "other",
    warningMlPerKg: 50,
    criticalMlPerKg: 100,
  },
};

// Donor exposure thresholds
export const DONOR_EXPOSURE_LIMITS = {
  warning: 3, // 3 unique donors - consider dedicated donor
  critical: 5, // 5 unique donors - high alloimmunization risk
};

// ============================================================================
// Justification Types
// ============================================================================

export type JustificationStatus = "justified" | "needs_justification" | "not_justified";

export interface TransfusionJustification {
  status: JustificationStatus;
  severity: "ok" | "warning" | "critical";
  message: string;
  messageEs: string;
  latestLabValue?: number;
  latestLabDate?: string;
  labTypeId?: string;
  clinicalNote?: string;
  clinicalNoteEs?: string;
}

// ============================================================================
// Justification Functions
// ============================================================================

/**
 * Get age-appropriate RBC threshold for a premature neonate
 */
export function getAgeAppropriateRBCThreshold(
  daysOfLife: number,
  onRespiratorySupport: boolean
): { threshold: number; description: string; descriptionEs: string } {
  let thresholdInfo = PRETERM_RBC_THRESHOLDS[PRETERM_RBC_THRESHOLDS.length - 1]; // Default to oldest

  for (const t of PRETERM_RBC_THRESHOLDS) {
    if (t.daysOfLife.startsWith(">")) {
      const days = parseInt(t.daysOfLife.substring(1));
      if (daysOfLife > days) {
        thresholdInfo = t;
        break;
      }
    } else {
      const [start, end] = t.daysOfLife.split("-").map(Number);
      if (daysOfLife >= start && daysOfLife <= end) {
        thresholdInfo = t;
        break;
      }
    }
  }

  return {
    threshold: onRespiratorySupport ? thresholdInfo.respiratorySupport : thresholdInfo.stable,
    description: thresholdInfo.description,
    descriptionEs: thresholdInfo.descriptionEs,
  };
}

/**
 * Determines if a transfusion is justified based on latest lab values
 * Includes special handling for premature neonates
 */
export function getTransfusionJustification(
  type: TransfusionType,
  latestLabValue: number | null,
  latestLabDate: string | null,
  isEmergency: boolean,
  daysOfLife?: number,
  onRespiratorySupport?: boolean
): TransfusionJustification {
  // Emergency transfusions are always allowed
  if (isEmergency) {
    return {
      status: "justified",
      severity: "ok",
      message: "Emergency transfusion - no lab validation required",
      messageEs: "Transfusión de emergencia - no requiere validación de laboratorio",
      latestLabValue: latestLabValue ?? undefined,
      latestLabDate: latestLabDate ?? undefined,
    };
  }

  const threshold = TRANSFUSION_THRESHOLDS[type];

  // No lab type defined for this transfusion type
  if (!threshold.labTypeId) {
    return {
      status: "needs_justification",
      severity: "warning",
      message: "No standard lab criteria - document clinical justification",
      messageEs: "Sin criterios de laboratorio estándar - documentar justificación clínica",
    };
  }

  // No recent lab value available
  if (latestLabValue === null) {
    return {
      status: "needs_justification",
      severity: "warning",
      message: `No recent ${threshold.labName} available - obtain labs or document justification`,
      messageEs: `No hay ${threshold.labName} reciente - obtener laboratorios o documentar justificación`,
      labTypeId: threshold.labTypeId,
    };
  }

  // Special handling for RBC with age-specific thresholds
  if (type === "rbc" && daysOfLife !== undefined) {
    const ageThreshold = getAgeAppropriateRBCThreshold(daysOfLife, onRespiratorySupport ?? false);

    if (latestLabValue < ageThreshold.threshold) {
      return {
        status: "justified",
        severity: "ok",
        message: `Hgb ${latestLabValue.toFixed(1)} g/dL < ${ageThreshold.threshold} g/dL (${ageThreshold.description}) - transfusion indicated`,
        messageEs: `Hgb ${latestLabValue.toFixed(1)} g/dL < ${ageThreshold.threshold} g/dL (${ageThreshold.descriptionEs}) - transfusión indicada`,
        latestLabValue,
        latestLabDate: latestLabDate ?? undefined,
        labTypeId: threshold.labTypeId,
        clinicalNote: threshold.notes,
        clinicalNoteEs: threshold.notesEs,
      };
    } else if (latestLabValue < ageThreshold.threshold + 1.5) {
      return {
        status: "needs_justification",
        severity: "warning",
        message: `Hgb ${latestLabValue.toFixed(1)} g/dL - borderline for ${ageThreshold.description}. Document symptoms if transfusing.`,
        messageEs: `Hgb ${latestLabValue.toFixed(1)} g/dL - límite para ${ageThreshold.descriptionEs}. Documentar síntomas si transfunde.`,
        latestLabValue,
        latestLabDate: latestLabDate ?? undefined,
        labTypeId: threshold.labTypeId,
        clinicalNote: threshold.notes,
        clinicalNoteEs: threshold.notesEs,
      };
    } else {
      return {
        status: "not_justified",
        severity: "critical",
        message: `Hgb ${latestLabValue.toFixed(1)} g/dL > ${ageThreshold.threshold} g/dL - transfusion NOT indicated (ETTNO/TOP evidence). Strong clinical justification required.`,
        messageEs: `Hgb ${latestLabValue.toFixed(1)} g/dL > ${ageThreshold.threshold} g/dL - transfusión NO indicada (evidencia ETTNO/TOP). Justificación clínica fuerte requerida.`,
        latestLabValue,
        latestLabDate: latestLabDate ?? undefined,
        labTypeId: threshold.labTypeId,
        clinicalNote: threshold.notes,
        clinicalNoteEs: threshold.notesEs,
      };
    }
  }

  // Special handling for Platelets (PlaNeT-2 evidence)
  if (type === "platelet") {
    if (latestLabValue < 25000) {
      return {
        status: "justified",
        severity: "ok",
        message: `PLT ${latestLabValue.toLocaleString()}/μL < 25,000 - transfusion indicated per PlaNeT-2 guidelines`,
        messageEs: `PLT ${latestLabValue.toLocaleString()}/μL < 25,000 - transfusión indicada según guías PlaNeT-2`,
        latestLabValue,
        latestLabDate: latestLabDate ?? undefined,
        labTypeId: threshold.labTypeId,
        clinicalNote: threshold.notes,
        clinicalNoteEs: threshold.notesEs,
      };
    } else if (latestLabValue < 50000) {
      return {
        status: "needs_justification",
        severity: "warning",
        message: `PLT ${latestLabValue.toLocaleString()}/μL - only transfuse if active bleeding, NEC, sepsis, or pre-procedure. PlaNeT-2: Higher thresholds INCREASE mortality!`,
        messageEs: `PLT ${latestLabValue.toLocaleString()}/μL - solo transfundir si sangrado activo, NEC, sepsis, o pre-procedimiento. PlaNeT-2: ¡Umbrales más altos AUMENTAN mortalidad!`,
        latestLabValue,
        latestLabDate: latestLabDate ?? undefined,
        labTypeId: threshold.labTypeId,
        clinicalNote: threshold.notes,
        clinicalNoteEs: threshold.notesEs,
      };
    } else {
      return {
        status: "not_justified",
        severity: "critical",
        message: `PLT ${latestLabValue.toLocaleString()}/μL ≥ 50,000 - transfusion CONTRAINDICATED. PlaNeT-2 showed increased mortality with liberal transfusion.`,
        messageEs: `PLT ${latestLabValue.toLocaleString()}/μL ≥ 50,000 - transfusión CONTRAINDICADA. PlaNeT-2 mostró mayor mortalidad con transfusión liberal.`,
        latestLabValue,
        latestLabDate: latestLabDate ?? undefined,
        labTypeId: threshold.labTypeId,
        clinicalNote: threshold.notes,
        clinicalNoteEs: threshold.notesEs,
      };
    }
  }

  // Special handling for INR/Plasma (inverted logic - higher is worse)
  if (type === "plasma") {
    if (latestLabValue > threshold.nonBleedingThreshold) {
      return {
        status: "justified",
        severity: "ok",
        message: `INR ${latestLabValue.toFixed(1)} > ${threshold.nonBleedingThreshold} - plasma may be indicated WITH active bleeding`,
        messageEs: `INR ${latestLabValue.toFixed(1)} > ${threshold.nonBleedingThreshold} - plasma puede estar indicado CON sangrado activo`,
        latestLabValue,
        latestLabDate: latestLabDate ?? undefined,
        labTypeId: threshold.labTypeId,
        clinicalNote: threshold.notes,
        clinicalNoteEs: threshold.notesEs,
      };
    } else if (latestLabValue > threshold.bleedingThreshold) {
      return {
        status: "needs_justification",
        severity: "warning",
        message: `INR ${latestLabValue.toFixed(1)} - plasma rarely indicated in neonates. Requires active bleeding. Document indication.`,
        messageEs: `INR ${latestLabValue.toFixed(1)} - plasma raramente indicado en neonatos. Requiere sangrado activo. Documentar indicación.`,
        latestLabValue,
        latestLabDate: latestLabDate ?? undefined,
        labTypeId: threshold.labTypeId,
        clinicalNote: threshold.notes,
        clinicalNoteEs: threshold.notesEs,
      };
    } else {
      return {
        status: "not_justified",
        severity: "critical",
        message: `INR ${latestLabValue.toFixed(1)} ≤ ${threshold.bleedingThreshold} - plasma NOT indicated. Do not use prophylactically.`,
        messageEs: `INR ${latestLabValue.toFixed(1)} ≤ ${threshold.bleedingThreshold} - plasma NO indicado. No usar profilácticamente.`,
        latestLabValue,
        latestLabDate: latestLabDate ?? undefined,
        labTypeId: threshold.labTypeId,
        clinicalNote: threshold.notes,
        clinicalNoteEs: threshold.notesEs,
      };
    }
  }

  // Fallback for generic logic
  if (latestLabValue < threshold.nonBleedingThreshold) {
    return {
      status: "justified",
      severity: "ok",
      message: `${threshold.labName} ${formatLabValue(latestLabValue, type)} < ${formatLabValue(threshold.nonBleedingThreshold, type)} ${threshold.unit} - transfusion indicated`,
      messageEs: `${threshold.labName} ${formatLabValue(latestLabValue, type)} < ${formatLabValue(threshold.nonBleedingThreshold, type)} ${threshold.unit} - transfusión indicada`,
      latestLabValue,
      latestLabDate: latestLabDate ?? undefined,
      labTypeId: threshold.labTypeId,
    };
  } else if (latestLabValue < threshold.bleedingThreshold) {
    return {
      status: "needs_justification",
      severity: "warning",
      message: `${threshold.labName} ${formatLabValue(latestLabValue, type)} ${threshold.unit} - borderline. Document clinical indication.`,
      messageEs: `${threshold.labName} ${formatLabValue(latestLabValue, type)} ${threshold.unit} - límite. Documentar indicación clínica.`,
      latestLabValue,
      latestLabDate: latestLabDate ?? undefined,
      labTypeId: threshold.labTypeId,
    };
  } else {
    return {
      status: "not_justified",
      severity: "critical",
      message: `${threshold.labName} ${formatLabValue(latestLabValue, type)} ${threshold.unit} - transfusion NOT indicated. Document strong clinical justification if proceeding.`,
      messageEs: `${threshold.labName} ${formatLabValue(latestLabValue, type)} ${threshold.unit} - transfusión NO indicada. Documentar justificación clínica fuerte si procede.`,
      latestLabValue,
      latestLabDate: latestLabDate ?? undefined,
      labTypeId: threshold.labTypeId,
    };
  }
}

/**
 * Calculates cumulative exposure status
 */
export function getCumulativeExposureStatus(
  type: TransfusionType,
  cumulativeVolumeMl: number,
  birthWeightGrams: number
): {
  status: "ok" | "warning" | "critical";
  mlPerKg: number;
  percentOfWarning: number;
  percentOfCritical: number;
  message: string;
  messageEs: string;
} {
  const birthWeightKg = birthWeightGrams / 1000;
  const mlPerKg = cumulativeVolumeMl / birthWeightKg;
  const limits = CUMULATIVE_LIMITS[type];

  const percentOfWarning = (mlPerKg / limits.warningMlPerKg) * 100;
  const percentOfCritical = (mlPerKg / limits.criticalMlPerKg) * 100;

  if (mlPerKg >= limits.criticalMlPerKg) {
    return {
      status: "critical",
      mlPerKg,
      percentOfWarning,
      percentOfCritical,
      message: `Critical: ${mlPerKg.toFixed(1)} ml/kg cumulative (${percentOfCritical.toFixed(0)}% of critical threshold)`,
      messageEs: `Crítico: ${mlPerKg.toFixed(1)} ml/kg acumulado (${percentOfCritical.toFixed(0)}% del umbral crítico)`,
    };
  } else if (mlPerKg >= limits.warningMlPerKg) {
    return {
      status: "warning",
      mlPerKg,
      percentOfWarning,
      percentOfCritical,
      message: `Warning: ${mlPerKg.toFixed(1)} ml/kg cumulative (${percentOfWarning.toFixed(0)}% of warning threshold)`,
      messageEs: `Advertencia: ${mlPerKg.toFixed(1)} ml/kg acumulado (${percentOfWarning.toFixed(0)}% del umbral de advertencia)`,
    };
  } else {
    return {
      status: "ok",
      mlPerKg,
      percentOfWarning,
      percentOfCritical,
      message: `${mlPerKg.toFixed(1)} ml/kg cumulative (${percentOfWarning.toFixed(0)}% of warning threshold)`,
      messageEs: `${mlPerKg.toFixed(1)} ml/kg acumulado (${percentOfWarning.toFixed(0)}% del umbral de advertencia)`,
    };
  }
}

/**
 * Calculates donor exposure status
 */
export function getDonorExposureStatus(uniqueDonorCount: number): {
  status: "ok" | "warning" | "critical";
  message: string;
  messageEs: string;
} {
  if (uniqueDonorCount >= DONOR_EXPOSURE_LIMITS.critical) {
    return {
      status: "critical",
      message: `Critical: Exposed to ${uniqueDonorCount} unique donors (high alloimmunization risk - use dedicated donor)`,
      messageEs: `Crítico: Expuesto a ${uniqueDonorCount} donantes únicos (alto riesgo de aloinmunización - usar donante dedicado)`,
    };
  } else if (uniqueDonorCount >= DONOR_EXPOSURE_LIMITS.warning) {
    return {
      status: "warning",
      message: `Warning: Exposed to ${uniqueDonorCount} unique donors (consider dedicated donor program)`,
      messageEs: `Advertencia: Expuesto a ${uniqueDonorCount} donantes únicos (considerar programa de donante dedicado)`,
    };
  } else {
    return {
      status: "ok",
      message: `${uniqueDonorCount} unique donor(s)`,
      messageEs: `${uniqueDonorCount} donante(s) único(s)`,
    };
  }
}

// ============================================================================
// Transfusion Risks Information
// ============================================================================

export interface TransfusionRisk {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  incidence: string;
}

export const TRANSFUSION_RISKS: TransfusionRisk[] = [
  {
    id: "necrotizing_enterocolitis",
    name: "Transfusion-associated NEC (TANEC)",
    nameEs: "NEC asociada a transfusión (TANEC)",
    description: "Increased NEC risk within 48h of RBC transfusion in preterm infants",
    descriptionEs: "Mayor riesgo de NEC dentro de 48h de transfusión de GR en prematuros",
    incidence: "Risk increased 2-4x in some studies",
  },
  {
    id: "infection",
    name: "Transfusion-transmitted infection",
    nameEs: "Infección transmitida por transfusión",
    description: "Risk of viral, bacterial, or parasitic transmission despite screening",
    descriptionEs: "Riesgo de transmisión viral, bacteriana o parasitaria a pesar del tamizaje",
    incidence: "< 1:1,000,000 for major viruses",
  },
  {
    id: "trali",
    name: "Transfusion-related acute lung injury (TRALI)",
    nameEs: "Lesión pulmonar aguda relacionada con transfusión (TRALI)",
    description: "Acute respiratory distress within 6 hours of transfusion",
    descriptionEs: "Dificultad respiratoria aguda dentro de 6 horas de la transfusión",
    incidence: "1:5,000 to 1:10,000 transfusions",
  },
  {
    id: "taco",
    name: "Transfusion-associated circulatory overload (TACO)",
    nameEs: "Sobrecarga circulatoria asociada a transfusión (TACO)",
    description: "Volume overload causing pulmonary edema - give slowly over 3-4 hours",
    descriptionEs: "Sobrecarga de volumen causando edema pulmonar - dar lentamente en 3-4 horas",
    incidence: "1-8% of transfusions in neonates",
  },
  {
    id: "alloimmunization",
    name: "Alloimmunization",
    nameEs: "Aloinmunización",
    description: "Development of antibodies - limit donor exposures, use dedicated donors",
    descriptionEs: "Desarrollo de anticuerpos - limitar exposición a donantes, usar donantes dedicados",
    incidence: "Increases with number of transfusions and donors",
  },
  {
    id: "hemolytic",
    name: "Hemolytic transfusion reaction",
    nameEs: "Reacción hemolítica transfusional",
    description: "Destruction of transfused red cells due to incompatibility",
    descriptionEs: "Destrucción de glóbulos rojos transfundidos debido a incompatibilidad",
    incidence: "1:40,000 (acute), 1:2,500 (delayed)",
  },
  {
    id: "gvhd",
    name: "Transfusion-associated graft-vs-host disease (TA-GVHD)",
    nameEs: "Enfermedad injerto contra huésped asociada a transfusión (TA-GVHD)",
    description: "Donor lymphocytes attack recipient - ALWAYS use irradiated products in neonates",
    descriptionEs: "Linfocitos del donante atacan al receptor - SIEMPRE usar productos irradiados en neonatos",
    incidence: "Nearly eliminated with irradiation",
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

function formatLabValue(value: number, type: TransfusionType): string {
  if (type === "platelet") {
    return value.toLocaleString();
  }
  return value.toFixed(1);
}
