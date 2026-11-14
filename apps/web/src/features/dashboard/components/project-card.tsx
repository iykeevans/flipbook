"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { COLORS } from "@/lib/domain/constants";
import { openAction, projectCardMeta, statusBadge } from "@/lib/domain/projects";
import type { LearningProgress, Project } from "@/lib/domain/types";
import { routes } from "@/lib/routes";

export function ProjectCard({
  project,
  latestVersion,
  progress,
  now,
  onStillProcessing,
}: {
  project: Project;
  latestVersion: number;
  progress: LearningProgress;
  now: number;
  onStillProcessing: (project: Project) => void;
}) {
  const badge = statusBadge(project);
  const action = openAction(project);
  const body: ReactNode = (
    <>
      <span className="relative block h-[140px] overflow-hidden rounded-[10px] bg-stripe outline-edge-4 group-hover:outline-[1.5px]">
        <span className="absolute top-2 left-2 rounded-[5px] px-[7px] py-[3px] font-mono text-[10px] font-semibold text-ink" style={{ background: badge.color }}>
          {badge.label}
        </span>
        {project.status === "processing" && (
          <span className="absolute inset-x-0 bottom-0 h-1 bg-line">
            <span className="block h-full transition-[width] duration-600" style={{ width: `${project.progress}%`, background: COLORS.orange }} />
          </span>
        )}
      </span>
      <b className="text-[15px] text-fg">{project.name}</b>
      <span className="font-mono text-xs text-fg-dim">{projectCardMeta(project, { latestVersion, progress, now })}</span>
    </>
  );
  const cls = "group flex flex-col gap-[7px] rounded-[10px] text-left no-underline";
  if (action === "still-processing") {
    return (
      <button type="button" className={cls} onClick={() => onStillProcessing(project)} data-testid={`project-${project.id}`}>
        {body}
      </button>
    );
  }
  return (
    <Link href={routes.project(project.id, action)} className={cls} data-testid={`project-${project.id}`}>
      {body}
    </Link>
  );
}
