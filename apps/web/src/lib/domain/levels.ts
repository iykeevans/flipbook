import { LEVELS } from "./constants";
import type { Level } from "./types";

export function levelOf(xp: number): Level {
  return LEVELS.find((l) => xp < l.nextXp) ?? LEVELS[LEVELS.length - 1]!;
}

export interface LevelProgress extends Level {
  xp: number;
  /** Progress towards `nextXp`, clamped to 0–100. */
  pct: number;
  nextMessage: string;
}

export function levelProgress(xp: number): LevelProgress {
  const lvl = levelOf(xp);
  const raw = Math.round(((xp - lvl.minXp) / (lvl.nextXp - lvl.minXp)) * 100);
  return { ...lvl, xp, pct: Math.max(0, Math.min(100, raw)), nextMessage: nextLevelMessage(lvl.level) };
}

export function nextLevelMessage(level: number): string {
  if (level <= 4) return "Next: Level 5 · Choreographer unlocks scroll-linked lessons";
  if (level === 5) return "Next: Level 6 · Motion Director unlocks springs";
  return "Top level for now. More lessons are on the way.";
}

export function isUnlocked(unlockLevel: number | null, xp: number): boolean {
  return unlockLevel === null || levelOf(xp).level >= unlockLevel;
}
