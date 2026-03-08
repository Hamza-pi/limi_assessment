"use client";

// RealtimeProvider — zero-DOM client boundary that boots the Supabase
// Realtime subscription for the active room.
//
// The roomId is sourced from Zustand, so the channel is automatically
// created once StoreInitializer has finished populating the store (roomId
// transitions from null → actual ID after the first hydration effect).
// Children are rendered unconditionally — no loading state needed.

import type { ReactNode } from "react";
import { useFloorPlanStore } from "@/hooks/useFloorPlanStore";
import { useRealtimeModules } from "@/hooks/useRealtimeModules";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RealtimeProviderProps {
  children: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  // Primitive selector — returns string | null, equality check is cheap
  const roomId = useFloorPlanStore((s) => s.room?.id ?? null);

  // Manages the channel lifecycle; roomId=null defers connection safely
  const { status } = useRealtimeModules(roomId);

  return (
    <>
      <div className="fixed bottom-2 right-2 z-50 rounded bg-black/80 px-2 py-1 font-mono text-xs text-green-400">
        Realtime: {status}
      </div>
      {children}
    </>
  );
}
