/**
 * Demo Data Generator
 *
 * Creates realistic mock data for a neonatal patient.
 * Used for MVP development and testing.
 */

import {
  PatientRepository,
  ObservationRepository,
  TransfusionRepository,
  LabValueRepository,
  AlertRepository,
  PhlebotomyRepository,
  FeedingRepository,
  OrderRepository,
} from "../db/repositories";
import type {
  CreateObservation,
  CreateTransfusion,
  CreateLabValue,
  CreateAlert,
  CreatePhlebotomy,
  CreateFeeding,
  CreateOrder,
  ObservationSource,
  ObservationCategory,
  Severity,
  TransfusionType,
  AlertType,
  PhlebotomyType,
  FeedingType,
  FeedingRoute,
  FeedingTolerance,
  OrderType,
  StaffRole,
} from "../types/domain";
import { generateDonorId } from "../utils/ids";
import { LAB_TYPES, getLabType } from "./lab-types";

/**
 * Generate a random date within a range
 */
function randomDateInRange(daysBack: number, daysForward: number = 0): string {
  const now = Date.now();
  const start = now - daysBack * 24 * 60 * 60 * 1000;
  const end = now + daysForward * 24 * 60 * 60 * 1000;
  const timestamp = start + Math.random() * (end - start);
  return new Date(timestamp).toISOString();
}

/**
 * Generate random value with gaussian distribution
 */
function gaussianRandom(mean: number, stdDev: number): number {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * stdDev;
}

/**
 * Pick a random item from an array
 */
function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate demo observations
 */
function generateObservations(patientId: string): CreateObservation[] {
  const observations: CreateObservation[] = [];

  const contents = [
    { category: "clinical" as const, content: "Control de peso: 1920g (+70g desde ayer)", severity: "info" as const },
    { category: "clinical" as const, content: "Perímetro cefálico: 28.5cm, trayectoria de crecimiento estable", severity: "info" as const },
    { category: "clinical" as const, content: "Episodio leve de desaturación durante alimentación, se resolvió solo", severity: "warning" as const },
    { category: "clinical" as const, content: "Apnea del prematuro - 3 episodios en las últimas 12h requiriendo estimulación", severity: "warning" as const },
    { category: "clinical" as const, content: "Ictericia mejorando, bilirrubina en descenso", severity: "info" as const },
    { category: "nursing" as const, content: "Tolerando alimentación completa por sonda NG, 42ml c/3h", severity: "info" as const },
    { category: "nursing" as const, content: "Cambio de apósito de línea central, sitio limpio sin eritema", severity: "info" as const },
    { category: "nursing" as const, content: "Se nota aumento del trabajo respiratorio, médico informado", severity: "warning" as const },
    { category: "nursing" as const, content: "Cuidado piel a piel con mamá por 2 horas", severity: "info" as const },
    { category: "nursing" as const, content: "Vitamina K administrada IM muslo derecho", severity: "info" as const },
    { category: "procedure" as const, content: "Colocación de línea PICC exitosa, punta confirmada en T8", severity: "info" as const },
    { category: "procedure" as const, content: "Transfusión sanguínea completada sin reacción", severity: "info" as const },
    { category: "procedure" as const, content: "Punción lumbar realizada - LCR claro", severity: "info" as const },
    { category: "procedure" as const, content: "Intubación para administración de surfactante", severity: "warning" as const },
    { category: "event" as const, content: "Papás visitaron, actualizados sobre plan de cuidado", severity: "info" as const },
    { category: "event" as const, content: "Consulta de lactancia completada", severity: "info" as const },
    { category: "event" as const, content: "Consulta de oftalmología - tamizaje ROP normal", severity: "info" as const },
    { category: "event" as const, content: "Extubación fallida, reintubado", severity: "critical" as const },
    { category: "event" as const, content: "Sospecha de sepsis, estudios iniciados", severity: "critical" as const },
    { category: "clinical" as const, content: "Hemocultivo negativo a las 48h", severity: "info" as const },
  ];

  const staffBySource: Record<ObservationSource, string[]> = {
    nurse: ["Enf. María García", "Enf. Ana Rodríguez", "Enf. Carmen López", "Enf. Laura Martínez"],
    doctor: ["Dr. Carlos Pérez", "Dra. Elena Sánchez", "Dr. Juan Restrepo", "Dra. Sofia Vargas"],
    parent: ["Mamá", "Papá"],
    monitor: ["Monitor automático"],
    system: ["Sistema MILA"],
  };

  const sources: ObservationSource[] = ["nurse", "doctor", "nurse", "nurse", "doctor"];

  // Generate 40 observations over 30 days
  for (let i = 0; i < 40; i++) {
    const item = randomPick(contents);
    const source = randomPick(sources);
    observations.push({
      patientId,
      occurredAt: randomDateInRange(30),
      category: item.category,
      severity: item.severity,
      source,
      sourceName: randomPick(staffBySource[source]),
      content: item.content,
      tags: [],
    });
  }

  return observations;
}

