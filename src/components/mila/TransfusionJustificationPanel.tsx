"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  FlaskConical,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Shield,
} from "lucide-react";
import { useTranslation } from "@/lib/mila/i18n";
import { MockDataSource } from "@/lib/mila/sources";
import {
  getTransfusionJustification,
  getCumulativeExposureStatus,
  getDonorExposureStatus,
  getAgeAppropriateRBCThreshold,
  TRANSFUSION_THRESHOLDS,
  TRANSFUSION_RISKS,
  type TransfusionJustification,
} from "@/lib/mila/data/transfusion-thresholds";
import { getLabType } from "@/lib/mila/data/lab-types";
import { formatDateTime } from "@/lib/mila/utils/dates";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { TransfusionType, Patient, LabValue } from "@/lib/mila/types";
import { calculateDaysOfLife } from "@/lib/mila/utils/dates";

interface TransfusionJustificationPanelProps {
  patient: Patient;
  transfusionType: TransfusionType;
  isEmergency: boolean;
  onRespiratorySupport?: boolean;
  onJustificationChange?: (justification: TransfusionJustification) => void;
}

export function TransfusionJustificationPanel({
  patient,
  transfusionType,
  isEmergency,
  onRespiratorySupport = false,
  onJustificationChange,
}: TransfusionJustificationPanelProps) {
  const { t, language } = useTranslation();
  const [latestLab, setLatestLab] = useState<LabValue | null>(null);
  const [justification, setJustification] = useState<TransfusionJustification | null>(null);
  const [cumulativeStats, setCumulativeStats] = useState<{
    volumeByType: Record<TransfusionType, number>;
    uniqueDonors: number;
  } | null>(null);
  const [risksOpen, setRisksOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const threshold = TRANSFUSION_THRESHOLDS[transfusionType];

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Get latest lab value for this transfusion type
        if (threshold.labTypeId) {
          const labs = await MockDataSource.listLabValues(patient.id);
          const relevantLabs = labs
            .filter((l) => l.labTypeId === threshold.labTypeId)
            .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

          if (relevantLabs.length > 0) {
            setLatestLab(relevantLabs[0]);
          }
        }

        // Get cumulative stats
        const stats = await MockDataSource.getTransfusionStats(patient.id);
        setCumulativeStats({
          volumeByType: stats.volumeByType,
          uniqueDonors: stats.uniqueDonors,
        });
      } catch (error) {
        console.error("Failed to load justification data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [patient.id, transfusionType, threshold.labTypeId]);

  // Calculate days of life for age-specific RBC thresholds
  const daysOfLife = calculateDaysOfLife(patient.birthDate);

  useEffect(() => {
    if (loading) return;

    const result = getTransfusionJustification(
      transfusionType,
      latestLab?.value ?? null,
      latestLab?.occurredAt ?? null,
      isEmergency,
      daysOfLife,
      onRespiratorySupport
    );
    setJustification(result);
    onJustificationChange?.(result);
  }, [transfusionType, latestLab, isEmergency, loading, onJustificationChange, daysOfLife, onRespiratorySupport]);

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t.common.loading}
      </div>
    );
  }

  // Don't show for "other" type
  if (transfusionType === "other") {
    return null;
  }

  const labType = getLabType(threshold.labTypeId);
  const cumulativeVolume = cumulativeStats?.volumeByType[transfusionType] ?? 0;
  const cumulativeStatus = getCumulativeExposureStatus(
    transfusionType,
    cumulativeVolume,
    patient.birthWeightGrams
  );
  const donorStatus = getDonorExposureStatus(cumulativeStats?.uniqueDonors ?? 0);

  return (
    <div className="space-y-4">
      {/* Latest Lab Value */}
      <div className="border rounded-lg p-4 bg-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <FlaskConical className="w-4 h-4" />
          <span className="font-medium">
            {language === "es" ? "Último" : "Latest"} {labType?.name || threshold.labName}
          </span>
        </div>

        {latestLab ? (
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold">
                {transfusionType === "platelet"
                  ? latestLab.value.toLocaleString()
                  : latestLab.value.toFixed(1)}
              </span>
              <span className="text-muted-foreground ml-2">{threshold.unit}</span>
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDateTime(latestLab.occurredAt, language)}
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground italic">
            {language === "es"
              ? `No hay resultados recientes de ${labType?.name || threshold.labName}`
              : `No recent ${labType?.name || threshold.labName} results`}
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-2">
          {language === "es" ? "Umbral para transfusión" : "Threshold for transfusion"}:{" "}
          {transfusionType === "rbc" ? (
            <>
              {(() => {
                const ageThreshold = getAgeAppropriateRBCThreshold(daysOfLife, onRespiratorySupport);
                return (
                  <>
                    &lt; {ageThreshold.threshold} g/dL ({language === "es" ? ageThreshold.descriptionEs : ageThreshold.description})
                    {onRespiratorySupport && (
                      <span className="ml-1 text-yellow-600">
                        ({language === "es" ? "soporte respiratorio" : "respiratory support"})
                      </span>
                    )}
                  </>
                );
              })()}
            </>
          ) : transfusionType === "platelet" ? (
            <>
              &lt; {threshold.nonBleedingThreshold.toLocaleString()} {threshold.unit}
              <span className="ml-1 text-green-600">
                (PlaNeT-2 {language === "es" ? "evidencia" : "evidence"})
              </span>
            </>
          ) : transfusionType === "plasma" ? (
            <>
              INR &gt; {threshold.nonBleedingThreshold} {language === "es" ? "con sangrado activo" : "with active bleeding"}
            </>
          ) : (
            <>
              &lt; {threshold.nonBleedingThreshold} {threshold.unit}
            </>
          )}
        </div>
      </div>

      {/* Justification Status */}
      {justification && (
        <Alert
          variant={
            justification.severity === "critical"
              ? "destructive"
              : justification.severity === "warning"
              ? "default"
              : "default"
          }
          className={
            justification.severity === "ok"
              ? "border-green-500 bg-green-50 dark:bg-green-950/20"
              : justification.severity === "warning"
              ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
              : ""
          }
        >
          {justification.severity === "ok" ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : justification.severity === "warning" ? (
            <AlertCircle className="w-4 h-4 text-yellow-600" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <AlertTitle>
            {justification.severity === "ok"
              ? language === "es"
                ? "Transfusión Indicada"
                : "Transfusion Indicated"
              : justification.severity === "warning"
              ? language === "es"
                ? "Justificación Requerida"
                : "Justification Required"
              : language === "es"
              ? "Transfusión NO Indicada"
              : "Transfusion NOT Indicated"}
          </AlertTitle>
          <AlertDescription>
            {language === "es" ? justification.messageEs : justification.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Cumulative Exposure Warning */}
      {cumulativeStatus.status !== "ok" && (
        <Alert
          variant={cumulativeStatus.status === "critical" ? "destructive" : "default"}
          className={
            cumulativeStatus.status === "warning"
              ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
              : ""
          }
        >
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle>
            {language === "es" ? "Exposición Acumulada" : "Cumulative Exposure"}
          </AlertTitle>
          <AlertDescription>
            {language === "es" ? cumulativeStatus.messageEs : cumulativeStatus.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Donor Exposure Warning */}
      {donorStatus.status !== "ok" && (
        <Alert
          variant={donorStatus.status === "critical" ? "destructive" : "default"}
          className={
            donorStatus.status === "warning"
              ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
              : ""
          }
        >
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle>
            {language === "es" ? "Exposición a Donantes" : "Donor Exposure"}
          </AlertTitle>
          <AlertDescription>
            {language === "es" ? donorStatus.messageEs : donorStatus.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Current Cumulative Stats */}
      <div className="text-sm text-muted-foreground p-3 bg-muted/20 rounded-lg">
        <div className="font-medium mb-1">
          {language === "es" ? "Exposición Acumulada Actual" : "Current Cumulative Exposure"}:
        </div>
        <div>
          {cumulativeStatus.mlPerKg.toFixed(1)} ml/kg ({cumulativeVolume} ml{" "}
          {language === "es" ? "total" : "total"}) - {cumulativeStatus.percentOfWarning.toFixed(0)}%{" "}
          {language === "es" ? "del umbral de advertencia" : "of warning threshold"}
        </div>
      </div>

      {/* Risk Information (Collapsible) */}
      <Collapsible open={risksOpen} onOpenChange={setRisksOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {language === "es" ? "Riesgos de Transfusión" : "Transfusion Risks"}
            </span>
            {risksOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="space-y-2 text-sm">
            {TRANSFUSION_RISKS.map((risk) => (
              <div key={risk.id} className="p-3 border rounded-lg">
                <div className="font-medium">
                  {language === "es" ? risk.nameEs : risk.name}
                </div>
                <div className="text-muted-foreground">
                  {language === "es" ? risk.descriptionEs : risk.description}
                </div>
                <div className="text-xs text-muted-foreground/70 mt-1">
                  {language === "es" ? "Incidencia" : "Incidence"}: {risk.incidence}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
