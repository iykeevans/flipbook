"use client";

import { usePathname } from "next/navigation";
import { parseRoute } from "@/lib/routes";
import { NotFoundView } from "./not-found-view";

/** Next's not-found screen, with project-specific copy when the URL names a project. */
export function RouteNotFound() {
  const route = parseRoute(usePathname() ?? "/");
  if (route.kind === "project") {
    return (
      <NotFoundView
        title="We can't find that project"
        message={`There's no project called "${route.projectId}" in your workspace. It may have been removed, or the link is mistyped.`}
      />
    );
  }
  return <NotFoundView title="This page doesn't exist" message="The link may be out of date. Your projects are on the dashboard." />;
}
