<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vitepress';
import { useI18n } from '../composables/useI18n';
import SessionNotes from './SessionNotes.vue';
import ExerciseView from './ExerciseView.vue';

const props = defineProps<{ slug: string; domain: string }>();

const router = useRouter();
const { t } = useI18n();

const activeTab = ref<'notes' | 'exercises'>('notes');

function backToTopic() {
  router.go(`/topics/${props.slug}`);
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- Back link -->
    <a
      class="inline-flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline transition-colors mb-8 cursor-pointer"
      :href="`/topics/${slug}`"
      @click.prevent="backToTopic"
    >
      <span>←</span>
      {{ t('domain.backToMap') }}
    </a>

    <!-- Tabs -->
    <div class="flex gap-1 mb-8 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
      <button
        class="px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer"
        :class="activeTab === 'notes'
          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
        @click="activeTab = 'notes'"
      >
        📝 {{ t('domain.notes') }}
      </button>
      <button
        class="px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer"
        :class="activeTab === 'exercises'
          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
        @click="activeTab = 'exercises'"
      >
        🏋️ {{ t('domain.exercises') }}
      </button>
    </div>

    <!-- Content -->
    <SessionNotes v-if="activeTab === 'notes'" :slug="slug" :domain="domain" />
    <ExerciseView v-else :slug="slug" :domain="domain" />
  </div>
</template>
