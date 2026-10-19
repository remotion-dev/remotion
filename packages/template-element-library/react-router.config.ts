import type { Config } from "@react-router/dev/config";
import { elements } from "./elements/registry";

export default {
  ssr: false,
  prerender: [
    "/",
    "/index.md",
    "/captions",
    "/captions.md",
    ...elements.flatMap(({ slug }) => [
      `/elements/${slug}`,
      `/elements/${slug}.md`,
    ]),
  ],
} satisfies Config;
