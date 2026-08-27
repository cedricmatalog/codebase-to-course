import { readFile } from 'node:fs/promises';
import { isAbsolute, join, resolve, sep } from 'node:path';
import { hashFileExcerpt } from './excerpt-hash.mjs';

function fail(message) {
  process.stderr.write(`Staleness check failed: ${message}\n`);
  process.exit(2);
}

const [courseArgument, repositoryArgument] = process.argv.slice(2);
if (!courseArgument || !repositoryArgument) {
  fail('usage: node check-staleness.mjs <course-directory> <repository-root>');
}
const courseRoot = resolve(courseArgument);
const repositoryRoot = resolve(repositoryArgument);

async function readJson(path, label) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    fail(`cannot read valid ${label} (${error.message}).`);
  }
}

const manifest = await readJson(join(courseRoot, 'course-manifest.json'), 'course-manifest.json');
if (manifest?.generator !== 'codebase-to-course') fail('that directory is not a codebase-to-course course.');
const ledgerName = typeof manifest.claim_ledger === 'string' ? manifest.claim_ledger : 'evidence.json';
const ledger = await readJson(join(courseRoot, ledgerName), ledgerName);
if (!Array.isArray(ledger?.evidence) || !Array.isArray(ledger?.claims)) fail('the evidence ledger has no claims or evidence arrays.');

const claimsFor = new Map(ledger.claims.map(claim => [claim.id, claim]));
const results = [];

for (const record of ledger.evidence) {
  const relative = String(record.path || '');
  if (!relative || isAbsolute(relative) || relative.includes('\\') || relative.split('/').some(piece => piece === '' || piece === '.' || piece === '..')) {
    results.push({ id: record.id, path: relative, state: 'unsafe-path' });
    continue;
  }
  const absolute = resolve(repositoryRoot, relative);
  if (!absolute.startsWith(`${repositoryRoot}${sep}`)) {
    results.push({ id: record.id, path: relative, state: 'unsafe-path' });
    continue;
  }
  try {
    const actual = await hashFileExcerpt(absolute, record.line_start, record.line_end);
    results.push({ id: record.id, path: relative, state: actual === record.content_hash ? 'current' : 'drifted', supports: record.supports || [] });
  } catch (error) {
    // A deleted file, a shortened file, or an out-of-range line range all mean
    // the cited evidence no longer exists as recorded.
    results.push({ id: record.id, path: relative, state: 'unresolvable', detail: error.message, supports: record.supports || [] });
  }
}

const stale = results.filter(result => result.state !== 'current');
const affectedClaims = new Set();
for (const result of stale) for (const claimId of result.supports || []) affectedClaims.add(claimId);

process.stdout.write(`Course:     ${courseRoot}\n`);
process.stdout.write(`Repository: ${repositoryRoot}\n`);
process.stdout.write(`Recorded revision: ${manifest.source_revision || 'none'}${manifest.source_fingerprint ? ` (evidence snapshot ${manifest.source_fingerprint})` : ''}\n`);
process.stdout.write(`Evidence records: ${results.length}, current: ${results.length - stale.length}, stale: ${stale.length}\n\n`);

for (const result of stale) {
  const reason = result.state === 'drifted' ? 'source bytes changed'
    : result.state === 'unsafe-path' ? 'evidence path is unsafe'
    : `cannot resolve (${result.detail})`;
  process.stdout.write(`${result.state.toUpperCase()} ${result.id} ${result.path} — ${reason}\n`);
  for (const claimId of result.supports || []) {
    const claim = claimsFor.get(claimId);
    process.stdout.write(`    affects ${claimId}: ${claim ? claim.claim : '(claim not in ledger)'}\n`);
  }
}

if (stale.length === 0) {
  process.stdout.write('Every cited excerpt still matches the repository. The course is current.\n');
  process.exitCode = 0;
} else {
  process.stdout.write(`\n${affectedClaims.size} claim(s) rest on evidence that no longer matches. Re-read those files, revise the claims, and rebuild the modules that carry them.\n`);
  process.exitCode = 1;
}
