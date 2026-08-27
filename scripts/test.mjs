import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { escapeHtml } from '../skills/codebase-to-course/scripts/escape-html.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const escapeScript = join(repoRoot, 'skills', 'codebase-to-course', 'scripts', 'escape-html.mjs');
const fingerprintScript = join(repoRoot, 'skills', 'codebase-to-course', 'scripts', 'fingerprint-evidence.mjs');
const scratchRoot = await mkdtemp(join(tmpdir(), 'codebase-course-tests.'));
let fixtureRoot;
let summary;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: repoRoot, encoding: 'utf8', ...options });
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || `exit ${result.status}`).trim();
    throw new Error(`${command} ${args.join(' ')} failed: ${detail}`);
  }
  return result.stdout;
}

try {
  const dangerous = `<script title="double" data-note='single'>& goodbye</script>`;
  const escaped = '&lt;script title=&quot;double&quot; data-note=&#39;single&#39;&gt;&amp; goodbye&lt;/script&gt;';
  assert.equal(escapeHtml(dangerous), escaped, 'escapeHtml did not encode all HTML text metacharacters.');

  const stdinResult = run(process.execPath, [escapeScript, '-'], { input: dangerous });
  assert.equal(stdinResult, escaped, 'escape-html stdin mode disagrees with its exported function.');

  const inputPath = join(scratchRoot, 'unsafe.txt');
  await writeFile(inputPath, dangerous);
  const fileResult = run(process.execPath, [escapeScript, inputPath]);
  assert.equal(fileResult, escaped, 'escape-html file mode disagrees with its exported function.');

  const evidenceRoot = join(scratchRoot, 'evidence-source');
  await mkdir(join(evidenceRoot, 'src'), { recursive: true });
  await writeFile(join(evidenceRoot, 'README.md'), 'entry evidence\n');
  await writeFile(join(evidenceRoot, 'src', 'flow.js'), 'export const flow = true;\n');
  const baseRevision = '0123456789abcdef0123456789abcdef01234567';
  const firstFingerprint = run(process.execPath, [fingerprintScript, evidenceRoot, baseRevision, 'src/flow.js', 'README.md']).trim();
  const reorderedFingerprint = run(process.execPath, [fingerprintScript, evidenceRoot, baseRevision, 'README.md', 'src/flow.js']).trim();
  assert.match(firstFingerprint, /^[0-9a-f]{64}$/, 'fingerprint helper did not emit a SHA-256 digest.');
  assert.equal(firstFingerprint, reorderedFingerprint, 'fingerprint helper depends on argument order.');
  await writeFile(join(evidenceRoot, 'src', 'flow.js'), 'export const flow = false;\n');
  const changedFingerprint = run(process.execPath, [fingerprintScript, evidenceRoot, baseRevision, 'README.md', 'src/flow.js']).trim();
  assert.notEqual(firstFingerprint, changedFingerprint, 'fingerprint helper did not detect changed evidence bytes.');
  const traversal = spawnSync(process.execPath, [fingerprintScript, evidenceRoot, baseRevision, '../outside.txt'], { cwd: repoRoot, encoding: 'utf8' });
  assert.notEqual(traversal.status, 0, 'fingerprint helper accepted a path traversal.');

  const evaluationDir = join(repoRoot, 'evaluations');
  const evaluationFiles = (await readdir(evaluationDir)).filter(file => file.endsWith('.json')).sort();
  assert.ok(evaluationFiles.length >= 3, 'the authoring guide asks for at least three skill evaluations.');
  for (const file of evaluationFiles) {
    const scenario = JSON.parse(await readFile(join(evaluationDir, file), 'utf8'));
    assert.ok(Array.isArray(scenario.skills) && scenario.skills.includes('codebase-to-course'), `${file} must name the skill under test.`);
    for (const field of ['source', 'query']) {
      assert.equal(typeof scenario[field], 'string', `${file} needs a ${field} string.`);
      assert.ok(scenario[field].trim() !== '', `${file} has an empty ${field}.`);
    }
    assert.ok(Array.isArray(scenario.expected_behavior) && scenario.expected_behavior.length >= 3, `${file} needs at least three graded expectations.`);
    for (const expectation of scenario.expected_behavior) {
      assert.equal(typeof expectation, 'string', `${file} expectations must be strings.`);
      assert.ok(expectation.trim() !== '', `${file} has an empty expectation.`);
    }
  }
  const hostileFixture = join(evaluationDir, 'fixtures', 'untrusted-repo');
  for (const required of ['README.md', 'AGENTS.md', '.env', '.env.example', 'package.json']) {
    await stat(join(hostileFixture, required));
  }
  await assert.rejects(stat(join(hostileFixture, 'EXECUTED.marker')), 'the hostile fixture recorded an executed repository command; a previous evaluation run breached the trust boundary.');

  const excerptScript = join(repoRoot, 'skills', 'codebase-to-course', 'scripts', 'excerpt-hash.mjs');
  const stalenessScript = join(repoRoot, 'skills', 'codebase-to-course', 'scripts', 'check-staleness.mjs');
  const staleRepo = join(scratchRoot, 'stale-source');
  const staleCourse = join(scratchRoot, 'stale-course');
  await mkdir(join(staleRepo, 'src'), { recursive: true });
  await mkdir(staleCourse, { recursive: true });
  const sourceFile = join(staleRepo, 'src', 'lib.js');
  await writeFile(sourceFile, 'export function a() {\n  return 1;\n}\n\nexport function b() {\n  return 2;\n}\n');
  const excerptHash = run(process.execPath, [excerptScript, sourceFile, '1', '3']).trim();
  assert.match(excerptHash, /^[0-9a-f]{64}$/, 'excerpt-hash did not emit a SHA-256 digest.');
  assert.equal(run(process.execPath, [excerptScript, sourceFile, '1', '3']).trim(), excerptHash, 'excerpt-hash is not deterministic.');
  assert.notEqual(run(process.execPath, [excerptScript, sourceFile, '5', '7']).trim(), excerptHash, 'excerpt-hash ignored the line range.');
  await writeFile(join(staleCourse, 'course-manifest.json'), JSON.stringify({ generator: 'codebase-to-course', claim_ledger: 'evidence.json', source_revision: baseRevision, source_fingerprint: null }));
  await writeFile(join(staleCourse, 'evidence.json'), JSON.stringify({
    schema_version: 1,
    claims: [{ id: 'C-001', claim: 'Function a returns one.' }],
    evidence: [{ id: 'E-001', kind: 'source', path: 'src/lib.js', line_start: 1, line_end: 3, content_hash: excerptHash, supports: ['C-001'] }]
  }));
  const currentCheck = spawnSync(process.execPath, [stalenessScript, staleCourse, staleRepo], { encoding: 'utf8' });
  assert.equal(currentCheck.status, 0, `staleness check failed on an unchanged repository: ${currentCheck.stdout}${currentCheck.stderr}`);
  assert.match(currentCheck.stdout, /The course is current/, 'staleness check did not report a current course.');
  await writeFile(sourceFile, 'export function a() {\n  return 42;\n}\n\nexport function b() {\n  return 2;\n}\n');
  const driftedCheck = spawnSync(process.execPath, [stalenessScript, staleCourse, staleRepo], { encoding: 'utf8' });
  assert.equal(driftedCheck.status, 1, 'staleness check did not fail after the source changed.');
  assert.match(driftedCheck.stdout, /DRIFTED E-001 src\/lib\.js/, 'staleness check did not name the drifted evidence record.');
  assert.match(driftedCheck.stdout, /affects C-001/, 'staleness check did not name the affected claim.');
  await rm(sourceFile);
  const missingCheck = spawnSync(process.execPath, [stalenessScript, staleCourse, staleRepo], { encoding: 'utf8' });
  assert.equal(missingCheck.status, 1, 'staleness check passed despite deleted evidence.');
  assert.match(missingCheck.stdout, /UNRESOLVABLE E-001/, 'staleness check did not flag deleted evidence as unresolvable.');

  const fixtureOutput = run(process.execPath, [join(repoRoot, 'scripts', 'verify-template.mjs')], {
    env: { ...process.env, KEEP_COURSE_FIXTURE: '1' }
  });
  const fixture = JSON.parse(fixtureOutput.trim());
  fixtureRoot = fixture.fixtureRoot;

  const browserOutput = run(process.execPath, [join(repoRoot, 'scripts', 'browser-smoke.mjs'), fixtureRoot]);
  const browser = JSON.parse(browserOutput);
  assert.equal(browser.file.protocol, 'file:', 'browser smoke did not exercise direct file launch.');
  assert.deepEqual(browser.desktop.pageErrors, [], 'desktop smoke reported page errors.');
  assert.deepEqual(browser.mobile.pageErrors, [], 'mobile smoke reported page errors.');
  assert.deepEqual(browser.file.pageErrors, [], 'file smoke reported page errors.');

  summary = {
    escapeHtml: 'passed (function, stdin, file)',
    evidenceFingerprint: 'passed (stable ordering, byte drift, path traversal)',
    stalenessCheck: 'passed (current, drifted, unresolvable)',
    builder: fixture.build,
    browser: {
      desktopModules: browser.desktop.modules,
      mobileWidth: browser.mobile.width,
      directFileProtocol: browser.file.protocol,
      recovery: browser.recovery.message
    },
  };
} finally {
  if (fixtureRoot) await rm(fixtureRoot, { recursive: true, force: true });
  await rm(scratchRoot, { recursive: true, force: true });
}

process.stdout.write(JSON.stringify({ ...summary, cleanup: 'complete' }, null, 2) + '\n');
