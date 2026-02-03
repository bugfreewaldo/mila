"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DataSourceType } from "../sources/IDataSource";
import type { Language } from "../i18n/translations";

interface AppState {
  // Data source
  dataSourceType: DataSourceType;
  setDataSourceType: (type: DataSourceType) => void;

  // UI preferences
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;

  // Language
  language: Language;
  setLanguage: (language: Language) => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Demo mode
  demoMode: boolean;
  setDemoMode: (enabled: boolean) => void;

  // Initialization status
  initialized: boolean;
  setInitialized: (initialized: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Data source - default to mock
      dataSourceType: "mock",
      setDataSourceType: (type) => set({ dataSourceType: type }),

      // UI preferences
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setDarkMode: (dark) => set({ darkMode: dark }),

      // Language - default to Spanish since it's for neonates in Spanish context
      language: "es",
      setLanguage: (language) => set({ language }),

      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Demo mode
      demoMode: true,
      setDemoMode: (enabled) => set({ demoMode: enabled }),

      // Initialization
      initialized: false,
      setInitialized: (initialized) => set({ initialized }),
    }),
    {
      name: "mila-app-settings",
      partialize: (state) => ({
        darkMode: state.darkMode,
        language: state.language,
        sidebarCollapsed: state.sidebarCollapsed,
        demoMode: state.demoMode,
      }),
    }
  )
);
