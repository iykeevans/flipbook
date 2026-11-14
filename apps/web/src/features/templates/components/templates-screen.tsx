"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageTitle, Segmented, cn } from "@/components/ui";
import { COLORS } from "@/lib/domain/constants";
import type { Template } from "@/lib/domain/types";
import { routes } from "@/lib/routes";
import { useAppStore } from "@/lib/store/app-store";
import { TAG_ORDER } from "../constants";

type LevelFilter = "All" | Template["level"];
const LEVELS: LevelFilter[] = ["All", "Beginner", "Intermediate", "Advanced"];
const LEVEL_COLOR: Record<Template["level"], string> = { Beginner: COLORS.mint, Intermediate: COLORS.yellow, Advanced: COLORS.lilac };

export function TemplatesScreen() {
  const router = useRouter();
  const templates = useAppStore((s) => s.templates);
  const openTemplate = useAppStore((s) => s.openTemplate);
  const [level, setLevel] = useState<LevelFilter>("All");
  const [tag, setTag] = useState<string | null>(null);
  const [opening, setOpening] = useState<string | null>(null);

  const seen = Array.from(new Set(templates.flatMap((t) => t.tags)));
  const tags = [...TAG_ORDER.filter((t) => seen.includes(t)), ...seen.filter((t) => !TAG_ORDER.includes(t))];
  const visible = templates.filter((t) => (level === "All" || t.level === level) && (!tag || t.tags.includes(tag)));

  const open = async (t: Template) => {
    if (opening) return;
    setOpening(t.id);
    const project = await openTemplate(t.id);
    router.push(routes.overviewAt(project.id, 12));
  };

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <PageTitle>Start from a sample</PageTitle>
          <p className="m-0 text-[15px] text-fg-subtle">Analysis is done and lessons are ready. Opens straight to Overview.</p>
        </div>
        <Segmented label="Filter by level" options={LEVELS.map((l) => ({ value: l, label: l }))} value={level} onChange={setLevel} />
      </div>
      <div role="group" aria-label="Filter by technique" className="flex flex-wrap gap-1.5 font-mono text-xs">
        {tags.map((g) => {
          const on = tag === g;
          return (
            <button
              key={g}
              type="button"
              aria-pressed={on}
              onClick={() => setTag(on ? null : g)}
              className={cn("rounded-full border px-2.5 py-[5px] transition-colors", on ? "border-fg bg-fg text-ink" : "border-edge-2 text-fg-muted hover:text-fg")}
            >
              {g}
            </button>
          );
        })}
      </div>
      {visible.length > 0 ? (
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 p-0">
          {visible.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => void open(t)}
                disabled={opening !== null}
                data-testid={`template-${t.id}`}
                className="group flex w-full flex-col gap-[7px] rounded-[10px] text-left disabled:opacity-100"
              >
                <span className="relative block h-[150px] w-full rounded-[10px] bg-stripe outline-edge-4 group-hover:outline-[1.5px]">
                  <span className="absolute top-2 left-2 rounded-[5px] px-[7px] py-[3px] font-mono text-[10px] font-semibold text-ink" style={{ background: LEVEL_COLOR[t.level] }}>
                    {t.level.toUpperCase()}
                  </span>
                  <span className="absolute right-2.5 bottom-2 font-mono text-[11px] text-fg-dim">{t.length}</span>
                </span>
                <b className="text-base">{t.name}</b>
                <span className="text-[13px] text-fg-dim">
                  {t.tags.join(", ")} · {t.lessons} lessons
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-sm text-fg-dim" data-testid="templates-empty">
          No samples match that combination.
        </p>
      )}
    </div>
  );
}
