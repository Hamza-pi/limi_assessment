// Utility functions for mapping logical room coordinates to CSS percentages.
// All floor plan components use percentage-based positioning so the canvas
// scales responsively at any viewport width.

import type { CSSProperties } from "react";
import type { Module, Room } from "@/lib/types";

// ─── Position ────────────────────────────────────────────────────────────────

/**
 * Converts a logical coordinate + dimension to a CSS percentage string.
 * e.g. toPercent(200, 1200) → "16.6667%"
 */
export function toPercent(value: number, total: number): string {
  return `${(value / total) * 100}%`;
}

/**
 * Returns the absolute-position CSS style for a module on the floor plan canvas.
 * Uses percentage values so the layout is resolution-independent.
 */
export function getModuleStyle(module: Module, room: Room): CSSProperties {
  return {
    position: "absolute",
    left: toPercent(module.x, room.width),
    top: toPercent(module.y, room.height),
    width: toPercent(module.width, room.width),
    height: toPercent(module.height, room.height),
    transform: module.rotation ? `rotate(${module.rotation}deg)` : undefined,
  };
}

// ─── Canvas aspect ratio ──────────────────────────────────────────────────────

/**
 * Returns the CSS aspect-ratio value string for a given room.
 * e.g. "1200 / 900"
 */
export function getRoomAspectRatio(room: Room): string {
  return `${room.width} / ${room.height}`;
}
