import { formatTimestamp, heroOpacity, matchPercent, miniCardFrames, parseTimeParam, timeFromPointer } from "./match";

describe("overview match", () => {
  it("is 94% until fixed, then 99%", () => {
    expect(matchPercent(false)).toBe(94);
    expect(matchPercent(true)).toBe(99);
  });

  it("flags the late first card only while unfixed", () => {
    const before = miniCardFrames(12, false);
    expect(before[0]!.flagged).toBe(true);
    expect(before[0]!.opacity).toBeLessThan(before[1]!.opacity);
    const after = miniCardFrames(12, true);
    expect(after.every((c) => !c.flagged)).toBe(true);
    expect(after[0]!.opacity).toBeGreaterThan(after[1]!.opacity);
  });

  it("shows nothing before the reveal and everything after it", () => {
    expect(miniCardFrames(0, true).map((c) => c.opacity)).toEqual([0, 0, 0]);
    expect(miniCardFrames(48, false).map((c) => [c.opacity, Math.round(c.y)])).toEqual([[1, 8], [1, 0], [1, 0]]);
  });

  it("fades the hero in from 0.15", () => {
    expect(heroOpacity(0)).toBe(0.15);
    expect(heroOpacity(5)).toBe(1);
  });

  it("maps scrub positions and formats time", () => {
    expect(timeFromPointer(150, 100, 200)).toBe(12);
    expect(timeFromPointer(-50, 0, 200)).toBe(0);
    expect(timeFromPointer(500, 0, 200)).toBe(48);
    expect(formatTimestamp(12.7)).toBe("00:12");
    expect(formatTimestamp(65)).toBe("01:05");
  });

  it("parses the ?t= parameter", () => {
    expect(parseTimeParam("20")).toBe(20);
    expect(parseTimeParam("99")).toBe(48);
    expect(parseTimeParam("abc")).toBeNull();
    expect(parseTimeParam(null)).toBeNull();
  });
});
