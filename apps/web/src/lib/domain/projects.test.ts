import { CHALLENGE_START } from "./scoring";
import { matchesFilter, openAction, projectCardMeta, statusBadge } from "./projects";
import { skillTiles } from "./skills";
import { formatRelative, greeting } from "./time";
import type { LearningProgress, Project } from "./types";

const now = Date.parse("2026-11-14T20:00:00.000Z");
const progress: LearningProgress = {
  xp: 1240,
  learned: ["nav", "hero"],
  lessonStep: 1,
  challenge: { attempts: 1, lastScore: null, bestScore: null, hintUsed: false, passed: false, params: CHALLENGE_START },
  awardedKeys: [],
};
const base: Project = {
  id: "studio-landing",
  name: "studio-landing",
  status: "ready",
  progress: 100,
  source: { kind: "tab" },
  outputs: [],
  matchFixed: false,
  animationIds: [],
  jobId: null,
  createdAt: new Date(now - 6 * 60_000).toISOString(),
  updatedAt: new Date(now - 2 * 3_600_000).toISOString(),
};

describe("project cards", () => {
  it("describes each status", () => {
    expect(projectCardMeta(base, { latestVersion: 7, progress, now })).toBe("edited 2h ago · v7 · 2/5 learned");
    expect(projectCardMeta({ ...base, status: "processing" }, { latestVersion: 0, progress, now })).toBe("created 6 min ago");
    expect(projectCardMeta({ ...base, status: "needs_review" }, { latestVersion: 0, progress, now })).toBe("analysis ready · not generated");
    const sample = { ...base, source: { kind: "sample" as const, templateId: "t", lessonsLearned: 3, lessonsTotal: 3 } };
    expect(projectCardMeta(sample, { latestVersion: 1, progress, now })).toBe("from sample · 3/3 learned");
  });

  it("badges, filters and opens by status", () => {
    expect(statusBadge({ ...base, status: "processing", progress: 62 }).label).toBe("ANALYSING 62%");
    expect(statusBadge({ ...base, status: "needs_review" }).label).toBe("NEEDS REVIEW");
    expect(matchesFilter({ ...base, status: "needs_review" }, "Needs review")).toBe(true);
    expect(matchesFilter(base, "Processing")).toBe(false);
    expect(openAction({ ...base, status: "processing" })).toBe("still-processing");
    expect(openAction({ ...base, status: "needs_review" })).toBe("review");
    expect(openAction(base)).toBe("overview");
  });
});

describe("time", () => {
  it("formats relative times", () => {
    expect(formatRelative(new Date(now).toISOString(), now)).toBe("just now");
    expect(formatRelative(new Date(now - 26 * 3_600_000).toISOString(), now)).toBe("yesterday");
    expect(formatRelative(new Date(now - 3 * 86_400_000).toISOString(), now)).toBe("3 days ago");
  });

  it("greets by time of day", () => {
    expect(greeting(new Date(2026, 0, 1, 9))).toBe("Good morning");
    expect(greeting(new Date(2026, 0, 1, 20))).toBe("Good evening");
  });
});

describe("skillTiles", () => {
  it("reacts to learning state and level", () => {
    const start = skillTiles({ learned: ["nav", "hero"], challengePassed: false, level: 4 });
    expect(start.map((s) => s.kind)).toEqual(["done", "done", "prog", "prog", "seen", "seen", "lock", "lock"]);
    expect(start[3]!.status).toBe("2 / 4 lessons");
    const later = skillTiles({ learned: ["nav", "hero", "stagger"], challengePassed: true, level: 5 });
    expect(later[2]).toMatchObject({ status: "mastered", kind: "done" });
    expect(later[3]!.status).toBe("3 / 4 lessons");
    expect(later[4]).toMatchObject({ status: "unlocked · lesson ready", kind: "prog" });
  });
});
