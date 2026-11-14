import { COLORS, XP_REWARDS } from "@/lib/domain/constants";
import { CHALLENGE_START, CHALLENGE_TARGET } from "@/lib/domain/scoring";
import type {
  AnalysisSection,
  Animation,
  Asset,
  AssetGroup,
  CodeFile,
  EditId,
  Exercise,
  Lesson,
  ProjectVersion,
  StackId,
  Template,
} from "@/lib/domain/types";

/** Simulated analysis output. Every project gets this same sample analysis until real processing exists. */
export const SAMPLE_ANIMATIONS: Animation[] = [
  {
    id: "nav",
    name: "Nav underline",
    concept: "Transitions",
    color: COLORS.lilac,
    bars: [{ start: 2, width: 8 }],
    trigger: "on hover",
    confidence: 0.91,
    recordedAt: 1,
    generatedWith: "a CSS transition on ::after",
    spec: "scaleX 0→1 · 200ms · ease-out · on hover",
    observed: [
      { name: "scaleX", value: "0 → 1", certainty: "observed" },
      { name: "origin", value: "left", certainty: "observed" },
      { name: "duration", value: "~200ms", certainty: "inferred" },
      { name: "easing", value: "ease-out-ish", certainty: "inferred" },
    ],
    generated: [
      { name: "scaleX", value: "0 → 1" },
      { name: "origin", value: "left" },
      { name: "duration", value: "200ms", durationBound: true },
      { name: "easing", value: "ease-out" },
    ],
    defaultDurationMs: 200,
    unlockLevel: null,
  },
  {
    id: "hero",
    name: "Hero fade-up",
    concept: "Keyframes",
    color: COLORS.orange,
    bars: [{ start: 6, width: 18 }],
    trigger: "on load",
    confidence: 0.88,
    recordedAt: 2,
    generatedWith: "Motion initial/animate",
    spec: "translateY 32→0 · opacity 0→1 · 700ms · ease-out",
    observed: [
      { name: "translateY", value: "32px → 0", certainty: "observed" },
      { name: "opacity", value: "0 → 1", certainty: "observed" },
      { name: "duration", value: "~700ms", certainty: "inferred" },
      { name: "easing", value: "ease-out-ish", certainty: "inferred" },
    ],
    generated: [
      { name: "translateY", value: "32px → 0" },
      { name: "opacity", value: "0 → 1" },
      { name: "duration", value: "700ms", durationBound: true },
      { name: "easing", value: "easeOut" },
    ],
    defaultDurationMs: 700,
    unlockLevel: null,
  },
  {
    id: "stagger",
    name: "Card stagger",
    concept: "Stagger + easing",
    color: COLORS.mint,
    bars: [
      { start: 24, width: 12 },
      { start: 30, width: 12 },
      { start: 36, width: 12 },
    ],
    trigger: "scroll reveal",
    confidence: 0.86,
    recordedAt: 12,
    generatedWith: "Motion staggerChildren",
    spec: "translateY 40→0 · opacity 0→1 · 480ms · ease-out · 90ms stagger",
    observed: [
      { name: "translateY", value: "40px → 0", certainty: "observed" },
      { name: "opacity", value: "0 → 1", certainty: "observed" },
      { name: "duration", value: "~500ms", certainty: "inferred" },
      { name: "easing", value: "ease-out-ish", certainty: "inferred" },
      { name: "stagger", value: "~90ms", certainty: "inferred" },
      { name: "repeat", value: null, certainty: "unknown" },
    ],
    generated: [
      { name: "translateY", value: "40px → 0" },
      { name: "opacity", value: "0 → 1" },
      { name: "duration", value: "480ms", durationBound: true },
      { name: "easing", value: "easeOut" },
      { name: "stagger", value: "90ms" },
      { name: "repeat", value: "once" },
    ],
    defaultDurationMs: 480,
    unlockLevel: null,
  },
  {
    id: "parallax",
    name: "Scroll parallax",
    concept: "Scroll-linked",
    color: COLORS.yellow,
    bars: [{ start: 46, width: 40 }],
    trigger: "scroll-linked",
    confidence: 0.71,
    recordedAt: 20,
    generatedWith: "Motion useScroll + useTransform",
    spec: "translateY 0→-120px · linked to scroll progress",
    observed: [
      { name: "translateY", value: "0 → -120px", certainty: "inferred" },
      { name: "range", value: "section in view", certainty: "inferred" },
      { name: "smoothing", value: null, certainty: "unknown" },
    ],
    generated: [
      { name: "translateY", value: "0 → -120px" },
      { name: "range", value: "start end → end start" },
      { name: "smoothing", value: "none" },
    ],
    defaultDurationMs: null,
    unlockLevel: 5,
  },
  {
    id: "spring",
    name: "Button spring",
    concept: "Springs",
    color: COLORS.orange,
    bars: [{ start: 78, width: 9 }],
    trigger: "on press",
    confidence: 0.64,
    recordedAt: 38,
    generatedWith: "Motion whileTap with a spring",
    spec: "scale 1→0.96→1 · spring(stiffness 400, damping 18)",
    observed: [
      { name: "scale", value: "1 → 0.96 → 1", certainty: "observed" },
      { name: "stiffness", value: null, certainty: "unknown" },
      { name: "damping", value: null, certainty: "unknown" },
    ],
    generated: [
      { name: "scale", value: "1 → 0.96 → 1" },
      { name: "stiffness", value: "400" },
      { name: "damping", value: "18" },
    ],
    defaultDurationMs: null,
    unlockLevel: 6,
  },
];

