"use client";

import { PageTitle, SwitchRow } from "@/components/ui";
import type { Settings } from "@/lib/domain/types";
import { useAppStore } from "@/lib/store/app-store";
import { SETTING_SECTIONS, type SettingRow } from "../constants";

const ROW = "flex w-full items-center justify-between gap-4 border-b border-divider py-[13px] text-left text-[15px]";

export function SettingsScreen() {
  const settings = useAppStore((s) => s.settings);
  const update = useAppStore((s) => s.updateSettings);
  const notify = useAppStore((s) => s.notify);
  const resetDemo = useAppStore((s) => s.resetDemo);

  const renderRow = (row: SettingRow) => {
    if (row.type === "toggle") {
      return <SwitchRow label={row.label} on={settings[row.key]} onToggle={() => void update({ [row.key]: !settings[row.key] })} className="py-[13px] text-[15px]" />;
    }
    if (row.type === "choice") {
      const current = settings[row.key];
      const value = row.options[current] ?? row.options[0];
      return (
        <button
          type="button"
          className={ROW}
          aria-label={`${row.label}: ${value}. Change`}
          onClick={() => void update({ [row.key]: (current + 1) % row.options.length } as Partial<Settings>)}
        >
          <span>{row.label}</span>
          <span className="font-mono text-[13px] text-fg-muted">{value} ▾</span>
        </button>
      );
    }
    const act = row.action === "manage-data" ? () => notify("Data export requested", "We'll email a download link") : () => void resetDemo();
    return (
      <div className={ROW}>
        <span>{row.label}</span>
        <button type="button" onClick={act} className="rounded-[7px] bg-line px-3 py-1.5 text-[13px] hover:bg-control-hover">
          {row.button}
        </button>
      </div>
    );
  };

  return (
    <div className="flex max-w-[720px] flex-col gap-1.5">
      <PageTitle>Settings</PageTitle>
      {SETTING_SECTIONS.map((section) => (
        <section key={section.title} aria-labelledby={`settings-${section.title}`} className="flex flex-col pt-5">
          <h2 id={`settings-${section.title}`} className="m-0 pb-1 font-mono text-[11px] font-semibold text-fg-dim">
            {section.title}
          </h2>
          <ul className="m-0 list-none p-0">
            {section.rows.map((row) => (
              <li key={row.label}>{renderRow(row)}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
