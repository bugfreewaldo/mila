"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePatientStore } from "@/lib/mila/store";
import { useTranslation } from "@/lib/mila/i18n";
import { MockDataSource } from "@/lib/mila/sources";
import { EmptyState } from "@/components/mila";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { observationFormSchema, type ObservationFormData } from "@/lib/mila/utils/validators";
import { formatDateTime } from "@/lib/mila/utils/dates";
import type { Observation, ObservationCategory, ObservationSource, Severity } from "@/lib/mila/types";

export default function ObservationsPage() {
  const { currentPatient } = usePatientStore();
  const { t, language } = useTranslation();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<ObservationFormData>({
    resolver: zodResolver(observationFormSchema),
    defaultValues: {
      occurredAt: new Date().toISOString().slice(0, 16),
      category: "clinical",
      severity: "info",
      source: "nurse",
      content: "",
      tags: "",
    },
  });

  useEffect(() => {
    loadObservations();
  }, [currentPatient]);

  async function loadObservations() {
    if (!currentPatient) return;
    setLoading(true);
    try {
      const data = await MockDataSource.listObservations(currentPatient.id);
      setObservations(data);
    } catch (error) {
      console.error("Failed to load observations:", error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    form.reset({
      occurredAt: new Date().toISOString().slice(0, 16),
      category: "clinical",
      severity: "info",
      source: "nurse",
      content: "",
      tags: "",
    });
    setEditingId(null);
    setDialogOpen(true);
  }

  function openEditDialog(obs: Observation) {
    form.reset({
      occurredAt: obs.occurredAt.slice(0, 16),
      category: obs.category,
      severity: obs.severity,
      source: obs.source,
      content: obs.content,
      tags: obs.tags.join(", "),
    });
    setEditingId(obs.id);
    setDialogOpen(true);
  }

  async function onSubmit(data: ObservationFormData) {
    if (!currentPatient) return;

    try {
      const tags = data.tags
        ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      if (editingId) {
        await MockDataSource.updateObservation(editingId, {
          occurredAt: new Date(data.occurredAt).toISOString(),
          category: data.category,
          severity: data.severity,
          source: data.source,
          content: data.content,
          tags,
        });
      } else {
        await MockDataSource.createObservation({
          patientId: currentPatient.id,
          occurredAt: new Date(data.occurredAt).toISOString(),
          category: data.category,
          severity: data.severity,
          source: data.source,
          content: data.content,
          tags,
        });
      }

      setDialogOpen(false);
      loadObservations();
    } catch (error) {
      console.error("Failed to save observation:", error);
    }
  }

  async function deleteObservation(id: string) {
    const confirmMsg = language === "es"
      ? "¿Estás seguro de que quieres eliminar esta nota?"
      : "Are you sure you want to delete this note?";
    if (!confirm(confirmMsg)) return;

    try {
      await MockDataSource.deleteObservation(id);
      loadObservations();
    } catch (error) {
      console.error("Failed to delete observation:", error);
    }
  }

  const severityVariants: Record<Severity, "info" | "warning" | "critical"> = {
    info: "info",
    warning: "warning",
    critical: "critical",
  };

  const categoryLabels: Record<ObservationCategory, string> = {
    clinical: t.observations.clinical,
    nursing: t.observations.nursing,
    procedure: t.observations.procedure,
    event: t.observations.event,
  };

  const severityLabels: Record<Severity, string> = {
    info: t.timeline.info,
    warning: t.timeline.warning,
    critical: t.timeline.critical,
  };

  if (!currentPatient) {
    return <EmptyState title={t.patient.noPatientSelected} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.observations.title}</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          {t.observations.addNote}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">{t.common.loading}</div>
      ) : observations.length === 0 ? (
        <EmptyState
          title={t.observations.noNotes}
          description={t.observations.noNotesDesc}
          action={{ label: t.observations.addFirstNote, onClick: openCreateDialog }}
        />
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">{language === "es" ? "Fecha/Hora" : "Date/Time"}</TableHead>
                <TableHead className="w-24">{t.observations.category}</TableHead>
                <TableHead className="w-24">{t.timeline.severity}</TableHead>
                <TableHead className="w-32">{t.observations.source}</TableHead>
                <TableHead>{t.observations.content}</TableHead>
                <TableHead className="w-24">{t.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {observations.map((obs) => (
                <TableRow key={obs.id}>
                  <TableCell className="font-mono text-sm">
                    {formatDateTime(obs.occurredAt, language)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{categoryLabels[obs.category]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={severityVariants[obs.severity]}>
                      {severityLabels[obs.severity]}
                    </Badge>
                  </TableCell>
                  <TableCell>{obs.sourceName || obs.source}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {obs.content}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(obs)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteObservation(obs.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? t.observations.editNote : t.observations.addNote}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === "es" ? "Fecha/Hora" : "Date/Time"}</Label>
                <Input type="datetime-local" {...form.register("occurredAt")} />
              </div>
              <div className="space-y-2">
                <Label>{t.observations.source}</Label>
                <Select
                  value={form.watch("source")}
                  onValueChange={(v) => form.setValue("source", v as ObservationSource)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nurse">{t.observations.nurse}</SelectItem>
                    <SelectItem value="doctor">{t.observations.doctor}</SelectItem>
                    <SelectItem value="parent">{t.observations.parent}</SelectItem>
                    <SelectItem value="monitor">{t.observations.monitor}</SelectItem>
                    <SelectItem value="system">{t.observations.system}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.observations.category}</Label>
                <Select
                  value={form.watch("category")}
                  onValueChange={(v) => form.setValue("category", v as ObservationCategory)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinical">{t.observations.clinical}</SelectItem>
                    <SelectItem value="nursing">{t.observations.nursing}</SelectItem>
                    <SelectItem value="procedure">{t.observations.procedure}</SelectItem>
                    <SelectItem value="event">{t.observations.event}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.timeline.severity}</Label>
                <Select
                  value={form.watch("severity")}
                  onValueChange={(v) => form.setValue("severity", v as Severity)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">{t.timeline.info}</SelectItem>
                    <SelectItem value="warning">{t.timeline.warning}</SelectItem>
                    <SelectItem value="critical">{t.timeline.critical}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.observations.content}</Label>
              <Textarea
                rows={4}
                placeholder={t.observations.whatHappened}
                {...form.register("content")}
              />
              {form.formState.errors.content && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.content.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t.observations.tags}</Label>
              <Input placeholder={t.observations.tagsPlaceholder} {...form.register("tags")} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t.observations.cancel}
              </Button>
              <Button type="submit">
                {editingId ? t.observations.save : t.observations.addNote}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
