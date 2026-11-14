"use client";

import { useState } from "react";
import { Button, cn } from "@/components/ui";
import { walkthroughIndex } from "@/lib/domain/lesson";
import type { Lesson, LessonLevel } from "@/lib/domain/types";

export function CodeStep({ lesson, level, onDone }: { lesson: Lesson; level: LessonLevel; onDone: () => void }) {
  const [walk, setWalk] = useState(0);
  const [asked, setAsked] = useState<number | null>(null);
  const entry = lesson.walkthrough[walk]!;
  const last = walk === lesson.walkthrough.length - 1;

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] items-start gap-3.5">
      <div className="flex min-w-0 flex-col gap-2.5">
        <div className="overflow-auto rounded-[10px] bg-sunken py-2.5 font-mono text-xs leading-[1.9]" role="group" aria-label="Code walkthrough">
          {lesson.codeLines.map((text, i) => {
            const k = walkthroughIndex(lesson.walkthrough, i);
            const on = k === walk;
            const style = cn("block w-full border-l-2 px-3.5 text-left whitespace-pre", on ? "border-mint bg-[rgba(120,220,170,.1)] text-fg" : "border-transparent");
            if (k < 0)
              return (
                <div key={i} className={cn(style, "text-fg-faint")}>
                  {text}
                </div>
              );
            return (
              <button
                key={i}
                type="button"
                aria-current={on ? "true" : undefined}
                aria-label={`Explain line ${i + 1}: ${text.trim()}`}
                onClick={() => setWalk(k)}
                className={cn(style, !on && "text-fg-soft hover:bg-hover")}
              >
                {text}
              </button>
            );
          })}
        </div>
        <p className="m-0 rounded-[10px] bg-panel px-3.5 py-3 text-sm leading-normal text-pretty" aria-live="polite" data-testid="walk-text">
          <b>{entry.head}</b> {entry.text[level]}
        </p>
        <div className="flex items-center justify-between text-sm">
          <Button size="md" disabled={walk === 0} className="px-3 py-2 disabled:opacity-40" onClick={() => setWalk((w) => Math.max(0, w - 1))}>
            ← Prev
          </Button>
          <span className="font-mono text-xs text-fg-dim">
            {walk + 1} / {lesson.walkthrough.length}
          </span>
          <Button variant={last ? "mint" : "secondary"} className="px-3 py-2 font-semibold" onClick={() => (last ? onDone() : setWalk((w) => w + 1))}>
            {last ? "Next: quick check →" : "Next line →"}
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-xl bg-panel p-3 text-[13px]" aria-label="Tutor" role="region">
        <span className="font-mono text-[10px] font-semibold text-fg-dim">TUTOR</span>
        {asked !== null && (
          <div className="flex flex-col gap-2" aria-live="polite">
            <div className="self-end rounded-[10px_10px_2px_10px] bg-control-alt px-2.5 py-2 leading-[1.4]">{lesson.tutor[asked]!.question}</div>
            <div className="rounded-[10px_10px_10px_2px] bg-ink px-2.5 py-2 leading-[1.45] text-fg-muted" data-testid="tutor-answer">
              {lesson.tutor[asked]!.answer}
            </div>
          </div>
        )}
        {lesson.tutor.map((q, i) =>
          i === asked ? null : (
            <button
              key={q.question}
              type="button"
              onClick={() => setAsked(i)}
              className="rounded-lg border border-edge-2 px-[9px] py-[7px] text-left leading-[1.35] text-fg-muted transition-colors hover:border-fg-sep hover:text-fg"
            >
              {q.question}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
