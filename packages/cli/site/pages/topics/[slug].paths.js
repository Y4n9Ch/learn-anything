import { readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export default {
  paths() {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const topicsDir = join(__dirname, '..', '..', 'topics');

    if (!existsSync(topicsDir)) return [];

    return readdirSync(topicsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(join(topicsDir, d.name, 'state.json')))
      .map((d) => ({ params: { slug: d.name } }));
  },
};
