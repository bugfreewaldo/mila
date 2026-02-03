"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ClipboardList,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Key,
  Play,
  Check,
  X,
} from "lucide-react";
import { usePatientStore } from "@/lib/mila/store";
import { useTranslation } from "@/lib/mila/i18n";
import { OrderRepository, verifyPIN, getTestPINHint } from "@/lib/mila/db/repositories/order";
import { PatientHeader, EmptyState } from "@/components/mila";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime } from "@/lib/mila/utils/dates";
import { translateMedicalText } from "@/lib/mila/i18n/medical-terms";
import { cn } from "@/lib/utils";
import type { Order, OrderType, OrderStatus, StaffRole } from "@/lib/mila/types";

const ORDER_TYPE_OPTIONS: Array<{ value: OrderType; label: string; labelEs: string }> = [
  { value: "lab_draw", label: "Lab Draw", labelEs: "Extracción de Laboratorio" },
  { value: "transfusion_rbc", label: "RBC Transfusion", labelEs: "Transfusión de GR" },
  { value: "transfusion_platelet", label: "Platelet Transfusion", labelEs: "Transfusión de Plaquetas" },
  { value: "transfusion_plasma", label: "Plasma Transfusion", labelEs: "Transfusión de Plasma" },
  { value: "medication", label: "Medication", labelEs: "Medicamento" },
  { value: "procedure", label: "Procedure", labelEs: "Procedimiento" },
  { value: "imaging", label: "Imaging", labelEs: "Imagen" },
  { value: "consultation", label: "Consultation", labelEs: "Consulta" },
  { value: "other", label: "Other", labelEs: "Otro" },
];

const PRIORITY_OPTIONS = [
  { value: "routine", label: "Routine", labelEs: "Rutina" },
  { value: "urgent", label: "Urgent", labelEs: "Urgente" },
  { value: "stat", label: "STAT", labelEs: "STAT" },
];

const STAFF_ROLES: Array<{ value: StaffRole; label: string; labelEs: string }> = [
  { value: "attending", label: "Attending", labelEs: "Médico de Planta" },
  { value: "fellow", label: "Fellow", labelEs: "Fellow" },
  { value: "resident", label: "Resident", labelEs: "Residente" },
  { value: "np", label: "Nurse Practitioner", labelEs: "Enfermera Practicante" },
  { value: "pa", label: "Physician Assistant", labelEs: "Asistente Médico" },
  { value: "nurse", label: "Nurse", labelEs: "Enfermera" },
];

