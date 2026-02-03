"use client";

import React, { useEffect, useState, useRef } from "react";
import { Sparkles, Activity, Droplets, Baby, Syringe, AlertTriangle, TrendingUp, TrendingDown, Minus, Zap, Brain, Send, MessageCircle, User, Wind, Sun, TestTube2, Bell, Utensils, Check, X } from "lucide-react";
import { useTranslation } from "@/lib/mila/i18n";
import { usePatientStore, useMonitorStore } from "@/lib/mila/store";
import { MockDataSource } from "@/lib/mila/sources";
import { PhlebotomyRepository } from "@/lib/mila/db/repositories/phlebotomy";
import { FeedingRepository } from "@/lib/mila/db/repositories/feeding";
import { LabValueRepository, TransfusionRepository, ClinicalStatusRepository, TreatmentPlanRepository } from "@/lib/mila/db/repositories";
import { calculateDaysOfLife } from "@/lib/mila/utils/dates";
import { analyzeTransfusions, type TransfusionAnalysis } from "@/lib/mila/services/transfusion-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { LabValue, Feeding, ClinicalStatus, RespiratorySupport, PhototherapyType, DevelopmentalCareType, TreatmentPlanCategory, CreateTreatmentPlan, TreatmentPlanAction } from "@/lib/mila/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface HealthSummary {
  // Vitals
  currentHR: number | null;
  currentSpO2: number | null;
  currentRR: number | null;
  currentTemp: number | null;
  vitalStatus: "stable" | "concerning" | "critical";
  // Labs
  latestHgb: { value: number; date: string; trend: "up" | "down" | "stable" } | null;
  latestPlt: { value: number; date: string; trend: "up" | "down" | "stable" } | null;
  latestBili: { value: number; date: string; trend: "up" | "down" | "stable" } | null;
  abnormalLabCount: number;
  // Sepsis Markers
  latestWbc: { value: number; date: string; trend: "up" | "down" | "stable" } | null;
  latestCrp: { value: number; date: string; trend: "up" | "down" | "stable" } | null;
  latestPct: { value: number; date: string; trend: "up" | "down" | "stable" } | null;
  latestItRatio: { value: number; date: string; trend: "up" | "down" | "stable" } | null;
  // NEC/Blood Gas Markers
  latestLactate: { value: number; date: string; trend: "up" | "down" | "stable" } | null;
  latestPh: { value: number; date: string; trend: "up" | "down" | "stable" } | null;
  latestHco3: { value: number; date: string; trend: "up" | "down" | "stable" } | null;
  // Blood loss / Phlebotomy
  totalPhlebotomyMl: number;
  phlebotomyPercentBloodVolume: number;
  phlebotomyStatus: "ok" | "warning" | "critical";
  phlebotomyCount: number;
  averageMlPerOrder: number;
  // Feeding
  feedingTolerance: number; // percentage
  lastFeedingVolume: number | null;
  feedingRoute: string | null;
  // Clinical Status
  respiratorySupport: RespiratorySupport | null;
  fio2: number | null;
  isIntubated: boolean;
  phototherapy: PhototherapyType | null;
  activeDevelopmentalCare: DevelopmentalCareType[];
  onCaffeine: boolean;
  hasLines: boolean;
  // Overall
  overallStatus: "stable" | "watch" | "attention";
  recommendations: string[];
  recommendationsEs: string[];
}

// Labels for respiratory support types
const RESPIRATORY_LABELS: Record<RespiratorySupport, { en: string; es: string }> = {
  room_air: { en: "Room Air", es: "Aire Ambiente" },
  low_flow_nc: { en: "Low Flow NC", es: "NC Bajo Flujo" },
  high_flow_nc: { en: "High Flow NC", es: "NC Alto Flujo" },
  cpap: { en: "CPAP", es: "CPAP" },
  bipap: { en: "BiPAP", es: "BiPAP" },
  nippv: { en: "NIPPV", es: "NIPPV" },
  oxygen_hood: { en: "O2 Hood", es: "Casco O2" },
  intubated_conv: { en: "Intubated (Conv)", es: "Intubado (Conv)" },
  intubated_hfov: { en: "Intubated (HFOV)", es: "Intubado (HFOV)" },
  intubated_hfjv: { en: "Intubated (HFJV)", es: "Intubado (HFJV)" },
};

const PHOTOTHERAPY_LABELS: Record<PhototherapyType, { en: string; es: string }> = {
  none: { en: "None", es: "Ninguna" },
  conventional: { en: "Conventional", es: "Convencional" },
  led: { en: "LED", es: "LED" },
  biliblanket: { en: "Biliblanket", es: "Biliblanket" },
  double: { en: "Double", es: "Doble" },
  intensive: { en: "Intensive", es: "Intensiva" },
};

// Quick action buttons for doctors - no typing needed
interface QuickAction {
  id: string;
  labelEn: string;
  labelEs: string;
  icon: React.ReactNode;
  prompt: string;
  color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "status",
    labelEn: "Baby Status",
    labelEs: "Estado",
    icon: <Baby className="w-3.5 h-3.5" />,
    prompt: "Give me a comprehensive status overview of the baby including vitals, labs, feeding, and any concerns.",
    color: "from-pink-500 to-rose-500",
  },
  {
    id: "labs",
    labelEn: "Labs",
    labelEs: "Labs",
    icon: <TestTube2 className="w-3.5 h-3.5" />,
    prompt: "Analyze the baby's current lab values including hemoglobin, platelets, and bilirubin. What are the trends and any concerns?",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "transfusion",
    labelEn: "Transfusion?",
    labelEs: "Transfusion?",
    icon: <Droplets className="w-3.5 h-3.5" />,
    prompt: "Based on current hemoglobin and clinical status, does this baby need a transfusion? What alternatives should we consider first?",
    color: "from-red-500 to-orange-500",
  },
  {
    id: "sepsis",
    labelEn: "Sepsis Risk",
    labelEs: "Riesgo Sepsis",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    prompt: "Assess this baby's sepsis risk. Look at WBC, CRP, procalcitonin, I:T ratio, platelets, temperature stability, and feeding tolerance. What is the current risk level and what should we do?",
    color: "from-amber-500 to-red-500",
  },
  {
    id: "feeding",
    labelEn: "Feeding",
    labelEs: "Alimentacion",
    icon: <Utensils className="w-3.5 h-3.5" />,
    prompt: "How is the baby's feeding tolerance? Any signs of NEC or feeding intolerance? What adjustments should we make?",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "phlebotomy",
    labelEn: "Blood Loss",
    labelEs: "Flebotomia",
    icon: <Syringe className="w-3.5 h-3.5" />,
    prompt: "Analyze the baby's phlebotomy losses. How much blood has been drawn and what percentage of blood volume? Recommendations to minimize iatrogenic blood loss?",
    color: "from-purple-500 to-violet-500",
  },
  {
    id: "nec",
    labelEn: "NEC Risk",
    labelEs: "Riesgo NEC",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    prompt: "Assess this baby's risk for Necrotizing Enterocolitis (NEC). Look at feeding tolerance, abdominal exam findings, platelet trend, CRP, lactate levels, blood gas (pH, HCO3), and any metabolic acidosis. What is the NEC risk and what should we do?",
    color: "from-orange-500 to-amber-500",
  },
];

