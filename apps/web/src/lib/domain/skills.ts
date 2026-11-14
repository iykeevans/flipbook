import type { SkillTile } from "./types";

export function skillTiles(input: { learned: string[]; challengePassed: boolean; level: number }): SkillTile[] {
  const { learned, challengePassed, level } = input;
  return [
    { name: "Transitions", status: "mastered", kind: "done" },
    { name: "Keyframes", status: "mastered", kind: "done" },
    challengePassed
      ? { name: "Easing", status: "mastered", kind: "done" }
      : { name: "Easing", status: "3 / 5 lessons", kind: "prog" },
    { name: "Stagger", status: learned.includes("stagger") ? "3 / 4 lessons" : "2 / 4 lessons", kind: "prog" },
    level >= 5
      ? { name: "Scroll-linked", status: "unlocked · lesson ready", kind: "prog" }
      : { name: "Scroll-linked", status: "seen in 2 recordings · Lv 5", kind: "seen" },
    { name: "Springs", status: "seen in 1 recording · Lv 6", kind: "seen" },
    { name: "Layout / FLIP", status: "locked · Lv 6", kind: "lock" },
    { name: "SVG motion", status: "locked · Lv 7", kind: "lock" },
  ];
}
