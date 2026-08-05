import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
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
