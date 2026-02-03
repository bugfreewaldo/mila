/**
 * Neonatal Anemia Management Protocol
 *
 * Evidence-based approach to evaluating and managing anemia in neonates,
 * particularly premature infants at risk for anemia of prematurity.
 */

export const ANEMIA_PROTOCOL = {
  id: "neonatal-anemia-protocol-2024",
  title: "Neonatal Anemia Evaluation and Management Protocol",
  titleEs: "Protocolo de Evaluación y Manejo de Anemia Neonatal",
  description:
    "Systematic approach to evaluating anemia etiology and determining appropriate management including transfusion vs conservative approaches.",
  descriptionEs:
    "Enfoque sistemático para evaluar la etiología de la anemia y determinar el manejo apropiado incluyendo transfusión vs enfoques conservadores.",
  category: "hematology",
  lastUpdated: "2024-12-01",

  steps: [
    {
      step: 1,
      action: "Assess Clinical Status",
      actionEs: "Evaluar Estado Clínico",
      details:
        "Check vital signs, assess for tachycardia, tachypnea, poor feeding, lethargy, pallor. Symptomatic anemia may warrant transfusion regardless of Hgb level.",
      detailsEs:
        "Revisar signos vitales, evaluar taquicardia, taquipnea, mala alimentación, letargo, palidez. La anemia sintomática puede justificar transfusión independientemente del nivel de Hgb.",
      timing: "Immediate",
      criticalAction: true,
    },
    {
      step: 2,
      action: "Determine Anemia Etiology",
      actionEs: "Determinar Etiología de la Anemia",
      details:
        "Consider: (1) Blood loss - phlebotomy losses, hemorrhage (2) Hemolysis - ABO/Rh incompatibility, G6PD, spherocytosis (3) Decreased production - anemia of prematurity, infection",
      detailsEs:
        "Considerar: (1) Pérdida de sangre - pérdidas por flebotomía, hemorragia (2) Hemólisis - incompatibilidad ABO/Rh, G6PD, esferocitosis (3) Producción disminuida - anemia de la prematuridad, infección",
      timing: "First 30 minutes",
    },
    {
      step: 3,
      action: "Order Appropriate Labs",
      actionEs: "Ordenar Laboratorios Apropiados",
      details:
        "CBC with differential and reticulocyte count. If hemolysis suspected: LDH, haptoglobin, indirect bilirubin, DAT/Coombs. Calculate blood loss from phlebotomy records.",
      detailsEs:
        "BHC con diferencial y conteo de reticulocitos. Si se sospecha hemólisis: LDH, haptoglobina, bilirrubina indirecta, PAD/Coombs. Calcular pérdida de sangre de registros de flebotomía.",
      timing: "Within 1 hour",
    },
    {
      step: 4,
      action: "Calculate Phlebotomy Losses",
      actionEs: "Calcular Pérdidas por Flebotomía",
      details:
        "Total blood volume = 80-100 mL/kg. Track cumulative phlebotomy. >10% blood volume loss is significant. Consider iatrogenic anemia if losses > expected RBC production.",
      detailsEs:
        "Volumen sanguíneo total = 80-100 mL/kg. Rastrear flebotomía acumulada. Pérdida >10% del volumen sanguíneo es significativa. Considerar anemia iatrogénica si las pérdidas > producción esperada de GR.",
      timing: "Concurrent with evaluation",
    },
    {
      step: 5,
      action: "Apply Transfusion Thresholds",
      actionEs: "Aplicar Umbrales de Transfusión",
      details:
        "Use ETTNO/TOP restrictive thresholds: <10 g/dL if on significant respiratory support, <8 g/dL if on moderate support, <7 g/dL if stable. Symptomatic anemia may override thresholds.",
      detailsEs:
        "Usar umbrales restrictivos ETTNO/TOP: <10 g/dL si está en soporte respiratorio significativo, <8 g/dL si está en soporte moderado, <7 g/dL si está estable. La anemia sintomática puede anular los umbrales.",
      timing: "Decision point",
      criticalAction: true,
    },
    {
      step: 6,
      action: "Consider Erythropoietin (EPO)",
      actionEs: "Considerar Eritropoyetina (EPO)",
      details:
        "For ELBW/VLBW infants: EPO 400 U/kg SC 3x weekly may reduce transfusion needs. Must supplement with iron (3-6 mg/kg/day). Monitor reticulocyte response.",
      detailsEs:
        "Para lactantes EBPN/MBPN: EPO 400 U/kg SC 3x por semana puede reducir necesidades de transfusión. Debe suplementar con hierro (3-6 mg/kg/día). Monitorear respuesta de reticulocitos.",
      timing: "If transfusion threshold not met",
    },
    {
      step: 7,
      action: "Implement Blood Conservation",
      actionEs: "Implementar Conservación de Sangre",
      details:
        "Minimize lab draws, use microsampling, cluster care, point-of-care testing when available. Document all phlebotomy volumes.",
      detailsEs:
        "Minimizar extracciones de laboratorio, usar micromuestra, agrupar cuidados, pruebas a pie de cama cuando estén disponibles. Documentar todos los volúmenes de flebotomía.",
      timing: "Ongoing",
    },
    {
      step: 8,
      action: "If Transfusion Indicated",
      actionEs: "Si Está Indicada la Transfusión",
      details:
        "Order irradiated, leukoreduced, CMV-safe PRBCs. Dose: 10-15 mL/kg. Rate: 2-5 mL/kg/hour. Monitor for transfusion reactions. Check post-transfusion Hgb at 2-4 hours.",
      detailsEs:
        "Ordenar CGR irradiados, leucorreducidos, CMV-seguros. Dosis: 10-15 mL/kg. Velocidad: 2-5 mL/kg/hora. Monitorear reacciones a la transfusión. Revisar Hgb post-transfusión a las 2-4 horas.",
      timing: "Per transfusion guidelines",
      criticalAction: true,
    },
    {
      step: 9,
      action: "Address Underlying Cause",
      actionEs: "Abordar Causa Subyacente",
      details:
        "Treat hemolysis if present. Manage sepsis if contributing. For anemia of prematurity, optimize nutrition, consider EPO. Ensure adequate iron stores.",
      detailsEs:
        "Tratar hemólisis si está presente. Manejar sepsis si contribuye. Para anemia de la prematuridad, optimizar nutrición, considerar EPO. Asegurar reservas adecuadas de hierro.",
      timing: "Ongoing",
    },
    {
      step: 10,
      action: "Monitor Response and Follow-up",
      actionEs: "Monitorear Respuesta y Seguimiento",
      details:
        "Recheck Hgb in 24-48 hours if stable. Weekly CBC for premature infants. Adjust EPO/iron as needed. Document transfusion exposure for future reference.",
      detailsEs:
        "Revisar Hgb en 24-48 horas si está estable. BHC semanal para lactantes prematuros. Ajustar EPO/hierro según necesidad. Documentar exposición a transfusiones para referencia futura.",
      timing: "Ongoing surveillance",
    },
  ],

  references: [
    "ETTNO Trial - Kirpalani H et al. NEJM 2020",
    "TOP Trial - Franz AR et al. NEJM 2020",
    "AAP Guidelines on RBC Transfusions in Neonates",
    "Cochrane Review: Late vs Early Erythropoietin for Preventing Red Blood Cell Transfusion",
  ],

  // Quick reference decision support
  decisionSupport: {
    symptomsOfAnemia: [
      "Tachycardia (HR > 160 persistent)",
      "Tachypnea or increased work of breathing",
      "Poor feeding or feeding intolerance",
      "Lethargy or decreased activity",
      "Pallor",
      "Poor weight gain despite adequate calories",
      "Increased oxygen requirements",
      "Metabolic acidosis",
    ],
    symptomsOfAnemiaEs: [
      "Taquicardia (FC > 160 persistente)",
      "Taquipnea o aumento del trabajo respiratorio",
      "Mala alimentación o intolerancia alimentaria",
      "Letargo o actividad disminuida",
      "Palidez",
      "Pobre ganancia de peso a pesar de calorías adecuadas",
      "Aumento de requerimientos de oxígeno",
      "Acidosis metabólica",
    ],

    hemolysisWorkup: {
      labs: ["DAT (Direct Coombs)", "LDH", "Haptoglobin", "Indirect bilirubin", "Reticulocyte count", "Peripheral smear"],
      labsEs: ["PAD (Coombs Directo)", "LDH", "Haptoglobina", "Bilirrubina indirecta", "Conteo de reticulocitos", "Frotis periférico"],
      findings: {
        hemolysis: "LDH elevated, haptoglobin low/absent, reticulocytes elevated, spherocytes on smear",
        hemolysisEs: "LDH elevado, haptoglobina baja/ausente, reticulocitos elevados, esferocitos en frotis",
      },
    },

    ironSupplementation: {
      dose: "2-4 mg/kg/day elemental iron",
      doseEs: "2-4 mg/kg/día de hierro elemental",
      timing: "Start when on full enteral feeds (~120 mL/kg/day)",
      timingEs: "Iniciar cuando esté en alimentación enteral completa (~120 mL/kg/día)",
      duration: "Continue through first year of life",
      durationEs: "Continuar durante el primer año de vida",
    },

    epoTherapy: {
      dose: "400 U/kg subcutaneous 3x weekly",
      doseEs: "400 U/kg subcutáneo 3x por semana",
      indication: "ELBW/VLBW infants to reduce transfusion exposure",
      indicationEs: "Lactantes EBPN/MBPN para reducir exposición a transfusiones",
      monitoring: "Weekly reticulocyte count, Hgb",
      monitoringEs: "Conteo semanal de reticulocitos, Hgb",
      notes: "Must supplement with iron 3-6 mg/kg/day. Efficacy debated - discuss with attending.",
      notesEs: "Debe suplementar con hierro 3-6 mg/kg/día. Eficacia debatida - discutir con médico tratante.",
    },
  },
};

