import Link from "next/link";
import { routes } from "@/lib/routes";

export function Logo() {
  return (
    <Link href={routes.dashboard} className="flex items-center gap-2 rounded-md text-fg no-underline hover:text-fg" aria-label="Flipbook, go to dashboard">
      <span aria-hidden className="grid size-[22px] place-items-center rounded-md bg-orange">
        <span className="size-2 rotate-45 rounded-[2px] bg-ink" />
      </span>
      <b className="text-base">Flipbook</b>
    </Link>
  );
}
