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
      'bg-accent': status === 'mastered',
      'border-2 border-accent animate-status-pulse': status === 'in_progress',
      'border border-dashed border-content-3 bg-content-3/20': status === 'needs_practice',
      'border border-content-3 opacity-30': status === 'unexplored',
    }"
  />
</template>

<style scoped>
@keyframes status-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-status-pulse {
  animation: status-pulse 2s ease-in-out infinite;
}
</style>
