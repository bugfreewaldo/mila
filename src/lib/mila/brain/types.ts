/**
 * MILA Brain Types
 *
 * Type definitions for the medical knowledge base.
 */

export interface ClinicalGuideline {
  id: string;
  title: string;
  titleEs: string;
  category: "transfusion" | "sepsis" | "respiratory" | "nutrition" | "jaundice" | "general";
  sources: string[];
  lastUpdated: string;
  keyPoints: string[];
  keyPointsEs: string[];
  thresholds: Record<string, ThresholdDefinition>;
  evidenceLevel: "A" | "B" | "C" | "D" | "expert_consensus";
}

export interface ThresholdDefinition {
  description: string;
  descriptionEs: string;
  value?: number;
  unit?: string;
  condition?: string;
  action: string;
  actionEs: string;
}

export interface ClinicalProtocol {
  id: string;
  title: string;
  titleEs: string;
  description: string;
  descriptionEs: string;
  category: string;
  steps: ProtocolStep[];
  references: string[];
  lastUpdated: string;
}

export interface ProtocolStep {
  step: number;
  action: string;
  actionEs: string;
  details: string;
  detailsEs: string;
  timing?: string;
  criticalAction?: boolean;
}

export interface DrugReference {
  id: string;
  name: string;
  genericName: string;
  category: "antibiotic" | "cardiovascular" | "respiratory" | "analgesic" | "vitamin" | "other";
  indication: string;
  indicationEs: string;
  dose: string;
  dosePerKg?: string;
  route: string;
  frequency: string;
  maxDose?: string;
  adjustments?: DoseAdjustment[];
  contraindications: string[];
  sideEffects: string[];
  monitoring: string[];
  notes?: string;
}

export interface DoseAdjustment {
  condition: string;
  adjustment: string;
}

export interface LabReferenceRange {
  id: string;
  name: string;
  shortName: string;
  category: "hematology" | "chemistry" | "blood_gas" | "coagulation" | "other";
  unit: string;
  neonatalRange: {
    low: number;
    high: number;
    gestationalAgeSpecific?: GestationalAgeRange[];
    postnatalAgeSpecific?: PostnatalAgeRange[];
  };
  criticalLow?: number;
  criticalHigh?: number;
  interpretation: {
    low: string;
    lowEs: string;
    high: string;
    highEs: string;
    critical: string;
    criticalEs: string;
  };
}

export interface GestationalAgeRange {
  gaWeeksMin: number;
  gaWeeksMax: number;
  low: number;
  high: number;
}

export interface PostnatalAgeRange {
  daysMin: number;
  daysMax: number;
  low: number;
  high: number;
}

export interface BrainQuery {
  topic: string;
  patientContext?: {
    gestationalAge?: number;
    postnatalAge?: number;
    weight?: number;
    currentConditions?: string[];
  };
  language: "en" | "es";
}

export interface BrainResponse {
  relevantGuidelines: ClinicalGuideline[];
  relevantProtocols: ClinicalProtocol[];
  relevantDrugs: DrugReference[];
  labRanges: LabReferenceRange[];
  summary: string;
  summaryEs: string;
}
