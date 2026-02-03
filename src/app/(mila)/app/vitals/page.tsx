"use client";

import { useEffect, useCallback } from "react";
import { Power, PowerOff, Bell, BellOff } from "lucide-react";
import { usePatientStore, useMonitorStore } from "@/lib/mila/store";
import { useTranslation } from "@/lib/mila/i18n";
import { MockMonitorStream } from "@/lib/mila/sources/monitor";
import { VitalCard, EmptyState } from "@/components/mila";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { VitalType, MonitorEvent } from "@/lib/mila/types";
import { formatTime } from "@/lib/mila/utils/dates";

const VITAL_TYPES: VitalType[] = ["hr", "spo2", "rr", "temp"];

export default function VitalsPage() {
  const { currentPatient } = usePatientStore();
  const { t } = useTranslation();
  const {
    connectionStatus,
    setConnectionStatus,
    latestVitals,
    setLatestVital,
    vitalBuffers,
    appendToBuffer,
    activeAlerts,
    addAlert,
    acknowledgeAlert,
    clearBuffers,
    clearLatestVitals,
    monitorEnabled,
    setMonitorEnabled,
  } = useMonitorStore();

  const handleMonitorEvent = useCallback(
    (event: MonitorEvent) => {
      switch (event.type) {
        case "vital":
          setLatestVital(event.data.type, event.data);
          appendToBuffer(event.data.type, event.data);
          break;
        case "alert":
          addAlert(event.data);
          break;
        case "connection":
          setConnectionStatus(event.status);
          break;
      }
    },
    [setLatestVital, appendToBuffer, addAlert, setConnectionStatus]
  );

  // Connect/disconnect monitor based on patient and enabled state
  useEffect(() => {
    if (!currentPatient) return;

    if (monitorEnabled && connectionStatus === "disconnected") {
      MockMonitorStream.connect(currentPatient.id);
    }

    const unsubscribe = MockMonitorStream.subscribe(handleMonitorEvent);

    return () => {
      unsubscribe();
    };
  }, [currentPatient, monitorEnabled, connectionStatus, handleMonitorEvent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      MockMonitorStream.disconnect();
    };
  }, []);

  function toggleMonitor() {
    if (monitorEnabled) {
      MockMonitorStream.disconnect();
      setMonitorEnabled(false);
      clearBuffers();
      clearLatestVitals();
    } else {
      setMonitorEnabled(true);
      if (currentPatient) {
        MockMonitorStream.connect(currentPatient.id);
      }
    }
  }

  function handleAcknowledge(alertId: string) {
    acknowledgeAlert(alertId);
  }

  function handleAcknowledgeAll() {
    activeAlerts.forEach((a) => {
      if (!a.acknowledged) {
        acknowledgeAlert(a.id);
      }
    });
  }

  if (!currentPatient) {
    return <EmptyState title={t.patient.noPatientSelected} />;
  }

  const unacknowledgedCount = activeAlerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">{t.vitals.title}</h1>
          <Badge
            variant={connectionStatus === "connected" ? "success" : "secondary"}
          >
            {connectionStatus === "connected" ? t.vitals.connected : t.vitals.disconnected}
          </Badge>
        </div>
        <Button
          variant={monitorEnabled ? "destructive" : "default"}
          onClick={toggleMonitor}
        >
          {monitorEnabled ? (
            <>
              <PowerOff className="w-4 h-4 mr-2" />
              {t.vitals.stopMonitor}
            </>
          ) : (
            <>
              <Power className="w-4 h-4 mr-2" />
              {t.vitals.startMonitor}
            </>
          )}
        </Button>
      </div>

      {/* Vital Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {VITAL_TYPES.map((type) => (
          <VitalCard
            key={type}
            type={type}
            currentValue={latestVitals[type]}
            history={vitalBuffers[type]}
            showSparkline={monitorEnabled}
          />
        ))}
      </div>

      {/* Alerts Panel */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {t.vitals.alerts}
            {unacknowledgedCount > 0 && (
              <Badge variant="destructive">{unacknowledgedCount}</Badge>
            )}
          </CardTitle>
          {unacknowledgedCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleAcknowledgeAll}>
              {t.vitals.acknowledgeAll}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {activeAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t.vitals.noAlertsSession}
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      alert.acknowledged
                        ? "bg-muted/50 opacity-60"
                        : alert.severity === "critical"
                        ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                        : "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            alert.severity === "critical"
                              ? "destructive"
                              : "warning"
                          }
                        >
                          {alert.severity === "critical" ? t.timeline.critical : t.timeline.warning}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">
                          {formatTime(alert.occurredAt)}
                        </span>
                        {alert.acknowledged && (
                          <Badge variant="outline" className="text-xs">
                            {t.common.acknowledged}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm mt-1">{alert.message}</p>
                    </div>
                    {!alert.acknowledged && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAcknowledge(alert.id)}
                      >
                        <BellOff className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Monitor Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">
            <p>
              <strong>{t.vitals.simulatorNote}</strong> {t.vitals.simulatorDesc}
            </p>
            <p className="mt-2">
              {t.vitals.thresholdNote}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
