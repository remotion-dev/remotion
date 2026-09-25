// Codemods print with recast, which does not know about your Prettier config.
// Formatting the changed files keeps visual edits and hand-written code
// consistent. Prettier is loaded lazily because it is only needed after an
// edit was made through the inspector or the timeline.

import type { Options, Plugin } from "prettier";

type PrettierStandalone = {
  format: (source: string, options: Options) => Promise<string>;
};

let prettierPromise: Promise<{
  prettier: PrettierStandalone;
  plugins: Plugin[];
}> | null = null;

const loadPrettier = () => {
  prettierPromise ??= Promise.all([
    import("prettier/standalone"),
    import("prettier/plugins/estree"),
    import("prettier/plugins/typescript"),
  ]).then(([prettier, estree, typescript]) => ({
    prettier: prettier as unknown as PrettierStandalone,
    plugins: [estree as unknown as Plugin, typescript as unknown as Plugin],
  }));
  return prettierPromise;
};

export const formatSource = async (
  filePath: string,
  source: string,
): Promise<string> => {
  if (!/\.(tsx|ts|jsx|js)$/.test(filePath)) {
    return source;
  }

  try {
    const { prettier, plugins } = await loadPrettier();
    return await prettier.format(source, {
      parser: "typescript",
      plugins,
      filepath: filePath,
      // Mirrors .prettierrc
      useTabs: false,
      tabWidth: 2,
      bracketSpacing: true,
    });
  } catch {
    // Formatting is cosmetic; never block an edit on it.
    return source;
  }
};
