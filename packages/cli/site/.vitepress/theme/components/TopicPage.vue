<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vitepress';
import { useI18n } from '../composables/useI18n';
import { loadTopic, loadKnowledgeMap } from '../composables/useTopicData';
import type { Domain, StateV1, ConceptStatus } from '../composables/useTopicData';
import StatusIcon from './StatusIcon.vue';

const props = defineProps<{ slug: string }>();

const router = useRouter();
const { t } = useI18n();

const state = computed<StateV1 | null>(() => loadTopic(props.slug));
const knowledgeMapRaw = computed(() => loadKnowledgeMap(props.slug));

const domainList = computed<Domain[]>(() => state.value?.domains ?? []);

const totalConcepts = computed(() =>
  domainList.value.reduce((sum, d) => sum + d.concepts.length, 0),
);

const masteredCount = computed(() =>
  domainList.value.reduce(
    (sum, d) => sum + d.concepts.filter((c) => c.status === 'mastered').length,
    0,
  ),
);

const pct = computed(() =>
  totalConcepts.value > 0
    ? Math.round((masteredCount.value / totalConcepts.value) * 100)
    : 0,
);

const progressColor = computed(() => {
  if (pct.value === 100) return 'text-emerald-600 dark:text-emerald-400';
  if (pct.value >= 50) return 'text-indigo-600 dark:text-indigo-400';
  if (pct.value > 0) return 'text-amber-600 dark:text-amber-400';
  return 'text-slate-400 dark:text-slate-500';
});

function isDomainActive(domainSlug: string): boolean {
  if (typeof window !== 'undefined') {
    return window.location.pathname.includes(`/${props.slug}/${domainSlug}`);
  }
  return false;
}

function navigateToDomain(domainSlug: string) {
  router.go(`/topics/${props.slug}/${domainSlug}`);
}

function statusLabel(status: ConceptStatus): string {
  const key = status === 'in_progress' ? 'status.inProgress' : `status.${status}` as any;
  return t(key);
}

function statusBadgeClass(status: ConceptStatus): string {
  switch (status) {
    case 'mastered':
      return 'text-emerald-700 dark:text-emerald-400';
    case 'in_progress':
      return 'text-amber-700 dark:text-amber-400';
    case 'needs_practice':
      return 'text-orange-700 dark:text-orange-400';
    default:
      return 'text-slate-400 dark:text-slate-500';
  }
}
</script>

<template>
  <!-- Topic found -->
  <div v-if="state" class="flex gap-8 max-w-6xl mx-auto px-4 py-8">
    <!-- Left Sidebar -->
    <aside class="w-60 shrink-0 border-r border-slate-200 dark:border-slate-800 pr-5">
      <div class="sticky top-20">
        <div class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 pl-3">
          {{ t('topic.domains') }}
        </div>

        <nav class="space-y-0.5">
          <a
            v-for="domain in domainList"
            :key="domain.slug"
            class="block px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer"
            :class="isDomainActive(domain.slug)
              ? 'bg-indigo-50 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 font-medium'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'"
            :href="`/topics/${slug}/${domain.slug}`"
            @click.prevent="navigateToDomain(domain.slug)"
          >
            {{ domain.name }}
          </a>
        </nav>
      </div>
    </aside>

    <!-- Right Content -->
    <div class="flex-1 min-w-0">
      <!-- Title -->
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
        {{ state.topic }}
      </h1>

      <!-- Progress Summary -->
      <div class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm">
        <span class="font-semibold tabular-nums" :class="progressColor">
          {{ masteredCount }}/{{ totalConcepts }}
        </span>
        <span class="text-slate-400">·</span>
        <span class="text-slate-500 dark:text-slate-400">{{ t('topic.mastered') }}</span>
        <span class="text-slate-400">·</span>
        <span class="font-semibold tabular-nums" :class="progressColor">{{ pct }}%</span>
        <span class="text-slate-500 dark:text-slate-400">{{ t('topic.progress') }}</span>
      </div>

      <!-- Domain Sections -->
      <div class="mt-8 space-y-8">
        <section v-for="domain in domainList" :key="domain.slug">
          <h2
            class="text-lg font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline cursor-pointer transition-colors mb-4"
            @click="navigateToDomain(domain.slug)"
          >
            {{ domain.name }}
          </h2>

          <ul class="space-y-2">
            <li
              v-for="concept in domain.concepts"
              :key="concept.slug"
              class="flex flex-wrap items-baseline gap-x-2 gap-y-1 px-3 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
            >
              <StatusIcon :status="concept.status" class="mt-0.5" />
              <strong class="text-sm text-slate-800 dark:text-slate-200">{{ concept.name }}</strong>
              <span class="text-xs" :class="statusBadgeClass(concept.status)">
                ({{ statusLabel(concept.status) }})
              </span>
              <ul
                v-if="concept.details.length > 0"
                class="w-full mt-1 pl-5 space-y-0.5"
              >
                <li
                  v-for="detail in concept.details"
                  :key="detail"
                  class="text-xs text-slate-500 dark:text-slate-400 list-disc"
                >
                  {{ detail }}
                </li>
              </ul>
            </li>
          </ul>
        </section>
      </div>

      <!-- Empty domains -->
      <div v-if="domainList.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
        <div class="text-5xl mb-4 opacity-80">🗂️</div>
        <p class="text-slate-500 dark:text-slate-400">{{ t('dashboard.noTopics') }}</p>
      </div>
    </div>
  </div>

  <!-- Topic not found -->
  <div v-else class="flex flex-col items-center justify-center py-24 text-center max-w-6xl mx-auto px-4">
    <div class="text-5xl mb-4 opacity-80">🔍</div>
    <p class="text-lg font-medium text-slate-700 dark:text-slate-200">
      Topic not found: {{ slug }}
    </p>
  </div>
</template>