function getLabTrend(labs: LabValue[], labTypeId: string): { value: number; date: string; trend: "up" | "down" | "stable" } | null {
  const filtered = labs.filter(l => l.labTypeId === labTypeId).sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  if (filtered.length === 0) return null;

  const latest = filtered[0];
  let trend: "up" | "down" | "stable" = "stable";

  if (filtered.length > 1) {
    const diff = latest.value - filtered[1].value;
    const percentChange = Math.abs(diff / filtered[1].value) * 100;
    if (percentChange > 5) {
      trend = diff > 0 ? "up" : "down";
    }
  }

  return { value: latest.value, date: latest.occurredAt, trend };
}

// Format markdown content for display
function formatMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    // Handle headers
    if (line.startsWith('### ')) {
      result.push(
        <h4 key={`h3-${lineIndex}`} className="font-bold text-sm mt-3 mb-1 text-purple-700 dark:text-purple-300">
          {formatInlineMarkdown(line.substring(4))}
        </h4>
      );
      return;
    }
    if (line.startsWith('## ')) {
      result.push(
        <h3 key={`h2-${lineIndex}`} className="font-bold text-base mt-3 mb-2 text-purple-800 dark:text-purple-200">
          {formatInlineMarkdown(line.substring(3))}
        </h3>
      );
      return;
    }

    // Handle bullet points
    if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
      const content = line.trim().substring(2);
      result.push(
        <div key={`li-${lineIndex}`} className="flex gap-2 ml-2 my-0.5">
          <span className="text-purple-500">•</span>
          <span>{formatInlineMarkdown(content)}</span>
        </div>
      );
      return;
    }

    // Handle numbered lists
    const numberedMatch = line.trim().match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      result.push(
        <div key={`num-${lineIndex}`} className="flex gap-2 ml-2 my-0.5">
          <span className="text-purple-500 font-semibold min-w-[1.5rem]">{numberedMatch[1]}.</span>
          <span>{formatInlineMarkdown(numberedMatch[2])}</span>
        </div>
      );
      return;
    }

    // Empty lines become spacing
    if (line.trim() === '') {
      result.push(<div key={`br-${lineIndex}`} className="h-2" />);
      return;
    }

    // Regular paragraph
    result.push(
      <p key={`p-${lineIndex}`} className="my-1">
        {formatInlineMarkdown(line)}
      </p>
    );
  });

  return result;
}

// Format inline markdown (bold, italic, etc.)
function formatInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    // Check for bold **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      // Add text before the match
      if (boldMatch.index > 0) {
        parts.push(remaining.substring(0, boldMatch.index));
      }
      // Add bold text
      parts.push(
        <strong key={`bold-${keyIndex++}`} className="font-semibold text-foreground">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
      continue;
    }

    // Check for warning emoji with text (like ⚠️ or 🔴)
    const emojiMatch = remaining.match(/(⚠️|🔴|🟡|🟢|⚡|💉|🩸|📊|✅|❌|🔔)/);
    if (emojiMatch && emojiMatch.index !== undefined) {
      if (emojiMatch.index > 0) {
        parts.push(remaining.substring(0, emojiMatch.index));
      }
      parts.push(
        <span key={`emoji-${keyIndex++}`} className="mx-0.5">
          {emojiMatch[1]}
        </span>
      );
      remaining = remaining.substring(emojiMatch.index + emojiMatch[0].length);
      continue;
    }

    // No more matches, add remaining text
    parts.push(remaining);
    break;
  }

  return parts.length > 0 ? parts : [text];
}

// Check if the last assistant message asks about proceeding with a plan
function shouldShowPlanConfirmation(messages: ChatMessage[]): boolean {
  if (messages.length === 0) return false;

  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== "assistant") return false;

  const content = lastMessage.content.toLowerCase();

  // Check for various phrasings of the confirmation question
  const confirmationPhrases = [
    "would you like to proceed",
    "do you want to proceed",
    "shall i proceed",
    "should i proceed",
    "want me to create",
    "create a formal treatment plan",
    "¿desea proceder",
    "¿quiere proceder",
    "crear un plan de tratamiento",
  ];

  return confirmationPhrases.some(phrase => content.includes(phrase));
}

