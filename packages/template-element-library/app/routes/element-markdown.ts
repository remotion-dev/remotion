import type { LoaderFunctionArgs } from "react-router";
import { catalog } from "../../lib/element-payload";
import { getElementMarkdown } from "../../lib/markdown";

export const loader = ({ params }: LoaderFunctionArgs) => {
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
