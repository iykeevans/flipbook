import { DAILY_GOAL_OPTIONS, DEFAULT_OUTPUT_OPTIONS, DELETE_RECORDING_OPTIONS, LESSON_LEVEL_OPTIONS } from "@/lib/domain/constants";
import type { Settings } from "@/lib/domain/types";

type BooleanKey = { [K in keyof Settings]: Settings[K] extends boolean ? K : never }[keyof Settings];
type ChoiceKey = "defaultOutput" | "lessonLevel" | "dailyGoal" | "deleteRecordings";

export type SettingRow =
  | { type: "toggle"; label: string; key: BooleanKey }
  | { type: "choice"; label: string; key: ChoiceKey; options: readonly string[] }
  | { type: "action"; label: string; action: "manage-data" | "reset-demo"; button: string };

export const SETTING_SECTIONS: { title: string; rows: SettingRow[] }[] = [
  {
    title: "GENERATION",
    rows: [
      { type: "choice", label: "Default output", key: "defaultOutput", options: DEFAULT_OUTPUT_OPTIONS },
      { type: "toggle", label: "Review analysis before generating", key: "reviewBeforeGenerate" },
      { type: "toggle", label: "Show confidence labels in code comments", key: "confidenceComments" },
      { type: "toggle", label: "Respect prefers-reduced-motion in output", key: "respectReducedMotionInOutput" },
    ],
  },
  {
    title: "LEARNING",
    rows: [
      { type: "choice", label: "Default lesson level", key: "lessonLevel", options: LESSON_LEVEL_OPTIONS },
      { type: "choice", label: "Daily XP goal", key: "dailyGoal", options: DAILY_GOAL_OPTIONS },
      { type: "toggle", label: "Show XP, levels and streaks", key: "showXp" },
    ],
  },
  {
    title: "PRIVACY & DATA",
    rows: [
      { type: "toggle", label: "Allow my recordings to improve models", key: "allowTraining" },
      { type: "choice", label: "Delete recordings after generation", key: "deleteRecordings", options: DELETE_RECORDING_OPTIONS },
      { type: "action", label: "Export or delete all my data", action: "manage-data", button: "Manage" },
    ],
  },
  {
    title: "APP",
    rows: [
      { type: "toggle", label: "Reduce motion in Flipbook", key: "reduceMotion" },
      { type: "action", label: "Reset demo data", action: "reset-demo", button: "Reset" },
    ],
  },
];
