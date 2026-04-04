import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://justinlachal.github.io',
  base: '/website',
  vite: {
    plugins: [tailwindcss()],
  },
});
