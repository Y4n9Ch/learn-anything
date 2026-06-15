<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import LanguageSwitch from './LanguageSwitch.vue';

const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <LanguageSwitch />
    </template>
  </Layout>
</template>
