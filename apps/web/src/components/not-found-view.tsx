import { ButtonLink, PageTitle } from "@/components/ui";
import { routes } from "@/lib/routes";

export function NotFoundView({ title, message }: { title: string; message: string }) {
  return (
    <div className="mx-auto mt-6 flex max-w-[560px] flex-col items-start gap-4" data-testid="not-found">
      <span className="font-mono text-[11px] font-semibold text-fg-dim">404</span>
      <PageTitle size="md">{title}</PageTitle>
      <p className="m-0 text-[15px] leading-relaxed text-fg-muted">{message}</p>
      <ButtonLink href={routes.dashboard} variant="secondary">
        ← Back to dashboard
      </ButtonLink>
    </div>
  );
}
