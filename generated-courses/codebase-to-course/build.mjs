import { lstat, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, normalize, resolve, sep } from 'node:path';

const courseRoot = process.cwd();
const manifestPath = join(courseRoot, 'course-manifest.json');
const unresolvedPattern = /\{\{[A-Z][A-Z0-9_]*\}\}/g;
const allowedClaimStatuses = new Set(['verified', 'inferred', 'unverified', 'undocumented']);
const allowedCommandStates = new Set(['documented', 'found-not-run', 'approved-not-run', 'executed-success', 'executed-failed', 'undocumented']);
const allowedSourceKinds = new Set(['local-git', 'github-clone', 'local-non-git']);
const allowedRepositoryClasses = new Set(['application', 'service', 'cli', 'library', 'infrastructure', 'data', 'mixed']);
const mandatoryGeneratedFiles = new Set([
  'course-manifest.json',
  'styles.css',
  'main.js',
  '_base.html',
  '_footer.html',
  'build.mjs',
  'index.html'
]);

function fail(message) {
  throw new Error(message);
}

function nonEmptyString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') fail(`${label} must be a non-empty string.`);
  return value.trim();
}

function stringArray(value, label, { allowEmpty = false } = {}) {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) {
    fail(`${label} must be ${allowEmpty ? 'an' : 'a non-empty'} array.`);
  }
  return value.map((item, index) => nonEmptyString(item, `${label}[${index}]`));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'is'));
  return match?.[2] ?? null;
}

function hasClass(tag, className) {
  return (attribute(tag, 'class') || '').split(/\s+/).includes(className);
}

// Collect opening tags the way a browser delimits them: quoted attribute values may
// contain ">" and must not truncate the tag, or every later attribute check is skipped.
// Returns opening tags only; comments, doctypes, and closing tags are not attribute carriers.
function openingTags(source, label) {
  const tags = [];
  let index = 0;
  while (index < source.length) {
    const start = source.indexOf('<', index);
    if (start === -1) break;
    if (source.startsWith('<!--', start)) {
      const end = source.indexOf('-->', start + 4);
      if (end === -1) fail(`${label} contains an unterminated HTML comment.`);
      index = end + 3;
      continue;
    }
    if (!/[A-Za-z/]/.test(source[start + 1] || '')) {
      index = start + 1;
      continue;
    }
    let cursor = start + 1;
    let quote = null;
    while (cursor < source.length) {
      const character = source[cursor];
      if (quote) {
        if (character === quote) quote = null;
      } else if (character === '"' || character === "'") {
        quote = character;
      } else if (character === '>') {
        break;
      }
      cursor += 1;
    }
    if (cursor >= source.length) fail(`${label} contains an unterminated tag or attribute value.`);
    const tag = source.slice(start, cursor + 1);
    if (!tag.startsWith('</')) tags.push(tag);
    index = cursor + 1;
  }
  return tags;
}

