import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/library.tsx"),
  route("elements/:slug", "routes/element.tsx"),
] satisfies RouteConfig;