/**
 * Generate demo transfusions over 30 days
 * Typical preterm may need 3-5 RBC transfusions in first month
 */
function generateTransfusions(patientId: string): CreateTransfusion[] {
  const transfusions: CreateTransfusion[] = [];

  // Realistic transfusion schedule for a 32-week preterm over 30 days
  const transfusionSchedule: Array<{
    day: number;
    type: TransfusionType;
    volumeRange: [number, number];
    notes: string;
    isEmergency?: boolean;
  }> = [
    // Week 1: More frequent due to phlebotomy losses and initial instability
    { day: 3, type: "rbc", volumeRange: [18, 22], notes: "Glóbulos rojos empacados - hematocrito inicial bajo (35%)" },
    { day: 5, type: "platelet", volumeRange: [12, 18], notes: "Plaquetas por trombocitopenia (18,000)" },
    // Week 2: Stabilizing but still anemic
    { day: 10, type: "rbc", volumeRange: [18, 22], notes: "Transfusión RBC - Hgb 8.2 g/dL con aumento de requerimiento O2" },
    { day: 12, type: "plasma", volumeRange: [10, 15], notes: "PFC por coagulopatía durante sepsis tardía", isEmergency: true },
    // Week 3: Typical anemia of prematurity
    { day: 18, type: "rbc", volumeRange: [18, 22], notes: "Anemia del prematuro - Hgb 7.5 g/dL, sintomático" },
    // Week 4: May need another if significant phlebotomy
    { day: 25, type: "rbc", volumeRange: [18, 22], notes: "Transfusión RBC - Hgb 7.0 g/dL, pobre ganancia de peso" },
    { day: 28, type: "platelet", volumeRange: [12, 18], notes: "Plaquetas profilácticas pre-PL (22,000)" },
  ];

  // Use limited donor pool (dedicated donor program simulation)
  const donorPool = [generateDonorId(), generateDonorId(), generateDonorId()];

  for (const schedule of transfusionSchedule) {
    const volume = Math.round(
      schedule.volumeRange[0] + Math.random() * (schedule.volumeRange[1] - schedule.volumeRange[0])
    );
    const isEmergency = schedule.isEmergency ?? false;

    // Calculate exact date
    const transfusionDate = new Date(Date.now() - (30 - schedule.day) * 24 * 60 * 60 * 1000);
    transfusionDate.setHours(8 + Math.floor(Math.random() * 10));
    transfusionDate.setMinutes(Math.floor(Math.random() * 60));

    transfusions.push({
      patientId,
      occurredAt: transfusionDate.toISOString(),
      type: schedule.type,
      volumeMl: volume,
      donorId: randomPick(donorPool), // Reuse donors to simulate dedicated donor program
      notes: schedule.notes,
      isEmergency,
      parentConsentObtained: !isEmergency,
      parentConsentAt: !isEmergency
        ? new Date(transfusionDate.getTime() - Math.random() * 3600000).toISOString()
        : undefined,
    });
  }

  return transfusions;
}

/**
 * Generate demo lab values with realistic trends over 30 days
 * Simulates typical premature neonate lab patterns:
 * - Hemoglobin declining (anemia of prematurity)
 * - Bilirubin rising then falling (physiologic jaundice)
 * - Platelets fluctuating
 */
