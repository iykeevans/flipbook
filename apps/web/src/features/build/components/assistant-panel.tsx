"use client";

import { useState, type FormEvent } from "react";
import { cn } from "@/components/ui";
import type { BuildState } from "@/lib/domain/types";
import { useAppStore } from "@/lib/store/app-store";
import { useProject } from "@/features/project";

export function AssistantPanel({ build, onApplied }: { build: BuildState; onApplied: () => void }) {
  const project = useProject();
  const ask = useAppStore((s) => s.ask);
  const acceptEdit = useAppStore((s) => s.acceptEdit);
  const rejectEdit = useAppStore((s) => s.rejectEdit);
  const regenerate = useAppStore((s) => s.regenerate);
  const [draft, setDraft] = useState("");

  const send = (e?: FormEvent) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    void ask(project.id, { text });
  };

  const showSuggestions = !build.pending && build.suggestions.length > 0;

  return (
    <section className="flex min-w-0 flex-col gap-2.5 border-t border-line p-3 lg:border-t-0 lg:border-l text-[13px]" aria-label="Assistant">
      <span className="font-mono text-[10px] font-semibold text-fg-dim">ASSISTANT</span>
      <div className="flex flex-1 flex-col gap-2 overflow-auto" aria-live="polite" data-testid="chat">
        {build.chat.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[92%] px-2.5 py-2 leading-[1.4]",
              m.fromUser ? "self-end rounded-[10px_10px_2px_10px] bg-control-alt text-fg" : "self-start rounded-[10px_10px_10px_2px] bg-panel text-fg-muted",
            )}
          >
            {m.text}
          </div>
        ))}
        {build.pending && (
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={async () => {
                await acceptEdit(project.id);
                onApplied();
              }}
              className="flex-1 rounded-[7px] bg-mint p-[7px] text-center font-semibold text-ink hover:bg-mint-hi"
            >
              Accept
            </button>
            <button type="button" onClick={() => void rejectEdit(project.id)} className="flex-1 rounded-[7px] bg-control p-[7px] text-center hover:bg-control-hover">
              Reject
            </button>
          </div>
        )}
        {showSuggestions && (
          <div className="mt-auto flex flex-col gap-1.5">
            {build.suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => void ask(project.id, { editId: s.id })}
                className="rounded-lg border border-edge-2 px-[9px] py-[7px] text-left leading-[1.35] text-fg-muted transition-colors hover:border-fg-sep hover:text-fg"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <form className="flex gap-1.5" onSubmit={send}>
        <label htmlFor="assistant-draft" className="sr-only">
          Ask for a change
        </label>
        <input
          id="assistant-draft"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask for a change…"
          className="h-[34px] min-w-0 flex-1 rounded-[7px] border border-edge-2 bg-ink px-[9px] text-[13px] text-fg"
        />
        <button
          type="submit"
          aria-label="Send"
          className="grid size-[34px] flex-none place-items-center rounded-[7px] bg-fg font-extrabold text-ink hover:bg-white"
        >
          ↑
        </button>
      </form>
      <span className="text-[11px] text-fg-faint">
        Regenerate:{" "}
        <button type="button" onClick={async () => {
            await regenerate(project.id, "site");
            onApplied();
          }} className="text-mint underline-offset-2 hover:text-fg hover:underline">
          whole site
        </button>{" "}
        ·{" "}
        <button type="button" onClick={async () => {
            await regenerate(project.id, "section");
            onApplied();
          }} className="text-mint underline-offset-2 hover:text-fg hover:underline">
          this section
        </button>
      </span>
    </section>
  );
}
