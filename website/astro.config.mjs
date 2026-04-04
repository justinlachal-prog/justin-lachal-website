import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://realmindsai.github.io',
  base: '/justin-lachal-website',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [sitemap()],
});