function generateLabValues(patientId: string): CreateLabValue[] {
  const labValues: CreateLabValue[] = [];
  const daysOfStay = 30;

  // Generate structured lab trends for key labs
  const labSchedule: Array<{
    labId: string;
    frequency: number; // days between tests
    initialValue: number;
    trend: "declining" | "rising" | "stable" | "variable" | "rising_then_falling";
    variability: number; // percentage variability
  }> = [
    // CBC - checked frequently in NICU
    { labId: "hgb", frequency: 2, initialValue: 16.5, trend: "declining", variability: 5 },
    { labId: "hct", frequency: 2, initialValue: 50, trend: "declining", variability: 5 },
    { labId: "plt", frequency: 2, initialValue: 220000, trend: "variable", variability: 20 },
    { labId: "wbc", frequency: 3, initialValue: 12, trend: "variable", variability: 25 },
    { labId: "retic", frequency: 4, initialValue: 3, trend: "rising", variability: 30 },
    // Bilirubin - frequent in first week, then less
    { labId: "tbili", frequency: 1, initialValue: 2, trend: "rising_then_falling", variability: 15 },
    // Electrolytes
    { labId: "na", frequency: 2, initialValue: 140, trend: "stable", variability: 3 },
    { labId: "k", frequency: 2, initialValue: 4.5, trend: "stable", variability: 10 },
    { labId: "ca", frequency: 3, initialValue: 9.0, trend: "stable", variability: 8 },
    { labId: "glu", frequency: 1, initialValue: 70, trend: "stable", variability: 20 },
    // Blood gas
    { labId: "ph", frequency: 3, initialValue: 7.35, trend: "stable", variability: 1 },
    { labId: "pco2", frequency: 3, initialValue: 42, trend: "stable", variability: 10 },
    // Hemolysis markers
    { labId: "ldh", frequency: 5, initialValue: 400, trend: "variable", variability: 25 },
    { labId: "hapto", frequency: 5, initialValue: 80, trend: "stable", variability: 20 },
  ];

  for (const schedule of labSchedule) {
    const labType = getLabType(schedule.labId);
    if (!labType) continue;

    // Generate values based on schedule
    for (let day = 0; day <= daysOfStay; day += schedule.frequency) {
      let value = schedule.initialValue;

      // Apply trend
      const progress = day / daysOfStay; // 0 to 1
      switch (schedule.trend) {
        case "declining":
          // Hgb typically drops from 16-17 to 8-10 over first month
          value = schedule.initialValue * (1 - progress * 0.45);
          break;
        case "rising":
          value = schedule.initialValue * (1 + progress * 0.5);
          break;
        case "rising_then_falling":
          // Peak around day 5-7, then decline
          if (day <= 7) {
            value = schedule.initialValue * (1 + (day / 7) * 3); // Peak at 4x initial
          } else {
            const decayProgress = (day - 7) / (daysOfStay - 7);
            value = schedule.initialValue * 4 * (1 - decayProgress * 0.7);
          }
          break;
        case "variable":
          // Random walk with bounds
          value = schedule.initialValue * (0.8 + Math.random() * 0.4);
          break;
        case "stable":
        default:
          // Small variation around initial
          break;
      }

      // Add random variability
      const variability = 1 + (Math.random() - 0.5) * 2 * (schedule.variability / 100);
      value *= variability;

      // Occasionally generate critical values (5% chance)
      if (Math.random() < 0.05) {
        const low = labType.neonatalRefRangeLow ?? 0;
        const high = labType.neonatalRefRangeHigh ?? 100;
        value = Math.random() < 0.5 ? low * 0.8 : high * 1.2;
      }

      // Round appropriately
      if (schedule.labId === "ph") {
        value = Math.round(value * 100) / 100;
      } else if (schedule.labId === "plt" || schedule.labId === "wbc") {
        value = Math.round(value);
      } else {
        value = Math.round(value * 10) / 10;
      }

      // Ensure positive values
      value = Math.max(0.1, value);

      // Calculate the exact date for this measurement
      const measurementDate = new Date(Date.now() - (daysOfStay - day) * 24 * 60 * 60 * 1000);
      // Add some randomness to the time of day
      measurementDate.setHours(6 + Math.floor(Math.random() * 12));
      measurementDate.setMinutes(Math.floor(Math.random() * 60));

      labValues.push({
        patientId,
        occurredAt: measurementDate.toISOString(),
        labTypeId: schedule.labId,
        value,
        unit: labType.unit,
        refRangeLow: labType.neonatalRefRangeLow,
        refRangeHigh: labType.neonatalRefRangeHigh,
      });
    }
  }

  return labValues;
}

