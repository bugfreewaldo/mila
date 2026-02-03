"use client";

import {
  FileText,
  Droplets,
  FlaskConical,
  AlertTriangle,
  Clock,
  ChevronRight,
  Syringe,
  ClipboardList,
  Baby,
  User,
  Activity,
  Heart,
} from "lucide-react";
import type { TimelineEvent, TimelineEventType, Severity, Observation, Order, Phlebotomy, Feeding, Transfusion } from "@/lib/mila/types";
import { formatTime, formatDate, isToday } from "@/lib/mila/utils/dates";
import { useTranslation } from "@/lib/mila/i18n";
import { cn } from "@/lib/utils";

// Helper to extract performer/source info from different event types
function getEventMetadata(event: TimelineEvent, language: "en" | "es"): {
  performer?: string;
  role?: string;
  action?: string;
  executedBy?: string;
  executedAt?: string;
} {
  const record = event.sourceRecord;

  switch (event.eventType) {
    case "observation": {
      const obs = record as Observation;
      const sourceLabels: Record<string, { en: string; es: string }> = {
        nurse: { en: "Nurse", es: "Enfermera" },
        doctor: { en: "Doctor", es: "Médico" },
        parent: { en: "Parent", es: "Padre/Madre" },
        monitor: { en: "Monitor", es: "Monitor" },
        system: { en: "System", es: "Sistema" },
      };
      return {
        performer: obs.sourceName || sourceLabels[obs.source]?.[language] || obs.source,
        role: obs.sourceName ? sourceLabels[obs.source]?.[language] : undefined,
      };
    }
    case "order": {
      const order = record as Order;
      const statusLabels: Record<string, { en: string; es: string }> = {
        pending: { en: "Ordered", es: "Ordenado" },
        in_progress: { en: "In Progress", es: "En Progreso" },
        completed: { en: "Completed", es: "Completado" },
        cancelled: { en: "Cancelled", es: "Cancelado" },
      };
      return {
        performer: order.orderedBy,
        role: order.orderedByRole,
        action: statusLabels[order.status]?.[language] || order.status,
        executedBy: order.executedBy,
        executedAt: order.executedAt,
      };
    }
    case "phlebotomy": {
      const phle = record as Phlebotomy;
      return {
        performer: phle.drawnBy,
        action: language === "es" ? "Extracción" : "Blood draw",
      };
    }
    case "feeding": {
      const feed = record as Feeding;
      return {
        performer: feed.givenBy,
        action: language === "es" ? "Alimentación" : "Feeding",
      };
    }
    case "transfusion": {
      const trans = record as Transfusion;
      return {
        action: trans.isEmergency
          ? (language === "es" ? "Emergencia" : "Emergency")
          : (language === "es" ? "Transfusión" : "Transfusion"),
      };
    }
    default:
      return {};
  }
}

interface EventTimelineProps {
  events: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
  showDate?: boolean;
  compact?: boolean;
}

const eventIcons: Record<TimelineEventType, typeof FileText> = {
  observation: FileText,
  transfusion: Droplets,
  lab: FlaskConical,
  alert: AlertTriangle,
  phlebotomy: Syringe,
  order: ClipboardList,
  feeding: Baby,
  clinical_status: Activity,
  developmental_care: Heart,
};

