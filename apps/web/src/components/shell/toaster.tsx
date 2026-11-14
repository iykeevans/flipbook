"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { useAppStore } from "@/lib/store/app-store";

export function Toaster() {
  const toast = useAppStore((s) => s.toast);
  const dismiss = useAppStore((s) => s.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => dismiss(toast.id), toast.levelUp ? 3600 : 2400);
    return () => clearTimeout(t);
  }, [toast, dismiss]);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-7 z-50 flex justify-center px-4">
      {/* Toasts overlap in one slot so a replaced toast fades out underneath the new one. */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            data-testid="toast"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute bottom-0 flex max-w-[calc(100vw-32px)] min-w-[220px] flex-col gap-0.5 rounded-[14px] px-5 py-3.5 text-center text-ink shadow-[0_12px_40px_rgba(0,0,0,.4)]"
            style={{ background: toast.levelUp ? "var(--color-lilac)" : "var(--color-fg)" }}
          >
            <b className="text-xl">{toast.text}</b>
            {toast.sub && <span className="text-[13px] opacity-75">{toast.sub}</span>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
