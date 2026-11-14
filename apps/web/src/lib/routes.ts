export type WorkspaceScreen = "dashboard" | "templates" | "skills" | "settings";
export type ProjectScreen =
  | "processing"
  | "review"
  | "overview"
  | "build"
  | "animations"
  | "learn"
  | "learn/challenge"
  | "assets"
  | "history"
  | "export";

export const routes = {
  dashboard: "/dashboard",
  templates: "/templates",
  skills: "/skills",
  settings: "/settings",
  newProject: "/new",
  project: (projectId: string, screen: ProjectScreen = "overview") => `/projects/${encodeURIComponent(projectId)}/${screen}`,
  overviewAt: (projectId: string, seconds: number) => `/projects/${encodeURIComponent(projectId)}/overview?t=${Math.round(seconds)}`,
  animation: (projectId: string, animationId: string) =>
    `/projects/${encodeURIComponent(projectId)}/animations?anim=${encodeURIComponent(animationId)}`,
};

export type ParsedRoute =
  | { kind: "workspace"; screen: WorkspaceScreen }
  | { kind: "new" }
  | { kind: "project"; projectId: string; screen: ProjectScreen }
  | { kind: "other" };

const PROJECT_SCREENS: ProjectScreen[] = ["processing", "review", "overview", "build", "animations", "learn", "learn/challenge", "assets", "history", "export"];

export function parseRoute(pathname: string): ParsedRoute {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 1 && ["dashboard", "templates", "skills", "settings"].includes(parts[0]!)) {
    return { kind: "workspace", screen: parts[0] as WorkspaceScreen };
  }
  if (parts.length === 1 && parts[0] === "new") return { kind: "new" };
  if (parts[0] === "projects" && parts.length >= 3) {
    const screen = parts.slice(2).join("/") as ProjectScreen;
    if (PROJECT_SCREENS.includes(screen)) return { kind: "project", projectId: decodeURIComponent(parts[1]!), screen };
  }
  return { kind: "other" };
}

export const SCREEN_TITLES: Record<WorkspaceScreen | ProjectScreen | "new", string> = {
  dashboard: "Dashboard",
  templates: "Templates",
  skills: "Your skills",
  settings: "Settings",
  new: "New project",
  processing: "Processing",
  review: "Review analysis",
  overview: "Overview",
  animations: "Animations",
  learn: "Learn · Card stagger",
  "learn/challenge": "Challenge",
  build: "Build",
  assets: "Assets",
  history: "History",
  export: "Export",
};

/** Screens shown full-width without a sidebar, as in the prototype's upload → review flow. */
export function showsSidebar(route: ParsedRoute): boolean {
  if (route.kind === "workspace") return true;
  if (route.kind === "project") return route.screen !== "processing" && route.screen !== "review";
  return false;
}
