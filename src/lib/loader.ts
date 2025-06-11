import { Client } from "@notionhq/client";
import type { Loader } from "astro/loaders";
import { NotionToMarkdown } from "notion-to-md";


interface LoaderOptions {
  /** Number of dummy entries to generate */
  notionApiKey: string;
  notionDatabaseId: string;
}



async function getNotionData(notionApiKey: string, notionDatabaseId: string, filter = {}) : Promise<any[]> {
  const notion = new Client({
    auth: notionApiKey,
  });
  const n2m = new NotionToMarkdown({ notionClient: notion });

  const response = await notion.databases.query({
    database_id: notionDatabaseId,
    filter: {
      property: "Status",
      status: {
        equals: "Published",
      },
    },
  });

  const pagesWithContent = await Promise.all(
    response.results
      .filter((page) => 'properties' in page)
      .map(async (page) => {
        try {
          // Get the page content as markdown
          const mdBlocks = await n2m.pageToMarkdown(page.id);
          const mdString = n2m.toMarkdownString(mdBlocks);
          
          // Debug logging for problematic pag
          
          // Handle different possible structures from notion-to-md
          let content = '';
          if (typeof mdString === 'string') {
            content = mdString;
          } else if (mdString && typeof mdString === 'object') {
            content = mdString.parent || mdString.toString() || '';
          }
          
          return {
            id: page.id,
            title: (page.properties.Title as any)?.title?.[0]?.plain_text ?? '',
            description: (page.properties.Description as any)?.rich_text?.[0]?.plain_text ?? '',
            pubDate: (page.properties["Published Date"] as any)?.date?.start ? new Date((page.properties["Published Date"] as any)?.date?.start) : new Date(),
            status: (page.properties["Status"] as any)?.status?.name ?? '',
            content: content
          };
        } catch (error) {
          console.error(`Error converting page ${page.id} to markdown:`, error);
        }
      })
  );

  return pagesWithContent;

}

/**
 * A loader like `glob`, but returns dummy entries for testing.
 */
export function notionLoader(options: LoaderOptions): Loader {
  const notionApiKey = options.notionApiKey;
  const notionDatabaseId = options.notionDatabaseId;

  return {
    name: 'notion-loader',
    async load({ store, renderMarkdown }) {
      store.clear();

      const data = await getNotionData(notionApiKey, notionDatabaseId);

      for (let i = 0; i < data.length; i++) {
        const id = data[i].title.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
        let entry = {
          id,
          data: {   
            title: data[i].title,
            description: data[i].description,
            pubDate: data[i].pubDate,
            updatedDate: data[i].updatedDate,
            heroImage: data[i].heroImage,
          },
          body: data[i].content,
          digest: `digest-${i}`,
          collection: 'notion',
          rendered: undefined as any,
        };
        entry.rendered = await renderMarkdown(entry.body);
        store.set(entry);
      }
    },
  };
}