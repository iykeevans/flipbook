"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, PageTitle, cn } from "@/components/ui";
import { getApi } from "@/lib/api";
import { COLORS } from "@/lib/domain/constants";
import { processingFrames, processingStages } from "@/lib/domain/processing";
import { routes } from "@/lib/routes";
import { useAppStore } from "@/lib/store/app-store";
import { useProject } from "@/features/project";

const POLL_MS = 100;

const DOT: Record<string, string> = { done: COLORS.mint, active: COLORS.orange, queued: "#33333a" };

export function ProcessingScreen() {
  const project = useProject();
  const router = useRouter();
  const getJob = useAppStore((s) => s.getJob);
  const refreshProjects = useAppStore((s) => s.refreshProjects);
  const generate = useAppStore((s) => s.generate);
  const review = useAppStore((s) => s.settings.reviewBeforeGenerate);
  const [progress, setProgress] = useState(project.status === "processing" ? project.progress : 100);
  const [busy, setBusy] = useState(false);

  const jobId = project.status === "processing" ? project.jobId : null;
  useEffect(() => {
    if (!jobId) return;
    let alive = true;
    const tick = async () => {
      const job = await getJob(jobId);
      if (!alive) return;
      setProgress(job?.progress ?? 100);
      if (!job || job.status === "done") {
        clearInterval(timer);
        void refreshProjects();
      }
    };
    const timer = setInterval(() => void tick(), POLL_MS);
    void tick();
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [jobId, getJob, refreshProjects]);

  const done = progress >= 100;
  const stages = processingStages(progress);

  const next = async () => {
    if (review) {
      router.push(routes.project(project.id, "review"));
      return;
    }
    setBusy(true);
    const analysis = await getApi().analysis.get(project.id);
    await generate(project.id, analysis.defaultSelected);
    router.push(routes.project(project.id, "overview"));
  };

  return (
    <div className="mx-auto mt-6 flex max-w-[760px] flex-col gap-5">
      <div className="grid grid-cols-8 gap-1.5" aria-hidden>
        {processingFrames(progress).map((f, i) => (
          <div
            key={i}
            className="aspect-[16/10] rounded-md bg-stripe-frame transition-opacity duration-300"
            style={{ opacity: f.visible ? 1 : 0.15, outline: f.accent ? `2px solid ${f.accent}` : "none" }}
          />
        ))}
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <PageTitle size="md" className="!text-[30px]">
          {done ? "Your site is ready" : "Reading your recording…"}
        </PageTitle>
        <span className="font-mono text-[15px] font-semibold text-orange-hi" data-testid="processing-pct">
          {Math.round(progress)}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Analysis progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        className="h-2 overflow-hidden rounded-full bg-line"
      >
        <div className="h-full rounded-full bg-orange" style={{ width: `${progress}%` }} />
      </div>
      <ul className="m-0 flex list-none flex-col p-0 text-[15px]" aria-label="Analysis stages">
        {stages.map((s) => (
          <li key={s.label.split(" · ")[0]} className={cn("flex justify-between gap-3 border-b border-divider py-3", s.state === "queued" ? "text-fg-ghost" : "text-fg")}>
            <span className="flex items-center gap-2.5">
              <span aria-hidden className={cn("size-2 flex-none rounded-full", s.state === "active" && "animate-fb-pulse")} style={{ background: DOT[s.state] }} />
              {s.label}
            </span>
            <span className={cn("font-mono text-xs", s.state === "active" ? "text-orange" : "text-fg-dim")}>{s.status}</span>
          </li>
        ))}
      </ul>
      <p className="m-0 font-mono text-[11px] text-fg-faint">Simulated analysis: this demo doesn&apos;t process your video yet.</p>
      {done && (
        <div className="flex justify-end">
          <Button variant="primary" size="lg" onClick={() => void next()} disabled={busy}>
            {review ? "Review analysis →" : "Generate site →"}
          </Button>
        </div>
      )}
    </div>
  );
}