export const DEFAULT_REVIEW_SELECTION = ["nav", "hero", "stagger", "parallax"];

export const SAMPLE_SECTIONS: AnalysisSection[] = [
  { label: "Nav", certainty: "observed", top: 3, height: 8, color: COLORS.lilac },
  { label: "Hero", certainty: "observed", top: 14, height: 36, color: COLORS.orange },
  { label: "Card grid", certainty: "observed", top: 54, height: 22, color: COLORS.mint },
  { label: "Testimonials", certainty: "inferred", top: 79, height: 9, color: COLORS.yellow },
  { label: "Footer", certainty: "partial", top: 90, height: 7, color: COLORS.neutral },
];

export const CARD_STAGGER_LESSON: Lesson = {
  id: "card-stagger",
  animationId: "stagger",
  title: "Card stagger",
  steps: [
    {
      title: "Three cards, one after another",
      body: "Each card moves up 40px and fades in over 480ms. The trick is the delay: card two waits 90ms, card three waits 180ms. That offset is called a stagger, and it makes a group feel like it arrives in sequence.",
    },
    {
      title: "Easing is why they feel like they land",
      body: "Easing controls speed over time. ease-out starts fast and settles gently, like something coming to rest. Switch to linear or ease-in and the cards stop feeling physical.",
    },
    {
      title: "Read the code line by line",
      body: "Four lines do all the work. Step through them or click a highlighted line. Ask the tutor if something doesn't click.",
    },
    {
      title: "Quick check",
      body: "Which stagger makes the cards land one after another but still read as a single group?",
    },
  ],
  facts: ["translateY 40 → 0", "opacity 0 → 1", "480ms ease-out", "+90ms per card"],
  tryPrompt: "Try: drag stagger to 0. Why do the three cards suddenly look like one block?",
  codeLines: [
    "const list = {",
    "  show: { transition: { staggerChildren: 0.09 } }",
    "};",
    "const card = {",
    "  hidden: { opacity: 0, y: 40 },",
    "  show: { opacity: 1, y: 0,",
    '          transition: { duration: 0.48, ease: "easeOut" } }',
    "};",
    '<motion.ul variants={list} initial="hidden" whileInView="show">',
  ],
  walkthrough: [
    {
      line: 1,
      head: "Line 2.",
      text: [
        "The list tells each card to start 0.09 seconds after the one before it.",
        "The parent tells each child to start 0.09s after the previous one. Children don't know about each other; the parent handles the timing.",
        "staggerChildren offsets each child's delay by its index. staggerDirection: -1 reverses the order; delayChildren holds the whole group.",
      ],
    },
    {
      line: 4,
      head: "Line 5.",
      text: [
        "Before it shows, each card is invisible and 40px lower.",
        '"hidden" is the starting state: fully transparent and pushed 40px down.',
        "y maps to translateY, so this stays on the compositor. Animating top or margin would trigger layout every frame.",
      ],
    },
    {
      line: 6,
      head: "Line 7.",
      text: [
        "Each card takes about half a second and slows down as it lands.",
        "480ms with easeOut: fast start, gentle stop. That is what makes the cards feel like they settle.",
        "easeOut is cubic-bezier(0, 0, 0.58, 1). Pass four numbers instead if you need to match the recording more closely.",
      ],
    },
    {
      line: 8,
      head: "Line 9.",
      text: [
        "The list starts hidden and plays when it scrolls into view.",
        'initial="hidden" sets the start state. whileInView="show" plays it when the list enters the viewport.',
        "whileInView uses IntersectionObserver. Set viewport once: true so it doesn't replay every time you scroll past.",
      ],
    },
  ],
  tutor: [
    {
      question: "How would I do this without Motion?",
      answer: "Set --i on each card and use transition-delay: calc(var(--i) * 90ms). Same result in plain CSS.",
    },
    {
      question: "Why ease-out and not linear?",
      answer:
        "Real objects slow down before they stop. Linear keeps full speed until the last frame, so the cards look like they hit a wall.",
    },
    {
      question: "Is this bad for performance?",
      answer: "No. Opacity and transform run on the compositor, so the page doesn't re-layout while the cards move.",
    },
  ],
  quiz: [
    { label: "0ms", feedback: "They all move together, so it reads as one block.", correct: false },
    { label: "90ms", feedback: "Right. Short enough to feel like one group, long enough to see the order.", correct: true },
    {
      label: "900ms",
      feedback: "Too long. Each card feels like a separate event and the last one arrives after almost two seconds.",
      correct: false,
    },
  ],
  xp: XP_REWARDS.lesson,
};

