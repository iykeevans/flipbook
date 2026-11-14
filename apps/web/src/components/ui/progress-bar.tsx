import { cn } from "./cn";

export function ProgressBar({
  value,
  label,
  className,
  barClassName = "bg-mint",
  height = 5,
}: {
  value: number;
  label: string;
  className?: string;
  barClassName?: string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className={cn("overflow-hidden rounded-full bg-edge-2", className)}
      style={{ height }}
    >
      <div className={cn("h-full rounded-full transition-[width] duration-600", barClassName)} style={{ width: `${pct}%` }} />
    </div>
  );
}