/**
 * Generate demo phlebotomies (blood draws)
 * Typical preterm has frequent lab draws leading to iatrogenic blood loss
 */
function generatePhlebotomies(patientId: string): CreatePhlebotomy[] {
  const phlebotomies: CreatePhlebotomy[] = [];
  const daysOfStay = 30;

  const nurseNames = ["Enf. María García", "Enf. Ana Rodríguez", "Enf. Carmen López", "Enf. Laura Martínez"];

  // Phlebotomy schedule - more frequent early, then tapering
  const phlebotomySchedule: Array<{
    day: number;
    type: PhlebotomyType;
    volumeMl: number;
    labs: string[];
    notes?: string;
  }> = [
    // Week 1: Very frequent (daily or more)
    { day: 1, type: "routine_labs", volumeMl: 2.5, labs: ["hgb", "hct", "plt", "wbc", "tbili"], notes: "Admission labs" },
    { day: 1, type: "blood_gas", volumeMl: 0.5, labs: ["ph", "pco2"], notes: "Initial ABG" },
    { day: 2, type: "blood_gas", volumeMl: 0.5, labs: ["ph", "pco2"], notes: "Follow-up ABG" },
    { day: 2, type: "routine_labs", volumeMl: 1.5, labs: ["tbili"], notes: "Bilirubin check" },
    { day: 3, type: "routine_labs", volumeMl: 2.0, labs: ["hgb", "hct", "plt", "tbili"], notes: "Pre-transfusion labs" },
    { day: 4, type: "blood_gas", volumeMl: 0.5, labs: ["ph", "pco2"], notes: "Post-extubation ABG" },
    { day: 4, type: "routine_labs", volumeMl: 1.0, labs: ["tbili"], notes: "Peak bilirubin check" },
    { day: 5, type: "routine_labs", volumeMl: 2.0, labs: ["hgb", "hct", "plt", "wbc"], notes: "CBC" },
    { day: 5, type: "blood_culture", volumeMl: 1.0, labs: [], notes: "R/O sepsis - blood culture" },
    { day: 6, type: "routine_labs", volumeMl: 1.0, labs: ["tbili"], notes: "Bilirubin trending down" },
    { day: 7, type: "routine_labs", volumeMl: 2.5, labs: ["hgb", "hct", "plt", "na", "k", "ca"], notes: "Weekly labs" },
    // Week 2: Slightly less frequent
    { day: 9, type: "routine_labs", volumeMl: 2.0, labs: ["hgb", "hct", "plt"], notes: "Anemia monitoring" },
    { day: 10, type: "routine_labs", volumeMl: 2.0, labs: ["hgb", "hct"], notes: "Pre-transfusion Hgb" },
    { day: 11, type: "routine_labs", volumeMl: 1.5, labs: ["na", "k", "glu"], notes: "Electrolytes" },
    { day: 12, type: "blood_culture", volumeMl: 1.0, labs: [], notes: "Sepsis workup" },
    { day: 12, type: "coagulation", volumeMl: 1.5, labs: ["inr"], notes: "Coags before plasma" },
    { day: 14, type: "routine_labs", volumeMl: 2.5, labs: ["hgb", "hct", "plt", "wbc", "na", "k"], notes: "Weekly labs" },
    // Week 3-4: Tapering
    { day: 17, type: "routine_labs", volumeMl: 2.0, labs: ["hgb", "hct", "plt"], notes: "Anemia monitoring" },
    { day: 18, type: "routine_labs", volumeMl: 1.5, labs: ["hgb"], notes: "Pre-transfusion check" },
    { day: 21, type: "routine_labs", volumeMl: 2.5, labs: ["hgb", "hct", "plt", "wbc", "na", "k"], notes: "Weekly labs" },
    { day: 24, type: "routine_labs", volumeMl: 2.0, labs: ["hgb", "hct", "retic"], notes: "Reticulocyte check" },
    { day: 25, type: "routine_labs", volumeMl: 1.5, labs: ["hgb"], notes: "Pre-transfusion" },
    { day: 28, type: "routine_labs", volumeMl: 2.5, labs: ["hgb", "hct", "plt", "wbc"], notes: "Weekly CBC" },
    { day: 28, type: "routine_labs", volumeMl: 1.0, labs: ["plt"], notes: "Pre-LP platelet check" },
    { day: 30, type: "routine_labs", volumeMl: 2.0, labs: ["hgb", "hct", "retic"], notes: "Discharge labs" },
  ];

  for (const schedule of phlebotomySchedule) {
    const drawDate = new Date(Date.now() - (daysOfStay - schedule.day) * 24 * 60 * 60 * 1000);
    drawDate.setHours(5 + Math.floor(Math.random() * 4)); // Morning draws
    drawDate.setMinutes(Math.floor(Math.random() * 60));

    phlebotomies.push({
      patientId,
      occurredAt: drawDate.toISOString(),
      type: schedule.type,
      volumeMl: schedule.volumeMl,
      labsOrdered: schedule.labs,
      drawnBy: randomPick(nurseNames),
      notes: schedule.notes,
    });
  }

  return phlebotomies;
}

