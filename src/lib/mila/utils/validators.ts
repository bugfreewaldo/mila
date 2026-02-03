import { z } from "zod";
import type {
  ObservationCategory,
  ObservationSource,
  Severity,
  TransfusionType,
  VitalType,
  AlertType,
} from "../types/domain";

// ============================================================================
// Enum Schemas
// ============================================================================

export const observationSourceSchema = z.enum([
  "parent",
  "nurse",
  "doctor",
  "monitor",
  "system",
]) satisfies z.ZodType<ObservationSource>;

export const observationCategorySchema = z.enum([
  "clinical",
  "nursing",
  "procedure",
  "event",
]) satisfies z.ZodType<ObservationCategory>;

export const severitySchema = z.enum([
  "info",
  "warning",
  "critical",
]) satisfies z.ZodType<Severity>;

export const transfusionTypeSchema = z.enum([
  "rbc",
  "platelet",
  "plasma",
  "other",
]) satisfies z.ZodType<TransfusionType>;

export const vitalTypeSchema = z.enum([
  "hr",
  "spo2",
  "rr",
  "temp",
  "bp_sys",
  "bp_dia",
]) satisfies z.ZodType<VitalType>;

export const alertTypeSchema = z.enum([
  "bradycardia",
  "tachycardia",
  "desaturation",
  "apnea",
  "temp",
  "custom",
  "hemolysis_warning",
  "hemolysis_critical",
]) satisfies z.ZodType<AlertType>;

// ============================================================================
// Entity Schemas
// ============================================================================

export const patientSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().min(1).max(100),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format"),
  gestationalAgeWeeks: z.number().min(22).max(44),
  birthWeightGrams: z.number().min(300).max(6000),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createPatientSchema = patientSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const observationSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  occurredAt: z.string().datetime(),
  category: observationCategorySchema,
  severity: severitySchema,
  source: observationSourceSchema,
  content: z.string().min(1).max(2000),
  tags: z.array(z.string().max(50)).max(10),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createObservationSchema = observationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const transfusionSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  occurredAt: z.string().datetime(),
  type: transfusionTypeSchema,
  volumeMl: z.number().min(1).max(500),
  donorId: z.string().min(1).max(50),
  notes: z.string().max(1000),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createTransfusionSchema = transfusionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const labValueSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  occurredAt: z.string().datetime(),
  labTypeId: z.string().min(1).max(50),
  value: z.number(),
  unit: z.string().min(1).max(20),
  refRangeLow: z.number().optional(),
  refRangeHigh: z.number().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createLabValueSchema = labValueSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const alertSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  occurredAt: z.string().datetime(),
  type: alertTypeSchema,
  severity: severitySchema,
  message: z.string().min(1).max(500),
  acknowledged: z.boolean(),
  acknowledgedAt: z.string().datetime().optional(),
  acknowledgedBy: z.string().max(100).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createAlertSchema = alertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================================================
// Form Schemas (for react-hook-form)
// ============================================================================

export const observationFormSchema = z.object({
  occurredAt: z.string().min(1, "Date/time is required"),
  category: observationCategorySchema,
  severity: severitySchema,
  source: observationSourceSchema,
  content: z.string().min(1, "Content is required").max(2000),
  tags: z.string().optional(), // comma-separated, transformed later
});

export const transfusionFormSchema = z.object({
  occurredAt: z.string().min(1, "Date/time is required"),
  type: transfusionTypeSchema,
  volumeMl: z.coerce.number().min(1, "Volume must be at least 1ml").max(500),
  donorId: z.string().min(1, "Donor ID is required"),
  notes: z.string().max(1000).optional(),
  // Consent and justification
  isEmergency: z.boolean().default(false),
  parentConsentObtained: z.boolean().default(false),
  clinicalJustification: z.string().max(500).optional(),
});

export const labValueFormSchema = z.object({
  occurredAt: z.string().min(1, "Collection date/time is required"),
  labTypeId: z.string().min(1, "Lab type is required"),
  value: z.coerce.number({ invalid_type_error: "Value must be a number" }),
  unit: z.string().min(1, "Unit is required"),
  refRangeLow: z.coerce.number().optional(),
  refRangeHigh: z.coerce.number().optional(),
});

// ============================================================================
// Type exports
// ============================================================================

export type PatientFormData = z.infer<typeof createPatientSchema>;
export type ObservationFormData = z.infer<typeof observationFormSchema>;
export type TransfusionFormData = z.infer<typeof transfusionFormSchema>;
export type LabValueFormData = z.infer<typeof labValueFormSchema>;
