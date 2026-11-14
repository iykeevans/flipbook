
const MINT = 'oklch(0.78 0.14 160)', ORANGE = 'oklch(0.72 0.17 50)', LILAC = 'oklch(0.78 0.13 290)', YELLOW = 'oklch(0.82 0.15 85)', RED = 'oklch(0.7 0.18 30)';
const EASES = [
  { label: 'linear', css: 'linear', b: [0, 0, 1, 1], score: 45 },
  { label: 'ease-out', css: 'cubic-bezier(0,0,.2,1)', b: [0, 0, .2, 1], score: 100 },
  { label: 'ease-in', css: 'cubic-bezier(.4,0,1,1)', b: [.4, 0, 1, 1], score: 30 },
  { label: 'overshoot', css: 'cubic-bezier(.34,1.56,.64,1)', b: [.34, 1.56, .64, 1], score: 65 }
];
const ANIMS = [
  { id: 'nav', name: 'Nav underline', concept: 'Transitions', color: LILAC, bars: [[2, 8]], spec: 'scaleX 0→1 · 200ms · ease-out · on hover' },
  { id: 'hero', name: 'Hero fade-up', concept: 'Keyframes', color: ORANGE, bars: [[6, 18]], spec: 'translateY 32→0 · opacity 0→1 · 700ms · ease-out' },
  { id: 'stagger', name: 'Card stagger', concept: 'Stagger + easing', color: MINT, bars: [[24, 12], [30, 12], [36, 12]], spec: 'translateY 40→0 · opacity 0→1 · 480ms · ease-out · 90ms stagger' },
  { id: 'parallax', name: 'Scroll parallax', concept: 'Scroll-linked', color: YELLOW, bars: [[46, 40]], spec: 'translateY 0→-120px · linked to scroll progress', lvl: 5 },
  { id: 'spring', name: 'Button spring', concept: 'Springs', color: ORANGE, bars: [[78, 9]], spec: 'scale 1→0.96→1 · spring(stiffness 400, damping 18)', lvl: 6 }
];
const LEVELS = [[4, 'Tweener', 1000, 1600], [5, 'Choreographer', 1600, 2400], [6, 'Motion Director', 2400, 3400]];
const INSP = {
  nav: { at: '00:01', trig: 'on hover', conf: .91, lib: 'a CSS transition on ::after', rows: [['scaleX', '0 → 1', 'o', '0 → 1'], ['origin', 'left', 'o', 'left'], ['duration', '~200ms', 'i', 'D'], ['easing', 'ease-out-ish', 'i', 'ease-out']] },
  hero: { at: '00:02', trig: 'on load', conf: .88, lib: 'Motion initial/animate', rows: [['translateY', '32px → 0', 'o', '32px → 0'], ['opacity', '0 → 1', 'o', '0 → 1'], ['duration', '~700ms', 'i', 'D'], ['easing', 'ease-out-ish', 'i', 'easeOut']] },
  stagger: { at: '00:12', trig: 'scroll reveal', conf: .86, lib: 'Motion staggerChildren', rows: [['translateY', '40px → 0', 'o', '40px → 0'], ['opacity', '0 → 1', 'o', '0 → 1'], ['duration', '~500ms', 'i', 'D'], ['easing', 'ease-out-ish', 'i', 'easeOut'], ['stagger', '~90ms', 'i', '90ms'], ['repeat', 'unknown', 'u', 'once']] },
  parallax: { at: '00:20', trig: 'scroll-linked', conf: .71, lib: 'Motion useScroll + useTransform', rows: [['translateY', '0 → -120px', 'i', '0 → -120px'], ['range', 'section in view', 'i', 'start end → end start'], ['smoothing', 'unknown', 'u', 'none']] },
  spring: { at: '00:38', trig: 'on press', conf: .64, lib: 'Motion whileTap with a spring', rows: [['scale', '1 → 0.96 → 1', 'o', '1 → 0.96 → 1'], ['stiffness', 'unknown', 'u', '400'], ['damping', 'unknown', 'u', '18']] }
};
const WALK_LINES = ['const list = {', '  show: { transition: { staggerChildren: 0.09 } }', '};', 'const card = {', '  hidden: { opacity: 0, y: 40 },', '  show: { opacity: 1, y: 0,', '          transition: { duration: 0.48, ease: "easeOut" } }', '};', '<motion.ul variants={list} initial="hidden" whileInView="show">'];
const WALK = [
  [1, 'Line 2.', ['The list tells each card to start 0.09 seconds after the one before it.', 'The parent tells each child to start 0.09s after the previous one. Children don\'t know about each other; the parent handles the timing.', 'staggerChildren offsets each child\'s delay by its index. staggerDirection: -1 reverses the order; delayChildren holds the whole group.']],
  [4, 'Line 5.', ['Before it shows, each card is invisible and 40px lower.', '"hidden" is the starting state: fully transparent and pushed 40px down.', 'y maps to translateY, so this stays on the compositor. Animating top or margin would trigger layout every frame.']],
  [6, 'Line 7.', ['Each card takes about half a second and slows down as it lands.', '480ms with easeOut: fast start, gentle stop. That is what makes the cards feel like they settle.', 'easeOut is cubic-bezier(0, 0, 0.58, 1). Pass four numbers instead if you need to match the recording more closely.']],
  [8, 'Line 9.', ['The list starts hidden and plays when it scrolls into view.', 'initial="hidden" sets the start state. whileInView="show" plays it when the list enters the viewport.', 'whileInView uses IntersectionObserver. Set viewport once: true so it doesn\'t replay every time you scroll past.']]
];
const TUTOR = [
  ['How would I do this without Motion?', 'Set --i on each card and use transition-delay: calc(var(--i) * 90ms). Same result in plain CSS.'],
  ['Why ease-out and not linear?', 'Real objects slow down before they stop. Linear keeps full speed until the last frame, so the cards look like they hit a wall.'],
  ['Is this bad for performance?', 'No. Opacity and transform run on the compositor, so the page doesn\'t re-layout while the cards move.']
];
const EDITS = {
  hero: { ask: 'Give the hero more breathing room on desktop', reply: 'Increased vertical padding in Hero.tsx. 1 file, 2 lines.', file: 'Hero.tsx', minus: 'className="py-24"', plus: 'className="py-32 md:py-40"' },
  fix: { ask: 'Fix the type error in Cards.tsx', reply: 'Added optional chaining for items. 1 file, 1 line.', file: 'Cards.tsx', minus: '{items.map(i => (', plus: '{items?.map(i => (' }
};
const TPLS = [
  ['Portfolio grid', 'Beginner', ['stagger', 'hover lift'], '0:24', 3], ['Agency hero', 'Beginner', ['fade', 'text reveal'], '0:18', 2],
  ['SaaS launch page', 'Intermediate', ['text reveal', 'stagger'], '0:41', 5], ['Pricing toggle', 'Intermediate', ['fade', 'stagger'], '0:30', 4],
  ['Product story scroll', 'Advanced', ['scroll-driven', 'GSAP timeline'], '1:05', 7], ['Gallery parallax', 'Advanced', ['parallax', 'scroll-driven'], '0:52', 6]
];
const VERSIONS0 = [
  { v: 7, kind: 'Inspector edit', desc: 'Card stagger duration 500 → 480ms', when: '2h ago', c: MINT, diff: ['- transition: { duration: 0.5 }', '+ transition: { duration: 0.48 }'] },
  { v: 6, kind: 'Assistant', desc: '"Tighter nav spacing" · accepted', when: 'yesterday', c: LILAC, diff: ['- className="gap-8"', '+ className="gap-6"'] },
  { v: 5, kind: 'Manual save', desc: 'Edited Nav.tsx', when: 'yesterday', c: '#ededea', diff: ['- <a href="/work">Projects</a>', '+ <a href="/work">Work</a>'] },
  { v: 4, kind: 'Regenerated section', desc: 'Testimonials', when: '2 days ago', c: ORANGE, diff: ['- <Testimonials layout="grid" />', '+ <Testimonials layout="carousel" />'] },
  { v: 1, kind: 'First generation', desc: '94% match', when: '3 days ago', c: ORANGE, diff: ['+ 6 components · 5 animations'] }
];
const SET_ROWS = [
  ['GENERATION', [['Default output', 'out', ['React · Tailwind · Framer Motion', 'HTML/CSS', 'React · GSAP']], ['Review analysis before generating', 'review'], ['Show confidence labels in code comments', 'conf'], ['Respect prefers-reduced-motion in output', 'rm']]],
  ['LEARNING', [['Default lesson level', 'diff', ['Beginner', 'Intermediate', 'Advanced']], ['Daily XP goal', 'goal', ['50 XP', '100 XP', '200 XP']], ['Show XP, levels and streaks', 'xpOn']]],
  ['PRIVACY & DATA', [['Allow my recordings to improve models', 'train'], ['Delete recordings after generation', 'del', ['After 30 days', 'After 7 days', 'Immediately', 'Never']], ['Export or delete all my data', 'manage']]]
];
const RSECS = [['Nav', 'observed', 3, 8, LILAC, 'solid'], ['Hero', 'observed', 14, 36, ORANGE, 'solid'], ['Card grid', 'observed', 54, 22, MINT, 'solid'], ['Testimonials', 'inferred', 79, 9, YELLOW, 'dashed'], ['Footer', 'partial', 90, 7, '#8a8a84', 'dashed']];
const PROJ_SCREENS = ['compare', 'motion', 'lesson', 'challenge', 'code', 'assets', 'history', 'export'];
const STRIPE = 'repeating-linear-gradient(135deg,#202024 0 8px,#1a1a1d 8px 16px)';
const CODE = {
  'Framer Motion': ['Cards.tsx', `const list = { show: { transition: { staggerChildren: 0.09 } } };
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
}`],
  'GSAP': ['cards.js', `import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

gsap.from(".card", {
  y: 40,
  opacity: 0,
  duration: 0.48,
  ease: "power2.out",
  stagger: 0.09,
  scrollTrigger: { trigger: ".cards", start: "top 80%" }
});`],
  'Web Animations API': ['cards.js', `const cards = document.querySelectorAll(".card");

cards.forEach((el, i) => {
  el.animate(
    [
      { opacity: 0, transform: "translateY(40px)" },
      { opacity: 1, transform: "none" }
    ],
    { duration: 480, easing: "ease-out",
      delay: i * 90, fill: "both" }
  );
});`],
  'HTML/CSS': ['cards.css', `.card {
  animation: card-in 480ms ease-out both;
  animation-delay: calc(var(--i) * 90ms);
}

@keyframes card-in {
  from { opacity: 0; transform: translateY(40px); }
}

/* <li class="card" style="--i: 0"> … */`]
};

