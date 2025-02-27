import {
  type RouteConfig,
  index,
  route,
} from "@react-router/dev/routes";

export default [
  index("./home.tsx"),
  route("progress", "./progress.tsx")
] satisfies RouteConfig
