/* Always open at the top: browsers otherwise restore the old scroll position on reload,
   which lands on parts of the chat that haven't played yet (a blank screen). */
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
if (!location.hash) scrollTo(0, 0);

/* ---------- helpers ---------- */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

const CRESCENT = "M29.80 16.15A16 16 0 1 0 47.42 36.28A13.5 13.5 0 0 1 29.80 16.15Z";
const sparkle = (x, y, s) => `<path class="star" d="M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z"/>`;
function sunSVG(size){
  let long = "", short = "";
  for (let i = 0; i < 12; i++){
    const a = i * Math.PI / 6, c = Math.cos(a), s = Math.sin(a);
    const [r1, r2] = i % 2 ? [21.5, 26] : [21, 29.5];
    const l = `<line x1="${(32 + c*r1).toFixed(2)}" y1="${(32 + s*r1).toFixed(2)}" x2="${(32 + c*r2).toFixed(2)}" y2="${(32 + s*r2).toFixed(2)}"/>`;
    if (i % 2) short += l; else long += l;
  }
  return `<svg class="sun" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
    <g class="day">
      <g class="rays"><g>${long}</g><g class="short">${short}</g></g>
      <circle class="core" cx="32" cy="32" r="15.5"/>
      <circle class="cheek" cx="23.5" cy="35" r="2.6"/><circle class="cheek" cx="40.5" cy="35" r="2.6"/>
      <g class="eyes"><circle cx="27" cy="30" r="1.9"/><circle cx="37" cy="30" r="1.9"/></g>
      <path class="smile" d="M27 35.2c2.8 3.2 7.2 3.2 10 0"/>
    </g>
    <g class="night">
      <g class="stars">${sparkle(50, 12, 4)}${sparkle(57, 44, 2.6)}${sparkle(11, 14, 3)}${sparkle(45, 57, 2.2)}${sparkle(8, 42, 2)}</g>
      <g transform="matrix(1.22 0 0 1.22 -7.04 -7.04)"><g class="crescent">
        <path class="moon" d="${CRESCENT}"/>
        <circle class="moon-cheek" cx="19.5" cy="39" r="2.2"/>
        <path class="moon-face" d="M18.6 32.6q1.7 1.5 3.4 0M25.2 36.4q1.7 1.5 3.4 0M21.6 41.8q2.6 2 5.2 .2"/>
      </g></g>
    </g></svg>`;
}
document.querySelectorAll("[data-sun]").forEach(el => el.outerHTML = sunSVG(+el.dataset.sun));

/* A drawn ↗ arrow. The ↗ character shows up as an emoji on iPhone, so links use this instead. */
const ARROW = '<svg class="arrow" viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 8.5l5-5M4.5 3.5h4v4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const xpList = list => `<ul class="xp">${list.map(x => `
  <li><button class="xp-head" type="button" aria-expanded="true">
    <span class="logo" aria-hidden="true"><span>${esc(x.mono || x.org.slice(0, 1))}</span>${x.logo ? `<img src="${esc(x.logo)}" alt="" loading="lazy" onerror="this.remove()">` : ""}</span>
    <span class="xp-title"><span class="role">${esc(x.role)}</span><span class="org">${esc(x.org)}</span><span class="yrs">${esc(x.years)}</span></span>
    <span class="chev" aria-hidden="true"></span></button>
  <div class="xp-more"><p>${esc(x.text)}</p><div class="metrics">${x.metrics.map(m => `<span class="metric">${esc(m)}</span>`).join("")}</div></div></li>`).join("")}</ul>`;

/* On phones, jobs collapse to logo + title; tapping one opens its description. Desktop shows everything. */
const phone = matchMedia("(max-width: 640px)");
function syncJobs(root = document){
  root.querySelectorAll(".xp-head").forEach(b => {
    const li = b.parentElement;
    b.setAttribute("aria-expanded", String(!phone.matches || li.classList.contains("open")));
    b.tabIndex = phone.matches ? 0 : -1;
  });
}
phone.addEventListener?.("change", () => syncJobs());

