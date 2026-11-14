export function RangeRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  accent,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  accent?: string;
}) {
  const id = `range-${label}`;
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={accent ? { accentColor: accent } : undefined}
        className="w-full min-w-0"
      />
      <output htmlFor={id} className="text-fg">
        {value}ms
      </output>
    </>
  );
}
