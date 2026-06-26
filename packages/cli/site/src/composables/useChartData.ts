import { computed } from 'vue';
import {
  listAllTopics,
  loadTopic,
  getDataVersion,
  type Concept,
  type ConceptStatus,
} from './useTopicData';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface OverallStats {
  mastered: number;
  inProgress: number;
  needsPractice: number;
  unexplored: number;
  total: number;
  percentage: number;
}

export interface DomainStat {
  name: string;
  slug: string;
  mastered: number;
  total: number;
  percentage: number;
}

export interface ConfidenceBin {
  label: string;
  min: number;
  max: number;
  count: number;
}

export interface PracticeVsExplain {
  name: string;
  practice: number;
  explain: number;
}

export interface ReviewItem {
  conceptName: string;
  domainName: string;
  lastPracticed: string | null;
  daysSince: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function countByStatus(concepts: Concept[]): Record<ConceptStatus, number> {
  const counts: Record<ConceptStatus, number> = {
    mastered: 0,
    in_progress: 0,
    needs_practice: 0,
    unexplored: 0,
  };
  for (const c of concepts) {
    counts[c.status]++;
  }
  return counts;
}

function daysSince(dateStr: string | null): number {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

/* ------------------------------------------------------------------ */
/*  Composable: All-topics stats (for Dashboard)                      */
/* ------------------------------------------------------------------ */

export function useAllTopicsStats() {
  const topics = computed(() => {
    void getDataVersion();
    return listAllTopics();
  });

  const allDomainStats = computed<DomainStat[]>(() => {
    const map = new Map<string, { name: string; slug: string; mastered: number; total: number }>();
    for (const t of topics.value) {
      const state = loadTopic(t.slug);
      if (!state) continue;
      for (const d of state.domains) {
        const counts = countByStatus(d.concepts);
        const total = d.concepts.length;
        const existing = map.get(d.slug);
        if (existing) {
          existing.mastered += counts.mastered;
          existing.total += total;
        } else {
          map.set(d.slug, { name: d.name, slug: d.slug, mastered: counts.mastered, total });
        }
      }
    }
    return Array.from(map.values()).map((d) => ({
      ...d,
      percentage: d.total > 0 ? Math.round((d.mastered / d.total) * 100) : 0,
    }));
  });

  const overallStats = computed<OverallStats>(() => {
    const totalConcepts = topics.value.reduce((s, t) => s + t.totalConcepts, 0);
    const totalMastered = topics.value.reduce((s, t) => s + t.masteredCount, 0);

    return {
      mastered: totalMastered,
      inProgress: 0,
      needsPractice: 0,
      unexplored: totalConcepts - totalMastered,
      total: totalConcepts,
      percentage: totalConcepts > 0 ? Math.round((totalMastered / totalConcepts) * 100) : 0,
    };
  });

  return { topics, overallStats, allDomainStats };
}

/* ------------------------------------------------------------------ */
/*  Composable: Single-topic stats (for TopicPage)                    */
/* ------------------------------------------------------------------ */

export function useTopicStats(topicSlug: string) {
  const state = computed(() => {
    void getDataVersion();
    return loadTopic(topicSlug);
  });

  const overallStats = computed<OverallStats | null>(() => {
    if (!state.value) return null;
    const counts = countByStatus(allConcepts.value);
    const total = allConcepts.value.length;
    return {
      mastered: counts.mastered,
      inProgress: counts.in_progress,
      needsPractice: counts.needs_practice,
      unexplored: counts.unexplored,
      total,
      percentage: total > 0 ? Math.round((counts.mastered / total) * 100) : 0,
    };
  });

  const allConcepts = computed<Concept[]>(() => {
    if (!state.value) return [];
    return state.value.domains.flatMap((d) => d.concepts);
  });

  const domainStats = computed<DomainStat[]>(() => {
    if (!state.value) return [];
    return state.value.domains.map((d) => {
      const counts = countByStatus(d.concepts);
      const total = d.concepts.length;
      return {
        name: d.name,
        slug: d.slug,
        mastered: counts.mastered,
        total,
        percentage: total > 0 ? Math.round((counts.mastered / total) * 100) : 0,
      };
    });
  });

  const confidenceDistribution = computed<ConfidenceBin[]>(() => {
    const bins: ConfidenceBin[] = [
      { label: '0-30%', min: 0, max: 0.3, count: 0 },
      { label: '30-60%', min: 0.3, max: 0.6, count: 0 },
      { label: '60-80%', min: 0.6, max: 0.8, count: 0 },
      { label: '80-100%', min: 0.8, max: 1.01, count: 0 },
    ];
    for (const c of allConcepts.value) {
      for (const bin of bins) {
        if (c.confidence >= bin.min && c.confidence < bin.max) {
          bin.count++;
          break;
        }
      }
    }
    return bins;
  });

  const practiceVsExplain = computed<PracticeVsExplain[]>(() => {
    return allConcepts.value
      .filter((c) => c.practice_count > 0 || c.explain_count > 0)
      .map((c) => ({
        name: c.name,
        practice: c.practice_count,
        explain: c.explain_count,
      }));
  });

  const reviewNeeded = computed<ReviewItem[]>(() => {
    if (!state.value) return [];
    const items: ReviewItem[] = [];
    for (const domain of state.value.domains) {
      for (const concept of domain.concepts) {
        const days = daysSince(concept.last_practiced);
        if (days > 3 && concept.status !== 'mastered') {
          items.push({
            conceptName: concept.name,
            domainName: domain.name,
            lastPracticed: concept.last_practiced,
            daysSince: days,
          });
        }
      }
    }
    return items.sort((a, b) => b.daysSince - a.daysSince);
  });

  return {
    state,
    overallStats,
    domainStats,
    confidenceDistribution,
    practiceVsExplain,
    reviewNeeded,
  };
}
