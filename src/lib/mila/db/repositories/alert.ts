import { getDB } from "../connection";
import { BaseRepository } from "./base";
import type { Alert, CreateAlert, UpdateAlert } from "../../types/domain";
import { nowISO } from "../../utils/dates";

/**
 * Alert Repository
 *
 * Provides indexed queries for alerts.
 */
class AlertRepositoryClass extends BaseRepository<
  "alerts",
  Alert,
  CreateAlert,
  UpdateAlert
> {
  constructor() {
    super("alerts");
  }

  /**
   * Get all alerts for a patient (newest first)
   */
  async byPatient(patientId: string): Promise<Alert[]> {
    const db = await getDB();
    const alerts = await db.getAllFromIndex("alerts", "by-patientId", patientId);
    return alerts.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }

  /**
   * Get alerts for a patient within a date range
   */
  async byPatientAndDateRange(
    patientId: string,
    startDate: string,
    endDate: string
  ): Promise<Alert[]> {
    const db = await getDB();
    const range = IDBKeyRange.bound(
      [patientId, startDate],
      [patientId, endDate]
    );
    const alerts = await db.getAllFromIndex(
      "alerts",
      "by-patientId-occurredAt",
      range
    );
    return alerts.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }

  /**
   * Get unacknowledged alerts for a patient
   */
  async byPatientUnacknowledged(patientId: string): Promise<Alert[]> {
    const db = await getDB();
    // IndexedDB stores boolean as 0/1, but we stored it as boolean
    // We need to filter manually since compound index with boolean is tricky
    const alerts = await this.byPatient(patientId);
    return alerts.filter((a) => !a.acknowledged);
  }

  /**
   * Get acknowledged alerts for a patient
   */
  async byPatientAcknowledged(patientId: string): Promise<Alert[]> {
    const alerts = await this.byPatient(patientId);
    return alerts.filter((a) => a.acknowledged);
  }

  /**
   * Count unacknowledged alerts for a patient
   */
  async countUnacknowledgedByPatient(patientId: string): Promise<number> {
    const alerts = await this.byPatientUnacknowledged(patientId);
    return alerts.length;
  }

  /**
   * Acknowledge an alert
   */
  async acknowledge(
    id: string,
    acknowledgedBy?: string
  ): Promise<Alert | null> {
    return this.update(id, {
      acknowledged: true,
      acknowledgedAt: nowISO(),
      acknowledgedBy,
    });
  }

  /**
   * Acknowledge all alerts for a patient
   */
  async acknowledgeAllByPatient(
    patientId: string,
    acknowledgedBy?: string
  ): Promise<number> {
    const unacknowledged = await this.byPatientUnacknowledged(patientId);
    const now = nowISO();

    let count = 0;
    for (const alert of unacknowledged) {
      await this.update(alert.id, {
        acknowledged: true,
        acknowledgedAt: now,
        acknowledgedBy,
      });
      count++;
    }

    return count;
  }

  /**
   * Get recent alerts (last N hours)
   */
  async recentByPatient(
    patientId: string,
    hoursBack: number = 24
  ): Promise<Alert[]> {
    const startDate = new Date(
      Date.now() - hoursBack * 60 * 60 * 1000
    ).toISOString();
    const endDate = new Date().toISOString();
    return this.byPatientAndDateRange(patientId, startDate, endDate);
  }

  /**
   * Get critical unacknowledged alerts
   */
  async getCriticalUnacknowledged(patientId: string): Promise<Alert[]> {
    const unacknowledged = await this.byPatientUnacknowledged(patientId);
    return unacknowledged.filter((a) => a.severity === "critical");
  }

  /**
   * Get alert counts by type for statistics
   */
  async getAlertCountsByType(
    patientId: string
  ): Promise<Record<string, number>> {
    const alerts = await this.byPatient(patientId);
    const counts: Record<string, number> = {};

    for (const alert of alerts) {
      counts[alert.type] = (counts[alert.type] || 0) + 1;
    }

    return counts;
  }
}

// Export singleton instance
export const AlertRepository = new AlertRepositoryClass();
