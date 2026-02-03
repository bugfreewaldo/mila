import { getDB } from "../connection";
import { BaseRepository } from "./base";
import type {
  Observation,
  CreateObservation,
  UpdateObservation,
  ObservationCategory,
  Severity,
} from "../../types/domain";

/**
 * Observation Repository
 *
 * Provides indexed queries for observations.
 */
class ObservationRepositoryClass extends BaseRepository<
  "observations",
  Observation,
  CreateObservation,
  UpdateObservation
> {
  constructor() {
    super("observations");
  }

  /**
   * Get all observations for a patient (newest first)
   */
  async byPatient(patientId: string): Promise<Observation[]> {
    const db = await getDB();
    const observations = await db.getAllFromIndex(
      "observations",
      "by-patientId",
      patientId
    );
    // Sort by occurredAt descending
    return observations.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }

  /**
   * Get observations for a patient within a date range
   */
  async byPatientAndDateRange(
    patientId: string,
    startDate: string,
    endDate: string
  ): Promise<Observation[]> {
    const db = await getDB();
    const range = IDBKeyRange.bound(
      [patientId, startDate],
      [patientId, endDate]
    );
    const observations = await db.getAllFromIndex(
      "observations",
      "by-patientId-occurredAt",
      range
    );
    return observations.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }

  /**
   * Get observations for a patient filtered by category
   */
  async byPatientAndCategory(
    patientId: string,
    category: ObservationCategory
  ): Promise<Observation[]> {
    const db = await getDB();
    const observations = await db.getAllFromIndex(
      "observations",
      "by-patientId-category",
      [patientId, category]
    );
    return observations.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }

  /**
   * Get observations for a patient filtered by severity
   */
  async byPatientAndSeverity(
    patientId: string,
    severity: Severity
  ): Promise<Observation[]> {
    const db = await getDB();
    const observations = await db.getAllFromIndex(
      "observations",
      "by-patientId-severity",
      [patientId, severity]
    );
    return observations.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }

  /**
   * Get recent observations for a patient (last N hours)
   */
  async recentByPatient(
    patientId: string,
    hoursBack: number = 24
  ): Promise<Observation[]> {
    const startDate = new Date(
      Date.now() - hoursBack * 60 * 60 * 1000
    ).toISOString();
    const endDate = new Date().toISOString();
    return this.byPatientAndDateRange(patientId, startDate, endDate);
  }

  /**
   * Count observations by patient
   */
  async countByPatient(patientId: string): Promise<number> {
    const db = await getDB();
    return db.countFromIndex("observations", "by-patientId", patientId);
  }

  /**
   * Get critical observations for a patient
   */
  async criticalByPatient(patientId: string): Promise<Observation[]> {
    return this.byPatientAndSeverity(patientId, "critical");
  }
}

// Export singleton instance
export const ObservationRepository = new ObservationRepositoryClass();
