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
  <div class="w-[2000px] px-4 py-10">
    <!-- Back link -->
    <a
      class="inline-flex items-center gap-1.5 text-sm text-content-2 hover:text-accent transition-colors mb-8 cursor-pointer"
      :href="`/topics/${slug}`"
      @click.prevent="backToTopic"
    >
      {{ t('domain.backToMap') }}
    </a>

    <!-- Underline Tabs -->
    <div class="flex gap-6 mb-8 border-b border-border-1">
      <button
        class="relative pb-2.5 text-sm font-medium transition-colors cursor-pointer"
        :class="activeTab === 'notes' ? 'text-accent' : 'text-content-3 hover:text-content-2'"
        @click="activeTab = 'notes'"
      >
        {{ t('domain.notes') }}
        <span
          v-if="activeTab === 'notes'"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"
        />
      </button>
      <button
        class="relative pb-2.5 text-sm font-medium transition-colors cursor-pointer"
        :class="activeTab === 'exercises' ? 'text-accent' : 'text-content-3 hover:text-content-2'"
        @click="activeTab = 'exercises'"
      >
        {{ t('domain.exercises') }}
        <span
          v-if="activeTab === 'exercises'"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"
        />
      </button>
    </div>

    <!-- Content -->
    <SessionNotes v-if="activeTab === 'notes'" :slug="slug" :domain="domain" />
    <ExerciseView v-else :slug="slug" :domain="domain" />
  </div>
</template>
