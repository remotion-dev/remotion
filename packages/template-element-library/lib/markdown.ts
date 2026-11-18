import { catalog, type CatalogEntry } from "./element-payload";

const codeBlock = (language: string, content: string) => {
  const fence = "`".repeat(
    Math.max(
      3,
      ...Array.from(content.matchAll(/`+/g), ([match]) => match.length + 1),
    ),
  );
  return `${fence}${language}\n${content}\n${fence}`;
};

export const getCatalogMarkdown = (category: string | null) => {
  const entries = catalog.filter(
    ({ definition }) => category === null || definition.category === category,
  );
  const categories = [
    ...new Set(entries.map(({ definition }) => definition.category)),
  ];

  return [
    `# ${category === null ? "Studio Supply - Remotion Elements" : `${category} - Studio Supply`}`,
    "Editable video building blocks for Remotion. Each Element document includes its install command, source code and installation metadata.",
    "[All Elements](/index.md) | [Caption styles](/captions.md)",
    ...categories.map((name) =>
      [
        `## ${name}`,
        ...entries
          .filter(({ definition }) => definition.category === name)
          .map(
            ({ definition }) =>
              `- [${definition.displayName}](/elements/${definition.slug}.md) - ${definition.description}`,
          ),
      ].join("\n\n"),
    ),
    "",
  ].join("\n\n");
};

// React Router prerenders every page with a request to localhost.
export const getElementPageUrl = ({
  slug,
  requestUrl,
}: {
  slug: string;
  requestUrl: string;
}) => {
  const origin =
    process.env.SITE_URL ||
    (import.meta.env.PROD && new URL(requestUrl).hostname === "localhost"
      ? null
      : requestUrl);
  return origin === null ? null : new URL(`/elements/${slug}`, origin).href;
};

export const getElementMarkdown = ({
  entry: { definition, sourceCode, payload },
  pageUrl,
}: {
  entry: CatalogEntry;
  pageUrl: string | null;
}) => {
  const remotionDependencies = definition.dependencies.filter(
    ({ version }) => version === null,
  );
  const otherDependencies = definition.dependencies.filter(
    ({ version }) => version !== null,
  );
  const installationCommands = [
    ...(remotionDependencies.length === 0
      ? []
      : [
          `npx remotion add ${remotionDependencies.map(({ name }) => name).join(" ")}`,
        ]),
    ...(otherDependencies.length === 0
      ? []
      : [
          `npm install --save-exact ${otherDependencies.map(({ name, version }) => `${name}@${version}`).join(" ")}`,
        ]),
  ];

  return [
    `# ${definition.displayName}`,
    definition.description,
    "[All Elements](/index.md) | [Caption styles](/captions.md)",
    "## Details",
    `- Category: ${definition.category}\n- Duration: ${definition.durationInFrames} frames (${definition.durationInFrames / definition.fps}s at ${definition.fps} fps)\n- Dimensions: ${definition.dimensions === null ? "Fills composition" : `${definition.dimensions.width} x ${definition.dimensions.height}`}`,
    "## Installation",
    "Install this Element into a composition of your Remotion project:",
    codeBlock(
      "sh",
      `npx remotion elements use ${pageUrl ?? "<url>"} --composition <composition-id> --yes`,
    ),
    `${pageUrl === null ? `Replace \`<url>\` with the absolute URL of the page at \`/elements/${definition.slug}\`, which is the URL of this document without \`.md\`. ` : ""}Replace \`<composition-id>\` with the ID of the composition to add the Element to. The command installs the dependencies, downloads the assets, writes the source file and adds the Element to the composition. See [\`npx remotion elements use\`](https://www.remotion.dev/docs/cli/elements/use.md).`,
    "## Manual installation",
    `To install the Element manually instead, save the source below as \`${definition.slug}.element.tsx\` in your Remotion project and import its exported component.`,
    installationCommands.length === 0
      ? "No additional package dependencies are required beyond React and Remotion."
      : codeBlock("sh", installationCommands.join("\n")),
    definition.installationMode === "wrapped"
      ? "Wrap the component in a Remotion Sequence and use the duration and dimensions below."
      : "The component owns its Sequence. Pass timing props to the component rather than adding an outer Sequence.",
    "Use the installation metadata below for default props, dependencies, and assets. Asset references in initialProps must be resolved to local staticFile() calls after saving the declared assets to your public directory. See the [Element Library integration guide](https://www.remotion.dev/docs/elements/libraries.md) for asset handling and Studio installation.",
    "## Installation metadata",
    codeBlock(
      "json",
      JSON.stringify(
        {
          slug: definition.slug,
          displayName: definition.displayName,
          fps: definition.fps,
          durationInFrames: payload.durationInFrames,
          dimensions: payload.element.dimensions,
          installationMode: definition.installationMode,
          isCaptionStyle: definition.category === "Captions",
          initialProps: payload.element.initialProps,
          dependencies: payload.element.dependencies,
          assets: payload.element.assets,
        },
        null,
        2,
      ),
    ),
    "## Source",
    codeBlock("tsx", sourceCode),
    "",
  ].join("\n\n");
};
