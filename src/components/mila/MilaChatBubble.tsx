"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Brain,
  Send,
  X,
  User,
  Loader2,
  Minimize2,
  Maximize2,
  Sparkles,
  TestTube2,
  ClipboardList,
  Heart,
  Droplets,
  FileText,
  Bell,
  Baby,
  Utensils,
  Activity,
} from "lucide-react";
import { useTranslation } from "@/lib/mila/i18n";
import { usePatientStore } from "@/lib/mila/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LabValueRepository } from "@/lib/mila/db/repositories/lab";
import { TransfusionRepository } from "@/lib/mila/db/repositories/transfusion";
import { ObservationRepository } from "@/lib/mila/db/repositories/observation";
import { AlertRepository } from "@/lib/mila/db/repositories/alert";
import { PhlebotomyRepository } from "@/lib/mila/db/repositories/phlebotomy";
import { FeedingRepository } from "@/lib/mila/db/repositories/feeding";
import { ClinicalStatusRepository } from "@/lib/mila/db/repositories/clinical-status";
import type { Patient, RespiratorySupport, PhototherapyType, DevelopmentalCareType } from "@/lib/mila/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface QuickAction {
  id: string;
  labelEn: string;
  labelEs: string;
  icon: React.ReactNode;
  prompt: string;
  promptEs: string;
  color: string;
}

// Quick actions for doctors - no typing needed
const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "condition",
    labelEn: "Baby's Status",
    labelEs: "Estado del Bebe",
    icon: <Baby className="w-4 h-4" />,
    prompt: "Give me a quick overview of the baby's current condition. Include respiratory status, feeding tolerance, and any concerns.",
    promptEs: "Dame un resumen rapido del estado actual del bebe. Incluye estado respiratorio, tolerancia alimenticia y cualquier preocupacion.",
    color: "from-pink-500 to-rose-500",
  },
  {
    id: "labs",
    labelEn: "Review Labs",
    labelEs: "Revisar Labs",
    icon: <TestTube2 className="w-4 h-4" />,
    prompt: "Review the latest lab values. Highlight any abnormal results and suggest if any action is needed.",
    promptEs: "Revisa los ultimos valores de laboratorio. Destaca resultados anormales y sugiere si se necesita alguna accion.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "transfusion",
    labelEn: "Transfusion Check",
    labelEs: "Revisar Transfusion",
    icon: <Droplets className="w-4 h-4" />,
    prompt: "Based on current labs and clinical status, does this baby need a transfusion? What type? Justify based on evidence-based guidelines.",
    promptEs: "Segun los labs actuales y el estado clinico, necesita transfusion este bebe? Que tipo? Justifica segun guias basadas en evidencia.",
    color: "from-red-500 to-orange-500",
  },
  {
    id: "feeding",
    labelEn: "Feeding Plan",
    labelEs: "Plan Alimenticio",
    icon: <Utensils className="w-4 h-4" />,
    prompt: "Review the feeding history and tolerance. Is the current feeding plan adequate? Any recommendations to advance feeds?",
    promptEs: "Revisa el historial de alimentacion y tolerancia. El plan actual es adecuado? Alguna recomendacion para avanzar?",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "alerts",
    labelEn: "Active Alerts",
    labelEs: "Alertas Activas",
    icon: <Bell className="w-4 h-4" />,
    prompt: "What are the current active alerts for this patient? What actions should be taken?",
    promptEs: "Cuales son las alertas activas de este paciente? Que acciones se deben tomar?",
    color: "from-amber-500 to-yellow-500",
  },
  {
    id: "hemolysis",
    labelEn: "Hemolysis Risk",
    labelEs: "Riesgo Hemolisis",
    icon: <Activity className="w-4 h-4" />,
    prompt: "Assess hemolysis risk based on LDH, haptoglobin, bilirubin, and reticulocyte trends. What is the current risk score?",
    promptEs: "Evalua el riesgo de hemolisis segun LDH, haptoglobina, bilirrubina y tendencia de reticulocitos. Cual es el puntaje de riesgo?",
    color: "from-purple-500 to-violet-500",
  },
];

