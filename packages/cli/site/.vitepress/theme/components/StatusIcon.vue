<script setup lang="ts">
import type { ConceptStatus } from '../composables/useTopicData';

defineProps<{
  status: ConceptStatus;
}>();
</script>

<template>
  <span
    class="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full shrink-0"
    :class="{
      'bg-emerald-400 ring-2 ring-emerald-400/30': status === 'mastered',
      'bg-amber-400 ring-2 ring-amber-400/30 animate-pulse': status === 'in_progress',
      'bg-orange-400 ring-2 ring-orange-400/30': status === 'needs_practice',
      'bg-transparent border-2 border-slate-300 dark:border-slate-600': status === 'unexplored',
    }"
  />
</template>
