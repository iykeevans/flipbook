export type ProjectStatus = "processing" | "needs_review" | "ready";

export type ProjectSource =
  | { kind: "file"; fileName: string; sizeBytes: number; mimeType: string }
  | { kind: "tab" }
  | { kind: "url"; url: string }
  | { kind: "sample"; templateId: string; lessonsLearned: number; lessonsTotal: number };

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  /** Analysis progress 0–100. Only meaningful while `status === "processing"`. */
  progress: number;
  source: ProjectSource;
  outputs: string[];
  /** The overview's "first card enters 120ms late" defect has been fixed. */
  matchFixed: boolean;
  /** Animation ids kept in review; the generated site includes only these. */
  animationIds: string[];
  jobId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type Certainty = "observed" | "inferred" | "unknown";

/** What the recording shows. `value` is null when the certainty is "unknown". */
export interface ObservedProperty {
  name: string;
  value: string | null;
  certainty: Certainty;
}

/** What Flipbook generated. `durationBound` rows display the inspector's editable duration. */
export interface GeneratedProperty {
  name: string;
  value: string;
  durationBound?: boolean;
}

export interface TimelineBar {
  /** Percent of the timeline width. */
  start: number;
  width: number;
}

export interface Animation {
  id: string;
  name: string;
  concept: string;
  color: string;
  bars: TimelineBar[];
  trigger: string;
  confidence: number;
  /** Seconds into the recording where the animation is seen. */
  recordedAt: number;
  /** How the generated code implements it, e.g. "Motion staggerChildren". */
  generatedWith: string;
  spec: string;
  observed: ObservedProperty[];
  generated: GeneratedProperty[];
  /** Default generated duration in ms for animations with an editable duration. */
  defaultDurationMs: number | null;
  unlockLevel: number | null;
}

export interface InspectorState {
  durations: Record<string, number>;
  saved: Record<string, number>;
}

export type VersionKind =
  | "First generation"
  | "Inspector edit"
  | "Assistant"
  | "Manual save"
  | "Regenerated section"
  | "Regenerated site"
  | "Asset replaced"
  | "Restored";

export interface ProjectVersion {
  v: number;
  kind: VersionKind;
  description: string;
  createdAt: string;
  color: string;
  diff: string[];
}

export interface ChallengeState {
  attempts: number;
  lastScore: ScoreResult | null;
  bestScore: number | null;
  hintUsed: boolean;
  passed: boolean;
  params: ChallengeParams;
}

export interface LearningProgress {
  xp: number;
  learned: string[];
  lessonStep: number;
  challenge: ChallengeState;
  /** Idempotency keys of XP awards already granted, e.g. "fix:studio-landing". */
  awardedKeys: string[];
}

export type LessonLevel = 0 | 1 | 2;

export interface Settings {
  /** Index into DEFAULT_OUTPUT_OPTIONS. */
  defaultOutput: number;
  reviewBeforeGenerate: boolean;
  confidenceComments: boolean;
  respectReducedMotionInOutput: boolean;
  lessonLevel: LessonLevel;
  /** Index into DAILY_GOAL_OPTIONS. */
  dailyGoal: number;
  showXp: boolean;
  allowTraining: boolean;
  /** Index into DELETE_RECORDING_OPTIONS. */
  deleteRecordings: number;
  reduceMotion: boolean;
}

export interface User {
  id: string;
  name: string;
  streakDays: number;
}

export interface Ease {
  label: string;
  css: string;
  bezier: [number, number, number, number];
  score: number;
}

export interface ChallengeParams {
  durationMs: number;
  staggerMs: number;
  easeIndex: number;
}

export interface ScoreRow {
  label: "Distance" | "Duration" | "Stagger" | "Easing";
  value: number;
}

export interface ScoreResult {
  rows: ScoreRow[];
  total: number;
}

export interface Level {
  level: number;
  name: string;
  minXp: number;
  nextXp: number;
}

