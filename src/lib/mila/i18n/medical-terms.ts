/**
 * Medical Terms Translation Dictionary
 *
 * Translates common medical terms, procedures, and order descriptions
 * between English and Spanish.
 */

export const medicalTerms: Record<string, { en: string; es: string }> = {
  // Transfusion-related
  "prbc transfusion": { en: "pRBC transfusion", es: "Transfusión de GR" },
  "rbc transfusion": { en: "RBC transfusion", es: "Transfusión de GR" },
  "platelet transfusion": { en: "Platelet transfusion", es: "Transfusión de plaquetas" },
  "ffp": { en: "FFP", es: "PFC" },
  "plasma transfusion": { en: "Plasma transfusion", es: "Transfusión de plasma" },
  "fresh frozen plasma": { en: "Fresh Frozen Plasma", es: "Plasma Fresco Congelado" },

  // Labs
  "cbc": { en: "CBC", es: "Hemograma" },
  "weekly cbc": { en: "Weekly CBC", es: "Hemograma semanal" },
  "bmp": { en: "BMP", es: "Panel metabólico básico" },
  "blood culture": { en: "Blood culture", es: "Hemocultivo" },
  "blood gas": { en: "Blood gas", es: "Gasometría" },
  "abg": { en: "ABG", es: "Gasometría arterial" },
  "coagulation panel": { en: "Coagulation panel", es: "Panel de coagulación" },
  "pt/inr": { en: "PT/INR", es: "TP/INR" },
  "ptt": { en: "PTT", es: "TTP" },
  "bilirubin": { en: "Bilirubin", es: "Bilirrubina" },
  "total bilirubin": { en: "Total bilirubin", es: "Bilirrubina total" },
  "direct bilirubin": { en: "Direct bilirubin", es: "Bilirrubina directa" },
  "ldh": { en: "LDH", es: "LDH" },
  "haptoglobin": { en: "Haptoglobin", es: "Haptoglobina" },
  "reticulocyte count": { en: "Reticulocyte count", es: "Recuento de reticulocitos" },
  "type and screen": { en: "Type and screen", es: "Tipificación y prueba cruzada" },
  "pre-transfusion type and screen": { en: "Pre-transfusion type and screen", es: "Tipificación pre-transfusión" },
  "admission labs": { en: "Admission labs", es: "Laboratorios de ingreso" },

  // Procedures
  "lumbar puncture": { en: "Lumbar puncture", es: "Punción lumbar" },
  "lp": { en: "LP", es: "PL" },
  "intubation": { en: "Intubation", es: "Intubación" },
  "extubation": { en: "Extubation", es: "Extubación" },
  "surfactant administration": { en: "Surfactant administration", es: "Administración de surfactante" },
  "surfactant": { en: "Surfactant", es: "Surfactante" },
  "picc line placement": { en: "PICC line placement", es: "Colocación de línea PICC" },
  "uvc placement": { en: "UVC placement", es: "Colocación de CU" },
  "uac placement": { en: "UAC placement", es: "Colocación de CAU" },
  "peripheral iv": { en: "Peripheral IV", es: "Vía periférica" },
  "blood draw": { en: "Blood draw", es: "Extracción de sangre" },
  "heel stick": { en: "Heel stick", es: "Punción de talón" },
  "car seat test": { en: "Car seat test", es: "Prueba de silla de auto" },
  "hearing screen": { en: "Hearing screen", es: "Tamizaje auditivo" },

  // Imaging
  "cxr": { en: "CXR", es: "Rx tórax" },
  "chest x-ray": { en: "Chest X-ray", es: "Radiografía de tórax" },
  "kub": { en: "KUB", es: "Rx abdomen" },
  "abdominal x-ray": { en: "Abdominal X-ray", es: "Radiografía abdominal" },
  "head ultrasound": { en: "Head ultrasound", es: "Ultrasonido cerebral" },
  "cranial ultrasound": { en: "Cranial ultrasound", es: "Ultrasonido craneal" },
  "echocardiogram": { en: "Echocardiogram", es: "Ecocardiograma" },
  "echo": { en: "Echo", es: "Eco" },
  "renal ultrasound": { en: "Renal ultrasound", es: "Ultrasonido renal" },

  // Medications
  "vitamin k": { en: "Vitamin K", es: "Vitamina K" },
  "ampicillin": { en: "Ampicillin", es: "Ampicilina" },
  "gentamicin": { en: "Gentamicin", es: "Gentamicina" },
  "ampicillin + gentamicin": { en: "Ampicillin + Gentamicin", es: "Ampicilina + Gentamicina" },
  "vancomycin": { en: "Vancomycin", es: "Vancomicina" },
  "caffeine": { en: "Caffeine", es: "Cafeína" },
  "caffeine citrate": { en: "Caffeine citrate", es: "Citrato de cafeína" },
  "erythromycin eye ointment": { en: "Erythromycin eye ointment", es: "Ungüento oftálmico de eritromicina" },
  "hepatitis b vaccine": { en: "Hepatitis B vaccine", es: "Vacuna hepatitis B" },
  "iron supplementation": { en: "Iron supplementation", es: "Suplementación de hierro" },
  "epo": { en: "EPO", es: "EPO" },
  "erythropoietin": { en: "Erythropoietin", es: "Eritropoyetina" },
  "phototherapy": { en: "Phototherapy", es: "Fototerapia" },
  "intensive phototherapy": { en: "Intensive phototherapy", es: "Fototerapia intensiva" },

  // Consultations
  "ophthalmology consult": { en: "Ophthalmology consult", es: "Consulta de oftalmología" },
  "rop screening": { en: "ROP screening", es: "Tamizaje de ROP" },
  "cardiology consult": { en: "Cardiology consult", es: "Consulta de cardiología" },
  "neurology consult": { en: "Neurology consult", es: "Consulta de neurología" },
  "gi consult": { en: "GI consult", es: "Consulta de gastroenterología" },
  "surgery consult": { en: "Surgery consult", es: "Consulta de cirugía" },
  "hematology consult": { en: "Hematology consult", es: "Consulta de hematología" },
  "infectious disease consult": { en: "Infectious disease consult", es: "Consulta de infectología" },
  "lactation consult": { en: "Lactation consult", es: "Consulta de lactancia" },
  "social work consult": { en: "Social work consult", es: "Consulta de trabajo social" },

  // Clinical terms
  "anemia of prematurity": { en: "Anemia of prematurity", es: "Anemia de la prematuridad" },
  "symptomatic anemia": { en: "Symptomatic anemia", es: "Anemia sintomática" },
  "nec": { en: "NEC", es: "ECN" },
  "necrotizing enterocolitis": { en: "Necrotizing enterocolitis", es: "Enterocolitis necrotizante" },
  "sepsis": { en: "Sepsis", es: "Sepsis" },
  "sepsis workup": { en: "Sepsis workup", es: "Estudio de sepsis" },
  "suspected sepsis": { en: "Suspected sepsis", es: "Sospecha de sepsis" },
  "rule out sepsis": { en: "Rule out sepsis", es: "Descartar sepsis" },
  "r/o sepsis": { en: "R/O sepsis", es: "Descartar sepsis" },
  "coagulopathy": { en: "Coagulopathy", es: "Coagulopatía" },
  "poor weight gain": { en: "Poor weight gain", es: "Pobre ganancia de peso" },
  "apnea": { en: "Apnea", es: "Apnea" },
  "bradycardia": { en: "Bradycardia", es: "Bradicardia" },
  "desaturation": { en: "Desaturation", es: "Desaturación" },
  "jaundice": { en: "Jaundice", es: "Ictericia" },
  "hyperbilirubinemia": { en: "Hyperbilirubinemia", es: "Hiperbilirrubinemia" },
  "hemolysis": { en: "Hemolysis", es: "Hemólisis" },

  // Units and measurements
  "ml/kg": { en: "ml/kg", es: "ml/kg" },
  "mg/kg": { en: "mg/kg", es: "mg/kg" },
  "u/kg": { en: "U/kg", es: "U/kg" },
  "g/dl": { en: "g/dL", es: "g/dL" },

  // Other common phrases
  "pre-discharge": { en: "Pre-discharge", es: "Pre-alta" },
  "post-extubation": { en: "Post-extubation", es: "Post-extubación" },
  "empiric antibiotics": { en: "Empiric antibiotics", es: "Antibióticos empíricos" },
  "routine": { en: "Routine", es: "Rutina" },
  "increasing o2 requirement": { en: "Increasing O2 requirement", es: "Aumento de requerimiento de O2" },
  "assess lung fields": { en: "Assess lung fields", es: "Evaluar campos pulmonares" },
};

/**
 * Translates medical text by finding and replacing known medical terms.
 * Preserves numbers and measurements.
 */
export function translateMedicalText(text: string, targetLanguage: "en" | "es"): string {
  if (!text) return text;

  let result = text;

  // Sort terms by length (longest first) to prevent partial replacements
  const sortedTerms = Object.entries(medicalTerms).sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [key, translations] of sortedTerms) {
    const sourceText = targetLanguage === "es" ? translations.en : translations.es;
    const targetText = targetLanguage === "es" ? translations.es : translations.en;

    // Create a case-insensitive regex
    const regex = new RegExp(escapeRegex(sourceText), "gi");
    result = result.replace(regex, targetText);
  }

  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Quick lookup for common medical abbreviations
 */
export function getTranslatedAbbreviation(abbrev: string, language: "en" | "es"): string {
  const lower = abbrev.toLowerCase();
  if (medicalTerms[lower]) {
    return medicalTerms[lower][language];
  }
  return abbrev;
}
