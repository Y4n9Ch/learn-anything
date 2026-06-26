<script setup lang="ts">
import { computed } from 'vue';
import { useAllTopicsStats, useTopicStats } from '../composables/useChartData';
import { useI18n } from '../composables/useI18n';

const props = defineProps<{ topicSlug?: string }>();

const { t } = useI18n();

const allTopics = useAllTopicsStats();
const topic = props.topicSlug ? useTopicStats(props.topicSlug) : null;

const stats = computed(() => {
  if (topic?.overallStats.value) return topic.overallStats.value;
  if (allTopics.overallStats.value) return allTopics.overallStats.value;
  return null;
});

const domains = computed(() => {
  if (topic?.domainStats.value) return topic.domainStats.value;
  return allTopics.allDomainStats?.value ?? [];
});

const reviewItems = computed(() => {
  if (topic?.reviewNeeded.value) return topic.reviewNeeded.value;
  return [];
});

/* --- Ring chart --- */
const RING_R = 44;
const RING_STROKE = 8;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;

function dashOffset(pct: number): number {
  return RING_CIRCUMFERENCE * (1 - pct / 100);
}

const ringSegments = computed(() => {
  if (!stats.value) return [];
  const s = stats.value;
  const total = s.total || 1;
  return [
    { color: 'var(--color-mastered)', pct: (s.mastered / total) * 100, label: t('status.mastered') },
    { color: 'var(--color-progress)', pct: (s.inProgress / total) * 100, label: t('status.inProgress') },
    { color: '#d97706', pct: (s.needsPractice / total) * 100, label: t('status.needsPractice') },
    { color: 'var(--color-text-3)', pct: (s.unexplored / total) * 100, label: t('status.unexplored') },
  ];
});
</script>

<template>
  <div v-if="!stats" class="text-sm text-(--color-text-3) py-4">No stats available</div>

  <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
    <!-- Card 1: Ring chart -->
    <div class="bg-(--color-bg-soft) rounded-xl border border-(--color-divider) p-3.5">
      <h3 class="text-xs font-semibold text-(--color-text-1) mb-2">{{ t('stats.overall') }}</h3>
      <div class="flex items-center gap-5">
        <svg width="100" height="100" class="shrink-0">
          <!-- Background ring -->
          <circle
            cx="50"
            cy="50"
            :r="RING_R"
            fill="none"
            stroke="var(--color-divider)"
            :stroke-width="RING_STROKE"
          />
          <!-- Progress arc — mastered only for simplicity -->
          <circle
            cx="50"
            cy="50"
            :r="RING_R"
            fill="none"
            stroke="var(--color-mastered)"
            :stroke-width="RING_STROKE"
            stroke-linecap="round"
            :stroke-dasharray="RING_CIRCUMFERENCE"
            :stroke-dashoffset="dashOffset(stats.percentage)"
            :transform="`rotate(-90 50 50)`"
            class="transition-all duration-700"
          />
          <!-- Center text -->
          <text x="50" y="47" text-anchor="middle" class="text-xl font-bold" fill="var(--color-text-1)">
            {{ stats.percentage }}%
          </text>
          <text x="50" y="61" text-anchor="middle" class="text-[11px]" fill="var(--color-text-2)">
            {{ stats.mastered }}/{{ stats.total }}
          </text>
        </svg>

        <div class="flex flex-col gap-1.5 text-xs ml-8">
          <div v-for="seg in ringSegments" :key="seg.label" class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: seg.color }" />
            <span class="text-(--color-text-2)">{{ seg.label }}</span>
            <span class="ml-auto font-medium text-(--color-text-1)">{{ Math.round(seg.pct) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Card 2: Domain bars -->
    <div class="bg-(--color-bg-soft) rounded-xl border border-(--color-divider) p-3.5 md:col-span-1">
      <h3 class="text-xs font-semibold text-(--color-text-1) mb-2">{{ t('stats.domains') }}</h3>
      <div v-if="domains.length === 0" class="text-[11px] text-(--color-text-3)">—</div>
      <div v-else class="flex flex-col gap-2 max-h-[110px] overflow-y-auto">
        <div v-for="d in domains" :key="d.slug" class="flex items-center gap-2 text-[11px]">
          <span class="w-24 truncate text-(--color-text-2)" :title="d.name">{{ d.name }}</span>
          <div class="flex-1 h-1.5 bg-(--color-divider) rounded-full overflow-hidden">
            <div
              class="h-full rounded-full bg-(--color-mastered) transition-all duration-500"
              :style="{ width: `${d.percentage}%` }"
            />
          </div>
          <span class="w-12 text-right tabular-nums text-(--color-text-3)">{{ d.mastered }}/{{ d.total }}</span>
        </div>
      </div>
    </div>

    <!-- Card 3: Review needed -->
    <div class="bg-(--color-bg-soft) rounded-xl border border-(--color-divider) p-3.5">
      <h3 class="text-xs font-semibold text-(--color-text-1) mb-2">{{ t('stats.reviewNeeded') }}</h3>
      <div v-if="reviewItems.length === 0" class="text-[11px] text-(--color-text-3)">
        {{ t('stats.allCaughtUp') }}
      </div>
      <div v-else class="flex flex-col gap-1.5 max-h-[110px] overflow-y-auto">
        <div
          v-for="item in reviewItems.slice(0, 8)"
          :key="item.conceptName"
          class="flex items-center justify-between text-xs py-1 border-b border-(--color-divider) last:border-0"
        >
          <span class="text-(--color-text-1) truncate max-w-[140px]" :title="item.conceptName">
            {{ item.conceptName }}
          </span>
          <span class="text-(--color-brand-2) font-medium tabular-nums shrink-0 ml-2">
            {{ item.daysSince === Infinity ? '—' : item.daysSince + 'd' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
