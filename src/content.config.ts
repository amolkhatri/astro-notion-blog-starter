import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';
import {notionLoader } from './lib/loader';
import { loadEnv } from 'vite';

const env = loadEnv(import.meta.env.MODE, process.cwd(), '');

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
		notionApiKey: "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",
		notionDatabaseId: "1bfc8a89eb2a8062af70f17df8c29e0d",
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
