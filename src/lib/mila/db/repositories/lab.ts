import { getDB } from "../connection";
import { BaseRepository } from "./base";
import type {
  LabValue,
  CreateLabValue,
  UpdateLabValue,
} from "../../types/domain";

/**
 * Lab Value Repository
 *
 * Provides indexed queries for lab values.
 */
class LabValueRepositoryClass extends BaseRepository<
  "labValues",
  LabValue,
  CreateLabValue,
  UpdateLabValue
> {
  constructor() {
    super("labValues");
  }

  /**
   * Get all lab values for a patient (newest first)
   */
  async byPatient(patientId: string): Promise<LabValue[]> {
    const db = await getDB();
    const labs = await db.getAllFromIndex("labValues", "by-patientId", patientId);
    return labs.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }

  /**
   * Get lab values for a patient filtered by lab type
   */
  async byPatientAndLabType(
    patientId: string,
    labTypeId: string
  ): Promise<LabValue[]> {
    const db = await getDB();
    const labs = await db.getAllFromIndex(
      "labValues",
      "by-patientId-labTypeId",
      [patientId, labTypeId]
    );
    return labs.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }

  /**
   * Get lab values for a patient within a date range
   */
  async byPatientAndDateRange(
    patientId: string,
    startDate: string,
    endDate: string
  ): Promise<LabValue[]> {
    const db = await getDB();
    const range = IDBKeyRange.bound(
      [patientId, startDate],
      [patientId, endDate]
    );
    const labs = await db.getAllFromIndex(
      "labValues",
      "by-patientId-occurredAt",
      range
    );
    return labs.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }

  /**
   * Get lab values for a patient filtered by lab type within a date range
   */
  async byPatientLabTypeAndDateRange(
    patientId: string,
    labTypeId: string,
    startDate: string,
    endDate: string
  ): Promise<LabValue[]> {
    const db = await getDB();
    const range = IDBKeyRange.bound(
      [patientId, labTypeId, startDate],
      [patientId, labTypeId, endDate]
    );
    const labs = await db.getAllFromIndex(
      "labValues",
      "by-patientId-labTypeId-occurredAt",
      range
    );
    return labs.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }

  /**
   * Count lab values by patient
   */
  async countByPatient(patientId: string): Promise<number> {
    const db = await getDB();
    return db.countFromIndex("labValues", "by-patientId", patientId);
  }

  /**
   * Get the latest lab value for a specific type
   */
  async getLatestByType(
    patientId: string,
    labTypeId: string
  ): Promise<LabValue | null> {
    const labs = await this.byPatientAndLabType(patientId, labTypeId);
    return labs.length > 0 ? labs[0] : null;
  }

  /**
   * Get all abnormal lab values for a patient
   * (values outside reference range)
   */
  async getAbnormalByPatient(patientId: string): Promise<LabValue[]> {
    const labs = await this.byPatient(patientId);
    return labs.filter((lab) => {
      if (lab.refRangeLow !== undefined && lab.value < lab.refRangeLow) {
        return true;
      }
      if (lab.refRangeHigh !== undefined && lab.value > lab.refRangeHigh) {
        return true;
      }
      return false;
    });
  }

  /**
   * Get lab value trend data for charts
   * Returns data sorted by date (oldest first) for chart display
   */
  async getTrendDataByType(
    patientId: string,
    labTypeId: string
  ): Promise<
    Array<{
      occurredAt: string;
      value: number;
      refRangeLow?: number;
      refRangeHigh?: number;
      isAbnormal: boolean;
    }>
  > {
    const labs = await this.byPatientAndLabType(patientId, labTypeId);

    // Sort oldest first for trend chart
    labs.sort(
      (a, b) =>
        new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
    );

    return labs.map((lab) => ({
      occurredAt: lab.occurredAt,
      value: lab.value,
      refRangeLow: lab.refRangeLow,
      refRangeHigh: lab.refRangeHigh,
      isAbnormal:
        (lab.refRangeLow !== undefined && lab.value < lab.refRangeLow) ||
        (lab.refRangeHigh !== undefined && lab.value > lab.refRangeHigh),
    }));
  }

  /**
   * Get unique lab types for a patient
   */
  async getLabTypesForPatient(patientId: string): Promise<string[]> {
    const labs = await this.byPatient(patientId);
    const types = new Set(labs.map((l) => l.labTypeId));
    return Array.from(types);
  }

  /**
   * Count abnormal labs for a patient
   */
  async countAbnormalByPatient(patientId: string): Promise<number> {
    const abnormal = await this.getAbnormalByPatient(patientId);
    return abnormal.length;
  }
}

// Export singleton instance
export const LabValueRepository = new LabValueRepositoryClass();
