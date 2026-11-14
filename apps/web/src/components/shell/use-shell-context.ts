"use client";

import { usePathname } from "next/navigation";
import { levelProgress } from "@/lib/domain/levels";
import { latestVersion } from "@/lib/domain/versions";
import { parseRoute, SCREEN_TITLES, showsSidebar } from "@/lib/routes";
import { useAppStore } from "@/lib/store/app-store";

/** Everything the chrome needs, derived from the URL and the store. */
export function useShellContext() {
  const pathname = usePathname() ?? "/";
  const route = parseRoute(pathname);
  const projectId = route.kind === "project" ? route.projectId : null;
  const project = useAppStore((s) => (projectId ? s.projects.find((p) => p.id === projectId) : undefined));
  const versions = useAppStore((s) => (projectId ? s.cache[projectId]?.versions : undefined));
  const progress = useAppStore((s) => s.progress);
  const settings = useAppStore((s) => s.settings);
  const user = useAppStore((s) => s.user);

  const screenTitle =
    route.kind === "workspace" ? SCREEN_TITLES[route.screen] : route.kind === "new" ? SCREEN_TITLES.new : route.kind === "project" ? SCREEN_TITLES[route.screen] : "Not found";
  const crumb = route.kind === "project" ? (project ? `${project.name} / ${screenTitle}` : "Not found") : screenTitle;

  return {
    route,
    project,
    crumb,
    sidebar: showsSidebar(route) && (route.kind !== "project" || !!project),
    learnedCount: progress?.learned.length ?? 0,
    level: levelProgress(progress?.xp ?? 0),
    version: versions ? latestVersion(versions) : null,
    showXp: settings.showXp,
    streak: user?.streakDays ?? 0,
  };
}

export type ShellContext = ReturnType<typeof useShellContext>;
