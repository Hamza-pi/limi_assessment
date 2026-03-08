"use client";

// Light module visual representation.
// Renders a glowing light icon whose intensity and colour are driven by the
// module's properties. Framer Motion animates the glow and opacity transitions,
// and a compact Switch lets the user toggle the light directly on the canvas.

import { motion } from "motion/react";
import { Lightbulb } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { getLightGlowStyle } from "@/lib/module-type-guards";
import { useModuleActions } from "@/hooks/useModuleActions";
import { ModuleStatus } from "@/lib/types";
import type { LightModule } from "@/lib/module-type-guards";

interface LightModuleNodeProps {
  module: LightModule;
}

export function LightModuleNode({ module }: LightModuleNodeProps) {
  const { toggleModule } = useModuleActions();
  const isOn = module.status === ModuleStatus.ON;
  const { intensity, color } = module.properties;
  const glowStyle = isOn ? getLightGlowStyle(intensity, color) : undefined;

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center rounded-lg bg-card/80 p-1 backdrop-blur-sm">
      {/* Glow halo behind the icon */}
      <motion.div
        className="absolute inset-0 rounded-lg"
        animate={{
          boxShadow: glowStyle ?? "none",
          opacity: isOn ? 1 : 0,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        aria-hidden="true"
      />

      {/* Light icon */}
      <motion.div
        animate={{ opacity: isOn ? 1 : 0.35, scale: isOn ? 1 : 0.9 }}
        transition={{ duration: 0.3 }}
        className="relative z-10"
      >
        <Lightbulb
          aria-hidden="true"
          className="size-[40%] min-h-4 min-w-4"
          style={{ color: isOn ? color : "currentColor" }}
          strokeWidth={1.5}
        />
      </motion.div>

      {/* Intensity badge */}
      {isOn && (
        <span className="relative z-10 -mt-0.5 font-mono text-[9px] leading-none text-muted-foreground">
          {intensity}%
        </span>
      )}

      {/* Toggle switch — stopPropagation so it doesn't also select the module */}
      <div
        className="absolute bottom-1 right-1 z-20"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Switch
          checked={isOn}
          onCheckedChange={() => toggleModule(module.id)}
          aria-label={`Toggle ${module.name}`}
          data-testid="light-switch"
          className="scale-75 origin-bottom-right"
        />
      </div>
    </div>
  );
}