const eventStyles: Record<TimelineEventType, {
  gradient: string;
  bg: string;
  border: string;
  text: string;
}> = {
  observation: {
    gradient: "from-[hsl(var(--baby-mint))] to-[hsl(160,60%,70%)]",
    bg: "bg-[hsl(var(--baby-mint)/0.2)]",
    border: "border-[hsl(var(--baby-mint))]",
    text: "text-[hsl(160,50%,35%)]",
  },
  transfusion: {
    gradient: "from-[hsl(var(--baby-pink))] to-[hsl(350,70%,75%)]",
    bg: "bg-[hsl(var(--baby-pink)/0.2)]",
    border: "border-[hsl(var(--baby-pink))]",
    text: "text-[hsl(350,50%,40%)]",
  },
  lab: {
    gradient: "from-[hsl(var(--baby-lavender))] to-[hsl(270,60%,75%)]",
    bg: "bg-[hsl(var(--baby-lavender)/0.2)]",
    border: "border-[hsl(var(--baby-lavender))]",
    text: "text-[hsl(270,40%,40%)]",
  },
  alert: {
    gradient: "from-[hsl(var(--baby-peach))] to-[hsl(25,80%,70%)]",
    bg: "bg-[hsl(var(--baby-peach)/0.3)]",
    border: "border-[hsl(var(--baby-peach))]",
    text: "text-[hsl(25,60%,35%)]",
  },
  phlebotomy: {
    gradient: "from-[hsl(350,70%,65%)] to-[hsl(350,80%,75%)]",
    bg: "bg-[hsl(350,70%,65%)/0.2]",
    border: "border-[hsl(350,70%,65%)]",
    text: "text-[hsl(350,60%,40%)]",
  },
  order: {
    gradient: "from-[hsl(var(--baby-blue))] to-[hsl(200,70%,70%)]",
    bg: "bg-[hsl(var(--baby-blue)/0.2)]",
    border: "border-[hsl(var(--baby-blue))]",
    text: "text-[hsl(200,50%,35%)]",
  },
  feeding: {
    gradient: "from-[hsl(var(--baby-yellow))] to-[hsl(45,80%,70%)]",
    bg: "bg-[hsl(var(--baby-yellow)/0.2)]",
    border: "border-[hsl(var(--baby-yellow))]",
    text: "text-[hsl(45,60%,30%)]",
  },
  clinical_status: {
    gradient: "from-[hsl(280,60%,60%)] to-[hsl(280,70%,75%)]",
    bg: "bg-[hsl(280,60%,60%)/0.2]",
    border: "border-[hsl(280,60%,60%)]",
    text: "text-[hsl(280,50%,35%)]",
  },
  developmental_care: {
    gradient: "from-[hsl(330,60%,65%)] to-[hsl(330,70%,80%)]",
    bg: "bg-[hsl(330,60%,65%)/0.2]",
    border: "border-[hsl(330,60%,65%)]",
    text: "text-[hsl(330,50%,35%)]",
  },
};

const severityStyles: Record<Severity, {
  dot: string;
  badge: string;
}> = {
  info: {
    dot: "bg-[hsl(var(--baby-blue))]",
    badge: "bg-[hsl(var(--baby-blue)/0.3)] text-[hsl(200,50%,35%)] border-[hsl(var(--baby-blue))]",
  },
  warning: {
    dot: "bg-[hsl(var(--baby-yellow))]",
    badge: "bg-[hsl(var(--baby-yellow)/0.3)] text-[hsl(45,70%,30%)] border-[hsl(var(--baby-yellow))]",
  },
  critical: {
    dot: "bg-[hsl(var(--destructive))]",
    badge: "bg-[hsl(var(--destructive)/0.15)] text-[hsl(var(--destructive))] border-[hsl(var(--destructive)/0.3)]",
  },
};

