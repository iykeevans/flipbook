import { DURATION_LIMITS } from "./constants";
import type { InspectorState } from "./types";

export function clampDuration(ms: number): number {
  return Math.max(DURATION_LIMITS.min, Math.min(DURATION_LIMITS.max, ms));
}

export function isDurationDirty(state: InspectorState, animationId: string): boolean {
  const cur = state.durations[animationId];
  return cur !== undefined && cur !== state.saved[animationId];
}
