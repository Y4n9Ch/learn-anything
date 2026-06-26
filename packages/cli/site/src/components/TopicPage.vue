<script setup lang="ts">
import { computed, ref, inject, type Ref } from 'vue';
import { useI18n } from '../composables/useI18n';
import { loadTopic, loadKnowledgeMap, getDataVersion } from '../composables/useTopicData';
import ContentViewer from './ContentViewer.vue';
import TocLayout from './TocLayout.vue';
import PathVisualization from './PathVisualization.vue';
import type { SelectedFilePayload } from '../composables/useTopicData';
import { renderMarkdown } from '../utils/markdown';

const props = defineProps<{ slug: string }>();

const { t } = useI18n();

const state = computed(() => {
  void getDataVersion();
  return loadTopic(props.slug);
});
const knowledgeMapRaw = computed(() => {
  void getDataVersion();
  return loadKnowledgeMap(props.slug);
});

const knowledgeMapHtml = computed(() => {
  const raw = knowledgeMapRaw.value;
  if (!raw) return '';
  return renderMarkdown(raw);
});

/* --- Receive file selection from sidebar via provide/inject --- */
const selectedFile = inject<Ref<SelectedFilePayload | null>>('topicSelectedFile', ref(null));

const showKnowledgeMap = computed(() => !selectedFile.value);

/* --- View toggle: list vs path --- */
const viewMode = ref<'list' | 'path'>('list');
</script>

<template>
  <!-- Topic not found -->
  <div v-if="!state" class="flex flex-col items-center justify-center py-24 text-center">
    <div class="text-4xl mb-4 opacity-60 select-none">🔍</div>
    <p class="text-base text-(--color-pencil)">{{ t('topic.notFound') }}: {{ slug }}</p>
  </div>

  <!-- Topic content -->
  <div v-else>
    <!-- Knowledge Map (default) — VitePress style: h1 outside prose, content flows naturally -->
    <template v-if="showKnowledgeMap">
      <!-- View toggle buttons -->
      <div class="flex items-center gap-2 mb-4">
        <button
          class="px-3 py-1.5 text-xs rounded-lg border transition-colors"
          :class="viewMode === 'list'
            ? 'bg-(--color-brand-2) text-white border-(--color-brand-2)'
            : 'border-(--color-divider) text-(--color-text-2) hover:border-(--color-brand-2)'"
          @click="viewMode = 'list'"
        >
          列表视图
        </button>
        <button
          class="px-3 py-1.5 text-xs rounded-lg border transition-colors"
          :class="viewMode === 'path'
            ? 'bg-(--color-brand-2) text-white border-(--color-brand-2)'
            : 'border-(--color-divider) text-(--color-text-2) hover:border-(--color-brand-2)'"
          @click="viewMode = 'path'"
        >
          路径视图
        </button>
      </div>

      <!-- List view -->
      <TocLayout v-if="viewMode === 'list'" :html="knowledgeMapHtml" />

      <!-- Path visualization view -->
      <PathVisualization v-else :slug="slug" />
    </template>

    <!-- File content -->
    <ContentViewer v-else :file="selectedFile" />
  </div>
</template>
