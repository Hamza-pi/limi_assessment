"use client";

// Master controls bar displayed above the floor plan.
// Contains the room name, module count badges, and the Toggle All Lights switch.
// Subscribes only to the specific store slices it needs (room, counts, toggle state)
// to prevent unnecessary re-renders when individual modules change.

import { Lightbulb, Thermometer, Sofa } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useShallow } from "zustand/react/shallow";
import { useFloorPlanStore } from "@/hooks/useFloorPlanStore";
import { selectModuleCounts } from "@/hooks/useFloorPlanSelectors";
import { useModuleActions } from "@/hooks/useModuleActions";

export function MasterControls() {
  const room = useFloorPlanStore((s) => s.room);
  const isToggleAllOn = useFloorPlanStore((s) => s.isToggleAllOn);
  const counts = useFloorPlanStore(useShallow(selectModuleCounts));
  const { toggleAllLights } = useModuleActions();

  if (!room) return null;

  return (
    <header
      aria-label="Floor plan master controls"
      className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card px-4 py-3"
    >
      {/* Room name */}
      <h1 className="text-sm font-semibold tracking-wide text-foreground">
        {room.name}
      </h1>

      <Separator orientation="vertical" className="h-5" />

      {/* Module count badges */}
      <div className="flex items-center gap-2" aria-label="Module counts">
        <Badge
          variant="outline"
          className="gap-1.5 border-primary/30 text-primary"
        >
          <Lightbulb aria-hidden="true" className="size-3" />
          {counts.lights} lights
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          <Thermometer aria-hidden="true" className="size-3" />
          {counts.sensors} sensors
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          <Sofa aria-hidden="true" className="size-3" />
          {counts.furniture} furniture
        </Badge>
      </div>

      <Separator orientation="vertical" className="h-5" />

      {/* Toggle All Lights */}
      <div className="ml-auto flex items-center gap-2">
        <Label
          htmlFor="toggle-all-lights"
          className="cursor-pointer text-sm text-muted-foreground"
        >
          All Lights
        </Label>
        <Switch
          id="toggle-all-lights"
          data-testid="toggle-all-switch"
          checked={isToggleAllOn}
          onCheckedChange={toggleAllLights}
          aria-label={
            isToggleAllOn ? "Turn all lights off" : "Turn all lights on"
          }
        />
      </div>
    </header>
  );
}
