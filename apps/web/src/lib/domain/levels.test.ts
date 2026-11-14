import { isUnlocked, levelOf, levelProgress } from "./levels";

describe("levelOf", () => {
  it.each([
    [0, 4],
    [1240, 4],
    [1599, 4],
    [1600, 5],
    [2399, 5],
    [2400, 6],
    [9999, 6],
  ])("xp %i is level %i", (xp, level) => {
    expect(levelOf(xp).level).toBe(level);
  });
});

describe("levelProgress", () => {
  it("reports progress towards the next threshold", () => {
    const p = levelProgress(1240);
    expect(p).toMatchObject({ level: 4, name: "Tweener", minXp: 1000, nextXp: 1600, pct: 40 });
    expect(p.nextMessage).toBe("Next: Level 5 · Choreographer unlocks scroll-linked lessons");
  });

  it("clamps the bar past the top level", () => {
    expect(levelProgress(5000).pct).toBe(100);
    expect(levelProgress(1600).nextMessage).toBe("Next: Level 6 · Motion Director unlocks springs");
  });
});

describe("isUnlocked", () => {
  it("gates animations by level", () => {
    expect(isUnlocked(null, 0)).toBe(true);
    expect(isUnlocked(5, 1240)).toBe(false);
    expect(isUnlocked(5, 1600)).toBe(true);
  });
});
