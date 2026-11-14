"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui";
import { inspectorAction, inspectorRows, observedLabel } from "@/lib/domain/animations";
import { COLORS, DURATION_LIMITS } from "@/lib/domain/constants";
import { isDurationDirty } from "@/lib/domain/inspector";
import { latestVersion } from "@/lib/domain/versions";
import type { Animation, Certainty, InspectorState } from "@/lib/domain/types";
import { routes } from "@/lib/routes";
import { useAppStore } from "@/lib/store/app-store";
import { useProject } from "@/features/project";

const CERTAINTY_COLOR: Record<Certainty, string> = { observed: COLORS.mint, inferred: COLORS.yellow, unknown: "#76766f" };

export function Inspector({ animation, inspector }: { animation: Animation; inspector: InspectorState }) {
  const project = useProject();
  const router = useRouter();
  const progress = useAppStore((s) => s.progress);
  const versions = useAppStore((s) => s.cache[project.id]?.versions);
  const nudgeDuration = useAppStore((s) => s.nudgeDuration);
  const saveDuration = useAppStore((s) => s.saveDuration);
  const setLessonStep = useAppStore((s) => s.setLessonStep);
  const [saving, setSaving] = useState(false);

  const learner = { learned: progress?.learned ?? [], xp: progress?.xp ?? 0, challengePassed: progress?.challenge.passed ?? false };
  const action = inspectorAction(animation, learner);
  const rows = inspectorRows(animation, inspector);
  const dirty = isDurationDirty(inspector, animation.id);
  const nextV = latestVersion(versions ?? []) + 1;
  const duration = inspector.durations[animation.id];

  const onSave = async () => {
    setSaving(true);
    await saveDuration(project.id, animation.id);
    setSaving(false);
  };

  const onLearn = async () => {
    await setLessonStep(1);
    router.push(routes.project(project.id, "learn"));
  };

  return (
    <section className="flex flex-col gap-3 rounded-xl bg-panel px-[18px] py-4" aria-labelledby="inspector-title" data-testid="inspector">
      <div className="flex flex-wrap items-baseline justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <span className="size-2.5 rounded-[3px]" style={{ background: animation.color }} aria-hidden />
          <h2 id="inspector-title" className="m-0 text-lg font-semibold">
            {animation.name}
          </h2>
        </div>
        <span className="font-mono text-[11px] text-fg-dim">
          {animation.concept} · {animation.trigger}
        </span>
      </div>

      <table className="w-full table-fixed border-separate border-spacing-x-0 border-spacing-y-2 font-mono text-xs">
        <colgroup>
          <col className="w-[90px]" />
          <col />
          <col />
        </colgroup>
        <thead>
          <tr className="text-left text-[10px] text-fg-dim">
            <th scope="col" className="font-normal">
              <span className="sr-only">Property</span>
            </th>
            <th scope="col" className="pr-2.5 font-normal">
              OBSERVED
            </th>
            <th scope="col" className="font-normal">
              GENERATED
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} data-testid={`inspector-row-${r.name}`}>
              <th scope="row" className="text-left font-normal text-fg-dim">
                {r.name}
              </th>
              <td className="pr-2.5">
                <span className="flex items-center gap-1.5" data-testid="observed-value">
                  <span className="truncate">{observedLabel(r.observed)}</span>
                  <span style={{ color: CERTAINTY_COLOR[r.observed.certainty] }} aria-hidden>
                    {r.observed.certainty === "unknown" ? "○" : "●"}
                  </span>
                  <span className="sr-only">({r.observed.certainty})</span>
                </span>
              </td>
              <td>
                <span className="flex items-center gap-1">
                  {r.editable && (
                    <StepButton
                      label="Decrease generated duration"
                      disabled={duration !== undefined && duration <= DURATION_LIMITS.min}
                      onClick={() => nudgeDuration(project.id, animation.id, -DURATION_LIMITS.step)}
                    >
                      −
                    </StepButton>
                  )}
                  <span
                    className={r.editable ? "rounded bg-control-alt px-1.5 py-0.5" : "truncate px-1.5 py-0.5"}
                    data-testid={r.editable ? "generated-duration" : undefined}
                    aria-live={r.editable ? "polite" : undefined}
                  >
                    {r.generated}
                  </span>
                  {r.editable && (
                    <StepButton
                      label="Increase generated duration"
                      disabled={duration !== undefined && duration >= DURATION_LIMITS.max}
                      onClick={() => nudgeDuration(project.id, animation.id, DURATION_LIMITS.step)}
                    >
                      +
                    </StepButton>
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-wrap gap-3 font-mono text-[11px] text-fg-dim">
        <span>
          <span className="text-mint">●</span> observed
        </span>
        <span>
          <span className="text-yellow">●</span> inferred
        </span>
        <span>○ unknown</span>
        <span className="ml-auto">confidence {animation.confidence.toFixed(2)}</span>
      </div>
      <p className="m-0 rounded-lg bg-ink px-3 py-2.5 text-[13px] leading-[1.45] text-fg-muted">
        Generated with {animation.generatedWith}. We can&apos;t tell which library the original site used; plain CSS or GSAP could produce the same
        motion.
      </p>

      <div className="mt-auto flex flex-wrap justify-end gap-2 text-sm">
        <Button variant={dirty ? "light" : "secondary"} disabled={!dirty || saving} onClick={onSave} style={dirty ? undefined : { color: "#76766f" }}>
          {dirty ? `Save as v${nextV}` : "Saved"}
        </Button>
        {action === "learn" && (
          <Button variant="mint" onClick={onLearn}>
            Learn it · +60 XP
          </Button>
        )}
        {action === "challenge" && (
          <ButtonLink variant="yellow" href={routes.project(project.id, "learn/challenge")}>
            Take the challenge
          </ButtonLink>
        )}
        {action === "learned" && <span className="rounded-lg border border-edge-2 px-[13px] py-[9px] text-mint">Learned ✓</span>}
        {action === "locked" && (
          <span className="rounded-lg border border-dashed border-edge-4 px-[13px] py-[9px] text-fg-dim">Unlocks at Lv {animation.unlockLevel}</span>
        )}
      </div>
    </section>
  );
}

function StepButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-5 flex-none place-items-center rounded-[5px] bg-control-alt hover:bg-control-alt-hover disabled:opacity-40"
    >
      {children}
    </button>
  );
}
