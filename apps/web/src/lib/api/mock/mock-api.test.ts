import { memoryStorage, type KeyValueStorage } from "./db";
import { MockFlipbookApi } from "./mock-api";

const T0 = Date.parse("2026-11-14T20:00:00.000Z");

function setup(storage: KeyValueStorage = memoryStorage()) {
  const clock = { t: T0 };
  const api = new MockFlipbookApi({ storage, now: () => clock.t });
  return { api, clock, storage };
}

describe("MockFlipbookApi", () => {
  it("rejects invalid uploads and runs a processing job to review", async () => {
    const { api, clock } = setup();
    await expect(api.projects.create({ source: "file", fileName: "a.pdf", sizeBytes: 10, mimeType: "application/pdf", outputs: [] })).rejects.toThrow(
      /supported video/,
    );
    const { project, job } = await api.projects.create({ source: "file", fileName: "My Site.mp4", sizeBytes: 1000, mimeType: "video/mp4", outputs: ["React"] });
    expect(project).toMatchObject({ id: "my-site", status: "processing" });
    expect(job.progress).toBe(0);
    clock.t += 2000;
    expect((await api.jobs.get(job.id))!.progress).toBe(56);
    clock.t += 2000;
    expect((await api.jobs.get(job.id))!.status).toBe("done");
    expect((await api.projects.get("my-site"))!.status).toBe("needs_review");
    const generated = await api.generation.generate("my-site", ["nav", "hero"]);
    expect(generated).toMatchObject({ status: "ready", matchFixed: false, animationIds: ["nav", "hero"] });
    const versions = await api.versions.list("my-site");
    expect(versions).toHaveLength(1);
    expect(versions[0]).toMatchObject({ v: 1, kind: "First generation", description: "94% match" });
  });

  it("finishes the agency-reel analysis over time", async () => {
    const { api, clock } = setup();
    expect((await api.projects.get("agency-reel"))!.progress).toBe(62);
    clock.t += 9000;
    expect((await api.projects.get("agency-reel"))!.progress).toBe(72);
    clock.t += 60_000;
    expect((await api.projects.get("agency-reel"))!).toMatchObject({ status: "needs_review", progress: 100 });
  });

  it("awards the fix XP once per project", async () => {
    const { api } = setup();
    const first = await api.projects.fixMatch("studio-landing");
    expect(first.project.matchFixed).toBe(true);
    expect(first.award).toMatchObject({ awarded: true, amount: 30, xp: 1270 });
    const again = await api.projects.fixMatch("studio-landing");
    expect(again.award.awarded).toBe(false);
    expect((await api.learning.getProgress()).xp).toBe(1270);
  });

  it("scores challenge attempts and pays 180 XP once when the hint was used", async () => {
    const { api } = setup();
    const id = "card-stagger-challenge";
    const fail = await api.exercises.submit(id, { durationMs: 300, staggerMs: 0, easeIndex: 2 });
    expect(fail).toMatchObject({ score: { total: 47 }, firstPass: false, award: null, challenge: { attempts: 1, passed: false } });
    await api.exercises.revealHint(id);
    const pass = await api.exercises.submit(id, { durationMs: 480, staggerMs: 90, easeIndex: 1 });
    expect(pass).toMatchObject({ firstPass: true, award: { amount: 180 }, challenge: { attempts: 2, passed: true, bestScore: 100 } });
    const repeat = await api.exercises.submit(id, { durationMs: 480, staggerMs: 90, easeIndex: 1 });
    expect(repeat).toMatchObject({ firstPass: false, award: null, challenge: { attempts: 3 } });
    expect((await api.learning.getProgress()).xp).toBe(1240 + 180);
  });

  it("completes the lesson once", async () => {
    const { api } = setup();
    const a = await api.learning.completeLesson("card-stagger");
    expect(a.progress.learned).toContain("stagger");
    expect(a.award.amount).toBe(60);
    expect((await api.learning.completeLesson("card-stagger")).award.awarded).toBe(false);
  });

  it("edits and saves inspector durations as versions", async () => {
    const { api } = setup();
    const ins = await api.animations.setDuration("studio-landing", "stagger", 9999);
    expect(ins.durations.stagger).toBe(1500);
    await api.animations.setDuration("studio-landing", "stagger", 500);
    const { result, versions } = await api.animations.saveDuration("studio-landing", "stagger");
    expect(result.saved.stagger).toBe(500);
    expect(versions[0]).toMatchObject({ v: 8, kind: "Inspector edit", description: "Card stagger duration 480 → 500ms" });
    await expect(api.animations.saveDuration("studio-landing", "stagger")).rejects.toThrow(/Nothing to save/);
  });

  it("restores by appending, replaces card-2 once, and runs the assistant flow", async () => {
    const { api } = setup();
    const restored = await api.versions.restore("studio-landing", 5);
    expect(restored[0]).toMatchObject({ v: 8, kind: "Restored" });
    expect(restored).toHaveLength(6);

    const assets = await api.assets.replace("studio-landing", "card-2");
    expect(assets.result.card2Replaced).toBe(true);
    expect(assets.versions[0]).toMatchObject({ v: 9, kind: "Asset replaced" });
    await expect(api.assets.replace("studio-landing", "card-2")).rejects.toThrow(/Pick an asset/);

    const asked = await api.generation.ask("studio-landing", { editId: "fix" });
    expect(asked.pending).toMatchObject({ id: "fix", file: "Cards.tsx" });
    const accepted = await api.generation.accept("studio-landing");
    expect(accepted.result).toMatchObject({ typeErrorFixed: true, pending: null });
    expect(accepted.result.suggestions.map((s) => s.id)).toEqual(["hero"]);
    expect(accepted.versions[0]).toMatchObject({ v: 10, kind: "Assistant", description: '"Fix the type error in Cards.tsx" · accepted' });

    await api.generation.ask("studio-landing", { text: "Make it pop" });
    const rejected = await api.generation.reject("studio-landing");
    expect(rejected.pending).toBeNull();
    expect(rejected.chat.at(-1)!.text).toBe("Rejected. Nothing changed.");
  });

  it("opens templates as ready sample projects, reusing an existing one", async () => {
    const { api } = setup();
    expect((await api.projects.openTemplate("portfolio-grid")).id).toBe("portfolio-grid");
    const p = await api.projects.openTemplate("agency-hero");
    expect(p).toMatchObject({ id: "agency-hero", status: "ready", matchFixed: true });
    expect((await api.projects.list())[0]!.id).toBe("agency-hero");
  });

  it("runs a simulated export job", async () => {
    const { api, clock } = setup();
    const job = await api.exports.start("studio-landing", {
      target: "github",
      options: { respectReducedMotion: true, lessonNotes: true, placeholderImages: false },
    });
    expect(job.status).toBe("running");
    clock.t += 1500;
    expect(await api.jobs.get(job.id)).toMatchObject({ status: "done", meta: { title: "Pushed", sub: "github.com/you/studio-landing · main" } });
  });

  it("persists across instances and resets to seed", async () => {
    const storage = memoryStorage();
    const { api } = setup(storage);
    await api.settings.update({ showXp: false });
    await api.learning.setLessonStep(3);
    await api.animations.setDuration("studio-landing", "hero", 640);
    await api.generation.ask("studio-landing", { text: "Tighter cards" });
    await api.exercises.submit("card-stagger-challenge", { durationMs: 480, staggerMs: 90, easeIndex: 1 });
    await api.projects.fixMatch("studio-landing");
    const { api: reloaded } = setup(storage);
    expect((await reloaded.settings.get()).showXp).toBe(false);
    const progress = await reloaded.learning.getProgress();
    expect(progress).toMatchObject({ lessonStep: 3, xp: 1240 + 200 + 30, challenge: { passed: true, bestScore: 100 } });
    expect((await reloaded.animations.getInspector("studio-landing")).durations.hero).toBe(640);
    expect((await reloaded.generation.getBuild("studio-landing")).chat[0]!.text).toBe("Tighter cards");
    expect((await reloaded.projects.get("studio-landing"))!.matchFixed).toBe(true);
    await reloaded.demo.reset();
    expect((await reloaded.settings.get()).showXp).toBe(true);
    expect((await setup(storage).api.learning.getProgress()).lessonStep).toBe(1);
  });
});
