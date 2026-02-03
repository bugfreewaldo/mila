"use client";

import { useState } from "react";
import {
  Download,
  Upload,
  Trash2,
  Moon,
  Sun,
  Database,
  RefreshCw,
  AlertTriangle,
  Languages,
} from "lucide-react";
import { useAppStore, usePatientStore } from "@/lib/mila/store";
import { useTranslation } from "@/lib/mila/i18n";
import { MockDataSource } from "@/lib/mila/sources";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MilaDataExport } from "@/lib/mila/types";
import type { Language } from "@/lib/mila/i18n/translations";

export default function SettingsPage() {
  const { darkMode, toggleDarkMode, setInitialized } = useAppStore();
  const { setCurrentPatient } = usePatientStore();
  const { t, language, setLanguage } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleExport() {
    setLoading(true);
    setMessage(null);
    try {
      const data = await MockDataSource.exportData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `mila-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();

      URL.revokeObjectURL(url);
      setMessage({ type: "success", text: t.settings.exportSuccess });
    } catch (error) {
      console.error("Export failed:", error);
      setMessage({ type: "error", text: t.settings.exportError });
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setLoading(true);
      setMessage(null);

      try {
        const text = await file.text();
        const data: MilaDataExport = JSON.parse(text);

        // Validate basic structure
        if (!data.version || !data.exportedAt) {
          throw new Error("Invalid export file format");
        }

        const result = await MockDataSource.importData(data);

        if (result.success) {
          setMessage({
            type: "success",
            text: `${result.recordsProcessed} ${t.settings.importSuccess}`,
          });

          // Reload patient
          const patient = await MockDataSource.getDefaultPatient();
          setCurrentPatient(patient);
        } else {
          setMessage({
            type: "error",
            text: `${t.settings.importErrorCount}: ${result.errors.length}`,
          });
        }
      } catch (error) {
        console.error("Import failed:", error);
        setMessage({ type: "error", text: t.settings.importError });
      } finally {
        setLoading(false);
      }
    };

    input.click();
  }

  async function handleReset() {
    if (!confirm(t.settings.resetConfirm)) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await MockDataSource.resetData();
      // Immediately regenerate demo data before page reload
      await MockDataSource.seedDemoData();

      // Load the new patient
      const newPatient = await MockDataSource.getDefaultPatient();
      if (newPatient) {
        setCurrentPatient(newPatient);
      }

      setInitialized(true);
      setMessage({ type: "success", text: t.settings.resetSuccess });

      // Reload page to refresh UI
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Reset failed:", error);
      setMessage({ type: "error", text: t.settings.resetError });
    } finally {
      setLoading(false);
    }
  }

  async function handleReseedDemo() {
    if (!confirm(t.settings.reseedConfirm)) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await MockDataSource.resetData();
      // Immediately regenerate demo data
      await MockDataSource.seedDemoData();

      // Load the new patient
      const newPatient = await MockDataSource.getDefaultPatient();
      if (newPatient) {
        setCurrentPatient(newPatient);
      }

      setInitialized(true);
      setMessage({ type: "success", text: language === "es" ? "Datos de demostración regenerados" : "Demo data regenerated" });

      // Force page reload to refresh UI
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Reseed failed:", error);
      setMessage({ type: "error", text: t.settings.reseedError });
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">{t.settings.title}</h1>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertTitle>{message.type === "error" ? t.settings.error : t.settings.success}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            {t.settings.appearance}
          </CardTitle>
          <CardDescription>{t.settings.appearanceDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>{t.settings.darkMode}</Label>
              <p className="text-sm text-muted-foreground">
                {t.settings.darkModeDesc}
              </p>
            </div>
            <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="flex items-center gap-2">
                <Languages className="w-4 h-4" />
                {t.settings.language}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t.settings.languageDesc}
              </p>
            </div>
            <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t.settings.english}</SelectItem>
                <SelectItem value="es">{t.settings.spanish}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            {t.settings.dataManagement}
          </CardTitle>
          <CardDescription>{t.settings.dataManagementDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>{t.settings.exportData}</Label>
              <p className="text-sm text-muted-foreground">
                {t.settings.exportDataDesc}
              </p>
            </div>
            <Button variant="outline" onClick={handleExport} disabled={loading}>
              <Download className="w-4 h-4 mr-2" />
              {t.settings.export}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>{t.settings.importData}</Label>
              <p className="text-sm text-muted-foreground">
                {t.settings.importDataDesc}
              </p>
            </div>
            <Button variant="outline" onClick={handleImport} disabled={loading}>
              <Upload className="w-4 h-4 mr-2" />
              {t.settings.import}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>{t.settings.reseedDemoData}</Label>
              <p className="text-sm text-muted-foreground">
                {t.settings.reseedDemoDataDesc}
              </p>
            </div>
            <Button variant="outline" onClick={handleReseedDemo} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {t.settings.reseed}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            {t.settings.dangerZone}
          </CardTitle>
          <CardDescription>{t.settings.dangerZoneDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>{t.settings.resetAllData}</Label>
              <p className="text-sm text-muted-foreground">
                {t.settings.resetAllDataDesc}
              </p>
            </div>
            <Button variant="destructive" onClick={handleReset} disabled={loading}>
              <Trash2 className="w-4 h-4 mr-2" />
              {t.settings.reset}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.aboutMila}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>MILA</strong> - {t.appFullName}
          </p>
          <p>{t.settings.version}: 0.1.0 (MVP)</p>
          <p>{t.settings.localFirstApp}</p>
          <Separator className="my-4" />
          <p>
            <strong>{t.settings.dataSource}:</strong> {t.settings.mockDataIndexedDB}
          </p>
          <p>
            <strong>{t.vitals.simulatorNote}</strong> {t.settings.mvpNote}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
