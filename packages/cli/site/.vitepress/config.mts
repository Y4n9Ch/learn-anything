import { defineConfig } from 'vitepress';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  title: 'Learn Anything',
  description: 'Interactive learning knowledge map',

  srcDir: resolve(__dirname, '..', 'pages'),
  outDir: resolve(__dirname, 'dist'),
  cacheDir: resolve(__dirname, 'cache'),

  themeConfig: {
    nav: [],
    sidebar: [],
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@data': resolve(__dirname, '..', 'topics'),
      },
    },
  },
});
