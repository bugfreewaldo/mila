"use client";

import { create } from "zustand";
import type { Patient } from "../types/domain";

interface PatientState {
  // Current patient
  currentPatient: Patient | null;
  setCurrentPatient: (patient: Patient | null) => void;

  // Patient list
  patients: Patient[];
  setPatients: (patients: Patient[]) => void;

  // Loading states
  loading: boolean;
  setLoading: (loading: boolean) => void;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;

  // Actions
  clearPatient: () => void;
}

export const usePatientStore = create<PatientState>((set) => ({
  // Current patient
  currentPatient: null,
  setCurrentPatient: (patient) => set({ currentPatient: patient, error: null }),

  // Patient list
  patients: [],
  setPatients: (patients) => set({ patients }),

  // Loading states
  loading: false,
  setLoading: (loading) => set({ loading }),

  // Error state
  error: null,
  setError: (error) => set({ error }),

  // Actions
  clearPatient: () => set({ currentPatient: null }),
}));
