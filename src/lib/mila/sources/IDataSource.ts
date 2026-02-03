/**
 * Data Source Interface
 *
 * Abstraction layer for data access. Implementations can be:
 * - MockDataSource: Uses IndexedDB with mock data (MVP)
 * - FhirDataSource: Connects to FHIR R4 server (future)
 * - DeviceGatewayDataSource: Connects to hospital MDI middleware (future)
 */

import type {
  Patient,
  CreatePatient,
  UpdatePatient,
  Observation,
  CreateObservation,
  UpdateObservation,
  Transfusion,
  CreateTransfusion,
  UpdateTransfusion,
  LabValue,
  CreateLabValue,
  UpdateLabValue,
  Alert,
  CreateAlert,
  SyncResult,
  MilaDataExport,
  ObservationCategory,
  Severity,
  TransfusionType,
} from "../types/domain";

export type DataSourceType = "mock" | "fhir" | "device";

/**
 * Data Source Interface
 *
 * All data access goes through this interface.
 * UI components should never access repositories directly.
 */
export interface IDataSource {
  // ============================================================================
  // Metadata
  // ============================================================================

  /** Human-readable name of the data source */
  readonly name: string;

  /** Type identifier for the data source */
  readonly type: DataSourceType;

  /** Whether this data source is connected/available */
  isConnected(): Promise<boolean>;

  // ============================================================================
  // Patient Operations
  // ============================================================================

  getPatient(id: string): Promise<Patient | null>;
  getDefaultPatient(): Promise<Patient | null>;
  listPatients(): Promise<Patient[]>;
  createPatient(data: CreatePatient): Promise<Patient>;
  updatePatient(id: string, data: UpdatePatient): Promise<Patient | null>;
  deletePatient(id: string): Promise<boolean>;

  // ============================================================================
  // Observation Operations
  // ============================================================================

  getObservation(id: string): Promise<Observation | null>;
  listObservations(patientId: string): Promise<Observation[]>;
  listObservationsByDateRange(
    patientId: string,
    startDate: string,
    endDate: string
  ): Promise<Observation[]>;
  listObservationsByCategory(
    patientId: string,
    category: ObservationCategory
  ): Promise<Observation[]>;
  listObservationsBySeverity(
    patientId: string,
    severity: Severity
  ): Promise<Observation[]>;
  createObservation(data: CreateObservation): Promise<Observation>;
  updateObservation(
    id: string,
    data: UpdateObservation
  ): Promise<Observation | null>;
  deleteObservation(id: string): Promise<boolean>;

  // ============================================================================
  // Transfusion Operations
  // ============================================================================

  getTransfusion(id: string): Promise<Transfusion | null>;
  listTransfusions(patientId: string): Promise<Transfusion[]>;
  listTransfusionsByDateRange(
    patientId: string,
    startDate: string,
    endDate: string
  ): Promise<Transfusion[]>;
  listTransfusionsByType(
    patientId: string,
    type: TransfusionType
  ): Promise<Transfusion[]>;
  createTransfusion(data: CreateTransfusion): Promise<Transfusion>;
  updateTransfusion(
    id: string,
    data: UpdateTransfusion
  ): Promise<Transfusion | null>;
  deleteTransfusion(id: string): Promise<boolean>;
  getTransfusionStats(patientId: string): Promise<{
    totalCount: number;
    totalVolume: number;
    volumeByType: Record<TransfusionType, number>;
    uniqueDonors: number;
  }>;

  // ============================================================================
  // Lab Value Operations
  // ============================================================================

  getLabValue(id: string): Promise<LabValue | null>;
  listLabValues(patientId: string): Promise<LabValue[]>;
  listLabValuesByType(patientId: string, labTypeId: string): Promise<LabValue[]>;
  listLabValuesByDateRange(
    patientId: string,
    startDate: string,
    endDate: string
  ): Promise<LabValue[]>;
  createLabValue(data: CreateLabValue): Promise<LabValue>;
  updateLabValue(id: string, data: UpdateLabValue): Promise<LabValue | null>;
  deleteLabValue(id: string): Promise<boolean>;
  getAbnormalLabValues(patientId: string): Promise<LabValue[]>;
  getLabTypes(patientId: string): Promise<string[]>;

  // ============================================================================
  // Alert Operations
  // ============================================================================

  getAlert(id: string): Promise<Alert | null>;
  listAlerts(patientId: string): Promise<Alert[]>;
  listUnacknowledgedAlerts(patientId: string): Promise<Alert[]>;
  createAlert(data: CreateAlert): Promise<Alert>;
  acknowledgeAlert(id: string, acknowledgedBy?: string): Promise<Alert | null>;
  acknowledgeAllAlerts(patientId: string, acknowledgedBy?: string): Promise<number>;

  // ============================================================================
  // Sync & Export Operations
  // ============================================================================

  /** Sync data from external source (FHIR, device gateway) */
  syncFromSource(): Promise<SyncResult>;

  /** Export all data as JSON */
  exportData(): Promise<MilaDataExport>;

  /** Import data from JSON export */
  importData(data: MilaDataExport): Promise<SyncResult>;

  /** Reset all data (clear database) */
  resetData(): Promise<void>;

  /** Seed demo data */
  seedDemoData(): Promise<void>;
}

/**
 * Data Source Events
 */
export type DataSourceEvent =
  | { type: "connected" }
  | { type: "disconnected" }
  | { type: "sync-started" }
  | { type: "sync-completed"; result: SyncResult }
  | { type: "sync-failed"; error: Error }
  | { type: "data-changed"; entity: string };
