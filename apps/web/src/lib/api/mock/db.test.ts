import { loadDb, memoryStorage, saveDb, seedDb, STORAGE_KEY, type KeyValueStorage } from "./db";

const NOW = Date.parse("2026-11-14T20:00:00.000Z");

describe("loadDb", () => {
  it("seeds and persists when storage is empty", () => {
    const storage = memoryStorage();
    const db = loadDb(storage, NOW);
    expect(db.projects.map((p) => p.id)).toEqual(["studio-landing", "agency-reel", "pricing-page", "portfolio-grid"]);
    expect(db.progress.xp).toBe(1240);
    expect(JSON.parse(storage.getItem(STORAGE_KEY)!).schema).toBe(1);
  });

  it("keeps valid stored data", () => {
    const storage = memoryStorage();
    const db = seedDb(NOW);
    db.progress.xp = 2000;
    saveDb(storage, db);
    expect(loadDb(storage, NOW + 1000).progress.xp).toBe(2000);
  });

  it.each([
    ["corrupt JSON", "{not json"],
    ["an old schema", JSON.stringify({ ...seedDb(NOW), schema: 0 })],
    ["a wrong shape", JSON.stringify({ schema: 1, projects: "nope" })],
    ["a project without its record", JSON.stringify({ ...seedDb(NOW), records: {} })],
    ["null", "null"],
  ])("falls back to seed data on %s", (_label, raw) => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, raw);
    const db = loadDb(storage, NOW);
    expect(db.progress.xp).toBe(1240);
    expect(db.projects).toHaveLength(4);
  });

  it("fills settings added after the data was saved", () => {
    const storage = memoryStorage();
    const db = seedDb(NOW);
    const older: Partial<typeof db.settings> = { ...db.settings };
    delete older.reduceMotion;
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...db, settings: older }));
    expect(loadDb(storage, NOW).settings.reduceMotion).toBe(false);
  });

  it("survives storage that throws", () => {
    const broken: KeyValueStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("quota");
      },
      removeItem: () => undefined,
    };
    expect(loadDb(broken, NOW).projects).toHaveLength(4);
  });
});
