"use client";

import { useState } from "react";
import { Button, cn } from "@/components/ui";
import { COLORS } from "@/lib/domain/constants";
import type { Lesson } from "@/lib/domain/types";

export function QuizStep({ lesson, onFinish }: { lesson: Lesson; onFinish: () => Promise<void> }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const choice = picked === null ? null : lesson.quiz[picked]!;

  return (
    <div className="flex flex-col gap-2.5">
      <div role="group" aria-label="Answers" className="flex flex-col gap-2.5">
        {lesson.quiz.map((q, i) => {
          const on = picked === i;
          const tone = on ? (q.correct ? COLORS.mint : COLORS.red) : "#2a2a2e";
          return (
            <button
              key={q.label}
              type="button"
              aria-pressed={on}
              onClick={() => setPicked(i)}
              className={cn("flex items-center justify-between rounded-xl px-[18px] py-4 text-left text-base transition-colors hover:bg-hover", on ? "bg-[#1f1f23]" : "bg-panel-alt")}
              style={{ border: `1.5px solid ${tone}` }}
            >
              <span>{q.label}</span>
              <span className="font-mono text-xs" style={{ color: tone }}>
                {on ? (q.correct ? "correct" : "try again") : ""}
              </span>
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {choice && (
          <p className="m-0 rounded-[10px] bg-panel px-3.5 py-3 text-sm leading-[1.45]" data-testid="quiz-feedback">
            {choice.feedback}
          </p>
        )}
      </div>
      {choice?.correct && (
        <div className="flex justify-end">
          <Button
            variant="mint"
            size="lg"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await onFinish();
            }}
          >
            Finish lesson · +{lesson.xp} XP
          </Button>
        </div>
      )}
    </div>
  );
}
