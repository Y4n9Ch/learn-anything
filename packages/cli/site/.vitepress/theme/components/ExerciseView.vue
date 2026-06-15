<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from '../composables/useI18n';
import { scanExercises, loadExerciseContent } from '../composables/useTopicData';
import type { ExerciseGroup } from '../composables/useTopicData';

const props = defineProps<{ slug: string; domain: string }>();

const { t } = useI18n();

const allGroups = computed<ExerciseGroup[]>(() => scanExercises(props.slug));
const groups = computed(() => allGroups.value);

const expandedConcept = ref<string | null>(null);
const activeFile = ref<string | null>(null);

function toggleConcept(conceptSlug: string) {
  expandedConcept.value =
    expandedConcept.value === conceptSlug ? null : conceptSlug;
  activeFile.value = null;
}

function viewFile(path: string) {
  activeFile.value = path;
}

const fileContent = computed(() => {
  if (!activeFile.value) return '';
  return loadExerciseContent(activeFile.value) || '';
});
</script>

<template>
  <!-- Empty -->
  <div v-if="groups.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
    <div class="text-4xl mb-4 opacity-70">🏋️</div>
    <p class="text-slate-500 dark:text-slate-400">{{ t('domain.noExercises') }}</p>
  </div>

  <!-- Exercise panel -->
  <div v-else class="flex gap-6 min-h-[380px]">
    <!-- Concept group list -->
    <div class="w-64 shrink-0 overflow-y-auto max-h-[60vh]">
      <div class="space-y-3">
        <div
          v-for="group in groups"
          :key="group.conceptSlug"
          class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-shadow hover:shadow-sm"
        >
          <!-- Concept header -->
          <button
            class="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            @click="toggleConcept(group.conceptSlug)"
          >
            <span class="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {{ group.conceptName }}
            </span>
            <span
              class="text-xs text-slate-400 transition-transform duration-200"
              :class="{ 'rotate-180': expandedConcept === group.conceptSlug }"
            >
              ▼
            </span>
          </button>

          <!-- File list (expandable) -->
          <div
            v-if="expandedConcept === group.conceptSlug"
            class="border-t border-slate-100 dark:border-slate-800 px-3 py-2 bg-slate-50/50 dark:bg-slate-800/30 space-y-1"
          >
            <button
              v-for="file in group.files"
              :key="file.path"
              class="block w-full text-left px-3 py-1.5 rounded-md text-xs font-mono transition-colors cursor-pointer"
              :class="activeFile === file.path
                ? 'bg-indigo-100 dark:bg-indigo-400/20 text-indigo-700 dark:text-indigo-300 font-medium'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-slate-200'"
              @click="viewFile(file.path)"
            >
              {{ file.name }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Code viewer -->
    <div class="flex-1 min-w-0">
      <div
        v-if="activeFile"
        class="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        <!-- File header -->
        <div class="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          <span class="w-3 h-3 rounded-full bg-red-400" />
          <span class="w-3 h-3 rounded-full bg-amber-400" />
          <span class="w-3 h-3 rounded-full bg-emerald-400" />
          <span class="ml-2 text-xs text-slate-400 font-mono">{{ activeFile.split('/').pop() }}</span>
        </div>
        <!-- Code -->
        <pre class="overflow-auto max-h-[55vh] m-0 p-5 text-sm font-mono leading-relaxed text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 whitespace-pre-wrap break-words">{{ fileContent }}</pre>
      </div>

      <!-- No file selected -->
      <div
        v-else
        class="flex items-center justify-center h-full min-h-[200px] text-slate-400 dark:text-slate-500 text-sm"
      >
        Select a file to view its content
      </div>
    </div>
  </div>
</template>
