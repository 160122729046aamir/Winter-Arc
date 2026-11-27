// Builds src/data/questionBank/index.json: a tiny per-day summary (counts + mix)
// so the app can show question counts and validate saved answers at startup
// without downloading all 970 questions. Day files are loaded only when a quiz opens.
// Runs automatically before `npm run dev` and `npm run build`.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'questionBank');
const index = {};

for (const file of readdirSync(dir).filter((f) => /^day_\d+\.json$/.test(f)).sort()) {
  const data = JSON.parse(readFileSync(join(dir, file), 'utf8'));
  const qs = Array.isArray(data.questions) ? data.questions : [];
  const count = (d) => qs.filter((q) => q.difficulty === d).length;
  index[data.day] = {
    title: data.title,
    total: qs.length,
    easy: count('easy'),
    medium: count('medium'),
    hard: count('hard'),
    topics: Array.isArray(data.topics) ? data.topics : [],
    ids: qs.map((q) => q.id)
  };
}

writeFileSync(join(dir, 'index.json'), JSON.stringify(index) + '\n');
console.log(`question index: ${Object.keys(index).length} days`);
