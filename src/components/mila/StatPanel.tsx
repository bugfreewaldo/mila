"use client";

import { TrendingUp, TrendingDown, Minus, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatPanelProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  variant?: "default" | "warning" | "critical" | "success";
  color?: "pink" | "blue" | "mint" | "peach" | "lavender" | "yellow";
  onClick?: () => void;
  clickable?: boolean;
}

export function StatPanel({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  variant = "default",
  color = "lavender",
  onClick,
  clickable = false,
}: StatPanelProps) {
  const isClickable = clickable || !!onClick;
  const colorStyles = {
    pink: "bg-[hsl(var(--baby-pink)/0.3)] border-[hsl(var(--baby-pink))]",
    blue: "bg-[hsl(var(--baby-blue)/0.3)] border-[hsl(var(--baby-blue))]",
    mint: "bg-[hsl(var(--baby-mint)/0.3)] border-[hsl(var(--baby-mint))]",
    peach: "bg-[hsl(var(--baby-peach)/0.3)] border-[hsl(var(--baby-peach))]",
    lavender: "bg-[hsl(var(--baby-lavender)/0.3)] border-[hsl(var(--baby-lavender))]",
    yellow: "bg-[hsl(var(--baby-yellow)/0.3)] border-[hsl(var(--baby-yellow))]",
  };

  const iconBgStyles = {
    pink: "bg-[hsl(var(--baby-pink))]",
    blue: "bg-[hsl(var(--baby-blue))]",
    mint: "bg-[hsl(var(--baby-mint))]",
    peach: "bg-[hsl(var(--baby-peach))]",
    lavender: "bg-[hsl(var(--baby-lavender))]",
    yellow: "bg-[hsl(var(--baby-yellow))]",
  };

  const variantStyles = {
    default: colorStyles[color],
    warning: "bg-[hsl(var(--baby-yellow)/0.5)] border-[hsl(var(--baby-yellow))]",
    critical: "bg-[hsl(var(--baby-pink)/0.5)] border-[hsl(var(--destructive)/0.5)]",
    success: "bg-[hsl(var(--baby-mint)/0.5)] border-[hsl(var(--baby-mint))]",
  };

  const trendColors = {
    up: "text-[hsl(160,60%,45%)]",
    down: "text-[hsl(var(--destructive))]",
    neutral: "text-muted-foreground",
  };

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const Wrapper = isClickable ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        "rounded-2xl border-2 p-5 transition-all hover:shadow-playful hover:-translate-y-0.5 text-left w-full",
        variantStyles[variant],
        isClickable && "cursor-pointer hover:ring-2 hover:ring-primary/30 active:scale-[0.98]"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {isClickable && (
            <p className="text-xs text-primary mt-2 flex items-center gap-1">
              Ver detalles <ChevronRight className="w-3 h-3" />
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "flex items-center justify-center w-12 h-12 rounded-xl",
            iconBgStyles[color]
          )}>
            <Icon className="w-6 h-6 text-foreground/70" />
          </div>
        )}
      </div>

      {trend && (
        <div className={cn("flex items-center gap-1 mt-4 text-sm", trendColors[trend])}>
          <TrendIcon className="w-4 h-4" />
          {trendLabel && <span className="font-medium">{trendLabel}</span>}
          {trend === "up" && <Sparkles className="w-3 h-3 ml-1" />}
        </div>
      )}
    </Wrapper>
  );
}
