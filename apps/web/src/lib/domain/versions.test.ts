import type { ProjectVersion } from "./types";
import { comparePair, diffTone, latestVersion, pushVersion, restoreCandidate, restoreVersion } from "./versions";

const v = (n: number): ProjectVersion => ({ v: n, kind: "Manual save", description: `v${n}`, createdAt: "2026-01-01T00:00:00.000Z", color: "#fff", diff: [`+ ${n}`] });
const history = [v(7), v(6), v(5), v(4), v(1)];
const now = new Date("2026-11-14T12:00:00.000Z");

describe("versions", () => {
  it("pushes a new newest version above the highest number", () => {
    const next = pushVersion(history, { kind: "Assistant", description: "x", diff: [], color: "#000" }, now);
    expect(next.map((x) => x.v)).toEqual([8, 7, 6, 5, 4, 1]);
    expect(next[0]!.createdAt).toBe(now.toISOString());
    expect(history).toHaveLength(5);
  });

  it("restores by appending a Restored version and keeps every old version", () => {
    const next = restoreVersion(history, 5, now);
    expect(next).toHaveLength(6);
    expect(next[0]).toMatchObject({ v: 8, kind: "Restored", description: "Back to v5", diff: ["= contents of v5"] });
    expect(next.slice(1)).toEqual(history);
  });

  it("refuses to restore a version that does not exist", () => {
    expect(() => restoreVersion(history, 3, now)).toThrow(RangeError);
  });

  it("picks the restore candidate like the prototype", () => {
    expect(restoreCandidate(history, 0)?.v).toBe(6);
    expect(restoreCandidate(history, 2)?.v).toBe(5);
    expect(restoreCandidate([v(1)], 0)).toBeNull();
    expect(restoreCandidate([], 0)).toBeNull();
  });

  it("compares the selection with the version before it", () => {
    expect(comparePair(history, 1)).toMatchObject({ selected: { v: 6 }, previous: { v: 5 } });
    expect(comparePair(history, 4)).toMatchObject({ selected: { v: 1 }, previous: null });
  });

  it("reports latest version and diff tones", () => {
    expect(latestVersion(history)).toBe(7);
    expect(latestVersion([])).toBe(0);
    expect(["- a", "+ b", "= c"].map(diffTone)).toEqual(["removed", "added", "context"]);
  });
});
