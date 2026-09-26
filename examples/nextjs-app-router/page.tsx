// app/[slug]/page.tsx
//
// Server component fetching GN-Apex page content by slug and rendering it
// with NexusRenderer. Errors are handled via NexusError so a missing page
// renders Next.js's notFound() instead of a generic 500.

import { notFound } from "next/navigation";
import { nexus, isNexusError } from "@gnapex/sdk";
import { NexusRenderer } from "@gnapex/sdk/react";

interface PageData {
  title: string;
  body: string;
}

export default async function DynamicPage({
  params,
}: {
  params: { slug: string };
}) {
  let page: PageData;

  try {
    page = await nexus.getPage<PageData>(params.slug);
  } catch (err) {
    if (isNexusError(err) && err.code === "NOT_FOUND") {
      notFound();
    }
    throw err; // let Next.js error boundary handle anything else
  }

  return (
    <article>
      <h1>{page.title}</h1>
      <NexusRenderer content={page.body} hydrateCharts />
    </article>
  );
}
