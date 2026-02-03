"use client";

import type { LucideIcon } from "lucide-react";
import { FileQuestion, Star, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon = FileQuestion,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center relative">
      {/* Decorative elements */}
      <Star className="absolute top-8 left-1/4 w-4 h-4 text-[hsl(var(--baby-yellow))] opacity-50 animate-float" style={{ animationDelay: "0s" }} />
      <Cloud className="absolute top-12 right-1/4 w-6 h-6 text-[hsl(var(--baby-blue))] opacity-40 animate-float" style={{ animationDelay: "1s" }} />
      <Star className="absolute bottom-12 right-1/3 w-3 h-3 text-[hsl(var(--baby-pink))] opacity-50 animate-float" style={{ animationDelay: "0.5s" }} />

      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[hsl(var(--baby-lavender))] to-[hsl(var(--baby-pink))] mb-5 shadow-playful animate-bounce-soft">
        <Icon className="w-10 h-10 text-foreground/60" />
      </div>
      <h3 className="font-bold text-xl">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-2 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-6 rounded-full px-6 shadow-playful">
          <Star className="w-4 h-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  );
}
