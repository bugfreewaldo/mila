/**
 * Device Gateway Data Source (Stub)
 *
 * Future implementation for hospital MDI (Medical Device Integration) middleware.
 *
 * TODO: When implementing real device integration:
 * - Connect to HL7 gateway or proprietary middleware
 * - Handle real-time streaming of vital signs
 * - Implement device-specific protocols (Philips, GE, Draeger, etc.)
 * - Support alarm forwarding and acknowledgment
 * - Handle connection failover and reconnection
 * - Buffer data during disconnection
 * - Map device data to MILA domain types
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

/**
 * Device Gateway Configuration
 */
export interface DeviceGatewayConfig {
  /** Gateway WebSocket URL */
  wsUrl: string;
  /** API endpoint for REST operations */
  apiUrl?: string;
  /** Authentication token */
  authToken?: string;
  /** Device/bed identifier */
  deviceId?: string;
}

class DeviceGatewayDataSourceClass implements IDataSource {
  readonly name = "Device Gateway";
  readonly type: DataSourceType = "device";

  private config: DeviceGatewayConfig | null = null;

  /**
   * Configure the device gateway connection
   */
  configure(config: DeviceGatewayConfig): void {
    this.config = config;
    // TODO: Validate config and establish WebSocket connection
  }

  // ============================================================================
  // Connection
  // ============================================================================

  async isConnected(): Promise<boolean> {
    // TODO: Check WebSocket connection status
    return false;
  }

  // ============================================================================
  // Note: Device gateway is primarily for real-time streaming
  // Most CRUD operations are not applicable and will throw
  // ============================================================================

  // ============================================================================
  // Patient Operations
  // ============================================================================

  async getPatient(_id: string): Promise<Patient | null> {
    throw new Error("Device gateway does not support patient queries. Use FHIR or Mock source.");
  }

  async getDefaultPatient(): Promise<Patient | null> {
    throw new Error("Device gateway does not support patient queries. Use FHIR or Mock source.");
  }

  async listPatients(): Promise<Patient[]> {
    throw new Error("Device gateway does not support patient queries. Use FHIR or Mock source.");
  }

  async createPatient(_data: CreatePatient): Promise<Patient> {
    throw new Error("Device gateway does not support patient creation. Use FHIR or Mock source.");
  }

  async updatePatient(_id: string, _data: UpdatePatient): Promise<Patient | null> {
    throw new Error("Device gateway does not support patient updates. Use FHIR or Mock source.");
  }

  async deletePatient(_id: string): Promise<boolean> {
    throw new Error("Device gateway does not support patient deletion. Use FHIR or Mock source.");
  }

  // ============================================================================
  // Observation Operations (Read-only from device data)
  // ============================================================================

  async getObservation(_id: string): Promise<Observation | null> {
    throw new Error("Device gateway integration not implemented.");
  }

  async listObservations(_patientId: string): Promise<Observation[]> {
    throw new Error("Device gateway integration not implemented.");
  }

  async listObservationsByDateRange(
    _patientId: string,
    _startDate: string,
    _endDate: string
  ): Promise<Observation[]> {
    throw new Error("Device gateway integration not implemented.");
  }

  async listObservationsByCategory(
    _patientId: string,
    _category: ObservationCategory
  ): Promise<Observation[]> {
    throw new Error("Device gateway integration not implemented.");
  }

  async listObservationsBySeverity(
    _patientId: string,
    _severity: Severity
  ): Promise<Observation[]> {
    throw new Error("Device gateway integration not implemented.");
  }

  async createObservation(_data: CreateObservation): Promise<Observation> {
    throw new Error("Device gateway does not support manual observation creation.");
  }

  async updateObservation(
    _id: string,
    _data: UpdateObservation
  ): Promise<Observation | null> {
    throw new Error("Device gateway does not support observation updates.");
  }

  async deleteObservation(_id: string): Promise<boolean> {
    throw new Error("Device gateway does not support observation deletion.");
  }

  // ============================================================================
  // Transfusion Operations (Not supported by device gateway)
  // ============================================================================

  async getTransfusion(_id: string): Promise<Transfusion | null> {
    throw new Error("Device gateway does not support transfusion queries.");
  }

  async listTransfusions(_patientId: string): Promise<Transfusion[]> {
    throw new Error("Device gateway does not support transfusion queries.");
  }

  async listTransfusionsByDateRange(
    _patientId: string,
    _startDate: string,
    _endDate: string
  ): Promise<Transfusion[]> {
    throw new Error("Device gateway does not support transfusion queries.");
  }

