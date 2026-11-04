import { getCatalogMarkdown } from "../../lib/markdown";

export const loader = () =>
  new Response(getCatalogMarkdown(null), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
