/**
 * Patient Scenarios for Demo/Training
 *
 * These scenarios represent different clinical situations to help train doctors
 * and test the MILA AI assistant's recommendations.
 *
 * IMPORTANT: Scenarios include subtle issues that AI should catch:
 * - Excessive phlebotomy (blood draws each shift)
 * - Rising direct bilirubin (hemolysis)
 * - Declining hemoglobin trends
 * - Above-average transfusion counts
 */

import { v4 as uuid } from "uuid";
import type {
  Patient,
  Observation,
  Transfusion,
  LabValue,
  Phlebotomy,
  Feeding,
  Order,
  PhlebotomyType,
  FeedingType,
  FeedingRoute,
  FeedingTolerance,
} from "../types";

export type ScenarioId =
  | "declining_hgb"           // Baby with declining hemoglobin trend
  | "recovering"              // Baby that seems sick but improving
  | "stable"                  // Stable, healthy preterm baby
  | "hemolysis"               // Too many transfusions, early hemolysis detection
  | "iatrogenic_anemia"       // Too many phlebotomies causing anemia
  | "feeding_intolerance"     // NEC concern with feeding issues
  | "hyperbilirubinemia"      // Jaundice requiring phototherapy
  | "thrombocytopenia"        // Low platelets, bleeding risk
  | "sepsis_workup"           // Sepsis indicators, needs workup
  | "success_story";          // Preterm doing great, ready for discharge

export interface PatientScenario {
  id: ScenarioId;
  name: {
    en: string;
    es: string;
  };
  description: {
    en: string;
    es: string;
  };
  clinicalTeachingPoints: {
    en: string[];
    es: string[];
  };
  patient: Omit<Patient, "id" | "createdAt" | "updatedAt">;
  generateData: () => {
    observations: Omit<Observation, "id" | "createdAt" | "updatedAt">[];
    transfusions: Omit<Transfusion, "id" | "createdAt" | "updatedAt">[];
    labValues: Omit<LabValue, "id" | "createdAt" | "updatedAt">[];
    phlebotomies: Omit<Phlebotomy, "id" | "createdAt" | "updatedAt">[];
    feedings: Omit<Feeding, "id" | "createdAt" | "updatedAt">[];
    orders: Omit<Order, "id" | "createdAt" | "updatedAt">[];
  };
}

