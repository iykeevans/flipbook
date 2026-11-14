import { SAMPLE_ANIMATIONS } from "@/lib/api/mock/content";
import { animationTag, inspectorAction, inspectorRows, observedLabel } from "./animations";

const anim = (id: string) => SAMPLE_ANIMATIONS.find((a) => a.id === id)!;
const seed = { learned: ["nav", "hero"], xp: 1240, challengePassed: false };

describe("animationTag", () => {
  it("marks learned, level-locked and new animations", () => {
    expect(animationTag(anim("nav"), seed)).toEqual({ kind: "learned", label: "✓" });
    expect(animationTag(anim("stagger"), seed)).toEqual({ kind: "new", label: "new" });
    expect(animationTag(anim("parallax"), seed)).toEqual({ kind: "locked", label: "Lv 5" });
    expect(animationTag(anim("spring"), seed)).toEqual({ kind: "locked", label: "Lv 6" });
  });

  it("unlocks at the level threshold", () => {
    expect(animationTag(anim("parallax"), { ...seed, xp: 1600 }).kind).toBe("new");
    expect(animationTag(anim("spring"), { ...seed, xp: 2399 }).kind).toBe("locked");
  });
});

describe("inspectorAction", () => {
  it("follows the prototype's learn → challenge → learned sequence for the card stagger", () => {
    expect(inspectorAction(anim("stagger"), seed)).toBe("learn");
    expect(inspectorAction(anim("stagger"), { ...seed, learned: [...seed.learned, "stagger"] })).toBe("challenge");
    expect(inspectorAction(anim("stagger"), { ...seed, learned: [...seed.learned, "stagger"], challengePassed: true })).toBe("learned");
  });

  it("shows learned for other learned animations and a lock for locked ones", () => {
    expect(inspectorAction(anim("hero"), seed)).toBe("learned");
    expect(inspectorAction(anim("spring"), seed)).toBe("locked");
    expect(inspectorAction(anim("parallax"), { ...seed, xp: 1700 })).toBe("learn");
  });
});

describe("inspectorRows", () => {
  const inspector = { durations: { nav: 200, hero: 700, stagger: 520 }, saved: { nav: 200, hero: 700, stagger: 480 } };

  it("shows the inspector's current duration on the editable row", () => {
    const rows = inspectorRows(anim("stagger"), inspector);
    const duration = rows.find((r) => r.name === "duration")!;
    expect(duration).toMatchObject({ generated: "520ms", editable: true });
    expect(duration.observed).toEqual({ name: "duration", value: "~500ms", certainty: "inferred" });
    expect(rows.filter((r) => r.editable)).toHaveLength(1);
  });

  it("has no editable row for animations without a duration", () => {
    expect(inspectorRows(anim("spring"), inspector).some((r) => r.editable)).toBe(false);
  });

  it("keeps unknown observations as 'unknown' while the generated side has a value", () => {
    const stiffness = inspectorRows(anim("spring"), inspector).find((r) => r.name === "stiffness")!;
    expect(observedLabel(stiffness.observed)).toBe("unknown");
    expect(stiffness.generated).toBe("400");
  });
});

describe("observedLabel", () => {
  it("never shows a number for an unknown value", () => {
    expect(observedLabel({ name: "x", value: "12", certainty: "unknown" })).toBe("unknown");
    expect(observedLabel({ name: "x", value: null, certainty: "unknown" })).toBe("unknown");
    expect(observedLabel({ name: "x", value: "~90ms", certainty: "inferred" })).toBe("~90ms");
  });
});
