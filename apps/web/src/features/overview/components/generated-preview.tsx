import { COLORS } from "@/lib/domain/constants";
import { heroOpacity, miniCardFrames } from "@/lib/domain/match";

/** The generated site's mini render, driven frame-by-frame by the overview timeline. */
export function GeneratedPreview({ t, fixed }: { t: number; fixed: boolean }) {
  const hero = heroOpacity(t);
  return (
    <div className="flex aspect-[16/10] flex-col gap-3 overflow-hidden rounded-[10px] bg-paper p-[18px]" data-testid="generated-preview">
      <div className="flex justify-between">
        <div className="h-[9px] w-[60px] rounded-[2px] bg-paper-ink" />
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[7px] w-[26px] rounded-[2px] bg-paper-line" />
          ))}
        </div>
      </div>
      <div className="mt-3.5 h-5 w-[78%] rounded-[3px] bg-paper-ink" style={{ opacity: hero }} />
      <div className="h-5 w-[55%] rounded-[3px] bg-paper-ink" style={{ opacity: hero }} />
      <div className="h-2 w-[40%] rounded-[2px] bg-paper-muted" />
      <div className="mt-auto grid grid-cols-3 gap-2.5">
        {miniCardFrames(t, fixed).map((c, i) => (
          <div
            key={i}
            data-testid={c.flagged ? "flagged-card" : undefined}
            className="h-[clamp(36px,9vw,70px)] rounded-md bg-paper-card"
            style={{
              opacity: c.opacity,
              transform: `translateY(${c.y.toFixed(1)}px)`,
              outline: c.flagged ? `2px dashed ${COLORS.red}` : "none",
              outlineOffset: 3,
            }}
          />
        ))}
      </div>
    </div>
  );
}
