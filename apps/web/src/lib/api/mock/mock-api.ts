import { COLORS, DEFAULT_OUTPUTS, RECORDING_SECONDS } from "@/lib/domain/constants";
import { clampDuration, isDurationDirty } from "@/lib/domain/inspector";
import { jobSnapshot } from "@/lib/domain/jobs";
import { matchPercent } from "@/lib/domain/match";
import { challengeXp, computeScore, isPassingScore, nextAttemptCount } from "@/lib/domain/scoring";
import type {
  Analysis,
  BuildState,
  ChallengeParams,
  Job,
  JobSnapshot,
  Project,
  ProjectVersion,
  Settings,
  StackId,
} from "@/lib/domain/types";
import { projectNameFromFile, projectNameFromUrl, slugify, validateRecordingFile } from "@/lib/domain/upload";
import { pushVersion, restoreVersion, type NewVersion } from "@/lib/domain/versions";
import { awardXp, type AwardInput } from "@/lib/domain/xp";
import { ApiError, type AskInput, type CreateProjectInput, type FlipbookApi } from "../types";
import {
  assetGroups,
  CARD_STAGGER_LESSON,
  CODE,
  DEFAULT_REVIEW_SELECTION,
  DEPLOY_LOG,
  EDITS,
  firstGenerationVersion,
  SAMPLE_ANIMATIONS,
  SAMPLE_SECTIONS,
  STAGGER_CHALLENGE,
  TEMPLATES,
} from "./content";
import { loadDb, newRecord, saveDb, seedDb, STORAGE_KEY, type Db, type KeyValueStorage, type ProjectRecord, type StoredBuild } from "./db";

const clone = <T>(v: T): T => structuredClone(v);

const EXPORT_RESULTS = {
  deploy: { title: "Live", sub: (name: string) => `${name}.flipbook.app` },
  github: { title: "Pushed", sub: (name: string) => `github.com/you/${name} · main` },
  zip: { title: "Downloaded", sub: (name: string) => `${name}.zip · 212kb` },
} as const;

export interface MockApiOptions {
  storage: KeyValueStorage;
  now?: () => number;
}

/**
 * localStorage-backed stand-in for the Go service. All analysis, generation, assistant replies and deploys
 * here are simulated sample data, not real processing.
 */
export class MockFlipbookApi implements FlipbookApi {
  private db: Db;
  private readonly storage: KeyValueStorage;
  private readonly now: () => number;

  constructor(options: MockApiOptions) {
    this.storage = options.storage;
    this.now = options.now ?? (() => Date.now());
    this.db = loadDb(this.storage, this.now());
  }

  private save(): void {
    saveDb(this.storage, this.db);
  }

  private iso(): string {
    return new Date(this.now()).toISOString();
  }

  private project(projectId: string): Project {
    this.syncJobs();
    const p = this.db.projects.find((x) => x.id === projectId);
    if (!p) throw new ApiError(`Project ${projectId} not found`, "not_found");
    return p;
  }

  private record(projectId: string): ProjectRecord {
    this.project(projectId);
    const r = (this.db.records[projectId] ??= newRecord());
    return r;
  }

  private addVersion(projectId: string, input: NewVersion): ProjectVersion[] {
    const r = this.record(projectId);
    r.versions = pushVersion(r.versions, input, new Date(this.now()));
    this.touch(projectId);
    return r.versions;
  }

  private touch(projectId: string): void {
    const p = this.db.projects.find((x) => x.id === projectId);
    if (p) p.updatedAt = this.iso();
  }

  /** Advances simulated analysis jobs; a finished analysis moves its project to "needs review". */
  private syncJobs(): void {
    let changed = false;
    for (const p of this.db.projects) {
      if (p.status !== "processing" || !p.jobId) continue;
      const job = this.db.jobs[p.jobId];
      if (!job) continue;
      const snap = jobSnapshot(job, this.now());
      if (snap.progress !== p.progress) {
        p.progress = snap.progress;
        changed = true;
      }
      if (snap.status === "done") {
        p.status = "needs_review";
        p.progress = 100;
        p.updatedAt = this.iso();
        changed = true;
      }
    }
    if (changed) this.save();
  }

