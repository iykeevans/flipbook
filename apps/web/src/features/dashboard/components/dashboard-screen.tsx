"use client";

import { useEffect, useState } from "react";
import { ButtonLink, PageTitle, Segmented } from "@/components/ui";
import { DASHBOARD_FILTERS, matchesFilter, type DashboardFilter } from "@/lib/domain/projects";
import { greeting } from "@/lib/domain/time";
import type { Project } from "@/lib/domain/types";
import { latestVersion } from "@/lib/domain/versions";
import { routes } from "@/lib/routes";
import { useAppStore } from "@/lib/store/app-store";
import { ProjectCard } from "./project-card";

const POLL_MS = 900;
const LESSON_PROJECT = "studio-landing";

export function DashboardScreen() {
  const user = useAppStore((s) => s.user);
  const progress = useAppStore((s) => s.progress)!;
  const projects = useAppStore((s) => s.projects);
  const cache = useAppStore((s) => s.cache);
  const refreshProjects = useAppStore((s) => s.refreshProjects);
  const loadVersions = useAppStore((s) => s.loadVersions);
  const notify = useAppStore((s) => s.notify);
  const [filter, setFilter] = useState<DashboardFilter>("All");
  const [now, setNow] = useState(() => Date.now());

  const anyProcessing = projects.some((p) => p.status === "processing");
  useEffect(() => {
    if (!anyProcessing) return;
    const t = setInterval(() => {
      void refreshProjects();
      setNow(Date.now());
    }, POLL_MS);
    return () => clearInterval(t);
  }, [anyProcessing, refreshProjects]);

  const readyIds = projects.filter((p) => p.status === "ready" && !cache[p.id]?.versions).map((p) => p.id).join(",");
  useEffect(() => {
    for (const id of readyIds.split(",").filter(Boolean)) void loadVersions(id);
  }, [readyIds, loadVersions]);

  const stillProcessing = (p: Project) => notify("Still analysing", `${p.name} · ${Math.round(p.progress)}% · we'll flag it when it's ready`);
  const visible = projects.filter((p) => matchesFilter(p, filter));
  const showResume = !progress.learned.includes("stagger") && projects.some((p) => p.id === LESSON_PROJECT);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle>
          {greeting(new Date(now))}, {user?.name}
        </PageTitle>
        <ButtonLink href={routes.newProject} variant="primary">
          + New project
        </ButtonLink>
      </div>

      {showResume && (
        <section
          aria-label="Continue learning"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[oklch(0.78_0.14_160/0.4)] bg-panel px-4 py-3.5"
        >
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[11px] font-semibold text-mint">CONTINUE LEARNING</span>
            <span className="text-[15px]">
              Card stagger · step {progress.lessonStep} of 4 · {LESSON_PROJECT}
            </span>
          </div>
          <ButtonLink href={routes.project(LESSON_PROJECT, "learn")} variant="mint" className="!py-2">
            Resume
          </ButtonLink>
        </section>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="Filter projects"
          options={DASHBOARD_FILTERS.map((f) => ({ value: f, label: f }))}
          value={filter}
          onChange={setFilter}
          activeClassName="bg-[#26262a] text-fg"
        />
        <span className="font-mono text-xs text-fg-faint">sort: modified ↓</span>
      </div>

      {visible.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
          {visible.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              latestVersion={latestVersion(cache[p.id]?.versions ?? [])}
              progress={progress}
              now={now}
              onStillProcessing={stillProcessing}
            />
          ))}
        </div>
      ) : (
        <p className="m-0 text-sm text-fg-dim">No projects match that filter.</p>
      )}
    </div>
  );
}
