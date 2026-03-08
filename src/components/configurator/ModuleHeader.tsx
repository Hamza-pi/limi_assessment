"use client";

// Displays the module type icon, hardware UUID and a type badge at the top
// of the configurator Sheet. Pure presentational — receives data as props.

import { Lightbulb, Activity, Sofa } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ModuleType } from "@/lib/types";
import type { Module } from "@/lib/types";

// ─── Type config ──────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  [ModuleType.LIGHT]: {
    icon: Lightbulb,
    label: "Light",
    iconClass: "text-amber-400",
    badgeClass: "border-amber-400/50 text-amber-400",
  },
  [ModuleType.SENSOR]: {
    icon: Activity,
    label: "Sensor",
    iconClass: "text-blue-400",
    badgeClass: "border-blue-400/50 text-blue-400",
  },
  [ModuleType.FURNITURE]: {
    icon: Sofa,
    label: "Furniture",
    iconClass: "text-stone-400",
    badgeClass: "border-stone-400/50 text-stone-400",
  },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

interface ModuleHeaderProps {
  module: Module;
}

export function ModuleHeader({ module }: ModuleHeaderProps) {
  const config = TYPE_CONFIG[module.type];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-background ${config.iconClass}`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {module.name}
        </p>
        <p className="truncate font-mono text-xs text-muted-foreground">
          {module.uuid}
        </p>
      </div>

      <Badge
        variant="outline"
        className={`shrink-0 text-xs ${config.badgeClass}`}
      >
        {config.label}
      </Badge>
    </div>
  );
}
