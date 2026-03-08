// Manages a Supabase Realtime channel for postgres_changes on the `modules`
// table and routes incoming UPDATEs to the appropriate Zustand store action.
//
// Routing logic:
//   SENSOR modules  → updateSensorValue  (triggers Framer Motion value pulse)
//   All other types → patchModule        (keeps UI in sync across clients)
//
// Store actions are accessed via getState() — never reactive subscriptions —
// so this hook adds zero unnecessary re-renders to the component tree.

import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { useFloorPlanStore } from "@/hooks/useFloorPlanStore";
import { ModuleType } from "@/lib/types";
import {
  toModulePatch,
  getSensorValue,
  type ModuleRow,
} from "@/lib/supabase/realtime-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RealtimeStatus =
  | "CONNECTING"
  | "SUBSCRIBED"
  | "CHANNEL_ERROR"
  | "TIMED_OUT"
  | "CLOSED";

// ─── Event handler ────────────────────────────────────────────────────────────

function handleModuleUpdate(row: ModuleRow, roomId: string): void {
  // Client-side room filter — avoids relying on camelCase column names in
  // Supabase's server-side filter expressions (potential quoting edge case).
  if (row.roomId !== roomId) return;

  const { updateSensorValue, patchModule } = useFloorPlanStore.getState();

  if (row.type === ModuleType.SENSOR) {
    const value = getSensorValue(row.properties);
    if (value !== null) updateSensorValue(row.id, value);
  } else {
    patchModule(row.id, toModulePatch(row));
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Subscribes to Supabase Realtime for UPDATE events on the given `roomId`.
 * Pass `null` to defer channel creation (e.g. while the store is hydrating).
 * The channel is torn down and recreated whenever `roomId` changes.
 */
export function useRealtimeModules(roomId: string | null): {
  status: RealtimeStatus;
} {
  const [status, setStatus] = useState<RealtimeStatus>("CONNECTING");
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!roomId) return;

    channelRef.current = supabase
      .channel(`modules:room:${roomId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "modules" },
        (payload) => handleModuleUpdate(payload.new as ModuleRow, roomId),
      )
      .subscribe((s) => setStatus(s as RealtimeStatus));

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [roomId]);

  return { status };
}