const THUMBS = {
  drug: `<div class="thumb t-drug"><div class="doc"><i></i><i class="s"></i><i class="hl"></i><i></i><i class="s"></i><i></i><i class="hl s"></i><i></i></div>
         <div class="json">{<br>&nbsp;"drug": <em>"…"</em>,<br>&nbsp;"status": <em>"short"</em>,<br>&nbsp;"site": <em>"…"</em><br>}</div></div>`,
  atelo: `<div class="thumb t-atelo"><div class="photo"></div><div class="pack"></div></div>`
};

/* Each renderer returns the answer body: first <p> streams in, everything after it rises in */
const RENDER = {
  about: intro => `<p>${esc(intro ?? PROFILE.about)}</p>
    <div class="skills">${PROFILE.skills.map(g => `<div class="skillrow"><h3>${esc(g.group)}</h3><div class="tags">${g.items.map(t => `<span class="tag">${esc(t)}</span>`).join("")}</div></div>`).join("")}</div>`,
  now: intro => `<p>${esc(intro ?? "I started at EY this summer, right after a data analyst role at Bloomerang.")}</p>${xpList(PROFILE.now)}`,
  before: intro => `<p>${esc(intro ?? "Mostly data engineering, with more and more AI along the way.")}</p>${xpList(PROFILE.before)}`,
  projects: intro => `<p>${esc(intro ?? "Two recent ones. Open either for the details.")}</p><div class="projects">${PROFILE.projects.map(p => `
    <article class="proj">${p.logo ? `<div class="thumb t-logo${p.logoTheme === "dark" ? " dark" : ""}"><img src="${esc(p.logo)}" alt="${esc(p.title)} logo"></div>` : THUMBS[p.thumb]}
      <div class="txt"><span class="kicker">${esc(p.kicker)}</span>
        <h3>${p.href ? `<a href="${esc(p.href)}" target="_blank" rel="noopener">${esc(p.title)} ${ARROW}</a>` : esc(p.title)}</h3>
        <p>${esc(p.text)}</p>
        <details><summary>How it works</summary><dl>
          <div><dt>What it does</dt><dd>${esc(p.what)}</dd></div>
          <div><dt>How</dt><dd>${esc(p.how)}</dd></div>
          <div><dt>Stack</dt><dd>${esc(p.stack)}</dd></div></dl></details>
      </div></article>`).join("")}</div>`,
  education: intro => { const E = PROFILE.education; return `<p>${esc(intro ?? "Northeastern, where I mixed computer science with business and fintech.")}</p>
    <div class="edu"><div class="logo" aria-hidden="true"><span>${esc(E.mono || "")}</span>${E.logo ? `<img src="${esc(E.logo)}" alt="" loading="lazy" onerror="this.remove()">` : ""}</div>
      <div class="edu-txt"><h3>${esc(E.school)}</h3><div class="sub">${esc(E.degree)}<br>${esc(E.when)}</div>
      <div class="tags">${E.courses.map(c => `<span class="tag">${esc(c)}</span>`).join("")}</div></div></div>`; },
  contact: intro => `<p>${esc(intro ?? "I'm based in Texas and always happy to talk about AI agents, shipping products or fintech. Email is the fastest way to reach me.")}</p>
    <div class="contact"><div class="email-row"><span class="email">${esc(PROFILE.email)}</span><button class="ghost copy" type="button">Copy</button></div>
    <div class="links">${PROFILE.links.map(l => `<a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)} ${ARROW}</a>`).join("")}</div></div>`
};

/* On phones, keep the description under the headline to two lines by easing its size down if needed. */
function fitLede(){
  const el = document.querySelector(".hero .lede"); if (!el) return;
  el.style.fontSize = "";
  if (!matchMedia("(max-width: 640px)").matches) return;
  let fs = parseFloat(getComputedStyle(el).fontSize);
  const lines = () => Math.round(el.getBoundingClientRect().height / (fs * 1.6));
  while (lines() > 2 && fs > 12){ fs -= 0.5; el.style.fontSize = fs + "px"; }
}

