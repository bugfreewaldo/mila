"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { usePatientStore } from "@/lib/mila/store";
import { useTranslation } from "@/lib/mila/i18n";
import { MockDataSource } from "@/lib/mila/sources";
import { TransfusionRepository } from "@/lib/mila/db/repositories";
import { EmptyState, StatPanel, TransfusionJustificationPanel } from "@/components/mila";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { transfusionFormSchema, type TransfusionFormData } from "@/lib/mila/utils/validators";
import { formatDateTime, formatChartDate } from "@/lib/mila/utils/dates";
import { generateDonorId } from "@/lib/mila/utils/ids";
import type { TransfusionJustification } from "@/lib/mila/data/transfusion-thresholds";
import type { Transfusion, TransfusionType, LabValue } from "@/lib/mila/types";
import { analyzeTransfusions, type TransfusionAnalysis } from "@/lib/mila/services/transfusion-analysis";

const typeColors: Record<TransfusionType, string> = {
  rbc: "#ef4444",
  platelet: "#f59e0b",
  plasma: "#3b82f6",
  other: "#6b7280",
};

export default function TransfusionsPage() {
  const { currentPatient } = usePatientStore();
  const { t, language } = useTranslation();
  const [transfusions, setTransfusions] = useState<Transfusion[]>([]);
  const [chartData, setChartData] = useState<Array<Record<string, unknown>>>([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    totalVolume: 0,
    volumeByType: { rbc: 0, platelet: 0, plasma: 0, other: 0 },
    uniqueDonors: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [justification, setJustification] = useState<TransfusionJustification | null>(null);
  const [analysis, setAnalysis] = useState<TransfusionAnalysis | null>(null);

  const typeLabels: Record<TransfusionType, string> = {
    rbc: t.transfusions.rbcShort,
    platelet: t.transfusions.platelet,
    plasma: t.transfusions.plasmaFFP,
    other: t.transfusions.other,
  };

  const form = useForm<TransfusionFormData>({
    resolver: zodResolver(transfusionFormSchema),
    defaultValues: {
      occurredAt: new Date().toISOString().slice(0, 16),
      type: "rbc",
      volumeMl: 15,
      donorId: generateDonorId(),
      notes: "",
      isEmergency: false,
      parentConsentObtained: false,
      clinicalJustification: "",
    },
  });

  const isEmergency = form.watch("isEmergency");
  const parentConsentObtained = form.watch("parentConsentObtained");
  const transfusionType = form.watch("type");

  // Determine if form can be submitted
  const canSubmit = isEmergency || parentConsentObtained;

  const handleJustificationChange = useCallback((j: TransfusionJustification) => {
    setJustification(j);
  }, []);

  useEffect(() => {
    loadData();
  }, [currentPatient]);

  async function loadData() {
    if (!currentPatient) return;
    setLoading(true);
    try {
      const [data, statsData, cumulative, labs] = await Promise.all([
        MockDataSource.listTransfusions(currentPatient.id),
        MockDataSource.getTransfusionStats(currentPatient.id),
        TransfusionRepository.getCumulativeByPatient(currentPatient.id),
        MockDataSource.listLabValues(currentPatient.id),
      ]);
      setTransfusions(data);
      setStats(statsData);

      // Run transfusion analysis
      const analysisResult = await analyzeTransfusions(currentPatient, data, labs);
      setAnalysis(analysisResult);

      // Format chart data
      setChartData(
        cumulative.map((c) => ({
          date: formatChartDate(c.occurredAt),
          rbc: c.cumulativeRbc,
          platelet: c.cumulativePlatelet,
          plasma: c.cumulativePlasma,
          other: c.cumulativeOther,
        }))
      );
    } catch (error) {
      console.error("Failed to load transfusions:", error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    form.reset({
      occurredAt: new Date().toISOString().slice(0, 16),
      type: "rbc",
      volumeMl: 15,
      donorId: generateDonorId(),
      notes: "",
      isEmergency: false,
      parentConsentObtained: false,
      clinicalJustification: "",
    });
    setEditingId(null);
    setJustification(null);
    setDialogOpen(true);
  }

  function openEditDialog(tr: Transfusion) {
    form.reset({
      occurredAt: tr.occurredAt.slice(0, 16),
      type: tr.type,
      volumeMl: tr.volumeMl,
      donorId: tr.donorId,
      notes: tr.notes,
      isEmergency: tr.isEmergency ?? false,
      parentConsentObtained: tr.parentConsentObtained ?? false,
      clinicalJustification: tr.clinicalJustification ?? "",
    });
    setEditingId(tr.id);
    setJustification(null);
    setDialogOpen(true);
  }

  async function onSubmit(data: TransfusionFormData) {
    if (!currentPatient) return;

    // Validate consent requirement
    if (!data.isEmergency && !data.parentConsentObtained) {
      return; // Should not happen due to UI, but safeguard
    }

    try {
      const transfusionData = {
        occurredAt: new Date(data.occurredAt).toISOString(),
        type: data.type,
        volumeMl: data.volumeMl,
        donorId: data.donorId,
        notes: data.notes || "",
        isEmergency: data.isEmergency,
        parentConsentObtained: data.parentConsentObtained,
        parentConsentAt: data.parentConsentObtained ? new Date().toISOString() : undefined,
        clinicalJustification: data.clinicalJustification || undefined,
      };

      if (editingId) {
        await MockDataSource.updateTransfusion(editingId, transfusionData);
      } else {
        await MockDataSource.createTransfusion({
          patientId: currentPatient.id,
          ...transfusionData,
        });
      }

      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to save transfusion:", error);
    }
  }

  async function deleteTransfusion(id: string) {
    if (!confirm(t.transfusions.deleteConfirm)) return;

    try {
      await MockDataSource.deleteTransfusion(id);
      loadData();
    } catch (error) {
      console.error("Failed to delete transfusion:", error);
    }
  }

  if (!currentPatient) {
    return <EmptyState title={t.patient.noPatientSelected} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.transfusions.title}</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          {t.transfusions.recordTransfusion}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatPanel
          label={t.transfusions.totalTransfusions}
          value={stats.totalCount}
          variant={analysis?.transfusionExcessSeverity === "very_high" ? "critical" :
                   analysis?.transfusionExcessSeverity === "high" ? "warning" : "default"}
        />
        <StatPanel
          label={t.transfusions.totalVolume}
          value={`${stats.totalVolume}ml`}
        />
        <StatPanel
          label={t.transfusions.uniqueDonors}
          value={stats.uniqueDonors}
          variant={stats.uniqueDonors > 5 ? "warning" : "default"}
        />
        <StatPanel
          label={t.transfusions.rbcVolume}
          value={`${stats.volumeByType.rbc}ml`}
        />
      </div>

      {/* Transfusion Analysis Warning */}
      {analysis && analysis.isAboveAverageTransfusions && (
        <Card className={analysis.transfusionExcessSeverity === "very_high"
          ? "border-destructive bg-destructive/10"
          : "border-yellow-500 bg-yellow-500/10"}>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                analysis.transfusionExcessSeverity === "very_high"
                  ? "text-destructive"
                  : "text-yellow-600"
              }`} />
              <div className="flex-1 space-y-2">
                <div className="font-semibold">
                  {language === "es"
                    ? "⚠️ Número de transfusiones por encima del promedio"
                    : "⚠️ Transfusion count above average"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {analysis.recommendations[language === "es" ? "es" : "en"].map((rec, i) => (
                    <p key={i} className="mb-1">{rec}</p>
                  ))}
                </div>
                {analysis.investigateRootCause && analysis.possibleCauses[language === "es" ? "es" : "en"].length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm font-medium mb-2">
                      {language === "es" ? "Causas posibles a investigar:" : "Possible causes to investigate:"}
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      {analysis.possibleCauses[language === "es" ? "es" : "en"].map((cause, i) => (
                        <li key={i}>{cause}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.hemolysisRisk !== "low" && (
                  <div className={`mt-3 pt-3 border-t ${
                    analysis.hemolysisRisk === "high" ? "text-destructive" : "text-yellow-600"
                  }`}>
                    <p className="text-sm font-medium">
                      {language === "es"
                        ? `⚠️ Riesgo de hemólisis: ${analysis.hemolysisRisk === "high" ? "ALTO" : "MODERADO"}`
                        : `⚠️ Hemolysis Risk: ${analysis.hemolysisRisk.toUpperCase()}`}
                    </p>
                    {analysis.hemolysisIndicators.length > 0 && (
                      <ul className="text-sm mt-1 list-disc list-inside">
                        {analysis.hemolysisIndicators.map((ind, i) => (
                          <li key={i}>{ind}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                  {language === "es"
                    ? `Esperado para ${currentPatient?.gestationalAgeWeeks} semanas: ${analysis.expectedRbcTransfusions.low}-${analysis.expectedRbcTransfusions.average} transfusiones (máx: ${analysis.expectedRbcTransfusions.high})`
                    : `Expected for ${currentPatient?.gestationalAgeWeeks}-week infant: ${analysis.expectedRbcTransfusions.low}-${analysis.expectedRbcTransfusions.average} transfusions (max: ${analysis.expectedRbcTransfusions.high})`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">{t.common.loading}</div>
      ) : transfusions.length === 0 ? (
        <EmptyState
          title={t.transfusions.noTransfusionsRecorded}
          description={t.transfusions.noTransfusionsDesc}
          action={{ label: t.transfusions.recordTransfusion, onClick: openCreateDialog }}
        />
      ) : (
        <Tabs defaultValue="chart">
          <TabsList>
            <TabsTrigger value="chart">{t.transfusions.cumulativeChart}</TabsTrigger>
            <TabsTrigger value="table">{t.transfusions.tableView}</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.transfusions.cumulativeTransfusionVolume}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis unit="ml" />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="stepAfter"
                        dataKey="rbc"
                        name={t.transfusions.rbc}
                        stackId="1"
                        stroke={typeColors.rbc}
                        fill={typeColors.rbc}
                        fillOpacity={0.6}
                      />
                      <Area
                        type="stepAfter"
                        dataKey="platelet"
                        name={t.transfusions.platelet}
                        stackId="1"
                        stroke={typeColors.platelet}
                        fill={typeColors.platelet}
                        fillOpacity={0.6}
                      />
                      <Area
                        type="stepAfter"
                        dataKey="plasma"
                        name={t.transfusions.plasma}
                        stackId="1"
                        stroke={typeColors.plasma}
                        fill={typeColors.plasma}
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="table" className="mt-4">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.transfusions.dateTime}</TableHead>
                    <TableHead>{t.transfusions.type}</TableHead>
                    <TableHead>{t.transfusions.volume}</TableHead>
                    <TableHead>{t.transfusions.donorId}</TableHead>
                    <TableHead>{t.transfusions.notes}</TableHead>
                    <TableHead className="w-24">{t.common.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfusions.map((tr) => (
                    <TableRow key={tr.id}>
                      <TableCell className="font-mono text-sm">
                        {formatDateTime(tr.occurredAt, language)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          style={{ backgroundColor: typeColors[tr.type] }}
                          className="text-white"
                        >
                          {typeLabels[tr.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>{tr.volumeMl}ml</TableCell>
                      <TableCell className="font-mono text-sm">{tr.donorId}</TableCell>
                      <TableCell className="max-w-xs truncate">{tr.notes}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(tr)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTransfusion(tr.id)}
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
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? t.transfusions.editTransfusion : t.transfusions.recordTransfusion}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pr-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.transfusions.dateTime}</Label>
                  <Input type="datetime-local" {...form.register("occurredAt")} />
                </div>
                <div className="space-y-2">
                  <Label>{t.transfusions.productType}</Label>
                  <Select
                    value={form.watch("type")}
                    onValueChange={(v) => form.setValue("type", v as TransfusionType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rbc">{t.transfusions.rbcShort}</SelectItem>
                      <SelectItem value="platelet">{t.transfusions.platelet}</SelectItem>
                      <SelectItem value="plasma">{t.transfusions.plasmaFFP}</SelectItem>
                      <SelectItem value="other">{t.transfusions.other}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Clinical Justification Panel */}
              {!editingId && transfusionType !== "other" && (
                <>
                  <Separator />
                  <TransfusionJustificationPanel
                    patient={currentPatient}
                    transfusionType={transfusionType}
                    isEmergency={isEmergency}
                    onJustificationChange={handleJustificationChange}
                  />
                </>
              )}

              <Separator />

              {/* Volume and Donor */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.transfusions.volumeMl}</Label>
                  <Input
                    type="number"
                    min={1}
                    max={500}
                    {...form.register("volumeMl")}
                  />
                  {form.formState.errors.volumeMl && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.volumeMl.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t.transfusions.donorId}</Label>
                  <Input {...form.register("donorId")} />
                </div>
              </div>

              {/* Clinical Justification Text (if needed) */}
              {justification && justification.status !== "justified" && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    {language === "es" ? "Justificación Clínica" : "Clinical Justification"}
                  </Label>
                  <Textarea
                    rows={2}
                    placeholder={
                      language === "es"
                        ? "Documentar la indicación clínica para esta transfusión..."
                        : "Document the clinical indication for this transfusion..."
                    }
                    {...form.register("clinicalJustification")}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>{t.transfusions.notes}</Label>
                <Textarea
                  rows={2}
                  placeholder={t.transfusions.notesPlaceholder}
                  {...form.register("notes")}
                />
              </div>

              <Separator />

              {/* Consent Section */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <Label className="text-base font-semibold">
                  {language === "es" ? "Consentimiento" : "Consent"}
                </Label>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="isEmergency"
                    checked={isEmergency}
                    onCheckedChange={(checked) => form.setValue("isEmergency", checked as boolean)}
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor="isEmergency"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {language === "es"
                        ? "Transfusión de Emergencia"
                        : "Emergency Transfusion"}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {language === "es"
                        ? "Omitir requisito de consentimiento debido a emergencia médica"
                        : "Skip consent requirement due to medical emergency"}
                    </p>
                  </div>
                </div>

                {!isEmergency && (
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="parentConsent"
                      checked={parentConsentObtained}
                      onCheckedChange={(checked) =>
                        form.setValue("parentConsentObtained", checked as boolean)
                      }
                    />
                    <div className="space-y-1">
                      <label
                        htmlFor="parentConsent"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {language === "es"
                          ? "Consentimiento de Padre/Tutor Obtenido"
                          : "Parent/Guardian Consent Obtained"}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {language === "es"
                          ? "Confirmo que el padre/tutor ha sido informado de los riesgos y beneficios y ha dado su consentimiento verbal"
                          : "I confirm that the parent/guardian has been informed of risks and benefits and has given verbal consent"}
                      </p>
                    </div>
                  </div>
                )}

                {!canSubmit && (
                  <div className="flex items-center gap-2 p-2 bg-destructive/10 text-destructive rounded text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {language === "es"
                      ? "Se requiere consentimiento de los padres o marcar como emergencia"
                      : "Parent consent required or mark as emergency"}
                  </div>
                )}
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  {t.transfusions.cancel}
                </Button>
                <Button type="submit" disabled={!canSubmit}>
                  {editingId ? t.transfusions.saveChanges : t.transfusions.recordTransfusion}
                </Button>
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
