// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://nailsetgallery.com',
  trailingSlash: 'always',
  adapter: cloudflare(),

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    sitemap(),
    react(),
    mdx(),
  ],

  image: {
    // Optimize images with WebP conversion
    remotePatterns: [],
  },
});