/**
 * Transfusion Analysis Service
 *
 * Analyzes transfusion patterns to detect:
 * 1. Excessive transfusions (above average for gestational age)
 * 2. Hemolysis indicators (rising direct bilirubin after transfusions)
 * 3. Suggests investigating root cause instead of more transfusions
 *
 * Evidence-based thresholds from:
 * - ETTNO Trial (restrictive transfusion thresholds)
 * - TOP Trial (transfusion of prematures)
 * - PMC studies on transfusion exposure in VLBW infants
 */

import type { Transfusion, LabValue, Patient } from "../types";

export interface TransfusionAnalysis {
  // Transfusion counts
  totalRbcTransfusions: number;
  totalPlateletTransfusions: number;
  totalPlasmaTransfusions: number;
  totalUniqueDonors: number;

  // Thresholds based on gestational age
  expectedRbcTransfusions: { low: number; average: number; high: number };
  isAboveAverageTransfusions: boolean;
  transfusionExcessSeverity: "normal" | "elevated" | "high" | "very_high";

  // Hemolysis detection
  hemolysisRisk: "low" | "moderate" | "high";
  hemolysisIndicators: string[];

  // Clinical recommendations
  recommendations: {
    en: string[];
    es: string[];
  };

  // Root cause investigation needed
  investigateRootCause: boolean;
  possibleCauses: {
    en: string[];
    es: string[];
  };
}

/**
 * Expected transfusion counts based on gestational age and birth weight
 * Data from: PMC studies on VLBW infant transfusion exposure
 *
 * Average RBC transfusions during NICU stay:
 * - 28-32 weeks: 2-4 transfusions
 * - 26-28 weeks: 3-6 transfusions
 * - <26 weeks (ELBW): 5-10 transfusions
 *
 * Warning thresholds:
 * - >3 transfusions in 32+ week infant = investigate
 * - >5 transfusions in 28-32 week infant = investigate
 * - >8 transfusions in <28 week infant = investigate
 */
function getExpectedTransfusions(gestationalAgeWeeks: number, birthWeightGrams: number): { low: number; average: number; high: number } {
  // ELBW (<1000g) or extremely preterm (<26 weeks)
  if (birthWeightGrams < 1000 || gestationalAgeWeeks < 26) {
    return { low: 3, average: 6, high: 10 };
  }

  // VLBW (1000-1500g) or very preterm (26-28 weeks)
  if (birthWeightGrams < 1500 || gestationalAgeWeeks < 28) {
    return { low: 2, average: 4, high: 7 };
  }

  // Moderately preterm (28-32 weeks)
  if (gestationalAgeWeeks < 32) {
    return { low: 1, average: 2, high: 4 };
  }

  // Late preterm (32-37 weeks)
  if (gestationalAgeWeeks < 37) {
    return { low: 0, average: 1, high: 2 };
  }

  // Term
  return { low: 0, average: 0, high: 1 };
}

/**
 * Detect hemolysis from lab trends
 *
 * Hemolysis indicators:
 * 1. Direct bilirubin > 20% of total (cholestatic pattern)
 * 2. Direct bilirubin rising after transfusions
 * 3. LDH elevated (>600 U/L) or rising
 * 4. Haptoglobin low (<30 mg/dL) or falling
 * 5. Reticulocyte count elevated (>7%)
 *
 * If 2+ indicators present after recent transfusion = high risk
 */
