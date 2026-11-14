import { COLORS, TOTAL_ANIMATIONS } from "./constants";
import { formatRelative } from "./time";
import type { LearningProgress, Project } from "./types";

export type DashboardFilter = "All" | "Processing" | "Ready" | "Needs review";
export const DASHBOARD_FILTERS: DashboardFilter[] = ["All", "Processing", "Ready", "Needs review"];

export function statusLabel(project: Project): Exclude<DashboardFilter, "All"> {
  if (project.status === "processing") return "Processing";
  if (project.status === "needs_review") return "Needs review";
  return "Ready";
}

export function matchesFilter(project: Project, filter: DashboardFilter): boolean {
  return filter === "All" || statusLabel(project) === filter;
}

export function statusBadge(project: Project): { label: string; color: string } {
  if (project.status === "processing") return { label: `ANALYSING ${Math.round(project.progress)}%`, color: COLORS.orange };
  if (project.status === "needs_review") return { label: "NEEDS REVIEW", color: COLORS.yellow };
  return { label: "READY", color: COLORS.mint };
}

export function learnedSummary(project: Project, progress: LearningProgress): { learned: number; total: number } {
  if (project.source.kind === "sample") {
    return { learned: project.source.lessonsLearned, total: project.source.lessonsTotal };
  }
  return { learned: progress.learned.length, total: TOTAL_ANIMATIONS };
}

export function projectCardMeta(
  project: Project,
  ctx: { latestVersion: number; progress: LearningProgress; now: number },
): string {
  if (project.status === "processing") return `created ${formatRelative(project.createdAt, ctx.now)}`;
  if (project.status === "needs_review") return "analysis ready · not generated";
  const { learned, total } = learnedSummary(project, ctx.progress);
  if (project.source.kind === "sample") return `from sample · ${learned}/${total} learned`;
  return `edited ${formatRelative(project.updatedAt, ctx.now)} · v${ctx.latestVersion} · ${learned}/${total} learned`;
}

export type OpenAction = "overview" | "review" | "still-processing";

export function openAction(project: Project): OpenAction {
  if (project.status === "ready") return "overview";
  if (project.status === "needs_review") return "review";
  return "still-processing";
}
