import { COLORS } from "./constants";

export type StageState = "queued" | "active" | "done";

export interface ProcessingStage {
  label: string;
  state: StageState;
  status: string;
}

export function animationsFound(progress: number): number {
  return Math.min(5, Math.floor(Math.max(0, progress - 50) / 8));
}

export function processingStages(progress: number): ProcessingStage[] {
  const stages: [string, number][] = [
    ["Layout · 6 sections, 12-col grid", 25],
    ["Components · Navbar, Hero, Card ×3, Footer", 50],
    [`Animations · ${animationsFound(progress)} found`, 92],
    ["Type & color tokens", 100],
  ];
  return stages.map(([label, threshold], i) => {
    const prev = i ? stages[i - 1]![1] : 0;
    const done = progress >= threshold;
    const active = !done && progress >= prev;
    const state: StageState = done ? "done" : active ? "active" : "queued";
    const status = done ? "done" : active ? (i === 2 ? "tracking motion" : "reading") : "queued";
    return { label, state, status };
  });
}

export interface FrameState {
  visible: boolean;
  accent: string | null;
}

const FRAME_ACCENTS: Record<number, string> = { 0: COLORS.orange, 2: COLORS.mint, 5: COLORS.lilac };

export function processingFrames(progress: number): FrameState[] {
  return Array.from({ length: 8 }, (_, i) => {
    const visible = progress >= i * 12;
    return { visible, accent: visible ? (FRAME_ACCENTS[i] ?? null) : null };
  });
}
