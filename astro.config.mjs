// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://ready2cars.com',
  // sitemap.xml is generated from the real routes at build time, so it can't drift
  // out of sync with the pages the way the hand-written file did
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  build: { inlineStylesheets: 'auto' },
  compressHTML: true,
});
