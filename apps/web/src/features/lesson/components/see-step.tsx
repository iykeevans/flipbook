import { StaggerCards } from "@/components/motion/stagger-cards";
import { Button } from "@/components/ui";
import { COLORS, EASES } from "@/lib/domain/constants";
import { CHALLENGE_TARGET } from "@/lib/domain/scoring";
import type { Lesson } from "@/lib/domain/types";

export function SeeStep({ lesson, run, onReplay, onNext }: { lesson: Lesson; run: number; onReplay: () => void; onNext: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-[240px] flex-col justify-end rounded-xl bg-panel p-6">
        <StaggerCards
          run={run}
          durationMs={CHALLENGE_TARGET.durationMs}
          staggerMs={CHALLENGE_TARGET.staggerMs}
          ease={EASES[CHALLENGE_TARGET.easeIndex]!}
          color={COLORS.mint}
          essential
          testId="lesson-cards"
        />
      </div>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0 font-mono text-xs text-fg-muted">
        {lesson.facts.map((f) => (
          <li key={f} className="rounded-[7px] bg-panel px-2.5 py-1.5">
            {f}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Button onClick={onReplay}>↻ Replay</Button>
        <Button variant="mint" onClick={onNext}>
          Next: play with it →
        </Button>
      </div>
    </div>
  );
}
