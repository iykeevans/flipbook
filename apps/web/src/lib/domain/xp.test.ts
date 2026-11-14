import { CHALLENGE_START } from "./scoring";
import type { LearningProgress } from "./types";
import { awardToast, awardXp } from "./xp";

const progress = (xp: number, awardedKeys: string[] = []): LearningProgress => ({
  xp,
  learned: [],
  lessonStep: 1,
  challenge: { attempts: 1, lastScore: null, bestScore: null, hintUsed: false, passed: false, params: CHALLENGE_START },
  awardedKeys,
});

describe("awardXp", () => {
  it("adds XP and records the key", () => {
    const { progress: next, award } = awardXp(progress(1240), { amount: 30, reason: "Matched the recording", key: "fix:a" });
    expect(next.xp).toBe(1270);
    expect(next.awardedKeys).toEqual(["fix:a"]);
    expect(award).toMatchObject({ awarded: true, amount: 30, leveledUp: false, level: 4 });
    expect(awardToast(award)).toEqual({ text: "+30 XP", sub: "Matched the recording", levelUp: false });
  });

  it("grants a key only once", () => {
    const first = awardXp(progress(1240), { amount: 60, reason: "Lesson", key: "lesson:x" });
    const again = awardXp(first.progress, { amount: 60, reason: "Lesson", key: "lesson:x" });
    expect(again.progress.xp).toBe(1300);
    expect(again.award.awarded).toBe(false);
    expect(again.progress).toBe(first.progress);
  });

  it("detects a level-up and names the unlock", () => {
    const { award } = awardXp(progress(1500), { amount: 200, reason: "Challenge passed · Easing badge", key: "c" });
    expect(award).toMatchObject({ leveledUp: true, level: 5, levelName: "Choreographer", unlocked: "Scroll-linked", xp: 1700 });
    expect(awardToast(award)).toEqual({
      text: "Level up! Lv 5 · Choreographer",
      sub: "Challenge passed · Easing badge · unlocked Scroll-linked",
      levelUp: true,
    });
  });
});