/**
 * Determine if patient is symptomatic from anemia
 */
export function assessAnemiaSymptoms(
  heartRate: number,
  respiratoryRate: number,
  oxygenRequirement: boolean,
  poorFeeding: boolean,
  lethargy: boolean
): { symptomatic: boolean; symptoms: string[] } {
  const symptoms: string[] = [];

  if (heartRate > 160) symptoms.push("Tachycardia");
  if (respiratoryRate > 60) symptoms.push("Tachypnea");
  if (oxygenRequirement) symptoms.push("Increased oxygen requirement");
  if (poorFeeding) symptoms.push("Poor feeding");
  if (lethargy) symptoms.push("Lethargy");

  return {
    symptomatic: symptoms.length >= 2,
    symptoms,
  };
}

/**
 * Calculate estimated blood volume and phlebotomy impact
 */
export function calculateBloodVolume(weightKg: number, cumulativePhlebotomyMl: number): {
  totalBloodVolume: number;
  phlebotomyPercentage: number;
  significantLoss: boolean;
  recommendation: string;
} {
  const bloodVolumePerKg = 85; // mL/kg for neonates
  const totalBloodVolume = weightKg * bloodVolumePerKg;
  const phlebotomyPercentage = (cumulativePhlebotomyMl / totalBloodVolume) * 100;

  return {
    totalBloodVolume,
    phlebotomyPercentage,
    significantLoss: phlebotomyPercentage > 10,
    recommendation:
      phlebotomyPercentage > 25
        ? "Critical: Blood losses exceed 25% - transfusion likely needed"
        : phlebotomyPercentage > 10
          ? "Significant: Blood losses exceed 10% - minimize further draws"
          : "Acceptable: Continue to minimize unnecessary lab draws",
  };
}