  private buildView(stored: StoredBuild): BuildState {
    const suggestions: BuildState["suggestions"] = [];
    if (!stored.heroPadded) suggestions.push({ id: "hero", label: EDITS.hero.ask });
    if (!stored.typeErrorFixed) suggestions.push({ id: "fix", label: EDITS.fix.ask });
    return clone({ ...stored, suggestions });
  }

  private grant(input: AwardInput) {
    const { progress, award } = awardXp(this.db.progress, input);
    this.db.progress = progress;
    return award;
  }

  private uniqueId(base: string): string {
    const root = slugify(base) || "project";
    let id = root;
    for (let n = 2; this.db.projects.some((p) => p.id === id); n++) id = `${root}-${n}`;
    return id;
  }

  users: FlipbookApi["users"] = {
    me: async () => clone(this.db.user),
  };

  settings: FlipbookApi["settings"] = {
    get: async () => clone(this.db.settings),
    update: async (patch: Partial<Settings>) => {
      this.db.settings = { ...this.db.settings, ...patch };
      this.save();
      return clone(this.db.settings);
    },
  };

  projects: FlipbookApi["projects"] = {
    list: async () => {
      this.syncJobs();
      return clone(this.db.projects);
    },
    get: async (projectId) => {
      this.syncJobs();
      const p = this.db.projects.find((x) => x.id === projectId);
      return p ? clone(p) : null;
    },
    create: async (input: CreateProjectInput) => {
      if (input.source === "file") {
        const error = validateRecordingFile({ name: input.fileName, type: input.mimeType, size: input.sizeBytes });
        if (error) throw new ApiError(error, "invalid");
      }
      const name =
        input.source === "file"
          ? projectNameFromFile(input.fileName)
          : input.source === "url"
            ? projectNameFromUrl(input.url)
            : "tab-recording";
      const id = this.uniqueId(name);
      const jobId = `job-${id}-${this.now()}`;
      const job: Job = { id: jobId, kind: "processing", projectId: id, startedAt: this.iso(), startProgress: 0, step: 1.4, tickMs: 50 };
      const project: Project = {
        id,
        name: id,
        status: "processing",
        progress: 0,
        source:
          input.source === "file"
            ? { kind: "file", fileName: input.fileName, sizeBytes: input.sizeBytes, mimeType: input.mimeType }
            : input.source === "url"
              ? { kind: "url", url: input.url }
              : { kind: "tab" },
        outputs: input.outputs.length ? [...input.outputs] : [...DEFAULT_OUTPUTS],
        matchFixed: false,
        animationIds: [],
        jobId,
        createdAt: this.iso(),
        updatedAt: this.iso(),
      };
      this.db.projects.unshift(project);
      this.db.records[id] = newRecord();
      this.db.jobs[jobId] = job;
      this.save();
      return { project: clone(project), job: jobSnapshot(job, this.now()) };
    },
    fixMatch: async (projectId) => {
      const p = this.project(projectId);
      p.matchFixed = true;
      this.touch(projectId);
      const award = this.grant({ amount: 30, reason: "Matched the recording", key: `fix:${projectId}` });
      this.save();
      return { project: clone(p), award };
    },
    openTemplate: async (templateId) => {
      const t = TEMPLATES.find((x) => x.id === templateId);
      if (!t) throw new ApiError(`Template ${templateId} not found`, "not_found");
      const existing = this.db.projects.find((p) => p.source.kind === "sample" && p.source.templateId === t.id);
      if (existing) return clone(existing);
      const id = this.uniqueId(t.id);
      const project: Project = {
        id,
        name: id,
        status: "ready",
        progress: 100,
        source: { kind: "sample", templateId: t.id, lessonsLearned: 0, lessonsTotal: t.lessons },
        outputs: [...DEFAULT_OUTPUTS],
        matchFixed: true,
        animationIds: SAMPLE_ANIMATIONS.map((a) => a.id),
        jobId: null,
        createdAt: this.iso(),
        updatedAt: this.iso(),
      };
      this.db.projects.unshift(project);
      this.db.records[id] = newRecord([firstGenerationVersion(this.now(), matchPercent(true), SAMPLE_ANIMATIONS.length)]);
      this.save();
      return clone(project);
    },
  };

