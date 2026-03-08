"use client";

// Furniture module visual representation.
// Furniture is static — no toggles or live values, just a type-specific icon
// and name label. Distinct from interactive modules with a muted style.

import { getFurnitureIcon } from "@/lib/module-type-guards";
import type { FurnitureModule } from "@/lib/module-type-guards";

interface FurnitureModuleNodeProps {
  module: FurnitureModule;
}

export function FurnitureModuleNode({ module }: FurnitureModuleNodeProps) {
  const { furnitureType } = module.properties;
  const IconComponent = getFurnitureIcon(furnitureType);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-lg border border-border/40 bg-muted/30 p-1">
      <IconComponent
        aria-hidden="true"
        className="size-[40%] min-h-3 min-w-3 text-muted-foreground"
        strokeWidth={1.5}
      />
      <span className="max-w-full truncate text-center font-mono text-[8px] leading-none text-muted-foreground/70">
        {module.name}
      </span>
    </div>
  );
}
