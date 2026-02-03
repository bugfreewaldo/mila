/**
 * Neonatal Sepsis Evaluation and Management Protocol
 *
 * Based on AAP Guidelines, NICE Guidelines, and Kaiser EOS Calculator approach
 */

export const SEPSIS_PROTOCOL = {
  id: "neonatal-sepsis-protocol-2024",
  title: "Neonatal Sepsis Evaluation and Management Protocol",
  titleEs: "Protocolo de Evaluación y Manejo de Sepsis Neonatal",
  description:
    "Evidence-based approach to early-onset and late-onset sepsis evaluation and empiric treatment in neonates.",
  descriptionEs:
    "Enfoque basado en evidencia para la evaluación y tratamiento empírico de sepsis de inicio temprano y tardío en neonatos.",
  category: "infectious_disease",
  lastUpdated: "2024-12-01",

  steps: [
    {
      step: 1,
      action: "Recognize Risk Factors and Clinical Signs",
      actionEs: "Reconocer Factores de Riesgo y Signos Clínicos",
      details:
        "EOS risk factors: Maternal GBS colonization, chorioamnionitis, prolonged rupture of membranes (>18h), maternal fever, preterm delivery. Clinical signs: Temperature instability, respiratory distress, lethargy, poor feeding, apnea, tachycardia, hypotension.",
      detailsEs:
        "Factores de riesgo EOS: Colonización materna por GBS, corioamnionitis, ruptura prolongada de membranas (>18h), fiebre materna, parto prematuro. Signos clínicos: Inestabilidad térmica, dificultad respiratoria, letargo, mala alimentación, apnea, taquicardia, hipotensión.",
      timing: "Continuous assessment",
      criticalAction: true,
    },
    {
      step: 2,
      action: "Distinguish EOS vs LOS",
      actionEs: "Distinguir EOS vs LOS",
      details:
        "Early-onset sepsis (EOS): <72 hours of life, vertical transmission, GBS/E.coli most common. Late-onset sepsis (LOS): >72 hours, horizontal transmission, CoNS/S.aureus/gram-negatives common.",
      detailsEs:
        "Sepsis de inicio temprano (EOS): <72 horas de vida, transmisión vertical, GBS/E.coli más comunes. Sepsis de inicio tardío (LOS): >72 horas, transmisión horizontal, CoNS/S.aureus/gram-negativos comunes.",
      timing: "First assessment",
    },
    {
      step: 3,
      action: "Order Diagnostic Workup",
      actionEs: "Ordenar Estudio Diagnóstico",
      details:
        "Blood culture (0.5-1 mL minimum). CBC with differential (I:T ratio). CRP (consider serial at 0, 24, 48h). Procalcitonin if available. LP if clinically indicated (LOS, abnormal neuro exam, positive blood culture). Urine culture for LOS.",
      detailsEs:
        "Hemocultivo (0.5-1 mL mínimo). BHC con diferencial (relación I:T). PCR (considerar seriada a 0, 24, 48h). Procalcitonina si disponible. PL si clínicamente indicada (LOS, examen neurológico anormal, hemocultivo positivo). Urocultivo para LOS.",
      timing: "Within 30 minutes of suspicion",
      criticalAction: true,
    },
    {
      step: 4,
      action: "Initiate Empiric Antibiotics",
      actionEs: "Iniciar Antibióticos Empíricos",
      details:
        "EOS: Ampicillin + Gentamicin. LOS: Vancomycin + Gentamicin (or per unit antibiogram). Consider Cefotaxime if meningitis suspected. Dose per weight and gestational age.",
      detailsEs:
        "EOS: Ampicilina + Gentamicina. LOS: Vancomicina + Gentamicina (o según antibiograma de la unidad). Considerar Cefotaxima si se sospecha meningitis. Dosis según peso y edad gestacional.",
      timing: "Within 1 hour of suspicion",
      criticalAction: true,
    },
    {
      step: 5,
      action: "Supportive Care",
      actionEs: "Cuidados de Soporte",
      details:
        "Respiratory support as needed. Volume resuscitation (10-20 mL/kg NS if hypotensive). NPO and IV fluids. Temperature regulation. Frequent vital sign monitoring.",
      detailsEs:
        "Soporte respiratorio según necesidad. Reanimación con volumen (10-20 mL/kg SSN si hipotenso). NPO y líquidos IV. Regulación de temperatura. Monitoreo frecuente de signos vitales.",
      timing: "Concurrent with antibiotics",
    },
    {
      step: 6,
      action: "Review Culture Results at 36-48 Hours",
      actionEs: "Revisar Resultados de Cultivos a las 36-48 Horas",
      details:
        "If blood culture negative at 36-48h AND clinical improvement AND low risk: consider discontinuing antibiotics. If culture positive: narrow antibiotics per sensitivities, extend course.",
      detailsEs:
        "Si hemocultivo negativo a las 36-48h Y mejoría clínica Y bajo riesgo: considerar suspender antibióticos. Si cultivo positivo: estrechar antibióticos según sensibilidades, extender curso.",
      timing: "36-48 hours after cultures",
      criticalAction: true,
    },
    {
      step: 7,
      action: "Determine Antibiotic Duration",
      actionEs: "Determinar Duración de Antibióticos",
      details:
        "Culture-negative sepsis: 48-72 hours if improving. Bacteremia: 7-10 days. Meningitis: 14-21 days (depends on organism). Osteomyelitis: 4-6 weeks.",
      detailsEs:
        "Sepsis con cultivo negativo: 48-72 horas si mejora. Bacteriemia: 7-10 días. Meningitis: 14-21 días (depende del organismo). Osteomielitis: 4-6 semanas.",
      timing: "Based on culture results",
    },
    {
      step: 8,
      action: "Monitor for Complications",
      actionEs: "Monitorear Complicaciones",
      details:
        "Watch for: DIC, multi-organ failure, NEC, IVH worsening. Consider echocardiogram if persistent hypotension. Repeat LP if clinical concern for meningitis treatment failure.",
      detailsEs:
        "Vigilar: CID, falla multiorgánica, empeoramiento de NEC, HIV. Considerar ecocardiograma si hipotensión persistente. Repetir PL si preocupación clínica por falla del tratamiento de meningitis.",
      timing: "Ongoing surveillance",
    },
  ],

  references: [
    "AAP Clinical Report: Management of Neonates Born at ≥35 Weeks Gestation with Suspected or Proven EOS (2018)",
    "NICE Guidelines: Neonatal Infection: Antibiotics for Prevention and Treatment (2021)",
    "Kaiser EOS Calculator - https://neonatalsepsiscalculator.kaiserpermanente.org",
    "Cochrane Review: Antibiotic Regimens for Suspected EOS",
  ],

  // Antibiotic dosing quick reference
  antibioticDosing: {
    ampicillin: {
      indication: "EOS empiric coverage, GBS, Listeria",
      indicationEs: "Cobertura empírica EOS, GBS, Listeria",
      dose: {
        term: "50 mg/kg/dose q8h (q6h if meningitis)",
        termEs: "50 mg/kg/dosis c/8h (c/6h si meningitis)",
        preterm: "50 mg/kg/dose q12h (<=7 days), then q8h",
        pretermEs: "50 mg/kg/dosis c/12h (<=7 días), luego c/8h",
      },
      meningitisDose: "100 mg/kg/dose q6h",
      meningitisDoseEs: "100 mg/kg/dosis c/6h",
    },
    gentamicin: {
      indication: "Gram-negative coverage, synergy with ampicillin",
      indicationEs: "Cobertura gram-negativa, sinergia con ampicilina",
      dose: {
        term: "4-5 mg/kg/dose q24h",
        termEs: "4-5 mg/kg/dosis c/24h",
        preterm: "4-5 mg/kg/dose q24-48h (based on GA/PNA)",
        pretermEs: "4-5 mg/kg/dosis c/24-48h (según EG/EPN)",
      },
      monitoring: "Trough before 3rd dose (goal <1 mcg/mL)",
      monitoringEs: "Valle antes de 3ra dosis (meta <1 mcg/mL)",
    },
    vancomycin: {
      indication: "LOS empiric, MRSA, CoNS",
      indicationEs: "Empírico LOS, SARM, CoNS",
      dose: {
        term: "15 mg/kg/dose q8-12h",
        termEs: "15 mg/kg/dosis c/8-12h",
        preterm: "15 mg/kg/dose q12-18h (based on GA/PNA)",
        pretermEs: "15 mg/kg/dosis c/12-18h (según EG/EPN)",
      },
      monitoring: "Trough before 4th dose (goal 10-15 mcg/mL for bacteremia, 15-20 for meningitis)",
      monitoringEs: "Valle antes de 4ta dosis (meta 10-15 mcg/mL para bacteriemia, 15-20 para meningitis)",
    },
    cefotaxime: {
      indication: "Meningitis coverage, gram-negative CSF penetration",
      indicationEs: "Cobertura de meningitis, penetración CSF gram-negativa",
      dose: {
        term: "50 mg/kg/dose q8h (q6h if meningitis)",
        termEs: "50 mg/kg/dosis c/8h (c/6h si meningitis)",
        preterm: "50 mg/kg/dose q12h, then q8h after day 7",
        pretermEs: "50 mg/kg/dosis c/12h, luego c/8h después del día 7",
      },
    },
  },

  // Inflammatory markers interpretation
  markers: {
    crp: {
      normal: "<1 mg/dL",
      normalEs: "<1 mg/dL",
      interpretation: "Rises 6-12h after infection onset. Serial values (0, 24, 48h) most useful. Single negative doesn't rule out infection.",
      interpretationEs: "Se eleva 6-12h después del inicio de la infección. Valores seriados (0, 24, 48h) más útiles. Un solo valor negativo no descarta infección.",
      serialNegative: "Two negative CRPs 24h apart has high negative predictive value",
      serialNegativeEs: "Dos PCR negativos con 24h de diferencia tienen alto valor predictivo negativo",
    },
    procalcitonin: {
      normal: "<0.5 ng/mL after 24h of life",
      normalEs: "<0.5 ng/mL después de 24h de vida",
      interpretation: "Physiologic rise in first 24h (up to 2 ng/mL). More specific than CRP for bacterial infection.",
      interpretationEs: "Elevación fisiológica en las primeras 24h (hasta 2 ng/mL). Más específico que PCR para infección bacteriana.",
    },
    itRatio: {
      normal: "<0.2",
      normalEs: "<0.2",
      interpretation: "Immature to Total neutrophil ratio. >0.2 suggests infection. Limited specificity.",
      interpretationEs: "Relación de neutrófilos inmaduros a totales. >0.2 sugiere infección. Especificidad limitada.",
    },
    wbc: {
      low: "<5000/μL concerning for sepsis",
      lowEs: "<5000/μL preocupante para sepsis",
      high: ">30000/μL in term infant concerning",
      highEs: ">30000/μL en recién nacido a término preocupante",
      note: "Normal ranges vary significantly by gestational and postnatal age",
      noteEs: "Los rangos normales varían significativamente según la edad gestacional y postnatal",
    },
  },

  // LP indications
  lpIndications: [
    "Positive blood culture",
    "Strong clinical suspicion of meningitis",
    "Abnormal neurologic examination",
    "Late-onset sepsis evaluation",
    "Consideration of extended antibiotic course",
  ],
  lpIndicationsEs: [
    "Hemocultivo positivo",
    "Fuerte sospecha clínica de meningitis",
    "Examen neurológico anormal",
    "Evaluación de sepsis de inicio tardío",
    "Consideración de curso extendido de antibióticos",
  ],
};

