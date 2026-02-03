/**
 * MILA Domain Types
 *
 * Core domain models for the MILA clinical application.
 * All event timestamps use `occurredAt` for consistency.
 * System timestamps use `createdAt` / `updatedAt`.
 */

// ============================================================================
// Source Types (Structured Unions)
// ============================================================================

export type ObservationSource = "parent" | "nurse" | "doctor" | "monitor" | "system";

export type VitalSource = "monitor" | "manual";

export type ObservationCategory = "clinical" | "nursing" | "procedure" | "event";

export type Severity = "info" | "warning" | "critical";

export type TransfusionType = "rbc" | "platelet" | "plasma" | "other";

export type VitalType = "hr" | "spo2" | "rr" | "temp" | "bp_sys" | "bp_dia";

export type AlertType =
  | "bradycardia"
  | "tachycardia"
  | "desaturation"
  | "apnea"
  | "temp"
  | "custom"
  | "hemolysis_warning"
  | "hemolysis_critical"
  | "phlebotomy_warning"
  | "phlebotomy_critical";

export type PhlebotomyType = "routine_labs" | "blood_gas" | "blood_culture" | "coagulation" | "other";

export type FeedingType = "breast_milk" | "formula" | "fortified_breast_milk" | "parenteral" | "mixed";

export type FeedingRoute = "oral" | "ng_tube" | "og_tube" | "g_tube" | "nj_tube" | "tpn";

export type FeedingTolerance = "tolerated" | "partial" | "not_tolerated" | "residuals" | "emesis";

export type OrderStatus = "pending" | "in_progress" | "completed" | "cancelled";

export type OrderType =
  | "transfusion_rbc"
  | "transfusion_platelet"
  | "transfusion_plasma"
  | "lab_draw"
  | "medication"
  | "procedure"
  | "imaging"
  | "consultation"
  | "other";

export type StaffRole = "attending" | "fellow" | "resident" | "nurse" | "np" | "pa";

export type ParentRelationship = "mother" | "father" | "guardian" | "other";

export type BloodType = "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";

export type Language = "en" | "es";

// ============================================================================
// Respiratory Support Types
// ============================================================================

export type RespiratorySupport =
  | "room_air"           // No support
  | "low_flow_nc"        // Low flow nasal cannula (<1L/min)
  | "high_flow_nc"       // High flow nasal cannula (≥1L/min)
  | "cpap"               // Continuous positive airway pressure
  | "bipap"              // Bilevel positive airway pressure
  | "nippv"              // Non-invasive positive pressure ventilation
  | "oxygen_hood"        // Oxygen hood/helmet
  | "intubated_conv"     // Conventional mechanical ventilation
  | "intubated_hfov"     // High frequency oscillatory ventilation
  | "intubated_hfjv";    // High frequency jet ventilation

export type OxygenDelivery = "none" | "blended" | "100_percent";

// ============================================================================
// Phototherapy Types
// ============================================================================

export type PhototherapyType =
  | "none"
  | "conventional"       // Overhead phototherapy
  | "led"                // LED phototherapy
  | "biliblanket"        // Fiberoptic blanket
  | "double"             // Double phototherapy (overhead + blanket)
  | "intensive";         // Triple or intensive phototherapy

// ============================================================================
// Developmental Care / Early Stimulation Types
// ============================================================================

export type DevelopmentalCareType =
  | "kangaroo_care"           // Skin-to-skin contact
  | "non_nutritive_sucking"   // Pacifier for comfort/development
  | "positioning"             // Developmental positioning
  | "massage"                 // Infant massage
  | "music_therapy"           // Music/voice stimulation
  | "visual_stimulation"      // Black/white cards, face time
  | "auditory_protection"     // Light/noise reduction
  | "clustered_care";         // Minimal handling, grouped interventions

// ============================================================================
// Parent Contact
// ============================================================================

export interface ParentContact {
  id: string;
  relationship: ParentRelationship;
  name: string;
  phone?: string;
  email?: string;
  preferredLanguage: Language;
  isPrimaryContact: boolean;
  canReceiveUpdates: boolean;
  consentForUpdates: boolean;
  consentAt?: string; // ISO datetime
}

// ============================================================================
// Base Entity Interface
// ============================================================================

export interface BaseEntity {
  id: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

// ============================================================================
// Patient
// ============================================================================

export interface Patient extends BaseEntity {
  displayName: string;
  birthDate: string; // ISO date (YYYY-MM-DD)
  gestationalAgeWeeks: number;
  birthWeightGrams: number;
  bloodType?: BloodType;
  parentContacts: ParentContact[];

