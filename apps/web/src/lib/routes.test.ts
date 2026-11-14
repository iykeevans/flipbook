import { parseRoute, routes, showsSidebar } from "./routes";

describe("parseRoute", () => {
  it("recognises workspace, new and project routes", () => {
    expect(parseRoute("/dashboard")).toEqual({ kind: "workspace", screen: "dashboard" });
    expect(parseRoute("/new")).toEqual({ kind: "new" });
    expect(parseRoute("/projects/studio-landing/learn/challenge")).toEqual({ kind: "project", projectId: "studio-landing", screen: "learn/challenge" });
    expect(parseRoute("/projects/x/nope")).toEqual({ kind: "other" });
  });

  it("hides the sidebar on the creation flow", () => {
    expect(showsSidebar(parseRoute("/new"))).toBe(false);
    expect(showsSidebar(parseRoute("/projects/a/review"))).toBe(false);
    expect(showsSidebar(parseRoute("/projects/a/processing"))).toBe(false);
    expect(showsSidebar(parseRoute("/projects/a/build"))).toBe(true);
    expect(showsSidebar(parseRoute("/settings"))).toBe(true);
  });

  it("builds deep links", () => {
    expect(routes.overviewAt("studio-landing", 12)).toBe("/projects/studio-landing/overview?t=12");
    expect(routes.animation("studio-landing", "hero")).toBe("/projects/studio-landing/animations?anim=hero");
  });
});