// Helper to generate dates relative to now
function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function hoursAgo(hours: number): string {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

// Helper to create phlebotomy entries
function createPhlebotomy(
  patientId: string,
  occurredAt: string,
  type: PhlebotomyType,
  volumeMl: number,
  notes?: string,
  labsOrdered: string[] = []
): Omit<Phlebotomy, "id" | "createdAt" | "updatedAt"> {
  return { patientId, occurredAt, type, volumeMl, labsOrdered, notes };
}

// Helper to create feeding entries
function createFeeding(
  patientId: string,
  occurredAt: string,
  feedingType: FeedingType,
  route: FeedingRoute,
  volumeMl: number,
  tolerance: FeedingTolerance,
  options: { residualMl?: number; notes?: string } = {}
): Omit<Feeding, "id" | "createdAt" | "updatedAt"> {
  return {
    patientId,
    occurredAt,
    feedingType,
    route,
    volumeMl,
    tolerance,
    ...options,
  };
}

// ============================================
// SCENARIO 1: Declining Hemoglobin Trend
// ============================================
const decliningHgbScenario: PatientScenario = {
  id: "declining_hgb",
  name: {
    en: "Baby Martinez - Declining Hemoglobin",
    es: "Bebe Martinez - Hemoglobina en Descenso",
  },
  description: {
    en: "32-week preterm with progressive anemia. Hemoglobin declining but baby clinically stable. Good candidate for EPO therapy rather than transfusion.",
    es: "Prematuro de 32 semanas con anemia progresiva. Hemoglobina en descenso pero bebe clinicamente estable. Buen candidato para terapia con EPO en lugar de transfusion.",
  },
  clinicalTeachingPoints: {
    en: [
      "Trend is more important than absolute number",
      "Consider EPO + Iron before transfusion if stable",
      "Minimize phlebotomy losses",
      "Transfuse only if symptomatic or Hgb <7 g/dL",
    ],
    es: [
      "La tendencia es mas importante que el numero absoluto",
      "Considerar EPO + Hierro antes de transfusion si estable",
      "Minimizar perdidas por flebotomia",
      "Transfundir solo si sintomatico o Hgb <7 g/dL",
    ],
  },
  patient: {
    displayName: "Baby Martinez",
    birthDate: daysAgo(21),
    gestationalAgeWeeks: 32,
    birthWeightGrams: 1650,
    bloodType: "A+",
    parentContacts: [
      {
        id: uuid(),
        relationship: "mother",
        name: "Maria Martinez",
        phone: "+1-555-0101",
        email: "maria.martinez@email.com",
        preferredLanguage: "es",
        isPrimaryContact: true,
        canReceiveUpdates: true,
        consentForUpdates: true,
        consentAt: daysAgo(21),
      },
    ],
  },
  generateData: () => {
    const patientId = "scenario-declining-hgb";

    // Labs showing declining hemoglobin over 3 weeks
    const labValues: Omit<LabValue, "id" | "createdAt" | "updatedAt">[] = [
      // Day 1 - Birth
      { patientId, occurredAt: daysAgo(21), labTypeId: "hgb", value: 16.5, unit: "g/dL", refRangeLow: 13, refRangeHigh: 20 },
      { patientId, occurredAt: daysAgo(21), labTypeId: "hct", value: 49, unit: "%", refRangeLow: 40, refRangeHigh: 60 },
      { patientId, occurredAt: daysAgo(21), labTypeId: "plt", value: 185000, unit: "/uL", refRangeLow: 150000, refRangeHigh: 400000 },

      // Day 7
      { patientId, occurredAt: daysAgo(14), labTypeId: "hgb", value: 13.2, unit: "g/dL", refRangeLow: 10, refRangeHigh: 18 },
      { patientId, occurredAt: daysAgo(14), labTypeId: "hct", value: 39, unit: "%", refRangeLow: 30, refRangeHigh: 55 },
      { patientId, occurredAt: daysAgo(14), labTypeId: "retic", value: 3.5, unit: "%", refRangeLow: 1, refRangeHigh: 5 },

      // Day 14
      { patientId, occurredAt: daysAgo(7), labTypeId: "hgb", value: 10.8, unit: "g/dL", refRangeLow: 9, refRangeHigh: 16 },
      { patientId, occurredAt: daysAgo(7), labTypeId: "hct", value: 32, unit: "%", refRangeLow: 28, refRangeHigh: 50 },
      { patientId, occurredAt: daysAgo(7), labTypeId: "retic", value: 2.8, unit: "%", refRangeLow: 1, refRangeHigh: 5 },

      // Day 18
      { patientId, occurredAt: daysAgo(3), labTypeId: "hgb", value: 9.1, unit: "g/dL", refRangeLow: 8, refRangeHigh: 14 },
      { patientId, occurredAt: daysAgo(3), labTypeId: "hct", value: 27, unit: "%", refRangeLow: 25, refRangeHigh: 45 },

      // Day 21 (today)
      { patientId, occurredAt: hoursAgo(4), labTypeId: "hgb", value: 8.2, unit: "g/dL", refRangeLow: 8, refRangeHigh: 14 },
      { patientId, occurredAt: hoursAgo(4), labTypeId: "hct", value: 24.5, unit: "%", refRangeLow: 25, refRangeHigh: 45 },
      { patientId, occurredAt: hoursAgo(4), labTypeId: "retic", value: 2.1, unit: "%", refRangeLow: 1, refRangeHigh: 5 },
      { patientId, occurredAt: hoursAgo(4), labTypeId: "plt", value: 210000, unit: "/uL", refRangeLow: 150000, refRangeHigh: 400000 },
    ];

    // Minimal, appropriately spaced phlebotomies (weekly)
    const phlebotomies: Omit<Phlebotomy, "id" | "createdAt" | "updatedAt">[] = [
      createPhlebotomy(patientId, daysAgo(21), "routine_labs", 1.5, "Admission labs", ["hgb", "hct", "plt"]),
      createPhlebotomy(patientId, daysAgo(14), "routine_labs", 1.0, "Weekly CBC", ["hgb", "hct", "retic"]),
      createPhlebotomy(patientId, daysAgo(7), "routine_labs", 1.0, "Weekly CBC", ["hgb", "hct", "retic"]),
      createPhlebotomy(patientId, hoursAgo(4), "routine_labs", 1.0, "Weekly CBC", ["hgb", "hct", "retic", "plt"]),
    ];

    // No transfusions yet - this is the teaching point
    const transfusions: Omit<Transfusion, "id" | "createdAt" | "updatedAt">[] = [];

    // Good feeding tolerance
    const feedings: Omit<Feeding, "id" | "createdAt" | "updatedAt">[] = [
      createFeeding(patientId, hoursAgo(3), "fortified_breast_milk", "ng_tube", 25, "tolerated"),
      createFeeding(patientId, hoursAgo(6), "fortified_breast_milk", "ng_tube", 25, "tolerated"),
      createFeeding(patientId, hoursAgo(9), "fortified_breast_milk", "ng_tube", 22, "tolerated"),
    ];

    // Clinical notes
    const observations: Omit<Observation, "id" | "createdAt" | "updatedAt">[] = [
      {
        patientId,
        occurredAt: hoursAgo(2),
        category: "clinical",
        severity: "info",
        source: "nurse",
        content: "Baby active, good tone. No tachycardia, no apnea events. Tolerating feeds well. Clinically stable despite low Hgb.",
        tags: ["stable", "anemia"],
      },
      {
        patientId,
        occurredAt: daysAgo(1),
        category: "clinical",
        severity: "info",
        source: "doctor",
        content: "Discussed with parents about anemia of prematurity. Plan: Start EPO 400 U/kg SC 3x/week with Iron 6 mg/kg/day. Hold transfusion if clinically stable.",
        tags: ["anemia", "EPO", "plan"],
      },
    ];

    // Pending EPO order
    const orders: Omit<Order, "id" | "createdAt" | "updatedAt">[] = [
      {
        patientId,
        orderType: "medication",
        status: "pending",
        priority: "routine",
        description: "Erythropoietin (EPO) 400 U/kg SC 3x/week",
        details: "Start EPO therapy for anemia of prematurity. Recheck Hgb in 1 week.",
        orderedBy: "Dr. Chen",
        orderedByRole: "attending",
        orderedAt: hoursAgo(1),
      },
      {
        patientId,
        orderType: "medication",
        status: "pending",
        priority: "routine",
        description: "Iron supplementation 6 mg/kg/day PO",
        details: "Start iron with EPO therapy",
        orderedBy: "Dr. Chen",
        orderedByRole: "attending",
        orderedAt: hoursAgo(1),
      },
    ];

    return { observations, transfusions, labValues, phlebotomies, feedings, orders };
  },
};

// ============================================
// SCENARIO 2: Recovering Baby (Looks sick, improving)
// ============================================
const recoveringScenario: PatientScenario = {
  id: "recovering",
  name: {
    en: "Baby Johnson - Recovering from Sepsis",
    es: "Bebe Johnson - Recuperandose de Sepsis",
  },
  description: {
    en: "30-week preterm recovering from early-onset sepsis. Labs were concerning but now trending up. Teaching point: trends show recovery even when absolute values still abnormal.",
    es: "Prematuro de 30 semanas recuperandose de sepsis temprana. Laboratorios preocupantes pero ahora en ascenso. Punto de ensenanza: las tendencias muestran recuperacion aunque los valores absolutos aun sean anormales.",
  },
  clinicalTeachingPoints: {
    en: [
      "Improving trends indicate recovery even with abnormal values",
      "Clinical appearance may lag behind lab improvement",
      "Continue supportive care as labs normalize",
      "Watch for secondary complications during recovery",
    ],
    es: [
      "Tendencias en mejora indican recuperacion aunque valores sean anormales",
      "La apariencia clinica puede tardar mas que la mejora de laboratorios",
      "Continuar cuidado de soporte mientras los laboratorios normalizan",
      "Vigilar complicaciones secundarias durante la recuperacion",
    ],
  },
  patient: {
    displayName: "Baby Johnson",
    birthDate: daysAgo(14),
    gestationalAgeWeeks: 30,
    birthWeightGrams: 1380,
    bloodType: "O+",
    parentContacts: [
      {
        id: uuid(),
        relationship: "father",
        name: "Marcus Johnson",
        phone: "+1-555-0202",
        preferredLanguage: "en",
        isPrimaryContact: true,
        canReceiveUpdates: true,
        consentForUpdates: true,
        consentAt: daysAgo(14),
      },
    ],
  },
  generateData: () => {
    const patientId = "scenario-recovering";

    // Labs showing recovery pattern over 10 days
    const labValues: Omit<LabValue, "id" | "createdAt" | "updatedAt">[] = [
      // Day 1 - Sepsis peak (worst values)
      { patientId, occurredAt: daysAgo(10), labTypeId: "wbc", value: 2.1, unit: "K/uL", refRangeLow: 5, refRangeHigh: 20 },
      { patientId, occurredAt: daysAgo(10), labTypeId: "plt", value: 45000, unit: "/uL", refRangeLow: 150000, refRangeHigh: 400000 },
      { patientId, occurredAt: daysAgo(10), labTypeId: "crp", value: 85, unit: "mg/L", refRangeLow: 0, refRangeHigh: 10 },
      { patientId, occurredAt: daysAgo(10), labTypeId: "hgb", value: 12.5, unit: "g/dL", refRangeLow: 10, refRangeHigh: 18 },

      // Day 4 - Starting to improve
      { patientId, occurredAt: daysAgo(7), labTypeId: "wbc", value: 4.8, unit: "K/uL", refRangeLow: 5, refRangeHigh: 20 },
      { patientId, occurredAt: daysAgo(7), labTypeId: "plt", value: 68000, unit: "/uL", refRangeLow: 150000, refRangeHigh: 400000 },
      { patientId, occurredAt: daysAgo(7), labTypeId: "crp", value: 42, unit: "mg/L", refRangeLow: 0, refRangeHigh: 10 },

      // Day 7 - Clear improvement
      { patientId, occurredAt: daysAgo(4), labTypeId: "wbc", value: 7.2, unit: "K/uL", refRangeLow: 5, refRangeHigh: 20 },
      { patientId, occurredAt: daysAgo(4), labTypeId: "plt", value: 112000, unit: "/uL", refRangeLow: 150000, refRangeHigh: 400000 },
      { patientId, occurredAt: daysAgo(4), labTypeId: "crp", value: 18, unit: "mg/L", refRangeLow: 0, refRangeHigh: 10 },

      // Today - Near normal
      { patientId, occurredAt: hoursAgo(6), labTypeId: "wbc", value: 9.5, unit: "K/uL", refRangeLow: 5, refRangeHigh: 20 },
      { patientId, occurredAt: hoursAgo(6), labTypeId: "plt", value: 142000, unit: "/uL", refRangeLow: 150000, refRangeHigh: 400000 },
      { patientId, occurredAt: hoursAgo(6), labTypeId: "crp", value: 8, unit: "mg/L", refRangeLow: 0, refRangeHigh: 10 },
      { patientId, occurredAt: hoursAgo(6), labTypeId: "hgb", value: 11.8, unit: "g/dL", refRangeLow: 10, refRangeHigh: 18 },
    ];

    // Appropriate phlebotomies for sepsis workup (spaced over days)
    const phlebotomies: Omit<Phlebotomy, "id" | "createdAt" | "updatedAt">[] = [
      createPhlebotomy(patientId, daysAgo(10), "blood_culture", 1.0, "Sepsis workup", ["blood_culture"]),
      createPhlebotomy(patientId, daysAgo(10), "routine_labs", 1.5, "Sepsis labs", ["wbc", "plt", "crp", "hgb"]),
      createPhlebotomy(patientId, daysAgo(7), "routine_labs", 1.0, "Follow-up day 3", ["wbc", "plt", "crp"]),
      createPhlebotomy(patientId, daysAgo(4), "routine_labs", 1.0, "Follow-up day 6", ["wbc", "plt", "crp"]),
      createPhlebotomy(patientId, hoursAgo(6), "routine_labs", 1.0, "Final sepsis labs day 10", ["wbc", "plt", "crp", "hgb"]),
    ];

    // One platelet transfusion during sepsis
    const transfusions: Omit<Transfusion, "id" | "createdAt" | "updatedAt">[] = [
      {
        patientId,
        occurredAt: daysAgo(9),
        type: "platelet",
        volumeMl: 15,
        donorId: "PLT-2024-001",
        notes: "Platelet transfusion for severe thrombocytopenia during sepsis",
        isEmergency: false,
        parentConsentObtained: true,
        parentConsentAt: daysAgo(9),
      },
    ];

    // Feeding resuming gradually
    const feedings: Omit<Feeding, "id" | "createdAt" | "updatedAt">[] = [
      createFeeding(patientId, hoursAgo(3), "breast_milk", "ng_tube", 15, "tolerated"),
      createFeeding(patientId, hoursAgo(6), "breast_milk", "ng_tube", 12, "tolerated"),
      createFeeding(patientId, hoursAgo(9), "breast_milk", "ng_tube", 10, "partial", { notes: "Small residual 2ml" }),
    ];

    const observations: Omit<Observation, "id" | "createdAt" | "updatedAt">[] = [
      {
        patientId,
        occurredAt: hoursAgo(2),
        category: "clinical",
        severity: "info",
        source: "doctor",
        content: "Day 10 of antibiotics. Labs improving nicely - WBC normalized, CRP near normal, platelets recovering. Clinically more active. Plan to complete 10-day course and DC antibiotics tomorrow.",
        tags: ["sepsis", "improving", "antibiotics"],
      },
      {
        patientId,
        occurredAt: daysAgo(10),
        category: "clinical",
        severity: "critical",
        source: "doctor",
        content: "Early-onset sepsis confirmed. Blood culture positive for GBS. Started ampicillin + gentamicin. Critical thrombocytopenia - transfused platelets.",
        tags: ["sepsis", "GBS", "critical"],
      },
    ];

    const orders: Omit<Order, "id" | "createdAt" | "updatedAt">[] = [
      {
        patientId,
        orderType: "medication",
        status: "completed",
        priority: "stat",
        description: "Ampicillin 100 mg/kg/dose q12h IV",
        orderedBy: "Dr. Williams",
        orderedByRole: "attending",
        orderedAt: daysAgo(10),
        executedBy: "RN Sarah",
        executedByRole: "nurse",
        executedAt: daysAgo(10),
        completedAt: hoursAgo(12),
      },
    ];

    return { observations, transfusions, labValues, phlebotomies, feedings, orders };
  },
};

// ============================================
// SCENARIO 3: Stable Baby
// ============================================
const stableScenario: PatientScenario = {
  id: "stable",
  name: {
    en: "Baby Kim - Stable Preterm",
    es: "Bebe Kim - Prematuro Estable",
  },
  description: {
    en: "34-week preterm doing well. All parameters stable, good feeding, approaching discharge. Teaching point: Not every baby needs intervention - sometimes observation is the best medicine.",
    es: "Prematuro de 34 semanas progresando bien. Todos los parametros estables, buena alimentacion, cerca del alta. Punto de ensenanza: No todo bebe necesita intervencion - a veces la observacion es la mejor medicina.",
  },
  clinicalTeachingPoints: {
    en: [
      "Stable babies need minimal intervention",
      "Focus on feeding advancement and weight gain",
      "Minimize lab draws in stable patients",
      "Prepare family for discharge education",
    ],
    es: [
      "Bebes estables necesitan intervencion minima",
      "Enfocarse en avance alimentario y ganancia de peso",
      "Minimizar extracciones en pacientes estables",
      "Preparar a la familia para educacion de alta",
    ],
  },
  patient: {
    displayName: "Baby Kim",
    birthDate: daysAgo(10),
    gestationalAgeWeeks: 34,
    birthWeightGrams: 2150,
    bloodType: "B+",
    parentContacts: [
      {
        id: uuid(),
        relationship: "mother",
        name: "Jennifer Kim",
        phone: "+1-555-0303",
        email: "jkim@email.com",
        preferredLanguage: "en",
        isPrimaryContact: true,
        canReceiveUpdates: true,
        consentForUpdates: true,
        consentAt: daysAgo(10),
      },
    ],
  },
  generateData: () => {
    const patientId = "scenario-stable";

    // Stable labs - minimal draws
    const labValues: Omit<LabValue, "id" | "createdAt" | "updatedAt">[] = [
      { patientId, occurredAt: daysAgo(10), labTypeId: "hgb", value: 15.2, unit: "g/dL", refRangeLow: 13, refRangeHigh: 20 },
      { patientId, occurredAt: daysAgo(10), labTypeId: "plt", value: 245000, unit: "/uL", refRangeLow: 150000, refRangeHigh: 400000 },
      { patientId, occurredAt: daysAgo(10), labTypeId: "tbili", value: 8.5, unit: "mg/dL", refRangeLow: 0, refRangeHigh: 12 },
      { patientId, occurredAt: daysAgo(5), labTypeId: "hgb", value: 14.8, unit: "g/dL", refRangeLow: 12, refRangeHigh: 18 },
      { patientId, occurredAt: daysAgo(5), labTypeId: "tbili", value: 6.2, unit: "mg/dL", refRangeLow: 0, refRangeHigh: 12 },
    ];

    // Minimal phlebotomies - appropriate for stable baby
    const phlebotomies: Omit<Phlebotomy, "id" | "createdAt" | "updatedAt">[] = [
      createPhlebotomy(patientId, daysAgo(10), "routine_labs", 1.0, "Admission", ["hgb", "plt", "tbili"]),
      createPhlebotomy(patientId, daysAgo(5), "routine_labs", 0.5, "Bilirubin check", ["tbili", "hgb"]),
    ];

    // No transfusions needed
    const transfusions: Omit<Transfusion, "id" | "createdAt" | "updatedAt">[] = [];

    // Excellent feeding
    const feedings: Omit<Feeding, "id" | "createdAt" | "updatedAt">[] = [
      createFeeding(patientId, hoursAgo(3), "breast_milk", "oral", 45, "tolerated"),
      createFeeding(patientId, hoursAgo(6), "breast_milk", "oral", 45, "tolerated"),
      createFeeding(patientId, hoursAgo(9), "breast_milk", "oral", 42, "tolerated"),
      createFeeding(patientId, hoursAgo(12), "breast_milk", "oral", 45, "tolerated"),
    ];

    const observations: Omit<Observation, "id" | "createdAt" | "updatedAt">[] = [
      {
        patientId,
        occurredAt: hoursAgo(4),
        category: "clinical",
        severity: "info",
        source: "doctor",
        content: "Day 10 - Doing great! Full oral feeds, good weight gain (30g/day), no apnea/bradycardia. Meeting discharge criteria. Plan car seat test tomorrow, discharge teaching with parents.",
        tags: ["stable", "discharge"],
      },
    ];

    const orders: Omit<Order, "id" | "createdAt" | "updatedAt">[] = [
      {
        patientId,
        orderType: "procedure",
        status: "pending",
        priority: "routine",
        description: "Car seat tolerance test",
        orderedBy: "Dr. Lee",
        orderedByRole: "attending",
        orderedAt: hoursAgo(4),
      },
    ];

    return { observations, transfusions, labValues, phlebotomies, feedings, orders };
  },
};

// ============================================
// SCENARIO 4: Hemolysis (Too many transfusions)
// SUBTLE ISSUE: Rising direct bilirubin indicating hemolysis
// ============================================
const hemolysisScenario: PatientScenario = {
  id: "hemolysis",
  name: {
    en: "Baby Torres - Hemolysis Detection",
    es: "Bebe Torres - Deteccion de Hemolisis",
  },
  description: {
    en: "28-week preterm with multiple transfusions developing early hemolysis. Rising LDH, falling haptoglobin, rising indirect bilirubin. MILA should detect: direct bili rising (>20% of total), elevated retics.",
    es: "Prematuro de 28 semanas con multiples transfusiones desarrollando hemolisis temprana. LDH en ascenso, haptoglobina en descenso, bilirrubina indirecta en ascenso. MILA debe detectar: bili directa en ascenso (>20% del total), retics elevados.",
  },
  clinicalTeachingPoints: {
    en: [
      "Multiple transfusions increase hemolysis risk",
      "Monitor LDH (rising), haptoglobin (falling), indirect bili (rising)",
      "Direct bili >20% of total suggests hemolysis",
      "Consider alloimmunization workup",
      "May need specialized blood products (irradiated, CMV-safe)",
    ],
    es: [
      "Multiples transfusiones aumentan riesgo de hemolisis",
      "Vigilar LDH (ascenso), haptoglobina (descenso), bili indirecta (ascenso)",
      "Bili directa >20% del total sugiere hemolisis",
      "Considerar estudio de aloinmunizacion",
      "Puede necesitar productos sanguineos especializados",
    ],
  },
  patient: {
    displayName: "Baby Torres",
    birthDate: daysAgo(45),
    gestationalAgeWeeks: 28,
    birthWeightGrams: 980,
    bloodType: "O-",
    parentContacts: [
      {
        id: uuid(),
        relationship: "mother",
        name: "Elena Torres",
        phone: "+1-555-0404",
        preferredLanguage: "es",
        isPrimaryContact: true,
        canReceiveUpdates: true,
        consentForUpdates: true,
        consentAt: daysAgo(45),
      },
    ],
  },
  generateData: () => {
    const patientId = "scenario-hemolysis";

    // Labs showing hemolysis pattern over weeks
    // SUBTLE: Direct bili is 13% (1.5/11.5) - approaching 20% threshold
    const labValues: Omit<LabValue, "id" | "createdAt" | "updatedAt">[] = [
      // Week 1
      { patientId, occurredAt: daysAgo(40), labTypeId: "hgb", value: 14.0, unit: "g/dL", refRangeLow: 13, refRangeHigh: 20 },
      { patientId, occurredAt: daysAgo(40), labTypeId: "ldh", value: 450, unit: "U/L", refRangeLow: 200, refRangeHigh: 600 },
      { patientId, occurredAt: daysAgo(40), labTypeId: "hapto", value: 85, unit: "mg/dL", refRangeLow: 30, refRangeHigh: 180 },

      // Week 3 - after 2 transfusions
      { patientId, occurredAt: daysAgo(25), labTypeId: "hgb", value: 9.5, unit: "g/dL", refRangeLow: 8, refRangeHigh: 14 },
      { patientId, occurredAt: daysAgo(25), labTypeId: "ldh", value: 680, unit: "U/L", refRangeLow: 200, refRangeHigh: 600 },
      { patientId, occurredAt: daysAgo(25), labTypeId: "hapto", value: 45, unit: "mg/dL", refRangeLow: 30, refRangeHigh: 180 },
      { patientId, occurredAt: daysAgo(25), labTypeId: "tbili", value: 6.8, unit: "mg/dL", refRangeLow: 0, refRangeHigh: 12 },
      { patientId, occurredAt: daysAgo(25), labTypeId: "dbili", value: 0.8, unit: "mg/dL", refRangeLow: 0, refRangeHigh: 0.4 },

      // Week 5 - hemolysis developing
      { patientId, occurredAt: daysAgo(10), labTypeId: "hgb", value: 8.2, unit: "g/dL", refRangeLow: 8, refRangeHigh: 14 },
      { patientId, occurredAt: daysAgo(10), labTypeId: "ldh", value: 920, unit: "U/L", refRangeLow: 200, refRangeHigh: 600 },
      { patientId, occurredAt: daysAgo(10), labTypeId: "hapto", value: 22, unit: "mg/dL", refRangeLow: 30, refRangeHigh: 180 },
      { patientId, occurredAt: daysAgo(10), labTypeId: "tbili", value: 9.2, unit: "mg/dL", refRangeLow: 0, refRangeHigh: 12 },
      { patientId, occurredAt: daysAgo(10), labTypeId: "dbili", value: 1.2, unit: "mg/dL", refRangeLow: 0, refRangeHigh: 0.4 },
      { patientId, occurredAt: daysAgo(10), labTypeId: "retic", value: 8.5, unit: "%", refRangeLow: 1, refRangeHigh: 5 },

      // Today - clear hemolysis (direct bili = 1.5/11.5 = 13%)
      { patientId, occurredAt: hoursAgo(4), labTypeId: "hgb", value: 7.8, unit: "g/dL", refRangeLow: 8, refRangeHigh: 14 },
      { patientId, occurredAt: hoursAgo(4), labTypeId: "ldh", value: 1250, unit: "U/L", refRangeLow: 200, refRangeHigh: 600 },
      { patientId, occurredAt: hoursAgo(4), labTypeId: "hapto", value: 8, unit: "mg/dL", refRangeLow: 30, refRangeHigh: 180 },
      { patientId, occurredAt: hoursAgo(4), labTypeId: "tbili", value: 11.5, unit: "mg/dL", refRangeLow: 0, refRangeHigh: 12 },
      { patientId, occurredAt: hoursAgo(4), labTypeId: "dbili", value: 1.5, unit: "mg/dL", refRangeLow: 0, refRangeHigh: 0.4 },
      { patientId, occurredAt: hoursAgo(4), labTypeId: "retic", value: 12.2, unit: "%", refRangeLow: 1, refRangeHigh: 5 },
      { patientId, occurredAt: hoursAgo(4), labTypeId: "plt", value: 178000, unit: "/uL", refRangeLow: 150000, refRangeHigh: 400000 },
    ];

    // Multiple transfusions over weeks (above average for gestational age)
    const transfusions: Omit<Transfusion, "id" | "createdAt" | "updatedAt">[] = [
      { patientId, occurredAt: daysAgo(38), type: "rbc", volumeMl: 15, donorId: "RBC-001", notes: "Initial anemia", isEmergency: false, parentConsentObtained: true },
      { patientId, occurredAt: daysAgo(30), type: "rbc", volumeMl: 15, donorId: "RBC-002", notes: "Hgb 8.5", isEmergency: false, parentConsentObtained: true },
      { patientId, occurredAt: daysAgo(20), type: "rbc", volumeMl: 15, donorId: "RBC-003", notes: "Hgb 8.0", isEmergency: false, parentConsentObtained: true },
      { patientId, occurredAt: daysAgo(12), type: "rbc", volumeMl: 15, donorId: "RBC-004", notes: "Hgb 7.8", isEmergency: false, parentConsentObtained: true },
      { patientId, occurredAt: daysAgo(5), type: "rbc", volumeMl: 18, donorId: "RBC-005", notes: "Hgb 7.5, symptomatic", isEmergency: false, parentConsentObtained: true },
    ];

    // Appropriately spaced phlebotomies (weekly, not every shift)
    const phlebotomies: Omit<Phlebotomy, "id" | "createdAt" | "updatedAt">[] = [
      createPhlebotomy(patientId, daysAgo(40), "routine_labs", 1.5, "Admission labs", ["hgb", "ldh", "hapto"]),
      createPhlebotomy(patientId, daysAgo(25), "routine_labs", 1.5, "Pre-transfusion", ["hgb", "ldh", "hapto", "tbili", "dbili"]),
      createPhlebotomy(patientId, daysAgo(10), "routine_labs", 2.0, "Hemolysis workup", ["hgb", "ldh", "hapto", "tbili", "dbili", "retic"]),
      createPhlebotomy(patientId, hoursAgo(4), "routine_labs", 2.0, "Hemolysis monitoring", ["hgb", "ldh", "hapto", "tbili", "dbili", "retic", "plt"]),
    ];

    const feedings: Omit<Feeding, "id" | "createdAt" | "updatedAt">[] = [
      createFeeding(patientId, hoursAgo(3), "fortified_breast_milk", "ng_tube", 20, "tolerated"),
    ];

    const observations: Omit<Observation, "id" | "createdAt" | "updatedAt">[] = [
      {
        patientId,
        occurredAt: hoursAgo(2),
        category: "clinical",
        severity: "warning",
        source: "doctor",
        content: "HEMOLYSIS DETECTED: LDH 1250 (up), Haptoglobin 8 (down), Indirect bili rising, Retic 12%. After 5 RBC transfusions. Plan: Consult hematology, DAT, extended antibody panel, consider specialized blood products.",
        tags: ["hemolysis", "transfusion reaction", "hematology"],
      },
    ];

    const orders: Omit<Order, "id" | "createdAt" | "updatedAt">[] = [
      {
        patientId,
        orderType: "lab_draw",
        status: "pending",
        priority: "urgent",
        description: "Direct Antiglobulin Test (DAT)",
        orderedBy: "Dr. Garcia",
        orderedByRole: "attending",
        orderedAt: hoursAgo(1),
      },
      {
        patientId,
        orderType: "consultation",
        status: "pending",
        priority: "urgent",
        description: "Hematology consult for hemolysis workup",
        orderedBy: "Dr. Garcia",
        orderedByRole: "attending",
        orderedAt: hoursAgo(1),
      },
    ];

    return { observations, transfusions, labValues, phlebotomies, feedings, orders };
  },
};

// ============================================
// SCENARIO 5: Iatrogenic Anemia (Too many phlebotomies)
// SUBTLE ISSUE: Labs drawn every shift (3x/day) - excessive!
// ============================================
const iatrogenicAnemiaScenario: PatientScenario = {
  id: "iatrogenic_anemia",
  name: {
    en: "Baby Chen - Iatrogenic Anemia",
    es: "Bebe Chen - Anemia Iatrogenica",
  },
  description: {
    en: "29-week preterm with excessive blood draws causing anemia. MILA should detect: labs ordered every shift (q8h), cumulative loss >15% blood volume. Teaching point: Question necessity of each lab order.",
    es: "Prematuro de 29 semanas con extracciones excesivas causando anemia. MILA debe detectar: laboratorios ordenados cada turno (q8h), perdida acumulada >15% del volumen sanguineo. Punto de ensenanza: Cuestionar necesidad de cada orden.",
  },
  clinicalTeachingPoints: {
    en: [
      "Track cumulative phlebotomy losses",
      "Use microsampling techniques (0.3-0.5 mL vs 1-2 mL)",
      "Bundle lab draws when possible",
      "Question necessity of each lab order",
      "Consider point-of-care testing",
      "Avoid q8h or every-shift labs unless critically ill",
    ],
    es: [
      "Rastrear perdidas acumuladas por flebotomia",
      "Usar tecnicas de micromuestreo (0.3-0.5 mL vs 1-2 mL)",
      "Agrupar extracciones cuando sea posible",
      "Cuestionar necesidad de cada orden de laboratorio",
      "Considerar pruebas point-of-care",
      "Evitar laboratorios q8h o cada turno a menos que criticamente enfermo",
    ],
  },
  patient: {
    displayName: "Baby Chen",
    birthDate: daysAgo(14),
    gestationalAgeWeeks: 29,
    birthWeightGrams: 1150,
    bloodType: "AB+",
    parentContacts: [
      {
        id: uuid(),
        relationship: "mother",
        name: "Li Chen",
        phone: "+1-555-0505",
        preferredLanguage: "en",
        isPrimaryContact: true,
        canReceiveUpdates: true,
        consentForUpdates: true,
        consentAt: daysAgo(14),
      },
    ],
  },
  generateData: () => {
    const patientId = "scenario-iatrogenic";

    // Estimated blood volume: 1150g x 85 mL/kg = ~98 mL
    // 15% = 14.7 mL cumulative loss threshold

    const labValues: Omit<LabValue, "id" | "createdAt" | "updatedAt">[] = [
      // Birth - normal
      { patientId, occurredAt: daysAgo(14), labTypeId: "hgb", value: 16.0, unit: "g/dL", refRangeLow: 13, refRangeHigh: 20 },
      { patientId, occurredAt: daysAgo(14), labTypeId: "hct", value: 48, unit: "%", refRangeLow: 40, refRangeHigh: 60 },
      // Week 1 - dropping
      { patientId, occurredAt: daysAgo(7), labTypeId: "hgb", value: 11.5, unit: "g/dL", refRangeLow: 10, refRangeHigh: 18 },
      { patientId, occurredAt: daysAgo(7), labTypeId: "hct", value: 34, unit: "%", refRangeLow: 30, refRangeHigh: 55 },
      // Week 2 - concerning
      { patientId, occurredAt: daysAgo(3), labTypeId: "hgb", value: 9.0, unit: "g/dL", refRangeLow: 9, refRangeHigh: 16 },
      { patientId, occurredAt: daysAgo(3), labTypeId: "hct", value: 27, unit: "%", refRangeLow: 25, refRangeHigh: 50 },
      // Today - low
      { patientId, occurredAt: hoursAgo(2), labTypeId: "hgb", value: 7.5, unit: "g/dL", refRangeLow: 8, refRangeHigh: 14 },
      { patientId, occurredAt: hoursAgo(2), labTypeId: "hct", value: 22, unit: "%", refRangeLow: 25, refRangeHigh: 45 },
      { patientId, occurredAt: hoursAgo(2), labTypeId: "retic", value: 3.2, unit: "%", refRangeLow: 1, refRangeHigh: 5 },
      { patientId, occurredAt: hoursAgo(2), labTypeId: "plt", value: 195000, unit: "/uL", refRangeLow: 150000, refRangeHigh: 400000 },
    ];

    // EXCESSIVE phlebotomies - THE PROBLEM
    // Realistically spaced but too frequent (every shift for several days)
    // Total: ~18 mL from ~98 mL blood volume = 18.4% - way too much!
    const phlebotomies: Omit<Phlebotomy, "id" | "createdAt" | "updatedAt">[] = [
      // Day 1 - Admission (acceptable)
      createPhlebotomy(patientId, daysAgo(14), "routine_labs", 2.0, "Admission: CBC, BMP, blood gas", ["hgb", "hct", "plt", "bmp", "abg"]),

      // Days 2-4: Every shift labs! (THIS IS THE PROBLEM)
      createPhlebotomy(patientId, daysAgo(13), "blood_gas", 0.5, "Morning gas", ["abg"]),
      createPhlebotomy(patientId, daysAgo(13) + "T16:00:00.000Z", "blood_gas", 0.5, "Evening gas", ["abg"]),
      createPhlebotomy(patientId, daysAgo(12), "routine_labs", 1.5, "Daily labs per team", ["hgb", "bmp"]),
      createPhlebotomy(patientId, daysAgo(12) + "T08:00:00.000Z", "blood_gas", 0.5, "AM gas", ["abg"]),
      createPhlebotomy(patientId, daysAgo(12) + "T16:00:00.000Z", "blood_gas", 0.5, "PM gas", ["abg"]),
      createPhlebotomy(patientId, daysAgo(11), "routine_labs", 1.5, "Daily labs", ["hgb", "bmp"]),
      createPhlebotomy(patientId, daysAgo(11) + "T08:00:00.000Z", "blood_gas", 0.5, "AM gas", ["abg"]),
      createPhlebotomy(patientId, daysAgo(10), "routine_labs", 1.5, "Electrolytes per resident", ["bmp"]),
      createPhlebotomy(patientId, daysAgo(9), "routine_labs", 1.5, "CBC, BMP per team", ["hgb", "bmp"]),

      // Days 7-14: Better but still too often
      createPhlebotomy(patientId, daysAgo(7), "routine_labs", 1.5, "Weekly labs", ["hgb", "hct", "plt"]),
      createPhlebotomy(patientId, daysAgo(5), "blood_culture", 1.0, "Rule out sepsis", ["blood_culture"]),
      createPhlebotomy(patientId, daysAgo(5), "routine_labs", 1.5, "Sepsis labs", ["hgb", "wbc", "crp"]),
      createPhlebotomy(patientId, daysAgo(3), "routine_labs", 1.5, "Follow-up CBC", ["hgb", "hct"]),
      createPhlebotomy(patientId, hoursAgo(2), "routine_labs", 1.0, "Anemia evaluation", ["hgb", "hct", "retic", "plt"]),
    ];
    // Total: 2.0 + 0.5*6 + 1.5*7 + 1.0*2 = 2 + 3 + 10.5 + 2 = 17.5 mL = 17.9% of blood volume!

    // No transfusions yet - decision point
    const transfusions: Omit<Transfusion, "id" | "createdAt" | "updatedAt">[] = [];

    const feedings: Omit<Feeding, "id" | "createdAt" | "updatedAt">[] = [
      createFeeding(patientId, hoursAgo(3), "formula", "ng_tube", 22, "tolerated"),
      createFeeding(patientId, hoursAgo(6), "formula", "ng_tube", 22, "tolerated"),
    ];

    const observations: Omit<Observation, "id" | "createdAt" | "updatedAt">[] = [
      {
        patientId,
        occurredAt: hoursAgo(1),
        category: "clinical",
        severity: "warning",
        source: "doctor",
        content: "IATROGENIC ANEMIA: Cumulative phlebotomy loss ~18 mL (18% of blood volume!). Hgb dropped from 16 to 7.5 over 2 weeks. No hemolysis. Baby clinically stable. Plan: 1) STRICT lab minimization, 2) Start EPO + Iron, 3) Microsampling only, 4) Consider transfusion only if symptomatic.",
        tags: ["iatrogenic", "anemia", "phlebotomy"],
      },
    ];

    const orders: Omit<Order, "id" | "createdAt" | "updatedAt">[] = [
      {
        patientId,
        orderType: "medication",
        status: "pending",
        priority: "routine",
        description: "EPO 400 U/kg SC 3x/week + Iron 6 mg/kg/day",
        details: "Start EPO therapy. STRICT phlebotomy minimization protocol - NO daily labs unless clinically indicated.",
        orderedBy: "Dr. Wong",
        orderedByRole: "attending",
        orderedAt: hoursAgo(1),
      },
    ];

    return { observations, transfusions, labValues, phlebotomies, feedings, orders };
  },
};

// ============================================
// SCENARIO 6: Feeding Intolerance (NEC concern)
// ============================================
const feedingIntoleranceScenario: PatientScenario = {
  id: "feeding_intolerance",
  name: {
    en: "Baby Okafor - Feeding Intolerance",
    es: "Bebe Okafor - Intolerancia Alimentaria",
  },
  description: {
    en: "27-week preterm with feeding intolerance, bilious residuals, mild abdominal distension. NEC workup in progress. Teaching point: Early recognition of feeding intolerance can prevent NEC progression.",
    es: "Prematuro de 27 semanas con intolerancia alimentaria, residuos biliosos, distension abdominal leve. Estudio de NEC en progreso.",
  },
  clinicalTeachingPoints: {
    en: [
      "Bilious residuals are concerning - hold feeds",
      "Abdominal distension + feeding intolerance = NEC workup",
      "Get KUB, labs (CBC with diff, CRP, blood culture)",
      "NPO with TPN while evaluating",
      "Early NEC caught early has better outcomes",
    ],
    es: [
      "Residuos biliosos son preocupantes - suspender alimentacion",
      "Distension abdominal + intolerancia = estudio de NEC",
      "Obtener Rx abdomen, laboratorios (CBC con diferencial, PCR, hemocultivo)",
      "NPO con NPT mientras se evalua",
      "NEC detectado temprano tiene mejores resultados",
    ],
  },
  patient: {
    displayName: "Baby Okafor",
    birthDate: daysAgo(18),
    gestationalAgeWeeks: 27,
    birthWeightGrams: 890,
    bloodType: "O+",
    parentContacts: [
      {
        id: uuid(),
        relationship: "mother",
        name: "Amara Okafor",
        phone: "+1-555-0606",
        preferredLanguage: "en",
        isPrimaryContact: true,
        canReceiveUpdates: true,
        consentForUpdates: true,
        consentAt: daysAgo(18),
      },
    ],
  },
  generateData: () => {
    const patientId = "scenario-feeding";

    const labValues: Omit<LabValue, "id" | "createdAt" | "updatedAt">[] = [
      // Today - NEC workup labs
      { patientId, occurredAt: hoursAgo(2), labTypeId: "wbc", value: 18.5, unit: "K/uL", refRangeLow: 5, refRangeHigh: 20 },
      { patientId, occurredAt: hoursAgo(2), labTypeId: "plt", value: 165000, unit: "/uL", refRangeLow: 150000, refRangeHigh: 400000 },
      { patientId, occurredAt: hoursAgo(2), labTypeId: "crp", value: 28, unit: "mg/L", refRangeLow: 0, refRangeHigh: 10 },
      { patientId, occurredAt: hoursAgo(2), labTypeId: "hgb", value: 12.5, unit: "g/dL", refRangeLow: 10, refRangeHigh: 18 },
      // Previous (normal baseline)
      { patientId, occurredAt: daysAgo(7), labTypeId: "wbc", value: 10.2, unit: "K/uL", refRangeLow: 5, refRangeHigh: 20 },
      { patientId, occurredAt: daysAgo(7), labTypeId: "plt", value: 210000, unit: "/uL", refRangeLow: 150000, refRangeHigh: 400000 },
      { patientId, occurredAt: daysAgo(7), labTypeId: "crp", value: 3, unit: "mg/L", refRangeLow: 0, refRangeHigh: 10 },
    ];

    const phlebotomies: Omit<Phlebotomy, "id" | "createdAt" | "updatedAt">[] = [
      createPhlebotomy(patientId, hoursAgo(2), "blood_culture", 1.0, "NEC workup", ["blood_culture"]),
      createPhlebotomy(patientId, hoursAgo(2), "routine_labs", 1.5, "NEC labs", ["wbc", "plt", "crp", "hgb"]),
    ];

    const transfusions: Omit<Transfusion, "id" | "createdAt" | "updatedAt">[] = [];

    // Feeding history showing progressive intolerance
    const feedings: Omit<Feeding, "id" | "createdAt" | "updatedAt">[] = [
      // Recent - showing intolerance (spaced 3 hours apart)
      createFeeding(patientId, hoursAgo(3), "breast_milk", "ng_tube", 12, "not_tolerated", { residualMl: 8, notes: "Bilious residuals, held feed" }),
      createFeeding(patientId, hoursAgo(6), "breast_milk", "ng_tube", 12, "partial", { residualMl: 5, notes: "Large milky residual" }),
      createFeeding(patientId, hoursAgo(9), "breast_milk", "ng_tube", 12, "partial", { residualMl: 3, notes: "Small residual" }),
      createFeeding(patientId, hoursAgo(12), "breast_milk", "ng_tube", 12, "tolerated"),
      // Before - tolerating
      createFeeding(patientId, daysAgo(1), "breast_milk", "ng_tube", 12, "tolerated"),
      createFeeding(patientId, daysAgo(2), "breast_milk", "ng_tube", 10, "tolerated"),
    ];

    const observations: Omit<Observation, "id" | "createdAt" | "updatedAt">[] = [
      {
        patientId,
        occurredAt: hoursAgo(1),
        category: "clinical",
        severity: "warning",
        source: "doctor",
        content: "FEEDING INTOLERANCE - NEC CONCERN: Bilious residuals x2, mild abdominal distension, increased apnea events. CRP elevated to 28. Plan: NPO, TPN, KUB (done - no pneumatosis seen), blood culture obtained, close monitoring. Will start antibiotics if clinical worsening.",
        tags: ["NEC", "feeding intolerance", "workup"],
      },
      {
        patientId,
        occurredAt: hoursAgo(3),
        category: "nursing",
        severity: "warning",
        source: "nurse",
        content: "Bilious residual 8ml (previous feed was 12ml). Abdomen mildly distended, soft. Baby having more apnea episodes than usual. Notified physician.",
        tags: ["residuals", "bilious", "distension"],
      },
    ];

    const orders: Omit<Order, "id" | "createdAt" | "updatedAt">[] = [
      {
        patientId,
        orderType: "procedure",
        status: "completed",
        priority: "stat",
        description: "KUB (Abdominal X-ray)",
        orderedBy: "Dr. Adams",
        orderedByRole: "attending",
        orderedAt: hoursAgo(2),
        completedAt: hoursAgo(1),
      },
      {
        patientId,
        orderType: "other",
        status: "in_progress",
        priority: "routine",
        description: "NPO - Hold all enteral feeds",
        orderedBy: "Dr. Adams",
        orderedByRole: "attending",
        orderedAt: hoursAgo(2),
      },
    ];

    return { observations, transfusions, labValues, phlebotomies, feedings, orders };
  },
};

// ============================================
// SCENARIO 7: Hyperbilirubinemia (Jaundice)
// ============================================
const hyperbilirubinemiaScenario: PatientScenario = {
  id: "hyperbilirubinemia",
  name: {
    en: "Baby Patel - Rising Bilirubin",
    es: "Bebe Patel - Bilirrubina en Ascenso",
  },
  description: {
    en: "35-week late preterm with rising bilirubin approaching phototherapy threshold. ABO incompatibility.",
    es: "Prematuro tardio de 35 semanas con bilirrubina en ascenso acercandose al umbral de fototerapia. Incompatibilidad ABO.",
  },
  clinicalTeachingPoints: {
    en: [
      "Use AAP phototherapy nomogram for gestational age",
      "Check for hemolysis (DAT, retics, smear)",
      "Rate of rise matters - >0.5 mg/dL/hour is concerning",
      "Ensure adequate hydration and feeding",
      "Early phototherapy prevents exchange transfusion",
    ],
    es: [
      "Usar nomograma de fototerapia AAP para edad gestacional",
      "Verificar hemolisis (DAT, reticulocitos, frotis)",
      "La velocidad de ascenso importa - >0.5 mg/dL/hora es preocupante",
      "Asegurar hidratacion y alimentacion adecuada",
      "Fototerapia temprana previene exanguinotransfusion",
    ],
  },
  patient: {
    displayName: "Baby Patel",
    birthDate: daysAgo(3),
    gestationalAgeWeeks: 35,
    birthWeightGrams: 2450,
    bloodType: "A+",
    parentContacts: [
      {
        id: uuid(),
        relationship: "mother",
        name: "Priya Patel",
        phone: "+1-555-0707",
        preferredLanguage: "en",
        isPrimaryContact: true,
        canReceiveUpdates: true,
        consentForUpdates: true,
        consentAt: daysAgo(3),
      },
    ],
  },
  generateData: () => {
    const patientId = "scenario-jaundice";

    const labValues: Omit<LabValue, "id" | "createdAt" | "updatedAt">[] = [
      // Day 1
      { patientId, occurredAt: daysAgo(2), labTypeId: "tbili", value: 6.5, unit: "mg/dL", refRangeLow: 0, refRangeHigh: 10 },
      { patientId, occurredAt: daysAgo(2), labTypeId: "dbili", value: 0.3, unit: "mg/dL", refRangeLow: 0, refRangeHigh: 0.4 },
      // Day 2
      { patientId, occurredAt: daysAgo(1), labTypeId: "tbili", value: 11.2, unit: "mg/dL", refRangeLow: 0, refRangeHigh: 13 },
      { patientId, occurredAt: daysAgo(1), labTypeId: "dbili", value: 0.4, unit: "mg/dL", refRangeLow: 0, refRangeHigh: 0.4 },
      { patientId, occurredAt: daysAgo(1), labTypeId: "retic", value: 5.5, unit: "%", refRangeLow: 1, refRangeHigh: 5 },
      // Day 3 (today)
      { patientId, occurredAt: hoursAgo(6), labTypeId: "tbili", value: 14.8, unit: "mg/dL", refRangeLow: 0, refRangeHigh: 15 },
      { patientId, occurredAt: hoursAgo(6), labTypeId: "dbili", value: 0.5, unit: "mg/dL", refRangeLow: 0, refRangeHigh: 0.4 },
      { patientId, occurredAt: hoursAgo(2), labTypeId: "tbili", value: 16.2, unit: "mg/dL", refRangeLow: 0, refRangeHigh: 15 },
      // Other labs
      { patientId, occurredAt: daysAgo(3), labTypeId: "hgb", value: 17.5, unit: "g/dL", refRangeLow: 14, refRangeHigh: 22 },
      { patientId, occurredAt: hoursAgo(6), labTypeId: "hgb", value: 16.2, unit: "g/dL", refRangeLow: 14, refRangeHigh: 22 },
    ];

    const phlebotomies: Omit<Phlebotomy, "id" | "createdAt" | "updatedAt">[] = [
      createPhlebotomy(patientId, daysAgo(2), "routine_labs", 0.5, "Bilirubin day 1", ["tbili", "dbili"]),
      createPhlebotomy(patientId, daysAgo(1), "routine_labs", 1.0, "Bili + DAT day 2", ["tbili", "dbili", "retic"]),
      createPhlebotomy(patientId, hoursAgo(6), "routine_labs", 0.5, "Bili check", ["tbili", "dbili"]),
      createPhlebotomy(patientId, hoursAgo(2), "routine_labs", 0.5, "Bili recheck", ["tbili"]),
    ];

    const transfusions: Omit<Transfusion, "id" | "createdAt" | "updatedAt">[] = [];

    const feedings: Omit<Feeding, "id" | "createdAt" | "updatedAt">[] = [
      createFeeding(patientId, hoursAgo(2), "breast_milk", "oral", 50, "tolerated"),
      createFeeding(patientId, hoursAgo(5), "breast_milk", "oral", 45, "tolerated"),
    ];

    const observations: Omit<Observation, "id" | "createdAt" | "updatedAt">[] = [
      {
        patientId,
        occurredAt: hoursAgo(1),
        category: "clinical",
        severity: "warning",
        source: "doctor",
        content: "HYPERBILIRUBINEMIA: Tbili 16.2 mg/dL at 72h of life - ABOVE phototherapy threshold for 35-week infant. DAT positive (ABO incompatibility, mother O+, baby A+). Rate of rise 0.4 mg/dL/hour. Started intensive phototherapy. Recheck bili in 4-6 hours. Encourage frequent feeds for hydration.",
        tags: ["jaundice", "phototherapy", "ABO"],
      },
    ];

    const orders: Omit<Order, "id" | "createdAt" | "updatedAt">[] = [
      {
        patientId,
        orderType: "procedure",
        status: "in_progress",
        priority: "urgent",
        description: "Intensive phototherapy (double lights)",
        orderedBy: "Dr. Singh",
        orderedByRole: "attending",
        orderedAt: hoursAgo(1),
      },
    ];

    return { observations, transfusions, labValues, phlebotomies, feedings, orders };
  },
};

// ============================================
// SCENARIO 8: Thrombocytopenia
// ============================================
const thrombocytopeniaScenario: PatientScenario = {
  id: "thrombocytopenia",
  name: {
    en: "Baby Rivera - Severe Thrombocytopenia",
    es: "Bebe Rivera - Trombocitopenia Severa",
  },
  description: {
    en: "31-week preterm with platelets <20K, petechiae noted. NAIT suspected. Teaching point: Per PlaNeT-2 trial, transfuse at <25K in stable neonates.",
    es: "Prematuro de 31 semanas con plaquetas <20K, petequias observadas. Sospecha de NAIT.",
  },
  clinicalTeachingPoints: {
    en: [
      "PlaNeT-2: Transfuse at <25K (not <50K) in stable neonates",
      "Higher thresholds only for active bleeding or procedures",
      "Investigate cause: sepsis, NEC, DIC, NAIT, drug-induced",
      "NAIT requires HPA-typed platelets if confirmed",
      "Monitor for IVH in premature infants with low platelets",
    ],
    es: [
      "PlaNeT-2: Transfundir en <25K (no <50K) en neonatos estables",
      "Umbrales mayores solo para sangrado activo o procedimientos",
      "Investigar causa: sepsis, NEC, CID, NAIT, inducida por medicamentos",
      "NAIT requiere plaquetas HPA-tipificadas si confirmado",
      "Vigilar HIV en prematuros con plaquetas bajas",
    ],
  },
  patient: {
    displayName: "Baby Rivera",
    birthDate: daysAgo(7),
    gestationalAgeWeeks: 31,
    birthWeightGrams: 1420,
    bloodType: "B+",
    parentContacts: [
      {
        id: uuid(),
        relationship: "mother",
        name: "Sofia Rivera",
        phone: "+1-555-0808",
        preferredLanguage: "es",
        isPrimaryContact: true,
        canReceiveUpdates: true,
        consentForUpdates: true,
        consentAt: daysAgo(7),
      },
    ],
  },
  generateData: () => {
    const patientId = "scenario-plt";

    const labValues: Omit<LabValue, "id" | "createdAt" | "updatedAt">[] = [
      // Birth - normal
      { patientId, occurredAt: daysAgo(7), labTypeId: "plt", value: 185000, unit: "/uL", refRangeLow: 150000, refRangeHigh: 400000 },
      { patientId, occurredAt: daysAgo(7), labTypeId: "hgb", value: 15.5, unit: "g/dL", refRangeLow: 13, refRangeHigh: 20 },
      // Day 3 - dropping
      { patientId, occurredAt: daysAgo(4), labTypeId: "plt", value: 85000, unit: "/uL", refRangeLow: 150000, refRangeHigh: 400000 },
      // Day 5 - severe
      { patientId, occurredAt: daysAgo(2), labTypeId: "plt", value: 32000, unit: "/uL", refRangeLow: 150000, refRangeHigh: 400000 },
      // Today - critical
      { patientId, occurredAt: hoursAgo(4), labTypeId: "plt", value: 18000, unit: "/uL", refRangeLow: 150000, refRangeHigh: 400000 },
      { patientId, occurredAt: hoursAgo(4), labTypeId: "hgb", value: 14.8, unit: "g/dL", refRangeLow: 12, refRangeHigh: 18 },
      { patientId, occurredAt: hoursAgo(4), labTypeId: "wbc", value: 9.5, unit: "K/uL", refRangeLow: 5, refRangeHigh: 20 },
      { patientId, occurredAt: hoursAgo(4), labTypeId: "crp", value: 2, unit: "mg/L", refRangeLow: 0, refRangeHigh: 10 },
    ];

    const phlebotomies: Omit<Phlebotomy, "id" | "createdAt" | "updatedAt">[] = [
      createPhlebotomy(patientId, daysAgo(7), "routine_labs", 1.0, "Admission", ["plt", "hgb"]),
      createPhlebotomy(patientId, daysAgo(4), "routine_labs", 1.0, "Platelet drop noted", ["plt"]),
      createPhlebotomy(patientId, daysAgo(2), "routine_labs", 1.5, "Thrombocytopenia workup", ["plt", "wbc", "crp"]),
      createPhlebotomy(patientId, hoursAgo(4), "routine_labs", 1.0, "Pre-transfusion", ["plt", "hgb", "wbc", "crp"]),
    ];

    const transfusions: Omit<Transfusion, "id" | "createdAt" | "updatedAt">[] = [];

    const feedings: Omit<Feeding, "id" | "createdAt" | "updatedAt">[] = [
      createFeeding(patientId, hoursAgo(3), "breast_milk", "ng_tube", 20, "tolerated"),
    ];

    const observations: Omit<Observation, "id" | "createdAt" | "updatedAt">[] = [
      {
        patientId,
        occurredAt: hoursAgo(2),
        category: "clinical",
        severity: "critical",
        source: "doctor",
        content: "SEVERE THROMBOCYTOPENIA: PLT 18K, petechiae on trunk. No active bleeding. Sepsis workup negative. NAIT suspected - maternal antiplatelet antibody panel sent. Per PlaNeT-2: Transfusing platelets now (threshold <25K). Head ultrasound ordered to rule out IVH.",
        tags: ["thrombocytopenia", "NAIT", "transfusion"],
      },
    ];

    const orders: Omit<Order, "id" | "createdAt" | "updatedAt">[] = [
      {
        patientId,
        orderType: "transfusion_platelet",
        status: "pending",
        priority: "urgent",
        description: "Platelet transfusion 10-15 mL/kg",
        details: "PLT 18K with petechiae. Transfuse per PlaNeT-2 guidelines.",
        orderedBy: "Dr. Hernandez",
        orderedByRole: "attending",
        orderedAt: hoursAgo(1),
      },
    ];

    return { observations, transfusions, labValues, phlebotomies, feedings, orders };
  },
};

// ============================================
// SCENARIO 9: Sepsis Workup
// ============================================
const sepsisWorkupScenario: PatientScenario = {
  id: "sepsis_workup",
  name: {
    en: "Baby Williams - Sepsis Concern",
    es: "Bebe Williams - Sospecha de Sepsis",
  },
  description: {
    en: "33-week preterm with temperature instability, increased apnea, lethargy. Labs pending.",
    es: "Prematuro de 33 semanas con inestabilidad de temperatura, aumento de apneas, letargia.",
  },
  clinicalTeachingPoints: {
    en: [
      "Preterms may not mount typical fever - temp instability is concerning",
      "Increased apnea/bradycardia can be early sepsis sign",
      "Start antibiotics within 1 hour of suspicion",
      "Ampicillin + Gentamicin for early-onset sepsis",
      "Complete sepsis workup: blood culture, CBC, CRP, consider LP",
    ],
    es: [
      "Prematuros pueden no tener fiebre tipica - inestabilidad de temp es preocupante",
      "Aumento de apnea/bradicardia puede ser signo temprano de sepsis",
      "Iniciar antibioticos dentro de 1 hora de la sospecha",
      "Ampicilina + Gentamicina para sepsis temprana",
      "Estudio completo: hemocultivo, CBC, PCR, considerar PL",
    ],
  },
  patient: {
    displayName: "Baby Williams",
    birthDate: daysAgo(5),
    gestationalAgeWeeks: 33,
    birthWeightGrams: 1850,
    bloodType: "O+",
    parentContacts: [
      {
        id: uuid(),
        relationship: "father",
        name: "James Williams",
        phone: "+1-555-0909",
        preferredLanguage: "en",
        isPrimaryContact: true,
        canReceiveUpdates: true,
        consentForUpdates: true,
        consentAt: daysAgo(5),
      },
    ],
  },
  generateData: () => {
    const patientId = "scenario-sepsis";

    const labValues: Omit<LabValue, "id" | "createdAt" | "updatedAt">[] = [
      // Previous (normal baseline)
      { patientId, occurredAt: daysAgo(5), labTypeId: "wbc", value: 11.5, unit: "K/uL", refRangeLow: 5, refRangeHigh: 20 },
      { patientId, occurredAt: daysAgo(5), labTypeId: "plt", value: 225000, unit: "/uL", refRangeLow: 150000, refRangeHigh: 400000 },
      { patientId, occurredAt: daysAgo(5), labTypeId: "hgb", value: 16.2, unit: "g/dL", refRangeLow: 13, refRangeHigh: 20 },
      // Today - concerning
      { patientId, occurredAt: hoursAgo(1), labTypeId: "wbc", value: 3.8, unit: "K/uL", refRangeLow: 5, refRangeHigh: 20 },
      { patientId, occurredAt: hoursAgo(1), labTypeId: "plt", value: 142000, unit: "/uL", refRangeLow: 150000, refRangeHigh: 400000 },
      { patientId, occurredAt: hoursAgo(1), labTypeId: "crp", value: 45, unit: "mg/L", refRangeLow: 0, refRangeHigh: 10 },
    ];

    const phlebotomies: Omit<Phlebotomy, "id" | "createdAt" | "updatedAt">[] = [
      createPhlebotomy(patientId, daysAgo(5), "routine_labs", 1.0, "Admission", ["wbc", "plt", "hgb"]),
      createPhlebotomy(patientId, hoursAgo(1), "blood_culture", 1.0, "Sepsis workup", ["blood_culture"]),
      createPhlebotomy(patientId, hoursAgo(1), "routine_labs", 1.5, "Sepsis labs", ["wbc", "plt", "crp"]),
    ];

    const transfusions: Omit<Transfusion, "id" | "createdAt" | "updatedAt">[] = [];

    const feedings: Omit<Feeding, "id" | "createdAt" | "updatedAt">[] = [
      createFeeding(patientId, hoursAgo(3), "breast_milk", "ng_tube", 25, "partial", { notes: "Less interested in feeding" }),
    ];

    const observations: Omit<Observation, "id" | "createdAt" | "updatedAt">[] = [
      {
        patientId,
        occurredAt: hoursAgo(0.5),
        category: "clinical",
        severity: "critical",
        source: "doctor",
        content: "SEPSIS CONCERN: Temperature instability (36.2-37.8C), increased apnea (6 events in 8 hours vs baseline 1-2), lethargy, poor feeding. Labs: WBC 3.8 (low), CRP 45 (elevated), PLT trending down. Blood culture obtained. Started Ampicillin 100mg/kg + Gentamicin 4mg/kg. NPO for now.",
        tags: ["sepsis", "critical", "antibiotics"],
      },
    ];

    const orders: Omit<Order, "id" | "createdAt" | "updatedAt">[] = [
      {
        patientId,
        orderType: "medication",
        status: "in_progress",
        priority: "stat",
        description: "Ampicillin 100 mg/kg IV q12h",
        orderedBy: "Dr. Brown",
        orderedByRole: "attending",
        orderedAt: hoursAgo(0.5),
      },
      {
        patientId,
        orderType: "medication",
        status: "in_progress",
        priority: "stat",
        description: "Gentamicin 4 mg/kg IV q24h",
        orderedBy: "Dr. Brown",
        orderedByRole: "attending",
        orderedAt: hoursAgo(0.5),
      },
    ];

    return { observations, transfusions, labValues, phlebotomies, feedings, orders };
  },
};

// ============================================
// SCENARIO 10: Success Story (Ready for discharge)
// ============================================
const successStoryScenario: PatientScenario = {
  id: "success_story",
  name: {
    en: "Baby Anderson - Success Story",
    es: "Bebe Anderson - Historia de Exito",
  },
  description: {
    en: "26-week preterm now 38 weeks corrected, had rocky course but now thriving. Full oral feeds, stable vitals, ready for discharge.",
    es: "Prematuro de 26 semanas, ahora 38 semanas corregidas, tuvo un curso dificil pero ahora prospera. Alimentacion oral completa, signos vitales estables, listo para alta.",
  },
  clinicalTeachingPoints: {
    en: [
      "Celebrate the wins - NICU journeys are marathons",
      "Discharge criteria: stable temp, full oral feeds, no apnea, gaining weight",
      "Car seat tolerance test before discharge",
      "Ensure family education and follow-up appointments scheduled",
      "Connect with early intervention services",
    ],
    es: [
      "Celebrar los logros - las estancias en UCIN son maratones",
      "Criterios de alta: temp estable, alimentacion oral completa, sin apneas, ganando peso",
      "Prueba de tolerancia en silla de auto antes del alta",
      "Asegurar educacion familiar y citas de seguimiento",
      "Conectar con servicios de intervencion temprana",
    ],
  },
  patient: {
    displayName: "Baby Anderson",
    birthDate: daysAgo(84), // 12 weeks = 84 days
    gestationalAgeWeeks: 26,
    birthWeightGrams: 720,
    bloodType: "A+",
    parentContacts: [
      {
        id: uuid(),
        relationship: "mother",
        name: "Sarah Anderson",
        phone: "+1-555-1010",
        email: "sarah.anderson@email.com",
        preferredLanguage: "en",
        isPrimaryContact: true,
        canReceiveUpdates: true,
        consentForUpdates: true,
        consentAt: daysAgo(84),
      },
    ],
  },
  generateData: () => {
    const patientId = "scenario-success";

    // Current excellent labs
    const labValues: Omit<LabValue, "id" | "createdAt" | "updatedAt">[] = [
      { patientId, occurredAt: daysAgo(7), labTypeId: "hgb", value: 11.2, unit: "g/dL", refRangeLow: 10, refRangeHigh: 16 },
      { patientId, occurredAt: daysAgo(7), labTypeId: "hct", value: 33, unit: "%", refRangeLow: 30, refRangeHigh: 50 },
      { patientId, occurredAt: daysAgo(7), labTypeId: "retic", value: 4.5, unit: "%", refRangeLow: 1, refRangeHigh: 5 },
      { patientId, occurredAt: daysAgo(7), labTypeId: "plt", value: 285000, unit: "/uL", refRangeLow: 150000, refRangeHigh: 400000 },
    ];

    // Past transfusions (historical - appropriate for course)
    const transfusions: Omit<Transfusion, "id" | "createdAt" | "updatedAt">[] = [
      { patientId, occurredAt: daysAgo(75), type: "rbc", volumeMl: 12, donorId: "RBC-A01", notes: "Anemia of prematurity", isEmergency: false, parentConsentObtained: true },
      { patientId, occurredAt: daysAgo(55), type: "rbc", volumeMl: 15, donorId: "RBC-A02", notes: "Hgb 7.2", isEmergency: false, parentConsentObtained: true },
    ];

    // Minimal recent phlebotomies
    const phlebotomies: Omit<Phlebotomy, "id" | "createdAt" | "updatedAt">[] = [
      createPhlebotomy(patientId, daysAgo(7), "routine_labs", 0.5, "Pre-discharge labs", ["hgb", "hct", "retic", "plt"]),
    ];

    // Excellent feeding - every 3 hours
    const feedings: Omit<Feeding, "id" | "createdAt" | "updatedAt">[] = [
      createFeeding(patientId, hoursAgo(3), "fortified_breast_milk", "oral", 65, "tolerated"),
      createFeeding(patientId, hoursAgo(6), "fortified_breast_milk", "oral", 60, "tolerated"),
      createFeeding(patientId, hoursAgo(9), "fortified_breast_milk", "oral", 65, "tolerated"),
      createFeeding(patientId, hoursAgo(12), "fortified_breast_milk", "oral", 60, "tolerated"),
    ];

    const observations: Omit<Observation, "id" | "createdAt" | "updatedAt">[] = [
      {
        patientId,
        occurredAt: hoursAgo(4),
        category: "clinical",
        severity: "info",
        source: "doctor",
        content: "DISCHARGE DAY! After 84 days in NICU, Baby Anderson is ready to go home! Current weight 2.8 kg (up from 720g at birth). Full oral feeds 60-65 mL q3h. No apnea/bradycardia x7 days. Maintaining temp in open crib. Car seat test passed. Parents completed CPR training and safe sleep education.",
        tags: ["discharge", "success", "milestone"],
      },
    ];

    const orders: Omit<Order, "id" | "createdAt" | "updatedAt">[] = [
      {
        patientId,
        orderType: "procedure",
        status: "completed",
        priority: "routine",
        description: "Car seat tolerance test",
        orderedBy: "Dr. Park",
        orderedByRole: "attending",
        orderedAt: daysAgo(1),
        completedAt: hoursAgo(20),
      },
    ];

    return { observations, transfusions, labValues, phlebotomies, feedings, orders };
  },
};

// ============================================
// Export all scenarios
// ============================================
export const patientScenarios: Record<ScenarioId, PatientScenario> = {
  declining_hgb: decliningHgbScenario,
  recovering: recoveringScenario,
  stable: stableScenario,
  hemolysis: hemolysisScenario,
  iatrogenic_anemia: iatrogenicAnemiaScenario,
  feeding_intolerance: feedingIntoleranceScenario,
  hyperbilirubinemia: hyperbilirubinemiaScenario,
  thrombocytopenia: thrombocytopeniaScenario,
  sepsis_workup: sepsisWorkupScenario,
  success_story: successStoryScenario,
};

export const scenarioList: ScenarioId[] = [
  "declining_hgb",
  "recovering",
  "stable",
  "hemolysis",
  "iatrogenic_anemia",
  "feeding_intolerance",
  "hyperbilirubinemia",
  "thrombocytopenia",
  "sepsis_workup",
  "success_story",
];

export function getScenario(id: ScenarioId): PatientScenario {
  return patientScenarios[id];
}

export function getDefaultScenario(): PatientScenario {
  return patientScenarios.stable;
}
