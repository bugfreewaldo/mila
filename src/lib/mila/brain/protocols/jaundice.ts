/**
 * Neonatal Jaundice/Hyperbilirubinemia Management Protocol
 *
 * Based on AAP Guidelines (2004, 2022 update) and NICE Guidelines
 */

export const JAUNDICE_PROTOCOL = {
  id: "neonatal-jaundice-protocol-2024",
  title: "Neonatal Hyperbilirubinemia Management Protocol",
  titleEs: "Protocolo de Manejo de Hiperbilirrubinemia Neonatal",
  description:
    "Evidence-based approach to evaluating and treating neonatal jaundice, including phototherapy thresholds and exchange transfusion criteria.",
  descriptionEs:
    "Enfoque basado en evidencia para evaluar y tratar la ictericia neonatal, incluyendo umbrales de fototerapia y criterios de exanguinotransfusión.",
  category: "hematology",
  lastUpdated: "2024-12-01",

  steps: [
    {
      step: 1,
      action: "Visual Assessment and Risk Stratification",
      actionEs: "Evaluación Visual y Estratificación de Riesgo",
      details:
        "Assess jaundice progression (cephalocaudal). Identify risk factors: <38 weeks GA, exclusive breastfeeding with weight loss, ABO/Rh incompatibility, prior sibling with phototherapy, Asian ethnicity, cephalohematoma/bruising.",
      detailsEs:
        "Evaluar progresión de ictericia (cefalocaudal). Identificar factores de riesgo: <38 semanas EG, lactancia materna exclusiva con pérdida de peso, incompatibilidad ABO/Rh, hermano previo con fototerapia, etnia asiática, cefalohematoma/moretones.",
      timing: "All newborns before discharge",
      criticalAction: true,
    },
    {
      step: 2,
      action: "Measure Bilirubin Level",
      actionEs: "Medir Nivel de Bilirrubina",
      details:
        "Use transcutaneous bilirubinometer (TcB) for screening. Confirm with serum total bilirubin (TSB) if TcB near phototherapy threshold or >15 mg/dL. Plot on hour-specific nomogram (Bhutani curve).",
      detailsEs:
        "Usar bilirrubinómetro transcutáneo (BTC) para tamizaje. Confirmar con bilirrubina sérica total (BST) si BTC cerca del umbral de fototerapia o >15 mg/dL. Graficar en nomograma específico por hora (curva de Bhutani).",
      timing: "All jaundiced infants",
    },
    {
      step: 3,
      action: "Determine Phototherapy Threshold",
      actionEs: "Determinar Umbral de Fototerapia",
      details:
        "Use AAP phototherapy nomogram based on: (1) gestational age, (2) postnatal age in hours, (3) risk factors. Lower threshold for infants with risk factors. Preterm infants have significantly lower thresholds.",
      detailsEs:
        "Usar nomograma de fototerapia AAP basado en: (1) edad gestacional, (2) edad postnatal en horas, (3) factores de riesgo. Umbral más bajo para lactantes con factores de riesgo. Prematuros tienen umbrales significativamente más bajos.",
      timing: "Decision point",
      criticalAction: true,
    },
    {
      step: 4,
      action: "Evaluate for Hemolysis",
      actionEs: "Evaluar Hemólisis",
      details:
        "If TSB rising rapidly (>0.2 mg/dL/hour) or early jaundice (<24h): Check blood type/DAT, CBC with smear, reticulocyte count. G6PD screen if indicated by ethnicity/history. Consider isoimmune hemolysis (ABO, Rh, minor antigens).",
      detailsEs:
        "Si BST aumenta rápidamente (>0.2 mg/dL/hora) o ictericia temprana (<24h): Revisar tipo de sangre/PAD, BHC con frotis, conteo de reticulocitos. Tamizaje G6PD si indicado por etnia/historia. Considerar hemólisis isoinmune (ABO, Rh, antígenos menores).",
      timing: "If bilirubin rising rapidly",
    },
    {
      step: 5,
      action: "Initiate Phototherapy if Indicated",
      actionEs: "Iniciar Fototerapia si Está Indicada",
      details:
        "Use intensive phototherapy: Irradiance ≥30 μW/cm²/nm. Maximize skin exposure (diaper only). Blue LED lights preferred. Continue breastfeeding. Check bilirubin q4-6h initially, then q8-12h once stable/declining.",
      detailsEs:
        "Usar fototerapia intensiva: Irradiancia ≥30 μW/cm²/nm. Maximizar exposición de piel (solo pañal). Luces LED azules preferidas. Continuar lactancia materna. Revisar bilirrubina c/4-6h inicialmente, luego c/8-12h una vez estable/descendiendo.",
      timing: "When TSB at or above phototherapy threshold",
    },
    {
      step: 6,
      action: "Monitor Response to Phototherapy",
      actionEs: "Monitorear Respuesta a Fototerapia",
      details:
        "Expect 30-40% decrease in first 24h with intensive phototherapy. If TSB not declining as expected, check: light intensity/coverage, hydration status, ongoing hemolysis. Consider double/triple phototherapy if poor response.",
      detailsEs:
        "Esperar disminución del 30-40% en las primeras 24h con fototerapia intensiva. Si BST no disminuye como se esperaba, revisar: intensidad/cobertura de luz, estado de hidratación, hemólisis continua. Considerar fototerapia doble/triple si mala respuesta.",
      timing: "Every 4-6 hours initially",
    },
    {
      step: 7,
      action: "Assess Exchange Transfusion Threshold",
      actionEs: "Evaluar Umbral de Exanguinotransfusión",
      details:
        "Exchange indicated if: TSB at exchange threshold per nomogram, TSB rising despite intensive phototherapy, signs of acute bilirubin encephalopathy (ABE). Exchange thresholds typically 2-3 mg/dL above phototherapy thresholds.",
      detailsEs:
        "Exanguinotransfusión indicada si: BST en umbral de exanguinotransfusión según nomograma, BST aumentando a pesar de fototerapia intensiva, signos de encefalopatía bilirrubínica aguda (EBA). Umbrales de exanguinotransfusión típicamente 2-3 mg/dL por encima de umbrales de fototerapia.",
      timing: "Critical decision",
      criticalAction: true,
    },
    {
      step: 8,
      action: "Discontinue Phototherapy",
      actionEs: "Suspender Fototerapia",
      details:
        "Stop phototherapy when TSB 2-3 mg/dL below phototherapy threshold for age/risk category. Check rebound bilirubin 12-24h after stopping. Higher rebound risk with hemolysis, preterm, early discontinuation.",
      detailsEs:
        "Suspender fototerapia cuando BST esté 2-3 mg/dL por debajo del umbral de fototerapia para edad/categoría de riesgo. Revisar bilirrubina de rebote 12-24h después de suspender. Mayor riesgo de rebote con hemólisis, prematuro, suspensión temprana.",
      timing: "When below threshold",
    },
    {
      step: 9,
      action: "Discharge Planning",
      actionEs: "Planificación del Alta",
      details:
        "Ensure follow-up bilirubin check arranged (1-2 days post-discharge for high-risk). Educate parents on jaundice signs. Breastfeeding support to ensure adequate intake. Consider IVIG if isoimmune hemolysis.",
      detailsEs:
        "Asegurar seguimiento de bilirrubina programado (1-2 días post-alta para alto riesgo). Educar a padres sobre signos de ictericia. Soporte de lactancia para asegurar ingesta adecuada. Considerar IGIV si hemólisis isoinmune.",
      timing: "Before discharge",
    },
  ],

  references: [
    "AAP Clinical Practice Guideline: Management of Hyperbilirubinemia in the Newborn ≥35 Weeks (2004, 2022 update)",
    "NICE Guidelines: Jaundice in Newborn Babies Under 28 Days (2016, updated 2021)",
    "Bhutani VK et al. Predictive Ability of a Predischarge Hour-Specific Serum Bilirubin",
  ],

  // Phototherapy thresholds for term infants (≥38 weeks)
  // Values in mg/dL at specific postnatal ages
  phototherapyThresholds: {
    term_low_risk: {
      description: "≥38 weeks, no risk factors",
      descriptionEs: "≥38 semanas, sin factores de riesgo",
      thresholds: [
        { ageHours: 24, tsbThreshold: 12 },
        { ageHours: 48, tsbThreshold: 15 },
        { ageHours: 72, tsbThreshold: 18 },
        { ageHours: 96, tsbThreshold: 20 },
      ],
    },
    term_medium_risk: {
      description: "≥38 weeks with risk factors OR 35-37 6/7 weeks without risk factors",
      descriptionEs: "≥38 semanas con factores de riesgo O 35-37 6/7 semanas sin factores de riesgo",
      thresholds: [
        { ageHours: 24, tsbThreshold: 10 },
        { ageHours: 48, tsbThreshold: 13 },
        { ageHours: 72, tsbThreshold: 15 },
        { ageHours: 96, tsbThreshold: 17 },
      ],
    },
    term_high_risk: {
      description: "35-37 6/7 weeks with risk factors",
      descriptionEs: "35-37 6/7 semanas con factores de riesgo",
      thresholds: [
        { ageHours: 24, tsbThreshold: 8 },
        { ageHours: 48, tsbThreshold: 11 },
        { ageHours: 72, tsbThreshold: 13 },
        { ageHours: 96, tsbThreshold: 14 },
      ],
    },
  },

  // Preterm thresholds (simplified - actual practice uses curves)
  pretermThresholds: {
    note: "Preterm infants have lower thresholds. Use gestational age-specific nomograms.",
    noteEs: "Los prematuros tienen umbrales más bajos. Usar nomogramas específicos por edad gestacional.",
    generalGuidance: {
      lessThan28weeks: "Phototherapy at TSB 5-6 mg/dL",
      lessThan28weeksEs: "Fototerapia con BST 5-6 mg/dL",
      weeks28to32: "Phototherapy at TSB 8-10 mg/dL",
      weeks28to32Es: "Fototerapia con BST 8-10 mg/dL",
      weeks32to35: "Phototherapy at TSB 10-12 mg/dL",
      weeks32to35Es: "Fototerapia con BST 10-12 mg/dL",
    },
  },

  // Signs of acute bilirubin encephalopathy
  encephalopathySigns: {
    early: ["Lethargy", "Hypotonia", "Poor suck"],
    earlyEs: ["Letargo", "Hipotonía", "Succión pobre"],
    intermediate: ["Irritability", "Hypertonia", "High-pitched cry", "Opisthotonus"],
    intermediateEs: ["Irritabilidad", "Hipertonía", "Llanto agudo", "Opistótonos"],
    advanced: ["Seizures", "Apnea", "Coma", "Death"],
    advancedEs: ["Convulsiones", "Apnea", "Coma", "Muerte"],
  },

  // IVIG indication
  ivig: {
    indication: "Isoimmune hemolytic disease (positive DAT) with TSB rising despite phototherapy and approaching exchange threshold",
    indicationEs: "Enfermedad hemolítica isoinmune (PAD positivo) con BST aumentando a pesar de fototerapia y acercándose al umbral de exanguinotransfusión",
    dose: "0.5-1 g/kg IV over 2 hours",
    doseEs: "0.5-1 g/kg IV en 2 horas",
    mechanism: "Blocks Fc receptors, reduces hemolysis",
    mechanismEs: "Bloquea receptores Fc, reduce hemólisis",
  },
};

