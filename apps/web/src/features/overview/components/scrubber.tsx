"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { RECORDING_SECONDS } from "@/lib/domain/constants";
import { clampTime, formatTimestamp, timeFromPointer } from "@/lib/domain/match";

/** Click-or-drag timeline. Exposed as a slider so it is keyboard operable (arrows ±1s, Home/End). */
export function Scrubber({ t, onChange }: { t: number; onChange: (t: number) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const pct = (t / RECORDING_SECONDS) * 100;

  const fromPointer = (e: PointerEvent) => {
    const r = track.current!.getBoundingClientRect();
    onChange(timeFromPointer(e.clientX, r.left, r.width));
  };

  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 5 : 1;
    const next =
      e.key === "ArrowRight" || e.key === "ArrowUp" ? t + step : e.key === "ArrowLeft" || e.key === "ArrowDown" ? t - step : e.key === "Home" ? 0 : e.key === "End" ? RECORDING_SECONDS : null;
    if (next === null) return;
    e.preventDefault();
    onChange(clampTime(next));
  };

  return (
    <div
      ref={track}
      role="slider"
      tabIndex={0}
      aria-label="Recording time"
      aria-valuemin={0}
      aria-valuemax={RECORDING_SECONDS}
      aria-valuenow={Math.floor(t)}
      aria-valuetext={formatTimestamp(t)}
      data-testid="scrubber"
      onKeyDown={onKey}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture?.(e.pointerId);
        fromPointer(e);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) fromPointer(e);
      }}
      className="relative flex h-[22px] flex-1 cursor-pointer touch-none items-center rounded-full"
    >
      <div className="h-1.5 w-full rounded-full bg-line">
        <div className="h-full rounded-full bg-fg" style={{ width: `${pct}%` }} />
      </div>
      <div aria-hidden className="absolute size-4 -translate-x-1/2 rounded-full bg-fg" style={{ left: `${pct}%` }} />
    </div>
  );
}
