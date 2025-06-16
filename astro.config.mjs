// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://amolkhatri.github.io',
  base: '/astro-notion-blog-starter',
  integrations: [mdx(), sitemap()],

  adapter: node({
    mode: 'standalone',
  }),
});