import { levelOf } from "./levels";
import type { Animation, GeneratedProperty, InspectorState, ObservedProperty } from "./types";

/** The only animation with a lesson and challenge in the sample content. */
export const CHALLENGE_ANIMATION_ID = "stagger";
export const DEFAULT_ANIMATION_ID = "stagger";
export const SLOW_MOTION_FACTOR = 4;

export interface LearnerState {
  learned: string[];
  xp: number;
  challengePassed: boolean;
}

export type AnimationTag = { kind: "learned"; label: "✓" } | { kind: "locked"; label: string } | { kind: "new"; label: "new" };

export function isLocked(anim: Pick<Animation, "unlockLevel">, xp: number): boolean {
  return anim.unlockLevel !== null && levelOf(xp).level < anim.unlockLevel;
}

export function animationTag(anim: Pick<Animation, "id" | "unlockLevel">, learner: LearnerState): AnimationTag {
  if (learner.learned.includes(anim.id)) return { kind: "learned", label: "✓" };
  if (isLocked(anim, learner.xp)) return { kind: "locked", label: `Lv ${anim.unlockLevel}` };
  return { kind: "new", label: "new" };
}

export type InspectorAction = "learn" | "challenge" | "learned" | "locked";

/**
 * The inspector's call to action, per the prototype: an unlearned animation can be learned unless it is
 * level-locked; the card stagger stays on "Take the challenge" until the challenge is passed.
 */
export function inspectorAction(anim: Pick<Animation, "id" | "unlockLevel">, learner: LearnerState): InspectorAction {
  const learned = learner.learned.includes(anim.id);
  if (!learned) return isLocked(anim, learner.xp) ? "locked" : "learn";
  if (anim.id === CHALLENGE_ANIMATION_ID && !learner.challengePassed) return "challenge";
  return "learned";
}

export interface InspectorRow {
  name: string;
  observed: ObservedProperty;
  /** Display value of the generated property; duration-bound rows show the inspector's current duration. */
  generated: string;
  editable: boolean;
}

/** Pairs observed and generated properties by name, keeping them as separate sources. */
export function inspectorRows(anim: Animation, inspector: InspectorState): InspectorRow[] {
  return anim.observed.map((obs, i) => {
    const gen: GeneratedProperty | undefined = anim.generated.find((g) => g.name === obs.name) ?? anim.generated[i];
    const duration = inspector.durations[anim.id];
    const editable = !!gen?.durationBound && duration !== undefined;
    return { name: obs.name, observed: obs, generated: editable ? `${duration}ms` : (gen?.value ?? "—"), editable };
  });
}

/** An unknown observation has no value; it must read "unknown", never a number. */
export function observedLabel(obs: ObservedProperty): string {
  return obs.certainty === "unknown" || obs.value === null ? "unknown" : obs.value;
}
