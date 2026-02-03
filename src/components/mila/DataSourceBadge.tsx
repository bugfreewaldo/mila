"use client";

import { Database, Sparkles } from "lucide-react";
import { useAppStore } from "@/lib/mila/store";
import { useTranslation } from "@/lib/mila/i18n";
import { Badge } from "@/components/ui/badge";

export function DataSourceBadge() {
  const { dataSourceType } = useAppStore();
  const { t } = useTranslation();

  const labels = {
    mock: t.topBar.demoMode,
    fhir: "FHIR Server",
    device: "Device Gateway",
  };

  return (
    <Badge
      variant="secondary"
      className="gap-1.5 rounded-full px-3 py-1 bg-[hsl(var(--baby-mint)/0.5)] border border-[hsl(var(--baby-mint))] text-foreground/70 hover:bg-[hsl(var(--baby-mint))]"
    >
      {dataSourceType === "mock" ? (
        <Sparkles className="w-3 h-3" />
      ) : (
        <Database className="w-3 h-3" />
      )}
      {labels[dataSourceType]}
    </Badge>
  );
}
