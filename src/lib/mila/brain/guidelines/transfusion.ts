/**
 * Evidence-Based Transfusion Guidelines for Neonates
 *
 * Sources:
 * - ETTNO Trial (Effects of Transfusion Thresholds on Neurocognitive Outcome)
 * - TOP Trial (Transfusion of Prematures)
 * - PlaNeT-2 Trial (Platelet Transfusion in Neonates)
 * - AABB Guidelines 2024
 */

export interface TransfusionThreshold {
  product: "rbc" | "platelet" | "plasma";
  condition: string;
  conditionEs: string;
  threshold: number;
  unit: string;
  action: string;
  actionEs: string;
  evidenceLevel: "A" | "B" | "C";
  source: string;
}

export const TRANSFUSION_GUIDELINES = {
  id: "neonatal-transfusion-guidelines-2024",
  title: "Neonatal Transfusion Guidelines",
  titleEs: "Guías de Transfusión Neonatal",
  sources: [
    "ETTNO Trial (NEJM 2020)",
    "TOP Trial (NEJM 2020)",
    "PlaNeT-2 Trial (NEJM 2019)",
    "AABB Guidelines 2024",
    "AAP Guidelines",
  ],
  lastUpdated: "2024-12-01",

  keyPoints: [
    "Restrictive transfusion thresholds are safe and reduce transfusion exposure",
    "ETTNO/TOP trials showed no difference in neurodevelopmental outcomes at 2 years with restrictive vs liberal thresholds",
    "PlaNeT-2 showed higher threshold (50,000) for platelet transfusion increases mortality and bleeding vs 25,000",
    "Each transfusion carries risks: infection, TRALI, volume overload, immunomodulation",
    "Consider patient's clinical status, not just hemoglobin number",
    "Minimize phlebotomy losses to reduce transfusion needs",
  ],
  keyPointsEs: [
    "Los umbrales restrictivos de transfusión son seguros y reducen la exposición a transfusiones",
    "Los ensayos ETTNO/TOP no mostraron diferencia en resultados del neurodesarrollo a 2 años con umbrales restrictivos vs liberales",
    "PlaNeT-2 mostró que un umbral más alto (50,000) para transfusión de plaquetas aumenta la mortalidad y el sangrado vs 25,000",
    "Cada transfusión conlleva riesgos: infección, TRALI, sobrecarga de volumen, inmunomodulación",
    "Considerar el estado clínico del paciente, no solo el número de hemoglobina",
    "Minimizar las pérdidas por flebotomía para reducir las necesidades de transfusión",
  ],

  thresholds: {
    // RBC Transfusion Thresholds based on respiratory support
    rbc_critical_respiratory: {
      description: "RBC threshold for infants on significant respiratory support",
      descriptionEs: "Umbral de GR para lactantes con soporte respiratorio significativo",
      value: 10,
      unit: "g/dL",
      condition: "On mechanical ventilation or FiO2 ≥0.35",
      action: "Consider transfusion if Hgb <10 g/dL with symptoms",
      actionEs: "Considerar transfusión si Hgb <10 g/dL con síntomas",
    },
    rbc_moderate_respiratory: {
      description: "RBC threshold for infants on moderate respiratory support",
      descriptionEs: "Umbral de GR para lactantes con soporte respiratorio moderado",
      value: 8,
      unit: "g/dL",
      condition: "On CPAP or low-flow nasal cannula",
      action: "Consider transfusion if Hgb <8 g/dL with symptoms",
      actionEs: "Considerar transfusión si Hgb <8 g/dL con síntomas",
    },
    rbc_stable: {
      description: "RBC threshold for stable growing preterm infants",
      descriptionEs: "Umbral de GR para lactantes prematuros estables en crecimiento",
      value: 7,
      unit: "g/dL",
      condition: "Room air, stable, growing",
      action: "Consider transfusion only if Hgb <7 g/dL with symptoms of anemia",
      actionEs: "Considerar transfusión solo si Hgb <7 g/dL con síntomas de anemia",
    },

    // Platelet Transfusion Thresholds (PlaNeT-2)
    platelet_non_bleeding: {
      description: "Platelet threshold for non-bleeding neonates",
      descriptionEs: "Umbral de plaquetas para neonatos sin sangrado",
      value: 25000,
      unit: "/μL",
      condition: "No active bleeding, no planned invasive procedure",
      action: "Transfuse only if platelets <25,000/μL",
      actionEs: "Transfundir solo si plaquetas <25,000/μL",
    },
    platelet_minor_bleeding: {
      description: "Platelet threshold for minor bleeding or procedures",
      descriptionEs: "Umbral de plaquetas para sangrado menor o procedimientos",
      value: 50000,
      unit: "/μL",
      condition: "Minor bleeding or lumbar puncture planned",
      action: "Consider transfusion if platelets <50,000/μL",
      actionEs: "Considerar transfusión si plaquetas <50,000/μL",
    },
    platelet_major_bleeding: {
      description: "Platelet threshold for major bleeding or surgery",
      descriptionEs: "Umbral de plaquetas para sangrado mayor o cirugía",
      value: 100000,
      unit: "/μL",
      condition: "Major bleeding, DIC, or major surgery",
      action: "Maintain platelets >100,000/μL during active management",
      actionEs: "Mantener plaquetas >100,000/μL durante el manejo activo",
    },

    // FFP Transfusion Thresholds
    ffp_coagulopathy: {
      description: "FFP threshold for coagulopathy",
      descriptionEs: "Umbral de PFC para coagulopatía",
      value: 1.5,
      unit: "INR",
      condition: "Bleeding with INR >1.5 or PT >18 seconds",
      action: "Transfuse FFP 10-15 mL/kg",
      actionEs: "Transfundir PFC 10-15 mL/kg",
    },
  },

  // Dosing recommendations
  dosing: {
    rbc: {
      volume: "10-15 mL/kg",
      volumeEs: "10-15 mL/kg",
      rate: "2-5 mL/kg/hour",
      rateEs: "2-5 mL/kg/hora",
      maxTime: "4 hours",
      maxTimeEs: "4 horas",
      expectedRise: "Increases Hgb by ~2-3 g/dL per 10 mL/kg",
      expectedRiseEs: "Aumenta Hgb ~2-3 g/dL por 10 mL/kg",
    },
    platelet: {
      volume: "10-15 mL/kg",
      volumeEs: "10-15 mL/kg",
      rate: "10-20 mL/kg/hour",
      rateEs: "10-20 mL/kg/hora",
      maxTime: "4 hours",
      maxTimeEs: "4 horas",
      expectedRise: "Increases platelets by ~50,000-100,000/μL",
      expectedRiseEs: "Aumenta plaquetas ~50,000-100,000/μL",
    },
    ffp: {
      volume: "10-15 mL/kg",
      volumeEs: "10-15 mL/kg",
      rate: "1-2 mL/kg/hour",
      rateEs: "1-2 mL/kg/hora",
      maxTime: "4 hours",
      maxTimeEs: "4 horas",
      expectedEffect: "Should correct coagulopathy within 2-4 hours",
      expectedEffectEs: "Debe corregir coagulopatía en 2-4 horas",
    },
  },

  // Blood conservation strategies
  bloodConservation: [
    {
      strategy: "Minimize phlebotomy",
      strategyEs: "Minimizar flebotomía",
      details: "Use minimum blood volumes, microsampling techniques",
      detailsEs: "Usar volúmenes mínimos de sangre, técnicas de micromuestra",
    },
    {
      strategy: "Delayed cord clamping",
      strategyEs: "Pinzamiento tardío del cordón",
      details: "30-60 seconds delay increases blood volume by 10-15 mL/kg",
      detailsEs: "Retraso de 30-60 segundos aumenta volumen sanguíneo en 10-15 mL/kg",
    },
    {
      strategy: "EPO therapy",
      strategyEs: "Terapia con EPO",
      details: "Consider for ELBW infants: 400 U/kg SC 3x weekly with iron supplementation",
      detailsEs: "Considerar para lactantes EBPN: 400 U/kg SC 3x por semana con suplementación de hierro",
    },
    {
      strategy: "Iron supplementation",
      strategyEs: "Suplementación de hierro",
      details: "2-4 mg/kg/day elemental iron once on full feeds",
      detailsEs: "2-4 mg/kg/día de hierro elemental una vez en alimentación completa",
    },
  ],

  // Risks to communicate
  risks: [
    {
      risk: "Infection",
      riskEs: "Infección",
      incidence: "Rare with modern screening",
      incidenceEs: "Raro con pruebas modernas",
    },
    {
      risk: "TRALI (Transfusion-Related Acute Lung Injury)",
      riskEs: "TRALI (Lesión Pulmonar Aguda Relacionada con Transfusión)",
      incidence: "1:5000-10000 transfusions",
      incidenceEs: "1:5000-10000 transfusiones",
    },
    {
      risk: "Volume overload",
      riskEs: "Sobrecarga de volumen",
      incidence: "Risk higher in cardiac patients",
      incidenceEs: "Riesgo mayor en pacientes cardíacos",
    },
    {
      risk: "Alloimmunization",
      riskEs: "Aloinmunización",
      incidence: "Increases with multiple exposures",
      incidenceEs: "Aumenta con múltiples exposiciones",
    },
    {
      risk: "NEC association",
      riskEs: "Asociación con NEC",
      incidence: "Controversial - no clear causal link established",
      incidenceEs: "Controvertido - no se ha establecido un vínculo causal claro",
    },
  ],
};

