"use client";

// Memoised dispatcher that bridges the store and type-specific module components.
// React.memo ensures that changing module A does NOT re-render module B —
// each node only re-renders when its own store slice changes.

import React, { memo, useCallback } from "react";
import { useFloorPlanStore } from "@/hooks/useFloorPlanStore";
import { selectModuleById } from "@/hooks/useFloorPlanSelectors";
import { getModuleStyle } from "@/lib/floor-plan-utils";
import {
  FurnitureModule,
  isLightModule,
  isSensorModule,
} from "@/lib/module-type-guards";
import { ModuleType } from "@/lib/types";
import type { Room } from "@/lib/types";
import { LightModuleNode } from "./LightModuleNode";
import { SensorModuleNode } from "./SensorModuleNode";
import { FurnitureModuleNode } from "./FurnitureModuleNode";

interface ModuleNodeProps {
  id: string;
  room: Room;
}

function ModuleNodeInner({ id, room }: ModuleNodeProps) {
  const mod = useFloorPlanStore(selectModuleById(id));
  const selectedId = useFloorPlanStore((s) => s.selectedModuleId);
  const selectModule = useFloorPlanStore((s) => s.selectModule);
  const deselectModule = useFloorPlanStore((s) => s.deselectModule);

  const isSelected = selectedId === id;

  const handleClick = useCallback(() => {
    if (isSelected) {
      deselectModule();
    } else {
      selectModule(id);
    }
  }, [id, isSelected, selectModule, deselectModule]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  if (!mod) return null;

  const positionStyle = getModuleStyle(mod, room);
  const isLight = isLightModule(mod);
  const isSensor = isSensorModule(mod);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${mod.name} — ${mod.type.toLowerCase()}`}
      aria-pressed={isSelected}
      data-testid="module-node"
      data-module-type={mod.type}
      style={positionStyle}
      className={`group cursor-pointer rounded-lg transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary ${isSelected ? "module-selected z-10" : "z-0 hover:z-10"}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {isLight && <LightModuleNode module={mod} />}
      {isSensor && <SensorModuleNode module={mod} />}
      {!isLight && !isSensor && mod.type === ModuleType.FURNITURE && (
        <FurnitureModuleNode module={mod as FurnitureModule} />
      )}
    </div>
  );
}

export const ModuleNode = memo(ModuleNodeInner);
ModuleNode.displayName = "ModuleNode";
