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
</script>

<template>
  <!-- Topic found -->
  <div v-if="state" class="flex gap-8 max-w-6xl mx-auto px-4 py-10">
    <!-- Left Sidebar -->
    <aside class="w-60 shrink-0 border-r border-border-2 pr-5">
      <div class="sticky top-20">
        <div class="text-xs font-medium text-content-3 mb-3 pl-3">
          {{ t('topic.domains') }}
        </div>

        <nav class="space-y-0.5">
          <a
            v-for="domain in domainList"
            :key="domain.slug"
            class="block px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer border-l-2"
            :class="isDomainActive(domain.slug)
              ? 'bg-accent/5 border-accent text-accent font-medium'
              : 'border-transparent text-content-2 hover:bg-surface-2 hover:text-content-1'"
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
      <h1 class="text-2xl font-semibold text-content-1 tracking-tight">
        {{ state.topic }}
      </h1>

      <!-- Progress Summary -->
      <div class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-surface-2 rounded-lg text-sm">
        <span class="font-semibold tabular-nums text-accent">
          {{ masteredCount }}/{{ totalConcepts }}
        </span>
        <span class="text-content-3">·</span>
        <span class="text-content-2">{{ t('topic.mastered') }}</span>
        <span class="text-content-3">·</span>
        <span class="font-semibold tabular-nums text-accent">{{ pct }}%</span>
        <span class="text-content-2">{{ t('topic.progress') }}</span>
      </div>

      <!-- Domain Sections -->
      <div class="mt-8 space-y-8">
        <section v-for="domain in domainList" :key="domain.slug">
          <h2
            class="text-base font-semibold text-content-1 hover:text-accent cursor-pointer transition-colors mb-4"
            @click="navigateToDomain(domain.slug)"
          >
            {{ domain.name }}
          </h2>

          <ul class="space-y-2">
            <li
              v-for="concept in domain.concepts"
              :key="concept.slug"
              class="flex flex-wrap items-baseline gap-x-2 gap-y-1 px-3 py-2.5 rounded-lg bg-surface-0 border border-border-1 hover:border-accent-muted transition-colors"
            >
              <StatusIcon :status="concept.status" class="mt-0.5" />
              <strong class="text-sm text-content-1">{{ concept.name }}</strong>
              <span class="text-xs text-content-3">
                ({{ statusLabel(concept.status) }})
              </span>
              <ul
                v-if="concept.details.length > 0"
                class="w-full mt-1 pl-5 space-y-0.5"
              >
                <li
                  v-for="detail in concept.details"
                  :key="detail"
                  class="text-xs text-content-3 list-disc"
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
        <div class="text-4xl mb-4 opacity-60">🗂️</div>
        <p class="text-content-3">{{ t('dashboard.noTopics') }}</p>
      </div>
    </div>
  </div>

  <!-- Topic not found -->
  <div v-else class="flex flex-col items-center justify-center py-24 text-center max-w-6xl mx-auto px-4">
    <div class="text-4xl mb-4 opacity-60">🔍</div>
    <p class="text-base text-content-2">
      Topic not found: {{ slug }}
    </p>
  </div>
</template>
