import type { ReactNode } from "react";
import { cn } from "./cn";

export function Eyebrow({ children, className, as: Tag = "span" }: { children: ReactNode; className?: string; as?: "span" | "h2" | "p" }) {
  return <Tag className={cn("font-mono text-[11px] font-semibold tracking-normal text-fg-dim", className)}>{children}</Tag>;
}

export function PageTitle({ children, size = "lg", className }: { children: ReactNode; size?: "md" | "lg" | "xl"; className?: string }) {
  const sizes = { md: "text-[28px]", lg: "text-[32px]", xl: "text-[40px] leading-[1.05] tracking-[-0.03em]" };
  return <h1 className={cn("m-0 font-extrabold tracking-[-0.02em]", sizes[size], className)}>{children}</h1>;
}

export function MonoNote({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("font-mono text-xs text-fg-dim", className)}>{children}</span>;
}
