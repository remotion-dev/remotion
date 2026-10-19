import type { Config } from "@react-router/dev/config";
import { elements } from "./elements/registry";

export default {
  ssr: false,
  prerender: ({ getStaticPaths }) => [
    ...getStaticPaths(),
    ...elements.flatMap(({ slug }) => [
      `/elements/${slug}`,
      `/elements/${slug}.md`,
    ]),
  ],
} satisfies Config;
