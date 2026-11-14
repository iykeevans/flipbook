"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { COLORS, EASES } from "@/lib/domain/constants";
import { bezierPath, PLAYGROUND_LIMITS, playgroundCss } from "@/lib/domain/lesson";
import { CHALLENGE_TARGET } from "@/lib/domain/scoring";
import { EaseChips } from "@/components/motion/ease-chips";
import { RangeRow } from "@/components/motion/range-row";

export function PlayStep({ onNext }: { onNext: () => void }) {
  const [easeIndex, setEaseIndex] = useState(CHALLENGE_TARGET.easeIndex);
  const [duration, setDuration] = useState(CHALLENGE_TARGET.durationMs);
  const [stagger, setStagger] = useState(CHALLENGE_TARGET.staggerMs);
  const ease = EASES[easeIndex]!;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex h-[150px] items-center gap-5 rounded-xl bg-panel px-5 py-[18px]">
        <div className="min-w-0 flex-1 overflow-hidden" aria-hidden data-testid="playground-demo">
          <div key={`${duration}-${stagger}-${easeIndex}`} className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-6 w-11 rounded-md bg-mint"
                style={{ animation: `fb-slide ${duration}ms ${ease.css} ${i * stagger}ms infinite alternate both` }}
              />
            ))}
          </div>
        </div>
        <svg width="100" height="100" viewBox="0 0 100 100" className="flex-none" role="img" aria-label={`Easing curve: ${ease.label}`}>
          <rect x="0" y="0" width="100" height="100" rx="10" fill="#141416" />
          <path d={bezierPath(ease.bezier)} fill="none" stroke={COLORS.mint} strokeWidth="3" data-testid="bezier-path" />
        </svg>
      </div>
      <EaseChips value={easeIndex} onChange={setEaseIndex} activeClassName="bg-fg text-ink" />
      <div className="grid grid-cols-[80px_1fr_64px] items-center gap-x-3 gap-y-2.5 font-mono text-xs text-fg-muted">
        <RangeRow label="duration" value={duration} {...PLAYGROUND_LIMITS.duration} onChange={setDuration} />
        <RangeRow label="stagger" value={stagger} {...PLAYGROUND_LIMITS.stagger} onChange={setStagger} />
      </div>
      <pre className="m-0 rounded-[10px] bg-sunken px-3.5 py-3 font-mono text-xs leading-[1.6] whitespace-pre-wrap text-fg-muted" data-testid="playground-css">
        {playgroundCss(duration, stagger, ease)}
      </pre>
      <div className="flex justify-end">
        <Button variant="mint" onClick={onNext}>
          Next: read the code →
        </Button>
      </div>
    </div>
  );
}
