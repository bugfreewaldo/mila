import { getDB } from "../connection";
import { BaseRepository } from "./base";
import type {
  Patient,
  CreatePatient,
  UpdatePatient,
} from "../../types/domain";

/**
 * Patient Repository
 *
 * For MVP, we typically work with a single patient.
 * Methods support multiple patients for future scalability.
 */
class PatientRepositoryClass extends BaseRepository<
  "patients",
  Patient,
  CreatePatient,
  UpdatePatient
> {
  constructor() {
    super("patients");
  }

  /**
   * Get all patients ordered by creation date (newest first)
   */
  async getAllByCreatedAt(): Promise<Patient[]> {
    const db = await getDB();
    const patients = await db.getAllFromIndex("patients", "by-createdAt");
    return patients.reverse(); // Newest first
  }

  /**
   * Get the first (default) patient
   * Useful for MVP single-patient mode
   */
  async getDefault(): Promise<Patient | null> {
    const db = await getDB();
    const patients = await db.getAllFromIndex("patients", "by-createdAt");
    return patients.length > 0 ? patients[0] : null;
  }

  /**
   * Check if any patients exist
   */
  async hasPatients(): Promise<boolean> {
    const count = await this.count();
    return count > 0;
  }
}

// Export singleton instance
export const PatientRepository = new PatientRepositoryClass();