/* Keep every skill group to two lines max: step the tag size down until it fits. */
function fitSkills(){
  document.querySelectorAll(".skillrow .tags").forEach(box => {
    let fs = 12;
    box.style.setProperty("--tag-fs", fs + "px");
    const lines = () => new Set([...box.children].map(t => t.offsetTop)).size;
    while (lines() > 2 && fs > 9){ fs -= 0.5; box.style.setProperty("--tag-fs", fs + "px"); }
  });
}
let fitTimer;
addEventListener("resize", () => { clearTimeout(fitTimer); fitTimer = setTimeout(() => { fitSkills(); fitLede(); }, 120); });
document.fonts?.ready.then(() => { fitSkills(); fitLede(); });
fitLede();

/* ---------- build the thread ---------- */
const thread = document.getElementById("thread");
const staged = !reduce && "IntersectionObserver" in window;

function buildTurn(ask, bodyHTML, opts = {}){
  const sec = document.createElement("section");
  sec.className = "turn" + (staged ? " armed" : "");
  if (opts.id) sec.id = opts.id;
  sec.innerHTML = `<div class="ask">${esc(ask)}</div>
    <div class="reply"><div class="who">${sunSVG(30)}</div><div class="content"><div class="dots" aria-hidden="true"><i></i><i></i><i></i><span class="think-word">Thinking…</span></div><div class="body">${bodyHTML}</div></div></div>`;
  const body = sec.querySelector(".body");
  [...body.children].forEach((c, i) => { if (i === 0) c.dataset.stream = ""; else c.classList.add("rise"); });
  sec._ask = ask;
  sec._auto = opts.autotype !== false;
  return sec;
}

const scripted = SCRIPT.map(s => { const t = buildTurn(s.ask, RENDER[s.id]()); t.id = s.id; thread.appendChild(t); return t; });
syncJobs();
fitSkills();
const sep = document.createElement("div"); sep.className = "live-sep"; sep.textContent = "you're all caught up. ask me anything"; thread.appendChild(sep);
const live = document.createElement("div"); live.id = "live"; thread.appendChild(live);

/* ---------- the typing / sending / answering sequence ----------
   Each scripted turn plays in two phases:
   1. ASK: when the turn scrolls into view, its question types into the composer (slowly),
      sends, and the sun starts "thinking".
   2. ANSWER: only once the reply has been scrolled up to ANSWER_LINE of the screen does the
      answer stream in. Until then the sun keeps spinning as if it's loading.
   Live (typed) questions skip the scroll gate and answer after a short think. */
const TIMING = {
  warmup: 900,       // delay before the first question starts typing
  char: 78,          // ms per typed character
  space: 120,        // ms per space
  punct: 220,        // ms after , . ? !
  beforeSend: 650,   // pause with the full question in the box
  afterSend: 520,    // bubble lands → sun appears
  minThink: 1800,    // the sun always thinks at least this long
  word: 70,          // ms per streamed word
  rise: 220,         // ms between cards sliding in
  backlog: 1.5       // mild speed-up only when 2+ questions are waiting
};
const ANSWER_LINE = "-45%"; // reply's top must pass 55% down the screen

const box = document.getElementById("box"), q = document.getElementById("q"), sendBtn = document.getElementById("send");
let gen = 0, running = false, autotyping = false;
const queue = [], sleepers = new Set(), allTurns = [];
const sleep = ms => new Promise(r => { const t = setTimeout(() => { sleepers.delete(w); r(); }, ms); const w = () => { clearTimeout(t); r(); }; sleepers.add(w); });

/* Rotate playful "thinking" words while the sun waits, like Claude does */
const WORDS = (typeof THINKING_WORDS !== "undefined" && THINKING_WORDS.length) ? THINKING_WORDS : ["Thinking"];
const WORDS_NIGHT = (typeof THINKING_WORDS_NIGHT !== "undefined" && THINKING_WORDS_NIGHT.length) ? THINKING_WORDS_NIGHT : WORDS;
let lastWord = "";
function nextWord(){
  const list = document.documentElement.dataset.mode === "night" ? WORDS_NIGHT : WORDS;
  let w; do { w = list[Math.floor(Math.random() * list.length)]; } while (list.length > 1 && w === lastWord);
  return (lastWord = w) + "…";
}
function startThinking(t){
  const el = t.querySelector(".think-word"); if (!el) return;
  el.textContent = nextWord();
  clearInterval(t._thinkTimer);
  t._thinkTimer = setInterval(() => {
    el.classList.add("swap");
    setTimeout(() => { el.textContent = nextWord(); el.classList.remove("swap"); }, 220);
  }, 1900);
}
function stopThinking(t){ clearInterval(t._thinkTimer); t._thinkTimer = null; }

