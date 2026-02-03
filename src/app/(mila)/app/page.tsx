"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  Droplets,
  FlaskConical,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  TestTube2,
} from "lucide-react";
import { usePatientStore } from "@/lib/mila/store";
import { useTranslation } from "@/lib/mila/i18n";
import { MockDataSource } from "@/lib/mila/sources";
import { PatientHeader, StatPanel, EventTimeline, EmptyState, MilaAssistant } from "@/components/mila";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LabValueRepository } from "@/lib/mila/db/repositories";
import { getLabType } from "@/lib/mila/data/lab-types";
import { calculateDaysOfLife, daysAgo } from "@/lib/mila/utils/dates";
import type { TimelineEvent, Observation, Transfusion, LabValue, Alert } from "@/lib/mila/types";
import type { Translations } from "@/lib/mila/i18n/translations";

export default function DashboardPage() {
  const { currentPatient, loading } = usePatientStore();
  const { t, language } = useTranslation();
  const [stats, setStats] = useState({
    daysOfLife: 0,
    transfusionCount: 0,
    abnormalLabCount: 0,
    activeAlertCount: 0,
  });
  const [recentEvents, setRecentEvents] = useState<TimelineEvent[]>([]);
  const [keyLabs, setKeyLabs] = useState<Array<{
    id: string;
    name: string;
    shortName: string;
    value: number;
    unit: string;
    trend: "up" | "down" | "stable";
    isAbnormal: boolean;
    direction: "high" | "low" | null;
    date: string;
  }>>([]);

  // Helper functions that use translations
  const transfusionToEvent = useCallback((tr: Transfusion, t: Translations): TimelineEvent => {
    const typeLabels: Record<string, string> = {
      rbc: t.transfusions.rbc,
      platelet: t.transfusions.platelet,
      plasma: t.transfusions.plasma,
      other: t.transfusions.other,
    };
    return {
      id: tr.id,
      patientId: tr.patientId,
      occurredAt: tr.occurredAt,
      eventType: "transfusion",
      severity: "info",
      summary: `${typeLabels[tr.type]}: ${tr.volumeMl}ml`,
      details: tr.notes,
      sourceRecord: tr,
    };
  }, []);

  useEffect(() => {
    async function loadDashboard() {
      if (!currentPatient) return;

      try {
        // Load stats
        const [transfusions, abnormalLabs, alerts] = await Promise.all([
          MockDataSource.listTransfusions(currentPatient.id),
          MockDataSource.getAbnormalLabValues(currentPatient.id),
          MockDataSource.listUnacknowledgedAlerts(currentPatient.id),
        ]);

        setStats({
          daysOfLife: calculateDaysOfLife(currentPatient.birthDate),
          transfusionCount: transfusions.length,
          abnormalLabCount: abnormalLabs.length,
          activeAlertCount: alerts.length,
        });

        // Load key labs (HGB, PLT, Bilirubin, etc.)
        const keyLabTypes = ["hgb", "plt", "tbili", "dbili", "retic", "ldh"];
        const keyLabsData = await Promise.all(
          keyLabTypes.map(async (labTypeId) => {
            const labDef = getLabType(labTypeId);
            const labs = await LabValueRepository.byPatientAndLabType(currentPatient.id, labTypeId);
            if (labs.length === 0) return null;

            const sorted = [...labs].sort((a, b) =>
              new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
            );
            const latest = sorted[0];

            // Calculate trend
            let trend: "up" | "down" | "stable" = "stable";
            if (sorted.length > 1) {
              const diff = latest.value - sorted[1].value;
              const percentChange = Math.abs(diff / sorted[1].value) * 100;
              if (percentChange > 5) {
                trend = diff > 0 ? "up" : "down";
              }
            }

            // Check if abnormal
            const isAbnormal =
              (latest.refRangeLow !== undefined && latest.value < latest.refRangeLow) ||
              (latest.refRangeHigh !== undefined && latest.value > latest.refRangeHigh);

            const direction: "high" | "low" | null =
              latest.refRangeLow !== undefined && latest.value < latest.refRangeLow
                ? "low"
                : latest.refRangeHigh !== undefined && latest.value > latest.refRangeHigh
                ? "high"
                : null;

            return {
              id: labTypeId,
              name: labDef?.name || labTypeId,
              shortName: labDef?.shortName || labTypeId.toUpperCase(),
              value: latest.value,
              unit: latest.unit,
              trend,
              isAbnormal,
              direction,
              date: latest.occurredAt,
            };
          })
        );

        setKeyLabs(keyLabsData.filter((lab): lab is NonNullable<typeof lab> => lab !== null));

        // Load recent events for timeline (last 24h)
        const startDate = daysAgo(1);
        const endDate = new Date().toISOString();

        const [observations, recentTransfusions, recentLabs, recentAlerts] = await Promise.all([
          MockDataSource.listObservationsByDateRange(currentPatient.id, startDate, endDate),
          MockDataSource.listTransfusionsByDateRange(currentPatient.id, startDate, endDate),
          MockDataSource.listLabValuesByDateRange(currentPatient.id, startDate, endDate),
          MockDataSource.listAlerts(currentPatient.id).then(alerts =>
            alerts.filter(a => a.occurredAt >= startDate)
          ),
        ]);

        // Convert to timeline events (group labs collected at similar times)
        const events: TimelineEvent[] = [
          ...observations.map(o => observationToEvent(o)),
          ...recentTransfusions.map(tr => transfusionToEvent(tr, t)),
          ...groupLabsToEvents(recentLabs),
          ...recentAlerts.map(a => alertToEvent(a)),
        ].sort((a, b) =>
          new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
        ).slice(0, 10);

        setRecentEvents(events);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      }
    }

    loadDashboard();
  }, [currentPatient, t, transfusionToEvent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">{t.common.loading}</div>
      </div>
    );
  }

  if (!currentPatient) {
    return (
      <EmptyState
        title={t.patient.noPatientSelected}
        description={t.dashboard.noRecentActivity}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <PatientHeader patient={currentPatient} />

      {/* MILA AI Assistant */}
      <MilaAssistant />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatPanel
          label={t.dashboard.daysOfLife}
          value={stats.daysOfLife}
          icon={Calendar}
        />
        <StatPanel
          label={t.dashboard.transfusions}
          value={stats.transfusionCount}
          icon={Droplets}
          subtitle={`${stats.transfusionCount} ${t.dashboard.totalGiven.toLowerCase()}`}
        />
        <Link href="/app/labs">
          <StatPanel
            label={t.dashboard.labsToReview}
            value={stats.abnormalLabCount}
            icon={FlaskConical}
            variant={stats.abnormalLabCount > 0 ? "warning" : "default"}
          />
        </Link>
        <StatPanel
          label={t.dashboard.activeAlerts}
          value={stats.activeAlertCount}
          icon={AlertTriangle}
          variant={stats.activeAlertCount > 0 ? "critical" : "default"}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 flex-wrap">
        <Link href="/app/observations">
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            {t.dashboard.addNote}
          </Button>
        </Link>
        <Link href="/app/transfusions">
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            {t.dashboard.recordHelper}
          </Button>
        </Link>
        <Link href="/app/labs">
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            {t.dashboard.addLabResult}
          </Button>
        </Link>
      </div>

      {/* Key Labs Summary */}
      {keyLabs.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TestTube2 className="w-5 h-5 text-blue-500" />
              {language === "es" ? "Laboratorios Clave" : "Key Labs"}
            </CardTitle>
            <Link href="/app/labs">
              <Button variant="ghost" size="sm">
                {language === "es" ? "Ver todos" : "View all"}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {keyLabs.map((lab) => (
                <div
                  key={lab.id}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all hover:shadow-md",
                    lab.isAbnormal
                      ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700"
                      : "bg-muted/30 border-muted"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {lab.shortName}
                    </span>
                    {lab.trend === "up" && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {lab.trend === "down" && <TrendingDown className="w-4 h-4 text-red-500" />}
                    {lab.trend === "stable" && <Minus className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className={cn(
                    "text-lg font-bold",
                    lab.isAbnormal ? "text-red-600 dark:text-red-400" : "text-foreground"
                  )}>
                    {lab.value.toFixed(lab.unit === "%" ? 1 : lab.value < 10 ? 1 : 0)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">{lab.unit}</span>
                    {lab.isAbnormal && (
                      <Badge variant="warning" className="text-[10px] py-0 px-1">
                        {lab.direction === "high"
                          ? (language === "es" ? "Alto" : "High")
                          : (language === "es" ? "Bajo" : "Low")}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{t.dashboard.recentActivity} (24h)</CardTitle>
          <Link href="/app/timeline">
            <Button variant="ghost" size="sm">
              {t.dashboard.viewFullStory}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {t.dashboard.noRecentActivity}
            </div>
          ) : (
            <EventTimeline events={recentEvents} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions to convert records to timeline events
function observationToEvent(obs: Observation): TimelineEvent {
  return {
    id: obs.id,
    patientId: obs.patientId,
    occurredAt: obs.occurredAt,
    eventType: "observation",
    severity: obs.severity,
    summary: obs.content.substring(0, 100),
    sourceRecord: obs,
  };
}

function labToEvent(l: LabValue): TimelineEvent {
  const isAbnormal =
    (l.refRangeLow !== undefined && l.value < l.refRangeLow) ||
    (l.refRangeHigh !== undefined && l.value > l.refRangeHigh);
  return {
    id: l.id,
    patientId: l.patientId,
    occurredAt: l.occurredAt,
    eventType: "lab",
    severity: isAbnormal ? "warning" : "info",
    summary: `${l.labTypeId.toUpperCase()}: ${l.value} ${l.unit}`,
    sourceRecord: l,
  };
}

// Group labs collected within 30 minutes of each other into a single event
function groupLabsToEvents(labs: LabValue[]): TimelineEvent[] {
  if (labs.length === 0) return [];

  // Sort by time
  const sortedLabs = [...labs].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
  );

  const groups: LabValue[][] = [];
  let currentGroup: LabValue[] = [sortedLabs[0]];

  for (let i = 1; i < sortedLabs.length; i++) {
    const prevTime = new Date(sortedLabs[i - 1].occurredAt).getTime();
    const currTime = new Date(sortedLabs[i].occurredAt).getTime();
    const diffMinutes = (currTime - prevTime) / (1000 * 60);

    if (diffMinutes <= 30) {
      // Within 30 minutes, add to current group
      currentGroup.push(sortedLabs[i]);
    } else {
      // Start new group
      groups.push(currentGroup);
      currentGroup = [sortedLabs[i]];
    }
  }
  groups.push(currentGroup);

  // Convert groups to events
  return groups.map(group => {
    const hasAbnormal = group.some(l =>
      (l.refRangeLow !== undefined && l.value < l.refRangeLow) ||
      (l.refRangeHigh !== undefined && l.value > l.refRangeHigh)
    );

    // Create summary with all lab values
    const labSummaries = group.map(l => {
      const isAbnormal =
        (l.refRangeLow !== undefined && l.value < l.refRangeLow) ||
        (l.refRangeHigh !== undefined && l.value > l.refRangeHigh);
      return `${l.labTypeId.toUpperCase()}: ${l.value}${isAbnormal ? "⚠" : ""}`;
    });

    return {
      id: group[0].id,
      patientId: group[0].patientId,
      occurredAt: group[0].occurredAt,
      eventType: "lab" as const,
      severity: hasAbnormal ? "warning" as const : "info" as const,
      summary: group.length === 1
        ? `${group[0].labTypeId.toUpperCase()}: ${group[0].value} ${group[0].unit}`
        : `Labs (${group.length}): ${labSummaries.join(", ")}`,
      sourceRecord: group[0], // Store first lab as reference
    };
  });
}

function alertToEvent(a: Alert): TimelineEvent {
  return {
    id: a.id,
    patientId: a.patientId,
    occurredAt: a.occurredAt,
    eventType: "alert",
    severity: a.severity,
    summary: a.message,
    sourceRecord: a,
  };
}