export interface XpAward {
  awarded: boolean;
  amount: number;
  reason: string;
  xp: number;
  leveledUp: boolean;
  level: number;
  levelName: string;
  /** Concept unlocked by reaching `level`, when it levelled up. */
  unlocked: string | null;
}

export type JobKind = "processing" | "analysis" | "export";
export type JobStatus = "running" | "done";

export interface Job {
  id: string;
  kind: JobKind;
  projectId: string;
  startedAt: string;
  startProgress: number;
  /** Progress points gained per tick. */
  step: number;
  tickMs: number;
  meta?: Record<string, string>;
}

export interface JobSnapshot {
  id: string;
  kind: JobKind;
  projectId: string;
  progress: number;
  status: JobStatus;
  meta?: Record<string, string>;
}

export interface Template {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  tags: string[];
  length: string;
  lessons: number;
}

export type SectionCertainty = "observed" | "inferred" | "partial";

export interface AnalysisSection {
  label: string;
  certainty: SectionCertainty;
  /** Percent offsets inside the recording frame. */
  top: number;
  height: number;
  color: string;
}

export interface Analysis {
  projectId: string;
  sections: AnalysisSection[];
  frameCount: number;
  keyFrames: number;
  durationSec: number;
  resolution: string;
  summary: string;
  animations: Pick<Animation, "id" | "name" | "confidence">[];
  /** Animation ids pre-ticked in review. */
  defaultSelected: string[];
}

export type StackId = "Framer Motion" | "GSAP" | "Web Animations API" | "HTML/CSS";

export interface CodeFile {
  stack: StackId;
  fileName: string;
  code: string;
}

export type EditId = "hero" | "fix";

export interface ChatMessage {
  fromUser: boolean;
  text: string;
}

export interface PendingEdit {
  id: EditId;
  ask: string;
  file: string;
  minus: string;
  plus: string;
}

export interface BuildState {
  stack: StackId;
  viewport: 0 | 1 | 2;
  chat: ChatMessage[];
  pending: PendingEdit | null;
  heroPadded: boolean;
  typeErrorFixed: boolean;
  suggestions: { id: EditId; label: string }[];
}

export interface Asset {
  id: string;
  name: string;
  status: string;
  certainty: "observed" | "inferred" | "neutral" | "placeholder";
  kind: "image" | "frame" | "font" | "recording";
  /** Short label drawn inside the thumbnail, e.g. a timestamp or "Aa". */
  thumb: string;
  fontFamily?: "display" | "mono";
}

export interface AssetGroup {
  id: "images" | "frames" | "fonts" | "recording";
  label: string;
  count: number;
  items: Asset[];
}

export interface AssetLibrary {
  groups: AssetGroup[];
  card2Replaced: boolean;
}

export type ExportTarget = "deploy" | "github" | "zip";

export interface ExportOptions {
  respectReducedMotion: boolean;
  lessonNotes: boolean;
  placeholderImages: boolean;
}

export interface LessonStepCopy {
  title: string;
  body: string;
}

export interface WalkthroughLine {
  /** Index into `codeLines`. */
  line: number;
  head: string;
  /** Explanation per lesson level: Beginner, Intermediate, Advanced. */
  text: [string, string, string];
}

export interface QuizOption {
  label: string;
  feedback: string;
  correct: boolean;
}

export interface Lesson {
  id: string;
  animationId: string;
  title: string;
  steps: LessonStepCopy[];
  facts: string[];
  tryPrompt: string;
  codeLines: string[];
  walkthrough: WalkthroughLine[];
  tutor: { question: string; answer: string }[];
  quiz: QuizOption[];
  xp: number;
}

export interface Exercise {
  id: string;
  animationId: string;
  title: string;
  target: ChallengeParams;
  initial: ChallengeParams;
  passScore: number;
  xp: number;
  hintPenalty: number;
  hint: string;
}

export type SkillKind = "done" | "prog" | "seen" | "lock";

export interface SkillTile {
  name: string;
  status: string;
  kind: SkillKind;
}
