"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, ButtonLink, PageTitle } from "@/components/ui";
import { RECORDING_SECONDS } from "@/lib/domain/constants";
import { formatTimestamp, matchMessage, matchPercent, parseTimeParam } from "@/lib/domain/match";
import { routes } from "@/lib/routes";
import { useAppStore } from "@/lib/store/app-store";
import { useProject } from "@/features/project";
import { GeneratedPreview } from "./generated-preview";
import { Scrubber } from "./scrubber";

const DEFAULT_T = 12;
const TICK_MS = 50;
const TICK_SECONDS = 0.25;

export function OverviewScreen() {
  const project = useProject();
  const params = useSearchParams();
  const fixMatch = useAppStore((s) => s.fixMatch);
  const [t, setT] = useState(() => parseTimeParam(params.get("t")) ?? DEFAULT_T);
  const [playing, setPlaying] = useState(false);
  const [fixing, setFixing] = useState(false);

  const queryT = params.get("t");
  const [seenQueryT, setSeenQueryT] = useState(queryT);
  if (queryT !== seenQueryT) {
    setSeenQueryT(queryT);
    const parsed = parseTimeParam(queryT);
    if (parsed !== null) setT(parsed);
  }

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setT((cur) => {
        const next = cur + TICK_SECONDS;
        if (next >= RECORDING_SECONDS) {
          setPlaying(false);
          return RECORDING_SECONDS;
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [playing]);

  const togglePlay = () => {
    if (playing) return setPlaying(false);
    if (t >= RECORDING_SECONDS) setT(0);
    setPlaying(true);
  };

  const fixed = project.matchFixed;
  const label = formatTimestamp(t);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle size="md">Recording vs generated</PageTitle>
        <span className="font-mono text-xs text-fg-dim">scrub to compare frame by frame</span>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-3.5">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[11px] font-semibold text-fg-dim">RECORDING</span>
          <div className="grid aspect-[16/10] place-items-center rounded-[10px] bg-stripe-lg font-mono text-xs text-fg-faint" data-testid="recording-frame">
            video frame @ {label}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[11px] font-semibold text-mint">GENERATED · live</span>
          <GeneratedPreview t={t} fixed={fixed} />
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
          className="grid size-[34px] flex-none place-items-center rounded-full bg-fg text-xs font-extrabold text-ink hover:bg-white"
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <Scrubber
          t={t}
          onChange={(next) => {
            setPlaying(false);
            setT(next);
          }}
        />
        <span className="font-mono text-xs whitespace-nowrap text-fg-dim" data-testid="time-label">
          {label} / {formatTimestamp(RECORDING_SECONDS)}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3.5 rounded-xl bg-panel px-4 py-3.5">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-[30px] font-extrabold text-mint" data-testid="match-pct">
            {matchPercent(fixed)}%
          </span>
          <span className="text-[15px]">{matchMessage(fixed)}</span>
        </div>
        {fixed ? (
          <ButtonLink href={routes.project(project.id, "animations")} variant="secondary">
            See the 5 animations →
          </ButtonLink>
        ) : (
          <Button
            variant="primary"
            disabled={fixing}
            onClick={async () => {
              setFixing(true);
              await fixMatch(project.id);
              setFixing(false);
            }}
          >
            Fix it · +30 XP
          </Button>
        )}
      </div>
    </div>
  );
}
