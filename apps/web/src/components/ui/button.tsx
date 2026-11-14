import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "mint" | "yellow" | "light" | "secondary" | "ghost";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-orange text-ink font-semibold hover:bg-orange-hi",
  mint: "bg-mint text-ink font-semibold hover:bg-mint-hi",
  yellow: "bg-yellow text-ink font-semibold hover:bg-yellow-hi",
  light: "bg-fg text-ink hover:bg-white",
  secondary: "bg-control text-fg hover:bg-control-hover",
  ghost: "text-fg-dim hover:text-fg",
};

const SIZES: Record<ButtonSize, string> = {
  xs: "px-2.5 py-[5px] text-xs rounded-md",
  sm: "px-[11px] py-[7px] text-[13px] rounded-[7px]",
  md: "px-3.5 py-[9px] text-sm rounded-lg",
  lg: "px-[18px] py-[11px] text-[15px] rounded-[10px]",
};

export function buttonClass(variant: ButtonVariant = "secondary", size: ButtonSize = "md", extra?: string): string {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap no-underline transition-colors disabled:opacity-60",
    VARIANTS[variant],
    variant === "ghost" ? "text-sm" : SIZES[size],
    extra,
  );
}

type ButtonProps = ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize };

export function Button({ variant, size, className, type = "button", ...rest }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...rest} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize };

/** Navigation styled as a button. Variants set their own text colour, overriding the global link colour. */
export function ButtonLink({ variant, size, className, ...rest }: ButtonLinkProps) {
  return <Link className={buttonClass(variant, size, cn("hover:text-inherit", className))} {...rest} />;
}