function finish(t){
  stopThinking(t);
  t.querySelectorAll(".ask,.reply,.rise").forEach(e => e.classList.add("in"));
  t.querySelector(".reply").classList.remove("thinking");
  const p = t.querySelector("[data-stream]");
  if (p && p._full != null) p.textContent = p._full;
  t.classList.remove("armed");
  t._state = "done";
  t._resolveDone && t._resolveDone();
}
const whenDone = t => t._state === "done" ? Promise.resolve() : (t._doneP ||= new Promise(r => t._resolveDone = r));
function resetComposer(){
  if (autotyping){ q.value = ""; box.classList.remove("auto"); autotyping = false; sendBtn.disabled = true; }
}
function flushAll(){
  heroSkipped = true;
  gen++;
  queue.length = 0;
  allTurns.forEach(t => { if (t._state !== "done") finish(t); });
  [...sleepers].forEach(w => w());
  resetComposer();
}
function enqueue(t){
  if (t._state) return;
  // never skip a question: earlier scripted turns that were scrolled past go first
  const i = scripted.indexOf(t);
  if (i > 0) scripted.slice(0, i).forEach(e => { if (!e._state){ e._state = "queued"; queue.push(e); } });
  t._state = "queued"; queue.push(t); run();
}
async function run(){
  if (running) return; running = true;
  if (!run._warmed){ run._warmed = true; await heroDone; await sleep(TIMING.warmup); }
  while (queue.length){
    const t = queue.shift();
    await playAsk(t, queue.length > 1 ? TIMING.backlog : 1);
    await whenDone(t);   // one exchange at a time: the next question waits for this answer
  }
  running = false;
}

async function playAsk(t, speed){
  const g = gen; const stale = () => g !== gen;
  if (t._state === "done") return;
  t._state = "asking";
  const ask = t.querySelector(".ask"), reply = t.querySelector(".reply");

  if (t._auto){
    autotyping = true; box.classList.add("auto"); q.value = "";
    for (const ch of t._ask){
      q.value += ch; sendBtn.disabled = false;
      await sleep((ch === " " ? TIMING.space : /[,.?!]/.test(ch) ? TIMING.punct : TIMING.char) / speed);
      if (stale()) return finish(t);
    }
    await sleep(TIMING.beforeSend / speed); if (stale()) return finish(t);
    sendBtn.classList.add("fire"); await sleep(140); sendBtn.classList.remove("fire");
    q.value = ""; sendBtn.disabled = true; box.classList.remove("auto"); autotyping = false;
  }
  ask.classList.add("in");
  if (t._follow) t.scrollIntoView({ behavior: "smooth", block: "start" });
  await sleep(TIMING.afterSend / speed); if (stale()) return finish(t);

  reply.classList.add("in", "thinking");
  startThinking(t);
  t._thinkStart = performance.now();
  t._state = "thinking";
  maybeAnswer(t);
}

function maybeAnswer(t){
  if (t._state !== "thinking") return;
  if (t._gate && !t._reached) return;   // keep the sun spinning until the reader scrolls here
  t._state = "answering";
  playAnswer(t);
}

async function playAnswer(t){
  const g = gen; const stale = () => g !== gen;
  const reply = t.querySelector(".reply"), p = t.querySelector("[data-stream]");
  const rises = [...t.querySelectorAll(".rise")];
  const thought = performance.now() - t._thinkStart;
  if (thought < TIMING.minThink){ await sleep(TIMING.minThink - thought); if (stale()) return finish(t); }

  // lay the words out invisibly first so the reply doesn't jump as it streams
  let words = [];
  if (p){
    p.textContent = "";
    words = p._full.split(" ").map((w, i, a) => { const s = document.createElement("span"); s.className = "w"; s.textContent = w + (i < a.length - 1 ? " " : ""); p.appendChild(s); return s; });
  }
  stopThinking(t);
  reply.classList.remove("thinking");
  for (const w of words){ w.classList.add("on"); await sleep(TIMING.word); if (stale()) return finish(t); }
  for (const r of rises){ r.classList.add("in"); await sleep(TIMING.rise); if (stale()) return finish(t); }
  finish(t);
}

