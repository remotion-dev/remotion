import type { Config } from "@react-router/dev/config";
import { elements } from "./elements/registry";

const ssr = false;

export default {
  ssr,
  prerender: ssr
    ? false
    : ({ getStaticPaths }) => [
        ...getStaticPaths(),
        ...elements.flatMap(({ slug }) => [
          `/elements/${slug}`,
          `/elements/${slug}.md`,
        ]),
      ],
} satisfies Config;