/**
 * Generate demo feedings
 * Simulates feeding advancement in a preterm neonate
 */
function generateFeedings(patientId: string): CreateFeeding[] {
  const feedings: CreateFeeding[] = [];
  const daysOfStay = 30;

  const nurseNames = ["Enf. María García", "Enf. Ana Rodríguez", "Enf. Carmen López", "Enf. Laura Martínez"];

  // Feeding progression over 30 days
  // Start with trophic feeds, advance to full feeds
  const feedingProgression: Array<{
    dayRange: [number, number];
    route: FeedingRoute;
    feedingType: FeedingType;
    volumeMl: number;
    frequencyHours: number;
    toleranceChance: number; // Chance of tolerating
    caloriesPerOz?: number;
    fortified?: boolean;
  }> = [
    // Days 1-3: NPO with TPN
    { dayRange: [1, 3], route: "tpn", feedingType: "parenteral", volumeMl: 0, frequencyHours: 24, toleranceChance: 1 },
    // Days 4-7: Trophic feeds (minimal volume)
    { dayRange: [4, 7], route: "og_tube", feedingType: "breast_milk", volumeMl: 2, frequencyHours: 3, toleranceChance: 0.9 },
    // Days 8-14: Advancing feeds
    { dayRange: [8, 10], route: "og_tube", feedingType: "breast_milk", volumeMl: 5, frequencyHours: 3, toleranceChance: 0.85 },
    { dayRange: [11, 14], route: "og_tube", feedingType: "breast_milk", volumeMl: 10, frequencyHours: 3, toleranceChance: 0.85 },
    // Days 15-21: Continued advancement, transitioning to NG
    { dayRange: [15, 17], route: "ng_tube", feedingType: "fortified_breast_milk", volumeMl: 18, frequencyHours: 3, toleranceChance: 0.9, caloriesPerOz: 24, fortified: true },
    { dayRange: [18, 21], route: "ng_tube", feedingType: "fortified_breast_milk", volumeMl: 25, frequencyHours: 3, toleranceChance: 0.92, caloriesPerOz: 24, fortified: true },
    // Days 22-28: Full feeds, starting oral attempts
    { dayRange: [22, 25], route: "ng_tube", feedingType: "fortified_breast_milk", volumeMl: 32, frequencyHours: 3, toleranceChance: 0.95, caloriesPerOz: 24, fortified: true },
    { dayRange: [26, 28], route: "ng_tube", feedingType: "fortified_breast_milk", volumeMl: 38, frequencyHours: 3, toleranceChance: 0.95, caloriesPerOz: 24, fortified: true },
    // Days 29-30: Near discharge, some oral feeds
    { dayRange: [29, 30], route: "oral", feedingType: "breast_milk", volumeMl: 42, frequencyHours: 3, toleranceChance: 0.9 },
  ];

  for (const phase of feedingProgression) {
    for (let day = phase.dayRange[0]; day <= phase.dayRange[1]; day++) {
      // Calculate number of feeds per day
      const feedsPerDay = phase.route === "tpn" ? 1 : Math.floor(24 / phase.frequencyHours);

      for (let feedNum = 0; feedNum < feedsPerDay; feedNum++) {
        const feedDate = new Date(Date.now() - (daysOfStay - day) * 24 * 60 * 60 * 1000);
        feedDate.setHours(feedNum * phase.frequencyHours);
        feedDate.setMinutes(Math.floor(Math.random() * 30));

        // Determine tolerance
        const tolerated = Math.random() < phase.toleranceChance;
        let tolerance: FeedingTolerance = "tolerated";
        let residualMl: number | undefined;
        let residualColor: string | undefined;

        if (!tolerated) {
          const intoleranceType = Math.random();
          if (intoleranceType < 0.4) {
            tolerance = "residuals";
            residualMl = Math.round(phase.volumeMl * (0.3 + Math.random() * 0.4));
            residualColor = Math.random() < 0.7 ? "milky" : "bilious";
          } else if (intoleranceType < 0.7) {
            tolerance = "partial";
            residualMl = Math.round(phase.volumeMl * (0.1 + Math.random() * 0.2));
          } else {
            tolerance = "emesis";
          }
        }

        // Skip TPN entries for individual feeds (it's continuous)
        if (phase.route === "tpn" && feedNum > 0) continue;

        feedings.push({
          patientId,
          occurredAt: feedDate.toISOString(),
          feedingType: phase.feedingType,
          route: phase.route,
          volumeMl: phase.volumeMl,
          tolerance,
          residualMl,
          residualColor,
          caloriesPerOz: phase.caloriesPerOz,
          fortifierAdded: phase.fortified,
          givenBy: randomPick(nurseNames),
          notes: phase.route === "tpn"
            ? "TPN running at prescribed rate"
            : tolerance !== "tolerated"
              ? `${tolerance === "emesis" ? "Emesis during feed" : tolerance === "residuals" ? `${residualMl}ml ${residualColor} residual` : "Partial feed given"}`
              : undefined,
        });
      }
    }
  }

  return feedings;
}