export const STAGGER_CHALLENGE: Exercise = {
  id: "card-stagger-challenge",
  animationId: "stagger",
  title: "Rebuild the card stagger from memory",
  target: CHALLENGE_TARGET,
  initial: CHALLENGE_START,
  passScore: 90,
  xp: XP_REWARDS.challenge,
  hintPenalty: XP_REWARDS.hintPenalty,
  hint: "Watch how the original stops: quick off the mark, soft landing. Each card waits a little under a tenth of a second.",
};

export const EDITS: Record<EditId, { ask: string; reply: string; file: string; minus: string; plus: string }> = {
  hero: {
    ask: "Give the hero more breathing room on desktop",
    reply: "Increased vertical padding in Hero.tsx. 1 file, 2 lines.",
    file: "Hero.tsx",
    minus: 'className="py-24"',
    plus: 'className="py-32 md:py-40"',
  },
  fix: {
    ask: "Fix the type error in Cards.tsx",
    reply: "Added optional chaining for items. 1 file, 1 line.",
    file: "Cards.tsx",
    minus: "{items.map(i => (",
    plus: "{items?.map(i => (",
  },
};

export const CODE: Record<StackId, Omit<CodeFile, "stack">> = {
  "Framer Motion": {
    fileName: "Cards.tsx",
    code: `const list = { show: { transition: { staggerChildren: 0.09 } } };
const card = {
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0,
            transition: { duration: 0.48, ease: "easeOut" } }
};

export function Cards({ items }) {
  return (
    <motion.ul className="grid grid-cols-3 gap-6"
      variants={list} initial="hidden" whileInView="show">
      {items.map(i => (
        <motion.li key={i.id} variants={card}
          className="rounded-xl bg-stone-200 p-6" />
      ))}
    </motion.ul>
  );
}`,
  },
  GSAP: {
    fileName: "cards.js",
    code: `import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

gsap.from(".card", {
  y: 40,
  opacity: 0,
  duration: 0.48,
  ease: "power2.out",
  stagger: 0.09,
  scrollTrigger: { trigger: ".cards", start: "top 80%" }
});`,
  },
  "Web Animations API": {
    fileName: "cards.js",
    code: `const cards = document.querySelectorAll(".card");

cards.forEach((el, i) => {
  el.animate(
    [
      { opacity: 0, transform: "translateY(40px)" },
      { opacity: 1, transform: "none" }
    ],
    { duration: 480, easing: "ease-out",
      delay: i * 90, fill: "both" }
  );
});`,
  },
  "HTML/CSS": {
    fileName: "cards.css",
    code: `.card {
  animation: card-in 480ms ease-out both;
  animation-delay: calc(var(--i) * 90ms);
}

@keyframes card-in {
  from { opacity: 0; transform: translateY(40px); }
}

/* <li class="card" style="--i: 0"> … */`,
  },
};

