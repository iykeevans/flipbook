"use client";

import { create } from "zustand";
import { getApi } from "@/lib/api";
import { ApiError, type AskInput, type CreateProjectInput } from "@/lib/api/types";
import { DEFAULT_SETTINGS } from "@/lib/domain/settings";
import { latestVersion } from "@/lib/domain/versions";
import { awardToast, type AwardInput } from "@/lib/domain/xp";
import type {
  Animation,
  AssetLibrary,
  BuildState,
  ChallengeParams,
  ExportOptions,
  ExportTarget,
  InspectorState,
  JobSnapshot,
  LearningProgress,
  Project,
  ProjectVersion,
  Settings,
  StackId,
  Template,
  User,
  XpAward,
} from "@/lib/domain/types";

export interface Toast {
  id: number;
  text: string;
  sub: string;
  levelUp: boolean;
}

export interface ProjectCache {
  versions?: ProjectVersion[];
  animations?: Animation[];
  inspector?: InspectorState;
  build?: BuildState;
  assets?: AssetLibrary;
}

export type LoadStatus = "idle" | "loading" | "ready" | "error";

export interface AppState {
  status: LoadStatus;
  user: User | null;
  settings: Settings;
  progress: LearningProgress | null;
  projects: Project[];
  templates: Template[];
  cache: Record<string, ProjectCache>;
  toast: Toast | null;

  init(): Promise<void>;
  refreshProjects(): Promise<Project[]>;
  notify(text: string, sub?: string): void;
  dismissToast(id: number): void;
  /** Shows the XP / level-up toast unless XP display is turned off in Settings. */
  showAward(award: XpAward | null): void;
  award(input: AwardInput): Promise<XpAward>;
  updateSettings(patch: Partial<Settings>): Promise<void>;
  resetDemo(): Promise<void>;

  createProject(input: CreateProjectInput): Promise<{ project: Project; job: JobSnapshot }>;
  generate(projectId: string, animationIds: string[]): Promise<Project>;
  fixMatch(projectId: string): Promise<void>;
  openTemplate(templateId: string): Promise<Project>;

  loadVersions(projectId: string): Promise<ProjectVersion[]>;
  loadAnimations(projectId: string): Promise<void>;
  loadBuild(projectId: string): Promise<BuildState>;
  loadAssets(projectId: string): Promise<AssetLibrary>;

  nudgeDuration(projectId: string, animationId: string, deltaMs: number): Promise<void>;
  saveDuration(projectId: string, animationId: string): Promise<void>;

  setLessonStep(step: number): Promise<void>;
  completeLesson(lessonId: string): Promise<void>;
  submitChallenge(exerciseId: string, params: ChallengeParams): Promise<void>;
  revealHint(exerciseId: string): Promise<void>;
  saveChallengeParams(exerciseId: string, params: ChallengeParams): Promise<void>;

  setStack(projectId: string, stack: StackId): Promise<void>;
  setViewport(projectId: string, viewport: BuildState["viewport"]): Promise<void>;
  ask(projectId: string, input: AskInput): Promise<void>;
  acceptEdit(projectId: string): Promise<void>;
  rejectEdit(projectId: string): Promise<void>;
  regenerate(projectId: string, scope: "site" | "section"): Promise<void>;

  restoreVersion(projectId: string, v: number): Promise<void>;
  replaceAsset(projectId: string, assetId: string): Promise<void>;

  startExport(projectId: string, target: ExportTarget, options: ExportOptions): Promise<JobSnapshot>;
  getJob(jobId: string): Promise<JobSnapshot | null>;
}

let toastSeq = 0;
let initPromise: Promise<void> | null = null;