/**
 * Calculate sepsis risk using simplified Kaiser-like approach
 */
export function assessSepsisRisk(
  gestationalAge: number,
  maternalGbs: boolean,
  chorioamnionitis: boolean,
  prolongedRom: boolean,
  maternalFever: boolean,
  clinicalSigns: string[]
): {
  riskLevel: "low" | "moderate" | "high";
  recommendation: string;
  recommendationEs: string;
} {
  let riskScore = 0;

  // Risk factors
  if (gestationalAge < 37) riskScore += 1;
  if (maternalGbs) riskScore += 1;
  if (chorioamnionitis) riskScore += 3;
  if (prolongedRom) riskScore += 1;
  if (maternalFever) riskScore += 2;
  if (clinicalSigns.length > 0) riskScore += clinicalSigns.length;

  if (riskScore >= 5 || clinicalSigns.length >= 2) {
    return {
      riskLevel: "high",
      recommendation:
        "High risk - Blood culture, CBC, CRP, start empiric antibiotics immediately. Consider LP.",
      recommendationEs:
        "Alto riesgo - Hemocultivo, BHC, PCR, iniciar antibióticos empíricos inmediatamente. Considerar PL.",
    };
  } else if (riskScore >= 2) {
    return {
      riskLevel: "moderate",
      recommendation:
        "Moderate risk - Blood culture, CBC, CRP. Enhanced observation. Start antibiotics if clinical deterioration.",
      recommendationEs:
        "Riesgo moderado - Hemocultivo, BHC, PCR. Observación mejorada. Iniciar antibióticos si deterioro clínico.",
    };
  } else {
    return {
      riskLevel: "low",
      recommendation:
        "Low risk - Serial clinical observation for 24-48 hours. Labs only if clinical concerns develop.",
      recommendationEs:
        "Bajo riesgo - Observación clínica seriada por 24-48 horas. Laboratorios solo si surgen preocupaciones clínicas.",
    };
  }
}
