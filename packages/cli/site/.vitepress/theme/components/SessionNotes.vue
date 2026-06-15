<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from '../composables/useI18n';
import { scanSessions, loadMarkdown } from '../composables/useTopicData';
import type { SessionFile } from '../composables/useTopicData';

const props = defineProps<{ slug: string; domain: string }>();

const { t } = useI18n();

const files = computed<SessionFile[]>(() => scanSessions(props.slug, props.domain));
const activePath = ref<string | null>(null);

// Auto-select first file when files change
watch(
  files,
  (newFiles) => {
    if (newFiles.length > 0 && !newFiles.find((f) => f.path === activePath.value)) {
      activePath.value = newFiles[0].path;
    }
  },
  { immediate: true },
);

const selectedContent = computed(() => {
  if (!activePath.value) return '';
  return loadMarkdown(activePath.value) || '';
});
</script>

<template>
  <!-- Empty -->
  <div v-if="files.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
    <div class="text-4xl mb-4 opacity-70">📝</div>
    <p class="text-slate-500 dark:text-slate-400">{{ t('domain.noNotes') }}</p>
  </div>

  <!-- Two-column layout -->
  <div v-else class="flex gap-6 min-h-[420px]">
    <!-- File list sidebar -->
    <div class="w-56 shrink-0 border-r border-slate-200 dark:border-slate-800 pr-4 overflow-y-auto max-h-[60vh]">
      <div class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 pl-2">
        Sessions
      </div>
      <nav class="space-y-0.5">
        <button
          v-for="file in files"
          :key="file.path"
          class="block w-full text-left px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer"
          :class="file.path === activePath
            ? 'bg-indigo-50 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 font-medium'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'"
          @click="activePath = file.path"
        >
          {{ file.filename }}
        </button>
      </nav>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <pre class="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-slate-700 dark:text-slate-300 p-0 m-0 bg-transparent">{{ selectedContent }}</pre>
      </div>
    </div>
  </div>
</template>