// Convert markdown-style formatting to React elements
function formatMessage(text: string): React.ReactNode[] {
  // Split by lines first to handle lists
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    // Handle bullet points
    if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
      const content = line.trim().substring(2);
      result.push(
        <div key={`line-${lineIndex}`} className="flex gap-2 ml-2">
          <span>•</span>
          <span>{formatInlineText(content)}</span>
        </div>
      );
    }
    // Handle numbered lists
    else if (/^\d+[\.\)]\s/.test(line.trim())) {
      const match = line.trim().match(/^(\d+[\.\)])\s(.+)/);
      if (match) {
        result.push(
          <div key={`line-${lineIndex}`} className="flex gap-2 ml-2">
            <span className="font-medium">{match[1]}</span>
            <span>{formatInlineText(match[2])}</span>
          </div>
        );
      }
    }
    // Regular paragraph
    else if (line.trim()) {
      result.push(
        <p key={`line-${lineIndex}`} className={lineIndex > 0 ? "mt-2" : ""}>
          {formatInlineText(line)}
        </p>
      );
    }
  });

  return result;
}

// Format inline text (bold, italic, code)
function formatInlineText(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  // Pattern for **bold**, *italic*, `code`
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add formatted text
    if (match[2]) {
      // Bold **text**
      parts.push(<strong key={`fmt-${keyIndex++}`} className="font-semibold">{match[2]}</strong>);
    } else if (match[3]) {
      // Italic *text*
      parts.push(<em key={`fmt-${keyIndex++}`}>{match[3]}</em>);
    } else if (match[4]) {
      // Code `text`
      parts.push(
        <code key={`fmt-${keyIndex++}`} className="bg-muted px-1 rounded text-xs font-mono">
          {match[4]}
        </code>
      );
    }

    lastIndex = pattern.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

// Labels for clinical status fields
const RESPIRATORY_LABELS: Record<RespiratorySupport, string> = {
  room_air: "Room Air (no support)",
  low_flow_nc: "Low Flow Nasal Cannula (<1L/min)",
  high_flow_nc: "High Flow Nasal Cannula (>=1L/min)",
  cpap: "CPAP",
  bipap: "BiPAP",
  nippv: "NIPPV",
  oxygen_hood: "Oxygen Hood",
  intubated_conv: "Intubated - Conventional Ventilation",
  intubated_hfov: "Intubated - HFOV",
  intubated_hfjv: "Intubated - HFJV",
};

const PHOTOTHERAPY_LABELS: Record<PhototherapyType, string> = {
  none: "None",
  conventional: "Conventional (overhead)",
  led: "LED",
  biliblanket: "Biliblanket",
  double: "Double (overhead + blanket)",
  intensive: "Intensive/Triple",
};

const DEV_CARE_LABELS: Record<DevelopmentalCareType, string> = {
  kangaroo_care: "Kangaroo Care (skin-to-skin)",
  non_nutritive_sucking: "Non-nutritive Sucking",
  positioning: "Developmental Positioning",
  massage: "Infant Massage",
  music_therapy: "Music Therapy",
  visual_stimulation: "Visual Stimulation",
  auditory_protection: "Auditory Protection",
  clustered_care: "Clustered Care",
};

// Build patient context from IndexedDB (client-side)
async function buildPatientContext(patient: Patient): Promise<string> {
  try {
    const [labs, transfusions, observations, alerts, phlebotomies, feedings, currentStatus] = await Promise.all([
      LabValueRepository.byPatient(patient.id),
      TransfusionRepository.byPatient(patient.id),
      ObservationRepository.byPatient(patient.id),
      AlertRepository.byPatient(patient.id),
      PhlebotomyRepository.byPatient(patient.id),
      FeedingRepository.byPatient(patient.id),
      ClinicalStatusRepository.getCurrentStatus(patient.id),
    ]);

    const recentLabs = labs.slice(0, 20);
    const recentTransfusions = transfusions.slice(0, 10);
    const recentObservations = observations.slice(0, 10);
    const activeAlerts = alerts.filter((a) => !a.acknowledged);
    const recentPhlebotomies = phlebotomies.slice(0, 10);
    const recentFeedings = feedings.slice(0, 10);

    // Calculate blood volume and phlebotomy stats
    const bloodVolumeMl = patient.birthWeightGrams * 0.085;
    const totalPhlebotomyMl = phlebotomies.reduce((sum, p) => sum + p.volumeMl, 0);
    const phlebotomyPercent = (totalPhlebotomyMl / bloodVolumeMl) * 100;

    // Calculate days of life
    const daysOfLife = Math.floor(
      (Date.now() - new Date(patient.birthDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Build clinical status section
    let clinicalStatusSection = "CURRENT CLINICAL STATUS:\n";
    if (currentStatus) {
      const isIntubated = currentStatus.respiratorySupport.startsWith("intubated");
      clinicalStatusSection += `- Respiratory: ${RESPIRATORY_LABELS[currentStatus.respiratorySupport]}`;
      if (currentStatus.fio2) {
        clinicalStatusSection += ` (FiO2: ${currentStatus.fio2}%)`;
      }
      if (isIntubated) {
        clinicalStatusSection += " [INTUBATED]";
        if (currentStatus.peep) clinicalStatusSection += `, PEEP: ${currentStatus.peep}`;
        if (currentStatus.pip) clinicalStatusSection += `, PIP: ${currentStatus.pip}`;
      }
      clinicalStatusSection += "\n";

      clinicalStatusSection += `- Phototherapy: ${PHOTOTHERAPY_LABELS[currentStatus.phototherapy]}`;
      if (currentStatus.phototherapy !== "none" && currentStatus.totalPhototherapyHours) {
        clinicalStatusSection += ` (${currentStatus.totalPhototherapyHours}h total)`;
      }
      clinicalStatusSection += "\n";

      // Active developmental care
      if (currentStatus.activeDevelopmentalCare.length > 0) {
        clinicalStatusSection += `- Active Developmental Care: ${currentStatus.activeDevelopmentalCare.map(dc => DEV_CARE_LABELS[dc]).join(", ")}\n`;
      }

      // Medications and lines
      const flags: string[] = [];
      if (currentStatus.caffeineCitrate) flags.push("On Caffeine");
      if (currentStatus.ibuprofen) flags.push("On Ibuprofen (PDA)");
      if (currentStatus.umbilicalLines) flags.push("UAC/UVC");
      if (currentStatus.centralLine) flags.push("Central Line");
      if (currentStatus.peripheralIv) flags.push("Peripheral IV");
      if (flags.length > 0) {
        clinicalStatusSection += `- Lines/Meds: ${flags.join(", ")}\n`;
      }
    } else {
      // Use patient's quick-reference fields if no clinical status record
      clinicalStatusSection += `- Respiratory: ${patient.currentRespiratorySupport ? RESPIRATORY_LABELS[patient.currentRespiratorySupport] : "Unknown"}`;
      if (patient.currentFio2) clinicalStatusSection += ` (FiO2: ${patient.currentFio2}%)`;
      clinicalStatusSection += "\n";
      clinicalStatusSection += `- Phototherapy: ${patient.currentPhototherapy ? PHOTOTHERAPY_LABELS[patient.currentPhototherapy] : "Unknown"}\n`;
      const flags: string[] = [];
      if (patient.onCaffeine) flags.push("On Caffeine");
      if (patient.hasUmbilicalLines) flags.push("UAC/UVC");
      if (patient.hasCentralLine) flags.push("Central Line");
      if (flags.length > 0) {
        clinicalStatusSection += `- Lines/Meds: ${flags.join(", ")}\n`;
      }
    }

    return `
PATIENT INFORMATION:
- Name: ${patient.displayName}
- Days of Life: ${daysOfLife}
- Birth Date: ${patient.birthDate}
- Gestational Age: ${patient.gestationalAgeWeeks} weeks
- Birth Weight: ${patient.birthWeightGrams}g
- Blood Type: ${patient.bloodType || "Unknown"}
- Estimated Blood Volume: ${bloodVolumeMl.toFixed(1)} ml

${clinicalStatusSection}
BLOOD LOSS FROM PHLEBOTOMY:
- Total: ${totalPhlebotomyMl.toFixed(1)} ml (${phlebotomyPercent.toFixed(1)}% of blood volume)
- Status: ${phlebotomyPercent > 15 ? "CRITICAL" : phlebotomyPercent > 10 ? "WARNING" : "OK"}
${recentPhlebotomies.length > 0 ? `
Recent draws:
${recentPhlebotomies.map((p) => `  - ${new Date(p.occurredAt).toLocaleDateString()}: ${p.volumeMl}ml (${p.type}${p.notes ? ` - ${p.notes}` : ""})`).join("\n")}` : ""}

RECENT LAB VALUES (last 20):
${recentLabs.map((l) => {
  const isLow = l.refRangeLow !== undefined && l.value < l.refRangeLow;
  const isHigh = l.refRangeHigh !== undefined && l.value > l.refRangeHigh;
  const flag = isLow ? " [LOW]" : isHigh ? " [HIGH]" : "";
  return `  - ${l.labTypeId.toUpperCase()}: ${l.value} ${l.unit}${flag} (${new Date(l.occurredAt).toLocaleDateString()})`;
}).join("\n")}

TRANSFUSION HISTORY (${transfusions.length} total):
${recentTransfusions.map((t) =>
  `  - ${t.type.toUpperCase()}: ${t.volumeMl}ml on ${new Date(t.occurredAt).toLocaleDateString()}${t.notes ? ` - ${t.notes}` : ""}`
).join("\n")}

ACTIVE ALERTS (${activeAlerts.length}):
${activeAlerts.map((a) => `  - [${a.severity.toUpperCase()}] ${a.type}: ${a.message}`).join("\n") || "  None"}

RECENT OBSERVATIONS:
${recentObservations.map((o) =>
  `  - [${o.category}/${o.severity}] ${o.content} (${new Date(o.occurredAt).toLocaleDateString()})`
).join("\n")}

FEEDING HISTORY:
${recentFeedings.map((f) =>
  `  - ${f.volumeMl}ml via ${f.route} (${f.feedingType}) - ${f.tolerance} (${new Date(f.occurredAt).toLocaleTimeString()})`
).join("\n")}
`;
  } catch (error) {
    console.error("Error building patient context:", error);
    return "Error fetching patient data.";
  }
}

// Thinking status messages that cycle while AI is processing
const THINKING_MESSAGES_EN = [
  "Analyzing patient data...",
  "Reviewing lab values...",
  "Consulting evidence-based guidelines...",
  "Checking ETTNO/TOP protocols...",
  "Evaluating clinical status...",
  "Comparing with neonatal standards...",
  "Assessing risk factors...",
  "Reviewing vital trends...",
  "Analyzing feeding tolerance...",
  "Checking sepsis markers...",
  "Evaluating transfusion thresholds...",
  "Formulating recommendations...",
];

const THINKING_MESSAGES_ES = [
  "Analizando datos del paciente...",
  "Revisando valores de laboratorio...",
  "Consultando guías basadas en evidencia...",
  "Verificando protocolos ETTNO/TOP...",
  "Evaluando estado clínico...",
  "Comparando con estándares neonatales...",
  "Evaluando factores de riesgo...",
  "Revisando tendencias de signos vitales...",
  "Analizando tolerancia alimenticia...",
  "Verificando marcadores de sepsis...",
  "Evaluando umbrales de transfusión...",
  "Formulando recomendaciones...",
];

export function MilaChatBubble() {
  const { t, language } = useTranslation();
  const { currentPatient } = usePatientStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [thinkingStatus, setThinkingStatus] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const thinkingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start cycling through thinking messages
  const startThinkingAnimation = () => {
    const messages = language === "es" ? THINKING_MESSAGES_ES : THINKING_MESSAGES_EN;
    let index = 0;
    setThinkingStatus(messages[0]);

    thinkingIntervalRef.current = setInterval(() => {
      index = (index + 1) % messages.length;
      setThinkingStatus(messages[index]);
    }, 3000); // Change message every 3 seconds
  };

  // Stop thinking animation
  const stopThinkingAnimation = () => {
    if (thinkingIntervalRef.current) {
      clearInterval(thinkingIntervalRef.current);
      thinkingIntervalRef.current = null;
    }
    setThinkingStatus("");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
      }
    };
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Clear unread when opening
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const messageText = inputValue.trim();
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    await sendMessage(messageText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle quick action click - directly sends the prompt
  const handleQuickAction = (action: QuickAction) => {
    const prompt = language === "es" ? action.promptEs : action.prompt;
    setInputValue(prompt);
    // Auto-send after a brief delay for better UX
    setTimeout(() => {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: prompt,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      sendMessage(prompt);
    }, 100);
  };

  // Extracted send logic for reuse
  const sendMessage = async (messageText: string) => {
    setIsLoading(true);
    startThinkingAnimation();
    try {
      let patientContext = "No patient selected.";
      if (currentPatient) {
        patientContext = await buildPatientContext(currentPatient);
      }

      const response = await fetch("/api/mila/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          patientContext,
          language,
        }),
      });

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || (language === "es"
          ? "Lo siento, no pude procesar tu pregunta."
          : "Sorry, I couldn't process your question."),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: language === "es"
          ? "Error de conexion. Por favor, verifica que la API key este configurada en .env.local"
          : "Connection error. Please verify the API key is configured in .env.local",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      stopThinkingAnimation();
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    if (isOpen && isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(!isOpen);
      setIsMinimized(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg",
          "bg-gradient-to-br from-purple-500 to-pink-500",
          "flex items-center justify-center",
          "transition-all duration-300 hover:scale-110 hover:shadow-xl",
          "border-2 border-white/30",
          isOpen && "scale-0 opacity-0"
        )}
        aria-label="Open MILA Chat"
      >
        <Brain className="w-7 h-7 text-white" />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 bg-card border-2 border-[hsl(var(--baby-lavender))] rounded-2xl shadow-2xl",
            "transition-all duration-300",
            isMinimized
              ? "bottom-6 right-6 w-72 h-14"
              : "bottom-6 right-6 w-96 h-[500px] max-h-[80vh]",
            "flex flex-col overflow-hidden"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-purple-500" />
              </div>
              <div>
                <p className="font-bold text-sm">MILA</p>
                <p className="text-xs text-white/80">
                  {language === "es" ? "Asistente Clinico IA" : "AI Clinical Assistant"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-8 h-8 text-white hover:bg-white/20 rounded-lg"
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 text-white hover:bg-white/20 rounded-lg"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-[hsl(var(--baby-lavender)/0.1)] to-transparent">
                {messages.length === 0 && (
                  <div className="py-4">
                    {/* Greeting */}
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {language === "es"
                          ? "Hola Doctor! Que desea hacer?"
                          : "Hello Doctor! What would you like to do?"}
                      </p>
                      {currentPatient && (
                        <p className="text-xs text-purple-600 mt-1">
                          {language === "es"
                            ? `Paciente: ${currentPatient.displayName}`
                            : `Patient: ${currentPatient.displayName}`}
                        </p>
                      )}
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 px-1">
                      {QUICK_ACTIONS.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => handleQuickAction(action)}
                          disabled={isLoading || !currentPatient}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-xl text-left",
                            "bg-gradient-to-r text-white text-xs font-medium",
                            "transition-all duration-200 hover:scale-[1.02] hover:shadow-md",
                            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                            action.color
                          )}
                        >
                          {action.icon}
                          <span>{language === "es" ? action.labelEs : action.labelEn}</span>
                        </button>
                      ))}
                    </div>

                    {!currentPatient && (
                      <p className="text-xs text-muted-foreground text-center mt-3">
                        {language === "es"
                          ? "Seleccione un paciente para comenzar"
                          : "Select a patient to begin"}
                      </p>
                    )}

                    {/* Divider with "or type" */}
                    <div className="flex items-center gap-2 mt-4 px-4">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[10px] text-muted-foreground">
                        {language === "es" ? "o escriba su pregunta" : "or type your question"}
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                        msg.role === "user"
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                          : "bg-muted border"
                      )}
                    >
                      {msg.role === "assistant" ? formatMessage(msg.content) : msg.content}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-lg bg-gray-400 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/50 dark:to-pink-900/50 border-2 border-purple-200 dark:border-purple-700 rounded-2xl px-4 py-3 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span className="text-xs text-purple-700 dark:text-purple-300 font-medium animate-pulse">
                          {thinkingStatus || (language === "es" ? "Pensando..." : "Thinking...")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t bg-card">
                {/* Compact quick actions when there are messages */}
                {messages.length > 0 && currentPatient && (
                  <div className="flex gap-1 mb-2 overflow-x-auto pb-1 scrollbar-thin">
                    {QUICK_ACTIONS.slice(0, 4).map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleQuickAction(action)}
                        disabled={isLoading}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white text-[10px] font-medium whitespace-nowrap",
                          "bg-gradient-to-r transition-all hover:scale-105",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          action.color
                        )}
                      >
                        {action.icon}
                        <span className="hidden sm:inline">{language === "es" ? action.labelEs : action.labelEn}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      language === "es"
                        ? "Escribe tu pregunta..."
                        : "Type your question..."
                    }
                    className="flex-1 rounded-xl border-[hsl(var(--baby-lavender))]"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-2">
                  {language === "es"
                    ? "MILA usa IA para ayudar - siempre verifique clinicamente"
                    : "MILA uses AI to assist - always verify clinically"}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
