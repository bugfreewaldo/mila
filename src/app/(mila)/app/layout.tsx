"use client";

import { useEffect } from "react";
import { Nav } from "@/components/mila/Nav";
import { TopBar } from "@/components/mila/TopBar";
import { MilaChatBubble } from "@/components/mila/MilaChatBubble";
import { useAppStore, usePatientStore } from "@/lib/mila/store";
import { MockDataSource } from "@/lib/mila/sources";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initialized, setInitialized } = useAppStore();
  const { setCurrentPatient, setLoading, setError } = usePatientStore();

  // Initialize app on mount
  useEffect(() => {
    async function init() {
      if (initialized) return;

      setLoading(true);
      try {
        // Seed demo data if needed
        await MockDataSource.seedDemoData();

        // Load default patient
        const patient = await MockDataSource.getDefaultPatient();
        if (patient) {
          setCurrentPatient(patient);
        }

        setInitialized(true);
      } catch (error) {
        console.error("Failed to initialize app:", error);
        setError("Failed to initialize application");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [initialized, setInitialized, setCurrentPatient, setLoading, setError]);

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Nav />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
        {/* Floating MILA Chat Bubble - Available on all pages */}
        <MilaChatBubble />
      </div>
    </TooltipProvider>
  );
}