export const TEMPLATES: Template[] = [
  { id: "portfolio-grid", name: "Portfolio grid", level: "Beginner", tags: ["stagger", "hover lift"], length: "0:24", lessons: 3 },
  { id: "agency-hero", name: "Agency hero", level: "Beginner", tags: ["fade", "text reveal"], length: "0:18", lessons: 2 },
  { id: "saas-launch-page", name: "SaaS launch page", level: "Intermediate", tags: ["text reveal", "stagger"], length: "0:41", lessons: 5 },
  { id: "pricing-toggle", name: "Pricing toggle", level: "Intermediate", tags: ["fade", "stagger"], length: "0:30", lessons: 4 },
  {
    id: "product-story-scroll",
    name: "Product story scroll",
    level: "Advanced",
    tags: ["scroll-driven", "GSAP timeline"],
    length: "1:05",
    lessons: 7,
  },
  { id: "gallery-parallax", name: "Gallery parallax", level: "Advanced", tags: ["parallax", "scroll-driven"], length: "0:52", lessons: 6 },
];

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** Seed history for the sample project, as offsets from seeding time. */
export function seedVersions(now: number): ProjectVersion[] {
  const at = (ms: number) => new Date(now - ms).toISOString();
  return [
    {
      v: 7,
      kind: "Inspector edit",
      description: "Card stagger duration 500 → 480ms",
      createdAt: at(2 * HOUR),
      color: COLORS.mint,
      diff: ["- transition: { duration: 0.5 }", "+ transition: { duration: 0.48 }"],
    },
    {
      v: 6,
      kind: "Assistant",
      description: '"Tighter nav spacing" · accepted',
      createdAt: at(DAY + 2 * HOUR),
      color: COLORS.lilac,
      diff: ['- className="gap-8"', '+ className="gap-6"'],
    },
    {
      v: 5,
      kind: "Manual save",
      description: "Edited Nav.tsx",
      createdAt: at(DAY + 5 * HOUR),
      color: COLORS.fg,
      diff: ['- <a href="/work">Projects</a>', '+ <a href="/work">Work</a>'],
    },
    {
      v: 4,
      kind: "Regenerated section",
      description: "Testimonials",
      createdAt: at(2 * DAY + 3 * HOUR),
      color: COLORS.orange,
      diff: ['- <Testimonials layout="grid" />', '+ <Testimonials layout="carousel" />'],
    },
    {
      v: 1,
      kind: "First generation",
      description: "94% match",
      createdAt: at(3 * DAY + 2 * HOUR),
      color: COLORS.orange,
      diff: ["+ 6 components · 5 animations"],
    },
  ];
}

export function firstGenerationVersion(now: number, matchPct: number, animationCount: number): ProjectVersion {
  return {
    v: 1,
    kind: "First generation",
    description: `${matchPct}% match`,
    createdAt: new Date(now).toISOString(),
    color: COLORS.orange,
    diff: [`+ 6 components · ${animationCount} animations`],
  };
}

const extracted = (id: string, name: string, status: string, certainty: Asset["certainty"]): Asset => ({
  id,
  name,
  status,
  certainty,
  kind: "image",
  thumb: "",
});

export function assetGroups(projectName: string, card2Replaced: boolean): AssetGroup[] {
  const images: Asset[] = [
    extracted("hero-photo", "hero-photo.webp", "extracted · 1440w", "observed"),
    extracted("card-1", "card-1.webp", "extracted · 640w", "observed"),
    card2Replaced
      ? extracted("card-2", "card-2-upload.webp", "uploaded by you", "observed")
      : { id: "card-2", name: "card-2", status: "blurred in recording · replace", certainty: "placeholder", kind: "image", thumb: "placeholder" },
    extracted("card-3", "card-3.webp", "extracted · 640w", "observed"),
    extracted("logo", "logo.svg", "traced from frame 00:01", "inferred"),
  ];
  const frames: Asset[] = [0, 6, 12, 18, 24, 30, 36, 42].map((t) => {
    const ts = `00:${String(t).padStart(2, "0")}`;
    return { id: `frame-${t}`, name: `frame-${String(t).padStart(2, "0")}.png`, status: ts, certainty: "neutral", kind: "frame", thumb: ts };
  });
  const fonts: Asset[] = [
    { id: "font-display", name: "Display font", status: "inferred · closest match", certainty: "inferred", kind: "font", thumb: "Aa", fontFamily: "display" },
    { id: "font-mono", name: "Mono font", status: "observed in code blocks", certainty: "observed", kind: "font", thumb: "Aa", fontFamily: "mono" },
  ];
  const recording: Asset[] = [
    { id: "recording", name: `${projectName}.mp4`, status: "00:48 · 1440×900 · 38 MB", certainty: "neutral", kind: "recording", thumb: "▶" },
  ];
  return [
    { id: "images", label: "Images", count: 5, items: images },
    { id: "frames", label: "Frames", count: 42, items: frames },
    { id: "fonts", label: "Fonts", count: 2, items: fonts },
    { id: "recording", label: "Recording", count: 1, items: recording },
  ];
}

export const DEPLOY_LOG = [
  "› building with vite",
  "› 6 components · 5 animations · 18kb js",
  "› reduced-motion fallbacks added",
  "› uploading",
];
