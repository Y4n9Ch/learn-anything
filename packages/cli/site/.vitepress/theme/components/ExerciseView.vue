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
    <div class="text-4xl mb-4 opacity-60">🏋️</div>
    <p class="text-content-3">{{ t('domain.noExercises') }}</p>
  </div>

  <!-- Exercise panel -->
  <div v-else class="flex gap-6 min-h-[380px]">
    <!-- Concept group list -->
    <div class="w-64 shrink-0 overflow-y-auto max-h-[60vh]">
      <div class="space-y-3">
        <div
          v-for="group in groups"
          :key="group.conceptSlug"
          class="rounded-lg border border-border-1 bg-surface-0 overflow-hidden"
        >
          <!-- Concept header -->
          <button
            class="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-surface-2 transition-colors"
            @click="toggleConcept(group.conceptSlug)"
          >
            <span class="text-sm font-medium text-content-1">
              {{ group.conceptName }}
            </span>
            <span
              class="text-xs text-content-3 transition-transform duration-200"
              :class="{ 'rotate-180': expandedConcept === group.conceptSlug }"
            >
              ▼
            </span>
          </button>

          <!-- File list (expandable) -->
          <div
            v-if="expandedConcept === group.conceptSlug"
            class="border-t border-border-1 px-3 py-2 bg-surface-2 space-y-1"
          >
            <button
              v-for="file in group.files"
              :key="file.path"
              class="block w-full text-left px-3 py-1.5 rounded-md text-xs font-mono transition-colors cursor-pointer"
              :class="activeFile === file.path
                ? 'bg-accent/10 text-accent font-medium'
                : 'text-content-2 hover:bg-surface-0 hover:text-content-1'"
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
        class="rounded-lg border border-border-1 overflow-hidden"
      >
        <!-- File header -->
        <div class="flex items-center gap-1.5 px-4 py-2.5 bg-surface-2 border-b border-border-1">
          <span class="w-2.5 h-2.5 rounded-full bg-content-3/50" />
          <span class="w-2.5 h-2.5 rounded-full bg-content-3/50" />
          <span class="w-2.5 h-2.5 rounded-full bg-content-3/50" />
          <span class="ml-2 text-xs text-content-3 font-mono">{{ activeFile.split('/').pop() }}</span>
        </div>
        <!-- Code -->
        <pre class="overflow-auto max-h-[55vh] m-0 p-5 text-sm font-mono leading-relaxed text-content-1 bg-surface-0 whitespace-pre-wrap break-words">{{ fileContent }}</pre>
      </div>

      <!-- No file selected -->
      <div
        v-else
        class="flex items-center justify-center h-full min-h-[200px] text-content-3 text-sm"
      >
        Select a file to view its content
      </div>
    </div>
  </div>
</template>
