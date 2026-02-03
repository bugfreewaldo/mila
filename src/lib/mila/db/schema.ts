import type { DBSchema } from "idb";
import type {
  Patient,
  Observation,
  Transfusion,
  LabValue,
  Alert,
  Phlebotomy,
  Feeding,
  Order,
  ClinicalStatus,
  DevelopmentalCareSession,
  TreatmentPlan,
} from "../types/domain";

/**
 * MILA IndexedDB Schema
 *
 * Version 1 - Initial schema
 *
 * Indexes are designed to support the explicit repository queries:
 * - byPatient
 * - byPatientAndDateRange
 * - byPatientAndCategory/Type
 * - byPatientUnacknowledged (alerts)
 */

export const DB_NAME = "mila-db";
export const DB_VERSION = 4; // v4: Added treatmentPlans store

export interface MilaDBSchema extends DBSchema {
  patients: {
    key: string;
    value: Patient;
    indexes: {
      "by-createdAt": string;
    };
  };

  observations: {
    key: string;
    value: Observation;
    indexes: {
      "by-patientId": string;
      "by-patientId-occurredAt": [string, string];
      "by-patientId-category": [string, string];
      "by-patientId-severity": [string, string];
    };
  };

  transfusions: {
    key: string;
    value: Transfusion;
    indexes: {
      "by-patientId": string;
      "by-patientId-occurredAt": [string, string];
      "by-patientId-type": [string, string];
    };
  };

  labValues: {
    key: string;
    value: LabValue;
    indexes: {
      "by-patientId": string;
      "by-patientId-occurredAt": [string, string];
      "by-patientId-labTypeId": [string, string];
      "by-patientId-labTypeId-occurredAt": [string, string, string];
    };
  };

  alerts: {
    key: string;
    value: Alert;
    indexes: {
      "by-patientId": string;
      "by-patientId-occurredAt": [string, string];
      "by-patientId-acknowledged": [string, number]; // number: 0=false, 1=true
    };
  };

  phlebotomies: {
    key: string;
    value: Phlebotomy;
    indexes: {
      "by-patientId": string;
      "by-patientId-occurredAt": [string, string];
    };
  };

  feedings: {
    key: string;
    value: Feeding;
    indexes: {
      "by-patientId": string;
      "by-patientId-occurredAt": [string, string];
      "by-patientId-tolerance": [string, string];
    };
  };

  orders: {
    key: string;
    value: Order;
    indexes: {
      "by-patientId": string;
      "by-patientId-status": [string, string];
      "by-patientId-orderType": [string, string];
      "by-orderedAt": string;
    };
  };

  clinicalStatuses: {
    key: string;
    value: ClinicalStatus;
    indexes: {
      "by-patientId": string;
      "by-patientId-occurredAt": [string, string];
    };
  };

  developmentalCareSessions: {
    key: string;
    value: DevelopmentalCareSession;
    indexes: {
      "by-patientId": string;
      "by-patientId-occurredAt": [string, string];
      "by-patientId-type": [string, string];
    };
  };

  treatmentPlans: {
    key: string;
    value: TreatmentPlan;
    indexes: {
      "by-patientId": string;
      "by-patientId-occurredAt": [string, string];
      "by-patientId-status": [string, string];
      "by-patientId-category": [string, string];
    };
  };

  // Metadata store for app state
  metadata: {
    key: string;
    value: {
      key: string;
      value: unknown;
      updatedAt: string;
    };
  };
}

/**
 * Store names for type safety
 */
export const STORES = {
  PATIENTS: "patients",
  OBSERVATIONS: "observations",
  TRANSFUSIONS: "transfusions",
  LAB_VALUES: "labValues",
  ALERTS: "alerts",
  PHLEBOTOMIES: "phlebotomies",
  FEEDINGS: "feedings",
  ORDERS: "orders",
  CLINICAL_STATUSES: "clinicalStatuses",
  DEVELOPMENTAL_CARE_SESSIONS: "developmentalCareSessions",
  TREATMENT_PLANS: "treatmentPlans",
  METADATA: "metadata",
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];
