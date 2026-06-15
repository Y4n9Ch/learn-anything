/* ================================================================== */
/*  useTopicData — Data access layer                                   */
/*                                                                     */
/*  Uses Vite's import.meta.glob to resolve files at build time.        */
/*  All patterns are static string literals (required by Vite).         */
/* ================================================================== */

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export type ConceptStatus = 'mastered' | 'in_progress' | 'needs_practice' | 'unexplored';

export interface Concept {
  name: string;
  slug: string;
  status: ConceptStatus;
  confidence: number;
  practice_count: number;
  explain_count: number;
  last_explained: string | null;
  last_practiced: string | null;
  details: string[];
}

export interface Domain {
  name: string;
  slug: string;
  concepts: Concept[];
}

export interface StateV1 {
  version: 1;
  topic: string;
  slug: string;
  created: string;
  domains: Domain[];
}

export interface TopicSummary {
  slug: string;
  name: string;
  domainCount: number;
  totalConcepts: number;
  masteredCount: number;
  percentage: number;
}

export interface SessionFile {
  /** Display filename (e.g. "2026-06-11.md") */
  filename: string;
  /** Glob key for looking up the Vue component module */
  path: string;
  /** Raw markdown content */
  content: string;
}

export interface ExerciseFile {
  name: string;
  path: string;
}

export interface ExerciseGroup {
  conceptSlug: string;
  conceptName: string;
  files: ExerciseFile[];
}

/* ------------------------------------------------------------------ */
/*  Build-time glob imports                                            */
/* ------------------------------------------------------------------ */

// All topic state.json files (eager — loaded at import time)
// Relative paths from this file's location (.vitepress/theme/composables/)
const stateModules = import.meta.glob('../../../topics/*/state.json', {
  eager: true,
  import: 'default',
}) as Record<string, StateV1>;

// All knowledge-map.md files (raw strings for rendering)
const knowledgeMapModules = import.meta.glob('../../../topics/*/knowledge-map.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

// Session .md files — raw strings for listing + content
const sessionRawModules = import.meta.glob('../../../topics/*/sessions/*/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

// Session .md files — Vue components for rendering (lazy)
const sessionComponentModules = import.meta.glob('../../../topics/*/sessions/*/*.md');

// Exercise files — raw strings (README, code, practice records)
const exerciseModules = import.meta.glob('../../../topics/*/exercises/**/*', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

/* ------------------------------------------------------------------ */
/*  Path helpers                                                      */
/* ------------------------------------------------------------------ */

function slugFromStatePath(path: string): string {
  // ".../topics/javascript/state.json" → "javascript"
  const match = path.match(/\/topics\/([^/]+)\/state\.json$/);
  return match?.[1] || '';
}

function filenameFromPath(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1] || '';
}

function conceptFromExercisePath(path: string): string {
  // ".../topics/javascript/exercises/variables-data-types/README.md" → "variables-data-types"
  const match = path.match(/\/topics\/[^/]+\/exercises\/([^/]+)\//);
  return match?.[1] || '';
}

/* ------------------------------------------------------------------ */
/*  Public API                                                        */
/* ------------------------------------------------------------------ */

/**
 * Lists all available topics with summary stats.
 * Scans all state.json files imported via glob.
 */
export function listAllTopics(): TopicSummary[] {
  return Object.entries(stateModules)
    .map(([path, state]) => {
      const slug = slugFromStatePath(path);
      if (!slug || !state?.domains) return null;

      const allConcepts = state.domains.flatMap((d) => d.concepts);
      const total = allConcepts.length;
      const mastered = allConcepts.filter((c) => c.status === 'mastered').length;

      return {
        slug,
        name: state.topic || slug,
        domainCount: state.domains.length,
        totalConcepts: total,
        masteredCount: mastered,
        percentage: total > 0 ? Math.round((mastered / total) * 100) : 0,
      } satisfies TopicSummary;
    })
    .filter((t): t is TopicSummary => t !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Loads the full state.json data for a single topic.
 * Finds the key by matching the slug in the glob key paths.
 */
export function loadTopic(slug: string): StateV1 | null {
  for (const [path, state] of Object.entries(stateModules)) {
    if (slugFromStatePath(path) === slug) return state;
  }
  return null;
}

/**
 * Loads the raw knowledge-map.md content for a topic.
 */
export function loadKnowledgeMap(slug: string): string | null {
  for (const [path, content] of Object.entries(knowledgeMapModules)) {
    const match = path.match(/\/topics\/([^/]+)\/knowledge-map\.md$/);
    if (match?.[1] === slug) return content;
  }
  return null;
}

/**
 * Lists session note files for a given topic and domain.
 * Returns files sorted by filename (date descending).
 */
export function scanSessions(slug: string, domain: string): SessionFile[] {
  const marker = `/topics/${slug}/sessions/${domain}/`;

  return Object.entries(sessionRawModules)
    .filter(([path]) => path.includes(marker) && path.endsWith('.md'))
    .map(([path, content]) => ({
      filename: filenameFromPath(path),
      path,
      content,
    }))
    .sort((a, b) => b.filename.localeCompare(a.filename)); // date descending
}

/**
 * Returns a lazy loader for a session markdown file's Vue component.
 * Usage: `const comp = await loadSessionComponent(path)`
 */
export function loadSessionComponent(path: string): (() => Promise<unknown>) | null {
  return sessionComponentModules[path] ?? null;
}

/**
 * Scans exercise files grouped by concept for a given topic.
 */
export function scanExercises(slug: string): ExerciseGroup[] {
  const marker = `/topics/${slug}/exercises/`;
  const state = loadTopic(slug);

  // Build concept lookup: concept-slug → concept-name
  const conceptNames: Record<string, string> = {};
  if (state?.domains) {
    for (const domain of state.domains) {
      for (const concept of domain.concepts) {
        conceptNames[concept.slug] = concept.name;
      }
    }
  }

  // Group files by concept-slug
  const groups: Record<string, ExerciseFile[]> = {};

  for (const path of Object.keys(exerciseModules)) {
    if (!path.includes(marker)) continue;

    const conceptSlug = conceptFromExercisePath(path);
    if (!conceptSlug) continue;

    if (!groups[conceptSlug]) {
      groups[conceptSlug] = [];
    }
    groups[conceptSlug].push({
      name: filenameFromPath(path),
      path,
    });
  }

  return Object.entries(groups)
    .map(([conceptSlug, files]) => ({
      conceptSlug,
      conceptName: conceptNames[conceptSlug] || conceptSlug,
      files,
    }))
    .sort((a, b) => a.conceptName.localeCompare(b.conceptName));
}

/**
 * Loads the raw content of an exercise file.
 */
export function loadExerciseContent(path: string): string | null {
  return exerciseModules[path] ?? null;
}

/**
 * Loads the raw content of a session file.
 */
export function loadMarkdown(path: string): string | null {
  return sessionRawModules[path] ?? null;
}