  // Current clinical status (quick reference - updated when ClinicalStatus changes)
  currentRespiratorySupport?: RespiratorySupport;
  currentFio2?: number;
  currentPhototherapy?: PhototherapyType;
  onCaffeine?: boolean;
  hasUmbilicalLines?: boolean;
  hasCentralLine?: boolean;
}

export type CreatePatient = Omit<Patient, "id" | "createdAt" | "updatedAt">;
export type UpdatePatient = Partial<CreatePatient>;

// ============================================================================
// Observation
// ============================================================================

export interface Observation extends BaseEntity {
  patientId: string;
  occurredAt: string; // ISO datetime - when the observation occurred
  category: ObservationCategory;
  severity: Severity;
  source: ObservationSource;
  sourceName?: string; // Actual person's name (e.g., "Enf. María García")
  content: string;
  tags: string[];
}

export type CreateObservation = Omit<Observation, "id" | "createdAt" | "updatedAt">;
export type UpdateObservation = Partial<CreateObservation>;

// ============================================================================
// Transfusion
// ============================================================================

export interface Transfusion extends BaseEntity {
  patientId: string;
  occurredAt: string; // ISO datetime - when transfusion was administered
  type: TransfusionType;
  volumeMl: number;
  donorId: string; // Mock donor identifier
  notes: string;
  // Consent and justification fields
  isEmergency: boolean;
  parentConsentObtained: boolean;
  parentConsentAt?: string; // ISO datetime
  preTransfusionLabId?: string; // Reference to lab value used for justification
  clinicalJustification?: string; // Required if labs don't indicate need
}

export type CreateTransfusion = Omit<Transfusion, "id" | "createdAt" | "updatedAt">;
export type UpdateTransfusion = Partial<CreateTransfusion>;

// ============================================================================
// Lab Value
// ============================================================================

export interface LabValue extends BaseEntity {
  patientId: string;
  occurredAt: string; // ISO datetime - when sample was collected
  labTypeId: string; // Reference to lab type definition
  value: number;
  unit: string;
  refRangeLow?: number;
  refRangeHigh?: number;
}

export type CreateLabValue = Omit<LabValue, "id" | "createdAt" | "updatedAt">;
export type UpdateLabValue = Partial<CreateLabValue>;

// ============================================================================
// Vital Sign
// ============================================================================

export interface VitalSign extends BaseEntity {
  patientId: string;
  occurredAt: string; // ISO datetime - when vital was measured
  type: VitalType;
  value: number;
  unit: string;
  source: VitalSource;
}

export type CreateVitalSign = Omit<VitalSign, "id" | "createdAt" | "updatedAt">;

// ============================================================================
// Alert
// ============================================================================

export interface Alert extends BaseEntity {
  patientId: string;
  occurredAt: string; // ISO datetime - when alert triggered
  type: AlertType;
  severity: Severity;
  message: string;
  acknowledged: boolean;
  acknowledgedAt?: string; // ISO datetime
  acknowledgedBy?: string;
}

export type CreateAlert = Omit<Alert, "id" | "createdAt" | "updatedAt">;
export type UpdateAlert = Partial<Pick<Alert, "acknowledged" | "acknowledgedAt" | "acknowledgedBy">>;

// ============================================================================
// Feeding (Enteral/Parenteral Nutrition Tracking)
// ============================================================================

export interface Feeding extends BaseEntity {
  patientId: string;
  occurredAt: string; // ISO datetime - when feeding started
  feedingType: FeedingType;
  route: FeedingRoute;
  volumeMl: number; // Volume given
  durationMinutes?: number; // For continuous feeds
  tolerance: FeedingTolerance;
  residualMl?: number; // Gastric residual if checked
  residualColor?: string; // Bilious, milky, clear, etc.
  caloriesPerOz?: number; // Caloric density
  fortifierAdded?: boolean;
  givenBy?: string; // Name of person who gave feeding
  notes?: string;
}

export type CreateFeeding = Omit<Feeding, "id" | "createdAt" | "updatedAt">;
export type UpdateFeeding = Partial<CreateFeeding>;

// ============================================================================
// Phlebotomy (Blood Draw Tracking)
// ============================================================================

export interface Phlebotomy extends BaseEntity {
  patientId: string;
  occurredAt: string; // ISO datetime - when blood was drawn
  type: PhlebotomyType;
  volumeMl: number; // Volume of blood drawn
  labsOrdered: string[]; // Lab type IDs that were ordered
  drawnBy?: string; // Name of person who drew blood
  notes?: string;
  orderId?: string; // Reference to the order that requested this draw
}

export type CreatePhlebotomy = Omit<Phlebotomy, "id" | "createdAt" | "updatedAt">;
export type UpdatePhlebotomy = Partial<CreatePhlebotomy>;

// ============================================================================
// Staff Member (for orders audit trail)
// ============================================================================

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  credentials?: string; // e.g., "MD", "RN", "NP"
  pinHash?: string; // Hashed PIN for order verification
}

