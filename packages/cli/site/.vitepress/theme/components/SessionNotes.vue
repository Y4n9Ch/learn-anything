<script setup lang="ts">
import { ref, computed, watch, shallowRef } from 'vue';
import { useI18n } from '../composables/useI18n';
import { scanSessions, loadSessionComponent } from '../composables/useTopicData';
import type { SessionFile } from '../composables/useTopicData';

const props = defineProps<{ slug: string; domain: string }>();

const { t } = useI18n();

const files = computed<SessionFile[]>(() => scanSessions(props.slug, props.domain));
const activePath = ref<string | null>(null);

// Dynamically loaded Vue component from VitePress markdown processing
const renderedComponent = shallowRef<unknown>(null);

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

// Load and render the markdown component when activePath changes
watch(
  activePath,
  async (path) => {
    if (!path) {
      renderedComponent.value = null;
      return;
    }
    const loader = loadSessionComponent(path);
    if (loader) {
      const mod = await loader();
      renderedComponent.value = (mod as { default: unknown }).default;
    } else {
      renderedComponent.value = null;
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <!-- Empty -->
  <div
    v-if="files.length === 0"
    class="flex flex-col items-center justify-center py-16 text-center"
  >
    <div class="text-4xl mb-4 opacity-60">📝</div>
    <p class="text-content-3">{{ t('domain.noNotes') }}</p>
  </div>

  <!-- Two-column layout -->
  <div v-else class="flex gap-6 min-h-[420px]">
    <!-- File list sidebar -->
    <div class="w-44 shrink-0 border-r border-border-2 pr-3 overflow-y-auto max-h-[60vh]">
      <div class="text-xs font-medium text-content-3 mb-3">Sessions</div>
      <nav class="space-y-0.5">
        <button
          v-for="file in files"
          :key="file.path"
          class="block w-full text-left px-2 py-1.5 rounded text-xs transition-colors cursor-pointer"
          :class="
            file.path === activePath
              ? 'bg-accent/5 text-accent font-medium'
              : 'text-content-2 hover:bg-surface-2 hover:text-content-1'
          "
          @click="activePath = file.path"
        >
          {{ file.filename }}
        </button>
      </nav>
    </div>

    <!-- Content — VitePress markdown component -->
    <div class="flex-1 min-w-0">
      <div class="p-8 bg-surface-0 rounded-lg border border-border-1">
        <div v-if="renderedComponent" class="prose max-w-none">
          <component :is="renderedComponent" />
        </div>
        <div v-else class="text-content-3 text-sm">Loading...</div>
      </div>
    </div>
  </div>
</template>
