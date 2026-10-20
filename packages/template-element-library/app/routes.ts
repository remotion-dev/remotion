import {
  index,
  layout,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  route("index.md", "routes/elements.md.ts"),
  route("captions.md", "routes/captions.md.ts"),
  route("elements/:slug.md", "routes/element.md.ts"),
  layout("routes/layout.tsx", [
    index("routes/library.tsx"),
    route("captions", "routes/captions.tsx"),
    route("elements/:slug", "routes/element.tsx"),
  ]),
] satisfies RouteConfig;
