import type { Ease, Level, StackId } from "./types";

/** Brand accents. Mirrors the CSS tokens in `app/globals.css` for values computed in TS. */
export const COLORS = {
  mint: "oklch(0.78 0.14 160)",
  orange: "oklch(0.72 0.17 50)",
  lilac: "oklch(0.78 0.13 290)",
  yellow: "oklch(0.82 0.15 85)",
  red: "oklch(0.7 0.18 30)",
  neutral: "#8a8a84",
  fg: "#ededea",
} as const;

export const EASES: Ease[] = [
  { label: "linear", css: "linear", bezier: [0, 0, 1, 1], score: 45 },
  { label: "ease-out", css: "cubic-bezier(0,0,.2,1)", bezier: [0, 0, 0.2, 1], score: 100 },
  { label: "ease-in", css: "cubic-bezier(.4,0,1,1)", bezier: [0.4, 0, 1, 1], score: 30 },
  { label: "overshoot", css: "cubic-bezier(.34,1.56,.64,1)", bezier: [0.34, 1.56, 0.64, 1], score: 65 },
];

export const LEVELS: Level[] = [
  { level: 4, name: "Tweener", minXp: 1000, nextXp: 1600 },
  { level: 5, name: "Choreographer", minXp: 1600, nextXp: 2400 },
  { level: 6, name: "Motion Director", minXp: 2400, nextXp: 3400 },
];

/** Concept unlocked when reaching a level; shown in the level-up toast. */
export const LEVEL_UNLOCKS: Record<number, string> = { 5: "Scroll-linked", 6: "Springs" };

export const TOTAL_ANIMATIONS = 5;
export const RECORDING_SECONDS = 48;
export const STREAK_DAYS = 7;

export const MAX_RECORDING_BYTES = 250 * 1024 * 1024;
export const ACCEPTED_RECORDING_TYPES = ["video/mp4", "video/quicktime", "video/webm"] as const;
export const ACCEPTED_RECORDING_EXTENSIONS = [".mp4", ".mov", ".webm"] as const;

export const OUTPUT_CHOICES = ["HTML/CSS", "React", "Tailwind", "Framer Motion", "GSAP", "Web Animations API"] as const;
export const DEFAULT_OUTPUTS = ["React", "Tailwind", "Framer Motion"];

export const DEFAULT_OUTPUT_OPTIONS = ["React · Tailwind · Framer Motion", "HTML/CSS", "React · GSAP"] as const;
export const LESSON_LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"] as const;
export const DAILY_GOAL_OPTIONS = ["50 XP", "100 XP", "200 XP"] as const;
export const DELETE_RECORDING_OPTIONS = ["After 30 days", "After 7 days", "Immediately", "Never"] as const;

export const STACKS: { id: StackId; label: string }[] = [
  { id: "Framer Motion", label: "Framer" },
  { id: "GSAP", label: "GSAP" },
  { id: "Web Animations API", label: "WAAPI" },
  { id: "HTML/CSS", label: "HTML/CSS" },
];

export const VIEWPORTS = [
  { label: "Desktop", size: "1440 × 900", width: "100%", columns: 3 },
  { label: "Tablet", size: "768 × 1024", width: "72%", columns: 3 },
  { label: "Mobile", size: "390 × 844", width: "46%", columns: 1 },
] as const;

export const XP_REWARDS = {
  fixMatch: 30,
  lesson: 60,
  challenge: 200,
  hintPenalty: 20,
  firstShip: 80,
} as const;

export const CHALLENGE_PASS_SCORE = 90;
export const SCORE_ROW_PASS = 85;
export const DURATION_LIMITS = { min: 100, max: 1500, step: 20 } as const;