/**
 * Generate demo orders with audit trail
 */
function generateOrders(patientId: string): CreateOrder[] {
  const orders: CreateOrder[] = [];
  const daysOfStay = 30;

  // Staff members for audit trail
  const attendings = ["Dr. Carlos Pérez", "Dra. Elena Sánchez", "Dr. Juan Restrepo"];
  const residents = ["Dr. Miguel Torres (R2)", "Dra. Laura Gómez (R3)", "Dr. Andrés Silva (R1)"];
  const nurses = ["Enf. María García", "Enf. Ana Rodríguez", "Enf. Carmen López"];

  // Sample orders that would be generated over 30 days
  const orderSchedule: Array<{
    day: number;
    orderType: OrderType;
    description: string;
    priority: "routine" | "urgent" | "stat";
    details?: string;
    completed: boolean;
  }> = [
    // Day 1
    { day: 1, orderType: "lab_draw", description: "Admission labs - CBC, BMP, bilirubin", priority: "stat", completed: true },
    { day: 1, orderType: "medication", description: "Vitamin K 1mg IM", priority: "routine", completed: true },
    { day: 1, orderType: "procedure", description: "Surfactant administration", priority: "urgent", completed: true },
    // Day 3
    { day: 3, orderType: "transfusion_rbc", description: "pRBC transfusion 20ml/kg", priority: "urgent", details: "Hct 35%, symptomatic anemia", completed: true },
    { day: 3, orderType: "lab_draw", description: "Pre-transfusion type and screen", priority: "stat", completed: true },
    // Day 5
    { day: 5, orderType: "lab_draw", description: "CBC, blood culture", priority: "urgent", details: "R/O sepsis workup", completed: true },
    { day: 5, orderType: "medication", description: "Ampicillin + Gentamicin", priority: "stat", details: "Empiric antibiotics for suspected sepsis", completed: true },
    // Day 10
    { day: 10, orderType: "transfusion_rbc", description: "pRBC transfusion 20ml/kg", priority: "routine", details: "Hgb 8.2, increasing O2 requirement", completed: true },
    { day: 10, orderType: "imaging", description: "CXR", priority: "routine", details: "Assess lung fields post-extubation", completed: true },
    // Day 12
    { day: 12, orderType: "transfusion_plasma", description: "FFP 15ml/kg", priority: "stat", details: "Coagulopathy during sepsis", completed: true },
    { day: 12, orderType: "lab_draw", description: "Coagulation panel", priority: "stat", completed: true },
    // Day 18
    { day: 18, orderType: "transfusion_rbc", description: "pRBC transfusion 20ml/kg", priority: "routine", details: "Anemia of prematurity, Hgb 7.5", completed: true },
    { day: 18, orderType: "consultation", description: "Ophthalmology consult", priority: "routine", details: "ROP screening", completed: true },
    // Day 25
    { day: 25, orderType: "transfusion_rbc", description: "pRBC transfusion 20ml/kg", priority: "routine", details: "Hgb 7.0, poor weight gain", completed: true },
    { day: 25, orderType: "lab_draw", description: "Weekly CBC", priority: "routine", completed: true },
    // Day 28
    { day: 28, orderType: "transfusion_platelet", description: "Platelet transfusion 15ml/kg", priority: "routine", details: "PLT 22,000, pre-LP", completed: true },
    { day: 28, orderType: "procedure", description: "Lumbar puncture", priority: "routine", details: "Pre-discharge LP", completed: true },
    // Day 29 - pending orders
    { day: 29, orderType: "lab_draw", description: "Discharge labs - CBC, retic, bilirubin", priority: "routine", completed: false },
    { day: 29, orderType: "imaging", description: "Head ultrasound", priority: "routine", details: "Pre-discharge imaging", completed: false },
  ];

  for (const schedule of orderSchedule) {
    const orderDate = new Date(Date.now() - (daysOfStay - schedule.day) * 24 * 60 * 60 * 1000);
    orderDate.setHours(8 + Math.floor(Math.random() * 8));
    orderDate.setMinutes(Math.floor(Math.random() * 60));

    const orderedBy = randomPick(attendings);
    const executedBy = schedule.completed ? randomPick([...residents, ...nurses]) : undefined;
    const executedByRole: StaffRole | undefined = schedule.completed
      ? executedBy?.includes("Dr.") ? "resident" : "nurse"
      : undefined;

    orders.push({
      patientId,
      orderType: schedule.orderType,
      status: schedule.completed ? "completed" : "pending",
      priority: schedule.priority,
      description: schedule.description,
      details: schedule.details,
      orderedBy,
      orderedByRole: "attending",
      orderedAt: orderDate.toISOString(),
      pinVerifiedAt: orderDate.toISOString(),
      executedBy,
      executedByRole,
      executedAt: schedule.completed
        ? new Date(orderDate.getTime() + Math.random() * 3600000).toISOString()
        : undefined,
      completedAt: schedule.completed
        ? new Date(orderDate.getTime() + Math.random() * 7200000).toISOString()
        : undefined,
    });
  }

  return orders;
}

