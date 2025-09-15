import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';
import {notionLoader } from './lib/loader';
import { loadEnv } from 'vite';

const env = Object.assign({}, loadEnv(import.meta.env.MODE, process.cwd(), ''), process.env);

let notionApiKey = import.meta.env.NOTION_API_KEY ?? '';
let notionDatabaseId = import.meta.env.NOTION_DATABASE_ID ?? '';

console.log(" static notionApiKey", notionApiKey);
console.log(" static notionDatabaseId", notionDatabaseId);

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) => z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: image().optional(),
	}),
});

const notion = defineCollection({
	loader: notionLoader({
		notionApiKey: env.NOTION_API_KEY ?? '',
		notionDatabaseId: env.NOTION_DATABASE_ID ?? '',
	}),
	schema: ({ image }) => z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: image().optional(),
	}),
});	

export const collections = { blog, notion };
