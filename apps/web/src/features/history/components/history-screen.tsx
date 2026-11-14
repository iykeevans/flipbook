"use client";

import { useEffect, useState } from "react";
import { Button, ButtonLink, MonoNote, PageTitle, cn } from "@/components/ui";
import { formatRelative } from "@/lib/domain/time";
import { comparePair, diffTone, latestVersion, restoreCandidate } from "@/lib/domain/versions";
import type { ProjectVersion } from "@/lib/domain/types";
import { routes } from "@/lib/routes";
import { useAppStore } from "@/lib/store/app-store";
import { useProject } from "@/features/project";

const DIFF_CLASS = { removed: "text-red", added: "text-mint", context: "text-fg-muted" } as const;

export function HistoryScreen() {
  const project = useProject();
  const versions = useAppStore((s) => s.cache[project.id]?.versions);
  const loadVersions = useAppStore((s) => s.loadVersions);

  useEffect(() => {
    if (!versions) void loadVersions(project.id);
  }, [versions, loadVersions, project.id]);

  if (!versions) return <MonoNote className="text-fg-faint">Loading history…</MonoNote>;
  if (versions.length === 0)
    return (
      <div className="flex flex-col gap-3">
        <PageTitle size="md">History</PageTitle>
        <p className="m-0 text-fg-muted">No versions yet. Generate the site to create v1.</p>
      </div>
    );
  return <HistoryBody versions={versions} />;
}

function HistoryBody({ versions }: { versions: ProjectVersion[] }) {
  const project = useProject();
  const restoreVersion = useAppStore((s) => s.restoreVersion);
  const [selected, setSelected] = useState(0);
  const [now] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);

  const index = Math.min(selected, versions.length - 1);
  const pair = comparePair(versions, index)!;
  const candidate = restoreCandidate(versions, index);
  const nextV = latestVersion(versions) + 1;

  const restore = async () => {
    if (!candidate) return;
    setBusy(true);
    await restoreVersion(project.id, candidate.v);
    setSelected(0);
    setBusy(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <PageTitle size="md">History</PageTitle>
      <div className="grid items-start gap-5 md:grid-cols-[minmax(240px,340px)_minmax(0,1fr)]">
        <ol className="m-0 flex list-none flex-col gap-0.5 p-0" aria-label="Versions, newest first">
          {versions.map((v, i) => (
            <li key={v.v}>
              <button
                type="button"
                aria-pressed={i === index}
                onClick={() => setSelected(i)}
                data-testid={`version-v${v.v}`}
                className={cn("grid w-full grid-cols-[12px_1fr] gap-3 rounded-[10px] px-3 py-[11px] text-left transition-colors hover:bg-hover", i === index && "bg-line")}
              >
                <span className="mt-[5px] size-2.5 rounded-full" style={{ background: v.color }} aria-hidden />
                <span className="flex min-w-0 flex-col gap-[3px] leading-[1.2]">
                  <b className="text-[15px]">
                    v{v.v} · {v.kind}
                  </b>
                  <span className="text-[13px] text-fg-dim">
                    {v.description} · {formatRelative(v.createdAt, now)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>

        <section className="flex min-w-0 flex-col gap-3 rounded-xl bg-panel p-4" aria-label="Compare versions">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <span className="font-mono text-[11px] font-semibold text-fg-dim" data-testid="compare-label">
              COMPARE {pair.previous ? `v${pair.previous.v} ↔ v${pair.selected.v}` : `v${pair.selected.v}`}
            </span>
            <div className="flex gap-2">
              <ButtonLink href={routes.project(project.id, "build")}>Open in Build</ButtonLink>
              {candidate && (
                <Button variant="primary" disabled={busy} onClick={restore}>
                  Restore v{candidate.v}
                </Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Snapshot label={pair.previous ? `v${pair.previous.v}` : "—"} />
            <Snapshot label={`v${pair.selected.v}`} highlighted />
          </div>
          <div className="rounded-lg bg-sunken px-3 py-2.5 font-mono text-xs leading-[1.7] whitespace-pre-wrap" data-testid="diff">
            {pair.selected.diff.map((line, i) => (
              <div key={i} className={DIFF_CLASS[diffTone(line)]} data-tone={diffTone(line)}>
                {line}
              </div>
            ))}
          </div>
          <span className="text-[13px] text-fg-faint">Restoring creates v{nextV}; nothing is overwritten.</span>
        </section>
      </div>
    </div>
  );
}

function Snapshot({ label, highlighted = false }: { label: string; highlighted?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="font-mono text-[11px] text-fg-dim">{label}</span>
      <div
        className="flex h-[150px] flex-col gap-[7px] rounded-lg bg-paper p-3.5"
        style={highlighted ? { outline: "2px solid var(--color-mint)", outlineOffset: -2 } : undefined}
        aria-hidden
      >
        <div className="mt-2 h-2.5 w-[70%] rounded-[2px] bg-paper-ink" />
        <div className="h-1.5 w-[44%] rounded-[2px] bg-paper-line" />
        <div className="mt-auto grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-11 rounded bg-paper-card" />
          ))}
        </div>
      </div>
    </div>
  );
}
