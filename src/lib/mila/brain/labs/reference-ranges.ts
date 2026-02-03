/**
 * Neonatal Lab Reference Ranges
 *
 * Normal values for common laboratory tests in neonates.
 * Ranges may vary by gestational age, postnatal age, and laboratory.
 */

import type { LabReferenceRange } from "../types";

export const LAB_REFERENCE_RANGES = {
  id: "neonatal-lab-ranges-2024",
  title: "Neonatal Laboratory Reference Ranges",
  titleEs: "Rangos de Referencia de Laboratorio Neonatal",
  lastUpdated: "2024-12-01",
  disclaimer:
    "Reference ranges vary by laboratory and patient factors. Always interpret in clinical context.",
  disclaimerEs:
    "Los rangos de referencia varían según el laboratorio y factores del paciente. Siempre interpretar en contexto clínico.",

  ranges: [
    // HEMATOLOGY
    {
      id: "hemoglobin",
      name: "Hemoglobin",
      shortName: "Hgb",
      category: "hematology" as const,
      unit: "g/dL",
      neonatalRange: {
        low: 14,
        high: 22,
        postnatalAgeSpecific: [
          { daysMin: 0, daysMax: 1, low: 14, high: 22 },
          { daysMin: 1, daysMax: 7, low: 13, high: 20 },
          { daysMin: 7, daysMax: 14, low: 11, high: 17 },
          { daysMin: 14, daysMax: 28, low: 10, high: 15 },
          { daysMin: 28, daysMax: 60, low: 8, high: 12 },
        ],
      },
      criticalLow: 7,
      criticalHigh: 25,
      interpretation: {
        low: "Anemia - evaluate for blood loss, hemolysis, or decreased production. Consider transfusion if symptomatic.",
        lowEs: "Anemia - evaluar pérdida de sangre, hemólisis o producción disminuida. Considerar transfusión si sintomático.",
        high: "Polycythemia - consider partial exchange if Hct >65% with symptoms.",
        highEs: "Policitemia - considerar exanguinotransfusión parcial si Hct >65% con síntomas.",
        critical: "Severely abnormal - immediate evaluation and intervention may be needed.",
        criticalEs: "Severamente anormal - evaluación e intervención inmediata puede ser necesaria.",
      },
    },
    {
      id: "hematocrit",
      name: "Hematocrit",
      shortName: "Hct",
      category: "hematology" as const,
      unit: "%",
      neonatalRange: {
        low: 42,
        high: 65,
        postnatalAgeSpecific: [
          { daysMin: 0, daysMax: 1, low: 42, high: 65 },
          { daysMin: 1, daysMax: 7, low: 40, high: 60 },
          { daysMin: 7, daysMax: 28, low: 30, high: 45 },
        ],
      },
      criticalLow: 21,
      criticalHigh: 70,
      interpretation: {
        low: "Anemia - correlate with Hgb and clinical status.",
        lowEs: "Anemia - correlacionar con Hgb y estado clínico.",
        high: "Polycythemia - if >65% with symptoms, consider partial exchange transfusion.",
        highEs: "Policitemia - si >65% con síntomas, considerar exanguinotransfusión parcial.",
        critical: "Critical value - immediate clinical correlation required.",
        criticalEs: "Valor crítico - correlación clínica inmediata requerida.",
      },
    },
    {
      id: "platelet_count",
      name: "Platelet Count",
      shortName: "Plt",
      category: "hematology" as const,
      unit: "×10³/μL",
      neonatalRange: {
        low: 150,
        high: 400,
      },
      criticalLow: 25,
      criticalHigh: 1000,
      interpretation: {
        low: "Thrombocytopenia - evaluate for sepsis, DIC, NEC, maternal antibodies. Transfuse per PlaNeT-2 thresholds.",
        lowEs: "Trombocitopenia - evaluar sepsis, CID, NEC, anticuerpos maternos. Transfundir según umbrales PlaNeT-2.",
        high: "Thrombocytosis - often reactive (infection, iron deficiency). Rarely requires treatment in neonates.",
        highEs: "Trombocitosis - frecuentemente reactiva (infección, deficiencia de hierro). Raramente requiere tratamiento en neonatos.",
        critical: "Critical platelet count - high bleeding risk if low; evaluate for underlying cause.",
        criticalEs: "Conteo plaquetario crítico - alto riesgo de sangrado si bajo; evaluar causa subyacente.",
      },
    },
    {
      id: "wbc",
      name: "White Blood Cell Count",
      shortName: "WBC",
      category: "hematology" as const,
      unit: "×10³/μL",
      neonatalRange: {
        low: 5,
        high: 30,
        postnatalAgeSpecific: [
          { daysMin: 0, daysMax: 1, low: 9, high: 30 },
          { daysMin: 1, daysMax: 7, low: 5, high: 21 },
          { daysMin: 7, daysMax: 28, low: 5, high: 19 },
        ],
      },
      criticalLow: 2,
      criticalHigh: 50,
      interpretation: {
        low: "Leukopenia - concerning for sepsis, bone marrow suppression. Check differential.",
        lowEs: "Leucopenia - preocupante para sepsis, supresión de médula ósea. Revisar diferencial.",
        high: "Leukocytosis - may be normal in first day; if persistent, consider infection or stress.",
        highEs: "Leucocitosis - puede ser normal en primer día; si persiste, considerar infección o estrés.",
        critical: "Critical WBC - evaluate urgently for sepsis or leukemia.",
        criticalEs: "WBC crítico - evaluar urgentemente para sepsis o leucemia.",
      },
    },
    {
      id: "reticulocyte_count",
      name: "Reticulocyte Count",
      shortName: "Retic",
      category: "hematology" as const,
      unit: "%",
      neonatalRange: {
        low: 3,
        high: 7,
      },
      criticalLow: 0.5,
      criticalHigh: 15,
      interpretation: {
        low: "Low reticulocyte count with anemia suggests decreased RBC production (bone marrow suppression, transient erythroblastopenia).",
        lowEs: "Conteo bajo de reticulocitos con anemia sugiere producción disminuida de GR (supresión de médula ósea, eritroblastopenia transitoria).",
        high: "Elevated reticulocyte count suggests hemolysis or blood loss with appropriate marrow response.",
        highEs: "Conteo elevado de reticulocitos sugiere hemólisis o pérdida de sangre con respuesta medular apropiada.",
        critical: "Very low suggests bone marrow failure; very high suggests significant hemolysis.",
        criticalEs: "Muy bajo sugiere falla medular; muy alto sugiere hemólisis significativa.",
      },
    },

    // CHEMISTRY
    {
      id: "sodium",
      name: "Sodium",
      shortName: "Na",
      category: "chemistry" as const,
      unit: "mEq/L",
      neonatalRange: {
        low: 135,
        high: 145,
      },
      criticalLow: 120,
      criticalHigh: 160,
      interpretation: {
        low: "Hyponatremia - evaluate fluid status, SIADH, renal losses. Correct slowly to avoid osmotic demyelination.",
        lowEs: "Hiponatremia - evaluar estado de líquidos, SIADH, pérdidas renales. Corregir lentamente para evitar desmielinización osmótica.",
        high: "Hypernatremia - usually dehydration or excess sodium intake. Correct slowly (max 0.5 mEq/L/hr).",
        highEs: "Hipernatremia - usualmente deshidratación o ingesta excesiva de sodio. Corregir lentamente (máx 0.5 mEq/L/hr).",
        critical: "Severe dysnatremia - high risk of neurologic complications. Slow, careful correction essential.",
        criticalEs: "Disnatremia severa - alto riesgo de complicaciones neurológicas. Corrección lenta y cuidadosa esencial.",
      },
    },
    {
      id: "potassium",
      name: "Potassium",
      shortName: "K",
      category: "chemistry" as const,
      unit: "mEq/L",
      neonatalRange: {
        low: 3.5,
        high: 6.0,
      },
      criticalLow: 2.5,
      criticalHigh: 7.0,
      interpretation: {
        low: "Hypokalemia - evaluate for GI losses, renal losses, inadequate intake. Risk of arrhythmia.",
        lowEs: "Hipokalemia - evaluar pérdidas GI, pérdidas renales, ingesta inadecuada. Riesgo de arritmia.",
        high: "Hyperkalemia - often pseudohyperkalemia from hemolysis. If true, risk of arrhythmia. Check ECG.",
        highEs: "Hiperkalemia - frecuentemente pseudohiperkalemia por hemólisis. Si verdadera, riesgo de arritmia. Revisar ECG.",
        critical: "Critical potassium - obtain ECG immediately. Treat hyperkalemia aggressively if true value.",
        criticalEs: "Potasio crítico - obtener ECG inmediatamente. Tratar hiperkalemia agresivamente si valor verdadero.",
      },
    },
    {
      id: "glucose",
      name: "Glucose",
      shortName: "Glu",
      category: "chemistry" as const,
      unit: "mg/dL",
      neonatalRange: {
        low: 40,
        high: 150,
      },
      criticalLow: 25,
      criticalHigh: 300,
      interpretation: {
        low: "Hypoglycemia - immediate treatment with IV dextrose. Evaluate for sepsis, hyperinsulinism, adrenal insufficiency.",
        lowEs: "Hipoglucemia - tratamiento inmediato con dextrosa IV. Evaluar sepsis, hiperinsulinismo, insuficiencia adrenal.",
        high: "Hyperglycemia - common in VLBW, stress, steroid use. Consider reducing GIR; insulin rarely needed.",
        highEs: "Hiperglucemia - común en MBPN, estrés, uso de esteroides. Considerar reducir VIG; insulina raramente necesaria.",
        critical: "Critical glucose - hypoglycemia requires immediate treatment; severe hyperglycemia evaluate for osmotic complications.",
        criticalEs: "Glucosa crítica - hipoglucemia requiere tratamiento inmediato; hiperglucemia severa evaluar complicaciones osmóticas.",
      },
    },
    {
      id: "calcium_total",
      name: "Calcium (Total)",
      shortName: "Ca",
      category: "chemistry" as const,
      unit: "mg/dL",
      neonatalRange: {
        low: 7.6,
        high: 10.4,
      },
      criticalLow: 6.0,
      criticalHigh: 13.0,
      interpretation: {
        low: "Hypocalcemia - common in preterm/VLBW, infants of diabetic mothers. Check ionized calcium, treat if symptomatic.",
        lowEs: "Hipocalcemia - común en prematuros/MBPN, hijos de madres diabéticas. Revisar calcio ionizado, tratar si sintomático.",
        high: "Hypercalcemia - rare; evaluate for excess supplementation, Williams syndrome, parathyroid disorders.",
        highEs: "Hipercalcemia - rara; evaluar suplementación excesiva, síndrome de Williams, trastornos paratiroideos.",
        critical: "Critical calcium - risk of cardiac arrhythmias. Urgent evaluation and treatment.",
        criticalEs: "Calcio crítico - riesgo de arritmias cardíacas. Evaluación y tratamiento urgente.",
      },
    },
    {
      id: "calcium_ionized",
      name: "Calcium (Ionized)",
      shortName: "iCa",
      category: "chemistry" as const,
      unit: "mmol/L",
      neonatalRange: {
        low: 1.1,
        high: 1.4,
      },
      criticalLow: 0.8,
      criticalHigh: 1.6,
      interpretation: {
        low: "Ionized hypocalcemia - physiologically active form. Treat if <1.0 mmol/L or symptomatic (jitteriness, seizures).",
        lowEs: "Hipocalcemia ionizada - forma fisiológicamente activa. Tratar si <1.0 mmol/L o sintomático (temblores, convulsiones).",
        high: "Ionized hypercalcemia - unusual; reduce calcium supplementation if receiving.",
        highEs: "Hipercalcemia ionizada - inusual; reducir suplementación de calcio si está recibiendo.",
        critical: "Critical ionized calcium - immediate treatment needed for symptomatic hypocalcemia.",
        criticalEs: "Calcio ionizado crítico - tratamiento inmediato necesario para hipocalcemia sintomática.",
      },
    },
    {
      id: "creatinine",
      name: "Creatinine",
      shortName: "Cr",
      category: "chemistry" as const,
      unit: "mg/dL",
      neonatalRange: {
        low: 0.3,
        high: 1.0,
        postnatalAgeSpecific: [
          { daysMin: 0, daysMax: 3, low: 0.3, high: 1.0 },
          { daysMin: 3, daysMax: 7, low: 0.2, high: 0.6 },
          { daysMin: 7, daysMax: 28, low: 0.1, high: 0.4 },
        ],
      },
      criticalHigh: 2.0,
      interpretation: {
        low: "Low creatinine is normal and expected, especially in very small infants.",
        lowEs: "Creatinina baja es normal y esperada, especialmente en lactantes muy pequeños.",
        high: "Elevated creatinine - evaluate for AKI. Consider prerenal (dehydration), renal (drug toxicity, hypoxia), or postrenal causes.",
        highEs: "Creatinina elevada - evaluar IRA. Considerar causas prerrenales (deshidratación), renales (toxicidad por drogas, hipoxia) o postrenales.",
        critical: "Significantly elevated - acute kidney injury likely. Evaluate fluid status, stop nephrotoxins.",
        criticalEs: "Significativamente elevada - probable lesión renal aguda. Evaluar estado de líquidos, suspender nefrotóxicos.",
      },
    },
    {
      id: "bilirubin_total",
      name: "Bilirubin (Total)",
      shortName: "TBili",
      category: "chemistry" as const,
      unit: "mg/dL",
      neonatalRange: {
        low: 0,
        high: 12,
      },
      criticalHigh: 20,
      interpretation: {
        low: "Normal.",
        lowEs: "Normal.",
        high: "Hyperbilirubinemia - plot on Bhutani nomogram. Evaluate for hemolysis if early or rising rapidly. Consider phototherapy.",
        highEs: "Hiperbilirrubinemia - graficar en nomograma de Bhutani. Evaluar hemólisis si temprana o aumentando rápidamente. Considerar fototerapia.",
        critical: "Critical bilirubin - risk of kernicterus. Intensive phototherapy; consider exchange transfusion.",
        criticalEs: "Bilirrubina crítica - riesgo de kernicterus. Fototerapia intensiva; considerar exanguinotransfusión.",
      },
    },
    {
      id: "bilirubin_direct",
      name: "Bilirubin (Direct/Conjugated)",
      shortName: "DBili",
      category: "chemistry" as const,
      unit: "mg/dL",
      neonatalRange: {
        low: 0,
        high: 0.3,
      },
      criticalHigh: 2.0,
      interpretation: {
        low: "Normal.",
        lowEs: "Normal.",
        high: "Direct hyperbilirubinemia (cholestasis) - >20% of total or >1 mg/dL. Evaluate for biliary atresia, TPN cholestasis, infection, metabolic disorders.",
        highEs: "Hiperbilirrubinemia directa (colestasis) - >20% del total o >1 mg/dL. Evaluar atresia biliar, colestasis por NPT, infección, trastornos metabólicos.",
        critical: "Significant cholestasis - urgent evaluation for biliary atresia (needs surgery before 60 days of life).",
        criticalEs: "Colestasis significativa - evaluación urgente para atresia biliar (necesita cirugía antes de 60 días de vida).",
      },
    },

    // BLOOD GAS
    {
      id: "ph",
      name: "pH",
      shortName: "pH",
      category: "blood_gas" as const,
      unit: "",
      neonatalRange: {
        low: 7.30,
        high: 7.45,
      },
      criticalLow: 7.10,
      criticalHigh: 7.60,
      interpretation: {
        low: "Acidemia - determine if respiratory (high pCO2) or metabolic (low HCO3). Treat underlying cause.",
        lowEs: "Acidemia - determinar si respiratoria (pCO2 alto) o metabólica (HCO3 bajo). Tratar causa subyacente.",
        high: "Alkalemia - determine if respiratory (low pCO2) or metabolic (high HCO3). Often iatrogenic.",
        highEs: "Alcalemia - determinar si respiratoria (pCO2 bajo) o metabólica (HCO3 alto). Frecuentemente iatrogénica.",
        critical: "Severe pH abnormality - life-threatening. Immediate intervention required.",
        criticalEs: "Anormalidad severa de pH - amenaza la vida. Intervención inmediata requerida.",
      },
    },
    {
      id: "pco2",
      name: "pCO2",
      shortName: "pCO2",
      category: "blood_gas" as const,
      unit: "mmHg",
      neonatalRange: {
        low: 35,
        high: 50,
      },
      criticalLow: 20,
      criticalHigh: 80,
      interpretation: {
        low: "Hypocapnia - usually from hyperventilation. May cause cerebral vasoconstriction; reduce ventilation if mechanical.",
        lowEs: "Hipocapnia - usualmente por hiperventilación. Puede causar vasoconstricción cerebral; reducir ventilación si mecánica.",
        high: "Hypercapnia - respiratory acidosis. Increase ventilatory support if indicated. Permissive hypercapnia acceptable in some cases.",
        highEs: "Hipercapnia - acidosis respiratoria. Aumentar soporte ventilatorio si indicado. Hipercapnia permisiva aceptable en algunos casos.",
        critical: "Severe hypercapnia - respiratory failure. May need intubation/ventilator adjustment.",
        criticalEs: "Hipercapnia severa - falla respiratoria. Puede necesitar intubación/ajuste de ventilador.",
      },
    },
    {
      id: "po2",
      name: "pO2",
      shortName: "pO2",
      category: "blood_gas" as const,
      unit: "mmHg",
      neonatalRange: {
        low: 50,
        high: 80,
      },
      criticalLow: 40,
      criticalHigh: 100,
      interpretation: {
        low: "Hypoxemia - increase FiO2 or respiratory support. Evaluate for lung disease, congenital heart disease.",
        lowEs: "Hipoxemia - aumentar FiO2 o soporte respiratorio. Evaluar enfermedad pulmonar, cardiopatía congénita.",
        high: "Hyperoxemia - reduce FiO2. Especially important in preterm (ROP risk). Target SpO2 90-95% in preterm.",
        highEs: "Hiperoxemia - reducir FiO2. Especialmente importante en prematuros (riesgo de ROP). Meta SpO2 90-95% en prematuro.",
        critical: "Critically abnormal pO2 - immediate respiratory intervention needed.",
        criticalEs: "pO2 críticamente anormal - intervención respiratoria inmediata necesaria.",
      },
    },
    {
      id: "bicarbonate",
      name: "Bicarbonate",
      shortName: "HCO3",
      category: "blood_gas" as const,
      unit: "mEq/L",
      neonatalRange: {
        low: 18,
        high: 26,
      },
      criticalLow: 10,
      criticalHigh: 40,
      interpretation: {
        low: "Low bicarbonate - metabolic acidosis. Calculate anion gap. Evaluate for lactic acidosis, renal tubular acidosis, GI losses.",
        lowEs: "Bicarbonato bajo - acidosis metabólica. Calcular brecha aniónica. Evaluar acidosis láctica, acidosis tubular renal, pérdidas GI.",
        high: "Elevated bicarbonate - metabolic alkalosis. Often from contraction alkalosis or overcorrection.",
        highEs: "Bicarbonato elevado - alcalosis metabólica. Frecuentemente por alcalosis de contracción o sobrecorrección.",
        critical: "Severe metabolic derangement - evaluate and treat underlying cause urgently.",
        criticalEs: "Desequilibrio metabólico severo - evaluar y tratar causa subyacente urgentemente.",
      },
    },
    {
      id: "lactate",
      name: "Lactate",
      shortName: "Lac",
      category: "blood_gas" as const,
      unit: "mmol/L",
      neonatalRange: {
        low: 0.5,
        high: 2.5,
      },
      criticalHigh: 5.0,
      interpretation: {
        low: "Normal.",
        lowEs: "Normal.",
        high: "Elevated lactate - suggests tissue hypoperfusion, sepsis, or inborn error of metabolism. Trending lactate useful for monitoring.",
        highEs: "Lactato elevado - sugiere hipoperfusión tisular, sepsis o error innato del metabolismo. Tendencia del lactato útil para monitoreo.",
        critical: "Critically elevated lactate - severe tissue hypoxia. Urgent intervention to improve perfusion.",
        criticalEs: "Lactato críticamente elevado - hipoxia tisular severa. Intervención urgente para mejorar perfusión.",
      },
    },

    // INFLAMMATORY MARKERS
    {
      id: "crp",
      name: "C-Reactive Protein",
      shortName: "CRP",
      category: "other" as const,
      unit: "mg/dL",
      neonatalRange: {
        low: 0,
        high: 1.0,
      },
      criticalHigh: 10,
      interpretation: {
        low: "Normal CRP has high negative predictive value for bacterial infection if repeated at 24-48h.",
        lowEs: "PCR normal tiene alto valor predictivo negativo para infección bacteriana si se repite a las 24-48h.",
        high: "Elevated CRP - nonspecific marker of inflammation. Rises 6-12h after infection onset. Consider serial values.",
        highEs: "PCR elevado - marcador inespecífico de inflamación. Se eleva 6-12h después del inicio de la infección. Considerar valores seriados.",
        critical: "Markedly elevated CRP - high suspicion for bacterial infection. Continue antibiotics, search for source.",
        criticalEs: "PCR marcadamente elevado - alta sospecha de infección bacteriana. Continuar antibióticos, buscar fuente.",
      },
    },

    // COAGULATION
    {
      id: "pt",
      name: "Prothrombin Time",
      shortName: "PT",
      category: "coagulation" as const,
      unit: "seconds",
      neonatalRange: {
        low: 10,
        high: 16,
      },
      criticalHigh: 25,
      interpretation: {
        low: "Normal.",
        lowEs: "Normal.",
        high: "Prolonged PT - vitamin K deficiency, liver dysfunction, DIC, coagulation factor deficiency. Ensure vitamin K given.",
        highEs: "TP prolongado - deficiencia de vitamina K, disfunción hepática, CID, deficiencia de factor de coagulación. Asegurar vitamina K administrada.",
        critical: "Markedly prolonged - high bleeding risk. Consider FFP if active bleeding.",
        criticalEs: "Marcadamente prolongado - alto riesgo de sangrado. Considerar PFC si sangrado activo.",
      },
    },
    {
      id: "ptt",
      name: "Partial Thromboplastin Time",
      shortName: "PTT",
      category: "coagulation" as const,
      unit: "seconds",
      neonatalRange: {
        low: 30,
        high: 50,
      },
      criticalHigh: 100,
      interpretation: {
        low: "Normal.",
        lowEs: "Normal.",
        high: "Prolonged PTT - heparin effect, intrinsic pathway deficiency, DIC. If on heparin, usually expected.",
        highEs: "TTP prolongado - efecto de heparina, deficiencia de vía intrínseca, CID. Si está con heparina, usualmente esperado.",
        critical: "Markedly prolonged - high bleeding risk. Hold heparin if applicable; consider FFP if bleeding.",
        criticalEs: "Marcadamente prolongado - alto riesgo de sangrado. Suspender heparina si aplica; considerar PFC si sangrado.",
      },
    },
  ] as LabReferenceRange[],
};

