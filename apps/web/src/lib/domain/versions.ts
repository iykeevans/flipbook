import { COLORS } from "./constants";
import type { ProjectVersion, VersionKind } from "./types";

export interface NewVersion {
  kind: VersionKind;
  description: string;
  diff: string[];
  color: string;
}

export function latestVersion(list: ProjectVersion[]): number {
  return list.reduce((max, v) => Math.max(max, v.v), 0);
}

/** Prepends a version numbered one above the highest existing one. */
export function pushVersion(list: ProjectVersion[], input: NewVersion, now: Date): ProjectVersion[] {
  const version: ProjectVersion = { v: latestVersion(list) + 1, createdAt: now.toISOString(), ...input };
  return [version, ...list];
}

/**
 * The version "Restore" acts on for a selection in the newest-first list:
 * selecting the newest restores the one before it; selecting an older one restores that one.
 */
export function restoreCandidate(list: ProjectVersion[], selectedIndex: number): ProjectVersion | null {
  if (list.length === 0) return null;
  const i = Math.max(0, Math.min(selectedIndex, list.length - 1));
  return (i === 0 ? list[1] : list[i]) ?? null;
}

/** Restoring never overwrites history: it appends a new "Restored" version. */
export function restoreVersion(list: ProjectVersion[], targetV: number, now: Date): ProjectVersion[] {
  if (!list.some((v) => v.v === targetV)) throw new RangeError(`Version v${targetV} does not exist`);
  return pushVersion(
    list,
    { kind: "Restored", description: `Back to v${targetV}`, diff: [`= contents of v${targetV}`], color: COLORS.neutral },
    now,
  );
}

export function comparePair(list: ProjectVersion[], selectedIndex: number): { selected: ProjectVersion; previous: ProjectVersion | null } | null {
  if (list.length === 0) return null;
  const i = Math.max(0, Math.min(selectedIndex, list.length - 1));
  return { selected: list[i]!, previous: list[i + 1] ?? null };
}

export type DiffTone = "removed" | "added" | "context";

export function diffTone(line: string): DiffTone {
  if (line.startsWith("-")) return "removed";
  if (line.startsWith("+")) return "added";
  return "context";
}
