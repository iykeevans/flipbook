"use client";

import { notFound } from "next/navigation";
import { createContext, useContext, type ReactNode } from "react";
import type { Project } from "@/lib/domain/types";
import { useAppStore } from "@/lib/store/app-store";

const ProjectContext = createContext<Project | null>(null);

/**
 * Resolves the URL's project from the store. Unknown ids go to Next's not-found boundary.
 * Projects live in client storage, so this runs after hydration and the response status stays 200.
 */
export function ProjectGate({ projectId, children }: { projectId: string; children: ReactNode }) {
  const project = useAppStore((s) => s.projects.find((p) => p.id === projectId));
  if (!project) notFound();
  return <ProjectContext.Provider value={project}>{children}</ProjectContext.Provider>;
}

/** The current project. Only valid under a project route, inside ProjectGate. */
export function useProject(): Project {
  const project = useContext(ProjectContext);
  if (!project) throw new Error("useProject must be used inside ProjectGate");
  return project;
}