// ============================================================================
// Clinical Order (with full audit trail)
// ============================================================================

export interface Order extends BaseEntity {
  patientId: string;
  orderType: OrderType;
  status: OrderStatus;
  priority: "routine" | "urgent" | "stat";
  // What was ordered
  description: string;
  details?: string;
  // Who ordered (audit trail)
  orderedBy: string; // Staff member name
  orderedByRole: StaffRole;
  orderedAt: string; // ISO datetime
  pinVerifiedAt?: string; // When PIN was verified for the order
  // Who executed (audit trail)
  executedBy?: string; // Staff member name
  executedByRole?: StaffRole;
  executedAt?: string; // ISO datetime
  // Completion
  completedAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  // Related records
  relatedTransfusionId?: string;
  relatedPhlebotomyId?: string;
  // Notes
  notes?: string;
}

export type CreateOrder = Omit<Order, "id" | "createdAt" | "updatedAt">;
export type UpdateOrder = Partial<CreateOrder>;

// ============================================================================
// Clinical Status (Respiratory, Phototherapy, Developmental Care)
// ============================================================================

export interface ClinicalStatus extends BaseEntity {
  patientId: string;
  occurredAt: string; // ISO datetime - when status changed

  // Respiratory support
  respiratorySupport: RespiratorySupport;
  fio2?: number; // Fraction of inspired oxygen (21-100)
  peep?: number; // Positive end-expiratory pressure
  pip?: number; // Peak inspiratory pressure
  respiratoryRate?: number; // Ventilator rate if applicable
  oxygenFlow?: number; // L/min for nasal cannula

  // Phototherapy
  phototherapy: PhototherapyType;
  phototherapyStartedAt?: string; // When current phototherapy started
  totalPhototherapyHours?: number; // Cumulative hours

  // Developmental care activities (which are currently active)
  activeDevelopmentalCare: DevelopmentalCareType[];

  // Additional flags
  caffeineCitrate: boolean; // On caffeine for apnea of prematurity
  ibuprofen: boolean; // For PDA closure
  umbilicalLines: boolean; // UAC/UVC in place
  peripheralIv: boolean;
  centralLine: boolean; // PICC, Broviac

  // Who recorded this change
  recordedBy?: string;
  notes?: string;
}

export type CreateClinicalStatus = Omit<ClinicalStatus, "id" | "createdAt" | "updatedAt">;
export type UpdateClinicalStatus = Partial<CreateClinicalStatus>;

// ============================================================================
// Developmental Care Session (Individual encounters)
// ============================================================================

export interface DevelopmentalCareSession extends BaseEntity {
  patientId: string;
  occurredAt: string; // ISO datetime - when session started
  endedAt?: string; // ISO datetime - when session ended
  type: DevelopmentalCareType;
  durationMinutes?: number;
  participantType: "parent" | "nurse" | "therapist" | "volunteer";
  participantName?: string;
  infantResponse?: "positive" | "neutral" | "stressed"; // How baby tolerated
  notes?: string;
}

export type CreateDevelopmentalCareSession = Omit<DevelopmentalCareSession, "id" | "createdAt" | "updatedAt">;
export type UpdateDevelopmentalCareSession = Partial<CreateDevelopmentalCareSession>;

// ============================================================================
// Timeline Event (Unified View)
// ============================================================================

export type TimelineEventType = "observation" | "transfusion" | "lab" | "alert" | "phlebotomy" | "order" | "feeding" | "clinical_status" | "developmental_care";

export interface TimelineEvent {
  id: string;
  patientId: string;
  occurredAt: string;
  eventType: TimelineEventType;
  severity: Severity;
  summary: string;
  details?: string;
  sourceRecord: Observation | Transfusion | LabValue | Alert | Phlebotomy | Order | Feeding | ClinicalStatus | DevelopmentalCareSession;
}

// ============================================================================
// Lab Type Definition (Reference Data)
// ============================================================================

export interface LabTypeDefinition {
  id: string;
  name: string;
  shortName: string;
  category: "hematology" | "chemistry" | "blood_gas" | "coagulation" | "other";
  unit: string;
  neonatalRefRangeLow?: number;
  neonatalRefRangeHigh?: number;
  criticalLow?: number;
  criticalHigh?: number;
}

