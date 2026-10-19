import { catalog } from "../../lib/element-payload";
import { getElementMarkdown } from "../../lib/markdown";
import type { Route } from "./+types/element.md";

export const loader = ({ params }: Route.LoaderArgs) => {
  const entry = catalog.find(
    ({ definition }) => definition.slug === params.slug,
  );
  if (!entry) {
    throw new Response("Element not found", { status: 404 });
  }

  return new Response(getElementMarkdown(entry), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