scripted.forEach(t => { t._gate = true; allTurns.push(t); const p = t.querySelector("[data-stream]"); if (p) p._full = p.textContent; });


/* ---------- intro: the headline types itself in when the page opens ---------- */
const HERO = { char: 38, punct: 260, startDelay: 450, afterType: 250 };
let heroSkipped = false, heroResolve;
const heroDone = new Promise(r => heroResolve = r);

async function typeHero(){
  const h1 = document.querySelector(".hero h1");
  const bits = [...document.querySelectorAll(".hero .lede, .hero .hint")];
  const reveal = () => document.documentElement.classList.remove("intro");
  if (!staged || !h1){ reveal(); heroResolve(); return; }

  h1.style.minHeight = h1.offsetHeight + "px";          // reserve the space so nothing jumps while typing
  const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(n => { n._full = n.nodeValue; n.nodeValue = ""; if (n.parentElement !== h1) n.parentElement.classList.add("untyped"); });
  bits.forEach(b => b.classList.add("pre"));
  const caret = document.createElement("span"); caret.className = "type-caret"; caret.setAttribute("aria-hidden", "true");
  reveal();

  const finish = () => {
    nodes.forEach(n => { n.nodeValue = n._full; n.parentElement.classList.remove("untyped"); });
    caret.remove(); h1.style.minHeight = "";
    bits.forEach(b => b.classList.remove("pre"));
    heroResolve();
  };

  await sleep(HERO.startDelay);
  for (const n of nodes){
    n.parentElement.classList.remove("untyped");
    n.after(caret);
    for (const ch of Array.from(n._full)){           // Array.from keeps the 👋 emoji in one piece
      if (heroSkipped) return finish();
      n.nodeValue += ch;
      await sleep(/[.,]/.test(ch) ? HERO.punct : HERO.char);
    }
  }
  await sleep(HERO.afterType);
  caret.remove(); h1.style.minHeight = "";
  for (const b of bits){ b.classList.remove("pre"); await sleep(220); }
  heroResolve();
}
typeHero();

if (staged){
  // phase 1: question types as the turn enters the screen
  const askIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting){ enqueue(e.target); askIO.unobserve(e.target); }
  }), { rootMargin: "0px 0px -12% 0px", threshold: 0 });
  // phase 2: answer once the reply is scrolled up past the answer line
  const answerIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting){ const t = e.target.closest(".turn"); t._reached = true; maybeAnswer(t); answerIO.unobserve(e.target); }
  }), { rootMargin: `0px 0px ${ANSWER_LINE} 0px`, threshold: 0 });
  scripted.forEach(t => { askIO.observe(t); answerIO.observe(t.querySelector(".reply")); });
  // backstop for fast scrolling (a reply can jump past the line between frames) and for the very
  // bottom of the page, where there may be no room left to scroll a reply that high
  addEventListener("scroll", () => {
    const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 8;
    scripted.forEach(t => {
      if (t._reached) return;
      if (atBottom || t.querySelector(".reply").getBoundingClientRect().top < innerHeight * 0.55){ t._reached = true; maybeAnswer(t); }
    });
    scripted.forEach(t => { if (!t._state && t.getBoundingClientRect().top < innerHeight * 0.88) enqueue(t); });
  }, { passive: true });
} else {
  scripted.forEach(finish);
}

