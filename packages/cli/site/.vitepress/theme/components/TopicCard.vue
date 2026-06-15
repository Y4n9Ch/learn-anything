<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vitepress';
import { useI18n } from '../composables/useI18n';
import ProgressBar from './ProgressBar.vue';

const props = defineProps<{
  slug: string;
  name: string;
  domainCount: number;
  totalConcepts: number;
  masteredCount: number;
  percentage: number;
}>();

const router = useRouter();
const { t } = useI18n();

const masteryVariant = computed(() => {
  if (props.percentage === 100) return 'mastered';
  if (props.percentage >= 50) return 'in_progress';
  if (props.percentage > 0) return 'started';
  return 'new';
});

const masteryLabel = computed(() => {
  if (props.percentage === 100) return t('status.mastered');
  if (props.percentage >= 50) return t('status.inProgress');
  return '';
});

function navigate() {
  router.go(`/topics/${props.slug}`);
}
</script>

<template>
  <div
    class="group relative bg-surface-0 rounded-lg border border-border-1 p-6 cursor-pointer transition-colors duration-200 hover:border-accent-muted"
    @click="navigate"
  >
    <!-- Top accent bar — only visible when learning has started -->
    <div
      v-if="masteryVariant !== 'new'"
      class="absolute top-0 left-6 right-6 h-px bg-accent"
    />

    <!-- Header -->
    <div class="flex items-start justify-between gap-3 pt-1">
      <h3 class="text-base font-semibold text-content-1 leading-snug">
        {{ name }}
      </h3>
      <span
        v-if="masteryLabel"
        class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-accent/10 text-accent shrink-0"
      >
        {{ masteryLabel }}
      </span>
    </div>

    <!-- Stats -->
    <div class="mt-4 flex items-center gap-4 text-xs text-content-3">
      <span>{{ domainCount }} {{ t('topic.domains') }}</span>
      <span>{{ totalConcepts }} {{ t('topic.concepts') }}</span>
      <span>{{ masteredCount }}/{{ totalConcepts }} {{ t('topic.mastered') }}</span>
    </div>

    <!-- Progress -->
    <div class="mt-4 flex items-center gap-3">
      <span class="text-xl font-bold tabular-nums text-accent">
        {{ percentage }}%
      </span>
      <div class="flex-1">
        <ProgressBar :value="percentage" />
      </div>
    </div>
  </div>
</template>
