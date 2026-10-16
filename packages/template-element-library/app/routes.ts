import {
  index,
  layout,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/library.tsx"),
    route("captions", "routes/captions.tsx"),
    route("elements/:slug", "routes/element.tsx"),
  ]),
] satisfies RouteConfig;
