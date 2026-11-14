import { LEVEL_UNLOCKS } from "./constants";
import { levelOf } from "./levels";
import type { LearningProgress, XpAward } from "./types";

export interface AwardInput {
  amount: number;
  reason: string;
  /** Awards with the same key are granted once. */
  key: string;
}

export function awardXp(progress: LearningProgress, input: AwardInput): { progress: LearningProgress; award: XpAward } {
  const before = levelOf(progress.xp);
  if (progress.awardedKeys.includes(input.key)) {
    return {
      progress,
      award: {
        awarded: false,
        amount: 0,
        reason: input.reason,
        xp: progress.xp,
        leveledUp: false,
        level: before.level,
        levelName: before.name,
        unlocked: null,
      },
    };
  }
  const xp = progress.xp + input.amount;
  const after = levelOf(xp);
  const leveledUp = after.level > before.level;
  return {
    progress: { ...progress, xp, awardedKeys: [...progress.awardedKeys, input.key] },
    award: {
      awarded: true,
      amount: input.amount,
      reason: input.reason,
      xp,
      leveledUp,
      level: after.level,
      levelName: after.name,
      unlocked: leveledUp ? (LEVEL_UNLOCKS[after.level] ?? "new challenges") : null,
    },
  };
}

export function awardToast(award: XpAward): { text: string; sub: string; levelUp: boolean } {
  if (award.leveledUp) {
    return {
      text: `Level up! Lv ${award.level} · ${award.levelName}`,
      sub: `${award.reason} · unlocked ${award.unlocked}`,
      levelUp: true,
    };
  }
  return { text: `+${award.amount} XP`, sub: award.reason, levelUp: false };
}