/* ---------- live questions ---------- */
function route(text){
  if (/^\s*(hi|hey|hello|yo|sup|howdy)\b/i.test(text)) return "hello";
  for (const r of ROUTES) if (r.re.test(text)) return r.id;
  return null;
}
const chipsHTML = ids => `<div class="chips">${ids.map(id => { const s = SCRIPT.find(x => x.id === id); return `<button class="chip ask-chip" type="button" data-q="${esc(s.ask)}">${esc(s.label)}</button>`; }).join("")}</div>`;
function answerFor(text){
  const id = route(text);
  if (id === "hello") return `<p>Hey, nice to meet you! I'm the sunny version of ${esc(PROFILE.name)}'s portfolio. Where should we start?</p>${chipsHTML(["projects", "now", "contact"])}`;
  if (id) return RENDER[id](LIVE_INTRO[id]);
  return `<p>Good question. I'm a scripted guide for now, so I can't answer that one directly, but ${esc(PROFILE.name)} would be glad to. Here's what I can show you:</p>${chipsHTML(SCRIPT.map(s => s.id))}`;
}
function ask(text, autotype){
  text = text.trim(); if (!text) return;
  flushAll();
  const t = buildTurn(text, answerFor(text), { autotype });
  t._follow = true; t._gate = false; allTurns.push(t);
  syncJobs(t);
  const p = t.querySelector("[data-stream]"); if (p) p._full = p.textContent;
  if (!staged){ live.appendChild(t); finish(t); t.scrollIntoView({ block: "start" }); return; }
  live.appendChild(t);
  fitSkills();
  enqueue(t);
}

q.addEventListener("input", () => { sendBtn.disabled = !q.value.trim(); });
q.addEventListener("pointerdown", () => { if (autotyping) flushAll(); });
q.addEventListener("keydown", e => { if (autotyping && e.key !== "Tab") flushAll(); });
box.addEventListener("submit", e => { e.preventDefault(); if (autotyping) return; const v = q.value; q.value = ""; sendBtn.disabled = true; ask(v, false); });
document.getElementById("getInTouch").addEventListener("click", () => ask("How can I reach you?", true));

const suggest = document.getElementById("suggest");
["What are you working on now?", "Tell me about Atelo", "What's your tech stack?", "How can I reach you?"].forEach(t => {
  const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = t;
  b.addEventListener("click", () => ask(t, true)); suggest.appendChild(b);
});

/* ---------- index rail ---------- */
const rail = document.getElementById("rail");
SCRIPT.forEach((s, i) => {
  const b = document.createElement("button"); b.type = "button"; b.textContent = s.label; b.dataset.target = s.id;
  b.addEventListener("click", () => {
    heroSkipped = true; gen++; [...sleepers].forEach(w => w()); resetComposer();
    queue.length = 0;
    scripted.forEach((t, k) => {
      if (k <= i){ if (t._state !== "done") finish(t); }
      else if (t._state && t._state !== "done"){ finish(t); }   // anything already mid-animation just completes
    });
    scripted[i].scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  });
  rail.appendChild(b);
});
if ("IntersectionObserver" in window){
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) rail.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.target === e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  scripted.forEach(t => spy.observe(t));
}

/* ---------- day / night switch ---------- */
const modeBtn = document.getElementById("modeSwitch");
const themeMeta = document.querySelector('meta[name="theme-color"]');
function setMode(night, animate){
  const root = document.documentElement;
  const apply = () => {
    if (night) root.dataset.mode = "night"; else delete root.dataset.mode;
    modeBtn?.setAttribute("aria-checked", String(night));
    themeMeta?.setAttribute("content", night ? "#0D1222" : "#FFFFFF");
  };
  // One crossfade for the whole page, so every color changes together (no per-element fading lag).
  if (animate && !reduce && document.startViewTransition) document.startViewTransition(apply);
  else apply();
  try { localStorage.setItem("mode", night ? "night" : "day"); } catch (e) {}
}
modeBtn?.setAttribute("aria-checked", String(document.documentElement.dataset.mode === "night"));
modeBtn?.addEventListener("click", () => setMode(document.documentElement.dataset.mode !== "night", true));

/* ---------- clicks inside answers ---------- */
document.addEventListener("click", e => {
  const job = e.target.closest(".xp-head");
  if (job && phone.matches){ job.parentElement.classList.toggle("open"); syncJobs(job.parentElement.parentElement); return; }
  const c = e.target.closest(".ask-chip");
  if (c){ ask(c.dataset.q, true); return; }
  const cp = e.target.closest(".copy");
  if (cp){
    const done = () => { cp.textContent = "Copied"; setTimeout(() => cp.textContent = "Copy", 1600); };
    const fallback = () => { const el = cp.parentElement.querySelector(".email"); const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); cp.textContent = "Selected, press Ctrl/⌘ C"; };
    try { navigator.clipboard.writeText(PROFILE.email).then(done, fallback); } catch(_) { fallback(); }
  }
});