/**
 * Get lab reference by ID or name
 */
export function getLabReference(idOrName: string): LabReferenceRange | undefined {
  const search = idOrName.toLowerCase();
  return LAB_REFERENCE_RANGES.ranges.find(
    (r) =>
      r.id === search ||
      r.name.toLowerCase().includes(search) ||
      r.shortName.toLowerCase() === search
  );
}

/**
 * Interpret a lab value
 */
export function interpretLabValue(
  labId: string,
  value: number,
  language: "en" | "es" = "en"
): {
  status: "normal" | "low" | "high" | "critical_low" | "critical_high";
  interpretation: string;
  referenceRange: string;
} | null {
  const lab = LAB_REFERENCE_RANGES.ranges.find((r) => r.id === labId);
  if (!lab) return null;

  const isEs = language === "es";
  let status: "normal" | "low" | "high" | "critical_low" | "critical_high";
  let interpretation: string;

  if (lab.criticalLow !== undefined && value < lab.criticalLow) {
    status = "critical_low";
    interpretation = isEs ? lab.interpretation.criticalEs : lab.interpretation.critical;
  } else if (lab.criticalHigh !== undefined && value > lab.criticalHigh) {
    status = "critical_high";
    interpretation = isEs ? lab.interpretation.criticalEs : lab.interpretation.critical;
  } else if (value < lab.neonatalRange.low) {
    status = "low";
    interpretation = isEs ? lab.interpretation.lowEs : lab.interpretation.low;
  } else if (value > lab.neonatalRange.high) {
    status = "high";
    interpretation = isEs ? lab.interpretation.highEs : lab.interpretation.high;
  } else {
    status = "normal";
    interpretation = isEs ? "Dentro del rango normal." : "Within normal range.";
  }

  return {
    status,
    interpretation,
    referenceRange: `${lab.neonatalRange.low}-${lab.neonatalRange.high} ${lab.unit}`,
  };
}
