#!/usr/bin/env node
/**
 * The repository's test entry point.
 *
 *   npm test                      runs every test
 *   npm test -- --ac <story>#<n>  runs only the tests tagged [<story>#<n>] and
 *                                 prints "AC <id> passed" only if at least one
 *                                 ran and every one passed
 *
 * The per-criterion form is what epics/<id>/artifacts/dod.md declares. It
 * counts the tagged tests itself, from Vitest's JSON report, so a misspelt tag
 * or a deleted test fails the check instead of passing it vacuously, and no
 * helper file the runner happens to discover can inflate the count.
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const vitest = join(root, 'node_modules', '.bin', 'vitest');
const args = process.argv.slice(2);
const acIndex = args.indexOf('--ac');

if (acIndex < 0) {
  const run = spawnSync(vitest, ['run', ...args], { cwd: root, stdio: 'inherit' });
  process.exit(run.status ?? 1);
}

const id = args[acIndex + 1];
if (!id || !/^story-\d{2}-\d{2}#\d+$/.test(id)) {
  console.error(`--ac needs a criterion id such as story-01-01#1, not "${id ?? ''}"`);
  process.exit(2);
}
const tag = `[${id}]`;
const pattern = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const report = join(mkdtempSync(join(tmpdir(), 'bow-ac-')), 'report.json');
const run = spawnSync(vitest, ['run', '-t', pattern, '--reporter=json', `--outputFile=${report}`], {
  cwd: root,
  stdio: ['ignore', 'ignore', 'inherit'],
});

let results;
try {
  results = JSON.parse(readFileSync(report, 'utf8'));
} catch {
  console.error(`AC ${id}: Vitest produced no report (exit ${run.status}).`);
  process.exit(1);
}
const tagged = results.testResults.flatMap((file) =>
  file.assertionResults.filter((t) => t.fullName.includes(tag)).map((t) => ({ ...t, file: file.name })),
);
const passed = tagged.filter((t) => t.status === 'passed');
const notPassed = tagged.filter((t) => t.status !== 'passed');

for (const t of tagged) console.log(`  ${t.status === 'passed' ? '✓' : '✗'} ${t.fullName}`);
for (const t of notPassed) {
  for (const message of t.failureMessages ?? []) console.log(`\n    ${message.split('\n').slice(0, 8).join('\n    ')}`);
}
if (tagged.length === 0) {
  console.log(`AC ${id}: no test is tagged ${tag}, so nothing proves it.`);
  process.exit(1);
}
if (notPassed.length > 0 || run.status !== 0) {
  console.log(`AC ${id}: ${passed.length} of ${tagged.length} tagged tests passed.`);
  process.exit(1);
}
console.log(`AC ${id} passed (${passed.length} tagged ${passed.length === 1 ? 'test' : 'tests'})`);
