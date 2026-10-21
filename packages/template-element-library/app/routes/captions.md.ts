import { getCatalogMarkdown } from "../../lib/markdown";

export const loader = () =>
  new Response(getCatalogMarkdown("Captions"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
