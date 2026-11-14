import { challengeXp, computeScore, isPassingScore, nextAttemptCount, scoreTone, worstRow } from "./scoring";

const values = (s: ReturnType<typeof computeScore>) => s.rows.map((r) => r.value);

describe("computeScore", () => {
  it("scores the target parameters 100", () => {
    const s = computeScore({ durationMs: 480, staggerMs: 90, easeIndex: 1 });
    expect(values(s)).toEqual([100, 100, 100, 100]);
    expect(s.total).toBe(100);
  });

  it("matches the prototype for the starting attempt (300ms, 0ms, ease-in)", () => {
    const s = computeScore({ durationMs: 300, staggerMs: 0, easeIndex: 2 });
    expect(s.rows.map((r) => r.label)).toEqual(["Distance", "Duration", "Stagger", "Easing"]);
    expect(values(s)).toEqual([100, 55, 1, 30]);
    expect(s.total).toBe(47);
  });

  it("never goes below zero for far-off values", () => {
    const s = computeScore({ durationMs: 1500, staggerMs: 300, easeIndex: 0 });
    expect(values(s)).toEqual([100, 0, 0, 45]);
    expect(s.total).toBe(36);
  });

  it("uses each ease's fixed score", () => {
    expect(computeScore({ durationMs: 480, staggerMs: 90, easeIndex: 3 }).total).toBe(91);
    expect(computeScore({ durationMs: 480, staggerMs: 90, easeIndex: 0 }).total).toBe(86);
  });

  it("rejects an unknown ease", () => {
    expect(() => computeScore({ durationMs: 480, staggerMs: 90, easeIndex: 9 })).toThrow(RangeError);
  });
});

describe("challenge rules", () => {
  it("passes at 90 and above", () => {
    expect(isPassingScore(89)).toBe(false);
    expect(isPassingScore(90)).toBe(true);
  });

  it("grades the score colour", () => {
    expect(scoreTone(null)).toBe("none");
    expect(scoreTone(95)).toBe("pass");
    expect(scoreTone(70)).toBe("close");
    expect(scoreTone(69)).toBe("fail");
  });

  it("names the furthest-off adjustable row", () => {
    expect(worstRow(computeScore({ durationMs: 300, staggerMs: 0, easeIndex: 2 }))).toBe("Stagger");
    expect(worstRow(computeScore({ durationMs: 480, staggerMs: 90, easeIndex: 2 }))).toBe("Easing");
  });

  it("deducts 20 XP when the hint was used", () => {
    expect(challengeXp(false)).toBe(200);
    expect(challengeXp(true)).toBe(180);
  });

  it("only advances the attempt counter after a scored attempt", () => {
    expect(nextAttemptCount(1, false)).toBe(1);
    expect(nextAttemptCount(1, true)).toBe(2);
  });
});