/**
 * Estimate phototherapy threshold based on age and risk category
 */
export function getPhototherapyThreshold(
  gestationalAge: number,
  postnatalAgeHours: number,
  hasRiskFactors: boolean
): { threshold: number; category: string; categoryEs: string } {
  // Simplified linear interpolation for term infants
  if (gestationalAge >= 38) {
    if (!hasRiskFactors) {
      // Low risk
      const threshold = Math.min(20, 8 + postnatalAgeHours * 0.125);
      return { threshold: Math.round(threshold * 10) / 10, category: "Low risk (≥38 wk, no risk factors)", categoryEs: "Bajo riesgo (≥38 sem, sin factores de riesgo)" };
    } else {
      // Medium risk
      const threshold = Math.min(17, 6 + postnatalAgeHours * 0.115);
      return { threshold: Math.round(threshold * 10) / 10, category: "Medium risk (≥38 wk with risk factors)", categoryEs: "Riesgo medio (≥38 sem con factores de riesgo)" };
    }
  } else if (gestationalAge >= 35) {
    if (!hasRiskFactors) {
      // Medium risk
      const threshold = Math.min(17, 6 + postnatalAgeHours * 0.115);
      return { threshold: Math.round(threshold * 10) / 10, category: "Medium risk (35-37 wk, no risk factors)", categoryEs: "Riesgo medio (35-37 sem, sin factores de riesgo)" };
    } else {
      // High risk
      const threshold = Math.min(14, 5 + postnatalAgeHours * 0.09);
      return { threshold: Math.round(threshold * 10) / 10, category: "High risk (35-37 wk with risk factors)", categoryEs: "Alto riesgo (35-37 sem con factores de riesgo)" };
    }
  } else {
    // Preterm <35 weeks - very conservative
    const baseThreshold = gestationalAge < 28 ? 5 : gestationalAge < 32 ? 8 : 10;
    return { threshold: baseThreshold, category: `Preterm (${gestationalAge} wk) - consult nomogram`, categoryEs: `Prematuro (${gestationalAge} sem) - consultar nomograma` };
  }
}