  recordings: FlipbookApi["recordings"] = {
    validate: async (file) => validateRecordingFile(file),
  };

  jobs: FlipbookApi["jobs"] = {
    get: async (jobId): Promise<JobSnapshot | null> => {
      this.syncJobs();
      const job = this.db.jobs[jobId];
      return job ? jobSnapshot(job, this.now()) : null;
    },
  };

  analysis: FlipbookApi["analysis"] = {
    get: async (projectId): Promise<Analysis> => {
      this.project(projectId);
      return clone({
        projectId,
        sections: SAMPLE_SECTIONS,
        frameCount: 8,
        keyFrames: 42,
        durationSec: RECORDING_SECONDS,
        resolution: "1440×900",
        summary: "scroll + 3 hover states",
        animations: SAMPLE_ANIMATIONS.map(({ id, name, confidence }) => ({ id, name, confidence })),
        defaultSelected: DEFAULT_REVIEW_SELECTION,
      });
    },
  };

  generation: FlipbookApi["generation"] = {
    generate: async (projectId, animationIds) => {
      const p = this.project(projectId);
      if (p.status === "processing") throw new ApiError("Analysis is still running", "conflict");
      p.status = "ready";
      p.progress = 100;
      p.matchFixed = false;
      p.animationIds = [...animationIds];
      p.updatedAt = this.iso();
      const r = this.record(projectId);
      if (r.versions.length === 0) r.versions = [firstGenerationVersion(this.now(), matchPercent(false), animationIds.length)];
      this.save();
      return clone(p);
    },
    getBuild: async (projectId) => this.buildView(this.record(projectId).build),
    getCode: async (stack: StackId) => ({ stack, ...CODE[stack] }),
    setStack: async (projectId, stack) => {
      const r = this.record(projectId);
      r.build.stack = stack;
      this.save();
      return this.buildView(r.build);
    },
    setViewport: async (projectId, viewport) => {
      const r = this.record(projectId);
      r.build.viewport = viewport;
      this.save();
      return this.buildView(r.build);
    },
    ask: async (projectId, input: AskInput) => {
      const r = this.record(projectId);
      const editId = "editId" in input ? input.editId : "hero";
      const edit = EDITS[editId];
      const text = "text" in input ? input.text.trim() : edit.ask;
      if (!text) throw new ApiError("Ask for a change first", "invalid");
      const reply = "text" in input ? `Here's a change for that in ${edit.file}. 1 file, 2 lines.` : edit.reply;
      r.build.chat = [...r.build.chat, { fromUser: true, text }, { fromUser: false, text: reply }];
      r.build.pending = { id: editId, ask: text, file: edit.file, minus: edit.minus, plus: edit.plus };
      this.save();
      return this.buildView(r.build);
    },
    accept: async (projectId) => {
      const r = this.record(projectId);
      const pending = r.build.pending;
      if (!pending) throw new ApiError("No proposed change to accept", "conflict");
      const versions = this.addVersion(projectId, {
        kind: "Assistant",
        description: `"${pending.ask}" · accepted`,
        diff: [`- ${pending.minus}`, `+ ${pending.plus}`],
        color: COLORS.lilac,
      });
      r.build.heroPadded ||= pending.id === "hero";
      r.build.typeErrorFixed ||= pending.id === "fix";
      r.build.pending = null;
      r.build.chat = [...r.build.chat, { fromUser: false, text: `Accepted. Saved as v${versions[0]!.v}.` }];
      this.save();
      return { result: this.buildView(r.build), versions: clone(versions) };
    },
    reject: async (projectId) => {
      const r = this.record(projectId);
      r.build.pending = null;
      r.build.chat = [...r.build.chat, { fromUser: false, text: "Rejected. Nothing changed." }];
      this.save();
      return this.buildView(r.build);
    },
    regenerate: async (projectId, scope) => {
      const versions = this.addVersion(
        projectId,
        scope === "site"
          ? { kind: "Regenerated site", description: "From the original recording", diff: ["+ 6 components · 5 animations"], color: COLORS.orange }
          : {
              kind: "Regenerated section",
              description: "Card grid",
              diff: ['- <Cards layout="grid" />', '+ <Cards layout="grid" gap="lg" />'],
              color: COLORS.orange,
            },
      );
      this.save();
      return { result: clone(versions[0]!), versions: clone(versions) };
    },
  };

