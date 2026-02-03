import { getDB } from "../connection";
import { BaseRepository } from "./base";
import type {
  ClinicalStatus,
  CreateClinicalStatus,
  UpdateClinicalStatus,
  RespiratorySupport,
  PhototherapyType,
} from "../../types/domain";

/**
 * Clinical Status Repository
 *
 * Tracks respiratory support, phototherapy, and developmental care status
 * changes over time for each patient.
 */
class ClinicalStatusRepositoryClass extends BaseRepository<
  "clinicalStatuses",
  ClinicalStatus,
  CreateClinicalStatus,
  UpdateClinicalStatus
> {
  constructor() {
    super("clinicalStatuses");
  }

  /**
   * Get all clinical status records for a patient (newest first)
   */
  async byPatient(patientId: string): Promise<ClinicalStatus[]> {
    const db = await getDB();
    const statuses = await db.getAllFromIndex(
      "clinicalStatuses",
      "by-patientId",
      patientId
    );
    return statuses.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }

  /**
   * Get the most recent clinical status for a patient
   */
  async getCurrentStatus(patientId: string): Promise<ClinicalStatus | null> {
    const statuses = await this.byPatient(patientId);
    return statuses[0] || null;
  }

  /**
   * Get clinical status records within a date range
   */
  async byPatientAndDateRange(
    patientId: string,
    startDate: string,
    endDate: string
  ): Promise<ClinicalStatus[]> {
    const db = await getDB();
    const range = IDBKeyRange.bound(
      [patientId, startDate],
      [patientId, endDate]
    );
    const statuses = await db.getAllFromIndex(
      "clinicalStatuses",
      "by-patientId-occurredAt",
      range
    );
    return statuses.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }

  /**
   * Get respiratory support history summary
   */
  async getRespiratoryHistory(
    patientId: string
  ): Promise<
    Array<{
      support: RespiratorySupport;
      startedAt: string;
      endedAt: string | null;
      durationHours: number | null;
    }>
  > {
    const statuses = await this.byPatient(patientId);

    // Reverse to chronological order
    const chronological = [...statuses].reverse();

    const history: Array<{
      support: RespiratorySupport;
      startedAt: string;
      endedAt: string | null;
      durationHours: number | null;
    }> = [];

    for (let i = 0; i < chronological.length; i++) {
      const current = chronological[i];
      const next = chronological[i + 1];

      const endedAt = next?.occurredAt || null;
      const durationHours = endedAt
        ? (new Date(endedAt).getTime() - new Date(current.occurredAt).getTime()) / (1000 * 60 * 60)
        : null;

      history.push({
        support: current.respiratorySupport,
        startedAt: current.occurredAt,
        endedAt,
        durationHours: durationHours ? Math.round(durationHours * 10) / 10 : null,
      });
    }

    return history.reverse(); // Return newest first
  }

  /**
   * Calculate total time on each respiratory support type
   */
  async getRespiratoryTotals(
    patientId: string
  ): Promise<Record<RespiratorySupport, number>> {
    const history = await this.getRespiratoryHistory(patientId);

    const totals: Record<RespiratorySupport, number> = {
      room_air: 0,
      low_flow_nc: 0,
      high_flow_nc: 0,
      cpap: 0,
      bipap: 0,
      nippv: 0,
      oxygen_hood: 0,
      intubated_conv: 0,
      intubated_hfov: 0,
      intubated_hfjv: 0,
    };

    for (const entry of history) {
      if (entry.durationHours !== null) {
        totals[entry.support] += entry.durationHours;
      }
    }

    return totals;
  }

  /**
   * Calculate total phototherapy hours
   */
  async getTotalPhototherapyHours(patientId: string): Promise<number> {
    const statuses = await this.byPatient(patientId);

    // Reverse to chronological order
    const chronological = [...statuses].reverse();

    let totalHours = 0;

    for (let i = 0; i < chronological.length; i++) {
      const current = chronological[i];
      const next = chronological[i + 1];

      // Skip if no phototherapy
      if (current.phototherapy === "none") continue;

      const endedAt = next?.occurredAt || new Date().toISOString();
      const durationHours =
        (new Date(endedAt).getTime() - new Date(current.occurredAt).getTime()) /
        (1000 * 60 * 60);

      totalHours += durationHours;
    }

    return Math.round(totalHours * 10) / 10;
  }

  /**
   * Check if patient is currently intubated
   */
  async isIntubated(patientId: string): Promise<boolean> {
    const current = await this.getCurrentStatus(patientId);
    if (!current) return false;

    return [
      "intubated_conv",
      "intubated_hfov",
      "intubated_hfjv",
    ].includes(current.respiratorySupport);
  }

  /**
   * Check if patient is currently on phototherapy
   */
  async isOnPhototherapy(patientId: string): Promise<boolean> {
    const current = await this.getCurrentStatus(patientId);
    if (!current) return false;

    return current.phototherapy !== "none";
  }

  /**
   * Get a clinical summary for display
   */
  async getClinicalSummary(patientId: string): Promise<{
    respiratorySupport: RespiratorySupport;
    respiratoryLabel: { en: string; es: string };
    fio2: number | null;
    phototherapy: PhototherapyType;
    phototherapyLabel: { en: string; es: string };
    totalPhototherapyHours: number;
    onCaffeine: boolean;
    hasUmbilicalLines: boolean;
    hasCentralLine: boolean;
    activeDevelopmentalCare: string[];
  } | null> {
    const current = await this.getCurrentStatus(patientId);
    if (!current) return null;

    const respiratoryLabels: Record<RespiratorySupport, { en: string; es: string }> = {
      room_air: { en: "Room Air", es: "Aire ambiente" },
      low_flow_nc: { en: "Low Flow NC", es: "Cánula bajo flujo" },
      high_flow_nc: { en: "High Flow NC", es: "Cánula alto flujo" },
      cpap: { en: "CPAP", es: "CPAP" },
      bipap: { en: "BiPAP", es: "BiPAP" },
      nippv: { en: "NIPPV", es: "VPPNI" },
      oxygen_hood: { en: "Oxygen Hood", es: "Casco de O₂" },
      intubated_conv: { en: "Intubated (CMV)", es: "Intubado (VMC)" },
      intubated_hfov: { en: "Intubated (HFOV)", es: "Intubado (VAFO)" },
      intubated_hfjv: { en: "Intubated (HFJV)", es: "Intubado (VJAF)" },
    };

    const phototherapyLabels: Record<PhototherapyType, { en: string; es: string }> = {
      none: { en: "None", es: "Ninguna" },
      conventional: { en: "Conventional", es: "Convencional" },
      led: { en: "LED", es: "LED" },
      biliblanket: { en: "Biliblanket", es: "Biliblanket" },
      double: { en: "Double", es: "Doble" },
      intensive: { en: "Intensive", es: "Intensiva" },
    };

    const totalPhototherapyHours = await this.getTotalPhototherapyHours(patientId);

    return {
      respiratorySupport: current.respiratorySupport,
      respiratoryLabel: respiratoryLabels[current.respiratorySupport],
      fio2: current.fio2 ?? null,
      phototherapy: current.phototherapy,
      phototherapyLabel: phototherapyLabels[current.phototherapy],
      totalPhototherapyHours,
      onCaffeine: current.caffeineCitrate,
      hasUmbilicalLines: current.umbilicalLines,
      hasCentralLine: current.centralLine,
      activeDevelopmentalCare: current.activeDevelopmentalCare,
    };
  }
}

// Export singleton instance
export const ClinicalStatusRepository = new ClinicalStatusRepositoryClass();