class Component extends DCLogic {
  state = {
    screen: 'dashboard', url: '', outputs: ['React', 'Tailwind', 'Framer Motion'],
    progress: 0, t: 12, playing: false, fixed: false,
    xp: 1240, learned: ['nav', 'hero'], sel: 'stagger',
    step: 1, run: 0, dur: 480, stag: 90, ease: 1, quiz: null,
    cDur: 300, cStag: 0, cEase: 2, attempts: 1, score: null, hintOn: false, passed: false,
    stack: 'Framer Motion', target: 0, toggles: [true, true, false], deploy: 'idle', deployPct: 0,
    toast: null,
    proj: 'studio-landing', dashFilter: 'All', ag: 62, rsel: null, rf: 0, rAnims: [true, true, true, true, false],
    durs: { nav: 200, hero: 700, stagger: 480 }, saved: { nav: 200, hero: 700, stagger: 480 }, slow: false,
    diff: 1, walk: 0, tutorQ: null, vp: 0, chat: [], pending: null, lastAsk: '', draft: '', heroPad: false, errFixed: false,
    versions: VERSIONS0, histSel: 0, assetTab: 0, card2: false, tplLevel: 'All', tplTag: null,
    set: { out: 0, review: true, conf: true, rm: true, goal: 1, xpOn: true, train: false, del: 0 }
  };
  componentDidMount() { this.agT = setInterval(() => { if (this.state.ag >= 100) return clearInterval(this.agT); this.setState({ ag: this.state.ag + 1 }); }, 900); }
  componentWillUnmount() { clearInterval(this.procT); clearInterval(this.playT); clearInterval(this.depT); clearInterval(this.agT); clearTimeout(this.toastT); }
  notify(text, sub) { clearTimeout(this.toastT); this.setState({ toast: { id: Date.now(), text, sub, up: false } }); this.toastT = setTimeout(() => this.setState({ toast: null }), 2400); }
  pushVersion(kind, desc, diff, c) { this.setState(st => ({ versions: [{ v: st.versions[0].v + 1, kind, desc, when: 'just now', c, diff }, ...st.versions], histSel: 0 })); }
  setDur(id, d) { this.setState(st => ({ durs: { ...st.durs, [id]: Math.max(100, Math.min(1500, st.durs[id] + d)) }, run: st.run + 1 })); }
  generate = () => { const n = this.state.rAnims.filter(Boolean).length; this.setState({ screen: 'compare', fixed: false, t: 12 }); this.notify('Site generated', `${this.state.proj} · ${n} animations · 94% match`); };
  ask(k, text) {
    const e = EDITS[k];
    this.setState(st => ({ chat: [...st.chat, { me: true, t: text || e.ask }, { me: false, t: text ? `Here's a change for that in ${e.file}. 1 file, 2 lines.` : e.reply }], pending: k, lastAsk: text || e.ask, draft: '' }));
  }
  go = s => () => this.setState({ screen: s, playing: false }, () => clearInterval(this.playT));
  award(n, text) {
    const before = this.levelOf(this.state.xp)[0];
    const xp = this.state.xp + n;
    if (!this.state.set.xpOn) return this.setState({ xp });
    const after = this.levelOf(xp);
    const up = after[0] > before;
    clearTimeout(this.toastT);
    this.setState({ xp, toast: { id: Date.now(), text: up ? `Level up! Lv ${after[0]} · ${after[1]}` : `+${n} XP`, sub: up ? `${text} · unlocked ${ANIMS.find(a => a.lvl === after[0])?.concept || 'new challenges'}` : text, up } });
    this.toastT = setTimeout(() => this.setState({ toast: null }), up ? 3600 : 2400);
  }
  levelOf(xp) { return LEVELS.find(l => xp < l[3]) || LEVELS[LEVELS.length - 1]; }
  startProcessing = () => {
    clearInterval(this.procT);
    this.setState({ screen: 'processing', progress: 0 });
    this.procT = setInterval(() => {
      const p = Math.min(100, this.state.progress + 1.4);
      this.setState({ progress: p });
      if (p >= 100) clearInterval(this.procT);
    }, 50);
  };
  togglePlay = () => {
    if (this.state.playing) { clearInterval(this.playT); return this.setState({ playing: false }); }
    if (this.state.t >= 48) this.setState({ t: 0 });
    this.setState({ playing: true });
    this.playT = setInterval(() => {
      const t = this.state.t + 0.25;
      if (t >= 48) { clearInterval(this.playT); this.setState({ t: 48, playing: false }); } else this.setState({ t });
    }, 50);
  };
  scrub = e => {
    const r = e.currentTarget.getBoundingClientRect();
    this.setState({ t: Math.max(0, Math.min(48, (e.clientX - r.left) / r.width * 48)) });
  };
  computeScore() {
    const { cDur, cStag, cEase } = this.state;
    const rows = [
      ['Distance', 100],
      ['Duration', Math.max(0, Math.round(100 - Math.abs(cDur - 480) / 4))],
      ['Stagger', Math.max(0, Math.round(100 - Math.abs(cStag - 90) * 1.1))],
      ['Easing', EASES[cEase].score]
    ];
    return { rows, total: Math.round(rows.reduce((s, r) => s + r[1], 0) / rows.length) };
  }
  cards(params, key, color, extra) {
    const h = React.createElement, e = EASES[params.ease];
    return [0, 1, 2].map(i => h('div', { key: key + '-' + i, style: { position: 'relative', height: extra?.h || 110 } }, [
      h('div', { key: 'c', style: { position: 'absolute', inset: 0, borderRadius: 8, background: color, opacity: extra?.ghost ? .55 : 1, animation: `fbUp ${params.dur}ms ${e.css} ${i * params.stag}ms both`, outline: extra?.ol || 'none', outlineOffset: 3 } }),
      extra?.ghost && h('div', { key: 'g', style: { position: 'absolute', inset: 0, zIndex: 1, borderRadius: 8, border: '2px dashed #ededea', animation: `fbUp 480ms cubic-bezier(0,0,.2,1) ${i * 90}ms both` } })
    ]));
  }
  extraVals(s, ver, level) {
    const learnedCount = s.learned.length;
    const seg = (on, onBg = '#2c2c31', onFg = '#ededea') => ({ bg: on ? onBg : 'transparent', fg: on ? onFg : '#8a8a84' });
    // dashboard
    const projs = [
      { name: 'studio-landing', st: 'Ready', badge: 'READY', bc: MINT, meta: `edited 2h ago · v${ver} · ${learnedCount}/5 learned`, open: () => this.setState({ screen: 'compare', proj: 'studio-landing' }) },
      { name: 'agency-reel', st: s.ag < 100 ? 'Processing' : 'Needs review', badge: s.ag < 100 ? `ANALYSING ${s.ag}%` : 'NEEDS REVIEW', bc: s.ag < 100 ? ORANGE : YELLOW, pct: s.ag, meta: 'created 6 min ago', open: () => s.ag < 100 ? this.notify('Still analysing', `agency-reel · ${s.ag}% · we'll flag it when it's ready`) : this.setState({ screen: 'review', proj: 'agency-reel' }) },
      { name: 'pricing-page', st: 'Needs review', badge: 'NEEDS REVIEW', bc: YELLOW, meta: 'analysis ready · not generated', open: () => this.setState({ screen: 'review', proj: 'pricing-page' }) },
      { name: 'portfolio-grid', st: 'Ready', badge: 'READY', bc: MINT, meta: 'from sample · 3/3 learned', open: () => this.setState({ screen: 'compare', proj: 'portfolio-grid', fixed: true }) }
    ];
    // inspector
    const sel = ANIMS.find(a => a.id === s.sel), ins = INSP[sel.id];
    const cur = s.durs[sel.id], sv = s.saved[sel.id], dirty = cur !== undefined && cur !== sv;
    const hl = '2px solid oklch(0.62 0.15 160)';
    // walkthrough
    const wi = s.walk, wk = WALK[wi];
    // history
    const vs = s.versions, hi = Math.min(s.histSel, vs.length - 1), hv = vs[hi], pv = vs[hi + 1], rt = hi === 0 ? pv : hv;
    // assets
    const img = (name, status, sc) => ({ name, status, sc, bgImg: STRIPE, bd: 'none', thumb: '', font: "11px 'JetBrains Mono',monospace", fg: '#66665f' });
    const assetSets = [
      [img('hero-photo.webp', 'extracted · 1440w', MINT), img('card-1.webp', 'extracted · 640w', MINT),
        s.card2 ? img('card-2-upload.webp', 'uploaded by you', MINT) : { name: 'card-2', status: 'blurred in recording · replace', sc: YELLOW, bgImg: 'transparent', bd: `1.5px dashed ${YELLOW}`, thumb: 'placeholder', font: "12px 'JetBrains Mono',monospace", fg: YELLOW },
        img('card-3.webp', 'extracted · 640w', MINT), img('logo.svg', 'traced from frame 00:01', YELLOW)],
      [0, 6, 12, 18, 24, 30, 36, 42].map(t => ({ ...img(`frame-${String(t).padStart(2, '0')}.png`, `00:${String(t).padStart(2, '0')}`, '#8a8a84'), thumb: `00:${String(t).padStart(2, '0')}` })),
      [{ name: 'Display font', status: 'inferred · closest match', sc: YELLOW, bgImg: '#1c1c1f', bd: 'none', thumb: 'Aa', font: "800 36px 'Bricolage Grotesque',sans-serif", fg: '#ededea' },
        { name: 'Mono font', status: 'observed in code blocks', sc: MINT, bgImg: '#1c1c1f', bd: 'none', thumb: 'Aa', font: "400 32px 'JetBrains Mono',monospace", fg: '#ededea' }],
      [{ ...img(`${s.proj}.mp4`, '00:48 · 1440×900 · 38 MB', '#8a8a84'), thumb: '▶', font: '28px sans-serif', fg: '#8a8a84' }]
    ];
    // templates
    const lc = { Beginner: MINT, Intermediate: YELLOW, Advanced: LILAC };
    const tpls = TPLS.filter(([, lvl, tags]) => (s.tplLevel === 'All' || lvl === s.tplLevel) && (!s.tplTag || tags.includes(s.tplTag)));
    // build
    const sug = [['hero', !s.heroPad], ['fix', !s.errFixed]].filter(x => x[1]).map(([k]) => ({ label: EDITS[k].ask, go: () => this.ask(k) }));
    const sendDraft = () => { const v = s.draft.trim(); if (v) this.ask('hero', v); };
    const pe = s.pending && EDITS[s.pending];
    return {
      procNext: () => s.set.review ? this.setState({ screen: 'review' }) : this.generate(), procNextLabel: s.set.review ? 'Review analysis →' : 'Generate site →',
      resumeShow: !s.learned.includes('stagger'), resumeText: `Card stagger · step ${s.step} of 4 · studio-landing`,
      resume: () => this.setState({ screen: 'lesson', proj: 'studio-landing', run: s.run + 1 }),
      dashFilters: ['All', 'Processing', 'Ready', 'Needs review'].map(l => ({ label: l, ...seg(s.dashFilter === l, '#26262a'), pick: () => this.setState({ dashFilter: l }) })),
      projects: projs.filter(p => s.dashFilter === 'All' || p.st === s.dashFilter).map(p => ({ ...p, showBar: p.st === 'Processing' })),
      overlays: RSECS.map(([label, , top, h, c, bs], i) => ({ label: label.toUpperCase(), top, h, c, bs, op: s.rsel === null || s.rsel === i ? 1 : .2 })),
      reviewSecs: RSECS.map(([label, tag], i) => ({ label, tag, c: tag === 'observed' ? MINT : tag === 'inferred' ? YELLOW : '#8a8a84', bg: s.rsel === i ? '#26262a' : 'transparent', hl: () => this.setState({ rsel: s.rsel === i ? null : i }) })),
      reviewAnims: ANIMS.map((a, i) => { const on = s.rAnims[i], cf = INSP[a.id].conf; return { name: a.name, mark: on ? '✓' : '', bg: on ? '#ededea' : 'transparent', fg: on ? '#ededea' : '#8a8a84', conf: cf < .7 ? `${cf.toFixed(2)} · low` : cf.toFixed(2), cc: cf < .7 ? YELLOW : '#8a8a84', toggle: () => this.setState({ rAnims: s.rAnims.map((v, j) => j === i ? !v : v) }) }; }),
      animsOn: s.rAnims.filter(Boolean).length,
      rFrames: [0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ ol: i === s.rf ? '2px solid #ededea' : 'none', pick: () => this.setState({ rf: i }) })),
      rFrameT: `00:${String(s.rf * 6).padStart(2, '0')}`, generate: this.generate,
      inspRows: ins.rows.map(([label, obs, cf, gen]) => { const d = gen === 'D'; return { label, obs, cc: cf === 'o' ? MINT : cf === 'i' ? YELLOW : '#76766f', dot: cf === 'u' ? '○' : '●', gen: d ? cur + 'ms' : gen, edit: d, genBg: d ? '#2c2c31' : 'transparent', dec: () => this.setDur(sel.id, -20), inc: () => this.setDur(sel.id, 20) }; }),
      inspTrig: ins.trig, inspConf: ins.conf.toFixed(2), inspAt: ins.at,
      inspNote: `Generated with ${ins.lib}. We can't tell which library the original site used; plain CSS or GSAP could produce the same motion.`,
      inspNavOl: sel.id === 'nav' ? hl : 'none', inspHeroOl: sel.id === 'hero' ? hl : 'none',
      inspCards: this.cards({ dur: s.durs.stagger * (s.slow ? 4 : 1), stag: 90 * (s.slow ? 4 : 1), ease: 1 }, 'in' + s.run, '#e2e0d9', { h: 70, ol: sel.id === 'stagger' ? hl : null }),
      replayInsp: () => this.setState({ run: s.run + 1 }), toggleSlow: () => this.setState({ slow: !s.slow, run: s.run + 1 }), slowLabel: s.slow ? '1×' : '0.25×',
      showInRec: () => this.setState({ screen: 'compare', t: parseInt(ins.at.slice(3)) }),
      saveLabel: dirty ? `Save as v${ver + 1}` : 'Saved', saveBg: dirty ? '#ededea' : '#26262a', saveFg: dirty ? '#141416' : '#76766f',
      saveInsp: () => { if (!dirty) return; this.setState({ saved: { ...s.saved, [sel.id]: cur } }); this.pushVersion('Inspector edit', `${sel.name} duration ${sv} → ${cur}ms`, [`- duration: ${sv / 1000}`, `+ duration: ${cur / 1000}`], MINT); this.notify(`Saved v${ver + 1}`, `${sel.name} · ${cur}ms`); },
      diffs: ['Beginner', 'Intermediate', 'Advanced'].map((l, i) => ({ label: l, ...seg(s.diff === i, MINT, '#141416'), pick: () => this.setState({ diff: i }) })),
      diffLabel: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'][s.diff],
      walkLines: WALK_LINES.map((t, i) => { const k = WALK.findIndex(w => w[0] === i), on = k === wi; return { t, bg: on ? 'rgba(120,220,170,.1)' : 'transparent', bd: on ? MINT : 'transparent', fg: on ? '#ededea' : k >= 0 ? '#c9c9c3' : '#76766f', cur: k >= 0 ? 'pointer' : 'default', pick: () => k >= 0 && this.setState({ walk: k }) }; }),
      walkHead: wk[1], walkText: wk[2][s.diff], walkPos: wi + 1, walkPrevOp: wi ? 1 : .4,
      walkPrev: () => this.setState({ walk: Math.max(0, wi - 1) }),
      walkNext: () => wi < 3 ? this.setState({ walk: wi + 1 }) : this.setState({ step: 4, run: s.run + 1 }),
      walkNextLabel: wi < 3 ? 'Next line →' : 'Next: quick check →', walkNextBg: wi < 3 ? '#26262a' : MINT, walkNextFg: wi < 3 ? '#ededea' : '#141416',
      tutorAsked: s.tutorQ !== null, tutorQ: s.tutorQ !== null ? TUTOR[s.tutorQ][0] : '', tutorA: s.tutorQ !== null ? TUTOR[s.tutorQ][1] : '',
      tutorQs: TUTOR.map(([q], i) => ({ label: q, i, ask: () => this.setState({ tutorQ: i }) })).filter(q => q.i !== s.tutorQ),
      viewports: ['Desktop', 'Tablet', 'Mobile'].map((l, i) => ({ label: l, ...seg(s.vp === i), pick: () => this.setState({ vp: i, run: s.run + 1 }) })),
      vpLabel: ['1440 × 900', '768 × 1024', '390 × 844'][s.vp], vpW: ['100%', '72%', '46%'][s.vp], pvCols: s.vp === 2 ? 1 : 3, heroM: s.heroPad ? 30 : 8,
      pending: !!pe, pendFile: pe ? pe.file : '', pendMinus: pe ? pe.minus : '', pendPlus: pe ? pe.plus : '',
      showErr: !s.errFixed, askFix: () => this.ask('fix'),
      chat: s.chat.map(m => ({ t: m.t, al: m.me ? 'flex-end' : 'flex-start', rad: m.me ? '10px 10px 2px 10px' : '10px 10px 10px 2px', bg: m.me ? '#2c2c31' : '#1c1c1f', fg: m.me ? '#ededea' : '#b0b0aa' })),
      showSuggest: !pe && sug.length > 0, suggest: sug,
      draft: s.draft, onDraft: e => this.setState({ draft: e.target.value }), onDraftKey: e => { if (e.key === 'Enter') sendDraft(); }, sendDraft,
      accept: () => {
        this.setState(st => ({ heroPad: st.heroPad || s.pending === 'hero', errFixed: st.errFixed || s.pending === 'fix', pending: null, run: st.run + 1, chat: [...st.chat, { me: false, t: `Accepted. Saved as v${ver + 1}.` }] }));
        this.pushVersion('Assistant', `"${s.lastAsk}" · accepted`, [`- ${pe.minus}`, `+ ${pe.plus}`], LILAC);
        this.notify(`Saved v${ver + 1}`, `${pe.file} · assistant edit`);
      },
      reject: () => this.setState(st => ({ pending: null, chat: [...st.chat, { me: false, t: 'Rejected. Nothing changed.' }] })),
      regenAll: () => { this.pushVersion('Regenerated site', 'From the original recording', ['+ 6 components · 5 animations'], ORANGE); this.setState({ run: s.run + 1 }); this.notify(`Regenerated · v${ver + 1}`, 'Your edits are kept in History'); },
      regenSec: () => { this.pushVersion('Regenerated section', 'Card grid', ['- <Cards layout="grid" />', '+ <Cards layout="grid" gap="lg" />'], ORANGE); this.setState({ run: s.run + 1 }); this.notify(`Regenerated · v${ver + 1}`, 'Card grid section'); },
      versions: vs.map((v, i) => ({ ...v, bg: i === hi ? '#26262a' : 'transparent', pick: () => this.setState({ histSel: i }) })),
      cmpLabel: pv ? `v${pv.v} ↔ v${hv.v}` : `v${hv.v}`, prevV: pv ? pv.v : '—', selV: hv.v,
      histDiff: hv.diff.map(t => ({ t, c: t[0] === '-' ? RED : t[0] === '+' ? MINT : '#b0b0aa' })),
      canRestore: !!rt, restoreV: rt ? rt.v : '', nextV: ver + 1,
      restore: () => { if (!rt) return; this.pushVersion('Restored', `Back to v${rt.v}`, [`= contents of v${rt.v}`], '#8a8a84'); this.notify(`Restored v${rt.v}`, `Saved as v${ver + 1}`); },
      assetTabs: ['Images · 5', 'Frames · 42', 'Fonts · 2', 'Recording'].map((l, i) => ({ label: l, ...seg(s.assetTab === i, '#26262a'), pick: () => this.setState({ assetTab: i }) })),
      assetItems: assetSets[s.assetTab],
      replaceLabel: s.card2 ? 'Upload replacement' : 'Replace card-2',
      replaceAsset: () => { if (s.card2) return this.notify('Pick an asset first', 'Click any image to replace it'); this.setState({ card2: true, assetTab: 0 }); this.pushVersion('Asset replaced', 'card-2 → card-2-upload.webp', ['- src="/placeholder.svg"', '+ src="/card-2-upload.webp"'], YELLOW); this.notify(`Saved v${ver + 1}`, 'card-2 replaced in Cards.tsx'); },
      tplLevels: ['All', 'Beginner', 'Intermediate', 'Advanced'].map(l => ({ label: l, ...seg(s.tplLevel === l, '#26262a'), pick: () => this.setState({ tplLevel: l }) })),
      tplTags: ['fade', 'stagger', 'hover lift', 'text reveal', 'parallax', 'scroll-driven', 'GSAP timeline'].map(g => { const on = s.tplTag === g; return { label: g, bg: on ? '#ededea' : 'transparent', fg: on ? '#141416' : '#b0b0aa', bd: on ? '#ededea' : '#33333a', pick: () => this.setState({ tplTag: on ? null : g }) }; }),
      tpls: tpls.map(([name, lvl, tags, len, lessons]) => ({ name, lvl: lvl.toUpperCase(), lc: lc[lvl], len, meta: `${tags.join(', ')} · ${lessons} lessons`, open: () => { this.setState({ proj: name.toLowerCase().replace(/ /g, '-'), screen: 'compare', fixed: true, t: 12 }); this.notify('Sample opened', `${name} · ${lessons} lessons ready`); } })),
      tplEmpty: !tpls.length,
      setSecs: SET_ROWS.map(([title, rows]) => ({ title, rows: rows.map(([label, key, opts]) => {
        if (key === 'manage') return { label, isBtn: true, act: () => this.notify('Data export requested', "We'll email a download link") };
        const val = key === 'diff' ? s.diff : s.set[key];
        const put = v => key === 'diff' ? this.setState({ diff: v }) : this.setState({ set: { ...s.set, [key]: v } });
        if (opts) return { label, isValue: true, val: opts[val], act: () => put((val + 1) % opts.length) };
        return { label, isToggle: true, bg: val ? MINT : '#33333a', x: val ? 18 : 3, act: () => put(!val) };
      }) }))
    };
  }
  renderVals() {
    const s = this.state, h = React.createElement;
    const scr = s.screen;
    const [level, levelName, lo, hi] = this.levelOf(s.xp);
    const learnedCount = s.learned.length;
    const chip = (list, cur, set, onBg = '#ededea') => list.map((x, i) => ({ label: x.label, bg: i === cur ? onBg : '#26262a', fg: i === cur ? '#141416' : '#b0b0aa', pick: () => set(i) }));
    const p = s.progress;
    const animCount = Math.min(5, Math.floor(Math.max(0, p - 50) / 8));
    const procItems = [
      ['Layout · 6 sections, 12-col grid', 25], ['Components · Navbar, Hero, Card ×3, Footer', 50], [`Animations · ${animCount} found`, 92], ['Type & color tokens', 100]
    ].map(([label, th], i, arr) => {
      const prev = i ? arr[i - 1][1] : 0;
      const done = p >= th, active = !done && p >= prev;
      return { label, fg: done || active ? '#ededea' : '#66665f', dot: done ? MINT : active ? ORANGE : '#33333a', anim: active ? 'fbPulse 1.2s infinite' : 'none', status: done ? 'done' : active ? (i === 2 ? 'tracking motion' : 'reading') : 'queued', sc: active ? ORANGE : '#8a8a84' };
    });
    const t = s.t;
    const miniCards = [0, 1, 2].map(i => {
      const lag = !s.fixed && i === 0 ? 1.2 : 0;
      const k = Math.max(0, Math.min(1, (t - 10 - i * 0.9 - lag) / 1.2));
      return { op: k.toFixed(2), y: ((1 - k) * 24 + (!s.fixed && i === 0 ? 8 * k : 0)).toFixed(1), ol: !s.fixed && i === 0 ? `2px dashed ${RED}` : 'none' };
    });
    const sel = ANIMS.find(a => a.id === s.sel);
    const selDone = s.learned.includes(sel.id);
    const locked = sel.lvl && level < sel.lvl;
    const ver = s.versions[0].v, inProj = PROJ_SCREENS.includes(scr);
    const navItems = inProj
      ? [['← All projects', 'dashboard', ''], ['Overview', 'compare', s.fixed ? '99%' : '94%'], ['Build', 'code', ''], ['Animations', 'motion', '5'], ['Learn', 'lesson', `${learnedCount}/5`], ['Assets', 'assets', '9'], ['History', 'history', 'v' + ver], ['Export', 'export', '']]
      : [['Dashboard', 'dashboard', ''], ['Templates', 'templates', '6'], ['Your skills', 'progress', ''], ['Settings', 'settings', '']];
    const activeNav = scr === 'challenge' ? 'lesson' : scr;
    const sc = s.score;
    const pgE = EASES[s.ease];
    const [x1, y1, x2, y2] = pgE.b;
    const pt = (x, y) => `${10 + x * 80} ${90 - y * 80}`;
    const stepCopy = [
      ['Three cards, one after another', 'Each card moves up 40px and fades in over 480ms. The trick is the delay: card two waits 90ms, card three waits 180ms. That offset is called a stagger, and it makes a group feel like it arrives in sequence.'],
      ['Easing is why they feel like they land', 'Easing controls speed over time. ease-out starts fast and settles gently, like something coming to rest. Switch to linear or ease-in and the cards stop feeling physical.'],
      ['Read the code line by line', 'Four lines do all the work. Step through them or click a highlighted line. Ask the tutor if something doesn\'t click.'],
      ['Quick check', 'Which stagger makes the cards land one after another but still read as a single group?']
    ][s.step - 1];
    const quizOpts = [['0ms', 'They all move together, so it reads as one block.'], ['90ms', 'Right. Short enough to feel like one group, long enough to see the order.'], ['900ms', 'Too long. Each card feels like a separate event and the last one arrives after almost two seconds.']];
    const rate = s.toggles;
    const tgt = [['Deploy', 'Live URL in about 30s'], ['Push to GitHub', 'New repo or branch'], ['Download .zip', 'Vite project']];
    const skillDefs = [
      ['Transitions', 'mastered', 'done'], ['Keyframes', 'mastered', 'done'],
      ['Easing', s.passed ? 'mastered' : '3 / 5 lessons', s.passed ? 'done' : 'prog'],
      ['Stagger', s.learned.includes('stagger') ? '3 / 4 lessons' : '2 / 4 lessons', 'prog'],
      ['Scroll-linked', level >= 5 ? 'unlocked · lesson ready' : 'seen in 2 recordings · Lv 5', level >= 5 ? 'prog' : 'seen'],
      ['Springs', 'seen in 1 recording · Lv 6', 'seen'], ['Layout / FLIP', 'locked · Lv 6', 'lock'], ['SVG motion', 'locked · Lv 7', 'lock']
    ];
    const toast = s.toast;
    return {
      crumb: (() => { const n = ({ dashboard: 'Dashboard', templates: 'Templates', settings: 'Settings', progress: 'Your skills', upload: 'New project', processing: 'Processing', review: 'Review analysis', compare: 'Overview', motion: 'Animations', lesson: 'Learn · Card stagger', challenge: 'Challenge', code: 'Build', assets: 'Assets', history: 'History', export: 'Export' })[scr]; return inProj || scr === 'review' || scr === 'processing' ? `${s.proj} / ${n}` : n; })(),
      sideTitle: inProj ? s.proj.toUpperCase() : 'WORKSPACE', showXp: s.set.xpOn, ver,
      streak: 7, level, levelName, xp: s.xp.toLocaleString(), nextXp: hi.toLocaleString(), xpPct: Math.round((s.xp - lo) / (hi - lo) * 100),
      nextMsg: level === 4 ? 'Next: Level 5 · Choreographer unlocks scroll-linked lessons' : 'Next: Level 6 · Motion Director unlocks springs',
      showSide: !['upload', 'processing', 'review'].includes(scr),
      nav: navItems.map(([label, id, meta]) => ({ label, meta, go: this.go(id), bg: activeNav === id ? '#26262a' : 'transparent', fg: activeNav === id ? '#ededea' : '#9a9a94' })),
      learnedCount, learnedPct: learnedCount * 20,
      isUpload: scr === 'upload', isProcessing: scr === 'processing', isCompare: scr === 'compare', isMotion: scr === 'motion', isLesson: scr === 'lesson', isChallenge: scr === 'challenge', isCode: scr === 'code', isExport: scr === 'export', isProgress: scr === 'progress',
      isDashboard: scr === 'dashboard', isReview: scr === 'review', isHistory: scr === 'history', isAssets: scr === 'assets', isTemplates: scr === 'templates', isSettings: scr === 'settings',
      goUpload: () => this.setState({ screen: 'upload', proj: 'studio-landing' }), goDash: this.go('dashboard'), goTemplates: this.go('templates'), goProgress: this.go('progress'), goCompare: this.go('compare'), goMotion: this.go('motion'), goCode: this.go('code'), goExport: this.go('export'),
      goChallenge: () => this.setState({ screen: 'challenge', run: s.run + 1 }),
      url: s.url, onUrl: e => this.setState({ url: e.target.value }), startProcessing: this.startProcessing,
      outputs: ['HTML/CSS', 'React', 'Tailwind', 'Framer Motion', 'GSAP', 'Web Animations API'].map(l => { const on = s.outputs.includes(l); return { label: l, bg: on ? '#ededea' : 'transparent', fg: on ? '#141416' : '#b0b0aa', bd: on ? '#ededea' : '#33333a', toggle: () => this.setState({ outputs: on ? s.outputs.filter(x => x !== l) : [...s.outputs, l] }) }; }),
      frames: [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const vis = p >= i * 12; return { op: vis ? 1 : .15, ol: vis && [0, 2, 5].includes(i) ? `2px solid ${[ORANGE, MINT, LILAC][[0, 2, 5].indexOf(i)]}` : '0 solid transparent' }; }),
      progressInt: Math.round(p), procItems, procDone: p >= 100, procTitle: p >= 100 ? 'Your site is ready' : 'Reading your recording…',
      timeLabel: `00:${String(Math.floor(t)).padStart(2, '0')}`, tPct: (t / 48 * 100).toFixed(2), playIcon: s.playing ? '❚❚' : '▶', togglePlay: this.togglePlay, scrub: this.scrub,
      heroOp: Math.max(0.15, Math.min(1, (t - 2) / 3)).toFixed(2), miniCards,
      match: s.fixed ? 99 : 94, matchMsg: s.fixed ? 'match. Within one frame of the recording.' : 'match. First card enters 120ms late and slides 8px short.',
      canFix: !s.fixed, fixed: s.fixed, fix: () => { this.setState({ fixed: true }); this.award(30, 'Matched the recording'); },
      anims: ANIMS.map(a => { const on = a.id === s.sel, done = s.learned.includes(a.id); return { name: a.name, color: a.color, tag: done ? '✓' : a.lvl && level < a.lvl ? `Lv ${a.lvl}` : 'new', tagFg: done ? MINT : a.lvl && level < a.lvl ? '#66665f' : YELLOW, rowBg: on ? '#202024' : 'transparent', labelFg: on ? '#ededea' : '#b0b0aa', ol: on ? '2px solid #ededea' : 'none', bars: a.bars.map(([l, w], i) => ({ left: l, width: w, op: 1 - i * .25 })), select: () => this.setState({ sel: a.id }) }; }),
      sel: { ...sel, done: selDone && !(sel.id === 'stagger' && !s.passed), canLearn: !selDone && !locked, canChallenge: sel.id === 'stagger' && selDone && !s.passed, locked: !selDone && locked, lockMsg: `Unlocks at Lv ${sel.lvl}` },
      startLesson: () => this.setState({ screen: 'lesson', step: 1, run: s.run + 1, quiz: null, walk: 0 }),
      steps: ['1 · See it', '2 · Play', '3 · Code', '4 · Check'].map((label, i) => ({ label, bg: s.step === i + 1 ? MINT : '#26262a', fg: s.step === i + 1 ? '#141416' : '#b0b0aa', go: () => this.setState({ step: i + 1, run: s.run + 1 }) })),
      stepNum: s.step, stepTitle: stepCopy[0], stepBody: stepCopy[1], isStep1: s.step === 1, isStep2: s.step === 2, isStep3: s.step === 3, isStep4: s.step === 4,
      next: () => this.setState({ step: s.step + 1, run: s.run + 1 }), replay: () => this.setState({ run: s.run + 1 }),
      targetCards: this.cards({ dur: 480, stag: 90, ease: 1 }, 'tg' + s.run, MINT),
      demo: h('div', { key: `${s.dur}-${s.stag}-${s.ease}`, style: { display: 'flex', flexDirection: 'column', gap: 12 } }, [0, 1, 2].map(i => h('div', { key: i, style: { width: 44, height: 24, borderRadius: 6, background: MINT, animation: `fbSlide ${s.dur}ms ${pgE.css} ${i * s.stag}ms infinite alternate both` } }))),
      curve: `M ${pt(0, 0)} C ${pt(x1, y1)}, ${pt(x2, y2)}, ${pt(1, 1)}`,
      pgEases: chip(EASES, s.ease, i => this.setState({ ease: i })),
      dur: s.dur, stag: s.stag, onDur: e => this.setState({ dur: +e.target.value }), onStag: e => this.setState({ stag: +e.target.value }),
      pgCode: `.card {\n  transition: transform ${s.dur}ms ${pgE.css};\n  transition-delay: calc(var(--i) * ${s.stag}ms);\n}`,
      quiz: quizOpts.map(([label], i) => { const picked = s.quiz === i, right = i === 1; return { label, bg: picked ? '#1f1f23' : '#1a1a1d', bd: picked ? (right ? MINT : RED) : '#2a2a2e', mark: picked ? (right ? 'correct' : 'try again') : '', pick: () => this.setState({ quiz: i }) }; }),
      quizMsg: s.quiz === null ? '' : quizOpts[s.quiz][1], quizRight: s.quiz === 1,
      finishLesson: () => { this.setState({ learned: s.learned.includes('stagger') ? s.learned : [...s.learned, 'stagger'], screen: 'challenge', run: s.run + 1 }); this.award(60, 'Lesson: Card stagger'); },
      attempts: s.attempts,
      duel: this.cards({ dur: s.cDur, stag: s.cStag, ease: s.cEase }, 'du' + s.run, YELLOW, { ghost: true, h: 120 }),
      chEases: chip(EASES, s.cEase, i => this.setState({ cEase: i }), YELLOW),
      cDur: s.cDur, cStag: s.cStag, onCDur: e => this.setState({ cDur: +e.target.value }), onCStag: e => this.setState({ cStag: +e.target.value }),
      replayDuel: () => this.setState({ run: s.run + 1 }),
      hint: () => this.setState({ hintOn: true }), hintOn: s.hintOn, hintLabel: s.hintOn ? 'Hint used (−20 XP)' : 'Hint (−20 XP)',
      submit: () => {
        const r = this.computeScore();
        const pass = r.total >= 90;
        this.setState({ score: r, attempts: s.attempts + (s.score ? 1 : 0), run: s.run + 1, passed: s.passed || pass });
        if (pass && !s.passed) this.award(s.hintOn ? 180 : 200, 'Challenge passed · Easing badge');
      },
      scoreLabel: sc ? sc.total : '—', scoreFg: !sc ? '#76766f' : sc.total >= 90 ? MINT : sc.total >= 70 ? YELLOW : RED,
      scoreRows: (sc ? sc.rows : [['Distance'], ['Duration'], ['Stagger'], ['Easing']]).map(([label, v]) => ({ label, val: v === undefined ? '—' : (v >= 85 ? '✓ ' : '✗ ') + v, fg: v === undefined ? '#66665f' : v >= 85 ? MINT : RED })),
      scoreMsg: !sc ? 'Set easing, duration and stagger, then submit. Score 90+ for +200 XP and the Easing badge.' : s.passed ? 'Passed. Easing badge earned. This animation now counts as learned.' : (() => { const worst = sc.rows.slice(1).sort((a, b) => a[1] - b[1])[0][0]; return `${worst} is the furthest off. Play both and watch where yours drifts from the dashed outline.`; })(),
      passed: s.passed,
      stacks: Object.keys(CODE).map(l => ({ label: l === 'Web Animations API' ? 'WAAPI' : l === 'Framer Motion' ? 'Framer' : l, bg: s.stack === l ? '#2c2c31' : 'transparent', fg: s.stack === l ? '#ededea' : '#8a8a84', pick: () => this.setState({ stack: l, run: s.run + 1 }) })),
      fileName: CODE[s.stack][0], codeText: CODE[s.stack][1],
      replayPreview: () => this.setState({ run: s.run + 1 }),
      previewCards: this.cards({ dur: s.durs.stagger, stag: 90, ease: 1 }, 'pv' + s.run, '#e2e0d9', { h: 64 }),
      targets: tgt.map(([label, sub], i) => ({ label, sub, bd: s.target === i ? ORANGE : '#2a2a2e', pick: () => this.setState({ target: i, deploy: 'idle' }) })),
      stackSummary: s.outputs.length ? s.outputs.join(' · ') : 'HTML/CSS',
      toggles: ['Respect prefers-reduced-motion', 'Add lesson notes as code comments', 'Replace recorded images with placeholders'].map((label, i) => ({ label, bg: rate[i] ? MINT : '#33333a', x: rate[i] ? 18 : 3, flip: () => this.setState({ toggles: rate.map((v, j) => j === i ? !v : v) }) })),
      deployIdle: s.deploy === 'idle', deploying: s.deploy === 'running', deployed: s.deploy === 'done',
      deployLabel: ['Deploy studio-landing', 'Push to GitHub', 'Download .zip'][s.target],
      deployPct: s.deployPct,
      logLines: ['› building with vite', '› 6 components · 5 animations · 18kb js', '› reduced-motion fallbacks added', '› uploading'].slice(0, 1 + Math.floor(s.deployPct / 30)),
      deploy: () => {
        clearInterval(this.depT);
        this.setState({ deploy: 'running', deployPct: 0 });
        this.depT = setInterval(() => {
          const v = this.state.deployPct + 4;
          if (v >= 100) { clearInterval(this.depT); this.setState({ deploy: 'done', deployPct: 100 }); this.award(80, 'First ship of studio-landing'); }
          else this.setState({ deployPct: v });
        }, 60);
      },
      doneTitle: ['Live', 'Pushed', 'Downloaded'][s.target],
      doneSub: ['studio-landing.flipbook.app', 'github.com/you/studio-landing · main', 'studio-landing.zip · 212kb'][s.target],
      skills: skillDefs.map(([name, status, kind]) => ({ name, status, bg: kind === 'done' ? MINT : '#1c1c1f', fg: kind === 'done' ? '#141416' : kind === 'lock' ? '#66665f' : '#ededea', sfg: kind === 'done' ? '#141416' : kind === 'prog' ? MINT : '#8a8a84', bd: kind === 'prog' ? MINT : kind === 'done' ? MINT : '#33333a', bs: kind === 'lock' ? 'dashed' : 'solid' })),
      ...this.extraVals(s, ver, level),
      toastEl: toast ? h('div', { key: toast.id, style: { position: 'fixed', left: '50%', bottom: 28, zIndex: 50, padding: '14px 20px', borderRadius: 14, background: toast.up ? LILAC : '#ededea', color: '#141416', display: 'flex', flexDirection: 'column', gap: 2, boxShadow: '0 12px 40px rgba(0,0,0,.4)', animation: `fbToast ${toast.up ? 3.6 : 2.4}s ease-out both`, fontFamily: "'Bricolage Grotesque',sans-serif", minWidth: 220, textAlign: 'center' } }, [h('b', { key: 'a', style: { fontSize: 20 } }, toast.text), h('span', { key: 'b', style: { fontSize: 13, opacity: .75 } }, toast.sub)]) : null
    };
  }
}
