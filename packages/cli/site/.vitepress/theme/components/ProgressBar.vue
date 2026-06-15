<script setup lang="ts">
defineProps<{
  value: number;
  label?: string;
}>();
</script>

<template>
  <div
    class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"
    role="progressbar"
    :aria-valuenow="value"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="label || `${value}%`"
  >
    <div
      class="h-full rounded-full transition-all duration-500 ease-out"
      :class="value === 100
        ? 'bg-gradient-to-r from-emerald-400 to-emerald-300'
        : 'bg-gradient-to-r from-indigo-400 to-indigo-300'"
      :style="{ width: `${value}%` }"
    />
  </div>
</template>
