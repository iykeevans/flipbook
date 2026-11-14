"use client";

import { useEffect, useState } from "react";
import { StaggerCards } from "@/components/motion/stagger-cards";
import { MonoNote, PageTitle, Segmented } from "@/components/ui";
import { useApiQuery } from "@/lib/api/use-api-query";
import { DEFAULT_ANIMATION_ID } from "@/lib/domain/animations";
import { EASES, STACKS, VIEWPORTS } from "@/lib/domain/constants";
import { latestVersion } from "@/lib/domain/versions";
import type { BuildState, CodeFile, StackId } from "@/lib/domain/types";
import { useAppStore } from "@/lib/store/app-store";
import { useProject } from "@/features/project";
import { AssistantPanel } from "./assistant-panel";

export function BuildScreen() {
  const project = useProject();
  const build = useAppStore((s) => s.cache[project.id]?.build);
  const inspector = useAppStore((s) => s.cache[project.id]?.inspector);
  const loadBuild = useAppStore((s) => s.loadBuild);
  const loadAnimations = useAppStore((s) => s.loadAnimations);
  const code = useApiQuery("code:all", (api) => Promise.all(STACKS.map((s) => api.generation.getCode(s.id))));

  useEffect(() => {
    if (!build) void loadBuild(project.id);
  }, [build, loadBuild, project.id]);
  useEffect(() => {
    if (!inspector) void loadAnimations(project.id);
  }, [inspector, loadAnimations, project.id]);

  if (!build || code.status !== "ready") return <MonoNote className="text-fg-faint">Loading build…</MonoNote>;
  return <BuildBody build={build} files={code.data} cardDurationMs={inspector?.durations[DEFAULT_ANIMATION_ID] ?? 480} />;
}

function BuildBody({ build, files, cardDurationMs }: { build: BuildState; files: CodeFile[]; cardDurationMs: number }) {
  const project = useProject();
  const versions = useAppStore((s) => s.cache[project.id]?.versions);
  const setStack = useAppStore((s) => s.setStack);
  const setViewport = useAppStore((s) => s.setViewport);
  const [run, setRun] = useState(0);
  const replay = () => setRun((r) => r + 1);

  const file = files.find((f) => f.stack === build.stack) ?? files[0]!;
  const vp = VIEWPORTS[build.viewport];
  const heroMargin = build.heroPadded ? 30 : 8;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <PageTitle size="md">Build</PageTitle>
          <MonoNote>v{latestVersion(versions ?? [])} · saved</MonoNote>
        </div>
        <div className="flex flex-wrap gap-2">
          <Segmented<number>
            label="Preview viewport"
            options={VIEWPORTS.map((v, i) => ({ value: i, label: v.label }))}
            value={build.viewport}
            onChange={(v) => {
              replay();
              void setViewport(project.id, v as BuildState["viewport"]);
            }}
            className="gap-1 rounded-[9px] bg-panel p-1 font-mono text-xs"
            itemClassName="rounded-md px-[11px] py-1.5"
            activeClassName="bg-control-alt text-fg"
          />
          <Segmented<StackId>
            label="Motion stack"
            options={STACKS.map((s) => ({ value: s.id, label: s.label }))}
            value={build.stack}
            onChange={(v) => {
              replay();
              void setStack(project.id, v);
            }}
            className="gap-1 rounded-[9px] bg-panel p-1 font-mono text-xs"
            itemClassName="rounded-md px-[11px] py-1.5"
            activeClassName="bg-control-alt text-fg"
          />
        </div>
      </div>

      <div className="grid min-h-[480px] grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] overflow-hidden rounded-xl border border-line">
        <div className="flex min-w-0 flex-col bg-sunken">
          <div className="flex justify-between gap-2 border-b border-chip px-3.5 py-2.5 font-mono text-xs text-fg-muted">
            <span data-testid="code-file">{file.fileName}</span>
            <span className="text-mint">✦ Card stagger</span>
          </div>
          {build.pending && (
            <div className="mx-3 mt-2.5 overflow-hidden rounded-lg border border-edge font-mono text-[11.5px] leading-[1.7]" data-testid="proposed-diff">
              <div className="bg-panel px-2.5 py-[5px] text-fg-muted">proposed · {build.pending.file}</div>
              <div className="overflow-auto bg-[rgba(238,107,85,.1)] px-2.5 py-0.5 whitespace-pre text-red">- {build.pending.minus}</div>
              <div className="overflow-auto bg-[rgba(120,220,170,.1)] px-2.5 py-0.5 whitespace-pre text-mint">+ {build.pending.plus}</div>
            </div>
          )}
          <pre className="m-0 max-h-[520px] flex-1 overflow-auto px-4 py-3.5 font-mono text-xs leading-[1.7] text-fg-soft" data-testid="code-text" tabIndex={0} aria-label={`${file.fileName} source`}>
            {file.code}
          </pre>
          {!build.typeErrorFixed && <TypeErrorBanner />}
        </div>

        <div className="flex min-w-0 flex-col gap-2.5 bg-panel-alt p-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-semibold whitespace-nowrap text-fg-dim" data-testid="viewport-label">
              PREVIEW · {vp.size}
            </span>
            <button type="button" onClick={replay} className="rounded-md bg-control-alt px-2.5 py-[5px] text-xs hover:bg-control-alt-hover">
              ↻ Replay
            </button>
          </div>
          <div className="flex flex-1 justify-center">
            <div
              className="flex flex-col gap-2.5 rounded-lg bg-paper p-4 transition-[width] duration-350"
              style={{ width: vp.width }}
              data-testid="build-preview"
            >
              <div className="flex justify-between">
                <div className="h-2 w-11 rounded-[2px] bg-paper-ink" />
                <div className="h-2 w-4 rounded-[2px] bg-paper-line" />
              </div>
              <div className="h-3.5 w-[72%] rounded-[3px] bg-paper-ink transition-[margin] duration-400" style={{ marginTop: heroMargin }} data-testid="preview-hero" />
              <div className="h-[7px] w-[46%] rounded-[2px] bg-paper-line transition-[margin] duration-400" style={{ marginBottom: heroMargin }} />
              <div className="mt-auto">
                <StaggerCards run={run} durationMs={cardDurationMs} staggerMs={90} ease={EASES[1]!} color="var(--color-paper-card)" height={64} gap={8} columns={vp.columns} />
              </div>
            </div>
          </div>
        </div>

        <AssistantPanel build={build} onApplied={replay} />
      </div>
      <p className="m-0 text-[13px] text-fg-dim">Switching stack regenerates the motion code. Layout and styles stay as you edited them.</p>
    </div>
  );
}

function TypeErrorBanner() {
  const project = useProject();
  const ask = useAppStore((s) => s.ask);
  return (
    <div
      role="status"
      className="mx-3 mb-3 flex items-center justify-between gap-2 rounded-[7px] bg-[rgba(238,107,85,.12)] px-2.5 py-2 font-mono text-[11px] text-red-soft"
      data-testid="type-error"
    >
      <span>⚠ Cards.tsx:14 · &apos;item&apos; is possibly undefined</span>
      <button type="button" onClick={() => void ask(project.id, { editId: "fix" })} className="whitespace-nowrap text-fg underline">
        Ask assistant
      </button>
    </div>
  );
}
