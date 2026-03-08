"use server";

// Server Actions for module CRUD operations.
// All mutations go through Prisma (not the Supabase JS client directly).
// Supabase Realtime will broadcast DB changes to subscribed clients automatically.

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ModuleStatus, ModuleType, type ModulePatch } from "@/lib/types";
import { moduleFormSchema } from "@/lib/schemas/module-form";
import type { z } from "zod";

// ─── Shared result type ───────────────────────────────────────────────────────

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Toggle a single module ON / OFF ─────────────────────────────────────────

export async function toggleModuleAction(
  id: string,
  nextStatus: ModuleStatus,
): Promise<ActionResult> {
  try {
    await prisma.module.update({
      where: { id },
      data: { status: nextStatus },
    });
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (err) {
    console.error(`[toggleModuleAction] id=${id}`, err);
    return { success: false, error: "Failed to update module status" };
  }
}

// ─── Toggle ALL lights in a room ON / OFF ─────────────────────────────────────

export async function toggleAllLightsAction(
  roomId: string,
  nextStatus: ModuleStatus,
): Promise<ActionResult> {
  try {
    await prisma.module.updateMany({
      where: { roomId, type: ModuleType.LIGHT },
      data: { status: nextStatus },
    });
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (err) {
    console.error(`[toggleAllLightsAction] roomId=${roomId}`, err);
    return { success: false, error: "Failed to toggle all lights" };
  }
}

// ─── Update module config from the configurator form ─────────────────────────

type UpdateInput = z.infer<typeof moduleFormSchema>;

export async function updateModuleAction(
  id: string,
  input: UpdateInput,
): Promise<ActionResult<ModulePatch>> {
  const parsed = moduleFormSchema.safeParse(input);

  if (!parsed.success) {
    const firstMessage = parsed.error.issues[0]?.message ?? "Invalid input";
    return { success: false, error: firstMessage };
  }

  const { name, uuid, powerLimit, status, metadata, intensity, color } =
    parsed.data;

  // Build type-specific properties patch for LIGHT modules
  const propertiesPatch =
    intensity !== undefined && color !== undefined
      ? { intensity, color }
      : undefined;

  try {
    // Fetch current properties so we can merge (JSON field is replaced, not patched)
    const current = await prisma.module.findUnique({
      where: { id },
      select: { properties: true },
    });

    const mergedProperties = propertiesPatch
      ? { ...((current?.properties as object) ?? {}), ...propertiesPatch }
      : undefined;

    const updated = await prisma.module.update({
      where: { id },
      data: {
        name,
        uuid,
        powerLimit,
        status,
        metadata: JSON.parse(metadata ?? "{}"),
        ...(mergedProperties && { properties: mergedProperties }),
      },
    });

    revalidatePath("/");

    return {
      success: true,
      data: {
        name: updated.name,
        uuid: updated.uuid,
        powerLimit: updated.powerLimit,
        status: updated.status as ModuleStatus,
        metadata: updated.metadata as Record<string, unknown>,
      },
    };
  } catch (err) {
    console.error(`[updateModuleAction] id=${id}`, err);
    return { success: false, error: "Failed to update module" };
  }
}