/**
 * Get transfusion recommendation based on clinical parameters
 */
export function getTransfusionRecommendation(
  product: "rbc" | "platelet" | "ffp",
  labValue: number,
  respiratorySupport: string,
  isBleeding: boolean,
  language: "en" | "es" = "en"
): {
  shouldTransfuse: boolean;
  justification: string;
  threshold: number;
  evidenceSource: string;
} {
  const isEs = language === "es";

  if (product === "rbc") {
    // Determine threshold based on respiratory status
    let threshold = 7;
    let justification = "";

    if (respiratorySupport === "mechanical_ventilation" || respiratorySupport.includes("high")) {
      threshold = 10;
      justification = isEs
        ? "Paciente con soporte respiratorio significativo - umbral 10 g/dL"
        : "Patient on significant respiratory support - threshold 10 g/dL";
    } else if (respiratorySupport === "cpap" || respiratorySupport.includes("low_flow")) {
      threshold = 8;
      justification = isEs
        ? "Paciente con soporte respiratorio moderado - umbral 8 g/dL"
        : "Patient on moderate respiratory support - threshold 8 g/dL";
    } else {
      threshold = 7;
      justification = isEs
        ? "Paciente estable - umbral restrictivo 7 g/dL (ETTNO/TOP)"
        : "Stable patient - restrictive threshold 7 g/dL (ETTNO/TOP)";
    }

    return {
      shouldTransfuse: labValue < threshold,
      justification: labValue < threshold
        ? `${isEs ? "Hgb" : "Hgb"} ${labValue} < ${threshold} g/dL. ${justification}`
        : `${isEs ? "Hgb" : "Hgb"} ${labValue} >= ${threshold} g/dL. ${isEs ? "No cumple criterios de transfusión" : "Does not meet transfusion criteria"}.`,
      threshold,
      evidenceSource: "ETTNO/TOP Trials (NEJM 2020)",
    };
  }

  if (product === "platelet") {
    let threshold = 25000;
    if (isBleeding) {
      threshold = 50000;
    }

    return {
      shouldTransfuse: labValue < threshold,
      justification: labValue < threshold
        ? `${isEs ? "Plaquetas" : "Platelets"} ${labValue} < ${threshold}/μL. ${isEs ? "Considerar transfusión" : "Consider transfusion"}.`
        : `${isEs ? "Plaquetas" : "Platelets"} ${labValue} >= ${threshold}/μL. ${isEs ? "Por encima del umbral PlaNeT-2" : "Above PlaNeT-2 threshold"}.`,
      threshold,
      evidenceSource: "PlaNeT-2 Trial (NEJM 2019)",
    };
  }

  // FFP
  return {
    shouldTransfuse: labValue > 1.5 && isBleeding,
    justification:
      labValue > 1.5 && isBleeding
        ? `INR ${labValue} > 1.5 ${isEs ? "con sangrado" : "with bleeding"}. ${isEs ? "Considerar PFC" : "Consider FFP"}.`
        : `${isEs ? "No cumple criterios de transfusión de PFC" : "Does not meet FFP transfusion criteria"}.`,
    threshold: 1.5,
    evidenceSource: "AABB Guidelines",
  };
}
