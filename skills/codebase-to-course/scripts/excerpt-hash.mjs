import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Excerpt bytes are the exact bytes from the first character of line_start
// through the last character of line_end, excluding the line terminator that
// ends line_end. Interior terminators are part of the excerpt. Authoring and
// staleness checking must use this one definition or no hash comparison means
// anything, which is why both go through this function.
export function excerptText(source, lineStart, lineEnd) {
  const lines = source.split('\n');
  if (!Number.isInteger(lineStart) || !Number.isInteger(lineEnd) || lineStart < 1 || lineEnd < lineStart) {
    throw new Error(`invalid line range ${lineStart}–${lineEnd}.`);
  }
  if (lineEnd > lines.length) throw new Error(`line ${lineEnd} is past the end of the file (${lines.length} lines).`);
  const selected = lines.slice(lineStart - 1, lineEnd);
  const last = selected.length - 1;
  if (selected[last].endsWith('\r')) selected[last] = selected[last].slice(0, -1);
  return selected.join('\n');
}

export function hashExcerpt(text) {
  return createHash('sha256').update(Buffer.from(text, 'utf8')).digest('hex');
}

export async function hashFileExcerpt(path, lineStart, lineEnd) {
  const source = await readFile(path, 'utf8');
  const text = lineStart === undefined ? source : excerptText(source, lineStart, lineEnd);
  return hashExcerpt(text);
}

async function main() {
  const [file, start, end] = process.argv.slice(2);
  if (!file || file === '--help') {
    process.stdout.write('Usage: node excerpt-hash.mjs <file> [line-start line-end]\nPrints the SHA-256 content_hash for an evidence record.\n');
    return;
  }
  const lineStart = start === undefined ? undefined : Number(start);
  const lineEnd = end === undefined ? undefined : Number(end);
  if ((lineStart === undefined) !== (lineEnd === undefined)) throw new Error('provide both line-start and line-end, or neither.');
  process.stdout.write(`${await hashFileExcerpt(resolve(file), lineStart, lineEnd)}\n`);
}

const isCli = process.argv[1] && realpathSync(resolve(process.argv[1])) === realpathSync(fileURLToPath(import.meta.url));
if (isCli) {
  main().catch(error => {
    process.stderr.write(`excerpt-hash: ${error.message}\n`);
    process.exitCode = 1;
  });
}
