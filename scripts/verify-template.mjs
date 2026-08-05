import { mkdtemp, mkdir, copyFile, readFile, writeFile, chmod, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const referenceDir = join(repoRoot, 'references');
const fixtureRoot = await mkdtemp(join(tmpdir(), 'codebase-course-template.'));
const moduleDir = join(fixtureRoot, 'modules');

const replacements = new Map([
  ['COURSE_TITLE', 'Inside Codebase to Course'],
  ['PROJECT_NAME', 'Codebase to Course'],
  ['COURSE_PROMISE', 'Trace how a repository becomes an interactive course, then use that mental model to improve or debug the generator.'],
  ['ENTRY_ACTION', 'Ask an AI agent to turn a repository into a course'],
  ['ENTRY_FILE', 'SKILL.md'],
  ['ACCENT_COLOR', '#236C89'],
  ['ACCENT_HOVER', '#18536C'],
  ['ACCENT_LIGHT', '#E4F2F7'],
  ['ACCENT_MUTED', '#4D89A2'],
  ['COMPLETION_SUMMARY', 'You traced the generator from its instructions through the browser actions used by every lesson and into a validated, portable course.'],
  ['TAKEAWAY_1', 'Locate the instruction or shared file responsible for a course behavior.'],
  ['TAKEAWAY_2', 'Check generated interactions with keyboard, touch, and reduced motion.'],
  ['TAKEAWAY_3', 'Change a reusable pattern without breaking the required course files.'],
  ['NEXT_PROMPT', 'Trace how a new interactive exercise would move from SKILL.md into references/main.js. List the files to change, then describe its success, error, keyboard, and reduced-motion behavior.']
]);

const navDots = [
  ['module-1', 'Trace the first request'],
  ['module-2', 'See the files work together'],
  ['module-3', 'Follow data and decisions'],
  ['module-4', 'Prove the system holds']
].map(([target, title], index) => `<button class="nav-dot" type="button" data-target="${target}" data-tooltip="${title}" aria-label="Module ${index + 1}: ${title}"></button>`).join('\n');

function customize(source) {
  let output = source;
  for (const [placeholder, value] of replacements) output = output.replaceAll(placeholder, value);
  return output.replace('NAV_DOTS', navDots);
}

const modules = [
  `
<section class="module" id="module-1">
  <div class="module-content">
    <header class="module-header animate-in" data-stage="Locate the source">
      <span class="module-number" aria-hidden="true">01</span>
      <h2 class="module-title">Trace the first request</h2>
      <p class="module-subtitle">Start with the learner's action, then follow the exact source path that answers it.</p>
    </header>
    <section class="screen animate-in">
      <h3 class="screen-heading">Instructions become a course</h3>
      <p>The <button class="term" type="button" data-definition="A skill is a reusable set of instructions that tells an AI coding tool how to complete a specialized task.">skill</button> defines the curriculum and the build contract.</p>
      <div class="translation-block">
        <div class="translation-code"><span class="translation-label">CODE</span><pre><code><span class="code-line"><span class="code-keyword">const</span> course = <span class="code-function">build</span>(repository);</span>
<span class="code-line"><span class="code-keyword">await</span> course.<span class="code-function">verify</span>();</span></code></pre></div>
        <div class="translation-english"><span class="translation-label">PLAIN ENGLISH</span><div class="translation-lines"><p class="tl">Turn the real repository into a learning path.</p><p class="tl">Check the finished experience before handing it over.</p></div></div>
      </div>
    </section>
  </div>
</section>`,
  `
<section class="module" id="module-2">
  <div class="module-content">
    <header class="module-header animate-in" data-stage="Watch the exchange"><span class="module-number" aria-hidden="true">02</span><h2 class="module-title">See the files work together</h2><p class="module-subtitle">One browser file turns plain HTML patterns into consistent learning interactions.</p></header>
    <section class="screen animate-in">
      <h3 class="screen-heading">The files pass work to each other</h3>
      <p class="activity-instruction"><strong>Do this next:</strong> reveal the two messages to see how course instructions become reusable behavior.</p>
      <div class="chat-window" id="chat-module2">
        <div class="chat-messages">
          <div class="chat-message" data-sender="skill"><div class="chat-avatar" style="background:var(--color-actor-1)">S</div><div class="chat-bubble"><span class="chat-sender" style="color:var(--color-actor-1)">Skill</span><p>I define what the learner needs to understand.</p></div></div>
          <div class="chat-message" data-sender="engine"><div class="chat-avatar" style="background:var(--color-actor-2)">B</div><div class="chat-bubble"><span class="chat-sender" style="color:var(--color-actor-2)">Browser code</span><p>I make every exercise behave consistently.</p></div></div>
        </div>
        <div class="chat-typing" hidden><div class="chat-avatar" id="chat-module2-typing-avatar">S</div><div class="chat-typing-dots" aria-label="Message incoming"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div></div>
        <div class="chat-controls"><button class="btn chat-next-btn" type="button">Next message</button><button class="btn chat-all-btn" type="button" aria-pressed="false">Play all</button><button class="btn chat-reset-btn" type="button">Replay</button><span class="chat-progress"></span></div>
      </div>
      <details class="practice-extra">
        <summary>Optional · Compare the shared files</summary>
        <p class="activity-instruction"><strong>Do this next:</strong> choose either shared course file to see the job it owns.</p>
        <div class="arch-diagram">
          <div class="arch-zone"><h4 class="arch-zone-label">Shared course files</h4><button class="arch-component" type="button" data-desc="SKILL.md says what the course must teach and how it should feel."><span class="arch-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 4h12v16H6zM9 8h6M9 12h6M9 16h4"/></svg></span><span>SKILL.md</span></button><button class="arch-component" type="button" data-desc="main.js supplies navigation, saved progress, accessible feedback, and exercise behavior."><span class="arch-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14"/></svg></span><span>main.js</span></button></div>
          <div class="arch-description">Choose a component to learn what it contributes.</div>
        </div>
      </details>
    </section>
  </div>
</section>`,
  `
<section class="module" id="module-3">
  <div class="module-content">
    <header class="module-header animate-in" data-stage="Trace the transformation"><span class="module-number" aria-hidden="true">03</span><h2 class="module-title">Follow data and decisions</h2><p class="module-subtitle">Visible history keeps every step available while the learner advances.</p></header>
    <section class="screen animate-in">
      <h3 class="screen-heading">Trace the build</h3>
      <p class="activity-instruction"><strong>Do this next:</strong> advance the trace to keep every transformation visible in order.</p>
      <div class="flow-animation" data-steps='[{"highlight":"flow-m3-actor-1","label":"Find the first files used by the request"},{"highlight":"flow-m3-actor-2","label":"Outline each lesson from the architecture","packet":true,"from":"m3-actor-1","to":"m3-actor-2"},{"highlight":"flow-m3-actor-3","label":"Assemble and verify the course","packet":true,"from":"m3-actor-2","to":"m3-actor-3"}]'>
        <div class="flow-actors"><div class="flow-actor" id="flow-m3-actor-1"><div class="flow-actor-icon">R</div><span>Repository</span></div><div class="flow-actor" id="flow-m3-actor-2"><div class="flow-actor-icon">L</div><span>Lesson plan</span></div><div class="flow-actor" id="flow-m3-actor-3"><div class="flow-actor-icon">C</div><span>Course</span></div></div>
        <div class="flow-packet" aria-hidden="true"></div><div class="flow-step-label">Choose Next step to begin</div><div class="flow-controls"><button class="btn flow-next-btn" type="button">Next step</button><button class="btn flow-reset-btn" type="button">Restart</button><span class="flow-progress"></span></div>
      </div>
      <details class="practice-extra">
        <summary>Optional · Match each file to its job</summary>
        <p class="activity-instruction"><strong>Do this next:</strong> select each file, place it beside the job it owns, then check both matches.</p>
        <div class="dnd-container" id="dnd-module3">
          <div class="dnd-chips"><button class="dnd-chip" type="button" draggable="true" data-answer="skill">SKILL.md</button><button class="dnd-chip" type="button" draggable="true" data-answer="engine">main.js</button></div>
          <div class="dnd-zones"><div class="dnd-zone" data-correct="skill"><p class="dnd-zone-label">Defines the course-making instructions</p><button class="dnd-zone-target" type="button">Place an item here</button></div><div class="dnd-zone" data-correct="engine"><p class="dnd-zone-label">Provides browser actions used by every lesson</p><button class="dnd-zone-target" type="button">Place an item here</button></div></div>
          <button class="btn btn-primary dnd-check-btn" type="button">Check matches</button><button class="btn dnd-reset-btn" type="button">Reset</button><p class="dnd-feedback" role="status" aria-live="polite">Select an item to begin.</p>
        </div>
      </details>
    </section>
  </div>
</section>`,
  `
<section class="module" id="module-4">
  <div class="module-content">
    <header class="module-header animate-in" data-stage="Decide with confidence"><span class="module-number" aria-hidden="true">04</span><h2 class="module-title">Prove the system holds</h2><p class="module-subtitle">Use the same controls with mouse, keyboard, touch, and reduced motion.</p></header>
    <section class="screen animate-in">
      <h3 class="screen-heading">Make the file-level decision</h3>
      <p class="activity-instruction"><strong>Do this next:</strong> inspect the two lines. <code>JSON.parse</code> turns stored step text into a list; choose the line that could stop the walkthrough.</p>
      <div class="bug-challenge"><h3>Find the fragile line:</h3><div class="bug-code"><button class="bug-line" type="button" data-line="1" data-correct="false" data-hint="This declaration is safe."><span class="line-num">1</span><code>const steps = container.dataset.steps;</code></button><button class="bug-line bug-target" type="button" data-line="2" data-correct="true" data-explanation="Turning invalid step text into data without recovery can stop the walkthrough. Wrap it and show a readable fallback."><span class="line-num">2</span><code>const data = JSON.parse(steps);</code></button></div><div class="bug-feedback"></div></div>
      <details class="practice-extra">
        <summary>Optional · Choose the shared file</summary>
        <p class="activity-instruction"><strong>Do this next:</strong> answer one question about which file should provide shared keyboard behavior.</p>
        <div class="quiz-container" id="quiz-module4"><div class="quiz-question-block" data-correct="engine" data-explanation-right="The controls belong in the copied browser file so every generated course benefits." data-explanation-wrong="Module HTML should describe the exercise; main.js should provide those controls."><h4 class="quiz-question">Where should keyboard controls used in every lesson live?</h4><div class="quiz-options"><button class="quiz-option" type="button" data-value="module"><span class="quiz-option-radio" aria-hidden="true"></span><span>Inside one module</span></button><button class="quiz-option" type="button" data-value="engine"><span class="quiz-option-radio" aria-hidden="true"></span><span>Inside main.js</span></button></div><div class="quiz-feedback"></div></div><button class="quiz-check-btn" type="button">Check answer</button><button class="quiz-reset-btn" type="button">Try again</button></div>
      </details>
      <details class="practice-extra">
        <summary>Optional · Compare HTML, CSS, and JavaScript</summary>
        <p class="activity-instruction"><strong>Do this next:</strong> choose HTML, CSS, or JavaScript to see the job each file type carries.</p>
        <div class="layer-demo"><div class="layer-tabs"><button class="layer-tab active" type="button" data-layer="m4-html">HTML</button><button class="layer-tab" type="button" data-layer="m4-css">CSS</button><button class="layer-tab" type="button" data-layer="m4-js">JavaScript</button></div><div class="layer-viewport"><div class="layer" id="layer-m4-html">Semantic structure</div><div class="layer" id="layer-m4-css" hidden>Responsive presentation</div><div class="layer" id="layer-m4-js" hidden>Recoverable behavior</div></div><p class="layer-description">Choose a layer to inspect it.</p></div>
      </details>
    </section>
  </div>
</section>`
];

try {
  await mkdir(moduleDir, { recursive: true });
  for (const file of ['styles.css', 'main.js', 'build.sh']) await copyFile(join(referenceDir, file), join(fixtureRoot, file));
  await chmod(join(fixtureRoot, 'build.sh'), 0o755);

  const base = customize(await readFile(join(referenceDir, '_base.html'), 'utf8'));
  const footer = customize(await readFile(join(referenceDir, '_footer.html'), 'utf8'));
  await writeFile(join(fixtureRoot, '_base.html'), base);
  await writeFile(join(fixtureRoot, '_footer.html'), footer);
  await Promise.all(modules.map((module, index) => writeFile(join(moduleDir, `${String(index + 1).padStart(2, '0')}-module.html`), module)));

  const build = spawnSync('bash', ['build.sh'], { cwd: fixtureRoot, encoding: 'utf8' });
  if (build.status !== 0) throw new Error((build.stderr || build.stdout || 'Build failed').trim());

  const index = await readFile(join(fixtureRoot, 'index.html'), 'utf8');
  const assertions = [
    [!/(COURSE_TITLE|PROJECT_NAME|COURSE_PROMISE|ENTRY_ACTION|ENTRY_FILE|ACCENT_|NAV_DOTS|COMPLETION_SUMMARY|TAKEAWAY_[123]|NEXT_PROMPT)/.test(index), 'unresolved placeholders'],
    [(index.match(/class="module"/g) || []).length === 4, 'four assembled modules'],
    [(index.match(/class="nav-dot"/g) || []).length === 4, 'one nav control per module'],
    [index.includes('id="course-overview"') && index.includes('id="course-complete"'), 'authored opening and completion'],
    [index.includes('id="course-outline"') && index.includes('id="course-help"'), 'contents and help'],
    [index.includes('dnd-check-btn') && index.includes('data-correct="true"'), 'declarative interaction contracts']
  ];
  const failed = assertions.filter(([passed]) => !passed).map(([, label]) => label);
  if (failed.length) throw new Error(`Fixture assertions failed: ${failed.join(', ')}`);

  const badFlowPage = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="styles.css"><script src="main.js" defer></script></head><body><main><div class="flow-animation" data-steps="not-json"><div class="flow-step-label">Loading walkthrough</div><div class="flow-controls"><button class="btn flow-next-btn" type="button">Next step</button><button class="btn flow-reset-btn" type="button">Restart</button><span class="flow-progress"></span></div></div></main></body></html>`;
  await writeFile(join(fixtureRoot, 'bad-flow.html'), badFlowPage);

  process.stdout.write(JSON.stringify({ fixtureRoot, build: build.stdout.trim() }) + '\n');
} catch (error) {
  await rm(fixtureRoot, { recursive: true, force: true });
  throw error;
}

if (process.env.KEEP_COURSE_FIXTURE !== '1') await rm(fixtureRoot, { recursive: true, force: true });
