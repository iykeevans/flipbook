import { RECORDING_SECONDS } from "./constants";

export function matchPercent(fixed: boolean): number {
  return fixed ? 99 : 94;
}

export function matchMessage(fixed: boolean): string {
  return fixed ? "match. Within one frame of the recording." : "match. First card enters 120ms late and slides 8px short.";
}

export function clampTime(t: number): number {
  return Math.max(0, Math.min(RECORDING_SECONDS, t));
}

/** Maps a pointer x position on the scrub track to a recording time in seconds. */
export function timeFromPointer(clientX: number, trackLeft: number, trackWidth: number): number {
  if (trackWidth <= 0) return 0;
  return clampTime(((clientX - trackLeft) / trackWidth) * RECORDING_SECONDS);
}

export function formatTimestamp(seconds: number): string {
  const s = Math.floor(Math.max(0, seconds));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function heroOpacity(t: number): number {
  return Math.max(0.15, Math.min(1, (t - 2) / 3));
}

export interface MiniCardFrame {
  opacity: number;
  y: number;
  /** The off-by-120ms card that the "Fix it" action corrects. */
  flagged: boolean;
}

export function miniCardFrames(t: number, fixed: boolean): MiniCardFrame[] {
  return [0, 1, 2].map((i) => {
    const flagged = !fixed && i === 0;
    const lag = flagged ? 1.2 : 0;
    const k = Math.max(0, Math.min(1, (t - 10 - i * 0.9 - lag) / 1.2));
    return { opacity: k, y: (1 - k) * 24 + (flagged ? 8 * k : 0), flagged };
  });
}

export function parseTimeParam(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? clampTime(n) : null;
}