  async listTransfusionsByType(
    _patientId: string,
    _type: TransfusionType
  ): Promise<Transfusion[]> {
    throw new Error("Device gateway does not support transfusion queries.");
  }

  async createTransfusion(_data: CreateTransfusion): Promise<Transfusion> {
    throw new Error("Device gateway does not support transfusion creation.");
  }

  async updateTransfusion(
    _id: string,
    _data: UpdateTransfusion
  ): Promise<Transfusion | null> {
    throw new Error("Device gateway does not support transfusion updates.");
  }

  async deleteTransfusion(_id: string): Promise<boolean> {
    throw new Error("Device gateway does not support transfusion deletion.");
  }

  async getTransfusionStats(_patientId: string): Promise<{
    totalCount: number;
    totalVolume: number;
    volumeByType: Record<TransfusionType, number>;
    uniqueDonors: number;
  }> {
    throw new Error("Device gateway does not support transfusion stats.");
  }

  // ============================================================================
  // Lab Value Operations (Not supported by device gateway)
  // ============================================================================

  async getLabValue(_id: string): Promise<LabValue | null> {
    throw new Error("Device gateway does not support lab queries.");
  }

  async listLabValues(_patientId: string): Promise<LabValue[]> {
    throw new Error("Device gateway does not support lab queries.");
  }

  async listLabValuesByType(
    _patientId: string,
    _labTypeId: string
  ): Promise<LabValue[]> {
    throw new Error("Device gateway does not support lab queries.");
  }

  async listLabValuesByDateRange(
    _patientId: string,
    _startDate: string,
    _endDate: string
  ): Promise<LabValue[]> {
    throw new Error("Device gateway does not support lab queries.");
  }

  async createLabValue(_data: CreateLabValue): Promise<LabValue> {
    throw new Error("Device gateway does not support lab creation.");
  }

  async updateLabValue(
    _id: string,
    _data: UpdateLabValue
  ): Promise<LabValue | null> {
    throw new Error("Device gateway does not support lab updates.");
  }

  async deleteLabValue(_id: string): Promise<boolean> {
    throw new Error("Device gateway does not support lab deletion.");
  }

  async getAbnormalLabValues(_patientId: string): Promise<LabValue[]> {
    throw new Error("Device gateway does not support lab queries.");
  }

  async getLabTypes(_patientId: string): Promise<string[]> {
    throw new Error("Device gateway does not support lab queries.");
  }

  // ============================================================================
  // Alert Operations (Primary use case for device gateway)
  // ============================================================================

  async getAlert(_id: string): Promise<Alert | null> {
    // TODO: Query device gateway for alarm history
    throw new Error("Device gateway integration not implemented.");
  }

  async listAlerts(_patientId: string): Promise<Alert[]> {
    // TODO: Get alarm history from device
    throw new Error("Device gateway integration not implemented.");
  }

  async listUnacknowledgedAlerts(_patientId: string): Promise<Alert[]> {
    // TODO: Get active alarms from device
    throw new Error("Device gateway integration not implemented.");
  }

  async createAlert(_data: CreateAlert): Promise<Alert> {
    throw new Error("Alerts are generated by devices, not created manually.");
  }

  async acknowledgeAlert(
    _id: string,
    _acknowledgedBy?: string
  ): Promise<Alert | null> {
    // TODO: Send alarm acknowledgment to device
    throw new Error("Device gateway integration not implemented.");
  }

  async acknowledgeAllAlerts(
    _patientId: string,
    _acknowledgedBy?: string
  ): Promise<number> {
    throw new Error("Device gateway integration not implemented.");
  }

  // ============================================================================
  // Sync & Export Operations
  // ============================================================================

  async syncFromSource(): Promise<SyncResult> {
    // TODO: Implement device data sync
    // 1. Connect to device gateway WebSocket
    // 2. Subscribe to patient vitals stream
    // 3. Handle real-time vital updates
    // 4. Forward alarms to MILA alert system
    throw new Error("Device gateway sync not implemented.");
  }

  async exportData(): Promise<MilaDataExport> {
    throw new Error("Device gateway does not support data export.");
  }

  async importData(_data: MilaDataExport): Promise<SyncResult> {
    throw new Error("Device gateway does not support data import.");
  }

  async resetData(): Promise<void> {
    throw new Error("Device gateway does not support data reset.");
  }

  async seedDemoData(): Promise<void> {
    throw new Error("Demo data not available for device gateway source.");
  }
}

// Export singleton instance
export const DeviceGatewayDataSource = new DeviceGatewayDataSourceClass();
