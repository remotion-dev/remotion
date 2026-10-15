import { createElementPayload } from "@remotion/studio-protocol";
import { elements } from "../elements/registry";

// Only Vite imports this module. Studio imports the components normally and
// does not need raw-loader configuration or generated source-code copies.
const sources = import.meta.glob<string>("../elements/*/*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const catalog = elements.map((definition) => {
  const sourceCode =
    sources[`../elements/${definition.slug}/${definition.slug}.tsx`];
  if (!sourceCode) {
    throw new Error(`Missing source for Element: ${definition.slug}`);
  }

  // Validate every entry at build time, not only when someone clicks Use.
  const payload = createElementPayload({
    slug: definition.slug,
    displayName: definition.displayName,
    sourceCode,
    dimensions: definition.dimensions,
    durationInFrames: definition.durationInFrames,
    installationMode: definition.installationMode,
    dependencies: definition.dependencies,
    assets: definition.assets,
    initialProps:
      definition.installationProps === null
        ? definition.initialProps
        : { ...definition.initialProps, ...definition.installationProps },
  });

  return { definition, sourceCode, payload };
});

export type CatalogEntry = (typeof catalog)[number];
