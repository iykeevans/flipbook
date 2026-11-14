import type {
  Analysis,
  Animation,
  AssetLibrary,
  BuildState,
  ChallengeParams,
  ChallengeState,
  CodeFile,
  EditId,
  Exercise,
  ExportOptions,
  ExportTarget,
  InspectorState,
  JobSnapshot,
  LearningProgress,
  Lesson,
  Project,
  ProjectVersion,
  ScoreResult,
  Settings,
  StackId,
  Template,
  User,
  XpAward,
} from "@/lib/domain/types";
import type { AwardInput } from "@/lib/domain/xp";

export type CreateProjectInput =
  | { source: "file"; fileName: string; sizeBytes: number; mimeType: string; outputs: string[] }
  | { source: "tab"; outputs: string[] }
  | { source: "url"; url: string; outputs: string[] };

export interface ChallengeSubmission {
  score: ScoreResult;
  challenge: ChallengeState;
  /** True only on the submission that first crosses the pass mark. */
  firstPass: boolean;
  /** XP granted by this submission (200, or 180 with the hint); null when nothing was awarded. */
  award: XpAward | null;
}

export type AskInput = { editId: EditId } | { text: string };

/** Mutations that create a version return the updated list so callers can refresh History. */
export interface WithVersions<T> {
  result: T;
  versions: ProjectVersion[];
}

/**
 * The single seam between screens and the backend, grouped like PRD §11 (`/api/v1/...`).
 * Today a localStorage mock implements it; an HTTP client for the Go service will replace it.
 */
export interface FlipbookApi {
  users: {
    me(): Promise<User>;
  };
  settings: {
    get(): Promise<Settings>;
    update(patch: Partial<Settings>): Promise<Settings>;
  };
  projects: {
    list(): Promise<Project[]>;
    get(projectId: string): Promise<Project | null>;
    create(input: CreateProjectInput): Promise<{ project: Project; job: JobSnapshot }>;
    /** Applies the overview fix (94% → 99%) and grants its XP once per project. */
    fixMatch(projectId: string): Promise<{ project: Project; award: XpAward }>;
    openTemplate(templateId: string): Promise<Project>;
  };
  recordings: {
    /** Server-side twin of the client check (PRD VID-002). Returns an error message or null. */
    validate(file: { name: string; type: string; size: number }): Promise<string | null>;
  };
  jobs: {
    get(jobId: string): Promise<JobSnapshot | null>;
  };
  analysis: {
    get(projectId: string): Promise<Analysis>;
  };
  generation: {
    /** Generates the site from a reviewed analysis; creates v1 when the project has no versions. */
    generate(projectId: string, animationIds: string[]): Promise<Project>;
    getBuild(projectId: string): Promise<BuildState>;
    getCode(stack: StackId): Promise<CodeFile>;
    setStack(projectId: string, stack: StackId): Promise<BuildState>;
    setViewport(projectId: string, viewport: BuildState["viewport"]): Promise<BuildState>;
    ask(projectId: string, input: AskInput): Promise<BuildState>;
    accept(projectId: string): Promise<WithVersions<BuildState>>;
    reject(projectId: string): Promise<BuildState>;
    regenerate(projectId: string, scope: "site" | "section"): Promise<WithVersions<ProjectVersion>>;
  };
  animations: {
    list(projectId: string): Promise<Animation[]>;
    getInspector(projectId: string): Promise<InspectorState>;
    /** Persists an unsaved generated duration (clamped to 100–1500ms). */
    setDuration(projectId: string, animationId: string, ms: number): Promise<InspectorState>;
    /** Saves the current duration as a new "Inspector edit" version. Throws when nothing changed. */
    saveDuration(projectId: string, animationId: string): Promise<WithVersions<InspectorState>>;
  };
  lessons: {
    get(lessonId: string): Promise<Lesson>;
  };
  exercises: {
    get(exerciseId: string): Promise<Exercise>;
    submit(exerciseId: string, params: ChallengeParams): Promise<ChallengeSubmission>;
    revealHint(exerciseId: string): Promise<ChallengeState>;
    saveParams(exerciseId: string, params: ChallengeParams): Promise<ChallengeState>;
  };
  learning: {
    getProgress(): Promise<LearningProgress>;
    /** Idempotent by `key`: a repeated key returns `awarded: false` and changes nothing. */
    award(input: AwardInput): Promise<XpAward>;
    setLessonStep(step: number): Promise<LearningProgress>;
    /** Marks the lesson's animation learned and grants the lesson XP once. */
    completeLesson(lessonId: string): Promise<{ progress: LearningProgress; award: XpAward }>;
  };
  versions: {
    list(projectId: string): Promise<ProjectVersion[]>;
    restore(projectId: string, v: number): Promise<ProjectVersion[]>;
  };
  assets: {
    list(projectId: string): Promise<AssetLibrary>;
    replace(projectId: string, assetId: string): Promise<WithVersions<AssetLibrary>>;
  };
  exports: {
    start(projectId: string, input: { target: ExportTarget; options: ExportOptions }): Promise<JobSnapshot>;
  };
  templates: {
    list(): Promise<Template[]>;
  };
  demo: {
    /** Clears stored state and reseeds the sample workspace. */
    reset(): Promise<void>;
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly code: "not_found" | "invalid" | "conflict",
  ) {
    super(message);
    this.name = "ApiError";
  }
}
