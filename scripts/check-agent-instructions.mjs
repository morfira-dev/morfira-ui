import { readFile } from 'node:fs/promises';

const canonicalFiles = ['AGENTS.md', 'SKILLS.md', 'SDD.md'];
const entrypoints = [
  'CLAUDE.md',
  'OPENCODE.md',
  'ZCODE.md',
  'GEMINI.md',
  '.github/copilot-instructions.md',
  '.cursor/rules/00-project.mdc',
  '.roo/rules/00-project.md',
  '.windsurfrules',
  '.clinerules',
];

const failures = [];

for (const file of canonicalFiles) {
  try {
    const content = await readFile(file, 'utf8');
    if (content.trim().length === 0) {
      failures.push(`${file} is empty`);
    }
  } catch {
    failures.push(`${file} is missing`);
  }
}

for (const entrypoint of entrypoints) {
  try {
    const content = await readFile(entrypoint, 'utf8');
    for (const canonicalFile of canonicalFiles) {
      if (!content.includes(canonicalFile)) {
        failures.push(`${entrypoint} does not reference ${canonicalFile}`);
      }
    }
  } catch {
    failures.push(`${entrypoint} is missing`);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Agent instruction entrypoints are linked to canonical files.');
}
