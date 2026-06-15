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

const badgeClass = computed(() => {
  switch (masteryVariant.value) {
    case 'mastered':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400';
    case 'in_progress':
      return 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-400/10 dark:text-indigo-400';
    case 'started':
      return 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400';
    default:
      return 'bg-slate-50 text-slate-600 ring-slate-500/20 dark:bg-slate-400/10 dark:text-slate-400';
  }
});

function navigate() {
  router.go(`/topics/${props.slug}`);
}
</script>

<template>
  <div
    class="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 hover:-translate-y-0.5"
    @click="navigate"
  >
    <!-- Top accent bar — colored based on mastery -->
    <div
      class="absolute top-0 left-6 right-6 h-0.5 rounded-b-full transition-colors duration-300"
      :class="{
        'bg-emerald-400': masteryVariant === 'mastered',
        'bg-indigo-400': masteryVariant === 'in_progress',
        'bg-amber-400': masteryVariant === 'started',
        'bg-slate-200 dark:bg-slate-700': masteryVariant === 'new',
      }"
    />

    <!-- Header -->
    <div class="flex items-start justify-between gap-3 pt-1">
      <h3 class="text-base font-semibold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {{ name }}
      </h3>
      <span
        v-if="masteryLabel"
        class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset shrink-0"
        :class="badgeClass"
      >
        {{ masteryLabel }}
      </span>
    </div>

    <!-- Stats -->
    <div class="mt-4 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
      <span class="inline-flex items-center gap-1">
        <span class="i-carbon-folder text-xs" />
        {{ domainCount }} {{ t('topic.domains') }}
      </span>
      <span class="inline-flex items-center gap-1">
        <span class="i-carbon-idea text-xs" />
        {{ totalConcepts }} {{ t('topic.concepts') }}
      </span>
      <span class="inline-flex items-center gap-1">
        <span class="i-carbon-checkmark text-xs" />
        {{ masteredCount }}/{{ totalConcepts }} {{ t('topic.mastered') }}
      </span>
    </div>

    <!-- Progress -->
    <div class="mt-4 flex items-center gap-3">
      <span
        class="text-2xl font-bold tabular-nums"
        :class="{
          'text-emerald-500': percentage === 100,
          'text-indigo-500': percentage >= 50 && percentage < 100,
          'text-amber-500': percentage > 0 && percentage < 50,
          'text-slate-300 dark:text-slate-600': percentage === 0,
        }"
      >
        {{ percentage }}%
      </span>
      <div class="flex-1">
        <ProgressBar :value="percentage" />
      </div>
    </div>
  </div>
</template>
