import { cn } from "@/components/ui";
import { EASES } from "@/lib/domain/constants";

export function EaseChips({ value, onChange, activeClassName }: { value: number; onChange: (i: number) => void; activeClassName: string }) {
  return (
    <div role="group" aria-label="Easing" className="flex flex-wrap gap-1.5">
      {EASES.map((e, i) => (
        <button
          key={e.label}
          type="button"
          aria-pressed={i === value}
          onClick={() => onChange(i)}
          className={cn("rounded-lg px-[11px] py-[7px] font-mono text-xs transition-colors", i === value ? activeClassName : "bg-control text-fg-muted hover:text-fg")}
        >
          {e.label}
        </button>
      ))}
    </div>
  );
}
