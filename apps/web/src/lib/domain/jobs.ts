import type { Job, JobSnapshot } from "./types";

export function jobProgress(job: Job, now: number): number {
  const elapsed = Math.max(0, now - Date.parse(job.startedAt));
  return Math.min(100, job.startProgress + Math.floor(elapsed / job.tickMs) * job.step);
}

export function jobSnapshot(job: Job, now: number): JobSnapshot {
  const progress = jobProgress(job, now);
  return {
    id: job.id,
    kind: job.kind,
    projectId: job.projectId,
    progress,
    status: progress >= 100 ? "done" : "running",
    ...(job.meta ? { meta: job.meta } : {}),
  };
}

/** Deploy log lines revealed so far: one more line every 30%. */
export function visibleLogLines(lines: string[], progress: number): string[] {
  return lines.slice(0, 1 + Math.floor(progress / 30));
}
