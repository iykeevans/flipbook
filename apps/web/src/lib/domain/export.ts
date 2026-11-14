import type { ExportOptions, ExportTarget } from "./types";

export const EXPORT_TARGETS: { id: ExportTarget; label: string; sub: string }[] = [
  { id: "deploy", label: "Deploy", sub: "Live URL in about 30s" },
  { id: "github", label: "Push to GitHub", sub: "New repo or branch" },
  { id: "zip", label: "Download .zip", sub: "Vite project" },
];

export const EXPORT_OPTION_LABELS: Record<keyof ExportOptions, string> = {
  respectReducedMotion: "Respect prefers-reduced-motion",
  lessonNotes: "Add lesson notes as code comments",
  placeholderImages: "Replace recorded images with placeholders",
};

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = { respectReducedMotion: true, lessonNotes: true, placeholderImages: false };

export function exportActionLabel(target: ExportTarget, projectName: string): string {
  if (target === "deploy") return `Deploy ${projectName}`;
  return EXPORT_TARGETS.find((t) => t.id === target)!.label;
}

export function stackSummary(outputs: string[]): string {
  return outputs.length ? outputs.join(" · ") : "HTML/CSS";
}

/** Idempotency key for the first-ship XP: one award per project, whatever the target. */
export function shipAwardKey(projectId: string): string {
  return `ship:${projectId}`;
}
