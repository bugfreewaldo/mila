/**
 * FHIR Types (Minimal Subset)
 *
 * Placeholder types for future FHIR R4 integration.
 * These are simplified versions of actual FHIR resources.
 *
 * TODO: When implementing real FHIR integration:
 * - Use official @types/fhir package
 * - Implement proper FHIR R4 resource validation
 * - Add SMART on FHIR authentication
 */

// ============================================================================
// FHIR Primitives
// ============================================================================

/** FHIR instant type (ISO 8601 with timezone) */
export type FhirInstant = string;

/** FHIR date type (YYYY-MM-DD) */
export type FhirDate = string;

/** FHIR dateTime type */
export type FhirDateTime = string;

/** FHIR code type */
export type FhirCode = string;

// ============================================================================
// FHIR Reference
// ============================================================================

export interface FhirReference {
  reference?: string;
  type?: string;
  display?: string;
}

// ============================================================================
// FHIR Coding
// ============================================================================

export interface FhirCoding {
  system?: string;
  code?: string;
  display?: string;
}

export interface FhirCodeableConcept {
  coding?: FhirCoding[];
  text?: string;
}

// ============================================================================
// FHIR Quantity
// ============================================================================

export interface FhirQuantity {
  value?: number;
  unit?: string;
  system?: string;
  code?: string;
}

// ============================================================================
// FHIR Patient (Simplified)
// ============================================================================

export interface FhirPatient {
  resourceType: "Patient";
  id?: string;
  identifier?: Array<{
    system?: string;
    value?: string;
  }>;
  name?: Array<{
    use?: string;
    family?: string;
    given?: string[];
    text?: string;
  }>;
  gender?: "male" | "female" | "other" | "unknown";
  birthDate?: FhirDate;
  extension?: Array<{
    url: string;
    valueQuantity?: FhirQuantity;
    valueDecimal?: number;
  }>;
}

// ============================================================================
// FHIR Observation (Simplified)
// ============================================================================

export interface FhirObservation {
  resourceType: "Observation";
  id?: string;
  status: "registered" | "preliminary" | "final" | "amended" | "corrected" | "cancelled";
  category?: FhirCodeableConcept[];
  code: FhirCodeableConcept;
  subject?: FhirReference;
  effectiveDateTime?: FhirDateTime;
  effectiveInstant?: FhirInstant;
  valueQuantity?: FhirQuantity;
  valueString?: string;
  interpretation?: FhirCodeableConcept[];
  referenceRange?: Array<{
    low?: FhirQuantity;
    high?: FhirQuantity;
    type?: FhirCodeableConcept;
  }>;
}

// ============================================================================
// FHIR Procedure (Simplified - for Transfusions)
// ============================================================================

export interface FhirProcedure {
  resourceType: "Procedure";
  id?: string;
  status: "preparation" | "in-progress" | "completed" | "on-hold" | "stopped";
  code: FhirCodeableConcept;
  subject: FhirReference;
  performedDateTime?: FhirDateTime;
  note?: Array<{
    text: string;
  }>;
}

// ============================================================================
// FHIR DiagnosticReport (Simplified - for Lab Results)
// ============================================================================

export interface FhirDiagnosticReport {
  resourceType: "DiagnosticReport";
  id?: string;
  status: "registered" | "partial" | "preliminary" | "final" | "amended" | "corrected";
  category?: FhirCodeableConcept[];
  code: FhirCodeableConcept;
  subject?: FhirReference;
  effectiveDateTime?: FhirDateTime;
  result?: FhirReference[];
}

// ============================================================================
// FHIR Bundle (for search results)
// ============================================================================

export interface FhirBundle<T = FhirResource> {
  resourceType: "Bundle";
  type: "searchset" | "batch" | "transaction" | "collection";
  total?: number;
  entry?: Array<{
    fullUrl?: string;
    resource?: T;
  }>;
}

export type FhirResource =
  | FhirPatient
  | FhirObservation
  | FhirProcedure
  | FhirDiagnosticReport;

// ============================================================================
// FHIR Coding Systems (Common)
// ============================================================================

export const FHIR_SYSTEMS = {
  LOINC: "http://loinc.org",
  SNOMED: "http://snomed.info/sct",
  ICD10: "http://hl7.org/fhir/sid/icd-10",
  OBSERVATION_CATEGORY: "http://terminology.hl7.org/CodeSystem/observation-category",
} as const;

// ============================================================================
// FHIR Mappers (Stubs)
// ============================================================================

/**
 * TODO: Implement FHIR resource mappers
 *
 * These functions will convert between FHIR resources and MILA domain types.
 * Example:
 *
 * export function fhirPatientToPatient(fhir: FhirPatient): Patient { ... }
 * export function patientToFhirPatient(patient: Patient): FhirPatient { ... }
 * export function fhirObservationToLabValue(fhir: FhirObservation): LabValue { ... }
 */
