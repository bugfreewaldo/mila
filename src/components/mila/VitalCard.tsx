"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { Heart, Sparkles } from "lucide-react";
import type { VitalSign, VitalType } from "@/lib/mila/types";
import { getVitalName, getVitalUnit, getVitalSeverity } from "@/lib/mila/data/vital-ranges";
import { cn } from "@/lib/utils";

interface VitalCardProps {
  type: VitalType;
  currentValue: VitalSign | null;
  history: VitalSign[];
  showSparkline?: boolean;
}

const vitalColors: Record<VitalType, string> = {
  hr: "baby-pink",
  spo2: "baby-blue",
  rr: "baby-mint",
  temp: "baby-peach",
  bp_sys: "baby-lavender",
  bp_dia: "baby-lavender",
};

export function VitalCard({
  type,
  currentValue,
  history,
  showSparkline = true,
}: VitalCardProps) {
  const name = getVitalName(type);
  const unit = getVitalUnit(type);
  const severity = currentValue ? getVitalSeverity(type, currentValue.value) : "normal";
  const color = vitalColors[type];

  const chartData = useMemo(() => {
    return history.slice(-60).map((v, i) => ({
      index: i,
      value: v.value,
    }));
  }, [history]);

  const severityColors = {
    normal: "text-[hsl(160,60%,45%)]",
    warning: "text-[hsl(var(--severity-warning))]",
    critical: "text-[hsl(var(--severity-critical))] vital-critical",
  };

  const sparklineColors = {
    normal: "hsl(160, 60%, 50%)",
    warning: "hsl(40, 90%, 55%)",
    critical: "hsl(350, 75%, 60%)",
  };

  return (
    <div className={cn(
      "rounded-2xl border-2 p-5 transition-all hover:shadow-playful hover:-translate-y-0.5",
      `bg-[hsl(var(--${color})/0.3)] border-[hsl(var(--${color}))]`
    )}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            {type === "hr" && <Heart className="w-3 h-3 text-[hsl(var(--baby-pink))]" />}
            {name}
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={cn("text-4xl font-bold tabular-nums", severityColors[severity])}>
              {currentValue ? (type === "temp" ? currentValue.value.toFixed(1) : currentValue.value) : "--"}
            </span>
            <span className="text-sm text-muted-foreground">{unit}</span>
            {severity === "normal" && currentValue && (
              <Sparkles className="w-4 h-4 text-[hsl(var(--baby-mint))] ml-1" />
            )}
          </div>
        </div>
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl",
          `bg-[hsl(var(--${color}))]`
        )}>
          {type === "hr" ? (
            <Heart className="w-5 h-5 text-foreground/70" />
          ) : (
            <span className="text-xs font-bold text-foreground/70">{type.toUpperCase()}</span>
          )}
        </div>
      </div>

      {showSparkline && chartData.length > 0 && (
        <div className="h-14 mt-2 -mx-2 bg-white/30 dark:bg-black/10 rounded-xl p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={sparklineColors[severity]}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {currentValue && (
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--baby-mint))] animate-pulse" />
          Updated: {new Date(currentValue.occurredAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