/**
 * Generate demo alerts
 */
function generateAlerts(patientId: string): CreateAlert[] {
  const alerts: CreateAlert[] = [];

  const alertConfigs: Array<{ type: AlertType; severity: Severity; message: string }> = [
    { type: "bradycardia", severity: "warning", message: "Frecuencia cardíaca < 100 lpm por 15 segundos" },
    { type: "bradycardia", severity: "critical", message: "Bradicardia severa < 80 lpm" },
    { type: "desaturation", severity: "warning", message: "SpO2 bajó a 85%" },
    { type: "desaturation", severity: "critical", message: "Desaturación severa < 80%" },
    { type: "apnea", severity: "warning", message: "Sin respiraciones detectadas por 20 segundos" },
    { type: "tachycardia", severity: "warning", message: "Frecuencia cardíaca > 180 lpm por 30 segundos" },
    { type: "temp", severity: "warning", message: "Temperatura 35.8°C - riesgo de hipotermia" },
  ];

  // Generate 15-25 alerts over 30 days (typical for preterm)
  const count = 15 + Math.floor(Math.random() * 11);

  for (let i = 0; i < count; i++) {
    const config = randomPick(alertConfigs);
    const occurredAt = randomDateInRange(30); // Full 30 day stay
    const acknowledged = Math.random() < 0.85; // 85% acknowledged

    const nurseNames = ["Enf. María García", "Enf. Ana Rodríguez", "Enf. Carmen López", "Enf. Laura Martínez"];
    alerts.push({
      patientId,
      occurredAt,
      type: config.type,
      severity: config.severity,
      message: config.message,
      acknowledged,
      acknowledgedAt: acknowledged
        ? new Date(new Date(occurredAt).getTime() + Math.random() * 300000).toISOString()
        : undefined,
      acknowledgedBy: acknowledged ? randomPick(nurseNames) : undefined,
    });
  }

  return alerts;
}

