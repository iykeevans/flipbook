import { DEFAULT_OUTPUTS, STREAK_DAYS } from "@/lib/domain/constants";
import { CHALLENGE_START } from "@/lib/domain/scoring";
import { DEFAULT_SETTINGS } from "@/lib/domain/settings";
import type {
  BuildState,
  ExportTarget,
  InspectorState,
  Job,
  LearningProgress,
  Project,
  ProjectVersion,
  Settings,
  User,
} from "@/lib/domain/types";
import { DEFAULT_REVIEW_SELECTION, SAMPLE_ANIMATIONS, seedVersions } from "./content";

export const STORAGE_KEY = "flipbook:v1";
export const SCHEMA_VERSION = 1;

export type StoredBuild = Omit<BuildState, "suggestions" | "pending"> & { pending: BuildState["pending"] };

export interface ProjectRecord {
  versions: ProjectVersion[];
  inspector: InspectorState;
  build: StoredBuild;
  card2Replaced: boolean;
  lastExport: { target: ExportTarget; jobId: string } | null;
}

export interface Db {
  schema: typeof SCHEMA_VERSION;
  seededAt: string;
  user: User;
  settings: Settings;
  progress: LearningProgress;
  projects: Project[];
  records: Record<string, ProjectRecord>;
  jobs: Record<string, Job>;
}


export function defaultInspector(): InspectorState {
  const durations: Record<string, number> = {};
  for (const a of SAMPLE_ANIMATIONS) if (a.defaultDurationMs !== null) durations[a.id] = a.defaultDurationMs;
  return { durations, saved: { ...durations } };
}

export function defaultBuild(): StoredBuild {
  return { stack: "Framer Motion", viewport: 0, chat: [], pending: null, heroPadded: false, typeErrorFixed: false };
}

export function newRecord(versions: ProjectVersion[] = []): ProjectRecord {
  return { versions, inspector: defaultInspector(), build: defaultBuild(), card2Replaced: false, lastExport: null };
}

const MIN = 60_000;
const HOUR = 60 * MIN;

export function seedDb(now: number): Db {
  const iso = (offset: number) => new Date(now - offset).toISOString();
  const allAnimations = SAMPLE_ANIMATIONS.map((a) => a.id);
  const projects: Project[] = [
    {
      id: "studio-landing",
      name: "studio-landing",
      status: "ready",
      progress: 100,
      source: { kind: "url", url: "https://studio.example" },
      outputs: [...DEFAULT_OUTPUTS],
      matchFixed: false,
      animationIds: allAnimations,
      jobId: null,
      createdAt: iso(3 * 24 * HOUR + 2 * HOUR),
      updatedAt: iso(2 * HOUR),
    },
    {
      id: "agency-reel",
      name: "agency-reel",
      status: "processing",
      progress: 62,
      source: { kind: "file", fileName: "agency-reel.mp4", sizeBytes: 41_000_000, mimeType: "video/mp4" },
      outputs: [...DEFAULT_OUTPUTS],
      matchFixed: false,
      animationIds: [...DEFAULT_REVIEW_SELECTION],
      jobId: "job-agency-reel",
      createdAt: iso(6 * MIN),
      updatedAt: iso(6 * MIN),
    },
    {
      id: "pricing-page",
      name: "pricing-page",
      status: "needs_review",
      progress: 100,
      source: { kind: "url", url: "https://pricing.example" },
      outputs: [...DEFAULT_OUTPUTS],
      matchFixed: false,
      animationIds: [...DEFAULT_REVIEW_SELECTION],
      jobId: null,
      createdAt: iso(26 * HOUR),
      updatedAt: iso(25 * HOUR),
    },
    {
      id: "portfolio-grid",
      name: "portfolio-grid",
      status: "ready",
      progress: 100,
      source: { kind: "sample", templateId: "portfolio-grid", lessonsLearned: 3, lessonsTotal: 3 },
      outputs: [...DEFAULT_OUTPUTS],
      matchFixed: true,
      animationIds: allAnimations,
      jobId: null,
      createdAt: iso(5 * 24 * HOUR),
      updatedAt: iso(4 * 24 * HOUR),
    },
  ];
  return {
    schema: SCHEMA_VERSION,
    seededAt: new Date(now).toISOString(),
    user: { id: "user-ada", name: "Ada", streakDays: STREAK_DAYS },
    settings: { ...DEFAULT_SETTINGS },
    progress: {
      xp: 1240,
      learned: ["nav", "hero"],
      lessonStep: 1,
      challenge: { attempts: 1, lastScore: null, bestScore: null, hintUsed: false, passed: false, params: { ...CHALLENGE_START } },
      awardedKeys: [],
    },
    projects,
    records: {
      "studio-landing": newRecord(seedVersions(now)),
      "agency-reel": newRecord(),
      "pricing-page": newRecord(),
      "portfolio-grid": newRecord(seedVersions(now).slice(-1)),
    },
    jobs: {
      // Simulated long-running analysis: +1% every 900ms from 62%.
      "job-agency-reel": {
        id: "job-agency-reel",
        kind: "analysis",
        projectId: "agency-reel",
        startedAt: new Date(now).toISOString(),
        startProgress: 62,
        step: 1,
        tickMs: 900,
      },
    },
  };
}

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function memoryStorage(): KeyValueStorage {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Shallow structural check: enough to reject corrupt or foreign data before the app trusts it. */
export function isValidDb(value: unknown): value is Db {
  if (!isObject(value) || value.schema !== SCHEMA_VERSION) return false;
  const { user, settings, progress, projects, records, jobs } = value;
  if (!isObject(user) || typeof user.name !== "string") return false;
  if (!isObject(settings) || typeof settings.showXp !== "boolean") return false;
  if (!isObject(progress) || typeof progress.xp !== "number" || !Array.isArray(progress.learned)) return false;
  if (!isObject(progress.challenge) || !Array.isArray(progress.awardedKeys)) return false;
  if (!Array.isArray(projects) || !projects.every((p) => isObject(p) && typeof p.id === "string" && typeof p.status === "string")) {
    return false;
  }
  if (!isObject(records) || !isObject(jobs)) return false;
  return projects.every((p) => {
    const r = records[(p as Project).id];
    return isObject(r) && Array.isArray(r.versions) && isObject(r.inspector) && isObject(r.build);
  });
}

/** Loads the stored workspace, falling back to fresh seed data when it is missing, corrupt or from another schema. */
export function loadDb(storage: KeyValueStorage, now: number): Db {
  let raw: string | null = null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (isValidDb(parsed)) {
        return { ...parsed, settings: { ...DEFAULT_SETTINGS, ...parsed.settings } };
      }
    } catch {
      // Corrupt JSON: fall through to a fresh seed.
    }
  }
  const db = seedDb(now);
  saveDb(storage, db);
  return db;
}

export function saveDb(storage: KeyValueStorage, db: Db): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Quota or privacy-mode failures keep the in-memory copy working for this session.
  }
}
