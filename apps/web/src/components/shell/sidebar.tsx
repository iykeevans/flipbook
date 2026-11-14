"use client";

import Link from "next/link";
import { ProgressBar, cn } from "@/components/ui";
import { TOTAL_ANIMATIONS } from "@/lib/domain/constants";
import { matchPercent } from "@/lib/domain/match";
import { routes, type ProjectScreen } from "@/lib/routes";
import type { ShellContext } from "./use-shell-context";

interface NavItem {
  label: string;
  href: string;
  meta: string;
  active: boolean;
}

function navItems(ctx: ShellContext): { title: string; items: NavItem[] } {
  const { route, project } = ctx;
  if (route.kind === "project" && project) {
    const at = (screen: ProjectScreen, ...also: ProjectScreen[]) => route.screen === screen || also.includes(route.screen);
    const p = project.id;
    return {
      title: project.name.toUpperCase(),
      items: [
        { label: "← All projects", href: routes.dashboard, meta: "", active: false },
        { label: "Overview", href: routes.project(p, "overview"), meta: `${matchPercent(project.matchFixed)}%`, active: at("overview") },
        { label: "Build", href: routes.project(p, "build"), meta: "", active: at("build") },
        { label: "Animations", href: routes.project(p, "animations"), meta: String(TOTAL_ANIMATIONS), active: at("animations") },
        { label: "Learn", href: routes.project(p, "learn"), meta: `${ctx.learnedCount}/${TOTAL_ANIMATIONS}`, active: at("learn", "learn/challenge") },
        { label: "Assets", href: routes.project(p, "assets"), meta: "9", active: at("assets") },
        { label: "History", href: routes.project(p, "history"), meta: ctx.version ? `v${ctx.version}` : "", active: at("history") },
        { label: "Export", href: routes.project(p, "export"), meta: "", active: at("export") },
      ],
    };
  }
  const screen = route.kind === "workspace" ? route.screen : null;
  return {
    title: "WORKSPACE",
    items: [
      { label: "Dashboard", href: routes.dashboard, meta: "", active: screen === "dashboard" },
      { label: "Templates", href: routes.templates, meta: "6", active: screen === "templates" },
      { label: "Your skills", href: routes.skills, meta: "", active: screen === "skills" },
      { label: "Settings", href: routes.settings, meta: "", active: screen === "settings" },
    ],
  };
}

export function SidebarContent({ ctx, onNavigate }: { ctx: ShellContext; onNavigate?: () => void }) {
  const { title, items } = navItems(ctx);
  return (
    <nav aria-label={ctx.route.kind === "project" ? "Project" : "Workspace"} className="flex h-full flex-col gap-1 px-2.5 py-4">
      <span className="px-2.5 pt-1 pb-2 font-mono text-[10px] font-semibold text-fg-ghost">{title}</span>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-[9px] text-sm no-underline transition-colors",
                item.active ? "bg-line text-fg hover:text-fg" : "text-[#9a9a94] hover:bg-hover hover:text-[#9a9a94]",
              )}
            >
              {item.label}
              <span className="font-mono text-[11px] text-fg-faint">{item.meta}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-col gap-1.5 rounded-[10px] bg-panel p-3 text-xs text-fg-muted">
        <span data-testid="learned-meter">
          {ctx.learnedCount} of {TOTAL_ANIMATIONS} animations learned
        </span>
        <ProgressBar value={(ctx.learnedCount / TOTAL_ANIMATIONS) * 100} label="Animations learned" />
      </div>
    </nav>
  );
}
