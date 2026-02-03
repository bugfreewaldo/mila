"use client";

import { useState, useEffect } from "react";
import { Bell, Moon, Sun, Sparkles, Globe } from "lucide-react";
import { useAppStore, usePatientStore, useMonitorStore } from "@/lib/mila/store";
import { useTranslation } from "@/lib/mila/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "./DataSourceBadge";
import { PatientHeader } from "./PatientHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopBar() {
  // Fix Radix UI hydration mismatch by only rendering dropdown after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { darkMode, toggleDarkMode } = useAppStore();
  const { currentPatient } = usePatientStore();
  const { activeAlerts } = useMonitorStore();
  const { t, language, setLanguage } = useTranslation();

  const unacknowledgedCount = activeAlerts.filter((a) => !a.acknowledged).length;

  return (
    <header className="flex items-center justify-between h-16 px-4 border-b-2 border-[hsl(var(--baby-lavender))] bg-card">
      {/* Patient Info */}
      <div className="flex items-center gap-4">
        {currentPatient && <PatientHeader patient={currentPatient} compact />}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <DataSourceBadge />

        {/* Language Switcher */}
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl px-3 gap-1.5 hover:bg-[hsl(var(--baby-mint))]"
          onClick={() => setLanguage(language === "en" ? "es" : "en")}
        >
          <Globe className="w-4 h-4" />
          <span className="text-xs font-medium">{language === "en" ? "ES" : "EN"}</span>
        </Button>

        {/* Alerts Dropdown - only render after mount to prevent hydration mismatch */}
        {mounted ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl hover:bg-[hsl(var(--baby-peach))]"
              >
                <Bell className="w-5 h-5" />
                {unacknowledgedCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full animate-bounce-soft"
                  >
                    {unacknowledgedCount > 9 ? "9+" : unacknowledgedCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-2xl border-2 border-[hsl(var(--baby-lavender))]">
              {activeAlerts.length === 0 ? (
                <div className="p-6 text-center">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-[hsl(var(--baby-mint))]" />
                  <p className="text-sm text-muted-foreground">{t.topBar.allClear}</p>
                </div>
              ) : (
                activeAlerts.slice(0, 5).map((alert) => (
                  <DropdownMenuItem
                    key={alert.id}
                    className="flex flex-col items-start py-3 px-4 rounded-xl mx-1 my-1"
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          alert.severity === "critical" ? "destructive" : "warning"
                        }
                        className="text-xs rounded-full"
                      >
                        {alert.severity === "critical" ? t.timeline.critical : t.timeline.warning}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.occurredAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <span className="text-sm mt-1">{alert.message}</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-xl hover:bg-[hsl(var(--baby-peach))]"
          >
            <Bell className="w-5 h-5" />
            {unacknowledgedCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full animate-bounce-soft"
              >
                {unacknowledgedCount > 9 ? "9+" : unacknowledgedCount}
              </Badge>
            )}
          </Button>
        )}

        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="rounded-xl hover:bg-[hsl(var(--baby-yellow))]"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-[hsl(50,90%,50%)]" />
          ) : (
            <Moon className="w-5 h-5 text-[hsl(var(--primary))]" />
          )}
        </Button>
      </div>
    </header>
  );
}
