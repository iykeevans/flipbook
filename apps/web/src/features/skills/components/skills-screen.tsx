"use client";

import Link from "next/link";
import { PageTitle, ProgressBar, cn } from "@/components/ui";
import { levelProgress } from "@/lib/domain/levels";
import { learnedSummary } from "@/lib/domain/projects";
import { skillTiles } from "@/lib/domain/skills";
import type { SkillKind } from "@/lib/domain/types";
import { routes } from "@/lib/routes";
import { useAppStore } from "@/lib/store/app-store";

const TILE: Record<SkillKind, { box: string; status: string }> = {
  done: { box: "bg-mint text-ink border-solid border-mint", status: "text-ink" },
  prog: { box: "bg-panel text-fg border-solid border-mint", status: "text-mint" },
  seen: { box: "bg-panel text-fg border-solid border-edge-2", status: "text-fg-dim" },
  lock: { box: "bg-panel text-fg-ghost border-dashed border-edge-2", status: "text-fg-dim" },
};

export function SkillsScreen() {
  const progress = useAppStore((s) => s.progress)!;
  const projects = useAppStore((s) => s.projects);
  const lvl = levelProgress(progress.xp);
  const tiles = skillTiles({ learned: progress.learned, challengePassed: progress.challenge.passed, level: lvl.level });
  const ready = projects.filter((p) => p.status === "ready");

  return (
    <div className="flex flex-col gap-6">
      <PageTitle>Your motion skills</PageTitle>

      <section aria-label="Level" className="flex items-center gap-5 rounded-[14px] bg-panel p-5">
        <div className="grid size-[72px] flex-none place-items-center rounded-[18px] bg-lilac text-[32px] font-extrabold text-ink" data-testid="level-number">
          {lvl.level}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap justify-between gap-3 text-base">
            <b>
              Level {lvl.level} · {lvl.name}
            </b>
            <span className="font-mono text-xs whitespace-nowrap text-fg-dim" data-testid="level-xp">
              {lvl.xp.toLocaleString("en-US")} / {lvl.nextXp.toLocaleString("en-US")} XP
            </span>
          </div>
          <ProgressBar value={lvl.pct} label={`Progress to level ${lvl.level + 1}`} height={10} className="!bg-line" barClassName="bg-lilac" />
          <span className="text-[13px] text-fg-dim">{lvl.nextMessage}</span>
        </div>
      </section>

      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2.5 p-0" aria-label="Skills">
        {tiles.map((k) => (
          <li key={k.name} data-testid={`skill-${k.name}`} data-kind={k.kind} className={cn("flex flex-col gap-1.5 rounded-xl border-[1.5px] p-4", TILE[k.kind].box)}>
            <b className="text-base">{k.name}</b>
            <span className={cn("font-mono text-xs", TILE[k.kind].status)}>{k.status}</span>
          </li>
        ))}
      </ul>

      <section aria-label="Projects" className="flex flex-col gap-2.5">
        <span className="font-mono text-[11px] font-semibold text-fg-dim">PROJECTS</span>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 p-0 text-sm">
          {ready.map((p) => {
            const s = learnedSummary(p, progress);
            return (
              <li key={p.id}>
                <Link href={routes.project(p.id, "animations")} className="group flex flex-col gap-2 text-fg no-underline hover:text-fg">
                  <span className="grid h-[110px] place-items-center rounded-[10px] bg-stripe font-mono text-[11px] text-fg-ghost outline-edge-4 group-hover:outline-[1.5px]">
                    site thumbnail
                  </span>
                  <span>
                    {p.name} · {s.learned}/{s.total} learned
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
