"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/mila/store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { darkMode } = useAppStore();

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  return <>{children}</>;
}
