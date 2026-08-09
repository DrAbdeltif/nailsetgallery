// @ts-check
import { defineConfig, sharpImageService } from 'astro/config';
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
    build: {
      cssCodeSplit: true,
      cssMinify: true,
      minify: 'esbuild',
    },
  },

  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404/') && !page.includes('/api/') && !page.includes('/tags/'),
    }),
    react(),
    mdx(),
  ],

  image: {
    service: sharpImageService(),
    remotePatterns: [],
  },
});
