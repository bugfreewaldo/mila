"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Filter, X } from "lucide-react";
import { usePatientStore } from "@/lib/mila/store";
import { useTranslation } from "@/lib/mila/i18n";
import { MockDataSource } from "@/lib/mila/sources";
import { EventTimeline, EmptyState } from "@/components/mila";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  TimelineEvent,
  TimelineEventType,
  Severity,
  Observation,
  Transfusion,
  LabValue,
  Alert,
} from "@/lib/mila/types";
import type { Translations } from "@/lib/mila/i18n/translations";

export default function TimelinePage() {
  const { currentPatient } = usePatientStore();
  const { t } = useTranslation();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [eventTypeFilter, setEventTypeFilter] = useState<TimelineEventType | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  // Helper functions that use translations
  const observationToEvent = useCallback((obs: Observation, t: Translations): TimelineEvent => {
    const sourceLabels: Record<string, string> = {
      parent: t.observations.parent,
      nurse: t.observations.nurse,
      doctor: t.observations.doctor,
      monitor: t.observations.monitor,
      system: t.observations.system,
    };
    const categoryLabels: Record<string, string> = {
      clinical: t.observations.clinical,
      nursing: t.observations.nursing,
      procedure: t.observations.procedure,
      event: t.observations.event,
    };
    return {
      id: obs.id,
      patientId: obs.patientId,
      occurredAt: obs.occurredAt,
      eventType: "observation",
      severity: obs.severity,
      summary: obs.content.substring(0, 100),
      details: `${t.observations.source}: ${sourceLabels[obs.source] || obs.source} | ${t.observations.category}: ${categoryLabels[obs.category] || obs.category}`,
      sourceRecord: obs,
    };
  }, []);

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
      details: tr.notes || `${t.transfusions.donorId}: ${tr.donorId}`,
      sourceRecord: tr,
    };
  }, []);

  const labToEvent = useCallback((l: LabValue, t: Translations): TimelineEvent => {
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
      details:
        l.refRangeLow !== undefined && l.refRangeHigh !== undefined
          ? `${t.labs.refRange}: ${l.refRangeLow} - ${l.refRangeHigh}`
          : undefined,
      sourceRecord: l,
    };
  }, []);

  const alertToEvent = useCallback((a: Alert, t: Translations): TimelineEvent => {
    return {
      id: a.id,
      patientId: a.patientId,
      occurredAt: a.occurredAt,
      eventType: "alert",
      severity: a.severity,
      summary: a.message,
      details: a.acknowledged
        ? `${t.common.acknowledged} ${new Date(a.acknowledgedAt!).toLocaleTimeString()}`
        : t.common.unacknowledged,
      sourceRecord: a,
    };
  }, []);

  // Group labs collected within 30 minutes of each other into a single event
  const groupLabsToEvents = useCallback((labs: LabValue[], t: Translations): TimelineEvent[] => {
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
        currentGroup.push(sortedLabs[i]);
      } else {
        groups.push(currentGroup);
        currentGroup = [sortedLabs[i]];
      }
    }
    groups.push(currentGroup);

    return groups.map(group => {
      const hasAbnormal = group.some(l =>
        (l.refRangeLow !== undefined && l.value < l.refRangeLow) ||
        (l.refRangeHigh !== undefined && l.value > l.refRangeHigh)
      );

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
          : `${t.labs.title} (${group.length}): ${labSummaries.join(", ")}`,
        details: group.length === 1
          ? (group[0].refRangeLow !== undefined && group[0].refRangeHigh !== undefined
              ? `${t.labs.refRange}: ${group[0].refRangeLow} - ${group[0].refRangeHigh}`
              : undefined)
          : undefined,
        sourceRecord: group[0],
      };
    });
  }, []);

  useEffect(() => {
    async function loadEvents() {
      if (!currentPatient) return;
      setLoading(true);
      try {
        const [observations, transfusions, labs, alerts] = await Promise.all([
          MockDataSource.listObservations(currentPatient.id),
          MockDataSource.listTransfusions(currentPatient.id),
          MockDataSource.listLabValues(currentPatient.id),
          MockDataSource.listAlerts(currentPatient.id),
        ]);

        // Convert all records to timeline events (group labs collected at similar times)
        const allEvents: TimelineEvent[] = [
          ...observations.map((o) => observationToEvent(o, t)),
          ...transfusions.map((tr) => transfusionToEvent(tr, t)),
          ...groupLabsToEvents(labs, t),
          ...alerts.map((a) => alertToEvent(a, t)),
        ];

        // Sort by occurredAt (newest first)
        allEvents.sort(
          (a, b) =>
            new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
        );

        setEvents(allEvents);
      } catch (error) {
        console.error("Failed to load timeline:", error);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, [currentPatient, t, observationToEvent, transfusionToEvent, groupLabsToEvents, alertToEvent]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (eventTypeFilter !== "all" && event.eventType !== eventTypeFilter) {
        return false;
      }
      if (severityFilter !== "all" && event.severity !== severityFilter) {
        return false;
      }
      if (dateFilter !== "all") {
        const eventDate = event.occurredAt.split("T")[0];
        if (eventDate !== dateFilter) {
          return false;
        }
      }
      return true;
    });
  }, [events, eventTypeFilter, severityFilter, dateFilter]);

  // Get unique dates for the date picker
  const uniqueDates = useMemo(() => {
    const dates = new Set(events.map((e) => e.occurredAt.split("T")[0]));
    return Array.from(dates).sort().reverse();
  }, [events]);

  function clearFilters() {
    setEventTypeFilter("all");
    setSeverityFilter("all");
    setDateFilter("all");
  }

  const hasFilters = eventTypeFilter !== "all" || severityFilter !== "all" || dateFilter !== "all";

  if (!currentPatient) {
    return <EmptyState title={t.patient.noPatientSelected} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.timeline.title}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {events.length} {t.timeline.totalEvents}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            {t.timeline.filters}
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 px-2"
              >
                <X className="w-3 h-3 mr-1" />
                {t.timeline.clear}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <Label className="text-xs">{t.timeline.eventType}</Label>
              <Select
                value={eventTypeFilter}
                onValueChange={(v) => setEventTypeFilter(v as TimelineEventType | "all")}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.timeline.allTypes}</SelectItem>
                  <SelectItem value="observation">{t.timeline.observations}</SelectItem>
                  <SelectItem value="transfusion">{t.timeline.transfusionsType}</SelectItem>
                  <SelectItem value="lab">{t.timeline.labResultsType}</SelectItem>
                  <SelectItem value="alert">{t.timeline.alertsType}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{t.timeline.severity}</Label>
              <Select
                value={severityFilter}
                onValueChange={(v) => setSeverityFilter(v as Severity | "all")}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.timeline.all}</SelectItem>
                  <SelectItem value="info">{t.timeline.info}</SelectItem>
                  <SelectItem value="warning">{t.timeline.warning}</SelectItem>
                  <SelectItem value="critical">{t.timeline.critical}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{t.timeline.date}</Label>
              <Select
                value={dateFilter}
                onValueChange={setDateFilter}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t.timeline.allDates} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.timeline.allDates}</SelectItem>
                  {uniqueDates.map((date) => (
                    <SelectItem key={date} value={date}>
                      {new Date(date + "T00:00:00").toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasFilters && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">
                {t.timeline.showing} {filteredEvents.length} {t.timeline.of} {events.length} {t.timeline.events}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">{t.common.loading}</div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          title={t.timeline.noEvents}
          description={hasFilters ? t.timeline.noEventsMatch : t.timeline.noEventsYet}
          action={hasFilters ? { label: t.timeline.clearFilters, onClick: clearFilters } : undefined}
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <EventTimeline events={filteredEvents} showDate />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
