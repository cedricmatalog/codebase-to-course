import { createHash } from 'node:crypto';
import { lstat, readFile, realpath } from 'node:fs/promises';
import { isAbsolute, resolve, sep } from 'node:path';

function fail(message) {
  process.stderr.write(`Fingerprint failed: ${message}\n`);
  process.exit(1);
}

const [rootArgument, baseRevision, ...fileArguments] = process.argv.slice(2);
if (!rootArgument || !baseRevision || fileArguments.length === 0) {
  fail('usage: node fingerprint-evidence.mjs <repository-root> <base-revision-or-none> <repo-relative-file>...');
}
if (baseRevision !== 'none' && !/^[0-9a-f]{40}(?:[0-9a-f]{24})?$/.test(baseRevision)) {
  fail('base revision must be "none" or a full lowercase Git object ID.');
}
if (new Set(fileArguments.map(file => file.toLocaleLowerCase('en-US'))).size !== fileArguments.length) {
  fail('evidence file arguments contain duplicates or cross-platform-colliding paths.');
}

let repositoryRoot;
try {
  repositoryRoot = await realpath(resolve(rootArgument));
} catch (error) {
  fail(`cannot resolve the repository root (${error.message}).`);
}

const files = [];
for (const argument of fileArguments) {
  if (isAbsolute(argument) || argument.includes('\\')) fail(`"${argument}" must be a POSIX-style repository-relative path.`);
  const pieces = argument.split('/');
  if (pieces.some(piece => piece === '' || piece === '.' || piece === '..')) fail(`"${argument}" contains an unsafe path segment.`);
  const absolute = resolve(repositoryRoot, argument);
  if (absolute === repositoryRoot || !absolute.startsWith(`${repositoryRoot}${sep}`)) fail(`"${argument}" escapes the repository root.`);
  let resolved;
  try {
    const details = await lstat(absolute);
    if (details.isSymbolicLink() || !details.isFile()) fail(`"${argument}" must be a regular file, not a directory or symbolic link.`);
    resolved = await realpath(absolute);
  } catch (error) {
    if (error.message.startsWith('"')) throw error;
    fail(`cannot read "${argument}" (${error.message}).`);
  }
  if (!resolved.startsWith(`${repositoryRoot}${sep}`)) fail(`"${argument}" resolves outside the repository root.`);
  files.push({ path: argument, absolute: resolved });
}

files.sort((left, right) => Buffer.compare(Buffer.from(left.path, 'utf8'), Buffer.from(right.path, 'utf8')));
const hash = createHash('sha256');
hash.update('codebase-to-course-evidence-snapshot-v1\0', 'utf8');
hash.update(baseRevision, 'utf8');
hash.update('\0', 'utf8');
for (const file of files) {
  const bytes = await readFile(file.absolute);
  hash.update(file.path, 'utf8');
  hash.update('\0', 'utf8');
  hash.update(String(bytes.byteLength), 'utf8');
  hash.update('\0', 'utf8');
  hash.update(bytes);
  hash.update('\0', 'utf8');
}

process.stdout.write(`${hash.digest('hex')}\n`);
