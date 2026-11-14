import { EASES } from "./constants";
import { bezierPath, playgroundCss, walkthroughIndex } from "./lesson";

describe("bezierPath", () => {
  it("maps the ease-out curve into the 100×100 box", () => {
    expect(bezierPath(EASES[1]!.bezier)).toBe("M 10 90 C 10 90, 26 10, 90 10");
  });

  it("keeps overshoot control points above the box without float noise", () => {
    expect(bezierPath(EASES[3]!.bezier)).toBe("M 10 90 C 37.2 -34.8, 61.2 10, 90 10");
  });
});

describe("playgroundCss", () => {
  it("reflects the chosen duration, stagger and easing", () => {
    expect(playgroundCss(600, 0, EASES[0]!)).toBe(".card {\n  transition: transform 600ms linear;\n  transition-delay: calc(var(--i) * 0ms);\n}");
  });
});

describe("walkthroughIndex", () => {
  const walk = [1, 4, 6, 8].map((line) => ({ line, head: "", text: ["", "", ""] as [string, string, string] }));

  it("finds explained lines and ignores the rest", () => {
    expect(walkthroughIndex(walk, 4)).toBe(1);
    expect(walkthroughIndex(walk, 0)).toBe(-1);
  });
});
