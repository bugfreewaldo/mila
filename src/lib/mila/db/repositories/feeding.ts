import { getDB } from "../connection";
import { BaseRepository } from "./base";
import type {
  Feeding,
  CreateFeeding,
  UpdateFeeding,
  FeedingTolerance,
} from "../../types/domain";

/**
 * Feeding Repository
 *
 * Tracks enteral and parenteral nutrition for neonates.
 * Important for monitoring feeding tolerance and growth.
 */
class FeedingRepositoryClass extends BaseRepository<
  "feedings",
  Feeding,
  CreateFeeding,
  UpdateFeeding
> {
  constructor() {
    super("feedings");
  }

  /**
   * Get all feedings for a patient (newest first)
   */
  async byPatient(patientId: string): Promise<Feeding[]> {
    const db = await getDB();
    const feedings = await db.getAllFromIndex(
      "feedings",
      "by-patientId",
      patientId
    );
    return feedings.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }

  /**
   * Get feedings for a patient within a date range
   */
  async byPatientAndDateRange(
    patientId: string,
    startDate: string,
    endDate: string
  ): Promise<Feeding[]> {
    const db = await getDB();
    const range = IDBKeyRange.bound(
      [patientId, startDate],
      [patientId, endDate]
    );
    const feedings = await db.getAllFromIndex(
      "feedings",
      "by-patientId-occurredAt",
      range
    );
    return feedings.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }

  /**
   * Get feedings by tolerance status
   */
  async byPatientAndTolerance(
    patientId: string,
    tolerance: FeedingTolerance
  ): Promise<Feeding[]> {
    const db = await getDB();
    const feedings = await db.getAllFromIndex(
      "feedings",
      "by-patientId-tolerance",
      [patientId, tolerance]
    );
    return feedings.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }

  /**
   * Get feedings in last 24 hours
   */
  async getLast24Hours(patientId: string): Promise<Feeding[]> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return this.byPatientAndDateRange(
      patientId,
      yesterday.toISOString(),
      now.toISOString()
    );
  }

  /**
   * Get total volume in last 24 hours
   */
  async getTotalVolume24Hours(patientId: string): Promise<number> {
    const feedings = await this.getLast24Hours(patientId);
    return feedings.reduce((total, f) => total + f.volumeMl, 0);
  }

  /**
   * Get feeding summary statistics
   */
  async getFeedingSummary(
    patientId: string
  ): Promise<{
    totalFeedings24h: number;
    totalVolume24h: number;
    toleratedCount: number;
    notToleratedCount: number;
    averageVolume: number;
    lastFeeding: Feeding | null;
    toleranceRate: number;
  }> {
    const feedings24h = await this.getLast24Hours(patientId);
    const allFeedings = await this.byPatient(patientId);

    const toleratedCount = feedings24h.filter(
      (f) => f.tolerance === "tolerated"
    ).length;
    const notToleratedCount = feedings24h.filter(
      (f) => f.tolerance === "not_tolerated" || f.tolerance === "emesis"
    ).length;
    const totalVolume24h = feedings24h.reduce((sum, f) => sum + f.volumeMl, 0);
    const averageVolume =
      feedings24h.length > 0 ? totalVolume24h / feedings24h.length : 0;
    const toleranceRate =
      feedings24h.length > 0 ? (toleratedCount / feedings24h.length) * 100 : 100;

    return {
      totalFeedings24h: feedings24h.length,
      totalVolume24h,
      toleratedCount,
      notToleratedCount,
      averageVolume,
      lastFeeding: allFeedings[0] || null,
      toleranceRate,
    };
  }

  /**
   * Get feeding trend data for charts
   */
  async getFeedingTrend(
    patientId: string,
    daysBack: number = 7
  ): Promise<
    Array<{
      date: string;
      totalVolumeMl: number;
      feedingCount: number;
      toleratedPercent: number;
    }>
  > {
    const now = new Date();
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    const feedings = await this.byPatientAndDateRange(
      patientId,
      startDate.toISOString(),
      now.toISOString()
    );

    // Group by date
    const byDate = new Map<
      string,
      { total: number; count: number; tolerated: number }
    >();

    for (const f of feedings) {
      const date = f.occurredAt.split("T")[0];
      const existing = byDate.get(date) || { total: 0, count: 0, tolerated: 0 };
      existing.total += f.volumeMl;
      existing.count++;
      if (f.tolerance === "tolerated") {
        existing.tolerated++;
      }
      byDate.set(date, existing);
    }

    // Convert to array and sort by date
    return Array.from(byDate.entries())
      .map(([date, data]) => ({
        date,
        totalVolumeMl: data.total,
        feedingCount: data.count,
        toleratedPercent: data.count > 0 ? (data.tolerated / data.count) * 100 : 100,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get current feeding regimen (most recent feeding details)
   */
  async getCurrentRegimen(patientId: string): Promise<{
    route: string;
    feedingType: string;
    volumeMl: number;
    frequency: string;
    caloriesPerOz?: number;
  } | null> {
    const lastFeeding = (await this.byPatient(patientId))[0];
    if (!lastFeeding) return null;

    // Estimate frequency from recent feedings
    const last24h = await this.getLast24Hours(patientId);
    const frequency =
      last24h.length > 0
        ? `q${Math.round(24 / last24h.length)}h`
        : "Unknown";

    return {
      route: lastFeeding.route,
      feedingType: lastFeeding.feedingType,
      volumeMl: lastFeeding.volumeMl,
      frequency,
      caloriesPerOz: lastFeeding.caloriesPerOz,
    };
  }
}

// Export singleton instance
export const FeedingRepository = new FeedingRepositoryClass();