// Build patient context string for AI API
function buildPatientContext(
  patient: { displayName: string; birthDate: string; gestationalAgeWeeks: number; birthWeightGrams: number } | null,
  summary: HealthSummary | null,
  daysOfLife: number
): string {
  if (!patient || !summary) {
    return "No patient data available.";
  }

  const lines: string[] = [
    `PATIENT: ${patient.displayName}`,
    `Age: ${daysOfLife} days of life`,
    `Gestational Age at Birth: ${patient.gestationalAgeWeeks} weeks`,
    `Birth Weight: ${patient.birthWeightGrams}g`,
    "",
    "VITAL SIGNS:",
    summary.currentHR ? `  HR: ${summary.currentHR} bpm` : "  HR: Not available",
    summary.currentSpO2 ? `  SpO2: ${summary.currentSpO2}%` : "  SpO2: Not available",
    summary.currentRR ? `  RR: ${summary.currentRR}/min` : "  RR: Not available",
    summary.currentTemp ? `  Temp: ${summary.currentTemp}°C` : "  Temp: Not available",
    `  Status: ${summary.vitalStatus}`,
    "",
    "LABORATORY VALUES:",
    summary.latestHgb ? `  HGB: ${summary.latestHgb.value.toFixed(1)} g/dL (trend: ${summary.latestHgb.trend})` : "  HGB: Not available",
    summary.latestPlt ? `  PLT: ${(summary.latestPlt.value / 1000).toFixed(0)}K (trend: ${summary.latestPlt.trend})` : "  PLT: Not available",
    summary.latestBili ? `  TBILI: ${summary.latestBili.value.toFixed(1)} mg/dL (trend: ${summary.latestBili.trend})` : "  TBILI: Not available",
    `  Abnormal Labs Count: ${summary.abnormalLabCount}`,
    "",
    "SEPSIS/INFECTION MARKERS:",
    summary.latestWbc ? `  WBC: ${summary.latestWbc.value.toFixed(1)} K/uL (trend: ${summary.latestWbc.trend}) [Normal: 9-30 K/uL]` : "  WBC: Not available",
    summary.latestCrp ? `  CRP: ${summary.latestCrp.value.toFixed(2)} mg/dL (trend: ${summary.latestCrp.trend}) [Normal: <1.0 mg/dL]` : "  CRP: Not available",
    summary.latestPct ? `  Procalcitonin: ${summary.latestPct.value.toFixed(2)} ng/mL (trend: ${summary.latestPct.trend}) [Normal: <0.5 ng/mL]` : "  Procalcitonin: Not available",
    summary.latestItRatio ? `  I:T Ratio: ${summary.latestItRatio.value.toFixed(2)} (trend: ${summary.latestItRatio.trend}) [Normal: <0.12]` : "  I:T Ratio: Not available",
    "",
    "NEC/BLOOD GAS MARKERS:",
    summary.latestLactate ? `  Lactate: ${summary.latestLactate.value.toFixed(1)} mmol/L (trend: ${summary.latestLactate.trend}) [Normal: 0.5-2.2 mmol/L]` : "  Lactate: Not available",
    summary.latestPh ? `  pH: ${summary.latestPh.value.toFixed(2)} (trend: ${summary.latestPh.trend}) [Normal: 7.30-7.45]` : "  pH: Not available",
    summary.latestHco3 ? `  HCO3: ${summary.latestHco3.value.toFixed(1)} mEq/L (trend: ${summary.latestHco3.trend}) [Normal: 18-26 mEq/L]` : "  HCO3: Not available",
    "",
    "PHLEBOTOMY/BLOOD LOSS:",
    `  Total: ${summary.totalPhlebotomyMl.toFixed(1)} ml (${summary.phlebotomyPercentBloodVolume.toFixed(1)}% of blood volume)`,
    `  Number of draws: ${summary.phlebotomyCount}`,
    `  Average per order: ${summary.averageMlPerOrder.toFixed(1)} ml`,
    `  Status: ${summary.phlebotomyStatus}`,
    "",
    "FEEDING:",
    `  Tolerance: ${summary.feedingTolerance.toFixed(0)}%`,
    summary.lastFeedingVolume ? `  Last volume: ${summary.lastFeedingVolume} ml` : "  Last volume: Not recorded",
    summary.feedingRoute ? `  Route: ${summary.feedingRoute}` : "  Route: Not specified",
    "",
    "CLINICAL STATUS:",
    summary.respiratorySupport ? `  Respiratory: ${summary.respiratorySupport}` : "  Respiratory: Room air",
    summary.fio2 ? `  FiO2: ${summary.fio2}%` : "",
    summary.phototherapy && summary.phototherapy !== "none" ? `  Phototherapy: ${summary.phototherapy}` : "",
    summary.onCaffeine ? "  On caffeine: Yes" : "",
    summary.hasLines ? "  Has central lines: Yes" : "",
    "",
    `OVERALL STATUS: ${summary.overallStatus.toUpperCase()}`,
  ];

  return lines.filter(l => l !== "").join("\n");
}

// Parse treatment plan from AI response
function parseTreatmentPlanFromResponse(
  response: string,
  patientId: string,
  language: string
): CreateTreatmentPlan | null {
  // Check for the marker
  if (!response.includes("[TREATMENT_PLAN_CREATED]")) {
    return null;
  }

  // Try to extract plan details from the response
  // The AI should format the plan with numbered actions
  const lines = response.split("\n");
  const actions: TreatmentPlanAction[] = [];

  // Look for numbered items that look like action items
  const actionRegex = /^(\d+)\.\s+(.+)$/;
  let foundActions = false;
  let planSummary = "";
  let planTitle = "";

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip the marker itself
    if (trimmed.includes("[TREATMENT_PLAN_CREATED]")) continue;

    // Look for plan title (usually in bold or as a header)
    if (trimmed.startsWith("##") || trimmed.startsWith("**Plan")) {
      planTitle = trimmed.replace(/^[#*]+\s*/, "").replace(/\*+$/, "").trim();
      continue;
    }

    // Look for action items
    const match = trimmed.match(actionRegex);
    if (match) {
      foundActions = true;
      const actionText = match[2].trim();
      // Parse dosage if present (look for mg/kg, ml, etc.)
      const dosageMatch = actionText.match(/(\d+(?:\.\d+)?\s*(?:mg|ml|mcg|mL|mg\/kg|ml\/kg|U\/kg|units?)[^,)]*)/i);

      actions.push({
        id: `action-${Date.now()}-${actions.length}`,
        description: actionText,
        descriptionEs: actionText, // AI should provide Spanish version ideally
        dosage: dosageMatch ? dosageMatch[1] : undefined,
        completed: false,
      });
    } else if (!foundActions && trimmed.length > 20 && !trimmed.startsWith("-")) {
      // This might be part of the summary
      if (planSummary) planSummary += " ";
      planSummary += trimmed;
    }
  }

  // If no explicit actions found, extract bullet points
  if (actions.length === 0) {
    const bulletRegex = /^[-•]\s+(.+)$/;
    for (const line of lines) {
      const trimmed = line.trim();
      const match = trimmed.match(bulletRegex);
      if (match) {
        const actionText = match[1].trim();
        const dosageMatch = actionText.match(/(\d+(?:\.\d+)?\s*(?:mg|ml|mcg|mL|mg\/kg|ml\/kg|U\/kg|units?)[^,)]*)/i);

        actions.push({
          id: `action-${Date.now()}-${actions.length}`,
          description: actionText,
          descriptionEs: actionText,
          dosage: dosageMatch ? dosageMatch[1] : undefined,
          completed: false,
        });
      }
    }
  }

  // Determine category based on content
  let category: TreatmentPlanCategory = "general";
  const lowerResponse = response.toLowerCase();
  if (lowerResponse.includes("transfus") || lowerResponse.includes("blood") || lowerResponse.includes("rbc") || lowerResponse.includes("platelet")) {
    category = "transfusion";
  } else if (lowerResponse.includes("sepsis") || lowerResponse.includes("antibiotic") || lowerResponse.includes("infection")) {
    category = "sepsis";
  } else if (lowerResponse.includes("nec") || lowerResponse.includes("enterocolitis") || lowerResponse.includes("abdominal")) {
    category = "nec";
  } else if (lowerResponse.includes("ventilat") || lowerResponse.includes("respirat") || lowerResponse.includes("intubat") || lowerResponse.includes("cpap")) {
    category = "respiratory";
  } else if (lowerResponse.includes("feed") || lowerResponse.includes("tpn") || lowerResponse.includes("nutrition")) {
    category = "feeding";
  } else if (lowerResponse.includes("bilirubin") || lowerResponse.includes("jaundice") || lowerResponse.includes("phototherapy")) {
    category = "jaundice";
  } else if (lowerResponse.includes("hemolysis") || lowerResponse.includes("ldh") || lowerResponse.includes("haptoglobin")) {
    category = "hemolysis";
  }

  // Only create plan if we have at least one action
  if (actions.length === 0) {
    return null;
  }

  // Set default title if not found
  if (!planTitle) {
    const categoryTitles: Record<TreatmentPlanCategory, { en: string; es: string }> = {
      transfusion: { en: "Transfusion Management Plan", es: "Plan de Manejo de Transfusion" },
      sepsis: { en: "Sepsis Evaluation & Treatment Plan", es: "Plan de Evaluacion y Tratamiento de Sepsis" },
      nec: { en: "NEC Evaluation Plan", es: "Plan de Evaluacion de NEC" },
      respiratory: { en: "Respiratory Management Plan", es: "Plan de Manejo Respiratorio" },
      feeding: { en: "Feeding Management Plan", es: "Plan de Manejo de Alimentacion" },
      jaundice: { en: "Jaundice Management Plan", es: "Plan de Manejo de Ictericia" },
      hemolysis: { en: "Hemolysis Evaluation Plan", es: "Plan de Evaluacion de Hemolisis" },
      general: { en: "Clinical Management Plan", es: "Plan de Manejo Clinico" },
    };
    planTitle = language === "es" ? categoryTitles[category].es : categoryTitles[category].en;
  }

  // Truncate summary if too long
  if (planSummary.length > 500) {
    planSummary = planSummary.substring(0, 497) + "...";
  }

  return {
    patientId,
    occurredAt: new Date().toISOString(),
    category,
    status: "active",
    title: planTitle,
    titleEs: planTitle, // Ideally AI would provide Spanish
    summary: planSummary || "Treatment plan created based on clinical assessment.",
    summaryEs: planSummary || "Plan de tratamiento creado basado en evaluacion clinica.",
    rationale: "Based on current clinical status and evidence-based guidelines.",
    rationaleEs: "Basado en estado clinico actual y guias basadas en evidencia.",
    actions,
    amendments: [], // Start with empty amendment history
    milaRecommendation: response.replace("[TREATMENT_PLAN_CREATED]", "").trim(),
  };
}

