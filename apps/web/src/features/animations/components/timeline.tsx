"use client";

import { cn } from "@/components/ui";
import { animationTag } from "@/lib/domain/animations";
import type { Animation } from "@/lib/domain/types";
import { useAppStore } from "@/lib/store/app-store";

const TAG_COLOR = { learned: "text-mint", locked: "text-fg-ghost", new: "text-yellow" } as const;

export function Timeline({ animations, selectedId, onSelect }: { animations: Animation[]; selectedId: string; onSelect: (id: string) => void }) {
  const progress = useAppStore((s) => s.progress);
  const learner = { learned: progress?.learned ?? [], xp: progress?.xp ?? 0, challengePassed: progress?.challenge.passed ?? false };

  return (
    <div className="rounded-xl border border-[#232327] bg-track px-[18px] pt-4 pb-2.5">
      <div className="grid grid-cols-[140px_1fr] pb-2 font-mono text-[10px] text-fg-ghost sm:grid-cols-[170px_1fr]" aria-hidden>
        <span />
        <div className="flex justify-between">
          {["0s", "1s", "2s", "3s", "4s"].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
      <ul className="m-0 list-none p-0" aria-label="Animation timeline">
        {animations.map((a) => {
          const on = a.id === selectedId;
          const tag = animationTag(a, learner);
          return (
            <li key={a.id}>
              <button
                type="button"
                aria-pressed={on}
                data-testid={`timeline-row-${a.id}`}
                onClick={() => onSelect(a.id)}
                className={cn(
                  "grid w-full grid-cols-[140px_1fr] border-t border-divider text-left transition-colors hover:bg-chip sm:grid-cols-[170px_1fr]",
                  on && "bg-raised",
                )}
              >
                <span className={cn("flex items-center gap-2 px-2 py-[11px] text-sm leading-[1.2]", on ? "text-fg" : "text-fg-muted")}>
                  {a.name}
                  <span className={cn("font-mono text-[10px]", TAG_COLOR[tag.kind])}>
                    {tag.kind === "learned" ? <span aria-label="learned">✓</span> : tag.label}
                  </span>
                </span>
                <span className="relative block" aria-hidden>
                  {a.bars.map((b, i) => (
                    <span
                      key={i}
                      className="absolute top-[9px] block h-[22px] rounded-md"
                      style={{
                        left: `${b.start}%`,
                        width: `${b.width}%`,
                        background: a.color,
                        opacity: 1 - i * 0.25,
                        outline: on ? "2px solid var(--color-fg)" : "none",
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
