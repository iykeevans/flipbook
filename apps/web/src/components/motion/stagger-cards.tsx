import { CHALLENGE_TARGET } from "@/lib/domain/scoring";
import { EASES } from "@/lib/domain/constants";
import type { Ease } from "@/lib/domain/types";

const TARGET_EASE = EASES[CHALLENGE_TARGET.easeIndex]!;

/**
 * Three cards entering with `fb-up`, as used by the prototype's previews, lessons and challenge.
 * Change `run` to replay. `ghost` overlays the dashed target motion for comparison.
 */
export function StaggerCards({
  run,
  durationMs,
  staggerMs,
  ease,
  color,
  height = 110,
  columns = 3,
  gap = 14,
  outline,
  ghost = false,
  essential = false,
  testId,
}: {
  run: number;
  durationMs: number;
  staggerMs: number;
  ease: Ease;
  color: string;
  height?: number;
  columns?: number;
  gap?: number;
  outline?: string;
  ghost?: boolean;
  essential?: boolean;
  testId?: string;
}) {
  return (
    <div
      className="grid items-end"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap }}
      data-testid={testId}
      data-essential-motion={essential || undefined}
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <div key={`${run}-${i}`} className="relative" style={{ height }}>
          <div
            data-testid={testId ? `${testId}-card` : undefined}
            className="absolute inset-0 rounded-lg"
            style={{
              background: color,
              opacity: ghost ? 0.55 : 1,
              animation: `fb-up ${durationMs}ms ${ease.css} ${i * staggerMs}ms both`,
              outline: outline ?? "none",
              outlineOffset: 3,
            }}
          />
          {ghost && (
            <div
              className="absolute inset-0 z-[1] rounded-lg border-2 border-dashed border-fg"
              style={{ animation: `fb-up ${CHALLENGE_TARGET.durationMs}ms ${TARGET_EASE.css} ${i * CHALLENGE_TARGET.staggerMs}ms both` }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
