<script setup lang="ts">
import { useI18n } from '../composables/useI18n';

const { locale, toggleLocale, t } = useI18n();
</script>

<template>
  <button
    class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-border-1 text-content-2 hover:bg-surface-2 hover:text-content-1 transition-colors cursor-pointer"
    :title="locale === 'en' ? 'Switch to 中文' : '切换到 English'"
    @click="toggleLocale"
  >
    <span class="text-sm">🌐</span>
    {{ t('lang.switch') }}
  </button>
</template>