/**
 * Calculate bilirubin rate of rise
 */
export function calculateBilirubinRateOfRise(
  previousTsb: number,
  currentTsb: number,
  hoursBetween: number
): { ratePerHour: number; concerning: boolean; message: string; messageEs: string } {
  const ratePerHour = (currentTsb - previousTsb) / hoursBetween;

  return {
    ratePerHour: Math.round(ratePerHour * 100) / 100,
    concerning: ratePerHour > 0.2,
    message:
      ratePerHour > 0.3
        ? "CRITICAL: Rate >0.3 mg/dL/hr suggests significant hemolysis. Consider IVIG, prepare for exchange."
        : ratePerHour > 0.2
          ? "CONCERNING: Rate >0.2 mg/dL/hr. Evaluate for hemolysis (DAT, retic, smear). Intensify phototherapy."
          : "Rate of rise acceptable. Continue monitoring.",
    messageEs:
      ratePerHour > 0.3
        ? "CRÍTICO: Tasa >0.3 mg/dL/hr sugiere hemólisis significativa. Considerar IGIV, preparar exanguinotransfusión."
        : ratePerHour > 0.2
          ? "PREOCUPANTE: Tasa >0.2 mg/dL/hr. Evaluar hemólisis (PAD, retic, frotis). Intensificar fototerapia."
          : "Tasa de aumento aceptable. Continuar monitoreo.",
  };
}
