import { cn } from "./cn";

/** The 36×21 pill switch from the prototype. Purely visual; put it inside a button with role="switch". */
export function SwitchKnob({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={cn("relative h-[21px] w-9 flex-none rounded-full transition-colors duration-200", on ? "bg-mint" : "bg-edge-2")}
    >
      <span
        className="absolute top-[3px] size-[15px] rounded-full bg-ink transition-[left] duration-200"
        style={{ left: on ? 18 : 3 }}
      />
    </span>
  );
}

export function SwitchRow({
  label,
  on,
  onToggle,
  className,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={cn("flex w-full items-center justify-between gap-4 border-b border-divider text-left", className)}
    >
      <span>{label}</span>
      <SwitchKnob on={on} />
    </button>
  );
}
