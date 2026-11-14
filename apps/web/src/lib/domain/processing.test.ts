import { jobProgress, jobSnapshot, visibleLogLines } from "./jobs";
import { processingFrames, processingStages } from "./processing";
import type { Job } from "./types";

describe("processing stages", () => {
  it("starts with layout reading and the rest queued", () => {
    expect(processingStages(0).map((s) => s.status)).toEqual(["reading", "queued", "queued", "queued"]);
  });

  it("tracks motion during the animation stage and counts animations", () => {
    const s = processingStages(70);
    expect(s.map((x) => x.state)).toEqual(["done", "done", "active", "queued"]);
    expect(s[2]).toMatchObject({ label: "Animations · 2 found", status: "tracking motion" });
  });

  it("is all done at 100", () => {
    expect(processingStages(100).every((s) => s.status === "done")).toBe(true);
  });

  it("reveals frames every 12% and accents three of them", () => {
    expect(processingFrames(0).filter((f) => f.visible)).toHaveLength(1);
    const all = processingFrames(100);
    expect(all.every((f) => f.visible)).toBe(true);
    expect(all.filter((f) => f.accent).length).toBe(3);
  });
});

describe("jobs", () => {
  const job: Job = { id: "j", kind: "analysis", projectId: "p", startedAt: "2026-01-01T00:00:00.000Z", startProgress: 62, step: 1, tickMs: 900 };
  const t0 = Date.parse(job.startedAt);

  it("advances with time and caps at 100", () => {
    expect(jobProgress(job, t0)).toBe(62);
    expect(jobProgress(job, t0 + 9000)).toBe(72);
    expect(jobSnapshot(job, t0 + 60_000)).toMatchObject({ progress: 100, status: "done" });
  });

  it("reveals deploy log lines every 30%", () => {
    const lines = ["a", "b", "c", "d"];
    expect(visibleLogLines(lines, 0)).toEqual(["a"]);
    expect(visibleLogLines(lines, 64)).toEqual(["a", "b", "c"]);
    expect(visibleLogLines(lines, 100)).toEqual(lines);
  });
});
