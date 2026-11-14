"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { StaggerCards } from "@/components/motion/stagger-cards";
import { Button, ButtonLink, MonoNote, cn } from "@/components/ui";
import { EaseChips } from "@/components/motion/ease-chips";
import { RangeRow } from "@/components/motion/range-row";
import { useApiQuery } from "@/lib/api/use-api-query";
import { COLORS, EASES } from "@/lib/domain/constants";
import { EXERCISE_ID, PLAYGROUND_LIMITS } from "@/lib/domain/lesson";
import { challengeXp, isRowPassing, scoreTone, worstRow } from "@/lib/domain/scoring";
import type { ChallengeParams, ChallengeState, Exercise } from "@/lib/domain/types";
import { routes } from "@/lib/routes";
import { useAppStore } from "@/lib/store/app-store";
import { useProject } from "@/features/project";

const TONE_COLOR = { none: "#76766f", pass: COLORS.mint, close: COLORS.yellow, fail: COLORS.red } as const;
const ROW_LABELS = ["Distance", "Duration", "Stagger", "Easing"] as const;
const SAVE_DELAY_MS = 300;

export function ChallengeScreen() {
  const query = useApiQuery(`exercise:${EXERCISE_ID}`, (api) => api.exercises.get(EXERCISE_ID));
  const challenge = useAppStore((s) => s.progress?.challenge);
  if (query.status !== "ready" || !challenge) return <MonoNote className="text-fg-faint">Loading challenge…</MonoNote>;
  return <ChallengeBody exercise={query.data} challenge={challenge} />;
}

function ChallengeBody({ exercise, challenge }: { exercise: Exercise; challenge: ChallengeState }) {
  const project = useProject();
  const submitChallenge = useAppStore((s) => s.submitChallenge);
  const revealHint = useAppStore((s) => s.revealHint);
  const saveChallengeParams = useAppStore((s) => s.saveChallengeParams);
  const [params, setParams] = useState<ChallengeParams>(challenge.params);
  const [run, setRun] = useState(0);
  const [busy, setBusy] = useState(false);
  const dirty = useRef(false);

  useEffect(() => {
    if (!dirty.current) return;
    const timer = setTimeout(() => void saveChallengeParams(exercise.id, params), SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [params, exercise.id, saveChallengeParams]);

  const update = (patch: Partial<ChallengeParams>) => {
    dirty.current = true;
    setParams((p) => ({ ...p, ...patch }));
  };

  const submit = async () => {
    setBusy(true);
    await submitChallenge(exercise.id, params);
    setRun((r) => r + 1);
    setBusy(false);
  };

  const score = challenge.lastScore;
  const tone = scoreTone(score?.total ?? null);
  const message = !score
    ? `Set easing, duration and stagger, then submit. Score ${exercise.passScore}+ for +${exercise.xp} XP and the Easing badge.`
    : challenge.passed
      ? "Passed. Easing badge earned. This animation now counts as learned."
      : `${worstRow(score)} is the furthest off. Play both and watch where yours drifts from the dashed outline.`;

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[11px] font-semibold text-yellow" data-testid="attempt-label">
            CHALLENGE · ATTEMPT {challenge.attempts}
          </span>
          <h1 className="m-0 text-[28px] font-extrabold tracking-[-0.02em]">{exercise.title}</h1>
        </div>
        <Link href={routes.animation(project.id, exercise.animationId)} className="text-sm text-fg-dim no-underline hover:text-fg">
          Exit
        </Link>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="flex min-w-0 flex-col gap-3.5">
          <div className="relative flex h-[230px] flex-col justify-end rounded-xl bg-panel px-6 pt-9 pb-[22px]">
            <span className="absolute top-3 left-4 font-mono text-[11px] text-fg-dim">dashed = original · yellow = yours</span>
            <StaggerCards
              run={run}
              durationMs={params.durationMs}
              staggerMs={params.staggerMs}
              ease={EASES[params.easeIndex]!}
              color={COLORS.yellow}
              height={120}
              ghost
              essential
              testId="duel"
            />
          </div>
          <EaseChips value={params.easeIndex} onChange={(i) => update({ easeIndex: i })} activeClassName="bg-yellow text-ink" />
          <div className="grid grid-cols-[80px_1fr_64px] items-center gap-x-3 gap-y-2.5 font-mono text-xs text-fg-muted">
            <RangeRow
              label="duration"
              value={params.durationMs}
              {...PLAYGROUND_LIMITS.duration}
              onChange={(v) => update({ durationMs: v })}
              accent={COLORS.yellow}
            />
            <RangeRow label="stagger" value={params.staggerMs} {...PLAYGROUND_LIMITS.stagger} onChange={(v) => update({ staggerMs: v })} accent={COLORS.yellow} />
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Button variant="yellow" className="px-4 py-2.5" disabled={busy} onClick={submit}>
              Submit
            </Button>
            <Button className="px-4 py-2.5" onClick={() => setRun((r) => r + 1)}>
              ↻ Play both
            </Button>
            <Button className="px-4 py-2.5 text-fg-muted" disabled={challenge.hintUsed} onClick={() => void revealHint(exercise.id)}>
              {challenge.hintUsed ? `Hint used (−${exercise.hintPenalty} XP)` : `Hint (−${exercise.hintPenalty} XP)`}
            </Button>
          </div>
          {challenge.hintUsed && (
            <p className="m-0 rounded-[10px] bg-panel px-3.5 py-3 text-sm" data-testid="hint">
              {exercise.hint}
            </p>
          )}
        </div>

        <section className="flex flex-col gap-3.5 rounded-xl bg-panel p-[18px]" aria-label="Score" aria-live="polite">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[11px] font-semibold text-fg-dim">SCORE</span>
            <span className="text-[56px] leading-none font-extrabold tracking-[-0.03em]" style={{ color: TONE_COLOR[tone] }} data-testid="score-total">
              {score ? score.total : "—"}
              <span className="text-xl text-fg-faint">/100</span>
            </span>
          </div>
          <dl className="m-0 flex flex-col gap-2.5 text-sm">
            {ROW_LABELS.map((label) => {
              const row = score?.rows.find((r) => r.label === label);
              const pass = row ? isRowPassing(row.value) : false;
              return (
                <div key={label} className="flex justify-between" data-testid={`score-row-${label}`}>
                  <dt>{label}</dt>
                  <dd className={cn("m-0 font-mono", !row ? "text-fg-ghost" : pass ? "text-mint" : "text-red")}>
                    {row ? `${pass ? "✓" : "✗"} ${row.value}` : "—"}
                  </dd>
                </div>
              );
            })}
          </dl>
          <p className="m-0 rounded-lg bg-ink px-3 py-2.5 text-[13px] leading-[1.45]" data-testid="score-message">
            {message}
          </p>
          {challenge.passed && (
            <ButtonLink variant="primary" href={routes.project(project.id, "export")} className="px-3.5 py-2.5">
              Ship the project →
            </ButtonLink>
          )}
          {!challenge.passed && challenge.hintUsed && <MonoNote>Passing now earns {challengeXp(true)} XP.</MonoNote>}
        </section>
      </div>
    </div>
  );
}