function attributeValues(tag) {
  return Array.from(tag.matchAll(/=\s*(["'])(.*?)\1/gs), match => match[2]);
}

function idsIn(tags) {
  return tags.map(tag => attribute(tag, 'id')).filter(value => value !== null);
}

function claimIdsIn(tags) {
  return tags.map(tag => attribute(tag, 'data-claim-id')).filter(value => value !== null);
}

function validateRelativeFile(file, label) {
  const value = nonEmptyString(file, label);
  if (isAbsolute(value) || value.includes('\\')) fail(`${label} must be a POSIX-style relative path.`);
  const pieces = value.split('/');
  if (pieces.some(piece => piece === '' || piece === '.' || piece === '..')) fail(`${label} contains an unsafe path segment.`);
  const normalized = normalize(value);
  const absolute = resolve(courseRoot, normalized);
  if (absolute === courseRoot || !absolute.startsWith(`${courseRoot}${sep}`)) fail(`${label} escapes the course root.`);
  return { file: normalized.split(sep).join('/'), absolute };
}

function validateRelativeModulePath(file, index) {
  const label = `manifest.modules[${index}].file`;
  const path = validateRelativeFile(file, label);
  if (!path.file.startsWith('modules/') || !path.file.endsWith('.html')) {
    fail(`${label} must name an HTML file inside modules/.`);
  }
  return path;
}

function sourceIdentity(manifest) {
  return manifest.source_fingerprint || manifest.source_revision;
}

function provenanceRevision(manifest) {
  if (!manifest.source_revision) return `non-Git snapshot ${manifest.source_fingerprint}`;
  if (manifest.source_fingerprint) return `${manifest.source_revision} (evidence snapshot ${manifest.source_fingerprint})`;
  return manifest.source_revision;
}

function replaceManifestProvenance(source, manifest) {
  const dirtyState = manifest.source_dirty === true ? 'dirty' : manifest.source_dirty === false ? 'clean' : 'unknown';
  const replacements = new Map([
    ['{{GENERATOR_MARKER}}', escapeHtml(manifest.generator)],
    ['{{PROVENANCE_SOURCE}}', escapeHtml(manifest.canonical_source)],
    ['{{PROVENANCE_REVISION}}', escapeHtml(provenanceRevision(manifest))],
    ['{{PROVENANCE_DIRTY_STATE}}', dirtyState],
    ['{{PROVENANCE_GENERATED_AT}}', escapeHtml(manifest.generated_at)],
    ['{{GENERATOR_VERSION}}', escapeHtml(manifest.generator_version)],
    ['{{GENERATOR_REVISION}}', escapeHtml(manifest.generator_revision)]
  ]);
  let output = source;
  for (const [token, value] of replacements) output = output.replaceAll(token, value);
  return output;
}

async function readJson(path, label) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    fail(`cannot read valid ${label} (${error.message}).`);
  }
}

async function replaceFileAtomically(temporary, destination) {
  try {
    await rename(temporary, destination);
    return;
  } catch (error) {
    if (!['EEXIST', 'EPERM', 'EACCES'].includes(error.code)) throw error;
  }

  const backup = join(dirname(destination), `.index.html.${process.pid}.${Date.now()}.bak`);
  let movedExisting = false;
  try {
    try {
      await rename(destination, backup);
      movedExisting = true;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    await rename(temporary, destination);
    if (movedExisting) await rm(backup, { force: true });
  } catch (error) {
    if (movedExisting) {
      await rm(destination, { force: true });
      await rename(backup, destination);
    }
    throw error;
  }
}

function validateManifest(manifest) {
  if (manifest?.schema_version !== 1) fail('manifest.schema_version must be 1.');
  manifest.generator = nonEmptyString(manifest.generator, 'manifest.generator');
  if (manifest.generator !== 'codebase-to-course') fail('manifest.generator must be "codebase-to-course".');
  manifest.generator_version = nonEmptyString(manifest.generator_version, 'manifest.generator_version');
  manifest.generator_revision = nonEmptyString(manifest.generator_revision, 'manifest.generator_revision');
  manifest.canonical_source = nonEmptyString(manifest.canonical_source, 'manifest.canonical_source');
  if (!allowedSourceKinds.has(manifest.source_kind)) fail(`manifest.source_kind has invalid value "${manifest.source_kind}".`);
  if (manifest.source_kind === 'github-clone' && !/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?$/.test(manifest.canonical_source)) {
    fail('manifest.canonical_source must be a canonical HTTPS GitHub repository URL for github-clone sources.');
  }
  if (manifest.source_kind.startsWith('local-') && !isAbsolute(manifest.canonical_source)) {
    fail('manifest.canonical_source must be an absolute canonical path for local sources.');
  }

  const hasRevision = typeof manifest.source_revision === 'string' && manifest.source_revision !== '';
  const hasFingerprint = typeof manifest.source_fingerprint === 'string' && manifest.source_fingerprint !== '';
  if (![true, false, 'unknown'].includes(manifest.source_dirty)) fail('manifest.source_dirty must be true, false, or "unknown".');
  if (manifest.source_kind === 'local-non-git') {
    if (!hasFingerprint || manifest.source_revision !== null) fail('non-Git sources require source_fingerprint and source_revision: null.');
    if (!/^[0-9a-f]{64}$/.test(manifest.source_fingerprint)) fail('manifest.source_fingerprint must be a lowercase SHA-256 hex digest.');
  } else {
    if (!hasRevision) fail('Git sources require source_revision.');
    if (!/^[0-9a-f]{40}(?:[0-9a-f]{24})?$/.test(manifest.source_revision)) fail('manifest.source_revision must be a full lowercase Git object ID.');
    if (manifest.source_dirty === false && manifest.source_fingerprint !== null) fail('clean Git sources require source_fingerprint: null.');
    if (manifest.source_dirty !== false && !hasFingerprint) fail('dirty or unknown Git sources require an evidence snapshot source_fingerprint.');
    if (hasFingerprint && !/^[0-9a-f]{64}$/.test(manifest.source_fingerprint)) fail('manifest.source_fingerprint must be a lowercase SHA-256 hex digest.');
  }
  manifest.generated_at = nonEmptyString(manifest.generated_at, 'manifest.generated_at');
  if (Number.isNaN(Date.parse(manifest.generated_at)) || !manifest.generated_at.endsWith('Z')) fail('manifest.generated_at must be an ISO 8601 UTC timestamp ending in Z.');
  if (!allowedRepositoryClasses.has(manifest.repository_class)) fail(`manifest.repository_class has invalid value "${manifest.repository_class}".`);
  if (manifest.course_mode !== 'full') fail('manifest.course_mode must be "full"; this generator produces one course shape.');
  manifest.learner_assumptions = stringArray(manifest.learner_assumptions, 'manifest.learner_assumptions');
  manifest.coverage_gaps = stringArray(manifest.coverage_gaps, 'manifest.coverage_gaps', { allowEmpty: true });
  manifest.repository_commands = nonEmptyString(manifest.repository_commands, 'manifest.repository_commands');
  manifest.browser_review = nonEmptyString(manifest.browser_review, 'manifest.browser_review');
  if (manifest.browser_review === 'not-run') nonEmptyString(manifest.browser_review_reason, 'manifest.browser_review_reason');

  const ledgerPath = validateRelativeFile(manifest.claim_ledger, 'manifest.claim_ledger');
  manifest.claim_ledger = ledgerPath.file;
  if (!Array.isArray(manifest.modules) || manifest.modules.length === 0) fail('manifest.modules must list at least one module.');
  const generatedFiles = stringArray(manifest.generated_files, 'manifest.generated_files').map((file, index) => validateRelativeFile(file, `manifest.generated_files[${index}]`).file);
  if (new Set(generatedFiles.map(file => file.toLocaleLowerCase('en-US'))).size !== generatedFiles.length) fail('manifest.generated_files contains duplicate or cross-platform-colliding paths.');
  const generatedSet = new Set(generatedFiles);
  for (const file of [...mandatoryGeneratedFiles, ledgerPath.file]) {
    if (!generatedSet.has(file)) fail(`manifest.generated_files must own "${file}".`);
  }
  return { ledgerPath, generatedFiles, generatedSet };
}

function validateEvidenceLedger(ledger, manifest) {
  if (ledger?.schema_version !== 1) fail('evidence.schema_version must be 1.');
  const identity = sourceIdentity(manifest);
  if (nonEmptyString(ledger.source_identity, 'evidence.source_identity') !== identity) {
    fail('evidence.source_identity must match the manifest analysis identity.');
  }
  if (!Array.isArray(ledger.claims) || ledger.claims.length === 0) fail('evidence.claims must list at least one source claim.');
  if (!Array.isArray(ledger.evidence) || ledger.evidence.length === 0) fail('evidence.evidence must list at least one evidence record.');
  if (!Array.isArray(ledger.commands)) fail('evidence.commands must be an array.');

  const claims = new Map();
  for (const [index, claim] of ledger.claims.entries()) {
    if (!claim || typeof claim !== 'object') fail(`evidence.claims[${index}] must be an object.`);
    const id = nonEmptyString(claim.id, `evidence.claims[${index}].id`);
    if (!/^C-[0-9]{3,}$/.test(id)) fail(`claim id "${id}" must match C-001 style.`);
    if (claims.has(id)) fail(`duplicate claim id "${id}".`);
    nonEmptyString(claim.claim, `claim "${id}" text`);
    if (!allowedClaimStatuses.has(claim.status)) fail(`claim "${id}" has invalid status "${claim.status}".`);
    claim.evidence_ids = stringArray(claim.evidence_ids, `claim "${id}" evidence_ids`, { allowEmpty: true });
    if (['verified', 'inferred'].includes(claim.status) && claim.evidence_ids.length === 0) fail(`claim "${id}" requires evidence.`);
    nonEmptyString(claim.display_citation, `claim "${id}" display_citation`);
    claims.set(id, claim);
  }

  const evidence = new Map();
  for (const [index, record] of ledger.evidence.entries()) {
    if (!record || typeof record !== 'object') fail(`evidence.evidence[${index}] must be an object.`);
    const id = nonEmptyString(record.id, `evidence.evidence[${index}].id`);
    if (!/^E-[0-9]{3,}$/.test(id)) fail(`evidence id "${id}" must match E-001 style.`);
    if (evidence.has(id)) fail(`duplicate evidence id "${id}".`);
    nonEmptyString(record.kind, `evidence "${id}" kind`);
    const evidencePath = nonEmptyString(record.path, `evidence "${id}" path`);
    if (isAbsolute(evidencePath) || evidencePath.includes('\\') || evidencePath.split('/').some(piece => piece === '' || piece === '.' || piece === '..')) {
      fail(`evidence "${id}" path must be a safe repository-relative POSIX path.`);
    }
    if (nonEmptyString(record.source_identity, `evidence "${id}" source_identity`) !== identity) fail(`evidence "${id}" source_identity does not match the manifest analysis identity.`);
    if (!/^[0-9a-f]{64}$/.test(nonEmptyString(record.content_hash, `evidence "${id}" content_hash`))) fail(`evidence "${id}" content_hash must be a lowercase SHA-256 hex digest.`);
    record.supports = stringArray(record.supports, `evidence "${id}" supports`);
    if ((record.line_start === undefined) !== (record.line_end === undefined)) fail(`evidence "${id}" must provide both line_start and line_end or neither.`);
    if (record.line_start !== undefined && (!Number.isInteger(record.line_start) || !Number.isInteger(record.line_end) || record.line_start < 1 || record.line_end < record.line_start)) {
      fail(`evidence "${id}" has an invalid line range.`);
    }
    evidence.set(id, record);
  }

  for (const [id, claim] of claims) {
    for (const evidenceId of claim.evidence_ids) {
      if (!evidence.has(evidenceId)) fail(`claim "${id}" references unknown evidence "${evidenceId}".`);
    }
  }
  for (const [id, record] of evidence) {
    for (const claimId of record.supports) {
      if (!claims.has(claimId)) fail(`evidence "${id}" supports unknown claim "${claimId}".`);
      if (!claims.get(claimId).evidence_ids.includes(id)) fail(`evidence "${id}" and claim "${claimId}" must reference each other.`);
    }
  }

  const commandIds = new Set();
  for (const [index, command] of ledger.commands.entries()) {
    if (!command || typeof command !== 'object') fail(`evidence.commands[${index}] must be an object.`);
    const id = nonEmptyString(command.id, `evidence.commands[${index}].id`);
    if (!/^CMD-[0-9]{3,}$/.test(id)) fail(`command id "${id}" must match CMD-001 style.`);
    if (commandIds.has(id)) fail(`duplicate command id "${id}".`);
    commandIds.add(id);
    nonEmptyString(command.command, `command "${id}" command`);
    if (!allowedCommandStates.has(command.state)) fail(`command "${id}" has invalid state "${command.state}".`);
    nonEmptyString(command.approval, `command "${id}" approval`);
    for (const evidenceId of stringArray(command.defined_by, `command "${id}" defined_by`, { allowEmpty: true })) {
      if (!evidence.has(evidenceId)) fail(`command "${id}" references unknown definition evidence "${evidenceId}".`);
    }
    for (const evidenceId of stringArray(command.result_evidence, `command "${id}" result_evidence`, { allowEmpty: true })) {
      if (!evidence.has(evidenceId)) fail(`command "${id}" references unknown result evidence "${evidenceId}".`);
    }
  }

  return claims;
}

async function validateOwnedFiles(generatedFiles) {
  for (const file of generatedFiles) {
    if (file === 'index.html') continue;
    try {
      const details = await lstat(resolve(courseRoot, file));
      if (details.isSymbolicLink() || !details.isFile()) fail(`manifest-owned path "${file}" must be a regular file, not a directory or symbolic link.`);
    } catch (error) {
      if (error.message.startsWith('manifest-owned')) throw error;
      fail(`manifest-owned file "${file}" is missing or unreadable.`);
    }
  }
}

async function build() {
  try {
    const details = await lstat(manifestPath);
    if (details.isSymbolicLink() || !details.isFile()) fail('course-manifest.json must be a regular file, not a directory or symbolic link.');
  } catch (error) {
    if (error.message.startsWith('course-manifest')) throw error;
    fail('course-manifest.json is missing or unreadable.');
  }
  const manifest = await readJson(manifestPath, 'course-manifest.json');
  const { ledgerPath, generatedFiles, generatedSet } = validateManifest(manifest);
  await validateOwnedFiles(generatedFiles);
  const ledger = await readJson(ledgerPath.absolute, manifest.claim_ledger);
  const ledgerClaims = validateEvidenceLedger(ledger, manifest);

  const listedFiles = new Set();
  const listedIds = new Set();
  const modules = [];
  for (const [index, module] of manifest.modules.entries()) {
    if (!module || typeof module !== 'object') fail(`manifest.modules[${index}] must be an object.`);
    const id = nonEmptyString(module.id, `manifest.modules[${index}].id`);
    const title = nonEmptyString(module.title, `manifest.modules[${index}].title`);
    if (!/^module-[a-z0-9-]+$/.test(id)) fail(`module id "${id}" must begin with module-.`);
    if (listedIds.has(id)) fail(`duplicate manifest module id "${id}".`);
    const path = validateRelativeModulePath(module.file, index);
    if (listedFiles.has(path.file)) fail(`duplicate manifest module file "${path.file}".`);
    if (!generatedSet.has(path.file)) fail(`manifest.generated_files must own listed module "${path.file}".`);
    listedIds.add(id);
    listedFiles.add(path.file);
    let source;
    try {
      source = await readFile(path.absolute, 'utf8');
    } catch (error) {
      fail(`cannot read listed module ${path.file} (${error.message}).`);
    }
    const forbiddenTag = source.match(/<\/?\s*(html|head|body|style|script|iframe|object|embed|base|meta|link|img|audio|video|source|track|form)\b/i);
    if (forbiddenTag) fail(`${path.file} contains forbidden <${forbiddenTag[1].toLowerCase()}> markup.`);
    const tags = openingTags(source, path.file);
    for (const tag of tags) {
      if (attributeValues(tag).some(value => /[<>]/.test(value))) {
        fail(`${path.file} contains an unescaped < or > inside an attribute value. Repository content belongs in escaped text nodes.`);
      }
    }
    const openingMarkup = tags.join('\n');
    const eventHandler = openingMarkup.match(/\son[a-z0-9_-]+\s*=/i);
    if (eventHandler) fail(`${path.file} contains a forbidden inline event handler (${eventHandler[0].trim()}).`);
    const repositoryTextAttribute = openingMarkup.match(/\bdata-(definition|desc|description|hint|explanation(?:-right|-wrong)?|stage|steps)\s*=/i);
    if (repositoryTextAttribute) fail(`${path.file} contains forbidden repository-text attribute ${repositoryTextAttribute[0].replace(/\s*=.*/, '')}. Put explanatory text in the documented hidden text node instead.`);
    const externalResourceAttribute = openingMarkup.match(/\b(src|srcset|action|formaction)\s*=/i);
    if (externalResourceAttribute) fail(`${path.file} contains forbidden resource or submission attribute ${externalResourceAttribute[1].toLowerCase()}.`);
    for (const match of openingMarkup.matchAll(/\bhref\s*=\s*(["'])(.*?)\1/gi)) {
      if (/^\s*javascript\s*:/i.test(match[2])) fail(`${path.file} contains a forbidden javascript: URL.`);
      if (!/^#[a-z][a-z0-9-]*$/.test(match[2])) fail(`${path.file} contains a non-local or unsafe href value.`);
    }
    const moduleTags = tags.filter(tag => /^<section\b/i.test(tag) && hasClass(tag, 'module'));
    if (moduleTags.length !== 1) fail(`${path.file} must contain exactly one section.module opening tag.`);
    const actualId = attribute(moduleTags[0], 'id');
    if (actualId !== id) fail(`${path.file} declares module id "${actualId || '(missing)'}"; manifest expects "${id}".`);
    modules.push({ id, title, file: path.file, source });
  }

  let base = await readFile(join(courseRoot, '_base.html'), 'utf8');
  let footer = await readFile(join(courseRoot, '_footer.html'), 'utf8');
  base = replaceManifestProvenance(base, manifest);
  footer = replaceManifestProvenance(footer, manifest);

  const sources = [['_base.html', base], ...modules.map(module => [module.file, module.source]), ['_footer.html', footer]];
  for (const [file, source] of sources) {
    const tokens = [...new Set(source.match(unresolvedPattern) || [])];
    if (tokens.length) fail(`${file} contains unresolved placeholders: ${tokens.join(', ')}.`);
  }

  const navTags = openingTags(base, '_base.html').filter(tag => /^<button\b/i.test(tag) && hasClass(tag, 'nav-dot'));
  const navTargets = navTags.map(tag => attribute(tag, 'data-target'));
  const expectedTargets = modules.map(module => module.id);
  if (navTargets.length !== expectedTargets.length || navTargets.some((target, index) => target !== expectedTargets[index])) {
    fail(`nav targets must exactly match manifest module order (${expectedTargets.join(', ')}); found ${navTargets.join(', ') || '(none)'}.`);
  }
  const unsafeNavLabel = navTags.find((tag, index) => attribute(tag, 'data-tooltip') !== `Module ${index + 1}` || attribute(tag, 'aria-label') !== `Module ${index + 1}`);
  if (unsafeNavLabel) fail('nav data-tooltip and aria-label values must use generic "Module N" labels; keep module titles in text nodes.');

  const assembled = [base, ...modules.map(module => module.source), footer].join('');
  const assembledTags = openingTags(assembled, 'index.html');
  const ids = idsIn(assembledTags);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicateIds.length) fail(`duplicate HTML ids: ${duplicateIds.join(', ')}.`);

  const usedClaims = new Set(claimIdsIn(assembledTags));
  const unknownClaims = [...usedClaims].filter(id => !ledgerClaims.has(id));
  if (unknownClaims.length) fail(`HTML references unknown evidence claims: ${unknownClaims.join(', ')}.`);
  const unusedClaims = [...ledgerClaims.keys()].filter(id => !usedClaims.has(id));
  if (unusedClaims.length) fail(`evidence claims are not referenced by HTML: ${unusedClaims.join(', ')}.`);

  const destination = join(courseRoot, 'index.html');
  const temporary = join(dirname(destination), `.index.html.${process.pid}.${Date.now()}.tmp`);
  try {
    await writeFile(temporary, assembled, { encoding: 'utf8', flag: 'wx' });
    await replaceFileAtomically(temporary, destination);
  } finally {
    await rm(temporary, { force: true });
  }

  process.stdout.write(`Built index.html with ${modules.length} manifest-owned modules and ${ledgerClaims.size} evidence-linked claims — open it in your browser.\n`);
}

build().catch(error => {
  process.stderr.write(`Build failed: ${error.message}\n`);
  process.exitCode = 1;
});
