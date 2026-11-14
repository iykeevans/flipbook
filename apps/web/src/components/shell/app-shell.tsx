"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui";
import { useAppStore } from "@/lib/store/app-store";
import { SidebarContent } from "./sidebar";
import { Toaster } from "./toaster";
import { TopBar } from "./top-bar";
import { useShellContext } from "./use-shell-context";

export function AppShell({ children }: { children: ReactNode }) {
  const status = useAppStore((s) => s.status);
  const init = useAppStore((s) => s.init);
  const reduceMotion = useAppStore((s) => s.settings.reduceMotion);
  const loadVersions = useAppStore((s) => s.loadVersions);
  const ctx = useShellContext();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);

  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = String(reduceMotion);
  }, [reduceMotion]);

  const projectId = ctx.project?.id;
  const hasVersions = useAppStore((s) => (projectId ? !!s.cache[projectId]?.versions : true));
  useEffect(() => {
    if (projectId && !hasVersions) void loadVersions(projectId);
  }, [projectId, hasVersions, loadVersions]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}>
      <div className="flex min-h-screen flex-col">
        <TopBar ctx={ctx} menuOpen={menuOpen} onOpenMenu={() => setMenuOpen(true)} />
        <div className="flex min-h-0 flex-1">
          {ctx.sidebar && status === "ready" && (
            <aside className="sticky top-[54px] hidden h-[calc(100vh-54px)] w-[200px] flex-none border-r border-line md:block">
              <SidebarContent ctx={ctx} />
            </aside>
          )}
          <main className="min-w-0 flex-1 px-[clamp(16px,4vw,48px)] pt-8 pb-12" id="main">
            <div className="mx-auto max-w-[1200px]">
              {status === "ready" ? (
                children
              ) : status === "error" ? (
                <div className="flex flex-col items-start gap-3">
                  <p className="m-0 text-fg-muted">Couldn&apos;t load your workspace.</p>
                  <Button onClick={() => void init()}>Try again</Button>
                </div>
              ) : (
                <p className="m-0 font-mono text-xs text-fg-faint" aria-busy="true">
                  Loading your workspace…
                </p>
              )}
            </div>
          </main>
        </div>
      </div>
      <AnimatePresence>
        {menuOpen && ctx.sidebar && (
          <div className="fixed inset-0 z-40 md:hidden">
            <motion.button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0 bg-black/60"
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              id="mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              className="absolute inset-y-0 left-0 w-[240px] border-r border-line bg-ink"
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <SidebarContent ctx={ctx} onNavigate={() => setMenuOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Toaster />
    </MotionConfig>
  );
}
