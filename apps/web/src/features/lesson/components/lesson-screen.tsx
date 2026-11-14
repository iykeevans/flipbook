"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MonoNote, Segmented, cn } from "@/components/ui";
import { useApiQuery } from "@/lib/api/use-api-query";
import { LESSON_LEVEL_OPTIONS } from "@/lib/domain/constants";
import { LESSON_ID, LESSON_STEP_LABELS } from "@/lib/domain/lesson";
import type { Lesson, LessonLevel } from "@/lib/domain/types";
import { routes } from "@/lib/routes";
import { useAppStore } from "@/lib/store/app-store";
import { useProject } from "@/features/project";
import { CodeStep } from "./code-step";
import { PlayStep } from "./play-step";
import { QuizStep } from "./quiz-step";
import { SeeStep } from "./see-step";

export function LessonScreen() {
  const query = useApiQuery(`lesson:${LESSON_ID}`, (api) => api.lessons.get(LESSON_ID));
  if (query.status !== "ready") return <MonoNote className="text-fg-faint">Loading lesson…</MonoNote>;
  return <LessonBody lesson={query.data} />;
}

function LessonBody({ lesson }: { lesson: Lesson }) {
  const project = useProject();
  const router = useRouter();
  const step = useAppStore((s) => s.progress?.lessonStep ?? 1);
  const level = useAppStore((s) => s.settings.lessonLevel);
  const setLessonStep = useAppStore((s) => s.setLessonStep);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const completeLesson = useAppStore((s) => s.completeLesson);
  const [run, setRun] = useState(0);

  const goStep = (n: number) => {
    setRun((r) => r + 1);
    void setLessonStep(n);
  };

  const finish = async () => {
    await completeLesson(lesson.id);
    router.push(routes.project(project.id, "learn/challenge"));
  };

  const copy = lesson.steps[step - 1] ?? lesson.steps[0]!;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={routes.animation(project.id, lesson.animationId)} className="text-sm text-fg-dim no-underline hover:text-fg">
          ← Animations
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <Segmented<LessonLevel>
            label="Lesson difficulty"
            options={LESSON_LEVEL_OPTIONS.map((l, i) => ({ value: i as LessonLevel, label: l }))}
            value={level}
            onChange={(v) => void updateSettings({ lessonLevel: v })}
            className="gap-0.5 rounded-lg bg-panel p-[3px] text-xs"
            itemClassName="rounded-md px-[9px] py-[5px]"
            activeClassName="bg-mint text-ink"
          />
          <nav aria-label="Lesson steps">
            <ol className="m-0 flex list-none flex-wrap gap-1.5 p-0">
              {LESSON_STEP_LABELS.map((label, i) => {
                const on = step === i + 1;
                return (
                  <li key={label}>
                    <button
                      type="button"
                      aria-current={on ? "step" : undefined}
                      onClick={() => goStep(i + 1)}
                      className={cn("rounded-full px-3 py-1.5 text-[13px] transition-colors", on ? "bg-mint text-ink" : "bg-control text-fg-muted hover:text-fg")}
                    >
                      {label}
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-start gap-7">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[11px] font-semibold text-mint" data-testid="lesson-eyebrow">
            CARD STAGGER · STEP {step} OF 4 · {LESSON_LEVEL_OPTIONS[level].toUpperCase()}
          </span>
          <h1 className="m-0 text-[30px] leading-[1.05] font-extrabold tracking-[-0.02em] text-pretty">{copy.title}</h1>
          <p className="m-0 text-[15px] leading-[1.55] text-pretty text-fg-muted">{copy.body}</p>
          {step === 2 && <p className="m-0 rounded-[10px] bg-panel px-3.5 py-3 text-sm leading-[1.45]">{lesson.tryPrompt}</p>}
        </div>
        <div className="flex min-w-0 flex-col gap-3.5">
          {step === 1 && <SeeStep lesson={lesson} run={run} onReplay={() => setRun((r) => r + 1)} onNext={() => goStep(2)} />}
          {step === 2 && <PlayStep onNext={() => goStep(3)} />}
          {step === 3 && <CodeStep lesson={lesson} level={level} onDone={() => goStep(4)} />}
          {step === 4 && <QuizStep lesson={lesson} onFinish={finish} />}
        </div>
      </div>
    </div>
  );
}
