"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Eyebrow, PageTitle, cn } from "@/components/ui";
import { useApiQuery } from "@/lib/api/use-api-query";
import { COLORS, TOTAL_ANIMATIONS } from "@/lib/domain/constants";
import { formatTimestamp } from "@/lib/domain/match";
import type { Analysis } from "@/lib/domain/types";
import { routes } from "@/lib/routes";
import { useAppStore } from "@/lib/store/app-store";
import { useProject } from "@/features/project";

const CERTAINTY_COLOR = { observed: COLORS.mint, inferred: COLORS.yellow, partial: COLORS.neutral } as const;

export function ReviewScreen() {
  const project = useProject();
  const query = useApiQuery(`analysis:${project.id}`, (api) => api.analysis.get(project.id));

  if (project.status === "processing") {
    return (
      <div className="flex flex-col items-start gap-3">
        <PageTitle size="md">Still analysing</PageTitle>
        <p className="m-0 text-fg-muted">
          {project.name} is {Math.round(project.progress)}% through analysis. We&apos;ll flag it on the dashboard when it&apos;s ready.
        </p>
        <Link href={routes.dashboard}>← Back to dashboard</Link>
      </div>
    );
  }
  if (query.status !== "ready") return <p className="m-0 font-mono text-xs text-fg-faint">Loading analysis…</p>;
  return <ReviewBody analysis={query.data} />;
}

function ReviewBody({ analysis }: { analysis: Analysis }) {
  const project = useProject();
  const router = useRouter();
  const generate = useAppStore((s) => s.generate);
  const [section, setSection] = useState<number | null>(null);
  const [frame, setFrame] = useState(0);
  const [selected, setSelected] = useState<string[]>(project.status === "ready" ? project.animationIds : analysis.defaultSelected);
  const [busy, setBusy] = useState(false);

  const toggle = (id: string) => setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const onGenerate = async () => {
    setBusy(true);
    const ordered = analysis.animations.map((a) => a.id).filter((id) => selected.includes(id));
    await generate(project.id, ordered);
    router.push(routes.project(project.id, "overview"));
  };

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <Eyebrow>STEP 2 OF 3 · UPLOAD → REVIEW → GENERATE</Eyebrow>
          <PageTitle size="md">Check what we found</PageTitle>
        </div>
        <Link href={routes.dashboard} className="text-sm text-fg-dim no-underline hover:text-fg">
          Save for later
        </Link>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-3">
          <div className="relative aspect-[16/10] rounded-xl bg-stripe-lg" data-testid="review-frame" aria-label="Recording with detected sections">
            {analysis.sections.map((s, i) => (
              <div
                key={s.label}
                data-testid={`overlay-${s.label}`}
                className="absolute inset-x-[3%] rounded-md transition-opacity duration-200"
                style={{
                  top: `${s.top}%`,
                  height: `${s.height}%`,
                  border: `2px ${s.certainty === "observed" ? "solid" : "dashed"} ${s.color}`,
                  opacity: section === null || section === i ? 1 : 0.2,
                }}
              >
                <span className="absolute bottom-px left-1.5 font-mono text-[8px] leading-none font-semibold sm:bottom-[5px] sm:left-2 sm:text-[11px]" style={{ color: s.color }}>
                  {s.label.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-8 gap-1.5" role="group" aria-label="Key frames">
            {Array.from({ length: analysis.frameCount }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-pressed={frame === i}
                aria-label={`Frame at ${formatTimestamp(i * 6)}`}
                onClick={() => setFrame(i)}
                className="aspect-[16/10] rounded-[5px] bg-line hover:bg-control-hover"
                style={{ outline: frame === i ? "2px solid #ededea" : "none" }}
              />
            ))}
          </div>
          <span className="font-mono text-xs text-fg-dim" data-testid="frame-caption">
            {analysis.keyFrames} key frames · 00:00–{formatTimestamp(analysis.durationSec)} · {analysis.resolution} · {analysis.summary} · showing{" "}
            {formatTimestamp(frame * 6)}
          </span>
        </div>

        <div className="flex flex-col gap-3 rounded-xl bg-panel p-4">
          <Eyebrow>SECTIONS · {analysis.sections.length}</Eyebrow>
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
            {analysis.sections.map((s, i) => (
              <li key={s.label}>
                <button
                  type="button"
                  aria-pressed={section === i}
                  onClick={() => setSection(section === i ? null : i)}
                  className={cn("flex w-full justify-between rounded-md px-2 py-[7px] text-left text-sm hover:bg-line", section === i && "bg-line")}
                >
                  <span>{s.label}</span>
                  <span className="font-mono text-xs" style={{ color: CERTAINTY_COLOR[s.certainty] }}>
                    {s.certainty}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <Eyebrow className="pt-1">
            ANIMATIONS · {selected.length} OF {TOTAL_ANIMATIONS}
          </Eyebrow>
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
            {analysis.animations.map((a) => {
              const on = selected.includes(a.id);
              const low = a.confidence < 0.7;
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => toggle(a.id)}
                    className="flex w-full items-center gap-2.5 rounded-md px-2 py-[7px] text-left text-sm hover:bg-line"
                  >
                    <span
                      aria-hidden
                      className="grid size-4 flex-none place-items-center rounded border-[1.5px] border-fg-sep text-[11px] font-extrabold text-ink"
                      style={{ background: on ? "#ededea" : "transparent" }}
                    >
                      {on ? "✓" : ""}
                    </span>
                    <span className={cn("flex-1", on ? "text-fg" : "text-fg-dim")}>{a.name}</span>
                    <span className="font-mono text-[11px]" style={{ color: low ? COLORS.yellow : COLORS.neutral }}>
                      {low ? `${a.confidence.toFixed(2)} · low` : a.confidence.toFixed(2)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="m-0 rounded-lg bg-ink px-3 py-2.5 text-[13px] leading-[1.45] text-fg-muted">
            Mobile layout isn&apos;t in the recording. We&apos;ll infer it and mark it as an assumption.
          </p>
          <Button variant="primary" onClick={() => void onGenerate()} disabled={busy}>
            Generate site
          </Button>
        </div>
      </div>
    </div>
  );
}
