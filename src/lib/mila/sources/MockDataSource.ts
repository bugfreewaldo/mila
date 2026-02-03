/**
 * Mock Data Source
 *
 * Implementation of IDataSource using IndexedDB for local-first storage.
 * Used for MVP development and testing.
 */

import type { IDataSource, DataSourceType } from "./IDataSource";
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
import {
  PatientRepository,
  ObservationRepository,
  TransfusionRepository,
  LabValueRepository,
  AlertRepository,
  PhlebotomyRepository,
  FeedingRepository,
  OrderRepository,
  ClinicalStatusRepository,
} from "../db/repositories";
import { deleteDatabase, isDatabaseInitialized } from "../db/connection";
import { generateDemoData } from "../data/demo-data";
import { nowISO } from "../utils/dates";

class MockDataSourceClass implements IDataSource {
  readonly name = "Mock Data";
  readonly type: DataSourceType = "mock";

  // ============================================================================
  // Connection
  // ============================================================================

  async isConnected(): Promise<boolean> {
    try {
      await PatientRepository.count();
      return true;
    } catch {
      return false;
    }
  }

  // ============================================================================
  // Patient Operations
  // ============================================================================

  async getPatient(id: string): Promise<Patient | null> {
    return PatientRepository.getById(id);
  }

  async getDefaultPatient(): Promise<Patient | null> {
    return PatientRepository.getDefault();
  }

  async listPatients(): Promise<Patient[]> {
    return PatientRepository.getAllByCreatedAt();
  }

  async createPatient(data: CreatePatient): Promise<Patient> {
    return PatientRepository.create(data);
  }

  async updatePatient(id: string, data: UpdatePatient): Promise<Patient | null> {
    return PatientRepository.update(id, data);
  }

  async deletePatient(id: string): Promise<boolean> {
    return PatientRepository.delete(id);
  }

  // ============================================================================
  // Observation Operations
  // ============================================================================

  async getObservation(id: string): Promise<Observation | null> {
    return ObservationRepository.getById(id);
  }

  async listObservations(patientId: string): Promise<Observation[]> {
    return ObservationRepository.byPatient(patientId);
  }

  async listObservationsByDateRange(
    patientId: string,
    startDate: string,
    endDate: string
  ): Promise<Observation[]> {
    return ObservationRepository.byPatientAndDateRange(patientId, startDate, endDate);
  }

  async listObservationsByCategory(
    patientId: string,
    category: ObservationCategory
  ): Promise<Observation[]> {
    return ObservationRepository.byPatientAndCategory(patientId, category);
  }

  async listObservationsBySeverity(
    patientId: string,
    severity: Severity
  ): Promise<Observation[]> {
    return ObservationRepository.byPatientAndSeverity(patientId, severity);
  }

  async createObservation(data: CreateObservation): Promise<Observation> {
    return ObservationRepository.create(data);
  }

  async updateObservation(
    id: string,
    data: UpdateObservation
  ): Promise<Observation | null> {
    return ObservationRepository.update(id, data);
  }

  async deleteObservation(id: string): Promise<boolean> {
    return ObservationRepository.delete(id);
  }

  // ============================================================================
  // Transfusion Operations
  // ============================================================================

  async getTransfusion(id: string): Promise<Transfusion | null> {
    return TransfusionRepository.getById(id);
  }

  async listTransfusions(patientId: string): Promise<Transfusion[]> {
    return TransfusionRepository.byPatient(patientId);
  }

  async listTransfusionsByDateRange(
    patientId: string,
    startDate: string,
    endDate: string
  ): Promise<Transfusion[]> {
    return TransfusionRepository.byPatientAndDateRange(patientId, startDate, endDate);
  }

  async listTransfusionsByType(
    patientId: string,
    type: TransfusionType
  ): Promise<Transfusion[]> {
    return TransfusionRepository.byPatientAndType(patientId, type);
  }

  async createTransfusion(data: CreateTransfusion): Promise<Transfusion> {
    return TransfusionRepository.create(data);
  }

  async updateTransfusion(
    id: string,
    data: UpdateTransfusion
  ): Promise<Transfusion | null> {
    return TransfusionRepository.update(id, data);
  }

