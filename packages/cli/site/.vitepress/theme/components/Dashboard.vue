<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '../composables/useI18n';
import { listAllTopics } from '../composables/useTopicData';
import TopicCard from './TopicCard.vue';

const { t } = useI18n();
const topics = computed(() => listAllTopics());
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
        {{ t('dashboard.title') }}
      </h1>
      <p class="mt-2 text-slate-500 dark:text-slate-400 text-sm">
        {{ topics.length }} {{ topics.length === 1 ? 'topic' : 'topics' }}
      </p>
    </div>

    <!-- Empty State -->
    <div
      v-if="topics.length === 0"
      class="flex flex-col items-center justify-center py-24 text-center"
    >
      <div class="text-6xl mb-6 opacity-80">📚</div>
      <p class="text-lg font-medium text-slate-700 dark:text-slate-200 mb-2">
        {{ t('dashboard.noTopics') }}
      </p>
      <p class="text-sm text-slate-500 dark:text-slate-400 max-w-md">
        {{ t('dashboard.startLearning') }}
      </p>
    </div>

    <!-- Card Grid -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      <TopicCard
        v-for="topic in topics"
        :key="topic.slug"
        :slug="topic.slug"
        :name="topic.name"
        :domain-count="topic.domainCount"
        :total-concepts="topic.totalConcepts"
        :mastered-count="topic.masteredCount"
        :percentage="topic.percentage"
      />
    </div>
  </div>
</template>