/**
 * Generate all demo data
 */
export async function generateDemoData(): Promise<void> {
  console.log("[MILA Demo] Generating demo data...");

  // Create patient - 30 days ago (1 month stay)
  const patient = await PatientRepository.create({
    displayName: "Mila Restrepo",
    birthDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 30 days ago (1 month stay)
    gestationalAgeWeeks: 32,
    birthWeightGrams: 1850,
    bloodType: "O+",
    parentContacts: [
      {
        id: "contact-1",
        relationship: "mother",
        name: "María Elena Restrepo",
        phone: "+57 310 555 1234",
        email: "maria.restrepo@email.com",
        preferredLanguage: "es",
        isPrimaryContact: true,
        canReceiveUpdates: true,
        consentForUpdates: true,
        consentAt: new Date().toISOString(),
      },
      {
        id: "contact-2",
        relationship: "father",
        name: "Juan Carlos Restrepo",
        phone: "+57 311 555 5678",
        email: "juan.restrepo@email.com",
        preferredLanguage: "es",
        isPrimaryContact: false,
        canReceiveUpdates: true,
        consentForUpdates: true,
        consentAt: new Date().toISOString(),
      },
    ],
  });

  console.log(`[MILA Demo] Created patient: ${patient.displayName}`);

  // Generate and insert observations
  const observations = generateObservations(patient.id);
  await ObservationRepository.bulkCreate(observations);
  console.log(`[MILA Demo] Created ${observations.length} observations`);

  // Generate and insert transfusions
  const transfusions = generateTransfusions(patient.id);
  await TransfusionRepository.bulkCreate(transfusions);
  console.log(`[MILA Demo] Created ${transfusions.length} transfusions`);

  // Generate and insert lab values
  const labValues = generateLabValues(patient.id);
  await LabValueRepository.bulkCreate(labValues);
  console.log(`[MILA Demo] Created ${labValues.length} lab values`);

  // Generate and insert alerts
  const alerts = generateAlerts(patient.id);
  await AlertRepository.bulkCreate(alerts);
  console.log(`[MILA Demo] Created ${alerts.length} alerts`);

  // Generate and insert phlebotomies
  const phlebotomies = generatePhlebotomies(patient.id);
  await PhlebotomyRepository.bulkCreate(phlebotomies);
  console.log(`[MILA Demo] Created ${phlebotomies.length} phlebotomies`);

  // Generate and insert feedings
  const feedings = generateFeedings(patient.id);
  await FeedingRepository.bulkCreate(feedings);
  console.log(`[MILA Demo] Created ${feedings.length} feedings`);

  // Generate and insert orders
  const orders = generateOrders(patient.id);
  await OrderRepository.bulkCreate(orders);
  console.log(`[MILA Demo] Created ${orders.length} orders`);

  console.log("[MILA Demo] Demo data generation complete");
}