export default function OrdersPage() {
  const { currentPatient, loading } = usePatientStore();
  const { t, language } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "completed" | "all">("pending");

  // Form state
  const [formData, setFormData] = useState({
    orderType: "" as OrderType | "",
    priority: "routine" as "routine" | "urgent" | "stat",
    description: "",
    details: "",
    orderedBy: "",
    orderedByRole: "attending" as StaffRole,
    pin: "",
  });

  // Execute form state
  const [executeData, setExecuteData] = useState({
    executedBy: "",
    executedByRole: "resident" as StaffRole,
  });

  const loadOrders = useCallback(async () => {
    if (!currentPatient) return;
    const data = await OrderRepository.byPatient(currentPatient.id);
    setOrders(data);
  }, [currentPatient]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleCreateOrder = async () => {
    if (!currentPatient || !formData.orderType || !formData.description || !formData.orderedBy || !formData.pin) {
      return;
    }

    // Verify PIN
    if (!verifyPIN(formData.pin)) {
      setPinError(true);
      return;
    }
    setPinError(false);

    await OrderRepository.create({
      patientId: currentPatient.id,
      orderType: formData.orderType,
      status: "pending",
      priority: formData.priority,
      description: formData.description,
      details: formData.details || undefined,
      orderedBy: formData.orderedBy,
      orderedByRole: formData.orderedByRole,
      orderedAt: new Date().toISOString(),
      pinVerifiedAt: new Date().toISOString(),
    });

    setFormData({
      orderType: "",
      priority: "routine",
      description: "",
      details: "",
      orderedBy: "",
      orderedByRole: "attending",
      pin: "",
    });
    setDialogOpen(false);
    loadOrders();
  };

  const handleExecuteOrder = async () => {
    if (!selectedOrder || !executeData.executedBy) return;

    await OrderRepository.executeOrder(
      selectedOrder.id,
      executeData.executedBy,
      executeData.executedByRole
    );

    setExecuteDialogOpen(false);
    setSelectedOrder(null);
    setExecuteData({ executedBy: "", executedByRole: "resident" });
    loadOrders();
  };

  const handleCompleteOrder = async (orderId: string) => {
    await OrderRepository.completeOrder(orderId);
    loadOrders();
  };

  const handleCancelOrder = async (orderId: string) => {
    const reason = prompt(language === "es" ? "Razón de cancelación:" : "Cancellation reason:");
    if (!reason) return;

    await OrderRepository.cancelOrder(orderId, "Staff", reason);
    loadOrders();
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === "pending") return order.status === "pending" || order.status === "in_progress";
    if (activeTab === "completed") return order.status === "completed" || order.status === "cancelled";
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    const config = {
      pending: { label: language === "es" ? "Pendiente" : "Pending", variant: "warning" as const, icon: Clock },
      in_progress: { label: language === "es" ? "En Progreso" : "In Progress", variant: "default" as const, icon: Play },
      completed: { label: language === "es" ? "Completado" : "Completed", variant: "default" as const, icon: CheckCircle },
      cancelled: { label: language === "es" ? "Cancelado" : "Cancelled", variant: "destructive" as const, icon: XCircle },
    };
    const { label, variant, icon: Icon } = config[status];
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: "routine" | "urgent" | "stat") => {
    if (priority === "stat") return <Badge variant="destructive">STAT</Badge>;
    if (priority === "urgent") return <Badge variant="warning">{language === "es" ? "Urgente" : "Urgent"}</Badge>;
    return <Badge variant="outline">{language === "es" ? "Rutina" : "Routine"}</Badge>;
  };

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
        description={language === "es" ? "Seleccione un paciente para ver las órdenes" : "Select a patient to view orders"}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PatientHeader patient={currentPatient} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary" />
            {language === "es" ? "Órdenes Médicas" : "Medical Orders"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {language === "es" ? "Gestión de órdenes con trazabilidad completa" : "Order management with full audit trail"}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {language === "es" ? "Nueva Orden" : "New Order"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{language === "es" ? "Crear Nueva Orden" : "Create New Order"}</DialogTitle>
              <DialogDescription>
                {language === "es"
                  ? "Las órdenes requieren verificación con PIN"
                  : "Orders require PIN verification"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Order Type */}
              <div className="space-y-2">
                <Label>{language === "es" ? "Tipo de Orden" : "Order Type"}</Label>
                <Select
                  value={formData.orderType}
                  onValueChange={(v) => setFormData({ ...formData, orderType: v as OrderType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={language === "es" ? "Seleccionar tipo..." : "Select type..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {language === "es" ? opt.labelEs : opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>{language === "es" ? "Prioridad" : "Priority"}</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => setFormData({ ...formData, priority: v as "routine" | "urgent" | "stat" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {language === "es" ? opt.labelEs : opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>{language === "es" ? "Descripción" : "Description"}</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={language === "es" ? "ej. CBC, BMP, bilirrubina" : "e.g. CBC, BMP, bilirubin"}
                />
              </div>

              {/* Details */}
              <div className="space-y-2">
                <Label>{language === "es" ? "Detalles" : "Details"} ({language === "es" ? "opcional" : "optional"})</Label>
                <Textarea
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  placeholder={language === "es" ? "Indicación clínica, instrucciones especiales..." : "Clinical indication, special instructions..."}
                  rows={2}
                />
              </div>

              {/* Ordered By */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === "es" ? "Ordenado por" : "Ordered by"}</Label>
                  <Input
                    value={formData.orderedBy}
                    onChange={(e) => setFormData({ ...formData, orderedBy: e.target.value })}
                    placeholder={language === "es" ? "Dr. Nombre Apellido" : "Dr. First Last"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === "es" ? "Rol" : "Role"}</Label>
                  <Select
                    value={formData.orderedByRole}
                    onValueChange={(v) => setFormData({ ...formData, orderedByRole: v as StaffRole })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAFF_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {language === "es" ? role.labelEs : role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* PIN Verification */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  {language === "es" ? "PIN de Verificación" : "Verification PIN"}
                </Label>
                <Input
                  type="password"
                  value={formData.pin}
                  onChange={(e) => {
                    setFormData({ ...formData, pin: e.target.value });
                    setPinError(false);
                  }}
                  placeholder="****"
                  className={pinError ? "border-red-500" : ""}
                />
                {pinError && (
                  <p className="text-xs text-red-500">
                    {language === "es" ? "PIN incorrecto" : "Incorrect PIN"}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {getTestPINHint()}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t.common.close}
              </Button>
              <Button onClick={handleCreateOrder}>
                {language === "es" ? "Crear Orden" : "Create Order"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "pending" | "completed" | "all")}>
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {language === "es" ? "Pendientes" : "Pending"}
            {orders.filter(o => o.status === "pending" || o.status === "in_progress").length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {orders.filter(o => o.status === "pending" || o.status === "in_progress").length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle className="w-4 h-4 mr-2" />
            {language === "es" ? "Completadas" : "Completed"}
          </TabsTrigger>
          <TabsTrigger value="all">
            {language === "es" ? "Todas" : "All"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {language === "es" ? "No hay órdenes en esta categoría" : "No orders in this category"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === "es" ? "Fecha/Hora" : "Date/Time"}</TableHead>
                    <TableHead>{language === "es" ? "Tipo" : "Type"}</TableHead>
                    <TableHead>{language === "es" ? "Descripción" : "Description"}</TableHead>
                    <TableHead>{language === "es" ? "Prioridad" : "Priority"}</TableHead>
                    <TableHead>{language === "es" ? "Estado" : "Status"}</TableHead>
                    <TableHead>{language === "es" ? "Ordenado por" : "Ordered by"}</TableHead>
                    <TableHead>{language === "es" ? "Ejecutado por" : "Executed by"}</TableHead>
                    <TableHead>{language === "es" ? "Acciones" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const typeOption = ORDER_TYPE_OPTIONS.find(o => o.value === order.orderType);
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="text-sm">
                          {formatDateTime(order.orderedAt, language)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">
                            {typeOption ? (language === "es" ? typeOption.labelEs : typeOption.label) : order.orderType}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">
                              {translateMedicalText(order.description, language as "en" | "es")}
                            </p>
                            {order.details && (
                              <p className="text-xs text-muted-foreground">
                                {translateMedicalText(order.details, language as "en" | "es")}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <User className="w-3 h-3 text-muted-foreground" />
                            <span>{order.orderedBy}</span>
                            <span className="text-xs text-muted-foreground">({order.orderedByRole})</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.executedBy ? (
                            <div className="flex items-center gap-1 text-sm">
                              <User className="w-3 h-3 text-muted-foreground" />
                              <span>{order.executedBy}</span>
                              <span className="text-xs text-muted-foreground">({order.executedByRole})</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {order.status === "pending" && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setExecuteDialogOpen(true);
                                }}
                              >
                                <Play className="w-3 h-3 mr-1" />
                                {language === "es" ? "Ejecutar" : "Execute"}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCancelOrder(order.id)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                          {order.status === "in_progress" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCompleteOrder(order.id)}
                            >
                              <Check className="w-3 h-3 mr-1" />
                              {language === "es" ? "Completar" : "Complete"}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Execute Order Dialog */}
      <Dialog open={executeDialogOpen} onOpenChange={setExecuteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === "es" ? "Ejecutar Orden" : "Execute Order"}</DialogTitle>
            <DialogDescription>
              {language === "es"
                ? "Registrar quién ejecuta esta orden"
                : "Record who is executing this order"}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  <strong>{selectedOrder.description}</strong>
                  <br />
                  <span className="text-sm text-muted-foreground">
                    {language === "es" ? "Ordenado por" : "Ordered by"}: {selectedOrder.orderedBy}
                  </span>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === "es" ? "Ejecutado por" : "Executed by"}</Label>
                  <Input
                    value={executeData.executedBy}
                    onChange={(e) => setExecuteData({ ...executeData, executedBy: e.target.value })}
                    placeholder={language === "es" ? "Nombre del ejecutor" : "Executor name"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === "es" ? "Rol" : "Role"}</Label>
                  <Select
                    value={executeData.executedByRole}
                    onValueChange={(v) => setExecuteData({ ...executeData, executedByRole: v as StaffRole })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAFF_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {language === "es" ? role.labelEs : role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setExecuteDialogOpen(false)}>
              {t.common.close}
            </Button>
            <Button onClick={handleExecuteOrder}>
              {language === "es" ? "Confirmar Ejecución" : "Confirm Execution"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
