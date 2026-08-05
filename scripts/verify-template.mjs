import { mkdtemp, mkdir, copyFile, readFile, writeFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const referenceDir = join(repoRoot, 'skills', 'codebase-to-course', 'references');
const fixtureRoot = await mkdtemp(join(tmpdir(), 'codebase-course-template.'));
const moduleDir = join(fixtureRoot, 'modules');

const replacements = new Map([
  ['{{COURSE_TITLE}}', 'Inside Codebase to Course'],
  ['{{PROJECT_NAME}}', 'Codebase to Course'],
  ['{{COURSE_PROMISE}}', 'Trace how a repository becomes an interactive course, then use that mental model to improve or debug the generator.'],
  ['{{ENTRY_ACTION}}', 'Ask an AI agent to turn a repository into a course'],
  ['{{ENTRY_FILE}}', 'SKILL.md'],
  ['{{ACCENT_COLOR}}', '#236C89'],
  ['{{ACCENT_HOVER}}', '#18536C'],
  ['{{ACCENT_LIGHT}}', '#E4F2F7'],
  ['{{ACCENT_MUTED}}', '#4D89A2'],
  ['{{COMPLETION_SUMMARY}}', 'You traced the generator from its instructions through the browser actions used by every lesson and into a validated, portable course.'],
  ['{{TAKEAWAY_1}}', 'Locate the instruction or shared file responsible for a course behavior.'],
  ['{{TAKEAWAY_2}}', 'Check generated interactions with keyboard, touch, and reduced motion.'],
  ['{{TAKEAWAY_3}}', 'Change a reusable pattern without breaking the required course files.'],
  ['{{NEXT_PROMPT}}', 'Trace how a new interactive exercise would move from SKILL.md into references/main.js. List the files to change, then describe its success, error, keyboard, and reduced-motion behavior.']
]);

const moduleMetadata = [
  ['module-1', 'Trace the first request'],
  ['module-2', 'See the files work together'],
  ['module-3', 'Follow data and decisions'],
  ['module-4', 'Prove the system holds']
];
const navDots = moduleMetadata.map(([target], index) => `<button class="nav-dot" type="button" data-target="${target}" data-tooltip="Module ${index + 1}" aria-label="Module ${index + 1}"></button>`).join('\n');

function customize(source) {
  let output = source;
  for (const [placeholder, value] of replacements) output = output.replaceAll(placeholder, value);
  return output.replace('{{NAV_DOTS}}', navDots);
}

const modules = [
  `
<section class="module" id="module-1">
  <div class="module-content">
    <header class="module-header animate-in">
      <span class="module-stage">Locate the source</span>
      <span class="module-number" aria-hidden="true">01</span>
      <h2 class="module-title">Trace the first request</h2>
      <p class="module-subtitle">Start with the learner's action, then follow the exact source path that answers it.</p>
    </header>
    <section class="screen animate-in">
      <h3 class="screen-heading">Instructions become a course</h3>
      <p data-claim-id="C-001">The <button class="term" type="button">skill<span class="term-definition" hidden>A skill is a reusable set of instructions that tells an AI coding tool how to complete a specialized task.</span></button> defines the curriculum and the build contract.</p>
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
    <header class="module-header animate-in"><span class="module-stage">Watch the exchange</span><span class="module-number" aria-hidden="true">02</span><h2 class="module-title">See the files work together</h2><p class="module-subtitle" data-claim-id="C-002">One browser file turns plain HTML patterns into consistent learning interactions.</p></header>
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
          <div class="arch-zone"><h4 class="arch-zone-label">Shared course files</h4><button class="arch-component" type="button"><span class="arch-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 4h12v16H6zM9 8h6M9 12h6M9 16h4"/></svg></span><span>SKILL.md</span><span class="arch-component-description" hidden>SKILL.md says what the course must teach and how it should feel.</span></button><button class="arch-component" type="button"><span class="arch-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14"/></svg></span><span>main.js</span><span class="arch-component-description" hidden>main.js supplies navigation, saved progress, accessible feedback, and exercise behavior.</span></button></div>
          <div class="arch-description">Choose a component to learn what it contributes.</div>
        </div>
      </details>
    </section>
  </div>
</section>`,
  `
<section class="module" id="module-3">
  <div class="module-content">
    <header class="module-header animate-in"><span class="module-stage">Trace the transformation</span><span class="module-number" aria-hidden="true">03</span><h2 class="module-title">Follow data and decisions</h2><p class="module-subtitle" data-claim-id="C-003">Visible history keeps every step available while the learner advances.</p></header>
    <section class="screen animate-in">
      <h3 class="screen-heading">Trace the build</h3>
      <p class="activity-instruction"><strong>Do this next:</strong> advance the trace to keep every transformation visible in order.</p>
      <div class="flow-animation">
        <ol class="flow-step-data" hidden><li class="flow-step" data-highlight="flow-m3-actor-1"><span class="flow-step-text">Find the first files used by the request</span></li><li class="flow-step" data-highlight="flow-m3-actor-2" data-packet="true" data-from="m3-actor-1" data-to="m3-actor-2"><span class="flow-step-text">Outline each lesson from the architecture</span></li><li class="flow-step" data-highlight="flow-m3-actor-3" data-packet="true" data-from="m3-actor-2" data-to="m3-actor-3"><span class="flow-step-text">Assemble and verify the course</span></li></ol>
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
    <header class="module-header animate-in"><span class="module-stage">Decide with confidence</span><span class="module-number" aria-hidden="true">04</span><h2 class="module-title">Prove the system holds</h2><p class="module-subtitle" data-claim-id="C-004">Use the same controls with mouse, keyboard, touch, and reduced motion.</p></header>
    <section class="screen animate-in">
      <h3 class="screen-heading">Make the file-level decision</h3>
      <p class="activity-instruction"><strong>Do this next:</strong> inspect the two lines. <code>JSON.parse</code> turns stored step text into a list; choose the line that could stop the walkthrough.</p>
      <div class="bug-challenge"><h3>Find the fragile line:</h3><div class="bug-code"><button class="bug-line" type="button" data-line="1" data-correct="false"><span class="line-num">1</span><code>const raw = response.text();</code><span class="bug-hint" hidden>This declaration is safe.</span></button><button class="bug-line bug-target" type="button" data-line="2" data-correct="true"><span class="line-num">2</span><code>const data = JSON.parse(raw);</code><span class="bug-explanation" hidden>Turning invalid text into data without recovery can stop the walkthrough. Wrap it and show a readable fallback.</span></button></div><div class="bug-feedback"></div></div>
      <details class="practice-extra">
        <summary>Optional · Choose the shared file</summary>
        <p class="activity-instruction"><strong>Do this next:</strong> answer one question about which file should provide shared keyboard behavior.</p>
        <div class="quiz-container" id="quiz-module4"><div class="quiz-question-block" data-correct="engine"><h4 class="quiz-question">Where should keyboard controls used in every lesson live?</h4><div class="quiz-options"><button class="quiz-option" type="button" data-value="module"><span class="quiz-option-radio" aria-hidden="true"></span><span>Inside one module</span></button><button class="quiz-option" type="button" data-value="engine"><span class="quiz-option-radio" aria-hidden="true"></span><span>Inside main.js</span></button></div><p class="quiz-explanation-right" hidden>The controls belong in the copied browser file so every generated course benefits.</p><p class="quiz-explanation-wrong" hidden>Module HTML should describe the exercise; main.js should provide those controls.</p><div class="quiz-feedback"></div></div><button class="quiz-check-btn" type="button">Check answer</button><button class="quiz-reset-btn" type="button">Try again</button></div>
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
  for (const file of ['styles.css', 'main.js', 'build.mjs']) await copyFile(join(referenceDir, file), join(fixtureRoot, file));

  const base = customize(await readFile(join(referenceDir, '_base.html'), 'utf8'));
  const footer = customize(await readFile(join(referenceDir, '_footer.html'), 'utf8'));
  await writeFile(join(fixtureRoot, '_base.html'), base);
  await writeFile(join(fixtureRoot, '_footer.html'), footer);
  await Promise.all(modules.map((module, index) => writeFile(join(moduleDir, `${String(index + 1).padStart(2, '0')}-module.html`), module)));
  await writeFile(join(moduleDir, '99-stale.html'), '<section class="module" id="module-1">{{STALE_UNLISTED_MODULE}}</section>');

  const sourceRevision = '0123456789abcdef0123456789abcdef01234567';
  const manifest = {
    schema_version: 1,
    generator: 'codebase-to-course',
    generator_version: '1.0.0',
    generator_revision: 'fixture-generator-revision',
    canonical_source: 'https://github.com/example/codebase-to-course',
    source_kind: 'github-clone',
    source_revision: sourceRevision,
    source_fingerprint: null,
    source_dirty: false,
    generated_at: '2026-08-05T12:00:00.000Z',
    repository_class: 'mixed',
    course_mode: 'compact',
    learner_assumptions: ['general programming knowledge', 'new to repository'],
    claim_ledger: 'evidence.json',
    repository_commands: 'not-run',
    browser_review: 'not-run',
    browser_review_reason: 'fixture is assembled before browser smoke',
    modules: moduleMetadata.map(([id, title], index) => ({
      file: `modules/${String(index + 1).padStart(2, '0')}-module.html`,
      id,
      title
    })),
    generated_files: [
      'course-manifest.json', 'evidence.json', 'styles.css', 'main.js', '_base.html', '_footer.html', 'build.mjs', 'index.html',
      ...moduleMetadata.map((_, index) => `modules/${String(index + 1).padStart(2, '0')}-module.html`)
    ]
  };
  const claimDefinitions = [
    ['C-001', 'The skill defines the curriculum and build contract.', 'SKILL.md', 1, 20],
    ['C-002', 'The shared runtime implements course interactions.', 'references/main.js', 1, 20],
    ['C-003', 'The builder assembles only manifest-listed modules.', 'references/build.mjs', 1, 20],
    ['C-004', 'The smoke test covers multiple input and viewport conditions.', 'scripts/browser-smoke.mjs', 1, 20]
  ];
  const evidence = {
    schema_version: 1,
    source_identity: sourceRevision,
    claims: claimDefinitions.map(([id, claim, path], index) => ({
      id,
      claim,
      status: 'verified',
      evidence_ids: [`E-${String(index + 1).padStart(3, '0')}`],
      display_citation: `${path}:1–20`
    })),
    evidence: claimDefinitions.map(([claimId, , path, lineStart, lineEnd], index) => ({
      id: `E-${String(index + 1).padStart(3, '0')}`,
      kind: 'source',
      path,
      line_start: lineStart,
      line_end: lineEnd,
      source_identity: sourceRevision,
      content_hash: String(index + 1).padStart(64, '0'),
      supports: [claimId]
    })),
    commands: []
  };
  await writeFile(join(fixtureRoot, 'evidence.json'), JSON.stringify(evidence, null, 2));
  await writeFile(join(fixtureRoot, 'course-manifest.json'), JSON.stringify(manifest, null, 2));

  const runBuild = () => spawnSync(process.execPath, ['build.mjs'], { cwd: fixtureRoot, encoding: 'utf8' });
  const build = runBuild();
  if (build.status !== 0) throw new Error((build.stderr || build.stdout || 'Build failed').trim());

  const index = await readFile(join(fixtureRoot, 'index.html'), 'utf8');
  const assertions = [
    [!/\{\{[A-Z][A-Z0-9_]*\}\}/.test(index), 'unresolved placeholders'],
    [(index.match(/class="module"/g) || []).length === 4, 'four assembled modules'],
    [(index.match(/class="nav-dot"/g) || []).length === 4, 'one nav control per module'],
    [index.includes('id="course-overview"') && index.includes('id="course-complete"'), 'authored opening and completion'],
    [index.includes('id="course-outline"') && index.includes('id="course-help"'), 'contents and help'],
    [index.includes('dnd-check-btn') && index.includes('data-correct="true"'), 'declarative interaction contracts'],
    [index.includes('Generated by <strong>codebase-to-course</strong> v1.0.0') && index.includes(`revision ${sourceRevision}`) && index.includes('Source tree: clean') && index.includes('Generated 2026-08-05T12:00:00.000Z'), 'visible provenance'],
    [index.includes('http-equiv="Content-Security-Policy"') && index.includes("script-src 'self'") && index.includes("object-src 'none'"), 'content security policy'],
    [!index.includes('fonts.googleapis.com') && !index.includes('fonts.gstatic.com') && index.includes("connect-src 'none'"), 'offline shell without remote font dependencies'],
    [!index.includes('STALE_UNLISTED_MODULE') && (index.match(/data-claim-id=/g) || []).length === evidence.claims.length, 'manifest-owned modules and claims']
  ];
  const failed = assertions.filter(([passed]) => !passed).map(([, label]) => label);
  if (failed.length) throw new Error(`Fixture assertions failed: ${failed.join(', ')}`);

  async function expectRejectedMutation(file, mutate, expectedMessage) {
    const path = join(fixtureRoot, file);
    const original = await readFile(path, 'utf8');
    try {
      await writeFile(path, mutate(original));
      const rejected = runBuild();
      if (rejected.status === 0 || !rejected.stderr.includes(expectedMessage)) {
        throw new Error(`Expected ${file} mutation to fail with "${expectedMessage}", got: ${(rejected.stderr || rejected.stdout).trim()}`);
      }
      if (await readFile(join(fixtureRoot, 'index.html'), 'utf8') !== index) {
        throw new Error(`Rejected ${file} mutation replaced the last valid index.html.`);
      }
    } finally {
      await writeFile(path, original);
    }
  }

  async function expectAcceptedMutation(file, mutate, expectedText) {
    const path = join(fixtureRoot, file);
    const original = await readFile(path, 'utf8');
    try {
      await writeFile(path, mutate(original));
      const accepted = runBuild();
      if (accepted.status !== 0) throw new Error(`Expected ${file} mutation to pass, got: ${(accepted.stderr || accepted.stdout).trim()}`);
      if (!(await readFile(join(fixtureRoot, 'index.html'), 'utf8')).includes(expectedText)) throw new Error(`Accepted ${file} mutation was not assembled.`);
    } finally {
      await writeFile(path, original);
      const restored = runBuild();
      if (restored.status !== 0) throw new Error(`Could not restore valid fixture after ${file} mutation: ${(restored.stderr || restored.stdout).trim()}`);
    }
  }

  await expectRejectedMutation('modules/01-module.html', source => `${source}\n{{UNRESOLVED_TEST_TOKEN}}`, 'unresolved placeholders');
  await expectRejectedMutation('modules/01-module.html', source => source.replace('id="module-1"', 'id="module-wrong"'), 'manifest expects "module-1"');
  await expectRejectedMutation('modules/01-module.html', source => source.replace('C-001', 'C-999'), 'unknown evidence claims');
  await expectRejectedMutation('_base.html', source => source.replace('data-target="module-1"', 'data-target="module-4"'), 'nav targets must exactly match');
  await expectRejectedMutation('_base.html', source => source.replace('data-tooltip="Module 1"', 'data-tooltip="Trace the first request"'), 'must use generic "Module N" labels');
  await expectRejectedMutation('modules/01-module.html', source => `${source}\n<div id="course-overview"></div>`, 'duplicate HTML ids');
  await expectRejectedMutation('modules/01-module.html', source => `${source}\n<script>alert(1)</script>`, 'forbidden <script>');
  await expectRejectedMutation('modules/01-module.html', source => `${source}\n<button onclick="alert(1)">Unsafe</button>`, 'forbidden inline event handler');
  await expectRejectedMutation('modules/01-module.html', source => `${source}\n<a href="javascript:alert(1)">Unsafe</a>`, 'forbidden javascript: URL');
  await expectAcceptedMutation('modules/01-module.html', source => `${source}\n<p>Never place a javascript: URL in a link.</p><pre><code>const src = "inert lesson text";</code></pre>`, 'const src = "inert lesson text";');
  await expectRejectedMutation('modules/01-module.html', source => `${source}\n<style>body{display:none}</style>`, 'forbidden <style>');
  await expectRejectedMutation('modules/01-module.html', source => `<html>${source}</html>`, 'forbidden <html>');
  await expectRejectedMutation('modules/01-module.html', source => `${source}\n<a href="https://example.com">Remote</a>`, 'non-local or unsafe href');
  await expectRejectedMutation('modules/01-module.html', source => `${source}\n<img src="data:image/png;base64,AA==">`, 'forbidden <img>');
  await expectRejectedMutation('modules/01-module.html', source => source.replace('data-claim-id="C-001"', 'data-steps="repository prose" data-claim-id="C-001"'), 'forbidden repository-text attribute');
  await expectRejectedMutation('course-manifest.json', source => JSON.stringify({ ...JSON.parse(source), generated_files: JSON.parse(source).generated_files.filter(file => file !== 'index.html') }, null, 2), 'must own "index.html"');
  await expectRejectedMutation('course-manifest.json', source => JSON.stringify({ ...JSON.parse(source), source_dirty: true }, null, 2), 'require an evidence snapshot source_fingerprint');
  await expectRejectedMutation('evidence.json', source => JSON.stringify({ ...JSON.parse(source), source_identity: 'mismatched-revision' }, null, 2), 'must match the manifest analysis identity');

  const badFlowPage = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="styles.css"><script src="main.js" defer></script></head><body><main><div class="flow-animation"><div class="flow-step-label">Loading walkthrough</div><div class="flow-controls"><button class="btn flow-next-btn" type="button">Next step</button><button class="btn flow-reset-btn" type="button">Restart</button><span class="flow-progress"></span></div></div></main></body></html>`;
  await writeFile(join(fixtureRoot, 'bad-flow.html'), badFlowPage);

  process.stdout.write(JSON.stringify({ fixtureRoot, build: build.stdout.trim() }) + '\n');
} catch (error) {
  await rm(fixtureRoot, { recursive: true, force: true });
  throw error;
}

if (process.env.KEEP_COURSE_FIXTURE !== '1') await rm(fixtureRoot, { recursive: true, force: true });