  animations: FlipbookApi["animations"] = {
    list: async (projectId) => {
      this.project(projectId);
      return clone(SAMPLE_ANIMATIONS);
    },
    getInspector: async (projectId) => clone(this.record(projectId).inspector),
    setDuration: async (projectId, animationId, ms) => {
      const r = this.record(projectId);
      if (r.inspector.saved[animationId] === undefined) throw new ApiError(`${animationId} has no editable duration`, "invalid");
      r.inspector.durations[animationId] = clampDuration(ms);
      this.save();
      return clone(r.inspector);
    },
    saveDuration: async (projectId, animationId) => {
      const r = this.record(projectId);
      if (!isDurationDirty(r.inspector, animationId)) throw new ApiError("Nothing to save", "conflict");
      const anim = SAMPLE_ANIMATIONS.find((a) => a.id === animationId);
      const before = r.inspector.saved[animationId]!;
      const after = r.inspector.durations[animationId]!;
      const versions = this.addVersion(projectId, {
        kind: "Inspector edit",
        description: `${anim?.name ?? animationId} duration ${before} → ${after}ms`,
        diff: [`- duration: ${before / 1000}`, `+ duration: ${after / 1000}`],
        color: COLORS.mint,
      });
      r.inspector.saved[animationId] = after;
      this.save();
      return { result: clone(r.inspector), versions: clone(versions) };
    },
  };

  lessons: FlipbookApi["lessons"] = {
    get: async (lessonId) => {
      if (lessonId !== CARD_STAGGER_LESSON.id) throw new ApiError(`Lesson ${lessonId} not found`, "not_found");
      return clone(CARD_STAGGER_LESSON);
    },
  };

  exercises: FlipbookApi["exercises"] = {
    get: async (exerciseId) => {
      if (exerciseId !== STAGGER_CHALLENGE.id) throw new ApiError(`Exercise ${exerciseId} not found`, "not_found");
      return clone(STAGGER_CHALLENGE);
    },
    submit: async (exerciseId, params: ChallengeParams) => {
      if (exerciseId !== STAGGER_CHALLENGE.id) throw new ApiError(`Exercise ${exerciseId} not found`, "not_found");
      const score = computeScore(params);
      const ch = this.db.progress.challenge;
      const pass = isPassingScore(score.total);
      const firstPass = pass && !ch.passed;
      this.db.progress.challenge = {
        ...ch,
        attempts: nextAttemptCount(ch.attempts, ch.lastScore !== null),
        lastScore: score,
        bestScore: Math.max(ch.bestScore ?? 0, score.total),
        passed: ch.passed || pass,
        params: { ...params },
      };
      const award = firstPass
        ? this.grant({ amount: challengeXp(ch.hintUsed), reason: "Challenge passed · Easing badge", key: `challenge:${exerciseId}` })
        : null;
      this.save();
      return { score, challenge: clone(this.db.progress.challenge), firstPass, award: award?.awarded ? award : null };
    },
    revealHint: async () => {
      this.db.progress.challenge.hintUsed = true;
      this.save();
      return clone(this.db.progress.challenge);
    },
    saveParams: async (_exerciseId, params) => {
      this.db.progress.challenge.params = { ...params };
      this.save();
      return clone(this.db.progress.challenge);
    },
  };

