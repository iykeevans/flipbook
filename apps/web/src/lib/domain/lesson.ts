import type { Ease, WalkthroughLine } from "./types";

export const LESSON_ID = "card-stagger";
export const EXERCISE_ID = "card-stagger-challenge";
export const LESSON_STEP_LABELS = ["1 · See it", "2 · Play", "3 · Code", "4 · Check"] as const;
export const PLAYGROUND_LIMITS = { duration: { min: 150, max: 1500, step: 10 }, stagger: { min: 0, max: 300, step: 10 } } as const;

const round = (n: number) => Math.round(n * 100) / 100;
const point = (x: number, y: number) => `${round(10 + x * 80)} ${round(90 - y * 80)}`;

/** SVG path of an easing curve drawn in a 100×100 box with a 10px inset. */
export function bezierPath([x1, y1, x2, y2]: Ease["bezier"]): string {
  return `M ${point(0, 0)} C ${point(x1, y1)}, ${point(x2, y2)}, ${point(1, 1)}`;
}

export function playgroundCss(durationMs: number, staggerMs: number, ease: Ease): string {
  return `.card {\n  transition: transform ${durationMs}ms ${ease.css};\n  transition-delay: calc(var(--i) * ${staggerMs}ms);\n}`;
}

/** Index of the walkthrough entry that explains `line`, or -1 for lines without one. */
export function walkthroughIndex(walkthrough: WalkthroughLine[], line: number): number {
  return walkthrough.findIndex((w) => w.line === line);
}
