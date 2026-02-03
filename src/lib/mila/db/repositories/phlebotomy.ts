import { getDB } from "../connection";
import { BaseRepository } from "./base";
import type {
  Phlebotomy,
  CreatePhlebotomy,
  UpdatePhlebotomy,
} from "../../types/domain";

/**
 * Phlebotomy Repository
 *
 * Tracks blood draws for monitoring iatrogenic blood loss.
 * Critical for premature neonates who have limited blood volume.
 */
class PhlebotomyRepositoryClass extends BaseRepository<
  "phlebotomies",
  Phlebotomy,
  CreatePhlebotomy,
  UpdatePhlebotomy
> {
  constructor() {
    super("phlebotomies");
  }

  /**
   * Get all phlebotomies for a patient (newest first)
   */
  async byPatient(patientId: string): Promise<Phlebotomy[]> {
    const db = await getDB();
    const phlebotomies = await db.getAllFromIndex(
      "phlebotomies",
      "by-patientId",
      patientId
    );
    return phlebotomies.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }

  /**
   * Get phlebotomies for a patient within a date range
   */
  async byPatientAndDateRange(
    patientId: string,
    startDate: string,
    endDate: string
  ): Promise<Phlebotomy[]> {
    const db = await getDB();
    const range = IDBKeyRange.bound(
      [patientId, startDate],
      [patientId, endDate]
    );
    const phlebotomies = await db.getAllFromIndex(
      "phlebotomies",
      "by-patientId-occurredAt",
      range
    );
    return phlebotomies.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }

  /**
   * Calculate total blood loss from phlebotomies
   */
  async getTotalBloodLoss(patientId: string): Promise<number> {
    const phlebotomies = await this.byPatient(patientId);
    return phlebotomies.reduce((total, p) => total + p.volumeMl, 0);
  }

  /**
   * Get cumulative blood loss data for charts
   */
  async getCumulativeBloodLoss(
    patientId: string
  ): Promise<
    Array<{
      occurredAt: string;
      volumeMl: number;
      cumulativeMl: number;
      type: string;
    }>
  > {
    const phlebotomies = await this.byPatient(patientId);

    // Sort oldest first for cumulative calculation
    phlebotomies.sort(
      (a, b) =>
        new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
    );

    let cumulative = 0;

    return phlebotomies.map((p) => {
      cumulative += p.volumeMl;
      return {
        occurredAt: p.occurredAt,
        volumeMl: p.volumeMl,
        cumulativeMl: cumulative,
        type: p.type,
      };
    });
  }

  /**
   * Calculate blood loss status based on weight
   * Neonates have ~80-100 ml/kg blood volume
   * Warning at 10% loss, critical at 15% loss
   */
  async getBloodLossStatus(
    patientId: string,
    birthWeightGrams: number
  ): Promise<{
    totalMl: number;
    mlPerKg: number;
    percentOfBloodVolume: number;
    status: "ok" | "warning" | "critical";
    message: string;
    messageEs: string;
  }> {
    const totalMl = await this.getTotalBloodLoss(patientId);
    const birthWeightKg = birthWeightGrams / 1000;
    const mlPerKg = totalMl / birthWeightKg;

    // Estimated blood volume: 85 ml/kg for preterm
    const estimatedBloodVolume = birthWeightKg * 85;
    const percentOfBloodVolume = (totalMl / estimatedBloodVolume) * 100;

    let status: "ok" | "warning" | "critical" = "ok";
    let message: string;
    let messageEs: string;

    if (percentOfBloodVolume >= 15) {
      status = "critical";
      message = `Critical: ${totalMl.toFixed(0)} ml drawn (${percentOfBloodVolume.toFixed(1)}% of blood volume). Consider transfusion threshold.`;
      messageEs = `Crítico: ${totalMl.toFixed(0)} ml extraídos (${percentOfBloodVolume.toFixed(1)}% del volumen sanguíneo). Considerar umbral de transfusión.`;
    } else if (percentOfBloodVolume >= 10) {
      status = "warning";
      message = `Warning: ${totalMl.toFixed(0)} ml drawn (${percentOfBloodVolume.toFixed(1)}% of blood volume). Monitor hemoglobin closely.`;
      messageEs = `Advertencia: ${totalMl.toFixed(0)} ml extraídos (${percentOfBloodVolume.toFixed(1)}% del volumen sanguíneo). Monitorear hemoglobina de cerca.`;
    } else {
      message = `${totalMl.toFixed(0)} ml drawn (${percentOfBloodVolume.toFixed(1)}% of blood volume)`;
      messageEs = `${totalMl.toFixed(0)} ml extraídos (${percentOfBloodVolume.toFixed(1)}% del volumen sanguíneo)`;
    }

    return {
      totalMl,
      mlPerKg,
      percentOfBloodVolume,
      status,
      message,
      messageEs,
    };
  }

  /**
   * Get phlebotomies in last 24 hours
   */
  async getLast24Hours(patientId: string): Promise<Phlebotomy[]> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return this.byPatientAndDateRange(
      patientId,
      yesterday.toISOString(),
      now.toISOString()
    );
  }

  /**
   * Get phlebotomies in last 7 days
   */
  async getLast7Days(patientId: string): Promise<Phlebotomy[]> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return this.byPatientAndDateRange(
      patientId,
      weekAgo.toISOString(),
      now.toISOString()
    );
  }
}

// Export singleton instance
export const PhlebotomyRepository = new PhlebotomyRepositoryClass();
