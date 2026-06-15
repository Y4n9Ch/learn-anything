import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export default {
  paths() {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const topicsDir = join(__dirname, '..', '..', '..', 'topics');

    if (!existsSync(topicsDir)) return [];

    const paths = [];

    // List all topics from topics/
    const topicDirs = readdirSync(topicsDir, { withFileTypes: true }).filter(
      (d) => d.isDirectory() && existsSync(join(topicsDir, d.name, 'state.json')),
    );

    for (const topicDir of topicDirs) {
      const slug = topicDir.name;
      const statePath = join(topicsDir, slug, 'state.json');

      try {
        const raw = readFileSync(statePath, 'utf-8');
        const state = JSON.parse(raw);

        if (state.domains && Array.isArray(state.domains)) {
          for (const domain of state.domains) {
            if (domain.slug) {
              paths.push({ params: { slug, domain: domain.slug } });
            }
          }
        }
      } catch {
        // Skip malformed state.json
      }
    }

    return paths;
  },
};
