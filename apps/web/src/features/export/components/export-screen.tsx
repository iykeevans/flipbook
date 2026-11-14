"use client";

import { useEffect, useState } from "react";
import { Button, ButtonLink, PageTitle, ProgressBar, SwitchRow, cn } from "@/components/ui";
import { TOTAL_ANIMATIONS, XP_REWARDS } from "@/lib/domain/constants";
import { DEFAULT_EXPORT_OPTIONS, EXPORT_OPTION_LABELS, EXPORT_TARGETS, exportActionLabel, shipAwardKey, stackSummary } from "@/lib/domain/export";
import { visibleLogLines } from "@/lib/domain/jobs";
import type { ExportOptions, ExportTarget, JobSnapshot } from "@/lib/domain/types";
import { routes } from "@/lib/routes";
import { useAppStore } from "@/lib/store/app-store";
import { useProject } from "@/features/project";

const POLL_MS = 60;

export function ExportScreen() {
  const project = useProject();
  const learnedCount = useAppStore((s) => s.progress?.learned.length ?? 0);
  const startExport = useAppStore((s) => s.startExport);
  const getJob = useAppStore((s) => s.getJob);
  const award = useAppStore((s) => s.award);
  const [target, setTarget] = useState<ExportTarget>("deploy");
  const [options, setOptions] = useState<ExportOptions>(DEFAULT_EXPORT_OPTIONS);
  const [job, setJob] = useState<JobSnapshot | null>(null);

  const jobId = job?.id;
  const running = job?.status === "running";
  useEffect(() => {
    if (!jobId || !running) return;
    let alive = true;
    const timer = setInterval(async () => {
      const next = await getJob(jobId);
      if (!alive || !next) return;
      setJob(next);
      if (next.status === "done") {
        clearInterval(timer);
        void award({ amount: XP_REWARDS.firstShip, reason: `First ship of ${project.name}`, key: shipAwardKey(project.id) });
      }
    }, POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [jobId, running, getJob, award, project.id, project.name]);

  const pick = (t: ExportTarget) => {
    setTarget(t);
    setJob(null);
  };

  const deploy = async () => setJob(await startExport(project.id, target, options));

  const log = job?.meta?.log ? visibleLogLines(job.meta.log.split("\n"), job.progress) : [];

  return (
    <div className="flex max-w-[760px] flex-col gap-5">
      <PageTitle>Ship it</PageTitle>
      <div role="group" aria-label="Export target" className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2.5">
        {EXPORT_TARGETS.map((t) => {
          const on = t.id === target;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={on}
              onClick={() => pick(t.id)}
              className={cn("flex flex-col gap-1.5 rounded-xl border-[1.5px] bg-panel p-[18px] text-left leading-[1.2] transition-colors hover:bg-hover", on ? "border-orange" : "border-edge")}
            >
              <span className="text-base font-semibold">{t.label}</span>
              <span className="text-[13px] text-fg-dim">{t.sub}</span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-col text-[15px]">
        <div className="flex justify-between gap-3 border-b border-divider py-3">
          <span>Stack</span>
          <span className="text-right font-mono text-[13px] text-fg-muted" data-testid="stack-summary">
            {stackSummary(project.outputs)}
          </span>
        </div>
        {(Object.keys(EXPORT_OPTION_LABELS) as (keyof ExportOptions)[]).map((key) => (
          <SwitchRow
            key={key}
            label={EXPORT_OPTION_LABELS[key]}
            on={options[key]}
            onToggle={() => setOptions((o) => ({ ...o, [key]: !o[key] }))}
            className="py-3"
          />
        ))}
      </div>

      {!job && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-fg-dim">
            {learnedCount} of {TOTAL_ANIMATIONS} animations learned in this project
          </span>
          <Button variant="primary" size="lg" className="px-5" onClick={deploy}>
            {exportActionLabel(target, project.name)}
          </Button>
        </div>
      )}
      {job?.status === "running" && (
        <div className="flex flex-col gap-2.5 rounded-xl bg-sunken p-4 font-mono text-[12.5px] leading-[1.7] text-fg-muted" data-testid="deploy-log" aria-live="polite">
          {log.map((line) => (
            <span key={line}>{line}</span>
          ))}
          <ProgressBar value={job.progress} label="Export progress" height={6} barClassName="bg-orange" className="bg-line" />
        </div>
      )}
      {job?.status === "done" && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-[1.5px] border-mint bg-panel p-[18px]" data-testid="deploy-done" role="status">
          <div className="flex flex-col gap-1">
            <span className="text-lg font-semibold">{job.meta?.title}</span>
            <span className="font-mono text-[13px] text-mint">{job.meta?.sub}</span>
          </div>
          <ButtonLink href={routes.skills}>See your skills →</ButtonLink>
        </div>
      )}
    </div>
  );
}
