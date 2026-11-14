"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { StaggerCards } from "@/components/motion/stagger-cards";
import { Button, ButtonLink, MonoNote, PageTitle } from "@/components/ui";
import { DEFAULT_ANIMATION_ID, SLOW_MOTION_FACTOR } from "@/lib/domain/animations";
import { EASES } from "@/lib/domain/constants";
import { formatTimestamp } from "@/lib/domain/match";
import type { Animation, InspectorState } from "@/lib/domain/types";
import { routes } from "@/lib/routes";
import { useAppStore } from "@/lib/store/app-store";
import { useProject } from "@/features/project";
import { Inspector } from "./inspector";
import { Timeline } from "./timeline";

const HIGHLIGHT = "2px solid var(--color-mint-deep)";

export function AnimationsScreen() {
  const project = useProject();
  const animations = useAppStore((s) => s.cache[project.id]?.animations);
  const inspector = useAppStore((s) => s.cache[project.id]?.inspector);
  const loadAnimations = useAppStore((s) => s.loadAnimations);

  useEffect(() => {
    if (!animations || !inspector) void loadAnimations(project.id);
  }, [animations, inspector, loadAnimations, project.id]);

  if (!animations || !inspector) return <MonoNote className="text-fg-faint">Loading animations…</MonoNote>;
  return <AnimationsBody animations={animations} inspector={inspector} />;
}

function AnimationsBody({ animations, inspector }: { animations: Animation[]; inspector: InspectorState }) {
  const project = useProject();
  const router = useRouter();
  const params = useSearchParams();
  const [run, setRun] = useState(0);
  const [slow, setSlow] = useState(false);

  const requested = params.get("anim");
  const selected = animations.find((a) => a.id === requested) ?? animations.find((a) => a.id === DEFAULT_ANIMATION_ID) ?? animations[0]!;

  const select = (id: string) => router.replace(routes.animation(project.id, id), { scroll: false });
  const factor = slow ? SLOW_MOTION_FACTOR : 1;
  const staggerDuration = inspector.durations[DEFAULT_ANIMATION_ID] ?? 480;

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <PageTitle size="md">Animations</PageTitle>
        <MonoNote>click a row to inspect it</MonoNote>
      </div>

      <Timeline animations={animations} selectedId={selected.id} onSelect={select} />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-stretch gap-3.5">
        <div className="flex flex-col gap-2.5 rounded-xl bg-panel p-3.5">
          <div className="flex min-h-[220px] flex-1 flex-col gap-2 rounded-lg bg-paper p-4" data-testid="inspector-preview">
            <div className="flex items-center justify-between">
              <div className="h-2 w-[50px] rounded-[2px] bg-paper-ink" />
              <div className="flex gap-1.5 rounded-[2px]" style={{ outline: selected.id === "nav" ? HIGHLIGHT : "none", outlineOffset: 4 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-1.5 w-[22px] rounded-[2px] bg-paper-line" />
                ))}
              </div>
            </div>
            <div
              className="mt-3.5 h-3.5 w-[65%] rounded-[2px] bg-paper-ink"
              style={{ outline: selected.id === "hero" ? HIGHLIGHT : "none", outlineOffset: 4 }}
            />
            <div className="h-1.5 w-[40%] rounded-[2px] bg-paper-muted" />
            <div className="mt-auto">
              <StaggerCards
                run={run}
                durationMs={staggerDuration * factor}
                staggerMs={90 * factor}
                ease={EASES[1]!}
                color="var(--color-paper-card)"
                height={70}
                gap={10}
                outline={selected.id === DEFAULT_ANIMATION_ID ? HIGHLIGHT : undefined}
                testId="inspector-cards"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" onClick={() => setRun((r) => r + 1)}>
              ▶ Replay
            </Button>
            <Button
              size="sm"
              className="font-mono"
              aria-pressed={slow}
              aria-label={slow ? "Play at normal speed" : "Play at quarter speed"}
              onClick={() => {
                setSlow((s) => !s);
                setRun((r) => r + 1);
              }}
            >
              {slow ? "1×" : "0.25×"}
            </Button>
            <ButtonLink size="sm" href={routes.overviewAt(project.id, selected.recordedAt)}>
              Show in recording @ {formatTimestamp(selected.recordedAt)}
            </ButtonLink>
            <ButtonLink size="sm" href={routes.project(project.id, "build")}>
              Open code ↗
            </ButtonLink>
          </div>
        </div>

        <Inspector animation={selected} inspector={inspector} />
      </div>
    </div>
  );
}
