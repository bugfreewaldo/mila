"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { usePatientStore } from "@/lib/mila/store";
import { useTranslation } from "@/lib/mila/i18n";
import { MockDataSource } from "@/lib/mila/sources";
import { LabValueRepository } from "@/lib/mila/db/repositories";
import { LAB_TYPES, getLabType } from "@/lib/mila/data/lab-types";
import { EmptyState } from "@/components/mila";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { labValueFormSchema, type LabValueFormData } from "@/lib/mila/utils/validators";
import { formatDateTime, formatChartDate } from "@/lib/mila/utils/dates";
import type { LabValue } from "@/lib/mila/types";
import { cn } from "@/lib/utils";

export default function LabsPage() {
  const { currentPatient } = usePatientStore();
  const { t, language } = useTranslation();
  const [labs, setLabs] = useState<LabValue[]>([]);
  const [selectedLabType, setSelectedLabType] = useState<string>("hgb");
  const [trendData, setTrendData] = useState<Array<Record<string, unknown>>>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const selectedLabDef = getLabType(selectedLabType);

  const form = useForm<LabValueFormData>({
    resolver: zodResolver(labValueFormSchema),
    defaultValues: {
      occurredAt: new Date().toISOString().slice(0, 16),
      labTypeId: "hgb",
      value: 0,
      unit: "g/dL",
    },
  });

  useEffect(() => {
    loadData();
  }, [currentPatient]);

  useEffect(() => {
    loadTrendData();
  }, [currentPatient, selectedLabType]);

  async function loadData() {
    if (!currentPatient) return;
    setLoading(true);
    try {
      const [data, types] = await Promise.all([
        MockDataSource.listLabValues(currentPatient.id),
        MockDataSource.getLabTypes(currentPatient.id),
      ]);
      setLabs(data);
      setAvailableTypes(types.length > 0 ? types : ["hgb"]);
    } catch (error) {
      console.error("Failed to load labs:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadTrendData() {
    if (!currentPatient) return;
    try {
      const trend = await LabValueRepository.getTrendDataByType(
        currentPatient.id,
        selectedLabType
      );
      setTrendData(
        trend.map((t) => ({
          date: formatChartDate(t.occurredAt),
          value: t.value,
          refLow: t.refRangeLow,
          refHigh: t.refRangeHigh,
        }))
      );
    } catch (error) {
      console.error("Failed to load trend data:", error);
    }
  }

  function openCreateDialog() {
    const labDef = getLabType(selectedLabType);
    form.reset({
      occurredAt: new Date().toISOString().slice(0, 16),
      labTypeId: selectedLabType,
      value: 0,
      unit: labDef?.unit || "",
      refRangeLow: labDef?.neonatalRefRangeLow,
      refRangeHigh: labDef?.neonatalRefRangeHigh,
    });
    setEditingId(null);
    setDialogOpen(true);
  }

  function openEditDialog(lab: LabValue) {
    form.reset({
      occurredAt: lab.occurredAt.slice(0, 16),
      labTypeId: lab.labTypeId,
      value: lab.value,
      unit: lab.unit,
      refRangeLow: lab.refRangeLow,
      refRangeHigh: lab.refRangeHigh,
    });
    setEditingId(lab.id);
    setDialogOpen(true);
  }

  async function onSubmit(data: LabValueFormData) {
    if (!currentPatient) return;

    try {
      if (editingId) {
        await MockDataSource.updateLabValue(editingId, {
          occurredAt: new Date(data.occurredAt).toISOString(),
          labTypeId: data.labTypeId,
          value: data.value,
          unit: data.unit,
          refRangeLow: data.refRangeLow,
          refRangeHigh: data.refRangeHigh,
        });
      } else {
        await MockDataSource.createLabValue({
          patientId: currentPatient.id,
          occurredAt: new Date(data.occurredAt).toISOString(),
          labTypeId: data.labTypeId,
          value: data.value,
          unit: data.unit,
          refRangeLow: data.refRangeLow,
          refRangeHigh: data.refRangeHigh,
        });
      }

      setDialogOpen(false);
      loadData();
      loadTrendData();
    } catch (error) {
      console.error("Failed to save lab value:", error);
    }
  }

  async function deleteLabValue(id: string) {
    if (!confirm(t.labs.deleteConfirm)) return;

    try {
      await MockDataSource.deleteLabValue(id);
      loadData();
      loadTrendData();
    } catch (error) {
      console.error("Failed to delete lab value:", error);
    }
  }

  function isAbnormal(lab: LabValue): boolean {
    if (lab.refRangeLow !== undefined && lab.value < lab.refRangeLow) return true;
    if (lab.refRangeHigh !== undefined && lab.value > lab.refRangeHigh) return true;
    return false;
  }

  function getDirection(lab: LabValue): "high" | "low" | null {
    if (lab.refRangeLow !== undefined && lab.value < lab.refRangeLow) return "low";
    if (lab.refRangeHigh !== undefined && lab.value > lab.refRangeHigh) return "high";
    return null;
  }

  if (!currentPatient) {
    return <EmptyState title={t.patient.noPatientSelected} />;
  }

  const filteredLabs = labs.filter((l) => l.labTypeId === selectedLabType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.labs.title}</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          {t.labs.addResult}
        </Button>
      </div>

      {/* Lab Type Selector */}
      <div className="flex gap-2 flex-wrap">
        {(availableTypes.length > 0 ? availableTypes : LAB_TYPES.slice(0, 10).map((l) => l.id)).map(
          (typeId) => {
            const labDef = getLabType(typeId);
            return (
              <Button
                key={typeId}
                variant={selectedLabType === typeId ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLabType(typeId)}
              >
                {labDef?.shortName || typeId.toUpperCase()}
              </Button>
            );
          }
        )}
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">{t.common.loading}</div>
      ) : (
        <Tabs defaultValue="chart">
          <TabsList>
            <TabsTrigger value="chart">{t.labs.trendChart}</TabsTrigger>
            <TabsTrigger value="table">{t.labs.resultsTable}</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedLabDef?.name || selectedLabType.toUpperCase()} - {t.labs.trend}
                  {selectedLabDef?.unit && (
                    <span className="text-muted-foreground font-normal ml-2">
                      ({selectedLabDef.unit})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trendData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    {t.labs.noDataForType}
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={["auto", "auto"]} />
                        <Tooltip />
                        {selectedLabDef?.neonatalRefRangeLow !== undefined &&
                          selectedLabDef?.neonatalRefRangeHigh !== undefined && (
                            <ReferenceArea
                              y1={selectedLabDef.neonatalRefRangeLow}
                              y2={selectedLabDef.neonatalRefRangeHigh}
                              fill="#22c55e"
                              fillOpacity={0.1}
                            />
                          )}
                        {selectedLabDef?.neonatalRefRangeLow !== undefined && (
                          <ReferenceLine
                            y={selectedLabDef.neonatalRefRangeLow}
                            stroke="#22c55e"
                            strokeDasharray="3 3"
                            label={t.labs.lowValue}
                          />
                        )}
                        {selectedLabDef?.neonatalRefRangeHigh !== undefined && (
                          <ReferenceLine
                            y={selectedLabDef.neonatalRefRangeHigh}
                            stroke="#22c55e"
                            strokeDasharray="3 3"
                            label={t.labs.highValue}
                          />
                        )}
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: "#3b82f6", r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="table" className="mt-4">
            {filteredLabs.length === 0 ? (
              <EmptyState
                title={t.labs.noResults}
                description={`${selectedLabDef?.name || selectedLabType.toUpperCase()} ${t.labs.noResultsForType}`}
                action={{ label: t.labs.addResult, onClick: openCreateDialog }}
              />
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.labs.dateTime}</TableHead>
                      <TableHead>{t.labs.value}</TableHead>
                      <TableHead>{t.labs.refRange}</TableHead>
                      <TableHead>{t.labs.status}</TableHead>
                      <TableHead className="w-24">{t.common.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLabs.map((lab) => {
                      const abnormal = isAbnormal(lab);
                      const direction = getDirection(lab);
                      return (
                        <TableRow key={lab.id}>
                          <TableCell className="font-mono text-sm">
                            {formatDateTime(lab.occurredAt, language)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "font-bold",
                                abnormal && "text-red-600 dark:text-red-400"
                              )}
                            >
                              {lab.value} {lab.unit}
                            </span>
                            {direction && (
                              <span className="ml-1">
                                {direction === "high" ? (
                                  <TrendingUp className="w-4 h-4 inline text-red-500" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 inline text-blue-500" />
                                )}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {lab.refRangeLow !== undefined && lab.refRangeHigh !== undefined
                              ? `${lab.refRangeLow} - ${lab.refRangeHigh}`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {abnormal ? (
                              <Badge variant="warning">{t.labs.abnormal}</Badge>
                            ) : (
                              <Badge variant="success">{t.labs.normal}</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(lab)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteLabValue(lab.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? t.labs.editResult : t.labs.addResult}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.labs.dateTime}</Label>
                <Input type="datetime-local" {...form.register("occurredAt")} />
              </div>
              <div className="space-y-2">
                <Label>{t.labs.labType}</Label>
                <Select
                  value={form.watch("labTypeId")}
                  onValueChange={(v) => {
                    form.setValue("labTypeId", v);
                    const labDef = getLabType(v);
                    if (labDef) {
                      form.setValue("unit", labDef.unit);
                      form.setValue("refRangeLow", labDef.neonatalRefRangeLow);
                      form.setValue("refRangeHigh", labDef.neonatalRefRangeHigh);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LAB_TYPES.map((lt) => (
                      <SelectItem key={lt.id} value={lt.id}>
                        {lt.name} ({lt.shortName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.labs.value}</Label>
                <Input
                  type="number"
                  step="any"
                  {...form.register("value")}
                />
                {form.formState.errors.value && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.value.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{t.labs.unit}</Label>
                <Input {...form.register("unit")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.labs.referenceLow}</Label>
                <Input type="number" step="any" {...form.register("refRangeLow")} />
              </div>
              <div className="space-y-2">
                <Label>{t.labs.referenceHigh}</Label>
                <Input type="number" step="any" {...form.register("refRangeHigh")} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t.labs.cancel}
              </Button>
              <Button type="submit">
                {editingId ? t.labs.saveChanges : t.labs.addResult}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