  async deleteTransfusion(id: string): Promise<boolean> {
    return TransfusionRepository.delete(id);
  }

  async getTransfusionStats(patientId: string): Promise<{
    totalCount: number;
    totalVolume: number;
    volumeByType: Record<TransfusionType, number>;
    uniqueDonors: number;
  }> {
    const transfusions = await TransfusionRepository.byPatient(patientId);
    const volumeByType = await TransfusionRepository.getTotalVolumeByType(patientId);
    const uniqueDonors = await TransfusionRepository.getUniqueDonorCount(patientId);

    return {
      totalCount: transfusions.length,
      totalVolume: Object.values(volumeByType).reduce((a, b) => a + b, 0),
      volumeByType,
      uniqueDonors,
    };
  }

  // ============================================================================
  // Lab Value Operations
  // ============================================================================

  async getLabValue(id: string): Promise<LabValue | null> {
    return LabValueRepository.getById(id);
  }

  async listLabValues(patientId: string): Promise<LabValue[]> {
    return LabValueRepository.byPatient(patientId);
  }

  async listLabValuesByType(
    patientId: string,
    labTypeId: string
  ): Promise<LabValue[]> {
    return LabValueRepository.byPatientAndLabType(patientId, labTypeId);
  }

  async listLabValuesByDateRange(
    patientId: string,
    startDate: string,
    endDate: string
  ): Promise<LabValue[]> {
    return LabValueRepository.byPatientAndDateRange(patientId, startDate, endDate);
  }

  async createLabValue(data: CreateLabValue): Promise<LabValue> {
    return LabValueRepository.create(data);
  }

  async updateLabValue(
    id: string,
    data: UpdateLabValue
  ): Promise<LabValue | null> {
    return LabValueRepository.update(id, data);
  }

  async deleteLabValue(id: string): Promise<boolean> {
    return LabValueRepository.delete(id);
  }

  async getAbnormalLabValues(patientId: string): Promise<LabValue[]> {
    return LabValueRepository.getAbnormalByPatient(patientId);
  }

  async getLabTypes(patientId: string): Promise<string[]> {
    return LabValueRepository.getLabTypesForPatient(patientId);
  }

  // ============================================================================
  // Alert Operations
  // ============================================================================

  async getAlert(id: string): Promise<Alert | null> {
    return AlertRepository.getById(id);
  }

  async listAlerts(patientId: string): Promise<Alert[]> {
    return AlertRepository.byPatient(patientId);
  }

  async listUnacknowledgedAlerts(patientId: string): Promise<Alert[]> {
    return AlertRepository.byPatientUnacknowledged(patientId);
  }

  async createAlert(data: CreateAlert): Promise<Alert> {
    return AlertRepository.create(data);
  }

  async acknowledgeAlert(
    id: string,
    acknowledgedBy?: string
  ): Promise<Alert | null> {
    return AlertRepository.acknowledge(id, acknowledgedBy);
  }

  async acknowledgeAllAlerts(
    patientId: string,
    acknowledgedBy?: string
  ): Promise<number> {
    return AlertRepository.acknowledgeAllByPatient(patientId, acknowledgedBy);
  }

  // ============================================================================
  // Sync & Export Operations
  // ============================================================================

  async syncFromSource(): Promise<SyncResult> {
    // Mock data source doesn't sync from external sources
    return {
      success: true,
      syncedAt: nowISO(),
      recordsProcessed: 0,
      errors: [],
    };
  }

  async exportData(): Promise<MilaDataExport> {
    const patient = await this.getDefaultPatient();
    const patientId = patient?.id;

    return {
      version: "2.0.0",
      exportedAt: nowISO(),
      patient,
      observations: patientId
        ? await ObservationRepository.byPatient(patientId)
        : [],
      transfusions: patientId
        ? await TransfusionRepository.byPatient(patientId)
        : [],
      labValues: patientId ? await LabValueRepository.byPatient(patientId) : [],
      alerts: patientId ? await AlertRepository.byPatient(patientId) : [],
      phlebotomies: patientId
        ? await PhlebotomyRepository.byPatient(patientId)
        : [],
      feedings: patientId
        ? await FeedingRepository.byPatient(patientId)
        : [],
      orders: patientId
        ? await OrderRepository.byPatient(patientId)
        : [],
      clinicalStatuses: patientId
        ? await ClinicalStatusRepository.byPatient(patientId)
        : [],
      developmentalCareSessions: [], // TODO: Add DevelopmentalCareSessionRepository when implemented
    };
  }

