import { CHALLENGE_PASS_SCORE, EASES, SCORE_ROW_PASS, XP_REWARDS } from "./constants";
import type { ChallengeParams, ScoreResult, ScoreRow } from "./types";

export const CHALLENGE_TARGET: ChallengeParams = { durationMs: 480, staggerMs: 90, easeIndex: 1 };
export const CHALLENGE_START: ChallengeParams = { durationMs: 300, staggerMs: 0, easeIndex: 2 };

/** Same formula as the approved prototype's `computeScore`; do not "improve" it without product sign-off. */
export function computeScore(params: ChallengeParams): ScoreResult {
  const ease = EASES[params.easeIndex];
  if (!ease) throw new RangeError(`Unknown ease index ${params.easeIndex}`);
  const rows: ScoreRow[] = [
    { label: "Distance", value: 100 },
    { label: "Duration", value: Math.max(0, Math.round(100 - Math.abs(params.durationMs - 480) / 4)) },
    { label: "Stagger", value: Math.max(0, Math.round(100 - Math.abs(params.staggerMs - 90) * 1.1)) },
    { label: "Easing", value: ease.score },
  ];
  return { rows, total: Math.round(rows.reduce((s, r) => s + r.value, 0) / rows.length) };
}

export function isPassingScore(total: number): boolean {
  return total >= CHALLENGE_PASS_SCORE;
}

export function isRowPassing(value: number): boolean {
  return value >= SCORE_ROW_PASS;
}

export type ScoreTone = "none" | "pass" | "close" | "fail";

export function scoreTone(total: number | null): ScoreTone {
  if (total === null) return "none";
  if (total >= CHALLENGE_PASS_SCORE) return "pass";
  if (total >= 70) return "close";
  return "fail";
}

/** The adjustable row (not Distance) furthest from the target. */
export function worstRow(score: ScoreResult): ScoreRow["label"] {
  const adjustable = score.rows.slice(1);
  return [...adjustable].sort((a, b) => a.value - b.value)[0]!.label;
}

export function challengeXp(hintUsed: boolean): number {
  return hintUsed ? XP_REWARDS.challenge - XP_REWARDS.hintPenalty : XP_REWARDS.challenge;
}

/** The counter starts at 1 and only advances on a resubmission after a scored attempt. */
export function nextAttemptCount(attempts: number, hadScore: boolean): number {
  return attempts + (hadScore ? 1 : 0);
}
