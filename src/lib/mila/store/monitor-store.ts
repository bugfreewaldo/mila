"use client";

import { create } from "zustand";
import type { VitalSign, Alert, VitalType } from "../types/domain";
import type { ConnectionStatus } from "../types/monitor";

interface MonitorState {
  // Connection status
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;

  // Latest vital values
  latestVitals: Record<VitalType, VitalSign | null>;
  setLatestVital: (type: VitalType, vital: VitalSign) => void;
  clearLatestVitals: () => void;

  // Active alerts (unacknowledged from current session)
  activeAlerts: Alert[];
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: string) => void;
  clearAlerts: () => void;

  // Historical buffer for sparklines (in-memory, not persisted)
  vitalBuffers: Record<VitalType, VitalSign[]>;
  appendToBuffer: (type: VitalType, vital: VitalSign) => void;
  setBuffer: (type: VitalType, vitals: VitalSign[]) => void;
  clearBuffers: () => void;

  // Monitor enabled state
  monitorEnabled: boolean;
  setMonitorEnabled: (enabled: boolean) => void;
}

const BUFFER_SIZE = 300; // 5 minutes at 1/sec

const initialLatestVitals: Record<VitalType, VitalSign | null> = {
  hr: null,
  spo2: null,
  rr: null,
  temp: null,
  bp_sys: null,
  bp_dia: null,
};

const initialBuffers: Record<VitalType, VitalSign[]> = {
  hr: [],
  spo2: [],
  rr: [],
  temp: [],
  bp_sys: [],
  bp_dia: [],
};

export const useMonitorStore = create<MonitorState>((set) => ({
  // Connection status
  connectionStatus: "disconnected",
  setConnectionStatus: (status) => set({ connectionStatus: status }),

  // Latest vital values
  latestVitals: { ...initialLatestVitals },
  setLatestVital: (type, vital) =>
    set((state) => ({
      latestVitals: { ...state.latestVitals, [type]: vital },
    })),
  clearLatestVitals: () => set({ latestVitals: { ...initialLatestVitals } }),

  // Active alerts
  activeAlerts: [],
  addAlert: (alert) =>
    set((state) => ({
      activeAlerts: [alert, ...state.activeAlerts].slice(0, 50), // Keep last 50
    })),
  acknowledgeAlert: (alertId) =>
    set((state) => ({
      activeAlerts: state.activeAlerts.map((a) =>
        a.id === alertId
          ? { ...a, acknowledged: true, acknowledgedAt: new Date().toISOString() }
          : a
      ),
    })),
  clearAlerts: () => set({ activeAlerts: [] }),

  // Vital buffers
  vitalBuffers: { ...initialBuffers },
  appendToBuffer: (type, vital) =>
    set((state) => {
      const buffer = [...state.vitalBuffers[type], vital];
      // Keep buffer at max size
      while (buffer.length > BUFFER_SIZE) {
        buffer.shift();
      }
      return {
        vitalBuffers: { ...state.vitalBuffers, [type]: buffer },
      };
    }),
  setBuffer: (type, vitals) =>
    set((state) => ({
      vitalBuffers: { ...state.vitalBuffers, [type]: vitals.slice(-BUFFER_SIZE) },
    })),
  clearBuffers: () => set({ vitalBuffers: { ...initialBuffers } }),

  // Monitor enabled
  monitorEnabled: true,
  setMonitorEnabled: (enabled) => set({ monitorEnabled: enabled }),
}));