  async importData(data: MilaDataExport): Promise<SyncResult> {
    const errors: Array<{ recordType: string; recordId?: string; message: string }> = [];
    let recordsProcessed = 0;

    try {
      // Clear existing data
      await this.resetData();

      // Import patient
      if (data.patient) {
        await PatientRepository.create({
          displayName: data.patient.displayName,
          birthDate: data.patient.birthDate,
          gestationalAgeWeeks: data.patient.gestationalAgeWeeks,
          birthWeightGrams: data.patient.birthWeightGrams,
          bloodType: data.patient.bloodType,
          parentContacts: data.patient.parentContacts || [],
        });
        recordsProcessed++;
      }

      // Import observations
      for (const obs of data.observations) {
        try {
          await ObservationRepository.create({
            patientId: obs.patientId,
            occurredAt: obs.occurredAt,
            category: obs.category,
            severity: obs.severity,
            source: obs.source,
            content: obs.content,
            tags: obs.tags,
          });
          recordsProcessed++;
        } catch (e) {
          errors.push({
            recordType: "observation",
            recordId: obs.id,
            message: String(e),
          });
        }
      }

      // Import transfusions
      for (const trans of data.transfusions) {
        try {
          await TransfusionRepository.create({
            patientId: trans.patientId,
            occurredAt: trans.occurredAt,
            type: trans.type,
            volumeMl: trans.volumeMl,
            donorId: trans.donorId,
            notes: trans.notes,
            isEmergency: trans.isEmergency ?? false,
            parentConsentObtained: trans.parentConsentObtained ?? true,
            parentConsentAt: trans.parentConsentAt,
            clinicalJustification: trans.clinicalJustification,
          });
          recordsProcessed++;
        } catch (e) {
          errors.push({
            recordType: "transfusion",
            recordId: trans.id,
            message: String(e),
          });
        }
      }

      // Import lab values
      for (const lab of data.labValues) {
        try {
          await LabValueRepository.create({
            patientId: lab.patientId,
            occurredAt: lab.occurredAt,
            labTypeId: lab.labTypeId,
            value: lab.value,
            unit: lab.unit,
            refRangeLow: lab.refRangeLow,
            refRangeHigh: lab.refRangeHigh,
          });
          recordsProcessed++;
        } catch (e) {
          errors.push({
            recordType: "labValue",
            recordId: lab.id,
            message: String(e),
          });
        }
      }

      // Import alerts
      for (const alert of data.alerts) {
        try {
          await AlertRepository.create({
            patientId: alert.patientId,
            occurredAt: alert.occurredAt,
            type: alert.type,
            severity: alert.severity,
            message: alert.message,
            acknowledged: alert.acknowledged,
            acknowledgedAt: alert.acknowledgedAt,
            acknowledgedBy: alert.acknowledgedBy,
          });
          recordsProcessed++;
        } catch (e) {
          errors.push({
            recordType: "alert",
            recordId: alert.id,
            message: String(e),
          });
        }
      }

      return {
        success: errors.length === 0,
        syncedAt: nowISO(),
        recordsProcessed,
        errors,
      };
    } catch (e) {
      return {
        success: false,
        syncedAt: nowISO(),
        recordsProcessed,
        errors: [{ recordType: "import", message: String(e) }],
      };
    }
  }

  async resetData(): Promise<void> {
    await deleteDatabase();
  }

  async seedDemoData(): Promise<void> {
    const isInitialized = await isDatabaseInitialized();

    if (!isInitialized) {
      await generateDemoData();
    }
  }
}

// Export singleton instance
export const MockDataSource = new MockDataSourceClass();
