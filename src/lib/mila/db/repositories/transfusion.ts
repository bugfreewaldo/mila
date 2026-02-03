import { getDB } from "../connection";
import { BaseRepository } from "./base";
import type {
  Transfusion,
  CreateTransfusion,
  UpdateTransfusion,
  TransfusionType,
} from "../../types/domain";

/**
 * Transfusion Repository
 *
 * Provides indexed queries for transfusions.
 */
class TransfusionRepositoryClass extends BaseRepository<
  "transfusions",
  Transfusion,
  CreateTransfusion,
  UpdateTransfusion
> {
  constructor() {
    super("transfusions");
  }

  /**
   * Get all transfusions for a patient (newest first)
   */
  async byPatient(patientId: string): Promise<Transfusion[]> {
    const db = await getDB();
    const transfusions = await db.getAllFromIndex(
      "transfusions",
      "by-patientId",
      patientId
    );
    return transfusions.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }

  /**
   * Get transfusions for a patient within a date range
   */
  async byPatientAndDateRange(
    patientId: string,
    startDate: string,
    endDate: string
  ): Promise<Transfusion[]> {
    const db = await getDB();
    const range = IDBKeyRange.bound(
      [patientId, startDate],
      [patientId, endDate]
    );
    const transfusions = await db.getAllFromIndex(
      "transfusions",
      "by-patientId-occurredAt",
      range
    );
    return transfusions.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }

  /**
   * Get transfusions for a patient filtered by type
   */
  async byPatientAndType(
    patientId: string,
    type: TransfusionType
  ): Promise<Transfusion[]> {
    const db = await getDB();
    const transfusions = await db.getAllFromIndex(
      "transfusions",
      "by-patientId-type",
      [patientId, type]
    );
    return transfusions.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }

  /**
   * Count transfusions by patient
   */
  async countByPatient(patientId: string): Promise<number> {
    const db = await getDB();
    return db.countFromIndex("transfusions", "by-patientId", patientId);
  }

  /**
   * Get total volume by type for a patient
   */
  async getTotalVolumeByType(
    patientId: string
  ): Promise<Record<TransfusionType, number>> {
    const transfusions = await this.byPatient(patientId);

    const totals: Record<TransfusionType, number> = {
      rbc: 0,
      platelet: 0,
      plasma: 0,
      other: 0,
    };

    for (const t of transfusions) {
      totals[t.type] += t.volumeMl;
    }

    return totals;
  }

  /**
   * Get cumulative transfusion data for charts
   * Returns array sorted by date with running totals
   */
  async getCumulativeByPatient(
    patientId: string
  ): Promise<
    Array<{
      occurredAt: string;
      type: TransfusionType;
      volumeMl: number;
      cumulativeRbc: number;
      cumulativePlatelet: number;
      cumulativePlasma: number;
      cumulativeOther: number;
      cumulativeTotal: number;
    }>
  > {
    const transfusions = await this.byPatient(patientId);

    // Sort oldest first for cumulative calculation
    transfusions.sort(
      (a, b) =>
        new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
    );

    let cumulativeRbc = 0;
    let cumulativePlatelet = 0;
    let cumulativePlasma = 0;
    let cumulativeOther = 0;

    return transfusions.map((t) => {
      switch (t.type) {
        case "rbc":
          cumulativeRbc += t.volumeMl;
          break;
        case "platelet":
          cumulativePlatelet += t.volumeMl;
          break;
        case "plasma":
          cumulativePlasma += t.volumeMl;
          break;
        case "other":
          cumulativeOther += t.volumeMl;
          break;
      }

      return {
        occurredAt: t.occurredAt,
        type: t.type,
        volumeMl: t.volumeMl,
        cumulativeRbc,
        cumulativePlatelet,
        cumulativePlasma,
        cumulativeOther,
        cumulativeTotal:
          cumulativeRbc + cumulativePlatelet + cumulativePlasma + cumulativeOther,
      };
    });
  }

  /**
   * Get unique donor count for a patient
   */
  async getUniqueDonorCount(patientId: string): Promise<number> {
    const transfusions = await this.byPatient(patientId);
    const uniqueDonors = new Set(transfusions.map((t) => t.donorId));
    return uniqueDonors.size;
  }
}

// Export singleton instance
export const TransfusionRepository = new TransfusionRepositoryClass();
