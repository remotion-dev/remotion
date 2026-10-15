import type { Config } from "@react-router/dev/config";
import { elements } from "./elements/registry";

export default {
  ssr: false,
  prerender: ["/", ...elements.map((element) => `/elements/${element.slug}`)],
} satisfies Config;