// ============================================================================
// Vital Range Definition (Reference Data)
// ============================================================================

export interface VitalRangeDefinition {
  type: VitalType;
  name: string;
  unit: string;
  normalLow: number;
  normalHigh: number;
  warningLow?: number;
  warningHigh?: number;
  criticalLow?: number;
  criticalHigh?: number;
}

// ============================================================================
// Treatment Plan (MILA AI-Generated Plans)
// ============================================================================

export type TreatmentPlanStatus = "active" | "completed" | "cancelled" | "modified";

export type TreatmentPlanCategory =
  | "transfusion"
  | "sepsis"
  | "nec"
  | "respiratory"
  | "feeding"
  | "jaundice"
  | "hemolysis"
  | "general";

export type AmendmentType =
  | "action_added"       // New action added to plan
  | "action_removed"     // Action removed from plan
  | "action_modified"    // Existing action changed
  | "dosage_changed"     // Dosage/timing adjustment
  | "hold"               // Plan temporarily paused
  | "resumed"            // Plan resumed after hold
  | "escalation"         // Treatment intensified
  | "deescalation"       // Treatment reduced
  | "clinical_update"    // Based on new lab/vital data
  | "patient_response"   // Based on patient response
  | "other";

export interface TreatmentPlanAction {
  id: string;
  description: string;
  descriptionEs: string;
  dosage?: string;        // e.g., "50mg/kg q12h"
  timing?: string;        // e.g., "q12h", "x 3 days", "stat"
  completed: boolean;
  completedAt?: string;   // ISO datetime
  completedBy?: string;   // Staff name
  notes?: string;
  // Track if action was added later (not in original plan)
  addedAt?: string;       // ISO datetime when added (if amendment)
  addedBy?: string;       // Who added it
  removedAt?: string;     // ISO datetime when removed (soft delete)
  removedBy?: string;     // Who removed it
  isRemoved?: boolean;    // Soft delete flag
}

export interface PlanAmendment {
  id: string;
  occurredAt: string;           // When amendment was made
  type: AmendmentType;
  description: string;          // What changed
  descriptionEs: string;
  reason: string;               // Why it was changed
  reasonEs: string;
  amendedBy: string;            // Who made the change
  // For action changes
  actionId?: string;            // Which action was affected
  previousValue?: string;       // What it was before
  newValue?: string;            // What it is now
  // AI involvement
  milaRecommended?: boolean;    // Was this change recommended by MILA?
  milaRationale?: string;       // MILA's reasoning if applicable
}

export interface TreatmentPlan extends BaseEntity {
  patientId: string;
  occurredAt: string;           // When plan was created
  category: TreatmentPlanCategory;
  status: TreatmentPlanStatus;
  // AI-generated content
  title: string;
  titleEs: string;
  summary: string;              // Brief description
  summaryEs: string;
  rationale: string;            // Clinical reasoning / evidence cited
  rationaleEs: string;
  actions: TreatmentPlanAction[];
  // Amendment history - tracks all changes to the plan
  amendments: PlanAmendment[];
  // Tracking
  milaRecommendation: string;   // Original MILA recommendation text
  doctorResponse?: string;      // Doctor's response/modifications
  approvedBy?: string;          // Name of approving physician
  approvedAt?: string;          // ISO datetime
  // Hold status
  isOnHold?: boolean;           // Plan temporarily paused
  holdReason?: string;
  holdAt?: string;              // When put on hold
  resumedAt?: string;           // When resumed
  // Completion
  completedAt?: string;         // When all actions completed
  outcome?: string;             // Outcome notes
  outcomeEs?: string;
}

export type CreateTreatmentPlan = Omit<TreatmentPlan, "id" | "createdAt" | "updatedAt">;
export type UpdateTreatmentPlan = Partial<CreateTreatmentPlan>;

// ============================================================================
// Data Export/Import Types
// ============================================================================

export interface MilaDataExport {
  version: string;
  exportedAt: string;
  patient: Patient | null;
  observations: Observation[];
  transfusions: Transfusion[];
  labValues: LabValue[];
  alerts: Alert[];
  phlebotomies: Phlebotomy[];
  feedings: Feeding[];
  orders: Order[];
  clinicalStatuses: ClinicalStatus[];
  developmentalCareSessions: DevelopmentalCareSession[];
}

// ============================================================================
// Sync Result Types
// ============================================================================

export interface SyncResult {
  success: boolean;
  syncedAt: string;
  recordsProcessed: number;
  errors: SyncError[];
}

export interface SyncError {
  recordType: string;
  recordId?: string;
  message: string;
}
