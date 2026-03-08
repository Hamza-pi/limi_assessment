"use client";

// Top-level configurator entry point.
// Opens as a shadcn Sheet (slide-over from the right) when a module is
// selected in the Zustand store. The `key` prop on ConfiguratorForm forces
// a full remount — resetting all field values — when the selected module changes.

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useFloorPlanStore } from "@/hooks/useFloorPlanStore";
import { selectSelectedModule } from "@/hooks/useFloorPlanSelectors";
import { ModuleHeader } from "./ModuleHeader";
import { ConfiguratorForm } from "./ConfiguratorForm";

// ─── Component ────────────────────────────────────────────────────────────────

export function ConfiguratorSheet() {
  const selectedModule = useFloorPlanStore(selectSelectedModule);
  const deselectModule = useFloorPlanStore((s) => s.deselectModule);

  const isOpen = !!selectedModule;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && deselectModule()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-y-auto sm:max-w-md"
        aria-label="Module configurator panel"
        data-testid="configurator-panel"
      >
        {selectedModule && (
          <>
            <SheetHeader>
              <SheetTitle>Configure Module</SheetTitle>
              <SheetDescription>
                Edit this module&apos;s settings. Changes are persisted
                immediately.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 flex flex-col gap-5">
              <ModuleHeader module={selectedModule} />

              {/*
               * key={selectedModule.id} forces ConfiguratorForm to remount
               * whenever a different module is selected — ensuring useForm
               * re-initialises with the new module's default values.
               */}
              <ConfiguratorForm
                key={selectedModule.id}
                module={selectedModule}
                onClose={deselectModule}
              />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
