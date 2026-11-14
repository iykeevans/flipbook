"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/ui";
import { routes } from "@/lib/routes";
import { Logo } from "./logo";
import type { ShellContext } from "./use-shell-context";

export function TopBar({ ctx, onOpenMenu, menuOpen }: { ctx: ShellContext; onOpenMenu: () => void; menuOpen: boolean }) {
  return (
    <header className="sticky top-0 z-30 flex h-[54px] flex-none items-center justify-between gap-4 border-b border-line bg-ink px-4 md:px-5">
      <div className="flex min-w-0 items-center gap-2.5 text-sm">
        {ctx.sidebar && (
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open navigation"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="-ml-1 grid size-8 flex-none place-items-center rounded-md text-fg-muted hover:bg-hover md:hidden"
          >
            <span aria-hidden className="flex flex-col gap-[3px]">
              <span className="block h-[1.5px] w-4 bg-current" />
              <span className="block h-[1.5px] w-4 bg-current" />
              <span className="block h-[1.5px] w-4 bg-current" />
            </span>
          </button>
        )}
        <Logo />
        <span aria-hidden className="hidden text-fg-sep sm:inline">
          /
        </span>
        <span className="hidden truncate text-fg-dim sm:inline" data-testid="breadcrumb">
          {ctx.crumb}
        </span>
      </div>
      <div className="flex flex-none items-center gap-2 font-mono text-xs font-semibold">
        <span
          className="hidden rounded-full border border-edge-2 px-2 py-[3px] text-[10px] font-semibold tracking-wide text-fg-faint lg:inline"
          title="Sample workspace: analysis, generation, the assistant and deploys are simulated."
        >
          DEMO DATA
        </span>
        {ctx.showXp && (
          <div className="flex items-center gap-2" data-testid="xp-chips">
            <span className="hidden rounded-full bg-chip px-2.5 py-[5px] text-yellow sm:inline">{ctx.streak}-day streak</span>
            <Link
              href={routes.skills}
              className="flex items-center gap-2 rounded-full bg-chip px-2.5 py-[5px] text-lilac-chip no-underline hover:bg-[#2a2a30] hover:text-lilac-chip"
              aria-label={`Level ${ctx.level.level}, ${ctx.level.xp.toLocaleString("en-US")} XP. View your skills`}
            >
              <span data-testid="xp-chip-text">
                Lv {ctx.level.level}
                <span className="hidden sm:inline"> · {ctx.level.xp.toLocaleString("en-US")} XP</span>
              </span>
              <span aria-hidden className="block h-[5px] w-12 overflow-hidden rounded-full bg-edge-2">
                <span className="block h-full bg-lilac-chip transition-[width] duration-600" style={{ width: `${ctx.level.pct}%` }} />
              </span>
            </Link>
          </div>
        )}
        <ButtonLink href={routes.newProject} variant="light" className="!rounded-full !px-3 !py-[5px] font-sans !text-[13px] font-normal">
          New project
        </ButtonLink>
      </div>
    </header>
  );
}
