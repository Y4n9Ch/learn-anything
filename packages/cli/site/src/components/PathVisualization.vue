<script setup lang="ts">
import { computed } from 'vue';
import { useTopicStats } from '../composables/useChartData';
import { useI18n } from '../composables/useI18n';
import type { ConceptStatus } from '../composables/useTopicData';

const props = defineProps<{ slug: string }>();
const { t } = useI18n();

const { state, domainStats } = useTopicStats(props.slug);

const STATUS_COLORS: Record<ConceptStatus, string> = {
  mastered: 'var(--color-mastered)',
  in_progress: 'var(--color-progress)',
  needs_practice: 'var(--color-brand-2)',
  unexplored: 'var(--color-text-3)',
};

const STATUS_KEYS: Record<ConceptStatus, string> = {
  mastered: 'status.mastered',
  in_progress: 'status.inProgress',
  needs_practice: 'status.needsPractice',
  unexplored: 'status.unexplored',
};

/* --- Layout constants --- */
const NODE_W = 160;
const NODE_H = 36;
const GAP_X = 240;
const GAP_Y = 48;
const PAD_TOP = 24;
const PAD_LEFT = 24;

interface DomainNode {
  name: string;
  slug: string;
  mastered: number;
  total: number;
  percentage: number;
  x: number;
  y: number;
  concepts: ConceptNode[];
}

interface ConceptNode {
  name: string;
  slug: string;
  status: ConceptStatus;
  confidence: number;
  x: number;
  y: number;
}

const layout = computed(() => {
  if (!state.value) return { domains: [], width: 0, height: 0, arrows: [] };

  const domains: DomainNode[] = [];
  let curX = PAD_LEFT;

  for (const domain of state.value.domains) {
    const concepts: ConceptNode[] = [];
    let curY = PAD_TOP + 40; // leave room for domain label

    for (const concept of domain.concepts) {
      concepts.push({
        name: concept.name,
        slug: concept.slug,
        status: concept.status,
        confidence: concept.confidence,
        x: curX,
        y: curY,
      });
      curY += NODE_H + 8;
    }

    const domainTotal = domain.concepts.length;
    const domainH = Math.max(concepts.length * (NODE_H + 8), NODE_H + 16);

    domains.push({
      name: domain.name,
      slug: domain.slug,
      mastered: domain.concepts.filter((c) => c.status === 'mastered').length,
      total: domainTotal,
      percentage: domainTotal > 0 ? Math.round((domain.concepts.filter((c) => c.status === 'mastered').length / domainTotal) * 100) : 0,
      x: curX,
      y: PAD_TOP,
      concepts,
    });

    curX += NODE_W + GAP_X;
  }

  // Arrows between domain centers
  const arrows: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < domains.length - 1; i++) {
    const a = domains[i];
    const b = domains[i + 1];
    arrows.push({
      x1: a.x + NODE_W,
      y1: a.y + 20,
      x2: b.x,
      y2: b.y + 20,
    });
  }

  const width = domains.length > 0 ? curX - GAP_X + NODE_W + PAD_LEFT : 0;
  const maxH = domains.reduce((m, d) => Math.max(m, d.concepts.length), 0);
  const height = PAD_TOP + 40 + maxH * (NODE_H + 8) + 24;

  return { domains, width, height, arrows };
});

function statusColor(status: ConceptStatus): string {
  return STATUS_COLORS[status];
}
</script>

<template>
  <div v-if="!state" class="py-12 text-center text-sm text-(--color-text-3)">
    {{ t('path.noData') }}
  </div>
  <div v-else class="overflow-x-auto">
    <svg
      :width="layout.width"
      :height="layout.height"
      class="block"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Arrows between domains -->
      <defs>
        <marker
          :id="'arrowhead-' + props.slug"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="var(--color-text-3)" />
        </marker>
      </defs>

      <g v-for="(arrow, i) in layout.arrows" :key="'arrow-' + i">
        <line
          :x1="arrow.x1 + 4"
          :y1="arrow.y1"
          :x2="arrow.x2 - 4"
          :y2="arrow.y2"
          stroke="var(--color-divider)"
          stroke-width="1.5"
          :marker-end="'url(#arrowhead-' + props.slug + ')'"
        />
      </g>

      <!-- Domain groups -->
      <g v-for="domain in layout.domains" :key="domain.slug">
        <!-- Domain label -->
        <text
          :x="domain.x + NODE_W / 2"
          :y="domain.y + 16"
          text-anchor="middle"
          class="text-xs font-semibold"
          fill="var(--color-text-1)"
        >
          {{ domain.name }}
        </text>
        <text
          :x="domain.x + NODE_W / 2"
          :y="domain.y + 30"
          text-anchor="middle"
          class="text-[10px]"
          fill="var(--color-text-2)"
        >
          {{ domain.mastered }}/{{ domain.total }} · {{ domain.percentage }}%
        </text>

        <!-- Concept nodes -->
        <g v-for="concept in domain.concepts" :key="concept.slug">
          <!-- Background rect -->
          <rect
            :x="concept.x"
            :y="concept.y"
            :width="NODE_W"
            :height="NODE_H"
            rx="6"
            :fill="statusColor(concept.status)"
            fill-opacity="0.12"
            :stroke="statusColor(concept.status)"
            stroke-width="1"
            stroke-opacity="0.3"
          />
          <!-- Status indicator -->
          <circle
            :cx="concept.x + 14"
            :cy="concept.y + NODE_H / 2"
            r="4"
            :fill="statusColor(concept.status)"
          />
          <!-- Concept name -->
          <text
            :x="concept.x + 24"
            :y="concept.y + NODE_H / 2 + 1"
            dominant-baseline="middle"
            class="text-xs"
            fill="var(--color-text-1)"
          >
            {{ concept.name.length > 16 ? concept.name.slice(0, 15) + '…' : concept.name }}
          </text>
          <!-- Confidence badge -->
          <text
            :x="concept.x + NODE_W - 8"
            :y="concept.y + NODE_H / 2 + 1"
            dominant-baseline="middle"
            text-anchor="end"
            class="text-[10px]"
            fill="var(--color-text-3)"
          >
            {{ Math.round(concept.confidence * 100) }}%
          </text>
        </g>
      </g>
    </svg>
  </div>

  <!-- Legend -->
  <div class="flex flex-wrap gap-4 mt-3 text-xs text-(--color-text-2)">
    <span
      v-for="status in (['mastered', 'in_progress', 'needs_practice', 'unexplored'] as ConceptStatus[])"
      :key="status"
      class="flex items-center gap-1.5"
    >
      <span
        class="inline-block w-2.5 h-2.5 rounded-full"
        :style="{ backgroundColor: STATUS_COLORS[status] }"
      />
      {{ t(STATUS_KEYS[status] as any) }}
    </span>
  </div>
</template>
