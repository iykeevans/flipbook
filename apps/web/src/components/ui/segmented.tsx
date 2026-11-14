import { cn } from "./cn";

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
}

/** A row of mutually exclusive pressed-state buttons (filters, tabs, level pickers). */
export function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
  className,
  itemClassName,
  activeClassName = "bg-line text-fg",
}: {
  label: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  itemClassName?: string;
  activeClassName?: string;
}) {
  return (
    <div role="group" aria-label={label} className={cn("flex flex-wrap gap-1 text-[13px]", className)}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={cn("rounded-[7px] px-3 py-1.5 transition-colors", on ? activeClassName : "text-fg-dim hover:text-fg", itemClassName)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
