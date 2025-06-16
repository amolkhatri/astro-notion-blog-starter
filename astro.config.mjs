// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://astro-notion-blog-starter.github.io',
	base: '/demo',
	
	integrations: [mdx(), sitemap()],
});
