<script setup lang="ts">
import { useI18n } from '../composables/useI18n';

const { locale, toggleLocale, t } = useI18n();
</script>

<template>
  <button
    class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
    :title="locale === 'en' ? 'Switch to 中文' : '切换到 English'"
    @click="toggleLocale"
  >
    <span class="text-sm">🌐</span>
    {{ t('lang.switch') }}
  </button>
</template>
