<script setup lang="ts">
defineProps<{
  value: number;
  label?: string;
}>();
</script>

<template>
  <div
    class="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden"
    role="progressbar"
    :aria-valuenow="value"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="label || `${value}%`"
  >
    <div
      class="h-full rounded-full transition-all duration-500 ease-out bg-accent"
      :style="{ width: `${value}%` }"
    />
  </div>
</template>