export function EventTimeline({
  events,
  onEventClick,
  showDate = false,
  compact = false,
}: EventTimelineProps) {
  const { t, language } = useTranslation();

  // Translation labels for event types
  const eventLabels: Record<TimelineEventType, string> = {
    observation: t.timeline.observations,
    transfusion: t.timeline.transfusionsType,
    lab: t.timeline.labResultsType,
    alert: t.timeline.alertsType,
    phlebotomy: t.timeline.phlebotomyType || "Blood Draw",
    order: t.timeline.orderType || "Order",
    feeding: t.timeline.feedingType || "Feeding",
    clinical_status: language === "es" ? "Estado Clinico" : "Clinical Status",
    developmental_care: language === "es" ? "Estimulacion Temprana" : "Developmental Care",
  };

  // Group events by date
  const groupedEvents = events.reduce<Record<string, TimelineEvent[]>>(
    (acc, event) => {
      const dateKey = event.occurredAt.split("T")[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(event);
      return acc;
    },
    {}
  );

  const sortedDates = Object.keys(groupedEvents).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => (
        <div key={date}>
          {showDate && (
            <div className="sticky top-0 bg-background/80 backdrop-blur-md py-3 mb-4 z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-[hsl(var(--baby-lavender))] flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {isToday(date + "T00:00:00Z") ? t.timeline.today : formatDate(date + "T00:00:00Z")}
                </h3>
              </div>
            </div>
          )}

          <div className="relative">
            {/* Timeline line - gradient */}
            <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-[hsl(var(--baby-lavender))] via-[hsl(var(--baby-pink)/0.5)] to-[hsl(var(--baby-mint)/0.3)] rounded-full" />

            <div className="space-y-3">
              {groupedEvents[date]
                .sort(
                  (a, b) =>
                    new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
                )
                .map((event, index) => {
                  const Icon = eventIcons[event.eventType];
                  const style = eventStyles[event.eventType];
                  const severity = severityStyles[event.severity];

                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "relative flex items-start gap-4 pl-12 group",
                        onEventClick && "cursor-pointer"
                      )}
                      onClick={() => onEventClick?.(event)}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Icon with gradient background */}
                      <div
                        className={cn(
                          "absolute left-0 flex items-center justify-center w-9 h-9 rounded-xl shadow-playful transition-all duration-300 group-hover:scale-110 group-hover:shadow-playful-lg",
                          `bg-gradient-to-br ${style.gradient}`
                        )}
                      >
                        <Icon className="w-4 h-4 text-white drop-shadow-sm" />
                      </div>

                      {/* Event Card */}
                      <div
                        className={cn(
                          "flex-1 rounded-2xl border-2 p-4 transition-all duration-300",
                          "hover:shadow-playful hover:-translate-y-0.5",
                          style.bg,
                          style.border,
                          compact ? "p-3" : "p-4"
                        )}
                      >
                        {/* Header row */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Event type badge */}
                            <span
                              className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                style.bg,
                                style.text,
                                style.border
                              )}
                            >
                              {eventLabels[event.eventType]}
                            </span>

                            {/* Severity indicator (only for warning/critical) */}
                            {event.severity !== "info" && (
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
                                  severity.badge
                                )}
                              >
                                <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", severity.dot)} />
                                {event.severity === "warning" ? t.timeline.attention : t.timeline.urgent}
                              </span>
                            )}
                          </div>

                          {/* Time */}
                          <span className="text-xs text-muted-foreground font-medium tabular-nums flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(event.occurredAt)}
                          </span>
                        </div>

                        {/* Content */}
                        <p className={cn(
                          "font-medium text-foreground",
                          compact ? "text-sm" : "text-base"
                        )}>
                          {event.summary}
                        </p>

                        {/* Details */}
                        {event.details && !compact && (
                          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                            {event.details}
                          </p>
                        )}

                        {/* Performer/Source Metadata */}
                        {!compact && (() => {
                          const metadata = getEventMetadata(event, language as "en" | "es");
                          if (!metadata.performer && !metadata.executedBy) return null;
                          return (
                            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-dashed text-xs text-muted-foreground">
                              {metadata.performer && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  <span className="font-medium">{metadata.performer}</span>
                                  {metadata.role && <span className="opacity-70">({metadata.role})</span>}
                                </span>
                              )}
                              {metadata.executedBy && metadata.executedAt && (
                                <span className="flex items-center gap-1">
                                  <span className="opacity-70">•</span>
                                  <span>{language === "es" ? "Ejecutado por" : "Executed by"}</span>
                                  <span className="font-medium">{metadata.executedBy}</span>
                                  <span className="opacity-70">@ {formatTime(metadata.executedAt)}</span>
                                </span>
                              )}
                            </div>
                          );
                        })()}

                        {/* Click indicator */}
                        {onEventClick && (
                          <div className="flex items-center justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              {t.timeline.seeMore} <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