function analyzeHemolysis(
  labs: LabValue[],
  transfusions: Transfusion[]
): { risk: "low" | "moderate" | "high"; indicators: string[] } {
  const indicators: string[] = [];

  // Get recent labs (last 7 days)
  const recentDate = new Date();
  recentDate.setDate(recentDate.getDate() - 7);
  const recentLabs = labs.filter((l) => new Date(l.occurredAt) >= recentDate);

  // Check for recent transfusion (last 7 days)
  const recentTransfusion = transfusions.some(
    (t) => new Date(t.occurredAt) >= recentDate && t.type === "rbc"
  );

  // Get latest values
  const getLatest = (labTypeId: string) =>
    recentLabs.filter((l) => l.labTypeId === labTypeId).sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())[0];

  // Get trend (compare latest to previous)
  const getTrend = (labTypeId: string): "rising" | "falling" | "stable" => {
    const values = recentLabs
      .filter((l) => l.labTypeId === labTypeId)
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
    if (values.length < 2) return "stable";
    const diff = values[0].value - values[1].value;
    const percentChange = Math.abs(diff / values[1].value) * 100;
    if (percentChange < 10) return "stable";
    return diff > 0 ? "rising" : "falling";
  };

  // 1. Check direct/total bilirubin ratio
  const tbili = getLatest("tbili");
  const dbili = getLatest("dbili");
  if (tbili && dbili && tbili.value > 0) {
    const ratio = (dbili.value / tbili.value) * 100;
    if (ratio > 20) {
      indicators.push(`Direct bili ${ratio.toFixed(0)}% of total (>20% is concerning)`);
    }
  }

  // 2. Check if direct bilirubin is rising after transfusion
  if (recentTransfusion && getTrend("dbili") === "rising") {
    indicators.push("Direct bilirubin rising after recent transfusion");
  }

  // 3. Check LDH
  const ldh = getLatest("ldh");
  if (ldh) {
    if (ldh.value > 1000) {
      indicators.push(`LDH very elevated: ${ldh.value} U/L (>1000)`);
    } else if (ldh.value > 600) {
      indicators.push(`LDH elevated: ${ldh.value} U/L (>600)`);
    }
  }
  if (getTrend("ldh") === "rising") {
    indicators.push("LDH trending up");
  }

  // 4. Check haptoglobin
  const hapto = getLatest("hapto");
  if (hapto) {
    if (hapto.value < 10) {
      indicators.push(`Haptoglobin critically low: ${hapto.value} mg/dL (<10)`);
    } else if (hapto.value < 30) {
      indicators.push(`Haptoglobin low: ${hapto.value} mg/dL (<30)`);
    }
  }
  if (getTrend("hapto") === "falling") {
    indicators.push("Haptoglobin trending down");
  }

  // 5. Check reticulocyte count
  const retic = getLatest("retic");
  if (retic && retic.value > 7) {
    indicators.push(`Reticulocyte count elevated: ${retic.value}% (>7%)`);
  }

  // Determine risk level
  let risk: "low" | "moderate" | "high" = "low";

  if (indicators.length >= 3 || (recentTransfusion && indicators.length >= 2)) {
    risk = "high";
  } else if (indicators.length >= 2 || (recentTransfusion && indicators.length >= 1)) {
    risk = "moderate";
  }

  return { risk, indicators };
}

/**
 * Analyze transfusion patterns and detect issues
 */
