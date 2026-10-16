import type { Config } from "@react-router/dev/config";
import { elements } from "./elements/registry";

export default {
  ssr: false,
  prerender: [
    "/",
    "/captions",
    ...elements.map(({ slug }) => `/elements/${slug}`),
  ],
} satisfies Config;