  learning: FlipbookApi["learning"] = {
    getProgress: async () => clone(this.db.progress),
    award: async (input) => {
      const award = this.grant(input);
      this.save();
      return award;
    },
    setLessonStep: async (step) => {
      this.db.progress.lessonStep = Math.max(1, Math.min(CARD_STAGGER_LESSON.steps.length, Math.round(step)));
      this.save();
      return clone(this.db.progress);
    },
    completeLesson: async (lessonId) => {
      const lesson = await this.lessons.get(lessonId);
      if (!this.db.progress.learned.includes(lesson.animationId)) {
        this.db.progress.learned = [...this.db.progress.learned, lesson.animationId];
      }
      const award = this.grant({ amount: lesson.xp, reason: `Lesson: ${lesson.title}`, key: `lesson:${lesson.id}` });
      this.save();
      return { progress: clone(this.db.progress), award };
    },
  };

  versions: FlipbookApi["versions"] = {
    list: async (projectId) => clone(this.record(projectId).versions),
    restore: async (projectId, v) => {
      const r = this.record(projectId);
      try {
        r.versions = restoreVersion(r.versions, v, new Date(this.now()));
      } catch (e) {
        throw new ApiError((e as Error).message, "not_found");
      }
      this.touch(projectId);
      this.save();
      return clone(r.versions);
    },
  };

  assets: FlipbookApi["assets"] = {
    list: async (projectId) => {
      const p = this.project(projectId);
      const r = this.record(projectId);
      return { groups: assetGroups(p.name, r.card2Replaced), card2Replaced: r.card2Replaced };
    },
    replace: async (projectId, assetId) => {
      const p = this.project(projectId);
      const r = this.record(projectId);
      if (assetId !== "card-2" || r.card2Replaced) throw new ApiError("Pick an asset first", "conflict");
      r.card2Replaced = true;
      const versions = this.addVersion(projectId, {
        kind: "Asset replaced",
        description: "card-2 → card-2-upload.webp",
        diff: ['- src="/placeholder.svg"', '+ src="/card-2-upload.webp"'],
        color: COLORS.yellow,
      });
      this.save();
      return { result: { groups: assetGroups(p.name, true), card2Replaced: true }, versions: clone(versions) };
    },
  };

  exports: FlipbookApi["exports"] = {
    start: async (projectId, { target }) => {
      const p = this.project(projectId);
      const r = this.record(projectId);
      const jobId = `export-${projectId}-${this.now()}`;
      const result = EXPORT_RESULTS[target];
      const job: Job = {
        id: jobId,
        kind: "export",
        projectId,
        startedAt: this.iso(),
        startProgress: 0,
        step: 4,
        tickMs: 60,
        meta: { target, title: result.title, sub: result.sub(p.name), log: DEPLOY_LOG.join("\n") },
      };
      this.db.jobs[jobId] = job;
      r.lastExport = { target, jobId };
      this.save();
      return jobSnapshot(job, this.now());
    },
  };

  templates: FlipbookApi["templates"] = {
    list: async () => clone(TEMPLATES),
  };

  demo: FlipbookApi["demo"] = {
    reset: async () => {
      try {
        this.storage.removeItem(STORAGE_KEY);
      } catch {
        // Storage may be unavailable; the reseed below still replaces the in-memory copy.
      }
      this.db = seedDb(this.now());
      this.save();
    },
  };
}