export const useAppStore = create<AppState>()((set, get) => {
  const api = () => getApi();

  const patchCache = (projectId: string, patch: ProjectCache) =>
    set((s) => ({ cache: { ...s.cache, [projectId]: { ...s.cache[projectId], ...patch } } }));

  const upsertProject = (project: Project) =>
    set((s) => {
      const exists = s.projects.some((p) => p.id === project.id);
      return { projects: exists ? s.projects.map((p) => (p.id === project.id ? project : p)) : [project, ...s.projects] };
    });

  const nextVersionLabel = (versions: ProjectVersion[]) => `v${latestVersion(versions)}`;

  const refreshProgress = async () => set({ progress: await api().learning.getProgress() });

  return {
    status: "idle",
    user: null,
    settings: DEFAULT_SETTINGS,
    progress: null,
    projects: [],
    templates: [],
    cache: {},
    toast: null,

    init: () => {
      if (initPromise) return initPromise;
      set({ status: "loading" });
      initPromise = (async () => {
        try {
          const a = api();
          const [user, settings, progress, projects, templates] = await Promise.all([
            a.users.me(),
            a.settings.get(),
            a.learning.getProgress(),
            a.projects.list(),
            a.templates.list(),
          ]);
          set({ user, settings, progress, projects, templates, status: "ready" });
        } catch {
          initPromise = null;
          set({ status: "error" });
        }
      })();
      return initPromise;
    },

    refreshProjects: async () => {
      const projects = await api().projects.list();
      set({ projects });
      return projects;
    },

    notify: (text, sub = "") => set({ toast: { id: ++toastSeq, text, sub, levelUp: false } }),

    dismissToast: (id) => set((s) => (s.toast?.id === id ? { toast: null } : s)),

    showAward: (award) => {
      if (!award?.awarded || !get().settings.showXp) return;
      set({ toast: { id: ++toastSeq, ...awardToast(award) } });
    },

    award: async (input) => {
      const award = await api().learning.award(input);
      await refreshProgress();
      get().showAward(award);
      return award;
    },

    updateSettings: async (patch) => {
      set((s) => ({ settings: { ...s.settings, ...patch } }));
      set({ settings: await api().settings.update(patch) });
    },

    resetDemo: async () => {
      await api().demo.reset();
      initPromise = null;
      set({ cache: {}, toast: null });
      await get().init();
      get().notify("Demo data reset", "Back to the sample workspace");
    },

    createProject: async (input) => {
      const res = await api().projects.create(input);
      upsertProject(res.project);
      return res;
    },

    generate: async (projectId, animationIds) => {
      const project = await api().generation.generate(projectId, animationIds);
      upsertProject(project);
      await get().loadVersions(projectId);
      get().notify("Site generated", `${project.name} · ${animationIds.length} animations · 94% match`);
      return project;
    },

    fixMatch: async (projectId) => {
      const { project, award } = await api().projects.fixMatch(projectId);
      upsertProject(project);
      await refreshProgress();
      get().showAward(award);
    },

    openTemplate: async (templateId) => {
      const project = await api().projects.openTemplate(templateId);
      upsertProject(project);
      const t = get().templates.find((x) => x.id === templateId);
      if (t) get().notify("Sample opened", `${t.name} · ${t.lessons} lessons ready`);
      return project;
    },

    loadVersions: async (projectId) => {
      const versions = await api().versions.list(projectId);
      patchCache(projectId, { versions });
      return versions;
    },

    loadAnimations: async (projectId) => {
      const [animations, inspector] = await Promise.all([api().animations.list(projectId), api().animations.getInspector(projectId)]);
      patchCache(projectId, { animations, inspector });
    },

    loadBuild: async (projectId) => {
      const build = await api().generation.getBuild(projectId);
      patchCache(projectId, { build });
      return build;
    },

    loadAssets: async (projectId) => {
      const assets = await api().assets.list(projectId);
      patchCache(projectId, { assets });
      return assets;
    },

    nudgeDuration: async (projectId, animationId, deltaMs) => {
      const current = get().cache[projectId]?.inspector?.durations[animationId];
      if (current === undefined) return;
      patchCache(projectId, { inspector: await api().animations.setDuration(projectId, animationId, current + deltaMs) });
    },

    saveDuration: async (projectId, animationId) => {
      try {
        const { result, versions } = await api().animations.saveDuration(projectId, animationId);
        patchCache(projectId, { inspector: result, versions });
        const name = get().cache[projectId]?.animations?.find((a) => a.id === animationId)?.name ?? animationId;
        get().notify(`Saved ${nextVersionLabel(versions)}`, `${name} · ${result.saved[animationId]}ms`);
      } catch (e) {
        if (!(e instanceof ApiError && e.code === "conflict")) throw e;
      }
    },

    setLessonStep: async (step) => set({ progress: await api().learning.setLessonStep(step) }),

    completeLesson: async (lessonId) => {
      const { progress, award } = await api().learning.completeLesson(lessonId);
      set({ progress });
      get().showAward(award);
    },

    submitChallenge: async (exerciseId, params) => {
      const res = await api().exercises.submit(exerciseId, params);
      await refreshProgress();
      get().showAward(res.award);
    },

    revealHint: async (exerciseId) => {
      await api().exercises.revealHint(exerciseId);
      await refreshProgress();
    },

    saveChallengeParams: async (exerciseId, params) => {
      await api().exercises.saveParams(exerciseId, params);
      await refreshProgress();
    },

    setStack: async (projectId, stack) => patchCache(projectId, { build: await api().generation.setStack(projectId, stack) }),

    setViewport: async (projectId, viewport) => patchCache(projectId, { build: await api().generation.setViewport(projectId, viewport) }),

    ask: async (projectId, input) => patchCache(projectId, { build: await api().generation.ask(projectId, input) }),

    acceptEdit: async (projectId) => {
      const file = get().cache[projectId]?.build?.pending?.file ?? "";
      const { result, versions } = await api().generation.accept(projectId);
      patchCache(projectId, { build: result, versions });
      get().notify(`Saved ${nextVersionLabel(versions)}`, `${file} · assistant edit`);
    },

    rejectEdit: async (projectId) => patchCache(projectId, { build: await api().generation.reject(projectId) }),

    regenerate: async (projectId, scope) => {
      const { versions } = await api().generation.regenerate(projectId, scope);
      patchCache(projectId, { versions });
      get().notify(`Regenerated · ${nextVersionLabel(versions)}`, scope === "site" ? "Your edits are kept in History" : "Card grid section");
    },

    restoreVersion: async (projectId, v) => {
      const versions = await api().versions.restore(projectId, v);
      patchCache(projectId, { versions });
      get().notify(`Restored v${v}`, `Saved as ${nextVersionLabel(versions)}`);
    },

    replaceAsset: async (projectId, assetId) => {
      try {
        const { result, versions } = await api().assets.replace(projectId, assetId);
        patchCache(projectId, { assets: result, versions });
        get().notify(`Saved ${nextVersionLabel(versions)}`, "card-2 replaced in Cards.tsx");
      } catch (e) {
        if (e instanceof ApiError && e.code === "conflict") get().notify("Pick an asset first", "Click any image to replace it");
        else throw e;
      }
    },

    startExport: (projectId, target, options) => api().exports.start(projectId, { target, options }),

    getJob: (jobId) => api().jobs.get(jobId),
  };
});

/** Reset module state between tests. */
export function resetAppStoreForTests(): void {
  initPromise = null;
  toastSeq = 0;
  useAppStore.setState({ status: "idle", user: null, settings: DEFAULT_SETTINGS, progress: null, projects: [], templates: [], cache: {}, toast: null });
}
