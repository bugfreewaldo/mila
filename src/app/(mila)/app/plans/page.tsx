"use client";

import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Play,
  Pause,
  Plus,
  History,
  Edit3,
  PauseCircle,
  PlayCircle,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "@/lib/mila/i18n";
import { usePatientStore } from "@/lib/mila/store";
import { TreatmentPlanRepository } from "@/lib/mila/db/repositories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type {
  TreatmentPlan,
  TreatmentPlanStatus,
  TreatmentPlanCategory,
  PlanAmendment,
  AmendmentType,
} from "@/lib/mila/types";

// Helper function to render markdown-style text as React elements
function renderFormattedText(text: string | undefined | null): React.ReactNode {
  if (!text) return null;

  // Split by **bold** pattern and render appropriately
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      // Remove the ** and render as bold
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-semibold">
          {boldText}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

// Category colors and icons
const CATEGORY_CONFIG: Record<
  TreatmentPlanCategory,
  { color: string; bgColor: string; label: string; labelEs: string }
> = {
  transfusion: {
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    label: "Transfusion",
    labelEs: "Transfusión",
  },
  sepsis: {
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    label: "Sepsis",
    labelEs: "Sepsis",
  },
  nec: {
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    label: "NEC",
    labelEs: "NEC",
  },
  respiratory: {
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    label: "Respiratory",
    labelEs: "Respiratorio",
  },
  feeding: {
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    label: "Feeding",
    labelEs: "Alimentación",
  },
  jaundice: {
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    label: "Jaundice",
    labelEs: "Ictericia",
  },
  hemolysis: {
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    label: "Hemolysis",
    labelEs: "Hemólisis",
  },
  general: {
    color: "text-gray-600",
    bgColor: "bg-gray-100 dark:bg-gray-900/30",
    label: "General",
    labelEs: "General",
  },
};

const STATUS_CONFIG: Record<
  TreatmentPlanStatus,
  {
    color: string;
    bgColor: string;
    icon: React.ElementType;
    label: string;
    labelEs: string;
  }
> = {
  active: {
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    icon: Play,
    label: "Active",
    labelEs: "Activo",
  },
  completed: {
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    icon: CheckCircle2,
    label: "Completed",
    labelEs: "Completado",
  },
  cancelled: {
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    icon: XCircle,
    label: "Cancelled",
    labelEs: "Cancelado",
  },
  modified: {
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    icon: AlertTriangle,
    label: "Modified",
    labelEs: "Modificado",
  },
};

const AMENDMENT_TYPE_LABELS: Record<AmendmentType, { en: string; es: string }> =
  {
    action_added: { en: "Action Added", es: "Acción Agregada" },
    action_removed: { en: "Action Removed", es: "Acción Eliminada" },
    action_modified: { en: "Action Modified", es: "Acción Modificada" },
    dosage_changed: { en: "Dosage Changed", es: "Dosis Cambiada" },
    hold: { en: "Plan Paused", es: "Plan Pausado" },
    resumed: { en: "Plan Resumed", es: "Plan Reanudado" },
    escalation: { en: "Treatment Escalated", es: "Tratamiento Intensificado" },
    deescalation: { en: "Treatment Reduced", es: "Tratamiento Reducido" },
    clinical_update: {
      en: "Clinical Update",
      es: "Actualización Clínica",
    },
    patient_response: {
      en: "Patient Response",
      es: "Respuesta del Paciente",
    },
    other: { en: "Other Change", es: "Otro Cambio" },
  };

export default function TreatmentPlansPage() {
  const { language } = useTranslation();
  const { currentPatient } = usePatientStore();
  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    TreatmentPlanStatus | "all"
  >("all");
  const [showHistory, setShowHistory] = useState<string | null>(null);

  // Dialog states
  const [addActionDialog, setAddActionDialog] = useState<{
    open: boolean;
    planId: string;
  } | null>(null);
  const [holdDialog, setHoldDialog] = useState<{
    open: boolean;
    planId: string;
  } | null>(null);
  const [newAction, setNewAction] = useState({
    description: "",
    descriptionEs: "",
    dosage: "",
    reason: "",
    reasonEs: "",
  });
  const [holdReason, setHoldReason] = useState("");

  const isEs = language === "es";

  useEffect(() => {
    async function loadPlans() {
      if (!currentPatient) {
        setPlans([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const allPlans = await TreatmentPlanRepository.byPatient(
          currentPatient.id
        );
        setPlans(allPlans);
      } catch (error) {
        console.error("Failed to load treatment plans:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPlans();
  }, [currentPatient]);

  const handleCompleteAction = async (planId: string, actionId: string) => {
    const updated = await TreatmentPlanRepository.completeAction(
      planId,
      actionId,
      "Current User"
    );
    if (updated) {
      setPlans(plans.map((p) => (p.id === planId ? updated : p)));
    }
  };

  const handleCancelPlan = async (planId: string) => {
    const updated = await TreatmentPlanRepository.cancel(
      planId,
      isEs ? "Cancelado por usuario" : "Cancelled by user"
    );
    if (updated) {
      setPlans(plans.map((p) => (p.id === planId ? updated : p)));
    }
  };

  const handleCompletePlan = async (planId: string) => {
    const outcome = isEs
      ? "Plan completado exitosamente"
      : "Plan completed successfully";
    const updated = await TreatmentPlanRepository.complete(
      planId,
      outcome,
      outcome
    );
    if (updated) {
      setPlans(plans.map((p) => (p.id === planId ? updated : p)));
    }
  };

  const handleDeletePlan = async (planId: string) => {
    await TreatmentPlanRepository.delete(planId);
    setPlans(plans.filter((p) => p.id !== planId));
  };

  const handleAddAction = async () => {
    if (!addActionDialog) return;

    const updated = await TreatmentPlanRepository.addAction(
      addActionDialog.planId,
      {
        description: newAction.description,
        descriptionEs: newAction.descriptionEs || newAction.description,
      },
      "Current User",
      newAction.reason,
      newAction.reasonEs || newAction.reason
    );

    if (updated) {
      setPlans(plans.map((p) => (p.id === updated.id ? updated : p)));
    }

    setAddActionDialog(null);
    setNewAction({
      description: "",
      descriptionEs: "",
      dosage: "",
      reason: "",
      reasonEs: "",
    });
  };

  const handleHoldPlan = async () => {
    if (!holdDialog) return;

    const updated = await TreatmentPlanRepository.holdPlan(
      holdDialog.planId,
      "Current User",
      holdReason,
      holdReason
    );

    if (updated) {
      setPlans(plans.map((p) => (p.id === updated.id ? updated : p)));
    }

    setHoldDialog(null);
    setHoldReason("");
  };

  const handleResumePlan = async (planId: string) => {
    const updated = await TreatmentPlanRepository.resumePlan(
      planId,
      "Current User"
    );

    if (updated) {
      setPlans(plans.map((p) => (p.id === updated.id ? updated : p)));
    }
  };

  const handleRemoveAction = async (
    planId: string,
    actionId: string,
    actionDesc: string
  ) => {
    const reason = isEs
      ? `Acción eliminada: ${actionDesc}`
      : `Action removed: ${actionDesc}`;
    const updated = await TreatmentPlanRepository.removeAction(
      planId,
      actionId,
      "Current User",
      reason,
      reason
    );

    if (updated) {
      setPlans(plans.map((p) => (p.id === updated.id ? updated : p)));
    }
  };

  const filteredPlans =
    statusFilter === "all"
      ? plans
      : plans.filter((p) => p.status === statusFilter);

  const activePlansCount = plans.filter((p) => p.status === "active").length;
  const completedPlansCount = plans.filter(
    (p) => p.status === "completed"
  ).length;
  const modifiedPlansCount = plans.filter(
    (p) => p.status === "modified"
  ).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isEs ? "es-ES" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!currentPatient) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {isEs
              ? "Seleccione un paciente para ver los planes de tratamiento"
              : "Select a patient to view treatment plans"}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            {isEs ? "Planes de Tratamiento" : "Treatment Plans"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEs
              ? "Planes flexibles creados por MILA - se adaptan según la evolución del paciente"
              : "Flexible plans created by MILA - adapt based on patient progress"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Play className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {activePlansCount}
                </p>
                <p className="text-sm text-blue-600/70">
                  {isEs ? "Activos" : "Active"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  {modifiedPlansCount}
                </p>
                <p className="text-sm text-amber-600/70">
                  {isEs ? "Modificados" : "Modified"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {completedPlansCount}
                </p>
                <p className="text-sm text-green-600/70">
                  {isEs ? "Completados" : "Completed"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {plans.length}
                </p>
                <p className="text-sm text-purple-600/70">
                  {isEs ? "Total" : "Total"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "active", "modified", "completed", "cancelled"] as const).map(
          (status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="rounded-xl"
            >
              {status === "all"
                ? isEs
                  ? "Todos"
                  : "All"
                : STATUS_CONFIG[status][isEs ? "labelEs" : "label"]}
            </Button>
          )
        )}
      </div>

      {/* Plans List */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="w-8 h-8 mx-auto mb-2 animate-pulse text-purple-500" />
            {isEs ? "Cargando planes..." : "Loading plans..."}
          </CardContent>
        </Card>
      ) : filteredPlans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-medium">
              {isEs
                ? "No hay planes de tratamiento"
                : "No treatment plans yet"}
            </p>
            <p className="text-sm mt-1">
              {isEs
                ? "Los planes se crean cuando apruebas una recomendación de MILA"
                : "Plans are created when you approve a MILA recommendation"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPlans.map((plan) => {
            const categoryConfig = CATEGORY_CONFIG[plan.category];
            const statusConfig = STATUS_CONFIG[plan.status];
            const StatusIcon = statusConfig.icon;
            const isExpanded = expandedPlan === plan.id;
            const activeActions = plan.actions.filter((a) => !a.isRemoved);
            const completedActions = activeActions.filter(
              (a) => a.completed
            ).length;
            const totalActions = activeActions.length;
            const progress =
              totalActions > 0 ? (completedActions / totalActions) * 100 : 0;
            const amendments = plan.amendments || [];

            return (
              <Card
                key={plan.id}
                className={cn(
                  "overflow-hidden transition-all",
                  plan.status === "active" &&
                    !plan.isOnHold &&
                    "border-blue-300 dark:border-blue-700",
                  plan.isOnHold && "border-yellow-400 dark:border-yellow-600"
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge
                          className={cn(
                            "text-xs",
                            categoryConfig.bgColor,
                            categoryConfig.color
                          )}
                        >
                          {isEs ? categoryConfig.labelEs : categoryConfig.label}
                        </Badge>
                        <Badge
                          className={cn(
                            "text-xs",
                            statusConfig.bgColor,
                            statusConfig.color
                          )}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {isEs ? statusConfig.labelEs : statusConfig.label}
                        </Badge>
                        {plan.isOnHold && (
                          <Badge className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700">
                            <PauseCircle className="w-3 h-3 mr-1" />
                            {isEs ? "En Pausa" : "On Hold"}
                          </Badge>
                        )}
                        {amendments.length > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs cursor-pointer hover:bg-muted"
                            onClick={() =>
                              setShowHistory(
                                showHistory === plan.id ? null : plan.id
                              )
                            }
                          >
                            <History className="w-3 h-3 mr-1" />
                            {amendments.length}{" "}
                            {isEs ? "cambios" : "changes"}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">
                        {renderFormattedText(
                          isEs ? plan.titleEs : plan.title
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {formatDate(plan.occurredAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedPlan(isExpanded ? null : plan.id)
                      }
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* Progress bar */}
                  {(plan.status === "active" || plan.status === "modified") &&
                    totalActions > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>{isEs ? "Progreso" : "Progress"}</span>
                          <span>
                            {completedActions}/{totalActions}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all",
                              plan.isOnHold
                                ? "bg-yellow-500"
                                : "bg-gradient-to-r from-blue-500 to-purple-500"
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    {/* On Hold Banner */}
                    {plan.isOnHold && (
                      <div className="mb-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                              <PauseCircle className="w-4 h-4" />
                              {isEs ? "Plan en Pausa" : "Plan On Hold"}
                            </p>
                            {plan.holdReason && (
                              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                                {plan.holdReason}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleResumePlan(plan.id)}
                            className="rounded-xl bg-yellow-600 hover:bg-yellow-700"
                          >
                            <PlayCircle className="w-4 h-4 mr-2" />
                            {isEs ? "Reanudar" : "Resume"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Amendment History */}
                    {showHistory === plan.id && amendments.length > 0 && (
                      <div className="mb-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border">
                        <p className="text-sm font-medium mb-2 flex items-center gap-2">
                          <History className="w-4 h-4" />
                          {isEs ? "Historial de Cambios" : "Change History"}
                        </p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {amendments
                            .slice()
                            .reverse()
                            .map((amendment) => (
                              <div
                                key={amendment.id}
                                className="text-xs p-2 bg-white dark:bg-gray-800 rounded border"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <Badge
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {
                                      AMENDMENT_TYPE_LABELS[amendment.type][
                                        isEs ? "es" : "en"
                                      ]
                                    }
                                  </Badge>
                                  <span className="text-muted-foreground">
                                    {formatDate(amendment.occurredAt)}
                                  </span>
                                </div>
                                <p className="text-muted-foreground">
                                  {isEs
                                    ? amendment.descriptionEs
                                    : amendment.description}
                                </p>
                                <p className="text-muted-foreground/70 mt-1">
                                  {isEs ? "Razón" : "Reason"}:{" "}
                                  {isEs
                                    ? amendment.reasonEs
                                    : amendment.reason}
                                </p>
                                <p className="text-muted-foreground/50 mt-1">
                                  {isEs ? "Por" : "By"}: {amendment.amendedBy}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    <div className="mb-4 p-3 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium mb-1">
                        {isEs ? "Resumen" : "Summary"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {renderFormattedText(
                          isEs ? plan.summaryEs : plan.summary
                        )}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {isEs ? "Acciones" : "Actions"}
                        </p>
                        {(plan.status === "active" ||
                          plan.status === "modified") &&
                          !plan.isOnHold && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl text-xs"
                              onClick={() =>
                                setAddActionDialog({
                                  open: true,
                                  planId: plan.id,
                                })
                              }
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              {isEs ? "Agregar" : "Add"}
                            </Button>
                          )}
                      </div>
                      {activeActions.map((action, idx) => (
                        <div
                          key={action.id}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg border transition-all",
                            action.completed
                              ? "bg-green-50 dark:bg-green-900/20 border-green-200"
                              : "bg-white dark:bg-gray-900 border-gray-200"
                          )}
                        >
                          <button
                            onClick={() =>
                              !action.completed &&
                              (plan.status === "active" ||
                                plan.status === "modified") &&
                              !plan.isOnHold &&
                              handleCompleteAction(plan.id, action.id)
                            }
                            disabled={
                              action.completed ||
                              plan.isOnHold ||
                              (plan.status !== "active" &&
                                plan.status !== "modified")
                            }
                            className={cn(
                              "mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                              action.completed
                                ? "bg-green-500 border-green-500"
                                : "border-gray-300 hover:border-blue-500"
                            )}
                          >
                            {action.completed && (
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-sm",
                                action.completed &&
                                  "line-through text-muted-foreground"
                              )}
                            >
                              <span className="font-medium text-muted-foreground mr-2">
                                {idx + 1}.
                              </span>
                              {renderFormattedText(
                                isEs
                                  ? action.descriptionEs
                                  : action.description
                              )}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {action.dosage && (
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {action.dosage}
                                </Badge>
                              )}
                              {action.addedAt && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-amber-50 text-amber-700"
                                >
                                  <Plus className="w-2 h-2 mr-1" />
                                  {isEs ? "Agregado" : "Added"}{" "}
                                  {formatDate(action.addedAt)}
                                </Badge>
                              )}
                            </div>
                            {action.completedAt && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {isEs ? "Completado" : "Completed"}:{" "}
                                {formatDate(action.completedAt)}
                              </p>
                            )}
                          </div>
                          {!action.completed &&
                            (plan.status === "active" ||
                              plan.status === "modified") &&
                            !plan.isOnHold && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                                onClick={() =>
                                  handleRemoveAction(
                                    plan.id,
                                    action.id,
                                    action.description
                                  )
                                }
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}
                        </div>
                      ))}
                    </div>

                    {/* Action buttons */}
                    {(plan.status === "active" ||
                      plan.status === "modified") &&
                      !plan.isOnHold && (
                        <div className="flex gap-2 mt-4 pt-4 border-t flex-wrap">
                          <Button
                            size="sm"
                            onClick={() => handleCompletePlan(plan.id)}
                            className="rounded-xl bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {isEs ? "Marcar Completado" : "Mark Complete"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setHoldDialog({ open: true, planId: plan.id })
                            }
                            className="rounded-xl text-yellow-600 hover:text-yellow-700"
                          >
                            <PauseCircle className="w-4 h-4 mr-2" />
                            {isEs ? "Pausar" : "Hold"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelPlan(plan.id)}
                            className="rounded-xl text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            {isEs ? "Cancelar" : "Cancel"}
                          </Button>
                        </div>
                      )}

                    {/* Delete button for non-active plans */}
                    {plan.status !== "active" &&
                      plan.status !== "modified" && (
                        <div className="flex justify-end mt-4 pt-4 border-t">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeletePlan(plan.id)}
                            className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {isEs ? "Eliminar" : "Delete"}
                          </Button>
                        </div>
                      )}

                    {/* Outcome if completed */}
                    {plan.outcome && (
                      <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200">
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">
                          {isEs ? "Resultado" : "Outcome"}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {renderFormattedText(
                            isEs ? plan.outcomeEs : plan.outcome
                          )}
                        </p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Action Dialog */}
      <Dialog
        open={addActionDialog?.open || false}
        onOpenChange={(open) => !open && setAddActionDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEs ? "Agregar Nueva Acción" : "Add New Action"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                {isEs ? "Descripción (Inglés)" : "Description (English)"}
              </label>
              <Textarea
                value={newAction.description}
                onChange={(e) =>
                  setNewAction({ ...newAction, description: e.target.value })
                }
                placeholder={
                  isEs
                    ? "Ej: Administrar medicamento X"
                    : "e.g., Administer medication X"
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {isEs ? "Descripción (Español)" : "Description (Spanish)"}
              </label>
              <Textarea
                value={newAction.descriptionEs}
                onChange={(e) =>
                  setNewAction({ ...newAction, descriptionEs: e.target.value })
                }
                placeholder={
                  isEs
                    ? "Ej: Administrar medicamento X"
                    : "e.g., Administrar medicamento X"
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {isEs ? "Razón del Cambio" : "Reason for Change"}
              </label>
              <Input
                value={newAction.reason}
                onChange={(e) =>
                  setNewAction({ ...newAction, reason: e.target.value })
                }
                placeholder={
                  isEs
                    ? "Ej: Basado en nuevos resultados de laboratorio"
                    : "e.g., Based on new lab results"
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddActionDialog(null)}>
              {isEs ? "Cancelar" : "Cancel"}
            </Button>
            <Button onClick={handleAddAction} disabled={!newAction.description}>
              <Plus className="w-4 h-4 mr-2" />
              {isEs ? "Agregar" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hold Plan Dialog */}
      <Dialog
        open={holdDialog?.open || false}
        onOpenChange={(open) => !open && setHoldDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEs ? "Pausar Plan" : "Put Plan On Hold"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isEs
                ? "El plan será pausado temporalmente. Puede reanudarlo en cualquier momento."
                : "The plan will be temporarily paused. You can resume it at any time."}
            </p>
            <div>
              <label className="text-sm font-medium">
                {isEs ? "Razón para Pausar" : "Reason for Hold"}
              </label>
              <Textarea
                value={holdReason}
                onChange={(e) => setHoldReason(e.target.value)}
                placeholder={
                  isEs
                    ? "Ej: Esperando resultados de laboratorio..."
                    : "e.g., Waiting for lab results..."
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHoldDialog(null)}>
              {isEs ? "Cancelar" : "Cancel"}
            </Button>
            <Button
              onClick={handleHoldPlan}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <PauseCircle className="w-4 h-4 mr-2" />
              {isEs ? "Pausar Plan" : "Hold Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
