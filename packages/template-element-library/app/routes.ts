import {
  index,
  layout,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  route("index.md", "routes/library-markdown.ts"),
  route("captions.md", "routes/captions-markdown.ts"),
  route("elements/:slug.md", "routes/element-markdown.ts"),
  layout("routes/layout.tsx", [
    index("routes/library.tsx"),
    route("captions", "routes/captions.tsx"),
    route("elements/:slug", "routes/element.tsx"),
  ]),
] satisfies RouteConfig;
