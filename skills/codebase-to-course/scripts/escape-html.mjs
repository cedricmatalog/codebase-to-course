import { readFile } from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const entities = Object.freeze({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
});

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => entities[character]);
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    process.stdout.write('Usage: node escape-html.mjs [FILE|-]\nEscapes HTML text from FILE or stdin.\n');
    return;
  }
  if (args.length > 1) throw new Error('Expected at most one input file. Use - or omit FILE to read stdin.');
  const input = args[0] && args[0] !== '-' ? await readFile(resolve(args[0]), 'utf8') : await readStdin();
  process.stdout.write(escapeHtml(input));
}

const isCli = process.argv[1] && realpathSync(resolve(process.argv[1])) === realpathSync(fileURLToPath(import.meta.url));
if (isCli) {
  main().catch(error => {
    process.stderr.write(`escape-html: ${error.message}\n`);
    process.exitCode = 1;
  });
}