export async function analyzeTransfusions(
  patient: Patient,
  transfusions: Transfusion[],
  labs: LabValue[]
): Promise<TransfusionAnalysis> {
  // Count transfusions by type
  const rbcTransfusions = transfusions.filter((t) => t.type === "rbc");
  const plateletTransfusions = transfusions.filter((t) => t.type === "platelet");
  const plasmaTransfusions = transfusions.filter((t) => t.type === "plasma");

  // Count unique donors
  const uniqueDonors = new Set(transfusions.map((t) => t.donorId)).size;

  // Get expected thresholds
  const expected = getExpectedTransfusions(patient.gestationalAgeWeeks, patient.birthWeightGrams);

  // Determine if above average
  const rbcCount = rbcTransfusions.length;
  let transfusionExcessSeverity: TransfusionAnalysis["transfusionExcessSeverity"] = "normal";
  let isAboveAverageTransfusions = false;

  if (rbcCount > expected.high) {
    transfusionExcessSeverity = "very_high";
    isAboveAverageTransfusions = true;
  } else if (rbcCount > expected.average) {
    transfusionExcessSeverity = "high";
    isAboveAverageTransfusions = true;
  } else if (rbcCount > expected.low) {
    transfusionExcessSeverity = "elevated";
  }

  // Analyze hemolysis
  const hemolysis = analyzeHemolysis(labs, transfusions);

  // Generate recommendations
  const recommendations: { en: string[]; es: string[] } = { en: [], es: [] };
  const possibleCauses: { en: string[]; es: string[] } = { en: [], es: [] };
  let investigateRootCause = false;

  // If above average transfusions, recommend investigation
  if (isAboveAverageTransfusions) {
    investigateRootCause = true;

    recommendations.en.push(
      `Patient has received ${rbcCount} RBC transfusions (expected average: ${expected.average} for ${patient.gestationalAgeWeeks}-week infant). ` +
      `INVESTIGATE ROOT CAUSE before ordering more transfusions.`
    );
    recommendations.es.push(
      `El paciente ha recibido ${rbcCount} transfusiones de GR (promedio esperado: ${expected.average} para un bebé de ${patient.gestationalAgeWeeks} semanas). ` +
      `INVESTIGAR CAUSA RAÍZ antes de ordenar más transfusiones.`
    );

    // Possible causes to investigate
    possibleCauses.en.push(
      "Excessive phlebotomy losses - review lab ordering practices",
      "Hemolysis - check LDH, haptoglobin, DAT",
      "Occult bleeding - check stools for occult blood",
      "Inadequate erythropoiesis - consider EPO therapy",
      "Nutritional deficiency - ensure iron, folate, B12 supplementation"
    );
    possibleCauses.es.push(
      "Pérdidas excesivas por flebotomía - revisar prácticas de órdenes de laboratorio",
      "Hemólisis - verificar LDH, haptoglobina, PAD",
      "Sangrado oculto - verificar sangre oculta en heces",
      "Eritropoyesis inadecuada - considerar terapia con EPO",
      "Deficiencia nutricional - asegurar suplementación de hierro, folato, B12"
    );
  }

  // If hemolysis detected
  if (hemolysis.risk === "high") {
    investigateRootCause = true;

    recommendations.en.push(
      `⚠️ HIGH HEMOLYSIS RISK DETECTED. Consider STOPPING transfusions until workup complete. ` +
      `Order: DAT, antibody screen, peripheral smear, bilirubin fractionation.`
    );
    recommendations.es.push(
      `⚠️ ALTO RIESGO DE HEMÓLISIS DETECTADO. Considere DETENER transfusiones hasta completar estudio. ` +
      `Ordenar: PAD, panel de anticuerpos, frotis periférico, fraccionamiento de bilirrubina.`
    );

    // Add hemolysis-specific causes
    if (!possibleCauses.en.includes("Delayed hemolytic transfusion reaction")) {
      possibleCauses.en.push(
        "Delayed hemolytic transfusion reaction",
        "Alloimmunization to RBC antigens",
        "ABO incompatibility",
        "Underlying hemolytic disease"
      );
      possibleCauses.es.push(
        "Reacción transfusional hemolítica tardía",
        "Aloinmunización a antígenos eritrocitarios",
        "Incompatibilidad ABO",
        "Enfermedad hemolítica subyacente"
      );
    }
  } else if (hemolysis.risk === "moderate") {
    recommendations.en.push(
      `Moderate hemolysis indicators present. Monitor closely. Consider hemolysis workup before next transfusion.`
    );
    recommendations.es.push(
      `Indicadores moderados de hemólisis presentes. Monitorear de cerca. Considerar estudio de hemólisis antes de próxima transfusión.`
    );
  }

  // Check direct bilirubin specifically
  const recentLabs = labs.filter((l) => {
    const labDate = new Date(l.occurredAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return labDate >= weekAgo;
  });

  const latestDbili = recentLabs
    .filter((l) => l.labTypeId === "dbili")
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())[0];

  const latestTbili = recentLabs
    .filter((l) => l.labTypeId === "tbili")
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())[0];

  if (latestDbili && latestTbili && latestDbili.value > 0 && latestTbili.value > 0) {
    const directRatio = (latestDbili.value / latestTbili.value) * 100;

    // Check if direct bili > 1.0 mg/dL or >20% of total
    if (latestDbili.value > 1.0 || directRatio > 20) {
      recommendations.en.push(
        `Direct bilirubin elevated (${latestDbili.value.toFixed(1)} mg/dL, ${directRatio.toFixed(0)}% of total). ` +
        `If rising after transfusions, STOP transfusions and investigate hemolysis/cholestasis.`
      );
      recommendations.es.push(
        `Bilirrubina directa elevada (${latestDbili.value.toFixed(1)} mg/dL, ${directRatio.toFixed(0)}% del total). ` +
        `Si aumenta después de transfusiones, DETENER transfusiones e investigar hemólisis/colestasis.`
      );
    }
  }

  // General recommendations if no issues
  if (recommendations.en.length === 0) {
    recommendations.en.push(
      `Transfusion count (${rbcCount} RBC) is within expected range for ${patient.gestationalAgeWeeks}-week infant. Continue monitoring.`
    );
    recommendations.es.push(
      `Conteo de transfusiones (${rbcCount} GR) está dentro del rango esperado para bebé de ${patient.gestationalAgeWeeks} semanas. Continuar monitoreo.`
    );
  }

  return {
    totalRbcTransfusions: rbcCount,
    totalPlateletTransfusions: plateletTransfusions.length,
    totalPlasmaTransfusions: plasmaTransfusions.length,
    totalUniqueDonors: uniqueDonors,
    expectedRbcTransfusions: expected,
    isAboveAverageTransfusions,
    transfusionExcessSeverity,
    hemolysisRisk: hemolysis.risk,
    hemolysisIndicators: hemolysis.indicators,
    recommendations,
    investigateRootCause,
    possibleCauses,
  };
}
