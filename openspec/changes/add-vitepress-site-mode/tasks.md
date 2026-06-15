## 1. Build script for site file bundling

- [x] 1.1 Create `packages/cli/scripts/bundle-site.mjs` — Node.js ESM script that scans `packages/cli/site/`, reads all files (excluding `node_modules/`, `topics/`, `.vitepress/cache/`, `.vitepress/dist/`, `package-lock.json`), and generates `packages/cli/src/site/files.ts` as `export const SITE_FILES: Record<string, string> = {...}`
- [x] 1.2 Handle TypeScript string escaping in generated output — properly escape backticks, `${` template literals, backslashes, and other special characters in file content
- [x] 1.3 Integrate `bundle-site.mjs` into `packages/cli/package.json` build script — runs before `tsc` compilation via `"build": "node scripts/bundle-site.mjs && tsc"`, plus separate `"site:bundle"` script
- [x] 1.4 Unit test `bundle-site.mjs` — verify all expected files are included, excluded paths are absent, string escaping is correct (23 tests in `test/bundle-site.test.ts`)

## 2. VitePress dev project scaffold

- [x] 2.1 Create `packages/cli/site/package.json` with `vitepress ^1.6.4` and `vue ^3.5.38` dependencies
- [x] 2.2 Create `packages/cli/site/.gitignore` with `node_modules`, `.vitepress/cache`, `.vitepress/dist`
- [x] 2.3 Create `packages/cli/site/.vitepress/config.mts` — `defineConfig` with `srcDir: '../pages'`, `outDir`/`cacheDir` under `.vitepress/`, Vite alias `@data` → `../topics`
- [x] 2.4 Create `packages/cli/site/.vitepress/theme/index.ts` — extends DefaultTheme, imports custom.css, placeholder `enhanceApp` for component registration
- [x] 2.5 Create `packages/cli/site/.vitepress/theme/styles/custom.css` — CSS variables (colors, card, sidebar), card grid layout, progress bar, status icon colors, two-column layouts, tab styles, exercise groups, language switch, empty states

## 3. Route pages and dynamic paths

- [x] 3.1 Create `packages/cli/site/pages/index.md` — thin Markdown stub with `layout: home` that renders `<Dashboard />` component
- [x] 3.2 Create `packages/cli/site/pages/topics/[slug].md` — thin stub that renders `<TopicPage :slug="$params.slug" />` using VitePress `$params` global
- [x] 3.3 Create `packages/cli/site/pages/topics/[slug].paths.js` — dynamic path loader using `import.meta.url` + `readdirSync` that scans `../../topics/` for subdirectories containing `state.json` and returns `{ params: { slug } }` for each
- [x] 3.4 Create `packages/cli/site/pages/topics/[slug]/[domain].md` — thin stub that renders `<DomainPage :slug="$params.slug" :domain="$params.domain" />`
- [x] 3.5 Create `packages/cli/site/pages/topics/[slug]/[domain].paths.js` — dynamic path loader that reads all topic `state.json` files and returns `{ params: { slug, domain } }` for every domain entry (uses state.json as authoritative source rather than scanning sessions/, so domains without sessions still have pages)

## 4. Composables

- [x] 4.1 Create `packages/cli/site/.vitepress/theme/composables/useI18n.ts` — singleton locale ref from localStorage, `t(key)` with full EN/zh-CN message tables (17 keys), `toggleLocale()` + `setLocale()` helpers. Status labels use `inProgress` camelCase internally, mapped to display text.
- [x] 4.2 Create `packages/cli/site/.vitepress/theme/composables/useTopicData.ts` — uses Vite `import.meta.glob` (eager) for build-time file resolution. `listAllTopics()` scans `/topics/*/state.json`, `loadTopic(slug)` looks up from glob map, `scanSessions(slug, domain)` filters `/topics/*/sessions/*/*.md` raw strings + provides lazy Vue component loaders, `scanExercises(slug)` groups `/topics/*/exercises/**/*` by concept slug matching state.json domains, `loadKnowledgeMap(slug)`, `loadMarkdown(path)`, `loadExerciseContent(path)`

## 5. Vue components — Dashboard and TopicCard

- [x] 5.1 Create `Dashboard.vue` — calls `listAllTopics()`, renders `<TopicCard>` grid, empty state with localized icon + message + hint, page title via `useI18n().t('dashboard.title')`
- [x] 5.2 Create `TopicCard.vue` — props: `slug`, `name`, `domainCount`, `totalConcepts`, `masteredCount`, `percentage`. Card with name, domain/concept stats, ProgressBar, mastery label. Click navigates via `router.go()`.
- [x] 5.3 Create `ProgressBar.vue` — props: `value` (0-100), `label` (optional). Animated fill bar with `aria-*` accessibility attributes. Green gradient when 100%.
- [x] 5.4 Create `StatusIcon.vue` — props: `status` (`ConceptStatus` type). Colored circle: green (mastered), yellow (in_progress), orange (needs_practice), gray outline (unexplored).

## 6. Vue components — TopicPage

