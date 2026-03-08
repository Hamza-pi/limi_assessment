"use client";

// Sensor module visual representation.
// Displays a type-specific icon and a live value badge. When the sensor value
// changes (via Supabase Realtime → Zustand), a Framer Motion pulse animation
// plays to draw the operator's attention.

import { useEffect, useRef } from "react";
import { motion, useAnimation } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { getSensorIcon } from "@/lib/module-type-guards";
import type { SensorModule } from "@/lib/module-type-guards";

interface SensorModuleNodeProps {
  module: SensorModule;
}

export function SensorModuleNode({ module }: SensorModuleNodeProps) {
  const { sensorType, value, unit } = module.properties;
  const IconComponent = getSensorIcon(sensorType);
  const controls = useAnimation();
  const prevValue = useRef(value);

  // Pulse whenever the sensor reading changes (Realtime update)
  useEffect(() => {
    if (prevValue.current === value) return;
    prevValue.current = value;
    controls.start({
      scale: [1, 1.18, 0.95, 1],
      transition: { duration: 0.45, ease: "easeInOut" },
    });
  }, [value, controls]);

  const displayValue = Number.isInteger(value)
    ? value.toString()
    : value.toFixed(1);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-1 rounded-lg bg-card/80 p-1 backdrop-blur-sm">
      {/* Sensor icon */}
      <IconComponent
        aria-hidden="true"
        className="size-[35%] min-h-3 min-w-3 text-primary"
        strokeWidth={1.5}
      />

      {/* Live value badge — aria-live announces changes to screen readers */}
      <motion.div animate={controls}>
        <Badge
          variant="outline"
          className="border-primary/40 px-1 py-0 font-mono text-[8px] leading-tight text-primary"
          aria-live="polite"
          aria-label={`${module.name}: ${displayValue}${unit}`}
        >
          {displayValue}
          {unit}
        </Badge>
      </motion.div>
    </div>
  );
}