// Call the MILA AI API
async function callMilaAPI(
  message: string,
  patientContext: string,
  language: string
): Promise<string> {
  try {
    const response = await fetch("/api/mila/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        patientContext,
        language,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("MILA API error:", error);
    // Return a friendly error message
    return language === "es"
      ? "Lo siento, hubo un error al procesar tu pregunta. Por favor intenta de nuevo."
      : "Sorry, there was an error processing your question. Please try again.";
  }
}

export function MilaAssistant() {
  const { t, language } = useTranslation();
  const { currentPatient } = usePatientStore();
  const { latestVitals } = useMonitorStore();
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Chat state - always visible
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingStatus, setThinkingStatus] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const thinkingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadSummary() {
      if (!currentPatient) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Get all labs
        const labs = await LabValueRepository.byPatient(currentPatient.id);

        // Get clinical status
        const clinicalStatus = await ClinicalStatusRepository.getCurrentStatus(currentPatient.id);

        // Get phlebotomy data
        const [phlebotomyStatus, phlebotomies] = await Promise.all([
          PhlebotomyRepository.getBloodLossStatus(
            currentPatient.id,
            currentPatient.birthWeightGrams
          ),
          PhlebotomyRepository.byPatient(currentPatient.id),
        ]);
        const phlebotomyCount = phlebotomies.length;
        const averageMlPerOrder = phlebotomyCount > 0
          ? phlebotomyStatus.totalMl / phlebotomyCount
          : 0;

        // Get feeding data
        const feedingSummary = await FeedingRepository.getFeedingSummary(currentPatient.id);

        // Count abnormal labs (outside reference range)
        const abnormalLabs = labs.filter(l => {
          if (l.refRangeLow !== undefined && l.value < l.refRangeLow) return true;
          if (l.refRangeHigh !== undefined && l.value > l.refRangeHigh) return true;
          return false;
        });

        // Generate recommendations
        const recommendations: string[] = [];
        const recommendationsEs: string[] = [];

        // Hemoglobin check - evidence-based approach with alternatives
        // Per ETTNO/TOP trials: restrictive thresholds are safe if clinically stable
        const hgbData = getLabTrend(labs, "hgb");
        if (hgbData && hgbData.value < 7) {
          // Low - but consider alternatives first
          recommendations.push(
            "Hgb 7 g/dL - Consider: 1) Erythropoietin (EPO) 400 U/kg SC 3x/week if not already on therapy, " +
            "2) Iron supplementation (6 mg/kg/day), 3) Minimize phlebotomy losses. " +
            "Transfusion if symptomatic (tachycardia, poor feeding, apnea) or Hgb <6 g/dL"
          );
          recommendationsEs.push(
            "Hgb 7 g/dL - Considerar: 1) Eritropoyetina (EPO) 400 U/kg SC 3x/semana si no está en terapia, " +
            "2) Suplementación de hierro (6 mg/kg/día), 3) Minimizar pérdidas por flebotomía. " +
            "Transfusión si sintomático (taquicardia, mala alimentación, apnea) o Hgb <6 g/dL"
          );
        } else if (hgbData && hgbData.value < 9 && hgbData.trend === "down") {
          // Declining - preventive approach
          recommendations.push(
            "Hgb declining - Consider starting Erythropoietin (EPO) 250-400 U/kg SC 3x/week " +
            "with Iron 6 mg/kg/day to prevent further decline. Acceptable if baby is stable."
          );
          recommendationsEs.push(
            "Hgb en descenso - Considerar iniciar Eritropoyetina (EPO) 250-400 U/kg SC 3x/semana " +
            "con Hierro 6 mg/kg/día para prevenir mayor descenso. Aceptable si el bebé está estable."
          );
        } else if (hgbData && hgbData.value < 10) {
          // Low-normal - just note it, no alarm
          recommendations.push("Hgb within acceptable range for preterm infant - continue routine monitoring");
          recommendationsEs.push("Hgb dentro del rango aceptable para prematuro - continuar monitoreo de rutina");
        }

        // Phlebotomy check - with practical suggestions
        if (phlebotomyStatus.status === "critical") {
          recommendations.push(
            `Iatrogenic blood loss ${phlebotomyStatus.percentOfBloodVolume.toFixed(0)}% of blood volume - ` +
            "Strategies: 1) Use microsampling techniques, 2) Bundle lab draws, " +
            "3) Consider point-of-care testing, 4) Review if all labs truly necessary"
          );
          recommendationsEs.push(
            `Pérdida sanguínea iatrogénica ${phlebotomyStatus.percentOfBloodVolume.toFixed(0)}% del volumen sanguíneo - ` +
            "Estrategias: 1) Usar técnicas de micromuestreo, 2) Agrupar extracciones, " +
            "3) Considerar pruebas point-of-care, 4) Revisar si todos los labs son necesarios"
          );
        } else if (phlebotomyStatus.status === "warning") {
          recommendations.push(
            "Phlebotomy losses approaching limit - consider consolidating lab draws when possible"
          );
          recommendationsEs.push(
            "Pérdidas por flebotomía acercándose al límite - considerar consolidar extracciones cuando sea posible"
          );
        }

        // Feeding check - with specific guidance
        if (feedingSummary.toleranceRate < 70) {
          recommendations.push(
            "Feeding intolerance <70% - Hold feeds and assess: 1) Abdominal exam for distension/tenderness, " +
            "2) Check residual volumes, 3) Consider KUB if NEC concern, 4) NPO with TPN if prolonged intolerance"
          );
          recommendationsEs.push(
            "Intolerancia alimentaria <70% - Suspender alimentación y evaluar: 1) Examen abdominal (distensión/dolor), " +
            "2) Verificar residuos, 3) Considerar Rx abdomen si sospecha NEC, 4) NPO con NPT si intolerancia prolongada"
          );
        } else if (feedingSummary.toleranceRate < 80) {
          recommendations.push(
            "Feeding tolerance borderline (70-80%) - Monitor closely, may advance slowly if clinically stable"
          );
          recommendationsEs.push(
            "Tolerancia alimentaria limítrofe (70-80%) - Monitorear de cerca, puede avanzar lentamente si clínicamente estable"
          );
        }

        // Bilirubin check - with specific thresholds
        const biliData = getLabTrend(labs, "tbili");
        if (biliData && biliData.value > 12 && biliData.trend === "up") {
          recommendations.push(
            `Bilirubin ${biliData.value.toFixed(1)} mg/dL and rising - ` +
            "Check phototherapy threshold for gestational age. " +
            "Consider: 1) Intensive phototherapy if indicated, 2) Recheck in 4-6h, 3) Rule out hemolysis"
          );
          recommendationsEs.push(
            `Bilirrubina ${biliData.value.toFixed(1)} mg/dL y en ascenso - ` +
            "Verificar umbral de fototerapia para edad gestacional. " +
            "Considerar: 1) Fototerapia intensiva si indicada, 2) Rechecar en 4-6h, 3) Descartar hemólisis"
          );
        } else if (biliData && biliData.trend === "up" && biliData.value > 8) {
          recommendations.push(
            "Bilirubin trending up - monitor trend, no intervention needed if below phototherapy threshold"
          );
          recommendationsEs.push(
            "Bilirrubina en ascenso - monitorear tendencia, sin intervención si bajo umbral de fototerapia"
          );
        }

        // Platelet check - evidence-based (PlaNeT-2 trial: 25,000 threshold)
        const pltData = getLabTrend(labs, "plt");
        if (pltData && pltData.value < 25000) {
          // Per PlaNeT-2: transfuse at <25,000 in stable neonates
          recommendations.push(
            "PLT <25K - Consider platelet transfusion per PlaNeT-2 guidelines. " +
            "Check for underlying cause: sepsis, NEC, DIC. Monitor for active bleeding."
          );
          recommendationsEs.push(
            "PLT <25K - Considerar transfusión de plaquetas según guías PlaNeT-2. " +
            "Verificar causa: sepsis, NEC, CID. Vigilar sangrado activo."
          );
        } else if (pltData && pltData.value < 50000) {
          // Moderate thrombocytopenia - monitor only
          recommendations.push(
            "PLT 25-50K - Monitor trend, transfusion not indicated if stable per PlaNeT-2. " +
            "Consider underlying cause workup if persistent."
          );
          recommendationsEs.push(
            "PLT 25-50K - Monitorear tendencia, transfusión no indicada si estable según PlaNeT-2. " +
            "Considerar estudio de causa si persiste."
          );
        }

        // If no recommendations, add encouraging message
        if (recommendations.length === 0) {
          recommendations.push(
            "Great news! All parameters within acceptable ranges. " +
            "Continue current care plan and routine monitoring. " +
            "Baby is doing well! 🌟"
          );
          recommendationsEs.push(
            "¡Buenas noticias! Todos los parámetros dentro de rangos aceptables. " +
            "Continuar plan de cuidados actual y monitoreo de rutina. " +
            "¡El bebé está bien! 🌟"
          );
        }

        // Determine overall status - conservative approach
        // Only "attention" for truly critical situations requiring immediate action
        // "watch" for things that need monitoring but aren't emergencies
        let overallStatus: "stable" | "watch" | "attention" = "stable";

        // ATTENTION: Only for critical values that need immediate intervention
        if ((hgbData && hgbData.value < 7) || (pltData && pltData.value < 20000)) {
          overallStatus = "attention";
        }
        // WATCH: Values that need closer monitoring but patient can remain stable
        else if (
          phlebotomyStatus.status === "critical" ||
          feedingSummary.toleranceRate < 70 ||
          (hgbData && hgbData.value < 8 && hgbData.trend === "down")
        ) {
          overallStatus = "watch";
        }

        // Determine vital status
        const hrValue = latestVitals.hr?.value;
        const spo2Value = latestVitals.spo2?.value;
        let vitalStatus: "stable" | "concerning" | "critical" = "stable";
        if (hrValue && (hrValue < 80 || hrValue > 200)) {
          vitalStatus = "critical";
        } else if (spo2Value && spo2Value < 85) {
          vitalStatus = "critical";
        } else if (hrValue && (hrValue < 100 || hrValue > 180)) {
          vitalStatus = "concerning";
        } else if (spo2Value && spo2Value < 90) {
          vitalStatus = "concerning";
        }

        // Determine clinical status values
        const respiratorySupport = clinicalStatus?.respiratorySupport || currentPatient.currentRespiratorySupport || null;
        const isIntubated = respiratorySupport?.startsWith("intubated") || false;
        const fio2 = clinicalStatus?.fio2 || currentPatient.currentFio2 || null;
        const phototherapy = clinicalStatus?.phototherapy || currentPatient.currentPhototherapy || null;
        const activeDevelopmentalCare = clinicalStatus?.activeDevelopmentalCare || [];
        const onCaffeine = clinicalStatus?.caffeineCitrate || currentPatient.onCaffeine || false;
        const hasLines = clinicalStatus?.umbilicalLines || clinicalStatus?.centralLine ||
          currentPatient.hasUmbilicalLines || currentPatient.hasCentralLine || false;

        // Get sepsis markers
        const wbcData = getLabTrend(labs, "wbc");
        const crpData = getLabTrend(labs, "crp");
        const pctData = getLabTrend(labs, "pct");
        const itRatioData = getLabTrend(labs, "it_ratio");

        // Get NEC/blood gas markers
        const lactateData = getLabTrend(labs, "lactate");
        const phData = getLabTrend(labs, "ph");
        const hco3Data = getLabTrend(labs, "hco3");

        setSummary({
          currentHR: latestVitals.hr?.value || null,
          currentSpO2: latestVitals.spo2?.value || null,
          currentRR: latestVitals.rr?.value || null,
          currentTemp: latestVitals.temp?.value || null,
          vitalStatus,
          latestHgb: hgbData,
          latestPlt: pltData,
          latestBili: biliData,
          abnormalLabCount: abnormalLabs.length,
          // Sepsis markers
          latestWbc: wbcData,
          latestCrp: crpData,
          latestPct: pctData,
          latestItRatio: itRatioData,
          // NEC/blood gas markers
          latestLactate: lactateData,
          latestPh: phData,
          latestHco3: hco3Data,
          totalPhlebotomyMl: phlebotomyStatus.totalMl,
          phlebotomyPercentBloodVolume: phlebotomyStatus.percentOfBloodVolume,
          phlebotomyStatus: phlebotomyStatus.status,
          phlebotomyCount,
          averageMlPerOrder,
          feedingTolerance: feedingSummary.toleranceRate,
          lastFeedingVolume: feedingSummary.lastFeeding?.volumeMl || null,
          feedingRoute: feedingSummary.lastFeeding?.route || null,
          respiratorySupport,
          fio2,
          isIntubated,
          phototherapy,
          activeDevelopmentalCare,
          onCaffeine,
          hasLines,
          overallStatus,
          recommendations,
          recommendationsEs,
        });
      } catch (error) {
        console.error("Failed to load MILA summary:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, [currentPatient, latestVitals]);

  if (!currentPatient) {
    return null;
  }

  const daysOfLife = calculateDaysOfLife(currentPatient.birthDate);
  const hour = currentTime.getHours();
  const greeting = language === "es"
    ? hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches"
    : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
    if (trend === "up") return <TrendingUp className="w-3 h-3 text-green-500" />;
    if (trend === "down") return <TrendingDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  // Handle sending a chat message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentPatient) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    startThinkingAnimation();

    // Build context and call AI API
    const context = buildPatientContext(currentPatient, summary, daysOfLife);
    const aiResponse = await callMilaAPI(userMessage.content, context, language);

    // Check if a treatment plan was created
    const treatmentPlan = parseTreatmentPlanFromResponse(aiResponse, currentPatient.id, language);
    if (treatmentPlan) {
      try {
        await TreatmentPlanRepository.create(treatmentPlan);
        console.log("[MILA] Treatment plan created:", treatmentPlan.title);
      } catch (error) {
        console.error("[MILA] Failed to create treatment plan:", error);
      }
    }

    // Clean up the response for display (remove the marker)
    const cleanedResponse = aiResponse.replace("[TREATMENT_PLAN_CREATED]", "").trim();

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: cleanedResponse,
      timestamp: new Date(),
    };

    stopThinkingAnimation();
    setMessages((prev) => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  // Handle quick action click
  const handleQuickAction = async (action: QuickAction) => {
    if (!currentPatient) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: language === "es" ? action.labelEs : action.labelEn,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    startThinkingAnimation();

    // Build context and call AI API
    const context = buildPatientContext(currentPatient, summary, daysOfLife);
    const aiResponse = await callMilaAPI(action.prompt, context, language);

    // Check if a treatment plan was created
    const treatmentPlan = parseTreatmentPlanFromResponse(aiResponse, currentPatient.id, language);
    if (treatmentPlan) {
      try {
        await TreatmentPlanRepository.create(treatmentPlan);
        console.log("[MILA] Treatment plan created:", treatmentPlan.title);
      } catch (error) {
        console.error("[MILA] Failed to create treatment plan:", error);
      }
    }

    // Clean up the response for display (remove the marker)
    const cleanedResponse = aiResponse.replace("[TREATMENT_PLAN_CREATED]", "").trim();

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: cleanedResponse,
      timestamp: new Date(),
    };

    stopThinkingAnimation();
    setMessages((prev) => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  // Handle Yes/No response for treatment plan confirmation
  const handlePlanConfirmation = async (confirmed: boolean) => {
    if (!currentPatient) return;

    const userResponse = confirmed
      ? (language === "es" ? "Sí, procede con el plan" : "Yes, proceed with the plan")
      : (language === "es" ? "No, tengo otro plan" : "No, I have a different plan");

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userResponse,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    startThinkingAnimation();

    // Build context and call AI API
    const context = buildPatientContext(currentPatient, summary, daysOfLife);
    const aiResponse = await callMilaAPI(userResponse, context, language);

    // Check if a treatment plan was created (only when user says yes)
    if (confirmed) {
      const treatmentPlan = parseTreatmentPlanFromResponse(aiResponse, currentPatient.id, language);
      if (treatmentPlan) {
        try {
          await TreatmentPlanRepository.create(treatmentPlan);
          console.log("[MILA] Treatment plan created:", treatmentPlan.title);
        } catch (error) {
          console.error("[MILA] Failed to create treatment plan:", error);
        }
      }
    }

    // Clean up the response for display (remove the marker)
    const cleanedResponse = aiResponse.replace("[TREATMENT_PLAN_CREATED]", "").trim();

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: cleanedResponse,
      timestamp: new Date(),
    };

    stopThinkingAnimation();
    setMessages((prev) => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  // Scroll to bottom when new messages arrive (only within chat container, not page)
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages]);

  return (
    <Card className="relative overflow-hidden border-2 border-[hsl(var(--baby-lavender))] shadow-playful-lg">
      {/* Soft background gradient - always calming */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--baby-lavender)/0.2)] via-[hsl(var(--baby-pink)/0.1)] to-[hsl(var(--baby-mint)/0.1)] pointer-events-none" />

      <CardHeader className="relative pb-4 bg-gradient-to-r from-[hsl(var(--baby-lavender))] via-[hsl(var(--baby-pink)/0.8)] to-[hsl(var(--baby-lavender))]">
        {/* Subtle sparkle decoration */}
        <div className="absolute top-3 right-4">
          <Sparkles className="w-4 h-4 text-purple-600/40" />
        </div>

        <CardTitle className="flex items-center gap-4">
          {/* AI avatar - calm purple theme */}
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-white/50">
              <Brain className="w-7 h-7 text-white" />
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-white flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-purple-900 dark:text-purple-100">MILA</span>
              <Badge className="bg-purple-600/20 text-purple-800 dark:text-purple-200 border-purple-400/50 text-xs">
                AI
              </Badge>
            </div>
            <p className="text-xs text-purple-700/70 dark:text-purple-300/70 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {language === "es" ? "Asistente Clínico" : "Clinical Assistant"}
            </p>
          </div>

        </CardTitle>
      </CardHeader>
      <CardContent className="relative pt-4 space-y-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="w-8 h-8 mx-auto mb-2 animate-pulse text-purple-500" />
            {t.common.loading}
          </div>
        ) : summary ? (
          <>
            {/* Greeting - More prominent */}
            <div className="text-base">
              <p className="font-bold text-foreground text-lg">
                {greeting}, {language === "es" ? "Doctor" : "Doctor"}! 👋
              </p>
              <p className="text-muted-foreground mt-1">
                {language === "es"
                  ? `${currentPatient.displayName} tiene ${daysOfLife} días de vida.`
                  : `${currentPatient.displayName} is ${daysOfLife} days old.`}
              </p>
            </div>

            {/* Status Badge - Calm design, only alarming when truly needed */}
            <div className={cn(
              "p-3 rounded-xl flex items-center gap-3 border",
              summary.overallStatus === "attention" && "bg-red-50 dark:bg-red-900/20 border-red-300",
              summary.overallStatus === "watch" && "bg-amber-50 dark:bg-amber-900/20 border-amber-300",
              summary.overallStatus === "stable" && "bg-[hsl(var(--baby-mint)/0.3)] border-green-300"
            )}>
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                summary.overallStatus === "attention" && "bg-red-100 text-red-600",
                summary.overallStatus === "watch" && "bg-amber-100 text-amber-600",
                summary.overallStatus === "stable" && "bg-green-100 text-green-600"
              )}>
                {summary.overallStatus === "attention" && <AlertTriangle className="w-5 h-5" />}
                {summary.overallStatus === "watch" && <Activity className="w-5 h-5" />}
                {summary.overallStatus === "stable" && <Sparkles className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className={cn(
                  "font-semibold",
                  summary.overallStatus === "attention" && "text-red-700 dark:text-red-300",
                  summary.overallStatus === "watch" && "text-amber-700 dark:text-amber-300",
                  summary.overallStatus === "stable" && "text-green-700 dark:text-green-300"
                )}>
                  {summary.overallStatus === "attention"
                    ? (language === "es" ? "Requiere revisión" : "Needs review")
                    : summary.overallStatus === "watch"
                    ? (language === "es" ? "En observación" : "Watch closely")
                    : (language === "es" ? "Estable" : "Stable")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === "es" ? "Estado clínico" : "Clinical status"}
                </p>
              </div>
            </div>

            {/* Big Picture Summary - Show trends */}
            <div className="p-3 rounded-xl bg-[hsl(var(--baby-lavender)/0.2)] border border-[hsl(var(--baby-lavender))]">
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-2">
                📊 {language === "es" ? "Panorama General" : "Big Picture"}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {language === "es" ? (
                  <>
                    <strong>{currentPatient.displayName}</strong> lleva <strong>{daysOfLife} días</strong> de vida.
                    {summary.latestHgb && (
                      <> Hemoglobina {summary.latestHgb.trend === "down" ? "en descenso" : summary.latestHgb.trend === "up" ? "en ascenso" : "estable"} ({summary.latestHgb.value.toFixed(1)} g/dL).</>
                    )}
                    {summary.feedingTolerance && (
                      <> Tolerancia alimentaria al {summary.feedingTolerance.toFixed(0)}%.</>
                    )}
                    {summary.phlebotomyPercentBloodVolume > 5 && (
                      <> Pérdida por flebotomía: {summary.phlebotomyPercentBloodVolume.toFixed(0)}% del volumen sanguíneo.</>
                    )}
                  </>
                ) : (
                  <>
                    <strong>{currentPatient.displayName}</strong> is <strong>{daysOfLife} days</strong> old.
                    {summary.latestHgb && (
                      <> Hemoglobin {summary.latestHgb.trend === "down" ? "declining" : summary.latestHgb.trend === "up" ? "rising" : "stable"} ({summary.latestHgb.value.toFixed(1)} g/dL).</>
                    )}
                    {summary.feedingTolerance && (
                      <> Feeding tolerance at {summary.feedingTolerance.toFixed(0)}%.</>
                    )}
                    {summary.phlebotomyPercentBloodVolume > 5 && (
                      <> Phlebotomy loss: {summary.phlebotomyPercentBloodVolume.toFixed(0)}% of blood volume.</>
                    )}
                  </>
                )}
              </p>
            </div>

            {/* Clinical Status - Respiratory, Phototherapy, Developmental Care */}
            {(summary.respiratorySupport || summary.phototherapy) && (
              <div className="grid grid-cols-3 gap-2 text-sm">
                {/* Respiratory */}
                <div className={cn(
                  "p-2 rounded-xl border text-center",
                  summary.isIntubated
                    ? "bg-red-50 dark:bg-red-900/20 border-red-300"
                    : summary.respiratorySupport === "room_air"
                    ? "bg-green-50 dark:bg-green-900/20 border-green-300"
                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-300"
                )}>
                  <Wind className={cn(
                    "w-4 h-4 mx-auto mb-1",
                    summary.isIntubated ? "text-red-500" : "text-blue-500"
                  )} />
                  <p className="text-[10px] font-medium">
                    {summary.respiratorySupport
                      ? RESPIRATORY_LABELS[summary.respiratorySupport][language === "es" ? "es" : "en"]
                      : "-"}
                  </p>
                  {summary.fio2 && (
                    <p className="text-[10px] text-muted-foreground">FiO2: {summary.fio2}%</p>
                  )}
                </div>

                {/* Phototherapy */}
                <div className={cn(
                  "p-2 rounded-xl border text-center",
                  summary.phototherapy && summary.phototherapy !== "none"
                    ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300"
                    : "bg-muted/30 border-muted"
                )}>
                  <Sun className={cn(
                    "w-4 h-4 mx-auto mb-1",
                    summary.phototherapy && summary.phototherapy !== "none" ? "text-yellow-500" : "text-muted-foreground"
                  )} />
                  <p className="text-[10px] font-medium">
                    {summary.phototherapy
                      ? PHOTOTHERAPY_LABELS[summary.phototherapy][language === "es" ? "es" : "en"]
                      : "-"}
                  </p>
                </div>

                {/* Quick Status Flags */}
                <div className="p-2 rounded-xl bg-muted/30 border border-muted space-y-1">
                  {summary.onCaffeine && (
                    <p className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded px-1.5 py-0.5">
                      ☕ {language === "es" ? "Cafeina" : "Caffeine"}
                    </p>
                  )}
                  {summary.hasLines && (
                    <p className="text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded px-1.5 py-0.5">
                      💉 {language === "es" ? "Lineas" : "Lines"}
                    </p>
                  )}
                  {summary.activeDevelopmentalCare.length > 0 && (
                    <p className="text-[10px] bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded px-1.5 py-0.5">
                      💗 {language === "es" ? "Est. Temprana" : "Dev Care"}
                    </p>
                  )}
                  {!summary.onCaffeine && !summary.hasLines && summary.activeDevelopmentalCare.length === 0 && (
                    <p className="text-[10px] text-muted-foreground text-center">-</p>
                  )}
                </div>
              </div>
            )}

            {/* Clinical Summary */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {/* Vitals */}
              <div className="p-3 rounded-xl bg-muted/30 space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Activity className="w-3 h-3" />
                  {language === "es" ? "Signos Vitales" : "Vitals"}
                </div>
                {summary.currentHR && (
                  <p className="text-xs">HR: {summary.currentHR} bpm</p>
                )}
                {summary.currentSpO2 && (
                  <p className="text-xs">SpO2: {summary.currentSpO2}%</p>
                )}
                {summary.currentRR && (
                  <p className="text-xs">RR: {summary.currentRR}/min</p>
                )}
                {summary.currentTemp && (
                  <p className="text-xs">Temp: {summary.currentTemp}°C</p>
                )}
                {!summary.currentHR && !summary.currentSpO2 && (
                  <p className="text-xs text-muted-foreground italic">
                    {language === "es" ? "Sin monitor conectado" : "Monitor not connected"}
                  </p>
                )}
              </div>

              {/* Labs */}
              <div className="p-3 rounded-xl bg-muted/30 space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Droplets className="w-3 h-3" />
                  {language === "es" ? "Laboratorios" : "Labs"}
                </div>
                {summary.latestHgb && (
                  <p className="text-xs flex items-center gap-1">
                    Hgb: {summary.latestHgb.value.toFixed(1)} g/dL <TrendIcon trend={summary.latestHgb.trend} />
                  </p>
                )}
                {summary.latestPlt && (
                  <p className="text-xs flex items-center gap-1">
                    PLT: {(summary.latestPlt.value / 1000).toFixed(0)}K <TrendIcon trend={summary.latestPlt.trend} />
                  </p>
                )}
                {summary.latestBili && (
                  <p className="text-xs flex items-center gap-1">
                    Bili: {summary.latestBili.value.toFixed(1)} <TrendIcon trend={summary.latestBili.trend} />
                  </p>
                )}
              </div>

              {/* Phlebotomy */}
              <div className="p-3 rounded-xl bg-muted/30 space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Syringe className="w-3 h-3" />
                  {language === "es" ? "Flebotomía" : "Phlebotomy"}
                </div>
                <p className={cn(
                  "text-xs font-medium",
                  summary.phlebotomyStatus === "critical" && "text-red-600",
                  summary.phlebotomyStatus === "warning" && "text-yellow-600"
                )}>
                  {summary.totalPhlebotomyMl.toFixed(0)} ml ({summary.phlebotomyPercentBloodVolume.toFixed(1)}% BV)
                </p>
                <p className="text-xs text-muted-foreground">
                  {summary.phlebotomyCount} {language === "es" ? "extracciones" : "draws"} • {summary.averageMlPerOrder.toFixed(1)} ml/{language === "es" ? "orden" : "order"}
                </p>
              </div>

              {/* Feeding */}
              <div className="p-3 rounded-xl bg-muted/30 space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Baby className="w-3 h-3" />
                  {language === "es" ? "Alimentación" : "Feeding"}
                </div>
                <p className={cn(
                  "text-xs",
                  summary.feedingTolerance < 80 && "text-yellow-600 font-medium"
                )}>
                  {summary.feedingTolerance.toFixed(0)}% {language === "es" ? "tolerancia" : "tolerance"}
                </p>
                {summary.lastFeedingVolume && (
                  <p className="text-xs">
                    {summary.lastFeedingVolume} ml via {summary.feedingRoute}
                  </p>
                )}
              </div>
            </div>

            {/* Chat Section - ALWAYS VISIBLE AND PROMINENT */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-900/50 dark:via-pink-900/30 dark:to-purple-800/40 border-2 border-purple-400 dark:border-purple-600 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg animate-pulse">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-purple-800 dark:text-purple-200">
                    {language === "es" ? "Habla con MILA" : "Talk to MILA"}
                  </h3>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    {language === "es"
                      ? "Tu asistente de inteligencia artificial clinica"
                      : "Your AI Clinical Assistant"}
                  </p>
                </div>
              </div>

              {/* Chat messages - Made larger for better readability */}
              <div className="h-[450px] overflow-y-auto mb-4 space-y-3 p-4 rounded-xl bg-white/70 dark:bg-black/30 border border-purple-200 dark:border-purple-700">
                {messages.length === 0 && (
                  <div className="py-3">
                    <div className="text-center mb-3">
                      <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                        {language === "es" ? "¿Que quieres saber?" : "What do you want to know?"}
                      </p>
                    </div>
                    {/* Quick Action Buttons */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      {QUICK_ACTIONS.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => handleQuickAction(action)}
                          disabled={isTyping}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-medium",
                            "bg-gradient-to-r transition-all duration-200 hover:scale-105 hover:shadow-md",
                            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                            action.color
                          )}
                        >
                          {action.icon}
                          <span>{language === "es" ? action.labelEs : action.labelEn}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-3 px-4">
                      <div className="flex-1 h-px bg-purple-200 dark:bg-purple-700" />
                      <span className="text-[10px] text-muted-foreground">
                        {language === "es" ? "o escribe tu pregunta" : "or type your question"}
                      </span>
                      <div className="flex-1 h-px bg-purple-200 dark:bg-purple-700" />
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
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                        msg.role === "user"
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                          : "bg-white dark:bg-gray-800 border-2 border-purple-100 dark:border-purple-800 shadow"
                      )}
                    >
                      {msg.role === "assistant" ? formatMarkdown(msg.content) : msg.content}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0 shadow">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {/* Yes/No buttons for plan confirmation */}
                {!isTyping && shouldShowPlanConfirmation(messages) && (
                  <div className="flex gap-2 justify-center py-3">
                    <Button
                      onClick={() => handlePlanConfirmation(true)}
                      className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg px-6 py-2 flex items-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      {language === "es" ? "Sí, proceder" : "Yes, proceed"}
                    </Button>
                    <Button
                      onClick={() => handlePlanConfirmation(false)}
                      variant="outline"
                      className="rounded-xl border-2 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-6 py-2 flex items-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      {language === "es" ? "No, tengo otro plan" : "No, I have a different plan"}
                    </Button>
                  </div>
                )}
                {isTyping && (
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow">
                      <Brain className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/50 dark:to-pink-900/50 border-2 border-purple-200 dark:border-purple-700 rounded-2xl px-4 py-3 shadow-md max-w-[85%]">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span className="text-sm text-purple-700 dark:text-purple-300 font-medium animate-pulse">
                          {thinkingStatus || (language === "es" ? "Pensando..." : "Thinking...")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick actions when chatting */}
              {messages.length > 0 && (
                <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action)}
                      disabled={isTyping}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-lg text-white text-[10px] font-medium whitespace-nowrap",
                        "bg-gradient-to-r transition-all hover:scale-105",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        action.color
                      )}
                    >
                      {action.icon}
                      <span>{language === "es" ? action.labelEs : action.labelEn}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Chat input - More prominent */}
              <div className="flex gap-3">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={language === "es" ? "Escribe tu pregunta a MILA..." : "Type your question to MILA..."}
                  className="rounded-xl border-2 border-purple-300 dark:border-purple-600 focus:border-purple-500 bg-white dark:bg-gray-900"
                />
                <Button
                  size="default"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 shadow-lg px-6"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Recommendations - Highlighted Section */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-50 dark:from-purple-900/40 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-700 shadow-lg">
              <div className="flex items-center gap-3 font-bold text-base mb-3 text-purple-800 dark:text-purple-200">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                {language === "es" ? "Recomendaciones Clinicas" : "Clinical Recommendations"}
              </div>
              <ul className="space-y-3">
                {(language === "es" ? summary.recommendationsEs : summary.recommendations).map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-white/80 dark:bg-black/30 rounded-xl p-3 shadow-sm border border-purple-200 dark:border-purple-800">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center shadow">
                      {idx + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-foreground">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            {language === "es"
              ? "No se pudo cargar el resumen del paciente"
              : "Could not load patient summary"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
