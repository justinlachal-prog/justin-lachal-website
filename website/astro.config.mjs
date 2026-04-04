import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://justinlachal.github.io',
  base: '/website',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [sitemap()],
});