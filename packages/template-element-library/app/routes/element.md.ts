import { catalog } from "../../lib/element-payload";
import { getElementMarkdown, getElementPageUrl } from "../../lib/markdown";
import type { Route } from "./+types/element.md";

export const loader = ({ params, request }: Route.LoaderArgs) => {
  const entry = catalog.find(
    ({ definition }) => definition.slug === params.slug,
  );
  if (!entry) {
    throw new Response("Element not found", { status: 404 });
  }

  const markdown = getElementMarkdown({
    entry,
    pageUrl: getElementPageUrl({
      slug: entry.definition.slug,
      requestUrl: request.url,
    }),
  });

  return new Response(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