- [x] 6.1 Create `TopicPage.vue` — props: `slug`. Renders from state.json directly (not raw markdown) for full click control. Left sidebar: domain list as clickable links with active state detection. Right content: topic name, progress summary, domain headings (clickable, navigates to domain page), concept items with StatusIcon + details (NOT clickable). All labels via `useI18n()`.

## 7. Vue components — DomainPage, SessionNotes, ExerciseView

- [x] 7.1 Create `DomainPage.vue` — props: `slug`, `domain`. Two-tab layout (Notes default, Exercises), labels via `useI18n()`. Back link to topic page via `router.go()`. Renders `<SessionNotes>` or `<ExerciseView>` based on active tab.
- [x] 7.2 Create `SessionNotes.vue` — props: `slug`, `domain`. `scanSessions()` for file list. Two-column: left file list (date descending), right `pre` block with raw markdown (`white-space: pre-wrap`). First file auto-selected via `watch`. Empty state icon + message.
- [x] 7.3 Create `ExerciseView.vue` — props: `slug`, `domain`. `scanExercises()` grouped by concept, expandable concept cards showing file list. Click a file to view its raw content in right panel code block. Empty state icon + message.

## 8. Language switch component

- [x] 8.1 Create `LanguageSwitch.vue` + `Layout.vue` — LanguageSwitch: toggle button using `useI18n()`, shows opposite language label. Layout extends DefaultTheme via `#nav-bar-content-after` slot, inserting LanguageSwitch into the navbar. Both registered in `theme/index.ts` with `Layout` replacing VitePress default.

## 9. Dev fixtures for testing the site locally

- [x] 9.1 Copy sample `state.json` and `knowledge-map.md` to `packages/cli/site/topics/javascript/` from the repo's `.learn/topics/javascript/`
- [x] 9.2 Create sample session note files in `packages/cli/site/topics/javascript/sessions/language-basics/` (2 files: 2026-06-13.md, 2026-06-14.md) and `functions-scope/` (1 file: 2026-06-14.md) to test the Notes tab
- [x] 9.3 Create sample exercise files in `packages/cli/site/topics/javascript/exercises/variables-data-types/` — README.md, starter.js, solution.js, practice-2026-06-14.json
- [x] 9.4 Verify `cd packages/cli/site && npx vitepress build` succeeds (1.10s build, all pages rendered). Also fixed TypeScript type annotation in [domain].paths.js (esbuild can't parse TS types in .js files).

## 10. SiteGenerator class

- [ ] 10.1 Create `packages/cli/src/core/site-generator.ts` — `SiteGenerator` class that imports `SITE_FILES` from `../site/files.ts`, iterates entries, writes each to `.learn/<path>`. Implements overwrite rules: theme files skipped if exist (unless `force`), pages and config always written. Creates parent directories as needed
- [ ] 10.2 Implement `.gitignore` generation — always writes `.learn/.gitignore` with `node_modules/`, `.vitepress/cache/`, `.vitepress/dist/`, `pages/`
- [ ] 10.3 Export `SiteGenerator` from `packages/cli/src/index.ts` (public API)
- [ ] 10.4 Unit test `SiteGenerator` — verify correct file writing, overwrite rules (theme preserved, pages overwritten), .gitignore content, force mode

## 11. CLI integration — serve command

- [ ] 11.1 Add `serve [path]` command to `packages/cli/src/cli/index.ts` using Commander. Options: `--port <number>`, `--no-open`, `--force`
- [ ] 11.2 Implement serve flow: resolve path → ensure `.learn/` and `.learn/topics/` exist → call `SiteGenerator.generate()` → run `npm install --prefix .learn` (with spinner/feedback) → spawn `npx --prefix .learn vitepress dev .learn` with optional `--port` and `--open` flags → forward SIGINT/SIGTERM to child process
- [ ] 11.3 Add `--site` flag to `init [path]` command — after existing skill/command generation completes, call `SiteGenerator.generate()` without npm install or serve
- [ ] 11.4 Add `--site` flag to `update [path]` command — after existing update logic completes, call `SiteGenerator.generate()` (which will overwrite pages/config but preserve theme)
- [ ] 11.5 Add `--force` flag propagation: `init --site --force` and `serve --force` pass `force: true` to `SiteGenerator` to overwrite theme files
- [ ] 11.6 Add localized CLI messages for serve-related output in `packages/cli/src/i18n/locales/en.ts` and `zh-CN.ts`: "generating site files...", "installing dependencies...", "starting dev server...", "site ready at {url}"
- [ ] 11.7 Handle edge cases: npm not installed, vitepress install failure, port already in use, missing `.learn/` directory, empty topics directory
- [ ] 11.8 Integration test for `serve` command — verify it generates files, runs npm install (or at least writes package.json), attempts to start vitepress
- [ ] 11.9 Integration test for `init --site` — verify site files are generated alongside skill/command files
- [ ] 11.10 Integration test for `update --site` — verify pages/config are overwritten but theme files are preserved
- [ ] 11.11 Verify existing tests still pass — `init` without `--site` should behave identically to before
