// pull-content.ts
//
// Example of using the core @gnapex/sdk client from a plain Node.js script —
// e.g. a static-site prebuild step, a cron job, or a CI export task.
// No React or Next.js dependency is required for this entry point.
//
// Run with: npx tsx pull-content.ts  (or compile with tsc first)

import { createNexusClient, isNexusError } from "@gnapex/sdk";
import { writeFile } from "node:fs/promises";

const client = createNexusClient({
  projectId: process.env.GNAPEX_PROJECT_ID!,
  apiKey: process.env.GNAPEX_API_KEY!, // public key — nx_pk_...
  apiUrl: process.env.GNAPEX_API_URL,
  debug: true,
});

interface Post {
  title: string;
  slug: string;
  publishedAt: string;
}

async function main() {
  try {
    const posts = await client.content.getCollection<Post>("blog-posts", {
      limit: 100,
      sort: "publishedAt",
      order: "desc",
    });

    await writeFile(
      "./generated/posts.json",
      JSON.stringify(posts.items, null, 2),
    );

    console.log(
      `Pulled ${posts.items.length} posts (of ${posts.total} total).`,
    );
  } catch (err) {
    if (isNexusError(err)) {
      console.error(
        `[${err.code}] ${err.message} (requestId: ${err.requestId})`,
      );
      process.exitCode = 1;
      return;
    }
    throw err;
  } finally {
    client.destroy();
  }
}

main();
